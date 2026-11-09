export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { SourceIntelligenceManager } from './SourceIntelligenceManager';
import {
  categorizeSourceDomain,
  generateInjectionBlueprint,
  type SourceIntelligenceItem,
} from '@/lib/source-intelligence';
import Link from 'next/link';
import { ArrowLeft, Compass, Sparkles } from 'lucide-react';

export default async function SourcesPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!project) {
    redirect('/dashboard');
  }

  // Fetch real recorded source stats from database
  const { data: sourceStats } = await supabase
    .from('source_stats')
    .select('*')
    .eq('project_id', params.id)
    .order('appearance_count', { ascending: false })
    .limit(30);

  // Fetch keywords for context
  const { data: keywords } = await supabase
    .from('keywords')
    .select('keyword')
    .eq('project_id', params.id)
    .limit(5);

  const primaryKeyword = keywords?.[0]?.keyword || 'AEO & AI Search';

  // Format sources or provide contextual defaults if project is brand new
  let items: SourceIntelligenceItem[] = [];

  if (sourceStats && sourceStats.length > 0) {
    items = sourceStats.map((s, index) => {
      const { category, label } = categorizeSourceDomain(s.source_domain);
      const blueprint = generateInjectionBlueprint(
        s.source_domain,
        project.brand_name || project.domain,
        project.domain,
        primaryKeyword,
        'Top Competitors'
      );

      return {
        id: `source-${s.id || index}`,
        domain: s.source_domain,
        category,
        categoryLabel: label,
        appearanceCount: s.appearance_count || 1,
        engineInfluenced: ['ChatGPT', 'Perplexity', 'Gemini'],
        competitorBeneficiary: 'Competitor Brand',
        influenceScore: Math.min(95, 60 + (s.appearance_count || 1) * 6),
        whyAiCitedReason: `AI engines scraped this source to evaluate authority, user trust signals, and comparison recommendations for "${primaryKeyword}".`,
        injectionBlueprint: blueprint,
      };
    });
  } else {
    // High-value realistic source reverse-engineering templates based on domain
    const seedSources = [
      { domain: 'reddit.com/r/SaaS', count: 18, competitor: 'Semrush & Ahrefs' },
      { domain: 'g2.com/categories/seo', count: 14, competitor: 'Surfer SEO' },
      { domain: 'techcrunch.com', count: 8, competitor: 'BrightEdge' },
      { domain: 'news.ycombinator.com', count: 6, competitor: 'OpenAI Tools' },
      { domain: 'quora.com', count: 5, competitor: 'MarketMuse' },
    ];

    items = seedSources.map((seed, index) => {
      const { category, label } = categorizeSourceDomain(seed.domain);
      const blueprint = generateInjectionBlueprint(
        seed.domain,
        project.brand_name || project.domain,
        project.domain,
        primaryKeyword,
        seed.competitor
      );

      return {
        id: `seed-${index}`,
        domain: seed.domain,
        category,
        categoryLabel: label,
        appearanceCount: seed.count,
        engineInfluenced: ['ChatGPT', 'Perplexity', 'Gemini', 'Grok'],
        competitorBeneficiary: seed.competitor,
        influenceScore: 92 - index * 6,
        whyAiCitedReason: `LLM synthetic answers quote ${seed.domain} when answering buyer prompts for "${primaryKeyword}". Competitors currently dominate these specific threads and reviews.`,
        injectionBlueprint: blueprint,
      };
    });
  }

  return (
    <AppShell user={{ email: user.email }}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          <ProjectSidebar projectId={params.id} domain={project.domain} current="sources" />

          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/dashboard/projects/${params.id}`}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Overview
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Paid Power Feature
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Source Reverse-Engineering
                  </h1>
                  <p className="text-sm text-slate-600 mt-0.5">
                    See the exact external sources (Reddit, G2, Blogs) feeding AI recommendations for{' '}
                    <strong>{project.domain}</strong> and copy 1-click injection blueprints to reclaim citations.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/projects/${params.id}/briefs`}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
                  >
                    View Fix Briefs
                  </Link>
                </div>
              </div>
            </div>

            {/* Manager */}
            <SourceIntelligenceManager
              projectId={params.id}
              domain={project.domain}
              brandName={project.brand_name || project.domain}
              sources={items}
            />
          </main>
        </div>
      </div>
    </AppShell>
  );
}
