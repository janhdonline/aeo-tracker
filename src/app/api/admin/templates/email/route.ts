import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { getConfig, setConfig } from '@/lib/config';

const DEFAULT_TEMPLATES = {
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
    const { templateKey, templateContent } = body;

    if (!templateKey || !templateContent) {
      return NextResponse.json(
        { error: 'templateKey and templateContent are required' },
        { status: 400 }
      );
    }

    if (!['email_template_scan_complete', 'email_template_weekly_digest'].includes(templateKey)) {
      return NextResponse.json({ error: 'Invalid template key' }, { status: 400 });
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
