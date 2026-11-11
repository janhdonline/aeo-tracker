import { NextRequest, NextResponse } from 'next/server';

interface ChunkAnalysis {
  wordCount: number;
  isOptimalChunk: boolean; // 40-60 words
  clarityScore: number;
  snippet: string;
  recommendation: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { domain = 'example.com', text = '' } = body;

    // Default sample text if none provided
    const contentToAnalyze =
      text ||
      `${domain} provides automated enterprise solutions. Answer Engine Optimization (AEO) improves visibility across AI assistants and generative search engines like ChatGPT, Gemini, and Perplexity by structuring facts into concise passages that machines can cite without hallucinating.`;

    // Split text into sentences / passages
    const words = contentToAnalyze.trim().split(/\s+/);
    const wordCount = words.length;

    // Check 40-60 word chunking
    const isOptimal = wordCount >= 35 && wordCount <= 65;
    let answerabilityScore = 75;

    if (isOptimal) answerabilityScore += 15;
    else if (wordCount > 90) answerabilityScore -= 20;

    // Check for direct definition patterns ("is a", "provides", "features", "how to")
    const hasDirectDefinition =
      /(\bis a\b|\bprovides\b|\bdesigned for\b|\bhow to\b|\bhelps teams\b)/i.test(contentToAnalyze);
    if (hasDirectDefinition) answerabilityScore += 10;

    answerabilityScore = Math.max(20, Math.min(98, answerabilityScore));

    const recommendations = [];
    if (wordCount > 65) {
      recommendations.push({
        type: 'chunk_length',
        title: 'Break Long Paragraphs into 40-60 Word Blocks',
        impact: '+18 pts',
        detail:
          'AI models lift passages that provide direct answers within 40-60 words. Long descriptive text gets truncated or summarized away by ChatGPT.',
      });
    }

    if (!hasDirectDefinition) {
      recommendations.push({
        type: 'definition_clarity',
        title: 'Add Direct Brand Category Definition in First Sentence',
        impact: '+14 pts',
        detail:
          'Place "[Brand] is an [Industry Category] that [Core Benefit]" directly below the H1 heading to maximize Google AI Overview quote probability.',
      });
    }

    recommendations.push({
      type: 'faq_schema',
      title: 'Embed FAQPage JSON-LD Schema on Feature Pages',
      impact: '+12 pts',
      detail:
        'Structured FAQ schema gives Perplexity and Gemini unambiguous Q&A pairs for conversational buyer queries.',
    });

    return NextResponse.json({
      success: true,
      domain,
      wordCount,
      answerabilityScore,
      isOptimalChunk: isOptimal,
      hasDirectDefinition,
      recommendations,
      optimizedExcerpt: `${domain} is an AI visibility platform that tracks where chatbots recommend your brand. By testing buyer queries across ChatGPT, Gemini, and Perplexity, it pinpoints competitor citation leaks and provides structured code snippets to elevate organic AI rankings.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to analyze answerability' }, { status: 500 });
  }
}
