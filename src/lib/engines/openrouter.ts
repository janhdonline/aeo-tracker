import { EngineAdapter, EngineQuery, EngineResponse } from './types';

/**
 * OpenRouter Adapter - Free Tier Compatible
 * 
 * Uses OpenRouter's free models for cost-free operation.
 * Free models: https://openrouter.ai/models?max_price=0
 */

// Free model mappings (cost = $0)
const FREE_MODEL_MAP: Record<string, string> = {
  'perplexity': 'meta-llama/llama-3.1-8b-instruct:free',  // Free alternative
  'openai': 'meta-llama/llama-3.1-8b-instruct:free',      // Free alternative  
  'gemini': 'google/gemini-flash-1.5',                     // Use Gemini directly (has free tier)
  'grok': 'meta-llama/llama-3.1-8b-instruct:free',        // Free alternative
};

// Paid model mappings (when you upgrade)
const PAID_MODEL_MAP: Record<string, string> = {
  'perplexity': 'perplexity/sonar',
  'openai': 'openai/gpt-4o-mini',
  'gemini': 'google/gemini-flash-1.5',
  'grok': 'x-ai/grok-beta',
};

const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  'meta-llama/llama-3.1-8b-instruct:free': { input: 0, output: 0 },
  'mistralai/mistral-7b-instruct:free': { input: 0, output: 0 },
  'google/gemini-flash-1.5': { input: 0.075, output: 0.3 },
};

export class OpenRouterAdapter implements EngineAdapter {
  id: string;
  private modelId: string;
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
  private useFreeModels: boolean;

  constructor(engineId: string) {
    this.id = engineId;
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    this.useFreeModels = !this.apiKey || process.env.USE_FREE_MODELS === 'true';
    
    if (this.useFreeModels) {
      this.modelId = FREE_MODEL_MAP[engineId] || 'meta-llama/llama-3.1-8b-instruct:free';
    } else {
      this.modelId = PAID_MODEL_MAP[engineId] || 'openai/gpt-4o-mini';
    }
  }

  async run(query: EngineQuery): Promise<EngineResponse> {
    // If using Gemini directly (has free tier), use GeminiAdapter instead
    if (this.id === 'gemini' && process.env.GEMINI_API_KEY) {
      const { GeminiAdapter } = await import('./gemini');
      const geminiAdapter = new GeminiAdapter();
      return geminiAdapter.run(query);
    }

    // Use OpenRouter for other engines
    if (!this.apiKey) {
      throw new Error(`No API key for ${this.id}. Set OPENROUTER_API_KEY or GEMINI_API_KEY.`);
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-tracker.vercel.app',
        'X-Title': 'AEO Visibility Tracker',
      },
      body: JSON.stringify({
        model: this.modelId,
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
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error (${this.modelId}): ${response.status} - ${error}`);
    }

    const data = await response.json();
    const answerText = data.choices?.[0]?.message?.content || '';
    
    const citations = this.extractCitations(answerText);
    
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;
    const costs = MODEL_COSTS[this.modelId] || { input: 0, output: 0 };
    const costUsd = (inputTokens * costs.input / 1_000_000) + (outputTokens * costs.output / 1_000_000);

    return {
      answerText,
      citations,
      costUsd,
    };
  }

  private extractCitations(answerText: string): { domain: string; url: string; title: string }[] {
    const citations: { domain: string; url: string; title: string }[] = [];
    const seenDomains = new Set<string>();

    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    let match;
    while ((match = markdownLinkRegex.exec(answerText)) !== null) {
      const title = match[1];
      const url = match[2];
      try {
        const parsed = new URL(url);
        const domain = parsed.hostname.replace('www.', '');
        if (!seenDomains.has(domain)) {
          seenDomains.add(domain);
          citations.push({ domain, url, title });
        }
      } catch {}
    }

    const urlRegex = /https?:\/\/[^\s\)]+/g;
    const urls = answerText.match(urlRegex) || [];
    for (const url of urls) {
      try {
        const parsed = new URL(url);
        const domain = parsed.hostname.replace('www.', '');
        if (!seenDomains.has(domain)) {
          seenDomains.add(domain);
          citations.push({ domain, url, title: domain });
        }
      } catch {}
    }

    return citations;
  }
}
