export interface ScoringInput {
  totalQueries: number;
  mentionedQueries: number;
  mentions: {
    positionInAnswer: number;
    mentionType: 'named' | 'linked' | 'implied';
  }[];
  yourMentions: number;
  competitorMentions: number;
  keywordsWithMentions: number;
  activeKeywords: number;
}

export function calculateVisibilityScore(input: ScoringInput): number {
  const { totalQueries, mentionedQueries, mentions, yourMentions, competitorMentions, keywordsWithMentions, activeKeywords } = input;
  
  if (totalQueries === 0) return 0;
  
  // Coverage: mentioned_queries / total_queries (weight 40)
  const coverage = (mentionedQueries / totalQueries) * 40;
  
  // Prominence: based on avg position and mention_type mix (weight 30)
  let prominence = 0;
  if (mentions.length > 0) {
    const typeWeights = { linked: 1.0, named: 0.8, implied: 0.4 };
    let totalWeight = 0;
    let weightedPositionSum = 0;
    
    for (const mention of mentions) {
      const typeWeight = typeWeights[mention.mentionType] || 0.4;
      // Earlier paragraphs score higher (inverse of position)
      const positionScore = Math.max(0, 1 - (mention.positionInAnswer - 1) * 0.1);
      totalWeight += typeWeight;
      weightedPositionSum += typeWeight * positionScore;
    }
    
    prominence = (weightedPositionSum / totalWeight) * 30;
  }
  
  // Competitiveness: your_mentions / (your + competitor mentions) (weight 20)
  const totalBrandMentions = yourMentions + competitorMentions;
  const competitiveness = totalBrandMentions > 0 
    ? (yourMentions / totalBrandMentions) * 20 
    : 0;
  
  // Breadth: distinct keywords with ≥1 mention / active keywords (weight 10)
  const breadth = activeKeywords > 0 
    ? (keywordsWithMentions / activeKeywords) * 10 
    : 0;
  
  const score = Math.round(coverage + prominence + competitiveness + breadth);
  return Math.min(100, Math.max(0, score));
}

export function calculateShareOfVoice(yourMentions: number, competitorMentions: number): number {
  const total = yourMentions + competitorMentions;
  if (total === 0) return 0;
  return Math.round((yourMentions / total) * 10000) / 100; // 2 decimal places
}