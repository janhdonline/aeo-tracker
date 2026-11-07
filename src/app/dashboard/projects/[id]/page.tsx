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
import Link from 'next/link';

export default async function ProjectPage({ params }: { params: { id: string } }) {
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
        <div className="flex gap-6">
          <ProjectSidebar projectId={params.id} domain={project.domain} current="overview" />
          <main className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold">{project.domain}</h2>
                <p className="text-slate-600">{project.brand_name}</p>
              </div>
              <div className="flex gap-2">
                <RunScanButton projectId={params.id} />
                <Link href={`/dashboard/projects/${params.id}/keywords`} className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 text-sm font-medium">Keywords</Link>
                <Link href={`/dashboard/projects/${params.id}/briefs`} className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium">Briefs</Link>
                <Link href={`/report/${project.domain}`} className="border border-slate-200 px-4 py-2 rounded-lg text-sm hover:bg-slate-50">Report</Link>
                <a href={`/api/export/pdf?projectId=${params.id}`} download className="border border-emerald-300 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm hover:bg-emerald-100">Export PDF</a>
              </div>
            </div>

            {latestScore && (
              <AnimatedStatCard
                items={[
                  { label: 'Visibility Score', value: latestScore.visibility_score },
                  { label: 'Share of Voice', value: `${latestScore.share_of_voice_pct}%` },
                  { label: 'Total Mentions', value: latestScore.total_mentions },
                  { label: 'Keywords Covered', value: `${latestScore.keywords_covered}/${latestScore.keywords_total}` },
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