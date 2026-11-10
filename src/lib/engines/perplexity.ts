import { EngineAdapter, EngineQuery, EngineResponse } from './types';
import { getApiKey, getDefaultModel, markApiKeyError } from '@/lib/config';

export class PerplexityAdapter implements EngineAdapter {
  id = 'perplexity';
  private apiKey?: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private async resolveKey(): Promise<string> {
    if (this.apiKey) return this.apiKey;
    return await getApiKey('perplexity', 'scan');
  }

  async run(query: EngineQuery): Promise<EngineResponse> {
    const key = await this.resolveKey();
    if (!key) {
      throw new Error("Perplexity API key not set");
    }

    const modelName = await getDefaultModel('perplexity', 'scan');

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName || 'sonar',
        messages: [
          {
            role: 'user',
            content: query.prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      await markApiKeyError('perplexity', 'scan', error);
      throw new Error(`Perplexity API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const answerText = data.choices?.[0]?.message?.content || '';
    
    // Extract citations from Perplexity response
    const citations = this.extractCitations(data);
    
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;
    const costUsd = (inputTokens * 5 / 1_000_000) + (outputTokens * 15 / 1_000_000);

    return {
      answerText,
      citations,
      costUsd,
    };
  }

  private extractCitations(data: any): { domain: string; url: string; title: string }[] {
    const citations: { domain: string; url: string; title: string }[] = [];
    
    // Perplexity returns citations in search_results or citations field
    const sources = data.citations || data.search_results || [];
    
    for (const source of sources) {
      if (source.url) {
        try {
          const url = new URL(source.url);
          const domain = url.hostname.replace('www.', '');
          citations.push({
            domain,
            url: source.url,
            title: source.title || domain,
          });
        } catch {
          // Skip invalid URLs
        }
      }
    }

    return citations;
  }
}
