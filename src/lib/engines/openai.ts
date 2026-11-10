import { EngineAdapter, EngineQuery, EngineResponse } from './types';
import { getApiKey, getDefaultModel, markApiKeyError } from '@/lib/config';

export class OpenAIAdapter implements EngineAdapter {
  id = 'openai';
  private apiKey?: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  private async resolveKey(): Promise<string> {
    if (this.apiKey) return this.apiKey;
    return await getApiKey('openai', 'scan');
  }

  async run(query: EngineQuery): Promise<EngineResponse> {
    const key = await this.resolveKey();
    if (!key) {
      throw new Error("OpenAI API key not set");
    }

    const modelName = await getDefaultModel('openai', 'scan');

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: modelName || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant. When answering, include sources and citations when possible. Provide detailed, accurate information.',
          },
          {
            role: 'user',
            content: query.prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        tools: [{ type: 'web_search_preview' }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      await markApiKeyError('openai', 'scan', error);
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const answerText = data.choices?.[0]?.message?.content || '';
    
    // Extract citations from annotations or markdown links
    const citations = this.extractCitations(answerText, data);
    
    // Estimate cost (GPT-4o pricing: ~$2.50 per 1M input tokens, $10 per 1M output tokens)
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;
    const costUsd = (inputTokens * 2.5 / 1_000_000) + (outputTokens * 10 / 1_000_000);

    return {
      answerText,
      citations,
      costUsd,
    };
  }

  private extractCitations(answerText: string, data: any): { domain: string; url: string; title: string }[] {
    const citations: { domain: string; url: string; title: string }[] = [];
    const seenDomains = new Set<string>();
    
    // Check for annotations in response
    const annotations = data.choices?.[0]?.message?.annotations || [];
    for (const annotation of annotations) {
      if (annotation.type === 'url_citation' && annotation.url_citation?.url) {
        try {
          const url = new URL(annotation.url_citation.url);
          const domain = url.hostname.replace('www.', '');
          if (!seenDomains.has(domain)) {
            seenDomains.add(domain);
            citations.push({
              domain,
              url: annotation.url_citation.url,
              title: annotation.url_citation.title || domain,
            });
          }
        } catch {
          // Skip invalid URLs
        }
      }
    }
    
    // Fallback: extract from markdown links in answer
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
