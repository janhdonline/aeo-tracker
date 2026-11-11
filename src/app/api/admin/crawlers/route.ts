import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();

    // 1. Fetch Recent Agent Crawler Visits
    const { data: visits, error: visitErr } = await admin
      .from('agent_visits')
      .select('id, project_id, engine, path, user_agent, is_verified, verified_at, created_at')
      .order('created_at', { ascending: false })
      .limit(60);

    if (visitErr) throw visitErr;

    // 2. Fetch Projects for Domain Map
    const { data: projects } = await admin
      .from('projects')
      .select('id, domain, name');

    const projectMap: Record<string, string> = {};
    for (const p of projects || []) {
      projectMap[p.id] = p.domain;
    }

    const visitList = visits || [];
    const botCounts: Record<string, number> = {
      gptbot: 0,
      claudebot: 0,
      perplexitybot: 0,
      googleExtended: 0,
      other: 0,
    };

    let verifiedCount = 0;

    for (const v of visitList) {
      if (v.is_verified) verifiedCount++;
      const ua = (v.user_agent || v.engine || '').toLowerCase();
      if (ua.includes('gptbot') || ua.includes('chatgpt')) {
        botCounts.gptbot++;
      } else if (ua.includes('claudebot') || ua.includes('claude')) {
        botCounts.claudebot++;
      } else if (ua.includes('perplexity')) {
        botCounts.perplexitybot++;
      } else if (ua.includes('google-extended') || ua.includes('googlebot')) {
        botCounts.googleExtended++;
      } else {
        botCounts.other++;
      }
    }

    const verifiedRate = visitList.length > 0
      ? Math.round((verifiedCount / visitList.length) * 100)
      : 100;

    const enrichedVisits = visitList.map((v) => ({
      ...v,
      targetDomain: projectMap[v.project_id] || 'aeo-tracker.com',
    }));

    return NextResponse.json({
      success: true,
      visits: enrichedVisits,
      stats: {
        totalVisits: visitList.length,
        verifiedVisits: verifiedCount,
        verifiedRatePct: verifiedRate,
        botDistribution: botCounts,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
