export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    let projectId = searchParams.get('projectId');

    let project: { id: string; domain: string } | null = null;

    if (projectId) {
      // Verify project belongs to user
      const { data: projData } = await supabase
        .from('projects')
        .select('id, domain')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .maybeSingle();

      project = projData;
    } else {
      // Auto-fallback to the user's most recent project
      const { data: latestProj } = await supabase
        .from('projects')
        .select('id, domain')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      project = latestProj;
      if (project) {
        projectId = project.id;
      }
    }

    // If user has no projects yet, provide a ready-to-use template CSV
    if (!project || !projectId) {
      const today = new Date().toISOString().split('T')[0];
      const templateCsv = `Domain,Date,Visibility Score,Share of Voice,Total Mentions,Competitor Mentions,Keywords Covered,Keywords Total
sample-domain.com,${today},84.0,76.2,48,12,18,20

Fix Briefs
Gap Type,Description,Status,Created At
"citation_gap","Add comparison page to capture missing citations",open,${new Date().toISOString()}
"traffic_leak","Convert named unlinked mentions into backlinked citations",open,${new Date().toISOString()}
`;
      return new NextResponse(templateCsv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="aeo-visibility-template.csv"',
        },
      });
    }

    // Get snapshot scores
    const { data: scores } = await supabase
      .from('snapshot_scores')
      .select('*')
      .eq('project_id', projectId)
      .order('snapshot_date', { ascending: true });

    // Get fix briefs
    const { data: briefs } = await supabase
      .from('fix_briefs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    // Build CSV
    let csv =
      'Date,Visibility Score,Share of Voice,Total Mentions,Competitor Mentions,Keywords Covered,Keywords Total\n';

    if (scores && scores.length > 0) {
      for (const score of scores) {
        csv += `${score.snapshot_date},${score.visibility_score},${score.share_of_voice_pct},${score.total_mentions},${score.competitor_mentions},${score.keywords_covered},${score.keywords_total}\n`;
      }
    } else {
      const today = new Date().toISOString().split('T')[0];
      csv += `${today},0,0,0,0,0,0\n`;
    }

    csv += '\n\nFix Briefs\n';
    csv += 'Gap Type,Description,Status,Created At\n';

    for (const brief of briefs || []) {
      const desc = (brief.gap_description || '').replace(/"/g, '""');
      csv += `"${brief.gap_type || ''}","${desc}",${brief.status || 'open'},${brief.created_at || ''}\n`;
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${project.domain}-report.csv"`,
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Export failed' },
      { status: 500 }
    );
  }
}
