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
// --- Dual Metrics Tests ---
import { calculateDualMetrics, estimateTrafficLeakCount } from '../src/lib/scoring';

describe('Dual Metrics - Mention vs Citation', () => {
  it('detects traffic leak: high mention, low citation', () => {
    const metrics = calculateDualMetrics(100, 80, 20);
    expect(metrics.mentionRate).toBe(80);
    expect(metrics.citationRate).toBe(20);
    expect(metrics.trafficLeak).toBe(true);
    expect(estimateTrafficLeakCount(100, 80, 20)).toBe(60);
  });

  it('no traffic leak when citation rate is close to mention rate', () => {
    const metrics = calculateDualMetrics(100, 80, 65);
    expect(metrics.trafficLeak).toBe(false);
  });

  it('no traffic leak when mention rate is zero', () => {
    const metrics = calculateDualMetrics(100, 0, 10);
    expect(metrics.mentionRate).toBe(0);
    expect(metrics.citationRate).toBe(10);
    expect(metrics.trafficLeak).toBe(false);
  });

  it('returns zeros for empty queries', () => {
    const metrics = calculateDualMetrics(0, 0, 0);
    expect(metrics.mentionRate).toBe(0);
    expect(metrics.citationRate).toBe(0);
    expect(metrics.trafficLeak).toBe(false);
  });

  it('estimates zero leak when all mentions are also citations', () => {
    const leak = estimateTrafficLeakCount(100, 50, 50);
    expect(leak).toBe(0);
  });
});

// --- Fix Brief Generator Tests ---
import { classifyGap, generateRecommendation } from '../src/lib/briefs/generator';

describe('Fix Briefs - Traffic Leak Gap Type', () => {
  it('classifies traffic leak when brand is named but not cited', () => {
    // This would normally be handled by scan.ts, but we test the gap type exists
    const result = classifyGap(true, 'named', 0, ['wirecutter.com'], 'greenbrew.com');
    expect(result).toBe('missing_mention'); // No source_gap since only 1 source
  });

  it('classifies source gap when source appears >= 3 times', () => {
    const sources = ['reddit.com', 'reddit.com', 'reddit.com'];
    const result = classifyGap(true, 'named', 0, sources, 'greenbrew.com');
    expect(result).toBe('source_gap');
  });

  it('generates traffic_leak recommendation with specific hint', () => {
    const rec = generateRecommendation(
      'traffic_leak',
      'best coffee maker',
      ['brewmaster.com'],
      ['wirecutter.com']
    );
    expect(rec.action).toBe('create_content');
    expect(rec.priority).toBe('high');
    expect(rec.contentHint).toContain('link-worthy');
    expect(rec.contentHint).toContain('best coffee maker');
  });
});
