export interface FixBriefRecommendation {
  action: 'update_page' | 'get_listed' | 'create_content' | 'engage_community';
  target: string;
  contentHint: string;
  priority: 'high' | 'medium' | 'low';
}

export interface FixBrief {
  gapType: 'missing_mention' | 'weak_position' | 'competitor_wins' | 'source_gap';
  gapDescription: string;
  recommendation: FixBriefRecommendation;
}

export function classifyGap(
  hasMention: boolean,
  mentionType: 'named' | 'linked' | 'implied' | null,
  competitorMentions: number,
  sourceDomains: string[],
  brandDomain: string
): 'missing_mention' | 'weak_position' | 'competitor_wins' | 'source_gap' {
  if (!hasMention && competitorMentions > 0) {
    return 'competitor_wins';
  }
  if (!hasMention) {
    return 'missing_mention';
  }
  if (mentionType === 'implied') {
    return 'weak_position';
  }
  // Check source gap: a source domain appears ≥3 times but brand's site never appears there
  const sourceCounts: Record<string, number> = {};
  for (const domain of sourceDomains) {
    sourceCounts[domain] = (sourceCounts[domain] || 0) + 1;
  }
  for (const [domain, count] of Object.entries(sourceCounts)) {
    if (count >= 3 && domain !== brandDomain) {
      return 'source_gap';
    }
  }
  return 'missing_mention';
}

export function generateRecommendation(
  gapType: 'missing_mention' | 'weak_position' | 'competitor_wins' | 'source_gap',
  keyword: string,
  competitorDomains: string[],
  sourceDomains: string[]
): FixBriefRecommendation {
  switch (gapType) {
    case 'missing_mention':
      return {
        action: 'create_content',
        target: 'your website',
        contentHint: `Create a comprehensive guide or comparison page targeting "${keyword}" that clearly positions your brand as a top option.`,
        priority: 'high',
      };
    case 'weak_position':
      return {
        action: 'update_page',
        target: 'existing content',
        contentHint: `Improve existing content to explicitly name your brand and link to your site when discussing "${keyword}".`,
        priority: 'medium',
      };
    case 'competitor_wins':
      const topCompetitor = competitorDomains[0] || 'a competitor';
      return {
        action: 'get_listed',
        target: topCompetitor,
        contentHint: `Reach out to ${topCompetitor} for a listing or comparison inclusion, or create a stronger alternative resource.`,
        priority: 'high',
      };
    case 'source_gap':
      const topSource = sourceDomains[0] || 'a key source';
      return {
        action: 'engage_community',
        target: topSource,
        contentHint: `Contribute valuable content to ${topSource} (e.g., expert commentary, data, guest post) to earn citations.`,
        priority: 'medium',
      };
    default:
      return {
        action: 'create_content',
        target: 'your website',
        contentHint: `Create content addressing "${keyword}" to improve visibility.`,
        priority: 'low',
      };
  }
}

export async function generateGapDescription(
  rawAnswer: string,
  gapType: string,
  keyword: string
): Promise<string> {
  // TODO: Use cheap LLM call (gpt-4o-mini) to draft description
  // This will be implemented in Phase 3
  const templates: Record<string, string> = {
    missing_mention: `Your brand is not mentioned in AI answers for "${keyword}". The answer discusses alternatives but doesn't include your brand.`,
    weak_position: `Your brand is only implied in AI answers for "${keyword}" without explicit naming or linking.`,
    competitor_wins: `Competitors are mentioned in AI answers for "${keyword}" but your brand is absent.`,
    source_gap: `A key source domain frequently appears in AI answers for "${keyword}" but your brand's site is never cited there.`,
  };
  return templates[gapType] || `Gap detected for "${keyword}".`;
}