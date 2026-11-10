import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();
    const { data: keys, error } = await admin
      .from('api_keys')
      .select('id, service, key_name, is_active, priority, purpose, error_count, last_error, last_used_at, notes, created_at')
      .order('service')
      .order('priority', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ keys: keys || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { service, key_name, key_value, priority, purpose, notes } = body;

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

    return NextResponse.json({ success: true, key: inserted });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { id, is_active, priority, purpose, notes, reset_errors } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const updates: Record<string, any> = {};
    if (is_active !== undefined) updates.is_active = is_active;
    if (priority !== undefined) updates.priority = Number(priority);
    if (purpose !== undefined) updates.purpose = purpose;
    if (notes !== undefined) updates.notes = notes;
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
