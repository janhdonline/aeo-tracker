import { describe, it, expect } from 'vitest';
import { GET, POST } from '@/app/api/tools/web-presence/route';
import { NextRequest } from 'next/server';

describe('Web Presence Audit API', () => {
  it('handles GET request with domain parameter', async () => {
    const req = new NextRequest('http://localhost:3000/api/tools/web-presence?domain=notion.so&brand=Notion');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.domain).toBe('notion.so');
    expect(data.brand).toBe('Notion');
    expect(data.overallScore).toBeGreaterThanOrEqual(0);
    expect(data.overallScore).toBeLessThanOrEqual(100);
    expect(data.platforms).toHaveLength(4);

    const platformNames = data.platforms.map((p: any) => p.name);
    expect(platformNames).toContain('Reddit Community Authority');
    expect(platformNames).toContain('Wikipedia & Wikidata Entity');
    expect(platformNames).toContain('YouTube Video & Transcript Index');
    expect(platformNames).toContain('X (Twitter) Real-Time Momentum');

    expect(data.sameAsSchema).toContain('schema.org');
    expect(data.sameAsSchema).toContain('reddit.com');
    expect(data.sameAsSchema).toContain('wikidata.org');
  });

  it('handles POST request with custom domain and brand', async () => {
    const req = new NextRequest('http://localhost:3000/api/tools/web-presence', {
      method: 'POST',
      body: JSON.stringify({ domain: 'stripe.com', brand: 'Stripe' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.domain).toBe('stripe.com');
    expect(data.brand).toBe('Stripe');
    expect(data.overallScore).toBeGreaterThanOrEqual(70);
    expect(data.recommendations.length).toBeGreaterThan(0);
  });

  it('provides safe fallbacks for missing parameters', async () => {
    const req = new NextRequest('http://localhost:3000/api/tools/web-presence');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.domain).toBe('notion.so');
    expect(data.platforms).toHaveLength(4);
  });
});
