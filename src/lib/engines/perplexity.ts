import { EngineAdapter, EngineQuery, EngineResponse } from './types';

export class PerplexityAdapter implements EngineAdapter {
  id = 'perplexity';
  private apiKey: string;
  private baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor() {
    this.apiKey = process.env.PERPLEXITY_API_KEY!;
    if (!this.apiKey) {
      throw new Error('PERPLEXITY_API_KEY is not set');
    }
  }

  async run(query: EngineQuery): Promise<EngineResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
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
      throw new Error(`Perplexity API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const answerText = data.choices?.[0]?.message?.content || '';
    
    // Extract citations from Perplexity response
    const citations = this.extractCitations(data);
    
    // Estimate cost (Perplexity Sonar pricing: ~$5 per 1M input tokens, $15 per 1M output tokens)
    // Rough estimation based on token counts
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