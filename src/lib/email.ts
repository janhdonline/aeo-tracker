import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWeeklyReport(
  to: string,
  domain: string,
  scoreDelta: number,
  topGaps: string[]
): Promise<void> {
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