import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'notification_logs') {
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: '1',
                user_id: 'user-1',
                event_type: 'payment_success',
                recipient_email: 'jalom3396@gmail.com',
                subject: 'Your AEO Tracker subscription is active',
                status: 'failed',
                sent_at: new Date().toISOString(),
              },
            ],
            error: null,
          }),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === 'audit_logs') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
      };
    }),
  })),
}));

vi.mock('@/lib/config', () => ({
  getConfig: vi.fn().mockResolvedValue('Admin@2026!'),
  resetApiKeyPool: vi.fn().mockResolvedValue(3),
}));

describe('Email DLQ & Key Pool Management', () => {
  it('retrieves failed notification logs and computes failure rate', async () => {
    const { GET } = await import('@/app/api/admin/emails/route');
    const req = new NextRequest('http://localhost:3000/api/admin/emails', {
      headers: { 'x-admin-key': 'Admin@2026!' },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.logs.length).toBe(1);
    expect(json.stats.failedCount).toBe(1);
    expect(json.logs[0].recipient_email).toBe('jalom3396@gmail.com');
  });
});
