import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();
    const url = new URL(request.url);
    const failedOnly = url.searchParams.get('failedOnly') === 'true';

    let query = admin
      .from('notification_logs')
      .select('id, user_id, event_type, recipient_email, subject, status, resend_message_id, metadata, sent_at')
      .order('sent_at', { ascending: false })
      .limit(60);

    if (failedOnly) {
      query = query.eq('status', 'failed');
    }

    const { data: logs, error } = await query;
    if (error) throw error;

    const list = logs || [];
    const totalCount = list.length;
    const failedCount = list.filter((l) => l.status === 'failed').length;
    const sentCount = list.filter((l) => l.status === 'sent').length;
    const successRatePct = totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 100;

    return NextResponse.json({
      success: true,
      logs: list,
      stats: {
        totalCount,
        failedCount,
        sentCount,
        successRatePct,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { action, id, testRecipient } = body;
    const admin = createAdminClient();

    if (action === 'retry') {
      if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

      const { data: log, error: fetchErr } = await admin
        .from('notification_logs')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr || !log) {
        return NextResponse.json({ error: 'Notification log not found' }, { status: 404 });
      }

      // Re-dispatch notification
      const htmlBody = log.metadata?.html || `<p>${log.subject}</p><p>Re-delivered via Admin Outbound Dispatcher.</p>`;
      const sendRes = await sendNotification(
        log.event_type as any,
        log.user_id,
        log.recipient_email,
        log.subject,
        htmlBody,
        { ...log.metadata, retried_at: new Date().toISOString(), retried_by: adminUser?.id }
      );

      // Update status in log
      const newStatus = sendRes.success ? 'sent' : 'failed';
      await admin
        .from('notification_logs')
        .update({
          status: newStatus,
          sent_at: new Date().toISOString(),
          metadata: { ...log.metadata, retry_result: sendRes },
        })
        .eq('id', id);

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id,
        action: 'retry_email_notification',
        target_type: 'notification_log',
        target_id: String(id),
        new_value: { status: newStatus, recipient: log.recipient_email },
      });

      return NextResponse.json({
        success: true,
        delivered: sendRes.success,
        newStatus,
        message: sendRes.success
          ? `Email successfully delivered to ${log.recipient_email}`
          : `Retry attempted: ${sendRes.error || 'Failed to dispatch'}`,
      });
    }

    if (action === 'retry_all_failed') {
      const { data: failedLogs } = await admin
        .from('notification_logs')
        .select('*')
        .eq('status', 'failed')
        .limit(20);

      const items = failedLogs || [];
      let successCount = 0;

      for (const item of items) {
        const htmlBody = item.metadata?.html || `<p>${item.subject}</p>`;
        const res = await sendNotification(
          item.event_type as any,
          item.user_id,
          item.recipient_email,
          item.subject,
          htmlBody,
          { ...item.metadata, retried_batch: true }
        );

        if (res.success) {
          successCount++;
          await admin
            .from('notification_logs')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', item.id);
        }
      }

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id,
        action: 'retry_all_failed_emails',
        target_type: 'notification_logs',
        new_value: { totalRetried: items.length, succeeded: successCount },
      });

      return NextResponse.json({
        success: true,
        retried: items.length,
        succeeded: successCount,
        message: `Processed ${items.length} failed emails (${successCount} succeeded)`,
      });
    }

    if (action === 'test_send') {
      const recipient = testRecipient || adminUser?.email || 'admin@system.local';
      const testRes = await sendNotification(
        'signup_welcome',
        null,
        recipient,
        'AEO Checker — System Verification Test Email',
        `<h3>System Dispatcher Test</h3><p>This is a live outbound test from the AEO Operations Portal at ${new Date().toISOString()}.</p>`,
        { is_test: true }
      );

      return NextResponse.json({
        success: true,
        delivered: testRes.success,
        error: testRes.error,
        recipient,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
