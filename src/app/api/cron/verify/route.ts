export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { runVerification } from '@/lib/verification';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const adminClient = createAdminClient();
    
    // Find briefs that are 'applied' and older than 14 days
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: pendingBriefs, error: briefsError } = await adminClient
      .from('fix_briefs')
      .select('id, applied_at')
      .eq('status', 'applied')
      .gte('applied_at', fourteenDaysAgo)
      .order('applied_at', { ascending: true });
    
    if (briefsError) {
      throw briefsError;
    }
    
    if (!pendingBriefs || pendingBriefs.length === 0) {
      return NextResponse.json({ message: 'No verification runs pending', verified: 0 });
    }
    
    const results = [];
    for (const brief of pendingBriefs) {
      try {
        const result = await runVerification(brief.id);
        results.push({ briefId: brief.id, resolved: result.resolved, evidence: result.evidence });
        
        // Update brief status based on verification
        await adminClient
          .from('fix_briefs')
          .update({ status: result.resolved ? 'resolved' : 'open' })
          .eq('id', brief.id);
      } catch (error) {
        console.error(`Verification failed for brief ${brief.id}:`, error);
        results.push({ briefId: brief.id, error: String(error) });
      }
    }
    
    return NextResponse.json({ 
      message: `Verified ${results.length} briefs`,
      results 
    });
  } catch (error) {
    console.error('Cron verify error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification cron failed' },
      { status: 500 }
    );
  }
}
