export interface EngineQuery {
  prompt: string;
  keyword: string;
  intent: string;
}

export interface EngineResponse {
  answerText: string;
  citations: { domain: string; url: string; title: string }[];
  costUsd: number;
  tokensIn?: number;
  tokensOut?: number;
  modelName?: string;
  latencyMs?: number;
}

export interface EngineAdapter {
  id: string;
  run(query: EngineQuery): Promise<EngineResponse>;
}