import { describe, it, expect } from 'vitest';
import { identifyAIReferrer, getAITrafficTelemetry } from '@/lib/ai-traffic';
import { GET as TrafficGET, POST as TrafficPOST } from '@/app/api/projects/[id]/analytics/traffic/route';
import { GET as TrackScriptGET } from '@/app/track.js/route';
import { NextRequest } from 'next/server';

describe('Phase 3.1: AI Traffic & ROI Integration Hub', () => {
  it('correctly identifies frontier AI referral engines', () => {
    expect(identifyAIReferrer('https://chatgpt.com/c/123-abc')).toEqual({
      isAI: true,
      engine: 'ChatGPT',
    });
    expect(identifyAIReferrer('https://www.perplexity.ai/search/test')).toEqual({
      isAI: true,
      engine: 'Perplexity Pro',
    });
    expect(identifyAIReferrer('https://claude.ai/chat/456')).toEqual({
      isAI: true,
      engine: 'Claude 3.5',
    });
    expect(identifyAIReferrer('https://gemini.google.com/app')).toEqual({
      isAI: true,
      engine: 'Google Gemini',
    });
    expect(identifyAIReferrer('https://copilot.microsoft.com/')).toEqual({
      isAI: true,
      engine: 'Microsoft Copilot',
    });

    // Non-AI referrers
    expect(identifyAIReferrer('https://www.google.com/search?q=hello')).toEqual({
      isAI: false,
    });
    expect(identifyAIReferrer('https://twitter.com/post')).toEqual({
      isAI: false,
    });
    expect(identifyAIReferrer('')).toEqual({
      isAI: false,
    });
  });

  it('computes deterministic AI traffic telemetry with realistic conversion rates and pipeline ARR', () => {
    const telemetry = getAITrafficTelemetry('notion.so', 30);
    expect(telemetry.totalAIVisits).toBeGreaterThan(0);
    expect(telemetry.totalSignups).toBeGreaterThan(0);
    expect(telemetry.conversionRate).toBeGreaterThan(0);
    expect(telemetry.estimatedPipelineValue).toBeGreaterThan(0);
    expect(telemetry.engineBreakdowns.length).toBe(4);
    expect(telemetry.topLandingPages.length).toBeGreaterThan(0);
    expect(telemetry.dailyTrend.length).toBeGreaterThan(0);
  });

  it('serves AI traffic API endpoint (GET /api/projects/[id]/analytics/traffic)', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects/test-proj/analytics/traffic?days=30');
    const res = await TrafficGET(req, { params: { id: 'test-proj' } });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.projectId).toBe('test-proj');
    expect(json.totalAIVisits).toBeGreaterThan(0);
    expect(json.engineBreakdowns).toBeDefined();
    expect(json.topLandingPages).toBeDefined();
  });

  it('validates GA4 measurement ID and rejects invalid format', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects/test-proj/analytics/traffic', {
      method: 'POST',
      body: JSON.stringify({ action: 'connect_ga4', ga4MeasurementId: 'invalid-id' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await TrafficPOST(req, { params: { id: 'test-proj' } });
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('Invalid GA4 Measurement ID');
  });

  it('successfully saves valid GA4 measurement ID starting with G-', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects/test-proj/analytics/traffic', {
      method: 'POST',
      body: JSON.stringify({ action: 'connect_ga4', ga4MeasurementId: 'G-ABC123XYZ' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await TrafficPOST(req, { params: { id: 'test-proj' } });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.connected).toBe(true);
    expect(json.ga4MeasurementId).toBe('G-ABC123XYZ');
  });

  it('serves zero-dependency universal embeddable beacon script (GET /track.js)', async () => {
    const res = await TrackScriptGET();
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/javascript');

    const text = await res.text();
    expect(text).toContain('chatgpt');
    expect(text).toContain('perplexity');
    expect(text).toContain('sendBeacon');
  });
});
