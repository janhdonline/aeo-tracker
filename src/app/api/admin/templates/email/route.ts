import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { getConfig, setConfig } from '@/lib/config';
import { sendNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

const DEFAULT_TEMPLATES: Record<string, { name: string; variables: string[]; defaultText: string }> = {
  email_template_scan_complete: {
    name: 'Scan Completed Alert',
    variables: ['{{project_name}}', '{{domain}}', '{{score}}', '{{share_of_voice}}', '{{total_mentions}}', '{{report_url}}'],
    defaultText: `### Scan Complete: {{project_name}} ({{domain}})\n\nYour brand visibility score is **{{score}}** and share of voice is **{{share_of_voice}}%**.\nTotal Mentions: {{total_mentions}}\n\n[Open Analysis]({{report_url}})`,
  },
  email_template_weekly_digest: {
    name: 'Weekly Executive Digest',
    variables: ['{{project_name}}', '{{domain}}', '{{score}}', '{{score_delta}}', '{{share_of_voice}}', '{{total_mentions}}', '{{dashboard_url}}'],
    defaultText: `### Weekly AEO Performance for {{project_name}}\n\nYour visibility score this week is **{{score}}** ({{score_delta}} pts change) with {{share_of_voice}}% share of voice.\n\n[View Full Report]({{dashboard_url}})`,
  },
};

const SAMPLE_VALUES: Record<string, string> = {
  '{{project_name}}': 'Acme Cloud Platform',
  '{{domain}}': 'acme.com',
  '{{score}}': '84',
  '{{score_delta}}': '+6',
  '{{share_of_voice}}': '68',
  '{{total_mentions}}': '142',
  '{{report_url}}': 'https://aeo-tracker.janhdonline.workers.dev/report/acme.com',
  '{{dashboard_url}}': 'https://aeo-tracker.janhdonline.workers.dev/dashboard',
};

function renderSampleTemplate(template: string): string {
  let result = template;
  for (const [key, val] of Object.entries(SAMPLE_VALUES)) {
    result = result.split(key).join(val);
  }
  return result;
}

function markdownToHtml(md: string): string {
  const html = md
    .replace(/^### (.*$)/gim, '<h3 style="margin: 16px 0 8px; font-size: 16px; font-weight: 700; color: #0f172a;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="margin: 20px 0 10px; font-size: 18px; font-weight: 700; color: #0f172a;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="margin: 24px 0 12px; font-size: 22px; font-weight: 800; color: #0f172a;">$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 600;">$1</a>')
    .replace(/\n\n/gim, '</p><p style="margin: 12px 0; line-height: 1.6; color: #334155;">')
    .replace(/\n/gim, '<br/>');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px;">
        <span style="display: inline-block; width: 10px; height: 10px; background: #D4F63C; border-radius: 50%;"></span>
        <span style="font-size: 12px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; color: #0f172a;">AEO Tracker Dispatch</span>
      </div>
      <p style="margin: 12px 0; line-height: 1.6; color: #334155;">
        ${html}
      </p>
      <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #94a3b8; text-align: center;">
        Automated notification sent via AEO Tracker Engine. Manage alerts in Dashboard.
      </div>
    </div>
  `;
}

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const [scanComplete, weeklyDigest] = await Promise.all([
      getConfig('email_template_scan_complete'),
      getConfig('email_template_weekly_digest'),
    ]);

    return NextResponse.json({
      success: true,
      templates: {
        email_template_scan_complete: {
          ...DEFAULT_TEMPLATES.email_template_scan_complete,
          currentValue: scanComplete || DEFAULT_TEMPLATES.email_template_scan_complete.defaultText,
        },
        email_template_weekly_digest: {
          ...DEFAULT_TEMPLATES.email_template_weekly_digest,
          currentValue: weeklyDigest || DEFAULT_TEMPLATES.email_template_weekly_digest.defaultText,
        },
      },
      sampleValues: SAMPLE_VALUES,
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
    const { action = 'save', templateKey, templateContent, targetEmail } = body;

    if (!templateKey) {
      return NextResponse.json({ error: 'templateKey is required' }, { status: 400 });
    }

    if (!['email_template_scan_complete', 'email_template_weekly_digest'].includes(templateKey)) {
      return NextResponse.json({ error: 'Invalid template key' }, { status: 400 });
    }

    // 1. Live Render Preview
    if (action === 'preview') {
      const rawText = templateContent || DEFAULT_TEMPLATES[templateKey]?.defaultText || '';
      const interpolatedText = renderSampleTemplate(rawText);
      const renderedHtml = markdownToHtml(interpolatedText);

      return NextResponse.json({
        success: true,
        previewText: interpolatedText,
        previewHtml: renderedHtml,
        sampleValues: SAMPLE_VALUES,
      });
    }

    // 2. Dispatch Live Sample Test Email
    if (action === 'test_dispatch') {
      const recipient = targetEmail || adminUser?.email || 'admin@system.local';
      const rawText = templateContent || DEFAULT_TEMPLATES[templateKey]?.defaultText || '';
      const interpolatedText = renderSampleTemplate(rawText);
      const renderedHtml = markdownToHtml(interpolatedText);

      const templateName = DEFAULT_TEMPLATES[templateKey]?.name || 'AEO Template';
      const sendResult = await sendNotification(
        'scan_complete',
        null,
        recipient,
        `[TEST] ${templateName}: Sample Live Preview`,
        renderedHtml,
        {
          is_template_preview_test: true,
          template_key: templateKey,
          dispatched_by: adminUser?.email,
        }
      );

      return NextResponse.json({
        success: true,
        delivered: sendResult.success,
        error: sendResult.error,
        recipient,
        message: sendResult.success
          ? `Sample email sent to ${recipient}`
          : `Failed to dispatch: ${sendResult.error || 'Check Resend key'}`,
      });
    }

    // 3. Reset Template to Default
    if (action === 'reset_default') {
      const def = DEFAULT_TEMPLATES[templateKey];
      if (!def) return NextResponse.json({ error: 'Unknown template' }, { status: 404 });

      await setConfig(templateKey, def.defaultText, 'string', `Reset to factory default: ${templateKey}`);

      const admin = createAdminClient();
      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'reset_email_template',
        target_type: 'app_config',
        target_id: templateKey,
      });

      return NextResponse.json({
        success: true,
        defaultText: def.defaultText,
        message: `${def.name} reset to factory default`,
      });
    }

    // 4. Save Custom Template
    if (!templateContent) {
      return NextResponse.json({ error: 'templateContent is required to save' }, { status: 400 });
    }

    const admin = createAdminClient();
    await setConfig(
      templateKey,
      templateContent,
      'string',
      `Dynamic email template for ${templateKey}`
    );

    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
      action: 'update_email_template',
      target_type: 'app_config',
      target_id: templateKey,
    });

    return NextResponse.json({
      success: true,
      message: 'Email template saved successfully',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
