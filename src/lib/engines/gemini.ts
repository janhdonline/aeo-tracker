import { EngineAdapter, EngineQuery, EngineResponse } from './types';
import { getApiKey, getDefaultModel, markApiKeyError } from '@/lib/config';

// Track whether search grounding is supported by the API key
let searchGroundingSupported = true;

export class GeminiAdapter implements EngineAdapter {
  id = 'gemini';
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private async resolveKey(): Promise<string> {
    if (this.apiKey) return this.apiKey;
    return await getApiKey('gemini', 'scan');
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
    const startTime = Date.now();
    const key = await this.resolveKey();
    if (!key) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const defaultModel = await getDefaultModel('gemini', 'scan');
    let resolvedModel = defaultModel || 'gemini-2.0-flash';

    // Wrap prompt with instructions to include sources/citations in markdown format
    const enhancedPrompt = `${query.prompt}\n\nPlease include authoritative reference sources, comparison points, and format links as markdown [Source Name](https://domain.com) where applicable.`;

    let response: Response;

    try {
      // 1. Try with search tool if supported
      if (searchGroundingSupported) {
        response = await this.callApi(key, enhancedPrompt, true, resolvedModel);
        if (!response.ok && (response.status === 400 || response.status === 403)) {
          // Free tier API keys do not support Google Search grounding. Remember this to avoid wasting time.
          searchGroundingSupported = false;
          response = await this.callApi(key, enhancedPrompt, false, resolvedModel);
        }
      } else {
        response = await this.callApi(key, enhancedPrompt, false, resolvedModel);
      }

      // 2. If primary model fails (quota or deprecation), fallback to stable gemini-1.5-flash
      if (!response.ok) {
        resolvedModel = 'gemini-1.5-flash';
        response = await this.callApi(key, enhancedPrompt, false, 'gemini-1.5-flash');
      }

      if (!response.ok) {
        const error = await response.text();
        await markApiKeyError('gemini', 'scan', error);
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Extract citations from grounding metadata OR from answer text markdown links
      const citations = this.extractCitations(data, answerText);
      
      const inputTokens = data.usageMetadata?.promptTokenCount || 0;
      const outputTokens = data.usageMetadata?.candidatesTokenCount || 0;
      const costUsd = (inputTokens * 0.075 / 1_000_000) + (outputTokens * 0.30 / 1_000_000);
      const latencyMs = Date.now() - startTime;

      return {
        answerText,
        citations,
        costUsd,
        tokensIn: inputTokens,
        tokensOut: outputTokens,
        modelName: resolvedModel,
        latencyMs,
      };
    } catch (err: any) {
      await markApiKeyError('gemini', 'scan', String(err));
      throw err;
    }
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
            // Invalid URL in grounding, ignore
          }
        }
      }
    }

    // 2. Fallback: Parse markdown links from the answer text if grounding returned no citations
    if (citations.length === 0 && answerText) {
      const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
      let match;
      while ((match = linkRegex.exec(answerText)) !== null) {
        const title = match[1];
        const rawUrl = match[2];
        try {
          const parsed = new URL(rawUrl);
          const domain = parsed.hostname.replace(/^www\./, '');
          if (!seenDomains.has(domain)) {
            seenDomains.add(domain);
            citations.push({ domain, url: rawUrl, title });
          }
        } catch {
          // Skip invalid URLs
        }
      }
    }

    return citations;
  }
}
