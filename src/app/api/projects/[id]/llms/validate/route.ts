export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const body = await request.json().catch(() => ({}));

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('id, domain, brand_name')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Target URL to test
    let targetUrl = body.url?.trim() || `https://${project.domain}/llms.txt`;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    const startTime = Date.now();
    let response: Response | null = null;
    let fetchError: string | null = null;
    let rawContent = '';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'GPTBot/1.0 (+https://openai.com/gptbot)',
          'Accept': 'text/plain, text/markdown, text/*, */*',
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        rawContent = await response.text();
      }
    } catch (err: any) {
      fetchError = err.name === 'AbortError' ? 'Connection timed out (8s limit)' : err.message;
    }

    const latencyMs = Date.now() - startTime;

    // Checks breakdown
    const isReachable = response !== null && response.status === 200;
    const statusCode = response?.status || 0;
    const contentType = response?.headers.get('content-type') || 'unknown';
    const isPlainText = contentType.includes('text/plain') || contentType.includes('text/markdown');
    const corsHeader = response?.headers.get('access-control-allow-origin');
    const hasCors = Boolean(corsHeader && (corsHeader === '*' || corsHeader.includes(project.domain)));

    // Structural checks
    const hasH1 = /^#\s+[^\n]+/m.test(rawContent);
    const hasBlockquote = /^>\s+[^\n]+/m.test(rawContent);
    const hasSections = /^##\s+[^\n]+/m.test(rawContent);
    const linkMatches = rawContent.match(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g) || [];
    const hasLinks = linkMatches.length > 0;
    const characterCount = rawContent.length;

    // Calculate score (0 to 100)
    let score = 0;
    if (isReachable) score += 40;
    if (isPlainText) score += 20;
    if (hasH1) score += 10;
    if (hasBlockquote) score += 10;
    if (hasSections) score += 10;
    if (hasLinks) score += 10;

    const checks = [
      {
        id: 'status',
        label: 'HTTP 200 Live Status',
        passed: isReachable,
        description: isReachable
          ? `Server returned HTTP 200 OK (${latencyMs}ms latency)`
          : `Endpoint returned HTTP ${statusCode || 'Unreachable'}: ${fetchError || 'Unable to connect'}`,
        importance: 'critical',
      },
      {
        id: 'mime',
        label: 'MIME Type (text/plain)',
        passed: isPlainText,
        description: isPlainText
          ? `Serving standard Content-Type: ${contentType}`
          : `Returned Content-Type: "${contentType}". AI crawlers require text/plain or text/markdown.`,
        importance: 'high',
      },
      {
        id: 'h1',
        label: 'Brand Title (# Title)',
        passed: hasH1,
        description: hasH1
          ? 'H1 top-level brand title present'
          : 'Missing H1 heading (# Your Brand). LLMs need this to anchor domain identity.',
        importance: 'medium',
      },
      {
        id: 'summary',
        label: 'Canonical Summary Blockquote',
        passed: hasBlockquote,
        description: hasBlockquote
          ? 'Summary description blockquote present (> ...)'
          : 'Missing 1-sentence canonical description in blockquote format.',
        importance: 'medium',
      },
      {
        id: 'sections',
        label: 'Structured Categories (## Sections)',
        passed: hasSections,
        description: hasSections
          ? 'Clear categorical subheadings present (## Core Products, ## Pricing)'
          : 'No categorical H2 headings detected.',
        importance: 'low',
      },
      {
        id: 'links',
        label: 'Deep Documentation Links',
        passed: hasLinks,
        description: hasLinks
          ? `Found ${linkMatches.length} markdown citation links`
          : 'No markdown links [Title](URL) found to guide AI citation generation.',
        importance: 'medium',
      },
      {
        id: 'cors',
        label: 'CORS Headers for Browser LLMs',
        passed: hasCors,
        description: hasCors
          ? 'Access-Control-Allow-Origin header is active'
          : 'CORS header missing. Optional, but recommended for client-side AI extensions.',
        importance: 'optional',
      },
    ];

    return NextResponse.json({
      success: true,
      url: targetUrl,
      score,
      isReachable,
      statusCode,
      contentType,
      latencyMs,
      characterCount,
      checks,
      sampleSnippet: rawContent ? rawContent.slice(0, 500) : null,
      testedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('llms.txt validate error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to validate llms.txt' },
      { status: 500 }
    );
  }
}
