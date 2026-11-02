export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { processChunk } from '@/lib/scan';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const adminClient = createAdminClient();
    
    // Find runs that are 'running' (need continuation)
    const { data: runningRuns } = await adminClient
      .from('scan_runs')
      .select('id')
      .eq('status', 'running');
      
    const results = [];
    
    for (const run of runningRuns || []) {
      try {
        const result = await processChunk(run.id);
        results.push({ ...result, runId: run.id });
      } catch (error) {
        console.error(`Chunk failed for run ${run.id}:`, error);
        results.push({ runId: run.id, success: false, error: String(error) });
      }
    }
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Cron scan error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Cron scan failed' },
      { status: 500 }
    );
  }
}