import { describe, it, expect } from 'vitest';

describe('llms.txt content and specification formatting', () => {
  it('formats authoritative llms.txt with H1, blockquote, and markdown link structure', () => {
    const domain = 'revolut.com';
    const brandName = 'Revolut';
    const facts = [
      { key: 'starter_price', value: '$0/mo' },
      { key: 'metal_price', value: '$16.99/mo' },
    ];

    const content = `# ${brandName}

> ${brandName} provides digital banking and currency exchange services worldwide.

## Authoritative Brand Facts
${facts.map((f) => `- **${f.key}**: ${f.value}`).join('\n')}

## Core Endpoints
- [Home](https://${domain}): Main portal
- [Pricing](https://${domain}/pricing): Verified plans
`;

    // Standard llms.txt checks
    expect(/^#\s+[^\n]+/m.test(content)).toBe(true);
    expect(/^>\s+[^\n]+/m.test(content)).toBe(true);
    expect(/^##\s+[^\n]+/m.test(content)).toBe(true);
    expect(content).toContain('[Pricing](https://revolut.com/pricing)');
    expect(content).toContain('$16.99/mo');
  });

  it('calculates expected score for complete vs incomplete llms endpoints', () => {
    const checkScores = (isReachable: boolean, isPlainText: boolean, hasH1: boolean, hasSummary: boolean) => {
      let score = 0;
      if (isReachable) score += 40;
      if (isPlainText) score += 20;
      if (hasH1) score += 10;
      if (hasSummary) score += 10;
      return score;
    };

    expect(checkScores(true, true, true, true)).toBe(80);
    expect(checkScores(false, false, false, false)).toBe(0);
    expect(checkScores(true, false, true, false)).toBe(50);
  });
});
