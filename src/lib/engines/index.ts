import { EngineAdapter } from './types';
import { OpenRouterAdapter } from './openrouter';
import { GeminiAdapter } from './gemini';

/**
 * Engine Registry - Free Tier Optimized
 * 
 * Primary: Gemini (native, free tier: 15 RPM, 1,500 RPD)
 * Fallback: OpenRouter free models (Llama 3.1, Mistral)
 * 
 * Set USE_FREE_MODELS=true in .env.local to force free models
 */

const USE_FREE_MODELS = process.env.USE_FREE_MODELS === 'true';

const adapters: Record<string, EngineAdapter> = {
  // Primary: Native Gemini (best free tier, has grounding/citations)
  gemini: new GeminiAdapter(),
  
  // Fallbacks: OpenRouter free models
  // These work when USE_FREE_MODELS=true or when you want alternatives
  perplexity: new OpenRouterAdapter('perplexity'),
  openai: new OpenRouterAdapter('openai'),
  grok: new OpenRouterAdapter('grok'),
};

export function getEngineAdapter(engine: string): EngineAdapter {
  const adapter = adapters[engine];
  if (!adapter) {
    throw new Error(`Unknown engine: ${engine}. Available: ${Object.keys(adapters).join(', ')}`);
  }
  return adapter;
}

export function getAvailableEngines(): string[] {
  return Object.keys(adapters);
}

export function isFreeTier(): boolean {
  return process.env.USE_FREE_MODELS === 'true' || !process.env.OPENROUTER_API_KEY;
}
