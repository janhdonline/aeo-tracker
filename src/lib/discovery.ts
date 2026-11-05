import { GeminiAdapter } from '@/lib/engines/gemini';

export interface DiscoveryInput {
  industry: string;
  brandName: string;
  competitorDomains: string[];
  painPoint?: string;
}

export interface DiscoveredKeyword {
  keyword: string;
  intent: 'informational' | 'commercial' | 'navigational';
  score: number;
}

export async function discoverKeywords(input: DiscoveryInput): Promise<DiscoveredKeyword[]> {
  try {
    const adapter = new GeminiAdapter();
    const response = await adapter.run({
      prompt: buildDiscoveryPrompt(input),
      keyword: 'discovery',
      intent: 'informational',
    });

    const parsed = parseDiscoveryResponse(response.answerText);
    if (parsed.length > 0) {
      return parsed.slice(0, 40); // Cap at 40 keywords
    }
  } catch (error) {
    console.warn('LLM keyword discovery failed, falling back to templates:', error);
  }

  // Fallback to template-based discovery
  return fallbackDiscovery(input);
}

function buildDiscoveryPrompt(input: DiscoveryInput): string {
  const competitors = input.competitorDomains.slice(0, 5).join(', ') || 'various competitors';
  return `Generate 40 keyword questions that buyers ask when researching ${input.industry} products/services.
Brand: ${input.brandName}
Competitors: ${competitors}
${input.painPoint ? `Pain point: ${input.painPoint}` : ''}

Return as JSON array with fields: keyword (string), intent ("informational" | "commercial" | "navigational"), score (0-1).
Include all three intent types. Commercial: buying/pricing/comparison. Informational: how-to/guide/what-is. Navigational: brand-specific searches.
Focus on questions that would trigger AI answers mentioning brands.`;
}

function parseDiscoveryResponse(text: string): DiscoveredKeyword[] {
  try {
    // Try to extract JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed
        .filter((item: any) => item.keyword && item.intent && typeof item.score === 'number')
        .map((item: any) => ({
          keyword: item.keyword.trim(),
          intent: ['informational', 'commercial', 'navigational'].includes(item.intent) ? item.intent : 'informational',
          score: Math.max(0, Math.min(1, item.score)),
        }));
    }
  } catch {
    // If JSON parsing fails, try line-by-line parsing
  }

  // Fallback: parse line-by-line
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => ({
      keyword: line.replace(/^[-*•]\s*/, '').trim(),
      intent: 'informational' as const,
      score: 0.5,
    }))
    .slice(0, 40);
}

function fallbackDiscovery(input: DiscoveryInput): DiscoveredKeyword[] {
  const templates: Record<string, string[]> = {
    saas: [
      `best ${input.industry} software`,
      `${input.industry} tools comparison`,
      `top ${input.industry} platforms`,
      `${input.industry} pricing`,
      `${input.industry} alternatives`,
      `${input.industry} features`,
      `${input.industry} reviews`,
      `${input.industry} integration`,
      `${input.industry} api`,
      `${input.industry} for small business`,
      `${input.industry} for enterprise`,
      `how to choose ${input.industry}`,
      `${input.industry} vs ${input.competitorDomains[0] || 'alternative'}`,
      `is ${input.industry} worth it`,
      `${input.industry} free trial`,
    ],
    ecommerce: [
      `best ${input.industry} products`,
      `${input.industry} reviews`,
      `top rated ${input.industry}`,
      `buy ${input.industry} online`,
      `${input.industry} deals`,
      `${input.industry} discount code`,
      `${input.industry} shipping`,
      `${input.industry} return policy`,
      `where to buy ${input.industry}`,
      `${input.industry} vs ${input.competitorDomains[0] || 'brand'}`,
    ],
    healthcare: [
      `best ${input.industry} provider`,
      `${input.industry} reviews`,
      `${input.industry} near me`,
      `${input.industry} cost`,
      `${input.industry} insurance`,
      `${input.industry} specialist`,
      `how to choose ${input.industry}`,
      `${input.industry} appointment`,
      `${input.industry} telehealth`,
    ],
    finance: [
      `best ${input.industry} rates`,
      `${input.industry} comparison`,
      `${input.industry} reviews`,
      `${input.industry} fees`,
      `${input.industry} application`,
      `${input.industry} requirements`,
      `${input.industry} vs ${input.competitorDomains[0] || 'bank'}`,
      `${input.industry} customer service`,
    ],
  };

  const baseKeywords = templates[input.industry.toLowerCase()] || [
    `best ${input.industry}`,
    `${input.industry} guide`,
    `${input.industry} comparison`,
    `top ${input.industry}`,
    `${input.industry} reviews`,
    `${input.industry} pricing`,
    `${input.industry} alternatives`,
    `${input.industry} features`,
    `how to choose ${input.industry}`,
    `${input.industry} vs competitor`,
  ];

  return baseKeywords.map((keyword, index) => ({
    keyword,
    intent: index < 2 ? 'commercial' as const : 'informational' as const,
    score: 1 - index * 0.1,
  }));
}