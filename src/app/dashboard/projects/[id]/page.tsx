export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { RunScanButton } from './RunScanButton';
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
              </div>
            </div>

            {latestScore && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-500">Visibility Score</h3>
                  <p className="font-display text-3xl font-bold">{latestScore.visibility_score}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-500">Share of Voice</h3>
                  <p className="font-display text-3xl font-bold">{latestScore.share_of_voice_pct}%</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-500">Total Mentions</h3>
                  <p className="font-display text-3xl font-bold">{latestScore.total_mentions}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-500">Keywords Covered</h3>
                  <p className="font-display text-3xl font-bold">{latestScore.keywords_covered}/{latestScore.keywords_total}</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
              <h3 className="font-display text-lg font-semibold mb-4">Visibility Trend</h3>
              {scoreHistory && scoreHistory.length > 1 ? (
                <svg viewBox="0 0 300 80" className="w-full h-20">
                  {(() => {
                    const vals = scoreHistory.map((s: any) => s.visibility_score || 0);
                    const min = Math.min(...vals);
                    const max = Math.max(...vals);
                    const range = max - min || 1;
                    const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * 300},${80 - ((v - min) / range) * 70 - 5}`).join(' ');
                    return <polyline points={pts} fill="none" stroke="#eb9d2a" strokeWidth="2" />;
                  })()}
                </svg>
              ) : (
                <p className="text-sm text-slate-500">Not enough data yet.</p>
              )}
            </div>
              <div className="flex flex-wrap gap-2">
                {keywords?.map((kw) => (
                  <span key={kw.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {kw.keyword}
                  </span>
                ))}
              </div>
            </div>

            {fixBriefs && fixBriefs.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Open Fix Briefs ({fixBriefs.filter(b => b.status === 'open').length})</h3>
                <div className="space-y-2">
                  {fixBriefs.filter(b => b.status === 'open').slice(0, 5).map((brief) => (
                    <div key={brief.id} className="border-l-4 border-yellow-400 pl-4 py-2">
                      <p className="font-medium">{brief.gap_type}</p>
                      <p className="text-sm text-slate-600">{brief.gap_description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AppShell>
  );
}