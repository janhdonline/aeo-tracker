import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { discoverKeywords, DiscoveryInput } from '@/lib/discovery';
import { PLAN_LIMITS } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    // Get project and verify ownership
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get profile for plan limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    const plan = (profile?.plan || 'free') as 'free' | 'starter' | 'pro';
    const limits = PLAN_LIMITS[plan];

    // Check keyword limit
    const { count: currentKeywords } = await supabase
      .from('keywords')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)
      .eq('active', true);

    if ((currentKeywords || 0) >= limits.keywords) {
      return NextResponse.json(
        { error: `Keyword limit reached for ${plan} plan (${limits.keywords} max). Upgrade to add more.` },
        { status: 400 }
      );
    }

    // Free plan: discovery allowed once per project
    if (plan === 'free') {
      const { count: existingDiscovery } = await supabase
        .from('keywords')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId)
        .eq('source', 'discovery');

      if ((existingDiscovery || 0) > 0) {
        return NextResponse.json(
          { error: 'Free plan allows only one discovery per project. Upgrade for unlimited.' },
          { status: 400 }
        );
      }
    }

    // Run discovery
    const input: DiscoveryInput = {
      industry: project.industry || 'saas',
      brandName: project.brand_name,
      competitorDomains: project.competitor_domains || [],
    };

    const discovered = await discoverKeywords(input);

    // Filter out keywords that already exist
    const { data: existingKeywords } = await supabase
      .from('keywords')
      .select('keyword')
      .eq('project_id', projectId);

    const existingSet = new Set((existingKeywords || []).map(k => k.keyword.toLowerCase()));
    const newKeywords = discovered.filter(k => !existingSet.has(k.keyword.toLowerCase()));

    if (newKeywords.length === 0) {
      return NextResponse.json({ keywords: [], message: 'All discovered keywords already exist in this project.' });
    }

    // Insert new keywords
    const adminClient = createAdminClient();
    const keywordsToInsert = newKeywords
      .slice(0, limits.keywords - (currentKeywords || 0)) // Respect limit
      .map(k => ({
        project_id: projectId,
        keyword: k.keyword,
        intent: k.intent,
        source: 'discovery' as const,
        active: true,
      }));

    const { data: inserted, error: insertError } = await adminClient
      .from('keywords')
      .insert(keywordsToInsert)
      .select();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ keywords: inserted || [] });
  } catch (error) {
    console.error('Discovery error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Discovery failed' },
      { status: 500 }
    );
  }
}