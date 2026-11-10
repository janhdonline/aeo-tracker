// Cheap LLM helper for short drafting calls.
// Used by the fix-brief generator to write human-readable gap descriptions.
// All calls: 30s timeout + 1 retry with exponential backoff. Never throws.

import { getApiKey, getDefaultModel, markApiKeyError } from '@/lib/config';
import { checkAiBudgetAllowed } from '@/lib/cost-guard';

const OPENAI_BASE_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 30_000;
const MAX_RETRIES = 1;

export interface LlmRequest {
  prompt: string;
  system?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LlmResponse {
  text: string;
  costUsd: number;
}

function estimateCost(inputTokens: number, outputTokens: number): number {
  // gpt-4o-mini pricing estimate
  return (inputTokens * 0.15 / 1_000_000) + (outputTokens * 0.60 / 1_000_000);
}

async function callOnce(req: LlmRequest, signal: AbortSignal, apiKey: string, modelName: string): Promise<LlmResponse> {
  const response = await fetch(OPENAI_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelName,
      messages: [
        ...(req.system ? [{ role: 'system' as const, content: req.system }] : []),
        { role: 'user' as const, content: req.prompt },
      ],
      temperature: req.temperature ?? 0.4,
      max_tokens: req.maxTokens ?? 300,
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.text();
    await markApiKeyError('openai', 'briefs', error);
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || '';
  const inputTokens = data.usage?.prompt_tokens || 0;
  const outputTokens = data.usage?.completion_tokens || 0;

  return {
    text,
    costUsd: estimateCost(inputTokens, outputTokens),
  };
}

export async function callLlm(req: LlmRequest): Promise<LlmResponse | null> {
  const budgetCheck = await checkAiBudgetAllowed();
  if (!budgetCheck.allowed) {
    console.warn('llm: Skipping AI call due to cost guard:', budgetCheck.reason);
    return null;
  }

  const apiKey = await getApiKey('openai', 'briefs');
  if (!apiKey) {
    console.warn('llm: OpenAI API key not set, skipping LLM call');
    return null;
  }

  const modelName = await getDefaultModel('openai', 'briefs');
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const result = await callOnce(req, controller.signal, apiKey, modelName);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      clearTimeout(timeoutId);

      if (attempt < MAX_RETRIES) {
        // Exponential backoff: 1s, then 2s
        const delay = 1000 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error('llm: all retries failed:', lastError?.message);
  return null;
}
