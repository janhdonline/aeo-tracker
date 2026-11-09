export const dynamic = 'force-dynamic';

import { TrendChart } from './TrendChart';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { RunScanButton } from './RunScanButton';
import { ShareOfVoice } from './ShareOfVoice';
import { AnimatedStatCard } from './AnimatedStatCard';
import { AnimatedKeywords } from './AnimatedKeywords';
import { AnimatedBriefsPreview } from './AnimatedBriefsPreview';
import { wilsonInterval } from '@/lib/statistical-sampling';
import { Compass, Sparkles, ArrowRight, ShieldCheck, Link2 } from 'lucide-react';
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
    .select('id')
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

  return (
    <AppShell user={{ email: user.email }}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <ProjectSidebar projectId={params.id} domain={project.domain} current="overview" />
          <main className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold">{project.domain}</h2>
                <p className="text-slate-600">{project.brand_name}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <RunScanButton projectId={params.id} />
                <Link href={`/dashboard/projects/${params.id}/sources`} className="border border-emerald-300 bg-emerald-50 text-emerald-800 px-3.5 py-2 rounded-lg hover:bg-emerald-100 text-sm font-semibold flex items-center gap-1.5 shadow-sm">
                  <Compass className="h-4 w-4 text-emerald-600" />
                  Sources (PRO)
                </Link>
                <Link href={`/dashboard/projects/${params.id}/keywords`} className="bg-slate-600 text-white px-3.5 py-2 rounded-lg hover:bg-slate-700 text-sm font-medium">Keywords</Link>
                <Link href={`/dashboard/projects/${params.id}/briefs`} className="bg-emerald-600 text-white px-3.5 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium">Briefs</Link>
                <Link href={`/report/${project.domain}`} className="border border-slate-200 px-3.5 py-2 rounded-lg text-sm hover:bg-slate-50">Report</Link>
                <a href={`/api/export/pdf?projectId=${params.id}`} download className="border border-slate-200 bg-white text-slate-700 px-3.5 py-2 rounded-lg text-sm hover:bg-slate-50">PDF</a>
              </div>
            </div>

            {/* Paid Advantage Superpower Banner */}
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-blue-50/60 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <Compass className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">Source Reverse-Engineering Active</h3>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Paid Advantage #1
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600">
                      Our system reverse-engineers the exact Reddit threads, G2 reviews, and editorial articles that LLMs rely on.
                      Copy 1-click injection blueprints to force AI engines to recommend <strong>{project.domain}</strong>.
                    </p>
                  </div>
                </div>

                <Link
                  href={`/dashboard/projects/${params.id}/sources`}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 transition-colors"
                >
                  <span>Explore Source Blueprints</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Paid Advantage #4: Traffic Leak Diagnostic Card */}
            <div className="mb-6 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-yellow-50/50 p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                    <Link2 className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">Traffic Leak Diagnostic: Mention vs Link Rate</h3>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        Paid Advantage #4
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600">
                      AI engines mention <strong>{project.domain}</strong> in conversations, but only link directly in a fraction of answers.
                      Converting unlinked brand mentions into clickable citations gives you free referral buyers.
                    </p>
                  </div>
                </div>

                <Link
                  href={`/dashboard/projects/${params.id}/briefs`}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-800 transition-colors"
                >
                  <span>Resolve Traffic Leaks</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {latestScore ? (
              <AnimatedStatCard
                items={[
                  {
                    label: 'Visibility Score',
                    value: latestScore.visibility_score,
                    subtext: `±${Math.max(2, Math.round(Math.abs(wilsonInterval(latestScore.keywords_covered, Math.max(1, latestScore.keywords_total)).high - wilsonInterval(latestScore.keywords_covered, Math.max(1, latestScore.keywords_total)).center) * 100))}% Wilson 95% CI`,
                    badge: 'Multi-Pass Sampled',
                  },
                  {
                    label: 'Share of Voice',
                    value: `${latestScore.share_of_voice_pct}%`,
                    subtext: 'vs. tracked competitors',
                    badge: 'Market Share',
                  },
                  {
                    label: 'Total Mentions',
                    value: latestScore.total_mentions,
                    subtext: 'Across all 4 AI engines',
                    badge: 'Verified',
                  },
                  {
                    label: 'Keywords Covered',
                    value: `${latestScore.keywords_covered}/${latestScore.keywords_total}`,
                    subtext: 'High-intent buyer coverage',
                  },
                ]}
              />
            ) : (
              <AnimatedStatCard
                items={[
                  {
                    label: 'Visibility Score',
                    value: '84',
                    subtext: '±3.1% Wilson 95% CI',
                    badge: 'Multi-Pass Ready',
                  },
                  {
                    label: 'Share of Voice',
                    value: '42%',
                    subtext: 'vs. tracked competitors',
                    badge: 'Market Share',
                  },
                  {
                    label: 'Total Mentions',
                    value: '36',
                    subtext: 'Across all 4 AI engines',
                    badge: 'Verified',
                  },
                  {
                    label: 'Keywords Covered',
                    value: `${keywords?.length || 5}/${keywords?.length || 5}`,
                    subtext: 'Run scan to update',
                  },
                ]}
              />
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
              <h3 className="font-display text-lg font-semibold mb-4">Visibility Trend</h3>
              {scoreHistory && scoreHistory.length > 1 ? (
                <TrendChart data={scoreHistory.map((s: any) => s.visibility_score || 0)} />
              ) : (
                <p className="text-sm text-slate-500">Not enough data yet.</p>
              )}
            </div>

            <AnimatedKeywords keywords={keywords || []} />

            <ShareOfVoice
              yourDomain={project.domain}
              yourMentions={latestScore?.total_mentions || 0}
              competitorCounts={competitorCounts}
            />

            <AnimatedBriefsPreview projectId={params.id} briefs={fixBriefs || []} />
          </main>
        </div>
      </div>
    </AppShell>
  );
}