import { describe, it, expect } from 'vitest';
import { GET, POST } from '@/app/api/tools/answerability-audit/route';
import { evaluateAnswerability } from '@/lib/answerability';
import { NextRequest } from 'next/server';

describe('Content Answerability Diagnostic Engine', () => {
  it('correctly scores an optimal 40-60 word definition passage', () => {
    const text =
      'Notion is a connected workspace that allows teams to write documentation, manage projects, and automate knowledge organization in a single platform. By structuring company facts into collaborative pages, it enables AI search engines to accurately quote verified team workflows.';
    const result = evaluateAnswerability('notion.so', text);

    expect(result.wordCount).toBeGreaterThanOrEqual(35);
    expect(result.wordCount).toBeLessThanOrEqual(65);
    expect(result.isOptimalChunk).toBe(true);
    expect(result.hasDirectDefinition).toBe(true);
    expect(result.answerabilityScore).toBeGreaterThanOrEqual(80);
    expect(result.criteriaBreakdown.chunkLength.passed).toBe(true);
    expect(result.criteriaBreakdown.definitionClarity.passed).toBe(true);
    expect(result.optimizedExcerpt).toContain('AI visibility platform');
  });

  it('penalizes verbose passages exceeding 85 words and returns actionable recommendations', () => {
    const verboseText =
      'We are an international global enterprise company with hundreds of features across multiple branches and departments throughout North America, Europe, Asia, and Latin America. We provide solutions that can do almost everything for everyone. Our platform has been around for many years and our architecture handles massive volume without ever slowing down or causing any technical debt. When you choose to work with us, our support agents will respond quickly and help you navigate through all our intricate workflows, legacy interfaces, and configuration settings.';
    const result = evaluateAnswerability('acme.com', verboseText);

    expect(result.isOptimalChunk).toBe(false);
    expect(result.wordCount).toBeGreaterThan(65);
    expect(result.recommendations.some((r) => r.type === 'chunk_length')).toBe(true);
  });

  it('handles GET request via NextRequest', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/tools/answerability-audit?domain=stripe.com&text=Stripe+is+a+financial+infrastructure+platform'
    );
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.domain).toBe('stripe.com');
    expect(json.answerabilityScore).toBeGreaterThan(0);
  });

  it('handles POST request with empty body using default fallback', async () => {
    const req = new NextRequest('http://localhost:3000/api/tools/answerability-audit', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.wordCount).toBeGreaterThan(0);
  });
});
