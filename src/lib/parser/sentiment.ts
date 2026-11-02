export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  confidence: number; // 0 to 1
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  // TODO: Implement sentiment analysis using a cheap LLM call
  // This will be implemented in Phase 2
  return {
    sentiment: 'neutral',
    score: 0,
    confidence: 0,
  };
}