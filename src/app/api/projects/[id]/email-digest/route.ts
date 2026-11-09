export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendExecutiveWeeklyDigest } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = params.id;
    const body = await request.json().catch(() => ({}));
    const customRecipient = body.recipientEmail?.trim();

    // Verify project ownership
    const { data: project } = await supabase
      .from('projects')
      .select('id, domain, brand_name, user_id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    const adminClient = createAdminClient();

    // Determine target recipient email
    let recipientEmail = customRecipient;
    if (!recipientEmail) {
      const { data: profile } = await adminClient
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();
      recipientEmail = profile?.email || user.email;
    }

    if (!recipientEmail) {
      return NextResponse.json(
        { error: 'No recipient email configured. Please specify an email address.' },
        { status: 400 }
      );
    }

    // Fetch latest 2 snapshot scores to calculate delta
    const { data: snapshots } = await adminClient
      .from('snapshot_scores')
      .select('visibility_score, share_of_voice_pct, total_mentions, keywords_covered, keywords_total, snapshot_date')
      .eq('project_id', projectId)
      .order('snapshot_date', { ascending: false })
      .limit(2);

    const latest = snapshots?.[0];
    const previous = snapshots?.[1];

    const currentScore = latest?.visibility_score ?? 0;
    const prevScore = previous?.visibility_score ?? currentScore;
    const scoreDelta = currentScore - prevScore;

    // Fetch brand facts count
    const { count: factsCount } = await adminClient
      .from('brand_facts')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projectId);

    // Fetch top fix briefs
    const { data: briefs } = await adminClient
      .from('fix_briefs')
      .select('gap_type, gap_description')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(3);

    const topGaps = briefs && briefs.length > 0
      ? briefs.map(b => b.gap_description || b.gap_type)
      : ['Optimize high-intent commercial prompts for AI answer engine citation.'];

    const result = await sendExecutiveWeeklyDigest({
      to: recipientEmail,
      projectId: project.id,
      domain: project.domain,
      brandName: project.brand_name || project.domain,
      visibilityScore: currentScore,
      scoreDelta,
      shareOfVoice: latest?.share_of_voice_pct ?? 0,
      totalMentions: latest?.total_mentions ?? 0,
      keywordsCovered: latest?.keywords_covered ?? 0,
      keywordsTotal: latest?.keywords_total ?? 0,
      topGaps,
      verifiedFactsCount: factsCount ?? 0,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to dispatch email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Executive AEO Digest successfully dispatched to ${recipientEmail}`,
      details: {
        recipient: recipientEmail,
        visibilityScore: currentScore,
        scoreDelta,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Email digest API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
