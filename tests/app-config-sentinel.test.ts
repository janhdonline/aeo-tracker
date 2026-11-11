import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/config', () => ({
  getConfig: vi.fn().mockImplementation((key: string) => {
    if (key === 'admin_master_password') return Promise.resolve('Admin@2026!');
    return Promise.resolve(null);
  }),
  setConfig: vi.fn().mockResolvedValue(true),
  invalidateConfigCache: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendNotification: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/supabase/admin', () => {
  return {
    createAdminClient: vi.fn(() => ({
      from: vi.fn((table: string) => {
        if (table === 'app_config') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [
                  { key: 'site_name', value: 'AEO Tracker', value_type: 'string', category: 'general' },
                  { key: 'cache_version', value: '5', value_type: 'number', category: 'system' },
                ],
                error: null,
              }),
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: { key: 'cache_version', value: '5' },
                  error: null,
                }),
                single: vi.fn().mockResolvedValue({
                  data: { key: 'site_name', value: 'AEO Tracker' },
                  error: null,
                }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { key: 'new_feature_threshold', value: '10', value_type: 'number' },
                  error: null,
                }),
              }),
            }),
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({
                    data: { key: 'site_name', value: 'AEO Tracker Pro' },
                    error: null,
                  }),
                }),
              }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'feature_flags') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: [{ flag_key: 'dark_mode', is_enabled: true, applies_to: 'all' }],
                error: null,
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: { flag_key: 'ai_radar_v2', is_enabled: true, applies_to: 'all' },
                  error: null,
                }),
              }),
            }),
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        if (table === 'plan_configs' || table === 'payment_config') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: [], error: null }),
            }),
          };
        }
        if (table === 'audit_logs') {
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
            insert: vi.fn().mockResolvedValue({ error: null }),
          };
        }
        return {
          select: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        };
      }),
    })),
  };
});

describe('Tab 7: App Config & Email Live Studio API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET & POST /api/admin/templates/email - handles preview, test dispatch, and reset', async () => {
    const { GET, POST } = await import('@/app/api/admin/templates/email/route');

    // GET templates
    const getReq = new NextRequest('http://localhost/api/admin/templates/email', {
      headers: { 'x-admin-key': 'Admin@2026!' },
    });
    const getRes = await GET(getReq);
    const getData = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(getData.templates.email_template_scan_complete).toBeDefined();
    expect(getData.sampleValues).toBeDefined();

    // POST action: 'preview'
    const prevReq = new NextRequest('http://localhost/api/admin/templates/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'Admin@2026!' },
      body: JSON.stringify({
        action: 'preview',
        templateKey: 'email_template_scan_complete',
        templateContent: '### Visibility Alert: {{project_name}}\nScore: **{{score}}**',
      }),
    });
    const prevRes = await POST(prevReq);
    const prevData = await prevRes.json();

    expect(prevRes.status).toBe(200);
    expect(prevData.success).toBe(true);
    expect(prevData.previewText).toContain('Acme Cloud Platform');
    expect(prevData.previewHtml).toContain('<strong>84</strong>');

    // POST action: 'test_dispatch'
    const dispReq = new NextRequest('http://localhost/api/admin/templates/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'Admin@2026!' },
      body: JSON.stringify({
        action: 'test_dispatch',
        templateKey: 'email_template_scan_complete',
        targetEmail: 'admin@acme.com',
      }),
    });
    const dispRes = await POST(dispReq);
    const dispData = await dispRes.json();

    expect(dispRes.status).toBe(200);
    expect(dispData.success).toBe(true);
    expect(dispData.delivered).toBe(true);

    // POST action: 'reset_default'
    const resetReq = new NextRequest('http://localhost/api/admin/templates/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'Admin@2026!' },
      body: JSON.stringify({
        action: 'reset_default',
        templateKey: 'email_template_scan_complete',
      }),
    });
    const resetRes = await POST(resetReq);
    const resetData = await resetRes.json();

    expect(resetRes.status).toBe(200);
    expect(resetData.success).toBe(true);
    expect(resetData.defaultText).toContain('Scan Complete');
  });

  it('GET, POST, and DELETE /api/admin/config - manages configs and feature flags', async () => {
    const { GET, POST, DELETE } = await import('@/app/api/admin/config/route');

    // GET configs and envAudit
    const getReq = new NextRequest('http://localhost/api/admin/config', {
      headers: { 'x-admin-key': 'Admin@2026!' },
    });
    const getRes = await GET(getReq);
    const getData = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(getData.appConfig).toBeDefined();
    expect(getData.envAudit).toBeDefined();
    expect(getData.envAudit.supabase).toBeDefined();

    // POST action: 'create_config'
    const createCfgReq = new NextRequest('http://localhost/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'Admin@2026!' },
      body: JSON.stringify({
        action: 'create_config',
        key: 'new_feature_threshold',
        value: '10',
        value_type: 'number',
        description: 'Threshold for alerts',
        category: 'ai_engine',
      }),
    });
    const createCfgRes = await POST(createCfgReq);
    const createCfgData = await createCfgRes.json();

    expect(createCfgRes.status).toBe(200);
    expect(createCfgData.success).toBe(true);
    expect(createCfgData.config.key).toBe('new_feature_threshold');

    // POST action: 'create_flag'
    const createFlagReq = new NextRequest('http://localhost/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'Admin@2026!' },
      body: JSON.stringify({
        action: 'create_flag',
        flag_key: 'ai_radar_v2',
        description: 'New radar algorithm',
        is_enabled: true,
      }),
    });
    const createFlagRes = await POST(createFlagReq);
    const createFlagData = await createFlagRes.json();

    expect(createFlagRes.status).toBe(200);
    expect(createFlagData.success).toBe(true);
    expect(createFlagData.flag.flag_key).toBe('ai_radar_v2');

    // DELETE custom key
    const delReq = new NextRequest('http://localhost/api/admin/config?section=app_config&key=new_feature_threshold', {
      method: 'DELETE',
      headers: { 'x-admin-key': 'Admin@2026!' },
    });
    const delRes = await DELETE(delReq);
    const delData = await delRes.json();

    expect(delRes.status).toBe(200);
    expect(delData.success).toBe(true);
  });
});
