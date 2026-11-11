import { describe, it, expect } from 'vitest';
import { GET, POST } from '@/app/api/projects/[id]/products/route';
import { POST as AuditPOST } from '@/app/api/projects/[id]/products/audit/route';
import { NextRequest } from 'next/server';

describe('Product & SKU Entity Hierarchy (Phase 2.2)', () => {
  it('returns default seeded product SKUs for a project', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects/test-proj-1/products');
    const res = await GET(req, { params: { id: 'test-proj-1' } });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.products).toBeDefined();
    expect(json.products.length).toBeGreaterThan(0);
    expect(json.products[0].name).toBeDefined();
    expect(json.products[0].visibility_score).toBeGreaterThanOrEqual(0);
    expect(json.products[0].citations_count).toBeGreaterThanOrEqual(0);
  });

  it('validates product creation request and rejects empty name', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects/test-proj-1/products', {
      method: 'POST',
      body: JSON.stringify({ name: '' }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req, { params: { id: 'test-proj-1' } });
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain('Product name is required');
  });

  it('creates a new product SKU successfully with defaults', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects/test-proj-1/products', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Stripe Atlas',
        category: 'Business Incorporation',
        sku_code: 'ATL-001',
        target_url: 'https://stripe.com/atlas',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await POST(req, { params: { id: 'test-proj-1' } });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.product.name).toBe('Stripe Atlas');
    expect(json.product.category).toBe('Business Incorporation');
    expect(json.product.visibility_score).toBeGreaterThan(0);
  });

  it('runs SKU Radar Audit and returns model quotations and recommendations', async () => {
    const req = new NextRequest('http://localhost:3000/api/projects/test-proj-1/products/audit', {
      method: 'POST',
      body: JSON.stringify({
        productId: 'prod-123',
        productName: 'Stripe Connect',
        category: 'Marketplace Payments',
      }),
      headers: { 'Content-Type': 'application/json' },
    });
    const res = await AuditPOST(req, { params: { id: 'test-proj-1' } });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.queryTested).toContain('marketplace payments');
    expect(json.engineBreakdown.length).toBeGreaterThanOrEqual(4);
    expect(json.newVisibilityScore).toBeGreaterThanOrEqual(75);
  });
});
