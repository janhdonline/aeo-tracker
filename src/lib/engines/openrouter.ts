import { EngineAdapter, EngineQuery, EngineResponse } from './types';
import { getApiKey, getConfigBoolean, markApiKeyError } from '@/lib/config';

/**
 * OpenRouter Adapter - Free Tier Compatible
 * 
 * Uses OpenRouter's free models for cost-free operation.
 * Free models: https://openrouter.ai/models?max_price=0
 */

// Free model mappings (cost = $0)
const FREE_MODEL_MAP: Record<string, string> = {
  'perplexity': 'meta-llama/llama-3.1-8b-instruct:free',
  'openai': 'meta-llama/llama-3.1-8b-instruct:free',
  'gemini': 'google/gemini-flash-1.5',
  'grok': 'meta-llama/llama-3.1-8b-instruct:free',
};

// Paid model mappings (when upgraded)
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
  private modelId?: string;
  private apiKey?: string;

  constructor(engineId: string) {
    this.id = engineId;
  }

  private async resolveKey(): Promise<string> {
    if (this.apiKey) return this.apiKey;
    return await getApiKey('openrouter', 'scan');
  }

  async run(query: EngineQuery): Promise<EngineResponse> {
    const startTime = Date.now();
    // If using Gemini directly, use GeminiAdapter
    const geminiKey = await getApiKey('gemini', 'scan');
    if (this.id === 'gemini' && geminiKey) {
      const { GeminiAdapter } = await import('./gemini');
      const geminiAdapter = new GeminiAdapter(geminiKey);
      return geminiAdapter.run(query);
    }

    const key = await this.resolveKey();
    if (!key) {
      throw new Error(`No API key for ${this.id}. Set OPENROUTER_API_KEY or GEMINI_API_KEY.`);
    }

    const forceFree = await getConfigBoolean('use_free_models', false);
    const modelToUse = forceFree
      ? (FREE_MODEL_MAP[this.id] || 'meta-llama/llama-3.1-8b-instruct:free')
      : (PAID_MODEL_MAP[this.id] || 'openai/gpt-4o-mini');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-tracker.vercel.app',
        'X-Title': 'AEO Visibility Tracker',
      },
      body: JSON.stringify({
        model: modelToUse,
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
      await markApiKeyError('openrouter', 'scan', error);
      throw new Error(`OpenRouter API error (${modelToUse}): ${response.status} - ${error}`);
    }

    const data = await response.json();
    const answerText = data.choices?.[0]?.message?.content || '';
    
    const citations = this.extractCitations(answerText);
    
    const inputTokens = data.usage?.prompt_tokens || 0;
    const outputTokens = data.usage?.completion_tokens || 0;
    const costs = MODEL_COSTS[modelToUse] || { input: 0, output: 0 };
    const costUsd = (inputTokens * costs.input / 1_000_000) + (outputTokens * costs.output / 1_000_000);

    const latencyMs = Date.now() - startTime;

    return {
      answerText,
      citations,
      costUsd,
      tokensIn: inputTokens,
      tokensOut: outputTokens,
      modelName: modelToUse,
      latencyMs,
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
