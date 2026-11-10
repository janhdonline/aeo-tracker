import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { invalidateConfigCache } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();

    const [appConfig, planConfigs, featureFlags, paymentConfig, auditLogs] = await Promise.all([
      admin.from('app_config').select('*').order('key'),
      admin.from('plan_configs').select('*').order('price_usd'),
      admin.from('feature_flags').select('*').order('flag_key'),
      admin.from('payment_config').select('*').order('key'),
      admin.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20),
    ]);

    return NextResponse.json({
      appConfig: appConfig.data || [],
      planConfigs: planConfigs.data || [],
      featureFlags: featureFlags.data || [],
      paymentConfig: paymentConfig.data || [],
      recentAudits: auditLogs.data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { section, key, value, updates } = body;
    const admin = createAdminClient();

    let oldRecord: any = null;
    let newRecord: any = null;

    if (section === 'app_config') {
      const { data: existing } = await admin.from('app_config').select('*').eq('key', key).single();
      oldRecord = existing;

      const { data: updated, error } = await admin
        .from('app_config')
        .update({ value: String(value), updated_at: new Date().toISOString() })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;
      newRecord = updated;
    } else if (section === 'feature_flags') {
      const { data: existing } = await admin.from('feature_flags').select('*').eq('flag_key', key).single();
      oldRecord = existing;

      const { data: updated, error } = await admin
        .from('feature_flags')
        .update({ is_enabled: Boolean(value), updated_at: new Date().toISOString() })
        .eq('flag_key', key)
        .select()
        .single();

      if (error) throw error;
      newRecord = updated;
    } else if (section === 'plan_configs') {
      const { data: existing } = await admin.from('plan_configs').select('*').eq('plan_name', key).single();
      oldRecord = existing;

      const { data: updated, error } = await admin
        .from('plan_configs')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('plan_name', key)
        .select()
        .single();

      if (error) throw error;
      newRecord = updated;
    } else if (section === 'payment_config') {
      const { data: existing } = await admin.from('payment_config').select('*').eq('key', key).single();
      oldRecord = existing;

      const { data: updated, error } = await admin
        .from('payment_config')
        .update({ value: String(value), updated_at: new Date().toISOString() })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;
      newRecord = updated;
    } else {
      return NextResponse.json({ error: `Unknown section: ${section}` }, { status: 400 });
    }

    // Increment cache_version to globally invalidate Cloudflare Worker in-memory caches
    const { data: versionRow } = await admin.from('app_config').select('value').eq('key', 'cache_version').single();
    const nextVersion = (Number(versionRow?.value || 1) + 1).toString();
    await admin.from('app_config').update({ value: nextVersion, updated_at: new Date().toISOString() }).eq('key', 'cache_version');

    // Invalidate local cache
    invalidateConfigCache();

    // Record audit log
    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id,
      action: 'config_updated',
      target_type: section,
      target_id: key,
      old_value: oldRecord,
      new_value: newRecord,
    });

    return NextResponse.json({ success: true, updated: newRecord, cacheVersion: nextVersion });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
