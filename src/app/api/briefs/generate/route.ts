import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const { data: project } = await supabase
      .from('projects')
      .select('id, domain, brand_name')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const adminClient = createAdminClient();
    const brand = project.brand_name || project.domain;

    const initialBriefs = [
      {
        project_id: projectId,
        gap_type: 'traffic_leak',
        gap_description: `AI search engines mention ${brand} in answers without rendering a direct hyperlinked citation.`,
        recommendation: {
          action: 'create_content',
          target: 'documentation and pricing table',
          content_hint: `Publish clear, machine-readable specifications and comparison tables on ${project.domain} to convert plain-text model mentions into high-value referral buyer clicks.`,
          priority: 'high',
        },
        status: 'open',
      },
      {
        project_id: projectId,
        gap_type: 'source_gap',
        gap_description: `Competitors dominate Reddit and software review directories where LLMs source real-time opinions.`,
        recommendation: {
          action: 'infiltrate_sources',
          target: 'community discussions',
          content_hint: `Deploy verified responses and solution comparisons across Reddit discussions and directory categories where buyers evaluate ${brand}.`,
          priority: 'medium',
        },
        status: 'open',
      },
      {
        project_id: projectId,
        gap_type: 'weak_position',
        gap_description: `Missing official /llms.txt truth registry for automated AI crawler ingestion.`,
        recommendation: {
          action: 'technical_seo',
          target: `${project.domain}/llms.txt`,
          content_hint: `Host an authoritative /llms.txt file detailing exact pricing, core capabilities, and verified features to eliminate model hallucinations.`,
          priority: 'high',
        },
        status: 'open',
      },
    ];

    const { data: inserted, error: insertError } = await adminClient
      .from('fix_briefs')
      .insert(initialBriefs)
      .select();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      briefs: inserted,
    });
  } catch (error: any) {
    console.error('Generate briefs error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate briefs' },
      { status: 500 }
    );
  }
}
