import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { getEngineAdapter, getAvailableEngines } from '@/lib/engines';
import { getApiKey } from '@/lib/config';

interface HealthReport {
  engine: string;
  status: 'healthy' | 'degraded' | 'down';
  latencyMs: number;
  error?: string | null;
  checkedAt: string;
}

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();

    // Fetch latest status per engine
    const { data: latestLogs, error } = await admin
      .from('engine_health_logs')
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(30);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group latest per engine
    const engines = ['gemini', 'openai', 'perplexity', 'grok'];
    const summary: Record<string, any> = {};

    for (const engine of engines) {
      const match = (latestLogs || []).find((l) => l.engine_name === engine);
      if (match) {
        summary[engine] = {
          status: match.status,
          latencyMs: match.latency_ms,
          errorMessage: match.error_message,
          checkedAt: match.checked_at,
        };
      } else {
        summary[engine] = {
          status: 'unknown',
          latencyMs: 0,
          errorMessage: 'No synthetic tests logged yet',
          checkedAt: null,
        };
      }
    }

    return NextResponse.json({
      success: true,
      summary,
      recentLogs: latestLogs || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  const engines = ['gemini', 'openai', 'perplexity', 'grok'];
  const results: HealthReport[] = [];
  const admin = createAdminClient();
  const checkedAt = new Date().toISOString();

  for (const engine of engines) {
    const startTime = Date.now();
    try {
      // Check if API key is present
      const apiKey = await getApiKey(engine);
      if (!apiKey && engine !== 'gemini') {
        const report: HealthReport = {
          engine,
          status: 'degraded',
          latencyMs: 0,
          error: 'No active API key in database',
          checkedAt,
        };
        results.push(report);
        continue;
      }

      // Execute synthetic test run
      const adapter = getEngineAdapter(engine);
      const testPromise = adapter.run({
        prompt: 'Say ping in 1 word',
        keyword: 'ping test',
        intent: 'informational',
      });

      // 10 second timeout race
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Watchdog query timeout after 10s')), 10_000)
      );

      await Promise.race([testPromise, timeoutPromise]);
      const latencyMs = Date.now() - startTime;
      const status: 'healthy' | 'degraded' = latencyMs > 6000 ? 'degraded' : 'healthy';

      results.push({
        engine,
        status,
        latencyMs,
        error: null,
        checkedAt,
      });
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      results.push({
        engine,
        status: 'down',
        latencyMs,
        error: err.message || 'Unknown engine error',
        checkedAt,
      });
    }
  }

  // Insert health records into DB
  try {
    const inserts = results.map((r) => ({
      engine_name: r.engine,
      status: r.status,
      latency_ms: r.latencyMs,
      error_message: r.error || null,
      checked_at: r.checkedAt,
    }));

    await admin.from('engine_health_logs').insert(inserts);
  } catch (logErr) {
    console.warn('Failed to insert watchdog logs:', logErr);
  }

  return NextResponse.json({
    success: true,
    results,
  });
}
