export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { generateFullReportData } from '@/lib/report-generator';
import { ProjectOverviewView } from './ProjectOverviewView';

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

  const { data: latestRun } = await supabase
    .from('scan_runs')
    .select('id, started_at')
    .eq('project_id', params.id)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  const { data: fixBriefs } = await supabase
    .from('fix_briefs')
    .select('*')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false });

  // Generate domain-specific benchmark telemetry matching Image 2
  const reportData = generateFullReportData(project.domain);

  return (
    <AppShell
      user={{ email: user.email, id: user.id }}
      projectId={params.id}
      domain={project.domain}
      activeSection="dashboard"
      breadcrumbs={[
        { label: project.domain, href: `/dashboard/projects/${params.id}` },
        { label: 'Overview' },
      ]}
    >
      <div className="w-full px-6 sm:px-8 py-6 space-y-6">
        <ProjectSidebar projectId={params.id} domain={project.domain} current="overview" />

        <ProjectOverviewView
          projectId={params.id}
          project={project}
          latestScore={latestScore}
          latestRun={latestRun}
          keywords={keywords || []}
          fixBriefs={fixBriefs || []}
          reportData={reportData}
        />
      </div>
    </AppShell>
  );
}
