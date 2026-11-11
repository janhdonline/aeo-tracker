import { describe, it, expect } from 'vitest';
import { FRONTIER_AI_MODELS, simulate10ModelProbe } from '@/lib/models-radar';
import { GET as ModelsRadarGET, POST as ModelsRadarPOST } from '@/app/api/tools/models-radar/route';
import { NextRequest } from 'next/server';

describe('Phase 3.2: 10-Model Frontier AI Engine Radar', () => {
  it('defines exactly 10 frontier AI models with complete metadata', () => {
    expect(FRONTIER_AI_MODELS.length).toBe(10);

    const modelIds = FRONTIER_AI_MODELS.map((m) => m.id);
    expect(modelIds).toContain('chatgpt-4o');
    expect(modelIds).toContain('perplexity-pro');
    expect(modelIds).toContain('claude-3-5');
    expect(modelIds).toContain('gemini-2-0');
    expect(modelIds).toContain('deepseek-r1');
    expect(modelIds).toContain('grok-2');
    expect(modelIds).toContain('qwen-3-5');
    expect(modelIds).toContain('kimi-k2-6');
    expect(modelIds).toContain('mistral-large-2');
    expect(modelIds).toContain('google-deep-search');

    for (const m of FRONTIER_AI_MODELS) {
      expect(m.name).toBeDefined();
      expect(m.provider).toBeDefined();
      expect(m.latency).toBeDefined();
      expect(m.latencyMs).toBeGreaterThan(0);
      expect(m.crawlBot).toBeDefined();
      expect(m.botDirective).toContain('User-agent');
      expect(m.citationMechanism).toBeDefined();
      expect(m.optimizationRule).toBeDefined();
      expect(m.operational).toBe(true);
    }
  });

  it('runs multi-model probe simulation and returns quotes for all 10 models', () => {
    const results = simulate10ModelProbe('notion.so', 'Best team wiki 2026');
    expect(results.length).toBe(10);
    expect(results[0].modelName).toBeDefined();
    expect(results[0].cited).toBe(true);
    expect(results[0].confidence).toBeGreaterThan(0);
  });

  it('serves models radar API endpoint (GET /api/tools/models-radar)', async () => {
    const res = await ModelsRadarGET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.totalModels).toBe(10);
    expect(json.operationalCount).toBe(10);
    expect(json.models.length).toBe(10);
  });

  it('executes model fleet probe via POST /api/tools/models-radar', async () => {
    const req = new NextRequest('http://localhost:3000/api/tools/models-radar', {
      method: 'POST',
      body: JSON.stringify({ domain: 'stripe.com', query: 'Fintech payment processing' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await ModelsRadarPOST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.modelsProbed).toBe(10);
    expect(json.results.length).toBe(10);
  });
});
