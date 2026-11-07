// Hallucination Watch (spec section 15.6)
//
// Fact-check AI claims against a brand facts sheet.
// Scrunch does sentiment monitoring but NOT fact-claim checking.
// This is a real differentiator: if an AI answer says your product
// costs $199 when it actually costs $89, that's a misinformation alert.
//
// Uses a cheap LLM call (gpt-4o-mini) to check mention snippets for
// factual claims. Manual review before emailing alerts (avoid false alarms).

import { callLlm } from '@/lib/llm';

export interface BrandFact {
  factType: 'price' | 'feature' | 'availability' | 'status' | 'claim';
  key: string;
  expectedValue: string;
}

export interface MisinformationAlert {
  engine: string;
  quote: string;
  claimedValue: string;
  expectedValue: string;
  factType: string;
  confidence: number;
}

/**
 * Check a mention snippet for factual claims that contradict the brand facts sheet.
 *
 * @param snippet  The mention context snippet from the AI answer
 * @param engine   Which engine produced the answer (e.g. 'gemini', 'perplexity')
 * @param facts    The brand facts sheet to check against
 * @returns Array of misinformation alerts (empty if no contradictions found)
 */
export async function checkForHallucinations(
  snippet: string,
  engine: string,
  facts: BrandFact[]
): Promise<MisinformationAlert[]> {
  if (!snippet || facts.length === 0) return [];

  const factsJson = JSON.stringify(
    facts.map((f) => ({ type: f.factType, key: f.key, expected: f.expectedValue }))
  );

  const llmResponse = await callLlm({
    prompt: `You are a fact-checking system for an AEO (Answer Engine Optimization) tool.

BRAND FACTS (what is TRUE):
${factsJson}

AI ANSWER SNIPPET (what the AI claimed):
"""
${snippet.slice(0, 500)}
"""

Your task: Check if the AI answer contains any factual claim that CONTRADICTS the brand facts.
For each contradiction found, return a JSON object with:
- "quote": the exact quote from the AI answer
- "claimedValue": what the AI claimed
- "expectedValue": what is actually true (from the facts sheet)
- "factType": the type of fact (price, feature, availability, status, claim)
- "confidence": 0-1, how confident you are this is a real contradiction

Return a JSON array. If no contradictions found, return an empty array [].
Only flag clear contradictions, not minor wording differences. Be conservative — false alarms hurt trust.`,
    system: 'You are a conservative fact-checker. Return only a valid JSON array. No markdown, no explanation.',
    maxTokens: 500,
    temperature: 0.1,
  });

  if (!llmResponse || !llmResponse.text.trim()) return [];

  try {
    // Extract JSON array from response
    const jsonMatch = llmResponse.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item: any) => item.quote && item.claimedValue && item.expectedValue)
      .map((item: any) => ({
        engine,
        quote: String(item.quote).slice(0, 500),
        claimedValue: String(item.claimedValue).slice(0, 200),
        expectedValue: String(item.expectedValue).slice(0, 200),
        factType: String(item.factType || 'claim'),
        confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0.5)),
      }));
  } catch (error) {
    console.error('hallucination-watch: failed to parse LLM response:', error);
    return [];
  }
}

/**
 * Build a brand facts sheet from project data.
 * Uses project metadata + any user-defined facts.
 */
export function buildFactsSheet(project: any, userFacts: BrandFact[] = []): BrandFact[] {
  const facts: BrandFact[] = [...userFacts];

  // Add project domain as a known fact
  if (project?.domain) {
    facts.push({
      factType: 'claim',
      key: 'domain',
      expectedValue: project.domain,
    });
  }

  // Add brand name as a known fact
  if (project?.brand_name) {
    facts.push({
      factType: 'claim',
      key: 'brand_name',
      expectedValue: project.brand_name,
    });
  }

  return facts;
}
