export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number; // -1 to 1
  confidence: number; // 0 to 1
}

const POSITIVE_TERMS = [
  'best',
  'leading',
  'top',
  'strong',
  'popular',
  'trusted',
  'reliable',
  'powerful',
  'effective',
  'excellent',
  'recommended',
  'great',
  'secure',
  'fast',
  'easy',
  'innovative',
  'robust',
  'valuable',
  'helpful',
  'clear',
  'favorite',
  'outstanding',
  'proven',
  'advanced',
];

const NEGATIVE_TERMS = [
  'worst',
  'poor',
  'unreliable',
  'expensive',
  'difficult',
  'limited',
  'lacking',
  'weak',
  'outdated',
  'controversial',
  'risky',
  'slow',
  'confusing',
  'inferior',
  'problem',
  'issue',
  'bug',
  'failure',
  'hard',
  'complicated',
  'overpriced',
  'lacks',
];

function countTerms(text: string, terms: string[]) {
  return terms.reduce((total, term) => {
    const matches = text.match(new RegExp(`\\b${term}\\b`, 'g'));
    return total + (matches?.length ?? 0);
  }, 0);
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  const normalized = text.toLowerCase();
  const positiveMatches = countTerms(normalized, POSITIVE_TERMS);
  const negativeMatches = countTerms(normalized, NEGATIVE_TERMS);
  const totalMatches = positiveMatches + negativeMatches;

  if (totalMatches === 0) {
    return {
      sentiment: 'neutral',
      score: 0,
      confidence: 0.35,
    };
  }

  const rawScore = (positiveMatches - negativeMatches) / totalMatches;
  const score = Math.round(Math.max(-1, Math.min(1, rawScore)) * 100) / 100;
  const sentiment = score > 0.12 ? 'positive' : score < -0.12 ? 'negative' : 'neutral';

  return {
    sentiment,
    score,
    confidence: Math.min(0.95, 0.45 + Math.min(totalMatches, 20) * 0.025),
  };
}
