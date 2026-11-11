import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn().mockReturnValue(null),
  })),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  })),
}));

vi.mock('@/lib/config', () => ({
  getConfig: vi.fn().mockImplementation((key: string) => {
    if (key === 'admin_master_password') return Promise.resolve('Admin@2026!');
    return Promise.resolve(null);
  }),
}));

const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockUpdate = vi.fn();
const mockInsert = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: mockSelect.mockReturnValue({
            eq: mockEq.mockReturnValue({
              maybeSingle: mockMaybeSingle,
              select: vi.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
          update: mockUpdate.mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: mockSingle,
              }),
            }),
          }),
        };
      }
      if (table === 'audit_logs') {
        return {
          insert: mockInsert.mockResolvedValue({ error: null }),
        };
      }
      return {};
    }),
  })),
}));

describe('POST /api/admin/users/grant-plan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated requests', async () => {
    const { POST } = await import('@/app/api/admin/users/grant-plan/route');
    const req = new NextRequest('http://localhost:3000/api/admin/users/grant-plan', {
      method: 'POST',
      body: JSON.stringify({ userId: 'u-1', plan: 'growth' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('rejects missing userId or plan', async () => {
    const { POST } = await import('@/app/api/admin/users/grant-plan/route');
    const req = new NextRequest('http://localhost:3000/api/admin/users/grant-plan', {
      method: 'POST',
      headers: { 'x-admin-key': 'Admin@2026!' },
      body: JSON.stringify({ userId: '' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('required');
  });

  it('rejects invalid plan name', async () => {
    const { POST } = await import('@/app/api/admin/users/grant-plan/route');
    const req = new NextRequest('http://localhost:3000/api/admin/users/grant-plan', {
      method: 'POST',
      headers: { 'x-admin-key': 'Admin@2026!' },
      body: JSON.stringify({ userId: 'u-1', plan: 'super-ultra-plan' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Invalid plan');
  });

  it('returns 404 when user is not found', async () => {
    mockMaybeSingle.mockResolvedValue({ data: null, error: null });

    const { POST } = await import('@/app/api/admin/users/grant-plan/route');
    const req = new NextRequest('http://localhost:3000/api/admin/users/grant-plan', {
      method: 'POST',
      headers: { 'x-admin-key': 'Admin@2026!' },
      body: JSON.stringify({ userId: 'u-999', plan: 'growth' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain('not found');
  });

  it('successfully updates plan and returns 200 with updated profile', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: {
        id: 'u-1',
        email: 'user@example.com',
        plan: 'free',
        subscription_status: 'inactive',
        subscription_renews_at: null,
      },
      error: null,
    });

    mockSingle.mockResolvedValue({
      data: {
        id: 'u-1',
        email: 'user@example.com',
        plan: 'growth',
        subscription_status: 'active',
        subscription_renews_at: '2026-12-11T00:00:00.000Z',
      },
      error: null,
    });

    const { POST } = await import('@/app/api/admin/users/grant-plan/route');
    const req = new NextRequest('http://localhost:3000/api/admin/users/grant-plan', {
      method: 'POST',
      headers: { 'x-admin-key': 'Admin@2026!' },
      body: JSON.stringify({
        userId: 'u-1',
        plan: 'growth',
        durationDays: 30,
        reason: 'VIP grant',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('growth');
    expect(data.user.plan).toBe('growth');
  });
});
