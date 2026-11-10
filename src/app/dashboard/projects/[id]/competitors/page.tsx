export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { CompetitorsManager } from './CompetitorsManager';
import Link from 'next/link';

export default async function CompetitorsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  let user: any = null;
  try {
    const authRes = await supabase.auth.getUser();
    user = authRes?.data?.user || null;
  } catch (err) {
    console.warn('CompetitorsPage auth check error:', err);
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

  const { data: latestScore } = await supabase
    .from('snapshot_scores')
    .select('total_mentions')
    .eq('project_id', params.id)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

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

  return (
    <AppShell
      user={{ email: user.email, id: user.id }}
      projectId={params.id}
      domain={project.domain}
      activeSection="competitors"
      breadcrumbs={[
        { label: project.domain, href: `/dashboard/projects/${params.id}` },
        { label: 'Competitor Landscape' },
      ]}
    >
      <div className="w-full px-6 sm:px-8 py-6 space-y-6">
        <ProjectSidebar projectId={params.id} domain={project.domain} current="competitors" />

        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Competitor Landscape & Head-to-Head Radar
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Track and benchmark rival brand citations across AI search engines for {project.domain}
              </p>
            </div>
            <Link
              href={`/dashboard/projects/${params.id}`}
              className="border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors shrink-0"
            >
              Back to Overview
            </Link>
          </div>

          <CompetitorsManager
            projectId={params.id}
            domain={project.domain}
            brandName={project.brand_name}
            initialCompetitors={project.competitor_domains || []}
            competitorCounts={competitorCounts}
            yourMentions={latestScore?.total_mentions || 0}
          />
        </div>
      </div>
    </AppShell>
  );
}
