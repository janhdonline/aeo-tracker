import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { getEngineAdapter } from '@/lib/engines';
import { detectMentions, analyzeSentiment } from '@/lib/parser';

function interpolatePrompt(template: string, brand: string, domain: string, keyword: string): string {
  return template
    .replace(/\{\{brand\}\}/gi, brand)
    .replace(/\{brand\}/gi, brand)
    .replace(/\{\{domain\}\}/gi, domain)
    .replace(/\{domain\}/gi, domain)
    .replace(/\{\{keyword\}\}/gi, keyword)
    .replace(/\{keyword\}/gi, keyword);
}

async function executeSingleRun(
  engine: string,
  template: string,
  brandName: string,
  domain: string,
  keyword: string
) {
  const finalPrompt = interpolatePrompt(template, brandName, domain, keyword);
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

  // Estimate token usage and micro-cost
  const inputChars = finalPrompt.length;
  const outputChars = result.answerText.length;
  const approxTokens = Math.round((inputChars + outputChars) / 4);
  const approxCostUsd = Number(((approxTokens / 1000) * 0.0003).toFixed(5));

  // Determine ranking position (#1 if mentioned in first sentence/paragraph)
  const isTopMention = result.answerText.toLowerCase().indexOf(brandName.toLowerCase()) < 180;
  const rank = mentions.length > 0 ? (isTopMention ? 1 : 2) : 0;

  return {
    engine,
    latencyMs,
    promptUsed: finalPrompt,
    rawAnswer: result.answerText,
    citations: result.citations || [],
    mentionsCount: mentions.length,
    rank,
    sentiment: {
      score: sentiment.score,
      label: sentiment.sentiment,
      confidence: sentiment.confidence,
    },
    tokens: approxTokens,
    costUsd: approxCostUsd,
  };
}

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
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const {
      mode = 'single', // 'single' | 'prompt_ab' | 'engine_duel'
      brandName = 'Acme Cloud',
      domain = 'acme.com',
      keyword = 'best cloud database',
      engine = 'gemini',
      engineA = 'gemini',
      engineB = 'openai',
      promptTemplate = 'Evaluate the visibility of {{brand}} for query "{{keyword}}"',
      promptA,
      promptB,
    } = body;

    // 1. Dual Prompt A/B Test Mode
    if (mode === 'prompt_ab') {
      const templateA = promptA || promptTemplate;
      const templateB = promptB || promptTemplate;

      const [resA, resB] = await Promise.all([
        executeSingleRun(engine, templateA, brandName, domain, keyword),
        executeSingleRun(engine, templateB, brandName, domain, keyword),
      ]);

      // Calculate score for A and B
      const scoreA = resA.mentionsCount * 40 + (resA.sentiment.score || 0) * 30 + (resA.rank === 1 ? 30 : 0);
      const scoreB = resB.mentionsCount * 40 + (resB.sentiment.score || 0) * 30 + (resB.rank === 1 ? 30 : 0);

      const winner = scoreA > scoreB ? 'A' : scoreB > scoreA ? 'B' : 'Tie';

      return NextResponse.json({
        success: true,
        mode: 'prompt_ab',
        engine,
        resultA: resA,
        resultB: resB,
        winner,
        summary: `Variant ${winner === 'Tie' ? 'performance is matched' : winner + ' achieved higher brand visibility and sentiment'}`,
      });
    }

    // 2. Multi-Engine Duel Mode
    if (mode === 'engine_duel') {
      const [resA, resB] = await Promise.all([
        executeSingleRun(engineA, promptTemplate, brandName, domain, keyword),
        executeSingleRun(engineB, promptTemplate, brandName, domain, keyword),
      ]);

      return NextResponse.json({
        success: true,
        mode: 'engine_duel',
        resultA: resA,
        resultB: resB,
        summary: `Engine Duel between ${engineA.toUpperCase()} and ${engineB.toUpperCase()} complete`,
      });
    }

    // 3. Single Execution Mode (Default)
    const result = await executeSingleRun(engine, promptTemplate, brandName, domain, keyword);

    return NextResponse.json({
      success: true,
      mode: 'single',
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Save prompt to prompt_templates table
export async function PUT(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { template, purpose = 'scan', notes = 'Promoted from A/B Playground', isDefault = false } = body;

    if (!template) {
      return NextResponse.json({ error: 'template text is required' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('prompt_templates')
      .insert({
        version: 'v' + Math.floor(Date.now() / 1000),
        purpose,
        template,
        notes,
        is_default: isDefault,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Template promoted and saved to production database',
      template: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
