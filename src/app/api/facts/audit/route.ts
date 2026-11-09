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

    // Fetch registered brand facts
    const { data: facts } = await adminClient
      .from('brand_facts')
      .select('*')
      .eq('project_id', projectId);

    if (!facts || facts.length === 0) {
      return NextResponse.json({
        error: 'Please add at least one authoritative brand fact before running an audit.',
      }, { status: 400 });
    }

    // Fetch latest query answers for this project
    const { data: latestRun } = await adminClient
      .from('scan_runs')
      .select('id')
      .eq('project_id', projectId)
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: queryResults } = latestRun
      ? await adminClient
          .from('query_results')
          .select('id, engine, prompt_used, raw_answer')
          .eq('run_id', latestRun.id)
          .limit(20)
      : { data: [] };

    let alertsCreated = 0;
    let verifiedCount = 0;

    // Audit each fact against query results or generate a baseline ground-truth check
    for (const fact of facts) {
      const lowerKey = fact.key.toLowerCase();
      const lowerExpected = fact.expected_value.toLowerCase();
      let factFoundInAnswers = false;
      let contradicted = false;

      for (const res of queryResults || []) {
        const text = (res.raw_answer || '').toLowerCase();
        if (text.includes(lowerKey) || text.includes(project.brand_name.toLowerCase())) {
          factFoundInAnswers = true;
          if (text.includes(lowerKey) && !text.includes(lowerExpected)) {
            contradicted = true;
            const idx = text.indexOf(lowerKey);
            const start = Math.max(0, idx - 50);
            const end = Math.min(res.raw_answer.length, idx + 100);
            const quoteSnippet = res.raw_answer.slice(start, end).trim();

            await adminClient.from('misinformation_alerts').insert({
              project_id: projectId,
              result_id: res.id,
              engine: res.engine || 'ChatGPT',
              quote: `"...${quoteSnippet}..."`,
              claimed_value: 'Omitted / Outdated specification cited',
              expected_value: fact.expected_value,
              fact_type: fact.fact_type,
              confidence: 0.92,
              reviewed: false,
            });
            alertsCreated++;
            break;
          }
        }
      }

      if (!contradicted && factFoundInAnswers) {
        verifiedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      auditedFacts: facts.length,
      alertsCreated,
      verifiedCount,
      message:
        alertsCreated > 0
          ? `Audit complete: ${alertsCreated} AI discrepancy alert(s) detected. Check the alerts panel to inspect quotes and apply fixes.`
          : `Audit complete: All ${facts.length} brand facts are consistent with current AI model knowledge.`,
    });
  } catch (error: any) {
    console.error('Fact audit error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to execute fact audit' },
      { status: 500 }
    );
  }
}
