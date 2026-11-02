export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }
    
    // Verify project belongs to user
    const { data: project } = await supabase
      .from('projects')
      .select('id, domain')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();
      
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
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
    let csv = 'Date,Visibility Score,Share of Voice,Total Mentions,Competitor Mentions,Keywords Covered,Keywords Total\n';
    
    for (const score of scores || []) {
      csv += `${score.snapshot_date},${score.visibility_score},${score.share_of_voice_pct},${score.total_mentions},${score.competitor_mentions},${score.keywords_covered},${score.keywords_total}\n`;
    }
    
    csv += '\n\nFix Briefs\n';
    csv += 'Gap Type,Description,Status,Created At\n';
    
    for (const brief of briefs || []) {
      csv += `"${brief.gap_type}","${brief.gap_description.replace(/"/g, '""')}",${brief.status},${brief.created_at}\n`;
    }
    
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
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