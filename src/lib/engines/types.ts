export interface EngineQuery {
  prompt: string;
  keyword: string;
  intent: string;
}

export interface EngineResponse {
  answerText: string;
  citations: { domain: string; url: string; title: string }[];
  costUsd: number;
}

export interface EngineAdapter {
  id: string;
  run(query: EngineQuery): Promise<EngineResponse>;
}