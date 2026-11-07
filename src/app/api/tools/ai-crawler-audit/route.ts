import { NextRequest, NextResponse } from 'next/server';

const AI_CRAWLERS = [
  { name: 'GPTBot', userAgent: 'Mozilla/5.0 (compatible; GPTBot/0.1; +https://openai.com/gptbot)' },
  { name: 'ClaudeBot', userAgent: 'Mozilla/5.0 (compatible; ClaudeBot/0.1; +https://claude.ai/claudebot)' },
  { name: 'PerplexityBot', userAgent: 'Mozilla/5.0 (compatible; PerplexityBot/0.1)' },
  { name: 'CCBot', userAgent: 'CCBot/2.0 (https://commoncrawl.org/faq)' },
  { name: 'Google-Extended', userAgent: 'Mozilla/5.0 (compatible; Google-Extended/0.1)' },
];

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

    // Fetch robots.txt
    try {
      const rtRes = await fetch(`https://${d}/robots.txt`, { signal: AbortSignal.timeout(5000) });
      robotsTxtFetched = rtRes.ok;
      if (rtRes.ok) {
        const rt = await rtRes.text();
        for (const ai of AI_CRAWLERS) {
          const lines = rt.split('\n');
          let inBlock = false;
          for (const line of lines) {
            const t = line.trim().toLowerCase();
            if (t.startsWith('user-agent:')) {
              inBlock = t.includes(ai.name.toLowerCase());
              continue;
            }
            if (inBlock && t.startsWith('disallow:') && (t === 'disallow:/' || t === 'disallow:')) {
              issues.push(`${ai.name} is blocked from your site by robots.txt`);
            }
          }
        }
      }
    } catch { /* ignore */ }

    // Fetch homepage with normal UA
    let normalTextLen = 0;
    try {
      const normalRes = await fetch(`https://${d}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
        signal: AbortSignal.timeout(10000),
        redirect: 'follow',
      });
      const html = await normalRes.text();
      normalTextLen = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length;
    } catch { /* ignore */ }

    // Fetch homepage with GPTBot UA
    let botTextLen = 0;
    try {
      const botRes = await fetch(`https://${d}`, {
        headers: { 'User-Agent': AI_CRAWLERS[0].userAgent },
        signal: AbortSignal.timeout(10000),
        redirect: 'follow',
      });
      const html = await botRes.text();
      botTextLen = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length;
    } catch { /* ignore */ }

    if (normalTextLen > 0 && botTextLen / normalTextLen < 0.4) {
      jsShellDetected = true;
      issues.push(`JS Shell: Bot sees only ${Math.round((botTextLen / normalTextLen) * 100)}% of human-visible text`);
    }

    // Check llms.txt
    try {
      const llmsRes = await fetch(`https://${d}/llms.txt`, { signal: AbortSignal.timeout(5000) });
      llmsTxtFound = llmsRes.ok;
    } catch { /* ignore */ }
    if (!llmsTxtFound) {
      warnings.push('No llms.txt found — consider adding one for better AI agent discoverability.');
    }

    const score = Math.max(0, 100 - issues.length * 20 - (jsShellDetected ? 30 : 0) - (!llmsTxtFound ? 10 : 0) - (!robotsTxtFetched ? 10 : 0));

    return NextResponse.json({
      domain: d,
      robotsTxtFetched,
      llmsTxtFound,
      jsShellDetected,
      issues,
      warnings,
      summary: { score: Math.max(0, score), status: score >= 70 ? 'pass' : score >= 40 ? 'warning' : 'fail' },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Audit failed' }, { status: 500 });
  }
}
