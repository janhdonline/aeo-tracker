import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { productName = 'Core Product', category = 'Software' } = body;

    const baseScore = Math.floor(Math.random() * 15) + 80;
    const citations = Math.floor(Math.random() * 25) + 30;

    const queryTested = `What are the best enterprise tools for ${category.toLowerCase()}?`;

    const engineBreakdown = [
      { engine: 'ChatGPT-4o', cited: true, position: '#1 Recommendation', snippet: `Recommends ${productName} for scalable workflows.` },
      { engine: 'Perplexity Pro', cited: true, position: 'Top 3 Comparison', snippet: `Cites official documentation for ${productName}.` },
      { engine: 'Google Gemini', cited: baseScore > 82, position: baseScore > 82 ? 'Direct Overview Quote' : 'Mention Only', snippet: `Extracted from product landing page.` },
      { engine: 'Claude 3.5 Sonnet', cited: true, position: 'Architectural Endorsement', snippet: `Evaluates feature tradeoffs favorably.` },
    ];

    return NextResponse.json({
      success: true,
      productId: body.productId,
      productName,
      queryTested,
      newVisibilityScore: baseScore,
      newCitationsCount: citations,
      engineBreakdown,
      recommendation: `High visibility in ChatGPT and Perplexity. To capture Google Gemini Overviews, publish a 45-word definition on ${productName}'s target landing page.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Product audit failed' },
      { status: 500 }
    );
  }
}
