export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import Link from 'next/link';
import { KeywordsManager } from './KeywordsManager';

export default async function KeywordsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  let user: any = null;
  try {
    const authRes = await supabase.auth.getUser();
    user = authRes?.data?.user || null;
  } catch (err) {
    console.warn('KeywordsPage auth check error:', err);
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const { data: keywords } = await supabase
    .from('keywords')
    .select('*')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <AppShell
      user={{ email: user.email, id: user.id }}
      projectId={params.id}
      domain={project.domain}
      activeSection="prompts"
      breadcrumbs={[
        { label: project.domain, href: `/dashboard/projects/${params.id}` },
        { label: 'Prompts & Keywords' },
      ]}
    >
      <div className="w-full px-6 sm:px-8 py-6 space-y-6">
        <ProjectSidebar projectId={params.id} domain={project.domain} current="keywords" />
        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">Commercial Prompts & Keywords</h2>
              <p className="text-xs text-slate-500 mt-1">Queries tracked for {project.domain} across AI models</p>
            </div>
            <Link href={`/dashboard/projects/${params.id}`} className="border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs">Back to Overview</Link>
          </div>
          <KeywordsManager projectId={params.id} initialKeywords={keywords || []} plan={profile?.plan || 'free'} />
        </div>
      </div>
    </AppShell>
  );
}