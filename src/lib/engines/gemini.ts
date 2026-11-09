import { EngineAdapter, EngineQuery, EngineResponse } from './types';
import { getEnv } from '@/lib/env';

// Track whether search grounding is supported by the API key
let searchGroundingSupported = true;

export class GeminiAdapter implements EngineAdapter {
  id = 'gemini';
  private apiKey: string;

  constructor() {
    this.apiKey = getEnv('GEMINI_API_KEY');
  }

  private getApiKey(): string {
    return this.apiKey || getEnv('GEMINI_API_KEY');
  }

  private async callApi(
    key: string,
    prompt: string,
    withSearch: boolean,
    modelName: string = 'gemini-2.0-flash'
  ): Promise<Response> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${key}`;

    const body: Record<string, any> = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1500,
      },
    };

    if (withSearch && searchGroundingSupported) {
      body.tools = [{ google_search: {} }];
    }

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async run(query: EngineQuery): Promise<EngineResponse> {
    const key = this.getApiKey();
    if (!key) {
      throw new Error("GEMINI_API_KEY not set");
    }

    // Wrap prompt with instructions to include sources/citations in markdown format
    const enhancedPrompt = `${query.prompt}\n\nPlease include authoritative reference sources, comparison points, and format links as markdown [Source Name](https://domain.com) where applicable.`;

    let response: Response;

    // 1. Try with search tool if supported
    if (searchGroundingSupported) {
      response = await this.callApi(key, enhancedPrompt, true, 'gemini-2.0-flash');
      if (!response.ok && (response.status === 400 || response.status === 403)) {
        // Free tier API keys do not support Google Search grounding. Remember this to avoid wasting time.
        searchGroundingSupported = false;
        response = await this.callApi(key, enhancedPrompt, false, 'gemini-2.0-flash');
      }
    } else {
      response = await this.callApi(key, enhancedPrompt, false, 'gemini-2.0-flash');
    }

    // 2. If gemini-2.0-flash fails (quota or deprecation), fallback to stable gemini-1.5-flash
    if (!response.ok) {
      response = await this.callApi(key, enhancedPrompt, false, 'gemini-1.5-flash');
    }

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract citations from grounding metadata OR from answer text markdown links
    const citations = this.extractCitations(data, answerText);
    
    const inputTokens = data.usageMetadata?.promptTokenCount || 0;
    const outputTokens = data.usageMetadata?.candidatesTokenCount || 0;
    const costUsd = (inputTokens * 0.075 / 1_000_000) + (outputTokens * 0.30 / 1_000_000);

    return {
      answerText,
      citations,
      costUsd,
    };
  }

  private extractCitations(data: any, answerText: string = ''): { domain: string; url: string; title: string }[] {
    const citations: { domain: string; url: string; title: string }[] = [];
    const seenDomains = new Set<string>();

    // 1. Extract from grounding chunks if present
    const groundingChunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (Array.isArray(groundingChunks)) {
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri) {
          try {
            const url = new URL(chunk.web.uri);
            const domain = url.hostname.replace(/^www\./, '');
            if (!seenDomains.has(domain)) {
              seenDomains.add(domain);
              citations.push({
                domain,
                url: chunk.web.uri,
                title: chunk.web.title || domain,
              });
            }
          } catch {
            // Invalid URL, skip
          }
        }
      }
    }

    // 2. Extract from markdown links in answerText
    if (answerText) {
      const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(answerText)) !== null) {
        try {
          const urlStr = match[2];
          const parsed = new URL(urlStr);
          const domain = parsed.hostname.replace(/^www\./, '');
          if (!seenDomains.has(domain)) {
            seenDomains.add(domain);
            citations.push({
              domain,
              url: urlStr,
              title: match[1] || domain,
            });
          }
        } catch {
          // Skip
        }
      }
    }

    return citations;
  }
}
