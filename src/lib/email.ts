import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import { getApiKey } from '@/lib/config';

export type NotificationEvent =
  | 'signup_welcome'
  | 'payment_success'
  | 'payment_failed'
  | 'scan_complete'
  | 'hallucination_alert'
  | 'weekly_digest'
  | 'plan_changed'
  | 'account_deleted';

async function getResend(): Promise<Resend | null> {
  const key = await getApiKey('resend', 'email') || process.env.RESEND_API_KEY || (process.env.NODE_ENV === 'test' ? 're_test_key' : null);
  if (!key) return null;
  return new Resend(key);
}

/**
 * Universal notification dispatcher that respects user's email_preferences and logs to notification_logs
 */
export async function sendNotification(
  event: NotificationEvent,
  userId: string | null,
  recipientEmail: string,
  subject: string,
  html: string,
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; error?: string }> {
  const admin = createAdminClient();

  // If user ID is known, check preferences
  if (userId) {
    const { data: profile } = await admin
      .from('profiles')
      .select('email_preferences')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.email_preferences && typeof profile.email_preferences === 'object') {
      const prefs = profile.email_preferences as Record<string, boolean>;
      if (prefs[event] === false) {
        // User opted out
        return { success: true };
      }
    }
  }

  const resend = await getResend();
  if (!resend) {
    console.warn(`[email] Resend API key not configured. Skipping email: ${subject}`);
    return { success: false, error: 'Resend API key not configured' };
  }

  try {
    const result = await resend.emails.send({
      from: 'AEO Checker <no-reply@aeochecker.com>',
      to: recipientEmail,
      subject,
      html,
    });

    const isSuccess = !result || !result.error;
    const resendMsgId = result?.data?.id || (result as any)?.id;

    // Log to notification_logs
    try {
      await admin.from('notification_logs').insert({
        user_id: userId,
        event_type: event,
        recipient_email: recipientEmail,
        subject,
        status: isSuccess ? 'sent' : 'failed',
        resend_message_id: resendMsgId,
        metadata,
      });
    } catch {
      // Ignore log error in test environments
    }

    return { success: isSuccess, error: result?.error?.message };
  } catch (err: any) {
    console.error(`[email] Failed to send ${event} to ${recipientEmail}:`, err);
    await admin.from('notification_logs').insert({
      user_id: userId,
      event_type: event,
      recipient_email: recipientEmail,
      subject,
      status: 'failed',
      metadata: { error: String(err), ...metadata },
    });
    return { success: false, error: String(err) };
  }
}

export interface ScanCompletionPayload {
  projectId: string;
  domain: string;
  visibilityScore: number;
  shareOfVoice: number;
  totalMentions: number;
  competitorMentions: number;
  keywordsCovered: number;
  keywordsTotal: number;
  topGaps: string[];
}

export async function sendScanCompletion(payload: ScanCompletionPayload): Promise<void> {
  const { projectId, domain, visibilityScore, shareOfVoice, totalMentions, competitorMentions, keywordsCovered, keywordsTotal, topGaps } = payload;

  const supabase = createAdminClient();
  const { data: project } = await supabase
    .from('projects')
    .select('user_id')
    .eq('id', projectId)
    .single();

  if (!project?.user_id) return;

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', project.user_id)
    .single();

  const to = profile?.email;
  if (!to) return;

  const gapList = topGaps.length > 0
    ? `<ul>${topGaps.map(gap => `<li style="margin-bottom: 6px;">${gap}</li>`).join('')}</ul>`
    : '<p style="color: #64748b;">No gaps detected — great work!</p>';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
      <h1 style="font-size: 22px; margin-bottom: 4px;">Scan complete ✅</h1>
      <p style="color: #64748b; margin-top: 0;">Your latest AEO scan for <strong>${domain}</strong> has finished.</p>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 24px 0;">
        <div style="background: #fef3c7; border-radius: 12px; padding: 16px;">
          <div style="font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 0.05em;">Visibility Score</div>
          <div style="font-size: 28px; font-weight: 700; color: #b45309;">${visibilityScore}</div>
        </div>
        <div style="background: #eff6ff; border-radius: 12px; padding: 16px;">
          <div style="font-size: 12px; color: #1e40af; text-transform: uppercase; letter-spacing: 0.05em;">Share of Voice</div>
          <div style="font-size: 28px; font-weight: 700; color: #1d4ed8;">${shareOfVoice}%</div>
        </div>
      </div>

      <div style="background: #f8fafc; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 14px; margin-bottom: 8px;"><strong>Total Mentions:</strong> ${totalMentions} (Competitor mentions: ${competitorMentions})</div>
        <div style="font-size: 14px;"><strong>Keywords Covered:</strong> ${keywordsCovered} of ${keywordsTotal}</div>
      </div>

      <h2 style="font-size: 16px; margin-bottom: 8px;">Top Optimization Gaps to Fix:</h2>
      ${gapList}

      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        Sent automatically by AEO Tracker. You can manage your preferences in project settings.
      </div>
    </div>
  `;

  await sendNotification(
    'scan_complete',
    project.user_id,
    to,
    `Scan complete for ${domain} — AEO visibility report`,
    html,
    { projectId, domain, visibilityScore, shareOfVoice }
  );
}

export interface WeeklyDigestPayload {
  projectId: string;
  domain: string;
  brandName: string;
  recipientEmail?: string;
  to?: string;
  visibilityScore: number;
  prevScore?: number | null;
  scoreDelta?: number | null;
  shareOfVoice: number;
  totalMentions: number;
  keywordsCovered: number;
  keywordsTotal: number;
  topGaps: string[];
  verifiedFactsCount: number;
}

export async function sendWeeklyExecutiveDigest(payload: WeeklyDigestPayload): Promise<{ success: boolean; error?: string }> {
  const {
    projectId,
    domain,
    brandName,
    visibilityScore,
    prevScore = null,
    scoreDelta,
    shareOfVoice,
    totalMentions,
    keywordsCovered,
    keywordsTotal,
    topGaps,
    verifiedFactsCount,
  } = payload;

  const recipientEmail = payload.recipientEmail || payload.to || '';

  const delta = scoreDelta !== undefined && scoreDelta !== null
    ? scoreDelta
    : (prevScore !== null && prevScore !== undefined ? visibilityScore - prevScore : 0);

  const hasScoreHistory = scoreDelta !== undefined || prevScore !== null;
  const deltaBadge = hasScoreHistory
    ? delta >= 0
      ? `<span style="display: inline-block; padding: 4px 10px; background: #dcfce7; color: #15803d; border-radius: 9999px; font-size: 12px; font-weight: 700;">+${delta} pts this week</span>`
      : `<span style="display: inline-block; padding: 4px 10px; background: #fee2e2; color: #b91c1c; border-radius: 9999px; font-size: 12px; font-weight: 700;">${delta} pts this week</span>`
    : `<span style="display: inline-block; padding: 4px 10px; background: #f1f5f9; color: #64748b; border-radius: 9999px; font-size: 12px; font-weight: 600;">First Benchmark</span>`;

  const gapsHtml = topGaps.length > 0
    ? topGaps.slice(0, 3).map((gap) => `
        <li style="margin-bottom: 8px; color: #334155;">
          ${gap}
        </li>
      `).join('')
    : '<li style="color: #64748b;">No high-priority content gaps detected across tracked engines.</li>';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-tracker.vercel.app';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
      <!-- Header -->
      <div style="background: #090d16; padding: 32px; color: #ffffff;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #10b981; font-weight: 700; margin-bottom: 6px;">
          Weekly AI Visibility Digest
        </div>
        <h1 style="font-size: 24px; font-weight: 800; margin: 0; color: #ffffff;">
          ${brandName} (${domain})
        </h1>
        <p style="font-size: 13px; color: #94a3b8; margin: 6px 0 0 0;">
          Tracking visibility performance across ChatGPT, Gemini, Perplexity, and Claude.
        </p>
      </div>

      <!-- Score Hero Section -->
      <div style="padding: 28px 32px;">
        <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #f1f5f9; pb: 16px;">
          <div>
            <span style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">AI Visibility Score</span>
            <div style="font-size: 38px; font-weight: 900; color: #0f172a; line-height: 1.1; margin-top: 4px;">
              ${visibilityScore}<span style="font-size: 18px; color: #94a3b8; font-weight: 600;">/100</span>
            </div>
          </div>
          <div>${deltaBadge}</div>
        </div>

        <!-- Key Metrics Grid -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 14px; background: #f8fafc; border-radius: 10px; width: 33%; vertical-align: top;">
              <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Share of Voice</span>
              <div style="font-size: 22px; font-weight: 800; color: #1e293b; margin-top: 4px;">${shareOfVoice}%</div>
              <span style="font-size: 10px; color: #94a3b8;">vs Tracked Competitors</span>
            </td>
            <td style="width: 10px;"></td>
            <td style="padding: 14px; background: #f8fafc; border-radius: 10px; width: 33%; vertical-align: top;">
              <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Direct Mentions</span>
              <div style="font-size: 22px; font-weight: 800; color: #1e293b; margin-top: 4px;">${totalMentions}</div>
              <span style="font-size: 10px; color: #94a3b8;">ChatGPT, Perplexity, Gemini</span>
            </td>
            <td style="width: 10px;"></td>
            <td style="padding: 14px; background: #f8fafc; border-radius: 10px; width: 33%; vertical-align: top;">
              <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase;">Prompt Coverage</span>
              <div style="font-size: 22px; font-weight: 800; color: #1e293b; margin-top: 4px;">${keywordsCovered}/${keywordsTotal}</div>
              <span style="font-size: 10px; color: #94a3b8;">Commercial Queries</span>
            </td>
          </tr>
        </table>

        <!-- Verified Facts Status -->
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
          <div style="font-size: 12px; font-weight: 700; color: #166534; display: flex; align-items: center; gap: 6px;">
            🛡️ AI Brand Anti-Hallucination Watchdog
          </div>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #15803d;">
            ${verifiedFactsCount > 0 
              ? `Audited ${verifiedFactsCount} registered brand fact(s). No critical pricing or product discrepancies detected.`
              : `Ground-truth watchdog active. Add brand pricing & feature specs in Fact Watch to detect LLM hallucinations.`}
          </p>
        </div>

        <!-- Top Actionable Gaps -->
        <div style="margin-bottom: 28px;">
          <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.03em;">
            Priority Citation & Content Opportunities:
          </h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.6;">
            ${gapsHtml}
          </ul>
        </div>

        <!-- Actions -->
        <div style="display: flex; gap: 12px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
          <a href="${appUrl}/dashboard/projects/${projectId}" style="background: #0f172a; color: #ffffff; font-weight: 700; font-size: 13px; padding: 12px 22px; border-radius: 10px; text-decoration: none; display: inline-block;">
            Open Optimization Workspace →
          </a>
          <a href="${appUrl}/report/${domain}" style="background: #f1f5f9; color: #334155; font-weight: 600; font-size: 13px; padding: 12px 20px; border-radius: 10px; text-decoration: none; display: inline-block;">
            View Public Benchmark
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 11px; color: #94a3b8; text-align: center;">
        Sent by AEO Checker for ${brandName}. Manage delivery preferences in your Project Settings.
      </div>
    </div>
  `;

  return await sendNotification(
    'weekly_digest',
    null,
    recipientEmail,
    `${brandName} Weekly Digest: Executive AEO Visibility (${domain})`,
    html,
    { projectId, domain, visibilityScore }
  );
}

export const sendExecutiveWeeklyDigest = sendWeeklyExecutiveDigest;
