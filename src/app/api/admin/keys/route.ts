import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { getEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();
    const { data: keys, error } = await admin
      .from('api_keys')
      .select('id, service, key_name, key_value, is_active, priority, purpose, error_count, last_error, last_used_at, notes, created_at')
      .order('service')
      .order('priority', { ascending: true });

    if (error) throw error;

    // Redact key_value to safe hint: ••••••••ABCD
    const sanitizedKeys = (keys || []).map((k) => {
      const val = k.key_value || '';
      const hint = val.length >= 4 ? `••••${val.slice(-4)}` : '••••';
      return {
        ...k,
        key_value: undefined, // remove raw secret
        key_hint: hint,
      };
    });

    // Detect native environment fallback keys
    const envFallbacks = {
      gemini: {
        configured: Boolean(getEnv('GEMINI_API_KEY') || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY)),
        variableName: 'GEMINI_API_KEY',
        providerName: 'Google Gemini',
      },
      openrouter: {
        configured: Boolean(getEnv('OPENROUTER_API_KEY') || (typeof process !== 'undefined' && process.env?.OPENROUTER_API_KEY)),
        variableName: 'OPENROUTER_API_KEY',
        providerName: 'OpenRouter (Llama/Mistral/Grok)',
      },
      resend: {
        configured: Boolean(getEnv('RESEND_API_KEY') || (typeof process !== 'undefined' && process.env?.RESEND_API_KEY)),
        variableName: 'RESEND_API_KEY',
        providerName: 'Resend Outbound Mail',
      },
      openai: {
        configured: Boolean(getEnv('OPENAI_API_KEY') || (typeof process !== 'undefined' && process.env?.OPENAI_API_KEY)),
        variableName: 'OPENAI_API_KEY',
        providerName: 'OpenAI Direct',
      },
      perplexity: {
        configured: Boolean(getEnv('PERPLEXITY_API_KEY') || (typeof process !== 'undefined' && process.env?.PERPLEXITY_API_KEY)),
        variableName: 'PERPLEXITY_API_KEY',
        providerName: 'Perplexity Sonar Direct',
      },
      grok: {
        configured: Boolean(getEnv('GROK_API_KEY') || (typeof process !== 'undefined' && process.env?.GROK_API_KEY)),
        variableName: 'GROK_API_KEY',
        providerName: 'xAI Grok Direct',
      },
    };

    const stats = {
      total: sanitizedKeys.length,
      active: sanitizedKeys.filter((k) => k.is_active).length,
      errored: sanitizedKeys.filter((k) => k.error_count > 0).length,
      healthy: sanitizedKeys.filter((k) => k.is_active && k.error_count === 0).length,
    };

    return NextResponse.json({
      success: true,
      keys: sanitizedKeys,
      envFallbacks,
      stats,
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

    // 1. Action: Test Key Live Probe
    if (body.action === 'test_key') {
      let svc = (body.service || '').toLowerCase().trim();
      let val = body.keyValue || body.key_value;

      const admin = createAdminClient();

      if (body.keyId && !val) {
        const { data: dbKey } = await admin
          .from('api_keys')
          .select('service, key_value')
          .eq('id', body.keyId)
          .single();
        if (dbKey) {
          svc = dbKey.service.toLowerCase().trim();
          val = dbKey.key_value;
        }
      }

      if (!val) {
        return NextResponse.json({ error: 'Key value or keyId is required for testing' }, { status: 400 });
      }

      const startTime = Date.now();
      let valid = false;
      let message = '';

      try {
        if (svc === 'gemini') {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${val.trim()}`,
            { signal: AbortSignal.timeout(6000) }
          );
          valid = res.ok;
          if (res.ok) {
            message = 'Gemini API authentication verified (HTTP 200 OK)';
          } else {
            const errJson = await res.json().catch(() => ({}));
            message = errJson?.error?.message || `Gemini API returned error ${res.status}`;
          }
        } else if (svc === 'resend') {
          const res = await fetch('https://api.resend.com/api-keys', {
            headers: { Authorization: `Bearer ${val.trim()}` },
            signal: AbortSignal.timeout(6000),
          });
          valid = res.ok;
          message = res.ok ? 'Resend API key verified (HTTP 200 OK)' : `Resend returned error ${res.status}`;
        } else if (svc === 'openrouter') {
          const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
            headers: { Authorization: `Bearer ${val.trim()}` },
            signal: AbortSignal.timeout(6000),
          });
          valid = res.ok;
          message = res.ok ? 'OpenRouter API key verified (HTTP 200 OK)' : `OpenRouter returned error ${res.status}`;
        } else if (svc === 'openai') {
          const res = await fetch('https://api.openai.com/v1/models', {
            headers: { Authorization: `Bearer ${val.trim()}` },
            signal: AbortSignal.timeout(6000),
          });
          valid = res.ok;
          message = res.ok ? 'OpenAI API key verified (HTTP 200 OK)' : `OpenAI returned error ${res.status}`;
        } else if (svc === 'perplexity') {
          const res = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${val.trim()}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'sonar', messages: [{ role: 'user', content: 'hi' }] }),
            signal: AbortSignal.timeout(6000),
          });
          valid = res.ok;
          message = res.ok ? 'Perplexity API key verified' : `Perplexity returned error ${res.status}`;
        } else if (svc === 'grok') {
          const res = await fetch('https://api.x.ai/v1/models', {
            headers: { Authorization: `Bearer ${val.trim()}` },
            signal: AbortSignal.timeout(6000),
          });
          valid = res.ok;
          message = res.ok ? 'xAI Grok API key verified' : `xAI returned error ${res.status}`;
        } else {
          valid = true;
          message = 'Key formatted and ready for use';
        }

        const latencyMs = Date.now() - startTime;

        // If this is an existing DB key, update status
        if (body.keyId) {
          if (valid) {
            await admin
              .from('api_keys')
              .update({ error_count: 0, last_error: null, is_active: true, last_used_at: new Date().toISOString() })
              .eq('id', body.keyId);
          } else {
            await admin
              .from('api_keys')
              .update({ last_error: message })
              .eq('id', body.keyId);
          }
        }

        return NextResponse.json({
          success: true,
          valid,
          message,
          latencyMs,
          service: svc,
        });
      } catch (testErr: any) {
        return NextResponse.json({
          success: true,
          valid: false,
          message: testErr.message || 'Connection timed out',
          latencyMs: Date.now() - startTime,
          service: svc,
        });
      }
    }

    // 2. Action: Delete Key
    if (body.action === 'delete_key') {
      const id = body.keyId || body.id;
      if (!id) return NextResponse.json({ error: 'keyId is required' }, { status: 400 });
      const admin = createAdminClient();
      await admin.from('api_keys').delete().eq('id', id);
      return NextResponse.json({ success: true, deletedId: id });
    }

    // 3. Action: Toggle Active
    if (body.action === 'toggle_active') {
      const id = body.keyId || body.id;
      if (!id) return NextResponse.json({ error: 'keyId is required' }, { status: 400 });
      const admin = createAdminClient();
      const { data: updated, error } = await admin
        .from('api_keys')
        .update({ is_active: body.isActive ?? body.is_active })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return NextResponse.json({ success: true, key: updated });
    }

    // 4. Action: Add Key Entry
    const service = body.service;
    const key_name = body.key_name || body.keyName || 'primary';
    const key_value = body.key_value || body.keyValue;
    const priority = body.priority;
    const purpose = body.purpose || 'scan';
    const notes = body.notes;

    if (!service || !key_value) {
      return NextResponse.json({ error: 'service and key_value are required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: inserted, error } = await admin
      .from('api_keys')
      .insert({
        service: service.toLowerCase().trim(),
        key_name: key_name || 'primary',
        key_value: key_value.trim(),
        priority: Number(priority) || 1,
        purpose: purpose || 'scan',
        notes: notes || null,
        is_active: true,
      })
      .select('id, service, key_name, is_active, priority, purpose, created_at')
      .single();

    if (error) throw error;

    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id,
      action: 'api_key_added',
      target_type: 'api_key',
      target_id: inserted.id,
      new_value: { service: inserted.service, key_name: inserted.key_name, purpose: inserted.purpose },
    });

    return NextResponse.json({
      success: true,
      key: {
        ...inserted,
        key_hint: `••••${key_value.trim().slice(-4)}`,
      },
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

    if (body.action === 'reset_all_pool') {
      const { resetApiKeyPool } = await import('@/lib/config');
      const count = await resetApiKeyPool(body.service);
      return NextResponse.json({ success: true, resetCount: count });
    }

    const { id, is_active, priority, purpose, notes, reset_errors, key_name } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const updates: Record<string, any> = {};
    if (is_active !== undefined) updates.is_active = is_active;
    if (priority !== undefined) updates.priority = Number(priority);
    if (purpose !== undefined) updates.purpose = purpose;
    if (notes !== undefined) updates.notes = notes;
    if (key_name !== undefined) updates.key_name = key_name;
    if (reset_errors) {
      updates.error_count = 0;
      updates.last_error = null;
    }

    const { data: updated, error } = await admin
      .from('api_keys')
      .update(updates)
      .eq('id', id)
      .select('id, service, key_name, is_active, priority, purpose, error_count, last_error')
      .single();

    if (error) throw error;

    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id,
      action: 'api_key_updated',
      target_type: 'api_key',
      target_id: id,
      new_value: updates,
    });

    return NextResponse.json({ success: true, key: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin.from('api_keys').delete().eq('id', id);
    if (error) throw error;

    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id,
      action: 'api_key_deleted',
      target_type: 'api_key',
      target_id: id,
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
