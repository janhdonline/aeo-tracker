import { EngineAdapter } from './types';
import { PerplexityAdapter } from './perplexity';
import { OpenAIAdapter } from './openai';
import { GeminiAdapter } from './gemini';
import { GrokAdapter } from './grok';

const adapters: Record<string, EngineAdapter> = {
  perplexity: new PerplexityAdapter(),
  openai: new OpenAIAdapter(),
  gemini: new GeminiAdapter(),
  grok: new GrokAdapter(),
};

export function getEngineAdapter(engine: string): EngineAdapter {
  const adapter = adapters[engine];
  if (!adapter) {
    throw new Error(`Unknown engine: ${engine}`);
  }
  return adapter;
}

export function getAvailableEngines(): string[] {
  return Object.keys(adapters);
}