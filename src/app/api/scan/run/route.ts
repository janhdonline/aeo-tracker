import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { runScan, processChunk } from '@/lib/scan';
import { checkScanFrequency, checkKeywordLimit, getEffectivePlan } from '@/lib/plan';

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
    
    const admin = createAdminClient();

    // Check project ownership OR team editor/owner membership
    const { data: project, error: projectError } = await admin
      .from('projects')
      .select('id, user_id, team_id')
      .eq('id', projectId)
      .single();
      
    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    let hasAccess = project.user_id === user.id;
    if (!hasAccess && project.team_id) {
      const { data: member } = await admin
        .from('team_members')
        .select('role')
        .eq('team_id', project.team_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (member && (member.role === 'owner' || member.role === 'editor')) {
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized to run scan on this project' }, { status: 403 });
    }
    
    // Get effective plan taking into account team and grace periods
    const plan = await getEffectivePlan(user.id, projectId);
    
    // Get keyword count
    const { count: keywordCount } = await admin
      .from('keywords')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('active', true);
    
    // Check keyword limit
    const keywordCheck = checkKeywordLimit(plan, keywordCount || 0);
    if (!keywordCheck.allowed) {
      return NextResponse.json({ error: keywordCheck.reason }, { status: 403 });
    }
    
    // Check scan frequency (only against successfully completed runs)
    const { data: lastRun } = await admin
      .from('scan_runs')
      .select('started_at')
      .eq('project_id', projectId)
      .eq('status', 'done')
      .order('started_at', { ascending: false })
      .limit(1);
    
    const frequencyCheck = checkScanFrequency(plan, lastRun?.[0]?.started_at || null);
    if (!frequencyCheck.allowed) {
      return NextResponse.json({ error: frequencyCheck.reason }, { status: 403 });
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
