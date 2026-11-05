export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import Link from 'next/link';
import { KeywordsManager } from './KeywordsManager';

export default async function KeywordsPage({ params }: { params: { id: string } }) {
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
    <AppShell user={{ email: user.email }}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          <ProjectSidebar projectId={params.id} domain={project.domain} current="keywords" />
          <main className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-2xl font-bold">Keywords for {project.domain}</h2>
              <Link href={`/dashboard/projects/${params.id}`} className="border border-slate-200 px-4 py-2 rounded-lg text-sm hover:bg-slate-50">Back to Project</Link>
            </div>
            <KeywordsManager projectId={params.id} initialKeywords={keywords || []} plan={profile?.plan || 'free'} />
          </main>
        </div>
      </div>
    </AppShell>
  );
}