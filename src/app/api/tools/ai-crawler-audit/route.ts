import { NextRequest, NextResponse } from 'next/server';
import { AI_CRAWLERS } from '@/lib/constants/crawlers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json();
    if (!domain) return NextResponse.json({ error: 'domain is required' }, { status: 400 });

    const d = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0];
    if (!d) return NextResponse.json({ error: 'Enter a valid domain' }, { status: 400 });

    const issues: string[] = [];
    const warnings: string[] = [];
    let robotsTxtFetched = false;
    let llmsTxtFound = false;
    let jsShellDetected = false;

    // Track status per crawler
    const crawlerResults = AI_CRAWLERS.map((c) => ({
      name: c.name,
      company: c.company,
      role: c.role,
      allowed: true,
      reason: 'Allowed by robots.txt',
    }));

    // Fetch robots.txt
    try {
      const rtRes = await fetch(`https://${d}/robots.txt`, {
        signal: AbortSignal.timeout(5000),
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      robotsTxtFetched = rtRes.ok;
      if (rtRes.ok) {
        const rt = await rtRes.text();
        const lines = rt.split('\n');

        crawlerResults.forEach((cr) => {
          let inTargetBlock = false;
          let inWildcardBlock = false;

          for (const rawLine of lines) {
            const line = rawLine.trim().toLowerCase();
            if (line.startsWith('user-agent:')) {
              const ua = line.replace('user-agent:', '').trim();
              inTargetBlock = ua === cr.name.toLowerCase() || ua.includes(cr.name.toLowerCase());
              inWildcardBlock = ua === '*';
              continue;
            }

            if (inTargetBlock && line.startsWith('disallow:')) {
              const path = line.replace('disallow:', '').trim();
              if (path === '/' || path === '/*') {
                cr.allowed = false;
                cr.reason = `Explicitly blocked in robots.txt (${cr.name})`;
                issues.push(`${cr.name} is blocked from crawling your site in robots.txt`);
              }
            } else if (inWildcardBlock && cr.allowed && line.startsWith('disallow:')) {
              const path = line.replace('disallow:', '').trim();
              if (path === '/' || path === '/*') {
                // Wildcard disallow applies if no specific rule allows
                cr.allowed = false;
                cr.reason = 'Blocked by wildcard Disallow: /';
              }
            }
          }
        });
      }
    } catch {
      warnings.push('Could not fetch robots.txt within timeout.');
    }

    // Check llms.txt
    try {
      const llmsRes = await fetch(`https://${d}/llms.txt`, { signal: AbortSignal.timeout(4000) });
      llmsTxtFound = llmsRes.ok;
    } catch { /* ignore */ }

    if (!llmsTxtFound) {
      warnings.push('No /llms.txt file detected — recommended for high-priority AI agent indexing.');
    }

    const allowedCount = crawlerResults.filter((c) => c.allowed).length;
    const blockedCount = crawlerResults.length - allowedCount;

    const accessScore = Math.round((allowedCount / crawlerResults.length) * 100);

    return NextResponse.json({
      domain: d,
      robotsTxtFetched,
      llmsTxtFound,
      jsShellDetected,
      crawlers: crawlerResults,
      totalCrawlers: crawlerResults.length,
      allowedCount,
      blockedCount,
      issues,
      warnings,
      summary: {
        score: accessScore,
        status: accessScore >= 80 ? 'pass' : accessScore >= 50 ? 'warning' : 'fail',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 });
  }
}
