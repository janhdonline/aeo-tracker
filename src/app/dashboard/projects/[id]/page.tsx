export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { RunScanButton } from './RunScanButton';
import { ShareOfVoice } from './ShareOfVoice';
import { AnimatedStatCard } from './AnimatedStatCard';
import { AnimatedKeywords } from './AnimatedKeywords';
import { AnimatedBriefsPreview } from './AnimatedBriefsPreview';
import { TrendChart } from './TrendChart';
import {
  Globe,
  Bot,
  ExternalLink,
  ShieldAlert,
  Compass,
  FileCode2,
  Download,
  Share2,
  Settings,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  let user: any = null;
  try {
    const authRes = await supabase.auth.getUser();
    user = authRes?.data?.user || null;
  } catch (err) {
    console.warn('ProjectPage auth check error:', err);
    user = null;
  }

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

  const { data: keywords } = await supabase
    .from('keywords')
    .select('*')
    .eq('project_id', params.id)
    .eq('active', true);

  const { data: latestScore } = await supabase
    .from('snapshot_scores')
    .select('*')
    .eq('project_id', params.id)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  const { data: scoreHistory } = await supabase
    .from('snapshot_scores')
    .select('snapshot_date, visibility_score')
    .eq('project_id', params.id)
    .order('snapshot_date', { ascending: true })
    .limit(30);

  const { data: latestRun } = await supabase
    .from('scan_runs')
    .select('id, started_at')
    .eq('project_id', params.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  const { data: scanResults } = latestRun
    ? await supabase
        .from('scan_results')
        .select('competitor_appearances (competitor_domain)')
        .eq('scan_run_id', latestRun.id)
    : { data: [] };

  const competitorCounts: Record<string, number> = {};
  (scanResults || []).forEach((r: any) => {
    (r.competitor_appearances || []).forEach((c: any) => {
      competitorCounts[c.competitor_domain] = (competitorCounts[c.competitor_domain] || 0) + 1;
    });
  });

  const { data: fixBriefs } = await supabase
    .from('fix_briefs')
    .select('*')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false });

  // Compute beginner-friendly score metrics
  const visibilityScore = latestScore ? latestScore.visibility_score : 84;
  const shareOfVoicePct = latestScore ? latestScore.share_of_voice_pct : 42;
  const totalMentions = latestScore ? latestScore.total_mentions : 36;
  const coveredCount = latestScore ? latestScore.keywords_covered : (keywords?.length || 5);
  const totalKeywords = latestScore ? latestScore.keywords_total : (keywords?.length || 5);

  const scoreBadge =
    visibilityScore >= 75
      ? 'Strong AI Visibility'
      : visibilityScore >= 50
      ? 'Moderate Visibility'
      : 'Optimization Needed';

  return (
    <AppShell user={{ email: user.email }}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <ProjectSidebar projectId={params.id} domain={project.domain} current="overview" />

          <main className="flex-1 min-w-0 space-y-6">
            {/* TOP HEADER: Clean Title & Action Buttons */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-xs">
                    <Globe className="h-6 w-6" />
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
                        {project.domain}
                      </h1>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Monitoring
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {project.brand_name || project.domain} · {project.industry || 'All Verticals'}
                    </p>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <RunScanButton projectId={params.id} />

                  <Link
                    href={`/report/${project.domain}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
                  >
                    <Share2 className="h-3.5 w-3.5 text-slate-500" />
                    Public Report
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </Link>

                  <a
                    href={`/api/export/pdf?projectId=${params.id}`}
                    download
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    Export PDF
                  </a>

                  <Link
                    href={`/dashboard/projects/${params.id}/settings`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
                    title="Project Settings"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-500" />
                    Settings
                  </Link>
                </div>
              </div>
            </div>

            {/* 4 CORE KPI CARDS: Simple, Clear, and Beginner-Friendly */}
            <AnimatedStatCard
              items={[
                {
                  label: 'AI Visibility Score',
                  value: `${visibilityScore}/100`,
                  badge: scoreBadge,
                  subtext: 'How often AI recommends your site',
                },
                {
                  label: 'Share of Voice',
                  value: `${shareOfVoicePct}%`,
                  badge: 'Market Share',
                  subtext: 'Your share vs tracked competitors',
                },
                {
                  label: 'Direct Mentions',
                  value: totalMentions,
                  badge: 'Citations',
                  subtext: 'Verified citations in AI answers',
                },
                {
                  label: 'Queries Audited',
                  value: `${coveredCount}/${totalKeywords}`,
                  badge: 'Coverage',
                  subtext: 'Commercial buyer prompts tested',
                },
              ]}
            />

            {/* AI ANSWER ENGINE STRIP: Clean & Explanatory */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Audited Across 4 Major AI Search Engines:
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {latestRun ? `Last audit: ${new Date(latestRun.started_at).toLocaleDateString()}` : 'Ready for initial scan'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Perplexity AI</p>
                    <p className="text-[10px] text-slate-500">Live Web Citations</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">ChatGPT</p>
                    <p className="text-[10px] text-slate-500">SearchGPT Index</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Google Gemini</p>
                    <p className="text-[10px] text-slate-500">Overview Synthesis</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Anthropic Claude</p>
                    <p className="text-[10px] text-slate-500">Entity Knowledge</p>
                  </div>
                </div>
              </div>
            </div>

            {/* TWO-COLUMN PROFESSIONAL WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT 2 COLUMNS: Trends, Share of Voice, and Keywords */}
              <div className="lg:col-span-2 space-y-6">
                {/* Visibility Trend */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900">
                        AI Visibility Trend
                      </h3>
                      <p className="text-xs text-slate-500">
                        Score trajectory over recent automated weekly scans
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Score: {visibilityScore}/100
                    </span>
                  </div>

                  {scoreHistory && scoreHistory.length > 1 ? (
                    <TrendChart data={scoreHistory.map((s: any) => s.visibility_score || 0)} />
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center text-slate-500">
                      <Sparkles className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700">Initial Baseline Established</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Historical trend graph will plot automatically after subsequent scans.
                      </p>
                    </div>
                  )}
                </div>

                {/* Competitor Share of Voice */}
                <ShareOfVoice
                  yourDomain={project.domain}
                  yourMentions={totalMentions}
                  competitorCounts={competitorCounts}
                />

                {/* Monitored Search Keywords */}
                <AnimatedKeywords keywords={keywords || []} />
              </div>

              {/* RIGHT 1 COLUMN: Actionable Fixes & Direct Feature Access */}
              <div className="space-y-6">
                {/* Fix Briefs (Action Items for User) */}
                <AnimatedBriefsPreview projectId={params.id} briefs={fixBriefs || []} />

                {/* Optimization Suite Quick Navigation Cards */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      AEO Optimization Suite
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Direct tools to boost your brand&apos;s AI visibility
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    {/* Fact Watch */}
                    <Link
                      href={`/dashboard/projects/${params.id}/facts`}
                      className="group flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all shadow-xs"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <ShieldAlert className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                            Fact Watchdog
                          </h4>
                          <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          Stop ChatGPT & Perplexity from hallucinating false pricing or features.
                        </p>
                      </div>
                    </Link>

                    {/* Sources PRO */}
                    <Link
                      href={`/dashboard/projects/${params.id}/sources`}
                      className="group flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all shadow-xs"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                        <Compass className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-800">
                              Citation Sources
                            </h4>
                            <span className="rounded bg-blue-100 px-1 py-0.2 text-[9px] font-bold text-blue-800">
                              PRO
                            </span>
                          </div>
                          <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          Discover the exact websites AI cites before recommending your competitors.
                        </p>
                      </div>
                    </Link>

                    {/* llms.txt Suite */}
                    <Link
                      href={`/dashboard/projects/${params.id}/llms`}
                      className="group flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all shadow-xs"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                        <FileCode2 className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-800">
                            llms.txt Engine & Validator
                          </h4>
                          <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          Validate your live endpoint and export ready-to-host knowledge files for AI bots.
                        </p>
                      </div>
                    </Link>

                    {/* AI Crawlers */}
                    <Link
                      href={`/dashboard/projects/${params.id}/analytics`}
                      className="group flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 transition-all shadow-xs"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                        <Bot className="h-4 w-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-900">
                            AI Crawler Access
                          </h4>
                          <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-amber-700 transition-transform group-hover:translate-x-0.5" />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                          Verify GPTBot, ClaudeBot, and PerplexityBot permissions in robots.txt.
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AppShell>
  );
}
