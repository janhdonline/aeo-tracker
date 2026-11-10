import { EngineAdapter, EngineQuery, EngineResponse } from './types';
import { getApiKey, getDefaultModel, markApiKeyError } from '@/lib/config';

export class GrokAdapter implements EngineAdapter {
  id = 'grok';
  private apiKey?: string;
  private baseUrl = 'https://api.x.ai/v1/chat/completions';

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private async resolveKey(): Promise<string> {
    if (this.apiKey) return this.apiKey;
    return await getApiKey('grok', 'scan');
  }

  async run(query: EngineQuery): Promise<EngineResponse> {
    const key = await this.resolveKey();
    if (!key) {
      throw new Error("Grok API key not set");
    }

    const modelName = await getDefaultModel('grok', 'scan');

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName || 'grok-2',
        messages: [
          {
            role: 'user',
            content: query.prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        search_parameters: {
          mode: 'on',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      await markApiKeyError('grok', 'scan', error);
      throw new Error(`Grok API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const answerText = data.choices?.[0]?.message?.content || '';
    
    // Extract citations from search results
    const citations = this.extractCitations(answerText, data);
    
    // Estimate cost (Grok pricing: ~$2 per 1M input tokens, $10 per 1M output tokens)
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;
    const costUsd = (inputTokens * 2 / 1_000_000) + (outputTokens * 10 / 1_000_000);

    return {
      answerText,
      citations,
      costUsd,
    };
  }

  private extractCitations(answerText: string, data: any): { domain: string; url: string; title: string }[] {
    const citations: { domain: string; url: string; title: string }[] = [];
    const seenDomains = new Set<string>();
    
    // Check for search results in response
    const searchResults = data.search_results || data.citations || [];
    
    for (const result of searchResults) {
      if (result.url) {
        try {
          const url = new URL(result.url);
          const domain = url.hostname.replace('www.', '');
          if (!seenDomains.has(domain)) {
            seenDomains.add(domain);
            citations.push({
              domain,
              url: result.url,
              title: result.title || domain,
            });
          }
        } catch {
          // Skip invalid URLs
        }
      }
    }
    
    // Fallback: extract from markdown links
    if (citations.length === 0) {
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
