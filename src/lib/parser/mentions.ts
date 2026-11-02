import { normalizeDomain } from './citations';

export interface BrandMention {
  matchedEntity: string;
  mentionType: 'named' | 'linked' | 'implied';
  positionInAnswer: number;
  contextSnippet: string;
}

export function detectMentions(
  answer: string,
  citations: { domain: string; url: string; title: string }[],
  brandName: string,
  brandAliases: string[],
  domain: string
): BrandMention[] {
  const mentions: BrandMention[] = [];
  const brandTerms = [brandName, ...brandAliases, domain].map(t => t.toLowerCase());
  const paragraphs = answer.split('\n\n').filter(p => p.trim().length > 0);
  
  // Check for named mentions in text
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].toLowerCase();
    const position = i + 1; // 1-based
    
    for (const term of brandTerms) {
      if (paragraph.includes(term.toLowerCase())) {
        // Check if it's a linked mention (domain appears in citations)
        const brandDomain = domain.includes('://') ? normalizeDomain(domain) : domain.toLowerCase().replace(/^www\./, '');
        const isLinked = citations.some(c => c.domain.toLowerCase() === brandDomain);
        
        mentions.push({
          matchedEntity: term,
          mentionType: isLinked ? 'linked' : 'named',
          positionInAnswer: position,
          contextSnippet: paragraphs[i].slice(0, 200),
        });
        break; // Only count first match per paragraph
      }
    }
  }
  
  // Check for linked mentions (brand domain in citations but not in text)
  const brandDomain = domain.includes('://') ? normalizeDomain(domain) : domain.toLowerCase().replace(/^www\./, '');
  const hasLinkedCitation = citations.some(c => c.domain === brandDomain);
  const hasNamedMention = mentions.some(m => m.mentionType === 'named' || m.mentionType === 'linked');
  
  if (hasLinkedCitation && !hasNamedMention) {
    mentions.push({
      matchedEntity: domain,
      mentionType: 'linked',
      positionInAnswer: 1,
      contextSnippet: 'Brand domain cited in sources',
    });
  }
  
  return mentions;
}

export function extractCompetitorMentions(
  answer: string,
  citations: { domain: string; url: string; title: string }[],
  competitorDomains: string[]
): { competitorDomain: string; frequency: number }[] {
  const mentions: Record<string, number> = {};
  const answerLower = answer.toLowerCase();
  
  // Check text mentions
  for (const compDomain of competitorDomains) {
    const normalized = normalizeDomain(compDomain);
    const domainVariants = [normalized, `www.${normalized}`];
    
    let count = 0;
    for (const variant of domainVariants) {
      const regex = new RegExp(variant.replace('.', '\\.'), 'gi');
      const matches = answerLower.match(regex);
      if (matches) count += matches.length;
    }
    
    // Check citation mentions
    for (const citation of citations) {
      if (citation.domain === normalized) {
        count++;
      }
    }
    
    if (count > 0) {
      mentions[compDomain] = count;
    }
  }
  
  return Object.entries(mentions).map(([competitorDomain, frequency]) => ({
    competitorDomain,
    frequency,
  }));
}