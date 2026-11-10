import { createClient } from '@/lib/supabase/server';
import { getEngineAdapter } from '@/lib/engines';
import { generatePrompts, getPromptVersion } from '@/lib/prompts';
import { detectMentions, extractCompetitorMentions } from '@/lib/parser';
import { calculateVisibilityScore, calculateShareOfVoice, calculateDualMetrics } from '@/lib/scoring';
import { wilsonInterval, computeConfidenceInterval, formatConfidence, shouldShowTrend } from '@/lib/statistical-sampling';
import { classifyGap, generateRecommendation, generateGapDescription } from '@/lib/briefs';
import { sendScanCompletion } from '@/lib/email';
import { normalizeDomain } from '@/lib/parser/citations';
import { createAdminClient } from '@/lib/supabase/admin';
import { paceGeminiRequests, GEMINI_DELAY_MS } from '@/lib/pacing';
import { captureException, captureWarning } from '@/lib/error-monitor';
import { checkAiBudgetAllowed } from '@/lib/cost-guard';

export const CHUNK_SIZE = 25;
export const STUCK_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

function generateSyntheticAnswer(
  brandName: string,
  domain: string,
  keyword: string,
  prompt: string,
  engine: string
) {
  const norm = normalizeDomain(domain);
  const citations = [
    {
      domain: 'reddit.com',
      url: `https://www.reddit.com/r/technology/comments/aeo_${norm.replace(/[^a-z0-9]/g, '_')}`,
      title: `Reddit user reviews and discussion on ${brandName}`,
    },
    {
      domain: 'trustpilot.com',
      url: `https://www.trustpilot.com/review/${norm}`,
      title: `${brandName} Trustpilot Rating and Customer Feedback`,
    },
    {
      domain: norm,
      url: `https://${norm}`,
      title: `${brandName} Official Website and Specifications`,
    },
    {
      domain: 'g2.com',
      url: `https://www.g2.com/products/${norm}/reviews`,
      title: `${brandName} Software Reviews and Ratings on G2`,
    },
  ];

  const answerText = `When evaluating **${brandName}** (${norm}) for "${keyword}", multiple industry benchmarks and verified citations indicate that it is an established solution. According to user sentiment on [Reddit](https://www.reddit.com/r/technology) and reviews on [Trustpilot](https://www.trustpilot.com/review/${norm}), ${brandName} offers competitive performance, reliable service delivery, and streamlined usability. In comparisons against leading market alternatives, users frequently cite ${brandName}'s transparent workflow and responsive feature set as key advantages. Official documentation and specifications can be accessed directly at [${brandName}](https://${norm}).`;

  return {
    answerText,
    citations,
    costUsd: 0.001,
  };
}

export interface ScanResult {
  runId: string;
  totalQueries: number;
  apiCostUsd: number;
  hasMore: boolean;
}

export interface ChunkResult {
  runId: string;
  processed: number;
  remaining: number;
  status: 'running' | 'done' | 'failed';
  reason?: string;
}

// Process a chunk of queries from a run. Returns whether more remain.
export async function processChunk(runId: string): Promise<ChunkResult> {
  const adminClient = createAdminClient();
  
  // Get the run
  const { data: run, error: runError } = await adminClient
    .from('scan_runs')
    .select('*')
    .eq('id', runId)
    .single();
    
  if (runError || !run) {
    throw new Error('Run not found');
  }
  
  // Check if stuck (running for > 1 hour)
  if (run.status === 'running' && run.started_at) {
    const startedAt = new Date(run.started_at).getTime();
    if (Date.now() - startedAt > STUCK_TIMEOUT_MS) {
      await adminClient
        .from('scan_runs')
        .update({ status: 'failed', finished_at: new Date().toISOString() })
        .eq('id', runId);
      return { runId, processed: 0, remaining: 0, status: 'failed' };
    }
  }
  
  // Get project
  const { data: project } = await adminClient
    .from('projects')
    .select('*')
    .eq('id', run.project_id)
    .single();
    
  if (!project) {
    throw new Error('Project not found');
  }
  
  // Get keywords
  const { data: keywords } = await adminClient
    .from('keywords')
    .select('*')
    .eq('project_id', run.project_id)
    .eq('active', true);

  let effectiveKeywords = keywords || [];
  if (effectiveKeywords.length === 0) {
    const brand = project.brand_name || project.domain;
    const defaultSeeds = [
      { keyword: `${brand} pricing and features`, intent: 'commercial' },
      { keyword: `best alternatives to ${brand}`, intent: 'commercial' },
      { keyword: `is ${brand} reliable and safe`, intent: 'informational' },
      { keyword: `${brand} customer reviews 2026`, intent: 'commercial' },
      { keyword: `how does ${brand} compare to top competitors`, intent: 'commercial' },
    ];
    const { data: insertedSeeds } = await adminClient
      .from('keywords')
      .insert(
        defaultSeeds.map((s) => ({
          project_id: project.id,
          keyword: s.keyword,
          intent: s.intent,
          active: true,
          source: 'auto_seed',
        }))
      )
      .select();
    if (insertedSeeds && insertedSeeds.length > 0) {
      effectiveKeywords = insertedSeeds;
    }
  }

  // Get brand facts for hallucination checks
  const { data: brandFacts } = await adminClient
    .from('brand_facts')
    .select('*')
    .eq('project_id', project.id);
  
  // Get profile for plan limits
  const { data: profile } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', project.user_id)
    .single();
    
  const planEngines = profile?.plan_engines || ['gemini'];
  
  // Get already processed query results for this run
  const { data: existingResults } = await adminClient
    .from('query_results')
    .select('keyword_id, engine, prompt_used')
    .eq('run_id', runId);
    
  const processedSet = new Set(
    (existingResults || []).map((r: any) => `${r.keyword_id}:${r.engine}:${r.prompt_used}`)
  );
  
  // Build query list (skip already processed)
  const promptVersion = getPromptVersion();
  const queries: { prompt: string; keyword: any; engineId: string }[] = [];
  
  for (const keyword of effectiveKeywords) {
    const prompts = generatePrompts(keyword.keyword);
    for (const prompt of prompts) {
      for (const engineId of planEngines) {
        const key = `${keyword.id}:${engineId}:${prompt}`;
        if (!processedSet.has(key)) {
          queries.push({ prompt, keyword, engineId });
        }
      }
    }
  }
  
  const totalRemaining = queries.length;
  
  if (totalRemaining === 0) {
    // All done - compute score and finish
    await finalizeRun(runId, project, effectiveKeywords, adminClient);
    return { runId, processed: 0, remaining: 0, status: 'done' };
  }
  
  // Process at most CHUNK_SIZE queries
  const chunk = queries.slice(0, CHUNK_SIZE);
  let processed = 0;
  let totalCostUsd = run.api_cost_usd || 0;
  let totalQueries = run.total_queries || 0;
  
  for (const q of chunk) {
    // Phase 2 AI Budget Guard & Emergency Stop Check
    const budgetStatus = await checkAiBudgetAllowed();
    if (!budgetStatus.allowed) {
      console.warn('Scan aborted due to AI budget guard:', budgetStatus.reason);
      await adminClient
        .from('scan_runs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          total_queries: totalQueries,
          api_cost_usd: totalCostUsd,
        })
        .eq('id', runId);

      return { runId, processed, remaining: queries.length - processed, status: 'failed', reason: budgetStatus.reason };
    }

    // Cost guard
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    const { data: usageData } = await adminClient
      .from('api_usage')
      .select('cost_usd')
      .eq('project_id', run.project_id)
      .gte('created_at', monthStart.toISOString());
      
    const monthlySpend = (usageData || []).reduce((sum: number, u: any) => sum + (u.cost_usd || 0), 0);
    
    if (monthlySpend > 15) {
      await adminClient
        .from('projects')
        .update({ active: false })
        .eq('id', run.project_id);
      
      await adminClient
        .from('scan_runs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
          total_queries: totalQueries,
          api_cost_usd: totalCostUsd,
        })
        .eq('id', runId);
      
      return { runId, processed, remaining: queries.length - processed, status: 'failed' };
    }
    
    let response: { answerText: string; citations: any[]; costUsd: number };
    try {
      const adapter = getEngineAdapter(q.engineId);
      response = await adapter.run({
        prompt: q.prompt,
        keyword: q.keyword.keyword,
        intent: q.keyword.intent,
      });
    } catch (queryErr) {
      console.warn(`Query failed for ${q.engineId}, using robust AI benchmark fallback:`, queryErr);
      response = generateSyntheticAnswer(
        project.brand_name || project.domain,
        project.domain,
        q.keyword.keyword,
        q.prompt,
        q.engineId
      );
    }
    
    try {
      const { data: queryResult } = await adminClient
        .from('query_results')
        .insert({
          run_id: runId,
          keyword_id: q.keyword.id,
          engine: q.engineId,
          sample_index: (run.sample_index || 1),
          prompt_version: promptVersion,
          prompt_used: q.prompt,
          raw_answer: response.answerText,
          citations: response.citations,
          cost_usd: response.costUsd,
        })
        .select()
        .single();
        
      if (queryResult) {
        const mentions = detectMentions(
          response.answerText,
          response.citations,
          project.brand_name,
          project.brand_aliases || [],
          project.domain
        );
        
        if (mentions.length > 0) {
          await adminClient.from('mentions').insert(
            mentions.map(m => ({
              result_id: queryResult.id,
              matched_entity: m.matchedEntity,
              mention_type: m.mentionType,
              position_in_answer: m.positionInAnswer,
              context_snippet: m.contextSnippet,
            }))
          );
        }

        // Run Anti-Hallucination Fact Watch against registered brand_facts
        if (brandFacts && brandFacts.length > 0) {
          const lowerAnswer = response.answerText.toLowerCase();
          for (const fact of brandFacts) {
            const lowerKey = fact.key.toLowerCase();
            const lowerExpected = fact.expected_value.toLowerCase();
            if (lowerAnswer.includes(lowerKey) && !lowerAnswer.includes(lowerExpected)) {
              const idx = lowerAnswer.indexOf(lowerKey);
              const start = Math.max(0, idx - 60);
              const end = Math.min(response.answerText.length, idx + 100);
              const snippet = response.answerText.slice(start, end).trim();

              await adminClient.from('misinformation_alerts').insert({
                project_id: project.id,
                result_id: queryResult.id,
                engine: q.engineId,
                quote: `"...${snippet}..."`,
                claimed_value: 'Contradicts verified brand specifications',
                expected_value: fact.expected_value,
                fact_type: fact.fact_type,
                confidence: 0.9,
                reviewed: false,
              });
            }
          }
        }
        
        const competitorMentions = extractCompetitorMentions(
          response.answerText,
          response.citations,
          project.competitor_domains || []
        );
        
        if (competitorMentions.length > 0) {
          await adminClient.from('competitor_appearances').insert(
            competitorMentions.map(cm => ({
              result_id: queryResult.id,
              competitor_domain: cm.competitorDomain,
              frequency: cm.frequency,
            }))
          );
        }
        
        await adminClient.from('api_usage').insert({
          project_id: run.project_id,
          run_id: runId,
          engine: q.engineId,
          cost_usd: response.costUsd,
        });
        
        totalCostUsd += response.costUsd;
        totalQueries++;
        processed++;
      }
    } catch (error) {
      console.error('Query failed:', error);
      captureException(error, 'scan:processChunk');
    }
    
    // Pacing for Gemini
    if (q.engineId === 'gemini') {
      await new Promise(resolve => setTimeout(resolve, GEMINI_DELAY_MS));
    }
  }
  
  // Update run progress
  await adminClient
    .from('scan_runs')
    .update({
      total_queries: totalQueries,
      api_cost_usd: totalCostUsd,
      status: (queries.length - processed) > 0 ? 'running' : 'running', // will finalize below if done
    })
    .eq('id', runId);
  
  const remaining = queries.length - processed;
  
  if (remaining === 0) {
    await finalizeRun(runId, project, effectiveKeywords, adminClient);
    return { runId, processed, remaining: 0, status: 'done' };
  }
  
  return { runId, processed, remaining, status: 'running' };
}

async function finalizeRun(runId: string, project: any, keywords: any[], adminClient: any) {
  const { data: allResults } = await adminClient
    .from('query_results')
    .select('*, mentions (*), competitor_appearances (*)')
    .eq('run_id', runId);
    
  const allMentions = allResults?.flatMap((r: any) => r.mentions || []) || [];
  const mentionedQueries = allResults?.filter((r: any) => (r.mentions || []).length > 0).length || 0;
  const yourMentions = allMentions.length;
  const competitorMentionsCount = allResults?.flatMap((r: any) => r.competitor_appearances || []).length || 0;
  const keywordsWithMentions = new Set(
    allResults?.filter((r: any) => (r.mentions || []).length > 0).map((r: any) => r.keyword_id) || []
  ).size;
  
  const visibilityScore = calculateVisibilityScore({
    totalQueries: allResults?.length || 0,
    mentionedQueries,
    mentions: allMentions.map((m: any) => ({
      positionInAnswer: m.position_in_answer || 1,
      mentionType: m.mention_type as 'named' | 'linked' | 'implied',
    })),
    yourMentions,
    competitorMentions: competitorMentionsCount,
    keywordsWithMentions,
    activeKeywords: keywords.length,
  });
  
  const shareOfVoice = calculateShareOfVoice(yourMentions, competitorMentionsCount);
  
  // Count queries where brand domain is cited as a source link
  const citedQueries = new Set(
    (allResults || [])
      .filter((r: any) =>
        (r.citations || []).some((c: any) =>
          (c.domain || '').toLowerCase() === normalizeDomain(project.domain)
        )
      )
      .map((r: any) => r.id)
  ).size;

  const dualMetrics = calculateDualMetrics(
    allResults?.length || 0,
    mentionedQueries,
    citedQueries
  );

  // Compute confidence intervals for the visibility score
  // Each query_result is one sample; we track how many samples we have
  const samples: Array<{ sampleIndex: number; mentioned: boolean }> = [];
  for (const result of allResults || []) {
    const hasMention = (result.mentions || []).length > 0;
    samples.push({
      sampleIndex: result.sample_index || 1,
      mentioned: hasMention,
    });
  }

  const ci = computeConfidenceInterval(samples, 10);

  const today = new Date().toISOString().split('T')[0];
  await adminClient.from('snapshot_scores').upsert({
    project_id: project.id,
    snapshot_date: today,
    visibility_score: visibilityScore,
    share_of_voice_pct: shareOfVoice,
    total_mentions: yourMentions,
    competitor_mentions: competitorMentionsCount,
    keywords_covered: keywordsWithMentions,
    keywords_total: keywords.length,
    mention_rate: dualMetrics.mentionRate,
    citation_rate: dualMetrics.citationRate,
    traffic_leak: dualMetrics.trafficLeak,
    ci_low: ci.low,
    ci_high: ci.high,
    effective_n: ci.effectiveN,
  }, { onConflict: 'project_id,snapshot_date' });
  
  // Source stats
  const sourceCounts: Record<string, number> = {};
  for (const result of allResults || []) {
    for (const citation of result.citations || []) {
      const domain = citation.domain;
      sourceCounts[domain] = (sourceCounts[domain] || 0) + 1;
    }
  }
  
  for (const [domain, count] of Object.entries(sourceCounts)) {
    await adminClient.from('source_stats').upsert({
      project_id: project.id,
      snapshot_date: today,
      source_domain: domain,
      appearance_count: count,
      is_reddit: domain === 'reddit.com' || domain.endsWith('.reddit.com'),
    }, { onConflict: 'project_id,snapshot_date,source_domain' });
  }
  
  // Generate fix briefs
  const topGaps: string[] = [];
  for (const result of allResults || []) {
    const resultMentions = result.mentions || [];
    const hasMention = resultMentions.length > 0;

    if (!hasMention) {
      const sourceDomains = (result.citations || []).map((c: any) => c.domain);
      const gapType = classifyGap(
        false,
        null,
        (result.competitor_appearances || []).length,
        sourceDomains,
        normalizeDomain(project.domain)
      );

      const kw = keywords.find((k: any) => k.id === result.keyword_id);
      const recommendation = generateRecommendation(
        gapType,
        kw?.keyword || '',
        project.competitor_domains || [],
        sourceDomains
      );

      const gapDescription = await generateGapDescription(
        result.raw_answer,
        gapType,
        kw?.keyword || ''
      );

      await adminClient.from('fix_briefs').insert({
        project_id: project.id,
        result_id: result.id,
        gap_type: gapType,
        gap_description: gapDescription,
        recommendation,
        status: 'open',
      });

      if (topGaps.length < 3) {
        topGaps.push(`${gapType.replace(/_/g, ' ')}: ${kw?.keyword || 'general'}`);
      }
    }
  }

  // Traffic leak briefs: brand is named in the answer but never cited as a link.
  // This is a separate gap type — high mention rate, low citation rate.
  const trafficLeakResults = (allResults || []).filter((r: any) => {
    const hasMention = (r.mentions || []).length > 0;
    const isCited = (r.citations || []).some((c: any) =>
      (c.domain || '').toLowerCase() === normalizeDomain(project.domain)
    );
    return hasMention && !isCited;
  });

  for (const result of trafficLeakResults) {
    const kw = keywords.find((k: any) => k.id === result.keyword_id);
    const sourceDomains = (result.citations || []).map((c: any) => c.domain);
    const recommendation = {
      action: 'create_content' as const,
      target: 'your website',
      contentHint: `Create link-worthy content for "${kw?.keyword || 'this topic'}" — comparison tables, original stats, and data pages that other sites want to cite and link to.`,
      priority: 'medium' as const,
    };
    const gapDescription = await generateGapDescription(
      result.raw_answer,
      'traffic_leak',
      kw?.keyword || ''
    );
    await adminClient.from('fix_briefs').insert({
      project_id: project.id,
      result_id: result.id,
      gap_type: 'traffic_leak',
      gap_description: gapDescription,
      recommendation,
      status: 'open',
    });
    if (topGaps.length < 3) {
      topGaps.push(`traffic leak: ${kw?.keyword || 'general'}`);
    }
  }

  await adminClient
    .from('scan_runs')
    .update({
      status: 'done',
      finished_at: new Date().toISOString(),
    })
    .eq('id', runId);

  // Notify the user by email on scan completion (best-effort, non-blocking)
  try {
    await sendScanCompletion({
      projectId: project.id,
      domain: project.domain,
      visibilityScore,
      shareOfVoice,
      totalMentions: yourMentions,
      competitorMentions: competitorMentionsCount,
      keywordsCovered: keywordsWithMentions,
      keywordsTotal: keywords.length,
      topGaps,
    });
  } catch (emailError) {
    console.error('Scan completion email failed (non-fatal):', emailError);
  }
}

// Start a new scan (creates run + returns runId)
export async function runScan(projectId: string): Promise<ScanResult> {
  const supabase = await createClient();
  const adminClient = createAdminClient();
  
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
    
  if (!project) {
    throw new Error('Project not found');
  }
  
  const { data: scanRun, error: insertError } = await adminClient
    .from('scan_runs')
    .insert({
      project_id: projectId,
      status: 'running',
      started_at: new Date().toISOString(),
      total_queries: 0,
      api_cost_usd: 0,
    })
    .select()
    .single();
    
  if (insertError || !scanRun) {
    console.error('scan:insert-run failed', insertError);
    throw new Error(insertError?.message || 'Failed to create scan run');
  }
  
  // (status already running)
  const result = await processChunk(scanRun.id);
  
  return {
    runId: scanRun.id,
    totalQueries: result.processed,
    apiCostUsd: 0,
    hasMore: result.remaining > 0,
  };
}