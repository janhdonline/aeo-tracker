import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runScan, processChunk } from '@/lib/scan';
import { checkScanFrequency, checkKeywordLimit, checkEngineAccess } from '@/lib/plan';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { projectId, runId } = body;
    
    // If runId provided, continue an existing run (chunk)
    if (runId) {
      const result = await processChunk(runId);
      return NextResponse.json(result);
    }
    
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }
    
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();
      
    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Get user profile for plan
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, plan_keywords_limit, plan_engines')
      .eq('id', user.id)
      .single();
    
    const plan = profile?.plan || 'free';
    
    // Get keyword count
    const { count: keywordCount } = await supabase
      .from('keywords')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('active', true);
    
    // Check keyword limit
    const keywordCheck = checkKeywordLimit(plan as 'free' | 'starter' | 'pro', keywordCount || 0);
    if (!keywordCheck.allowed) {
      return NextResponse.json({ error: keywordCheck.reason }, { status: 403 });
    }
    
    // Check scan frequency
    const { data: lastRun } = await supabase
      .from('scan_runs')
      .select('started_at')
      .eq('project_id', projectId)
      .order('started_at', { ascending: false })
      .limit(1);
    
    const frequencyCheck = checkScanFrequency(plan as 'free' | 'starter' | 'pro', lastRun?.[0]?.started_at || null);
    if (!frequencyCheck.allowed) {
      return NextResponse.json({ error: frequencyCheck.reason }, { status: 403 });
    }
    
    // Check engine access (will be enforced in scan.ts too, but check early)
    const { data: keywords } = await supabase
      .from('keywords')
      .select('id')
      .eq('project_id', projectId)
      .eq('active', true);
    
    const planEngines = profile?.plan_engines || ['gemini'];
    if (planEngines.length === 0) {
      return NextResponse.json({ error: 'No engines available for your plan' }, { status: 403 });
    }
    
    const result = await runScan(projectId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Scan error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scan failed' },
      { status: 500 }
    );
  }
}
