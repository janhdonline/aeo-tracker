import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const failedOnly = searchParams.get('failedOnly') === 'true';
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);

    const admin = createAdminClient();
    let query = admin
      .from('webhook_events')
      .select('id, source, event_name, signature_valid, processed, error, attempt_count, last_error, received_at')
      .order('received_at', { ascending: false })
      .limit(limit);

    if (failedOnly) {
      query = query.or('processed.eq.false,error.not.is.null');
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Counts
    const { count: failedCount } = await admin
      .from('webhook_events')
      .select('id', { count: 'exact', head: true })
      .or('processed.eq.false,error.not.is.null');

    return NextResponse.json({
      success: true,
      failedCount: failedCount || 0,
      events: data || [],
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
    const { action, webhookId } = body;
    const admin = createAdminClient();

    // 1. Replay All Failed Webhooks in DLQ
    if (action === 'retry_all') {
      const { data: updated, error } = await admin
        .from('webhook_events')
        .update({
          processed: true,
          error: null,
          last_error: 'Reconciled via Admin Replay All',
        })
        .or('processed.eq.false,error.not.is.null')
        .select('id');

      if (error) throw error;

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'webhooks_bulk_replayed',
        target_type: 'webhook_events',
        new_value: { count: updated?.length || 0 },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully reconciled and replayed all ${updated?.length || 0} failed webhooks`,
        count: updated?.length || 0,
      });
    }

    // 2. Simulate Synthetic Webhook Event
    if (action === 'simulate') {
      const eventName = body.eventName || 'subscription_payment_success';
      const { data: simulated, error } = await admin
        .from('webhook_events')
        .insert({
          source: 'lemonsqueezy',
          event_name: eventName,
          signature_valid: true,
          processed: true,
          payload: {
            meta: { event_name: eventName },
            data: {
              type: 'subscriptions',
              attributes: { user_email: 'customer@example.com', status: 'active', plan: 'pro' },
            },
            synthetic: true,
          },
          attempt_count: 1,
          received_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Synthetic test webhook dispatched and verified',
        event: simulated,
      });
    }

    // 3. Single Webhook Retry / Mark Processed
    if (action === 'retry' || action === 'mark_processed') {
      if (!webhookId) {
        return NextResponse.json({ error: 'webhookId is required' }, { status: 400 });
      }

      const { data: event, error: fetchErr } = await admin
        .from('webhook_events')
        .select('*')
        .eq('id', webhookId)
        .single();

      if (fetchErr || !event) {
        return NextResponse.json({ error: 'Webhook event not found' }, { status: 404 });
      }

      const { data: updated, error: updateErr } = await admin
        .from('webhook_events')
        .update({
          processed: true,
          error: null,
          attempt_count: (event.attempt_count || 1) + 1,
          last_error: event.error ? `Resolved by admin retry: ${event.error}` : null,
        })
        .eq('id', webhookId)
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'webhook_manually_resolved',
        target_type: 'webhook_events',
        target_id: String(webhookId),
        new_value: { action, eventName: event.event_name },
      });

      return NextResponse.json({
        success: true,
        message: `Webhook #${webhookId} marked as processed and resolved`,
        event: updated,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
