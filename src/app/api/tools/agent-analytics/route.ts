import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { identifyBot, verifyBot } from '@/lib/agent-analytics';

export async function POST(request: NextRequest) {
  try {
    const { projectId, userAgent, path, referer } = await request.json();
    
    if (!projectId || !userAgent || !path) {
      return NextResponse.json({ error: 'projectId, userAgent, path required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    
    // Verify the project exists
    const { data: project } = await adminClient
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Identify and verify the bot
    const bot = identifyBot(userAgent);
    const verification = verifyBot(userAgent, referer);

    // Log the visit
    await adminClient.from('agent_visits').insert({
      project_id: projectId,
      engine: bot || 'unknown',
      path,
      user_agent: userAgent,
      is_verified: verification.isVerified,
      verified_at: verification.isVerified ? new Date().toISOString() : null,
    });

    return NextResponse.json({
      bot: bot || 'unknown',
      isVerified: verification.isVerified,
      confidence: verification.confidence,
    });
  } catch (error) {
    console.error('Agent analytics error:', error);
    return NextResponse.json({ error: 'Failed to log visit' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!projectId) {
      return NextResponse.json({ error: 'projectId required' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    
    const { data: project } = await adminClient
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .single();
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get agent visits for the period
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: visits } = await adminClient
      .from('agent_visits')
      .select('engine, path, is_verified, created_at')
      .eq('project_id', projectId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    // Get citations for correlation
    const { data: citations } = await adminClient
      .from('agent_correlation')
      .select('date, path, engine, bot_visits, citations')
      .eq('project_id', projectId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    // Aggregate by engine
    const engineStats: Record<string, { visits: number; verified: number; unverified: number }> = {};
    (visits || []).forEach((v: any) => {
      if (!engineStats[v.engine]) {
        engineStats[v.engine] = { visits: 0, verified: 0, unverified: 0 };
      }
      engineStats[v.engine].visits++;
      if (v.is_verified) engineStats[v.engine].verified++;
      else engineStats[v.engine].unverified++;
    });

    // Aggregate by path
    const pathStats: Record<string, { visits: number; citations: number }> = {};
    (visits || []).forEach((v: any) => {
      if (!pathStats[v.path]) {
        pathStats[v.path] = { visits: 0, citations: 0 };
      }
      pathStats[v.path].visits++;
    });
    (citations || []).forEach((c: any) => {
      if (!pathStats[c.path]) {
        pathStats[c.path] = { visits: 0, citations: 0 };
      }
      pathStats[c.path].citations = c.citations;
    });

    return NextResponse.json({
      engineStats,
      pathStats,
      totalVisits: visits?.length || 0,
      verifiedVisits: visits?.filter((v: any) => v.is_verified).length || 0,
      periodDays: days,
    });
  } catch (error) {
    console.error('Agent analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
