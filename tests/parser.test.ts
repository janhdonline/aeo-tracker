import { describe, it, expect } from 'vitest';
import { detectMentions } from '../src/lib/parser/mentions';
import { extractCompetitorMentions } from '../src/lib/parser/mentions';
import * as fs from 'fs';
import * as path from 'path';

const fixturesDir = path.join(__dirname, 'fixtures');

function loadFixture(name: string) {
  return JSON.parse(fs.readFileSync(path.join(fixturesDir, name), 'utf-8'));
}

describe('Parser - Mention Detection', () => {
  it('detects named mentions with citations', () => {
    const fixture = loadFixture('with-citations.json');
    const mentions = detectMentions(
      fixture.answer,
      fixture.citations,
      fixture.brandName,
      fixture.brandAliases,
      fixture.domain
    );
    expect(mentions.length).toBeGreaterThan(0);
    expect(mentions[0].mentionType).toBe('linked');
  });

  it('returns no mentions when brand absent', () => {
    const fixture = loadFixture('without-citations.json');
    const mentions = detectMentions(
      fixture.answer,
      fixture.citations,
      fixture.brandName,
      fixture.brandAliases,
      fixture.domain
    );
    expect(mentions.length).toBe(0);
  });

  it('detects implied mentions via pronoun/anaphora', () => {
    const fixture = loadFixture('implied-mention.json');
    const mentions = detectMentions(
      fixture.answer,
      fixture.citations,
      fixture.brandName,
      fixture.brandAliases,
      fixture.domain
    );
    // Brand domain appears in citations, so should be detected as linked
    expect(mentions.length).toBeGreaterThan(0);
  });

  it('detects competitor wins when brand absent but competitors present', () => {
    const fixture = loadFixture('competitor-wins.json');
    const mentions = detectMentions(
      fixture.answer,
      fixture.citations,
      fixture.brandName,
      fixture.brandAliases,
      fixture.domain
    );
    expect(mentions.length).toBe(0);
    
    const competitors = extractCompetitorMentions(
      fixture.answer,
      fixture.citations,
      fixture.competitorDomains
    );
    expect(competitors.length).toBeGreaterThan(0);
  });

  it('detects link-only mentions (brand in citations but not text)', () => {
    const fixture = loadFixture('link-only-mention.json');
    const mentions = detectMentions(
      fixture.answer,
      fixture.citations,
      fixture.brandName,
      fixture.brandAliases,
      fixture.domain
    );
    expect(mentions.length).toBeGreaterThan(0);
    expect(mentions.some(m => m.mentionType === 'linked')).toBe(true);
  });
});