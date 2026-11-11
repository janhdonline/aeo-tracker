import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();
    const nowIso = new Date().toISOString();
    const dateStr = nowIso.split('T')[0];

    // Concurrently fetch tables
    const [
      profilesRes,
      projectsRes,
      keywordsRes,
      configRes,
      keysRes,
      plansRes,
      flagsRes,
    ] = await Promise.all([
      admin.from('profiles').select('id, email, full_name, plan, plan_status, is_admin, is_banned, created_at'),
      admin.from('projects').select('id, user_id, brand_name, domain, active, created_at'),
      admin.from('keywords').select('id, project_id, keyword, intent, active, created_at'),
      admin.from('app_config').select('key, value, value_type, description, updated_at'),
      admin.from('api_keys').select('id, service, key_name, is_active, priority, purpose, error_count, created_at'),
      admin.from('plan_configs').select('*'),
      admin.from('feature_flags').select('*'),
    ]);

    const backupPayload = {
      app: 'AEO Tracker',
      version: '2.0',
      export_timestamp: nowIso,
      exported_by: adminUser?.email || 'admin',
      table_counts: {
        profiles: profilesRes.data?.length || 0,
        projects: projectsRes.data?.length || 0,
        keywords: keywordsRes.data?.length || 0,
        app_config: configRes.data?.length || 0,
        api_keys: keysRes.data?.length || 0,
        plan_configs: plansRes.data?.length || 0,
        feature_flags: flagsRes.data?.length || 0,
      },
      tables: {
        profiles: profilesRes.data || [],
        projects: projectsRes.data || [],
        keywords: keywordsRes.data || [],
        app_config: configRes.data || [],
        api_keys: keysRes.data || [],
        plan_configs: plansRes.data || [],
        feature_flags: flagsRes.data || [],
      },
    };

    const jsonString = JSON.stringify(backupPayload, null, 2);

    const isSummary = request.nextUrl.searchParams.get('summary') === 'true';
    if (isSummary) {
      return NextResponse.json({
        success: true,
        summary: {
          app: 'AEO Tracker',
          version: '2.0',
          tableCounts: backupPayload.table_counts,
          totalRows: Object.values(backupPayload.table_counts).reduce((a, b) => a + b, 0),
          estimatedSizeKb: Math.round(jsonString.length / 1024),
          generatedAt: nowIso,
          exportedBy: adminUser?.email || 'admin',
        },
      });
    }

    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
      action: 'database_json_backup_downloaded',
      target_type: 'database',
      new_value: { tableCounts: backupPayload.table_counts },
    });

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="aeo-tracker-backup-${dateStr}.json"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
