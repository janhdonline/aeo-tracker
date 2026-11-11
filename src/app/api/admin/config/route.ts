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
      admin.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(25),
    ]);

    // Live Runtime Infrastructure Environment Radar
    const envAudit = {
      supabase: {
        status: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
        label: 'Supabase Database & Auth',
        region: 'aws-us-east-1',
      },
      resend: {
        status: Boolean(process.env.RESEND_API_KEY),
        label: 'Resend Email Relay',
        channel: 'outbound-smtp',
      },
      openai: {
        status: Boolean(process.env.OPENAI_API_KEY),
        label: 'OpenAI GPT-4o Engine',
      },
      anthropic: {
        status: Boolean(process.env.ANTHROPIC_API_KEY),
        label: 'Anthropic Claude Engine',
      },
      groq: {
        status: Boolean(process.env.GROQ_API_KEY),
        label: 'Groq Llama 3.3 Engine',
      },
      gemini: {
        status: Boolean(process.env.GEMINI_API_KEY),
        label: 'Google Gemini 2.5 Flash',
      },
      perplexity: {
        status: Boolean(process.env.PERPLEXITY_API_KEY),
        label: 'Perplexity Radar Engine',
      },
      lemonSqueezy: {
        status: Boolean(process.env.LEMONSQUEEZY_API_KEY || process.env.LEMONSQUEEZY_STARTER_VARIANT_ID),
        label: 'LemonSqueezy Billing & Subscriptions',
      },
      edgeRuntime: {
        platform: 'Cloudflare Workers (OpenNext)',
        nodeEnv: process.env.NODE_ENV || 'production',
        cacheDriver: 'In-Memory Versioned Sentinel',
      },
    };

    return NextResponse.json({
      appConfig: appConfig.data || [],
      planConfigs: planConfigs.data || [],
      featureFlags: featureFlags.data || [],
      paymentConfig: paymentConfig.data || [],
      recentAudits: auditLogs.data || [],
      envAudit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { action = 'create_config' } = body;
    const admin = createAdminClient();

    // 1. Create New Dynamic Configuration Key
    if (action === 'create_config') {
      const { key, value, value_type = 'string', description = '', category = 'general', is_secret = false } = body;
      if (!key) {
        return NextResponse.json({ error: 'Config key is required' }, { status: 400 });
      }

      const formattedKey = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

      const { data: inserted, error } = await admin
        .from('app_config')
        .insert({
          key: formattedKey,
          value: String(value ?? ''),
          value_type,
          description: category && category !== 'general' ? `[${category}] ${description.trim()}` : description.trim(),
          is_secret: Boolean(is_secret),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Bump cache version
      const { data: versionRow } = await admin.from('app_config').select('value').eq('key', 'cache_version').maybeSingle();
      const nextVersion = (Number(versionRow?.value || 1) + 1).toString();
      await admin.from('app_config').update({ value: nextVersion, updated_at: new Date().toISOString() }).eq('key', 'cache_version');
      invalidateConfigCache();

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'config_created',
        target_type: 'app_config',
        target_id: formattedKey,
        new_value: { key: formattedKey, value, value_type, category },
      });

      return NextResponse.json({ success: true, config: inserted, message: `Configuration key '${formattedKey}' created` });
    }

    // 2. Register New Feature Flag
    if (action === 'create_flag') {
      const { flag_key, description = '', is_enabled = false, applies_to = 'all' } = body;
      if (!flag_key) {
        return NextResponse.json({ error: 'Flag key is required' }, { status: 400 });
      }

      const formattedFlagKey = flag_key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

      const { data: inserted, error } = await admin
        .from('feature_flags')
        .insert({
          flag_key: formattedFlagKey,
          description: description.trim(),
          is_enabled: Boolean(is_enabled),
          applies_to,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      invalidateConfigCache();

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'flag_created',
        target_type: 'feature_flags',
        target_id: formattedFlagKey,
        new_value: { flag_key: formattedFlagKey, is_enabled, applies_to },
      });

      return NextResponse.json({ success: true, flag: inserted, message: `Feature flag '${formattedFlagKey}' registered` });
    }

    // 3. Set/Update Config Key (POST compatibility)
    if (action === 'set_config') {
      const { key, value } = body;
      const { data: updated, error } = await admin
        .from('app_config')
        .update({ value: String(value ?? ''), updated_at: new Date().toISOString() })
        .eq('key', key)
        .select()
        .single();

      if (error) throw error;

      invalidateConfigCache();

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'config_updated',
        target_type: 'app_config',
        target_id: key,
        new_value: { value },
      });

      return NextResponse.json({ success: true, updated, message: `Config ${key} updated` });
    }

    // 4. Toggle Feature Flag (POST compatibility)
    if (action === 'toggle_flag') {
      const { flagKey, isEnabled } = body;
      const { data: updated, error } = await admin
        .from('feature_flags')
        .update({ is_enabled: Boolean(isEnabled), updated_at: new Date().toISOString() })
        .eq('flag_key', flagKey)
        .select()
        .single();

      if (error) throw error;

      invalidateConfigCache();

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'flag_toggled',
        target_type: 'feature_flags',
        target_id: flagKey,
        new_value: { is_enabled: Boolean(isEnabled) },
      });

      return NextResponse.json({ success: true, updated, message: `Flag ${flagKey} toggled` });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
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
    const { data: versionRow } = await admin.from('app_config').select('value').eq('key', 'cache_version').maybeSingle();
    const nextVersion = (Number(versionRow?.value || 1) + 1).toString();
    await admin.from('app_config').update({ value: nextVersion, updated_at: new Date().toISOString() }).eq('key', 'cache_version');

    // Invalidate local cache
    invalidateConfigCache();

    // Record audit log
    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
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

export async function DELETE(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(request.url);
    const section = url.searchParams.get('section') || 'app_config';
    const key = url.searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key is required for deletion' }, { status: 400 });
    }

    const admin = createAdminClient();

    if (section === 'app_config') {
      const { error } = await admin.from('app_config').delete().eq('key', key);
      if (error) throw error;
    } else if (section === 'feature_flags') {
      const { error } = await admin.from('feature_flags').delete().eq('flag_key', key);
      if (error) throw error;
    } else {
      return NextResponse.json({ error: `Deletion not supported for section: ${section}` }, { status: 400 });
    }

    invalidateConfigCache();

    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
      action: 'config_deleted',
      target_type: section,
      target_id: key,
    });

    return NextResponse.json({ success: true, message: `${key} removed from ${section}` });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
