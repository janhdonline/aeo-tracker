import { EngineAdapter, EngineQuery, EngineResponse } from './types';

export class GeminiAdapter implements EngineAdapter {
  id = 'gemini';
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY!;
    // API key validated at runtime
  }

  async run(query: EngineQuery): Promise<EngineResponse> {
    if (!this.apiKey) {
      throw new Error("API key not set");
    }
    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: query.prompt,
              },
            ],
          },
        ],
        tools: [
          {
            google_search: {},
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract citations from grounding metadata
    const citations = this.extractCitations(data);
    
    // Estimate cost (Gemini Flash pricing: ~$0.075 per 1M input tokens, $0.30 per 1M output tokens)
    const inputTokens = data.usageMetadata?.promptTokenCount || 0;
    const outputTokens = data.usageMetadata?.candidatesTokenCount || 0;
    const costUsd = (inputTokens * 0.075 / 1_000_000) + (outputTokens * 0.30 / 1_000_000);

    return {
      answerText,
      citations,
      costUsd,
    };
  }

  private extractCitations(data: any): { domain: string; url: string; title: string }[] {
    const citations: { domain: string; url: string; title: string }[] = [];
    const seenDomains = new Set<string>();
    
    const groundingChunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    for (const chunk of groundingChunks) {
      if (chunk.web?.uri) {
        try {
          const url = new URL(chunk.web.uri);
          const domain = url.hostname.replace('www.', '');
          if (!seenDomains.has(domain)) {
            seenDomains.add(domain);
            citations.push({
              domain,
              url: chunk.web.uri,
              title: chunk.web.title || domain,
            });
          }
        } catch {
          // Skip invalid URLs
        }
      }
    }
    
    // Fallback: extract from markdown links in answer
    if (citations.length === 0) {
      const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const urlRegex = /https?:\/\/[^\s)]+/g;
      const urls = answerText.match(urlRegex) || [];
      
      for (const url of urls) {
        try {
          const parsed = new URL(url);
          const domain = parsed.hostname.replace('www.', '');
          if (!seenDomains.has(domain)) {
            seenDomains.add(domain);
            citations.push({
              domain,
              url,
              title: domain,
            });
          }
        } catch {
          // Skip invalid URLs
        }
      }
    }
    
    return citations;
  }
}