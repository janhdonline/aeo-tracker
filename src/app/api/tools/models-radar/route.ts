import { NextRequest, NextResponse } from 'next/server';
import { FRONTIER_AI_MODELS, simulate10ModelProbe } from '@/lib/models-radar';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      totalModels: FRONTIER_AI_MODELS.length,
      operationalCount: FRONTIER_AI_MODELS.filter((m) => m.operational).length,
      models: FRONTIER_AI_MODELS,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch model radar' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain = 'example.com', query = 'Best team software solutions' } = body;

    const probeResults = simulate10ModelProbe(domain, query);

    return NextResponse.json({
      success: true,
      domain,
      query,
      probedAt: new Date().toISOString(),
      modelsProbed: probeResults.length,
      results: probeResults,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to execute model fleet probe' },
      { status: 500 }
    );
  }
}
