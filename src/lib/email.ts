import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';

function getResend() {
  const key = process.env.RESEND_API_KEY || (process.env.NODE_ENV === 'test' ? 're_test_key' : null);
  if (!key) return null;
  return new Resend(key);
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

  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured. Skipping scan completion email.');
    return;
  }

  try {
    await resend.emails.send({
      from: 'AEO Tracker <reports@aeotracker.com>',
      to,
      subject: `Scan complete for ${domain} — AEO visibility report`,
      html: `
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
            <div style="background: #f1f5f9; border-radius: 12px; padding: 16px;">
              <div style="font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Total Mentions</div>
              <div style="font-size: 28px; font-weight: 700; color: #334155;">${totalMentions}</div>
            </div>
            <div style="background: #f1f5f9; border-radius: 12px; padding: 16px;">
              <div style="font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.05em;">Keywords Covered</div>
              <div style="font-size: 28px; font-weight: 700; color: #334155;">${keywordsCovered}/${keywordsTotal}</div>
            </div>
          </div>

          <h3 style="font-size: 16px; margin-bottom: 8px;">Top Gaps to Address</h3>
          ${gapList}

          <p style="margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/projects/${projectId}" style="background: #eb9d2a; color: #fff; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              View full dashboard →
            </a>
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send scan completion email:', error);
  }
}

export async function sendWeeklyReport(
  to: string,
  domain: string,
  scoreDelta: number,
  topGaps: string[]
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured. Skipping scan completion email.');
    return;
  }

  try {
    await resend.emails.send({
      from: 'AEO Tracker <reports@aeotracker.com>',
      to,
      subject: `Weekly AEO Report for ${domain}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Weekly AEO Visibility Report</h1>
          <h2>${domain}</h2>
          <p>Your visibility score changed by <strong>${scoreDelta > 0 ? '+' : ''}${scoreDelta}</strong> points this week.</p>
          <h3>Top 3 Gaps to Address:</h3>
          <ul>
            ${topGaps.map(gap => `<li>${gap}</li>`).join('')}
          </ul>
          <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View full dashboard →</a></p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Failed to send weekly report:', error);
  }
}