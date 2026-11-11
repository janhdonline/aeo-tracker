import { NextRequest, NextResponse } from 'next/server';
import { evaluateAnswerability } from '@/lib/answerability';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain') || 'notion.so';
  const text = searchParams.get('text') || '';

  const result = evaluateAnswerability(domain, text);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { domain = 'notion.so', text = '', url = '' } = body;

    let contentToAnalyze = text;

    // If URL is passed and text is empty, attempt to fetch live HTML
    if (url && !text) {
      try {
        const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
        const res = await fetch(cleanUrl, {
          signal: AbortSignal.timeout(4000),
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AEOAnswerabilityBot/1.0)' },
        });
        if (res.ok) {
          const html = await res.text();
          const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
          if (match && match[1]) {
            contentToAnalyze = match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          }
        }
      } catch {
        // Fallback to default
      }
    }

    const result = evaluateAnswerability(domain, contentToAnalyze);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to analyze answerability' }, { status: 500 });
  }
}
