import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { getEngineAdapter } from '@/lib/engines';
import { detectMentions, analyzeSentiment } from '@/lib/parser';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('prompt_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      templates: data || [],
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
    const {
      promptTemplate,
      brandName = 'Acme Cloud',
      domain = 'acme.com',
      keyword = 'best cloud database',
      engine = 'gemini',
    } = body;

    if (!promptTemplate) {
      return NextResponse.json({ error: 'promptTemplate is required' }, { status: 400 });
    }

    // Interpolate variables
    const finalPrompt = promptTemplate
      .replace(/\{\{brand\}\}/gi, brandName)
      .replace(/\{\{domain\}\}/gi, domain)
      .replace(/\{\{keyword\}\}/gi, keyword);

    const startTime = Date.now();
    const adapter = getEngineAdapter(engine);
    const result = await adapter.run({
      prompt: finalPrompt,
      keyword,
      intent: 'commercial',
    });
    const latencyMs = Date.now() - startTime;

    // Detect mentions and sentiment
    const mentions = detectMentions(result.answerText, result.citations, brandName, [], domain);
    const sentiment = await analyzeSentiment(result.answerText);

    return NextResponse.json({
      success: true,
      engine,
      latencyMs,
      promptUsed: finalPrompt,
      rawAnswer: result.answerText,
      citations: result.citations,
      mentionsCount: mentions.length,
      sentiment: {
        score: sentiment.score,
        label: sentiment.sentiment,
        confidence: sentiment.confidence,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
