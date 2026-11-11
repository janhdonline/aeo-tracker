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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Target Intent Engine
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-semibold text-slate-600">{project.domain}</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Commercial Prompts &amp; Keywords
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage commercial buyer queries tracked for <strong>{project.brand_name || project.domain}</strong> across Gemini, ChatGPT-4o, Perplexity, and Grok.
              </p>
            </div>
            <Link
              href={`/dashboard/projects/${params.id}`}
              className="inline-flex items-center gap-1.5 border border-slate-200 bg-white px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors self-start sm:self-auto shrink-0"
            >
              Back to Overview
            </Link>
          </div>
          <KeywordsManager projectId={params.id} initialKeywords={keywords || []} plan={profile?.plan || 'free'} />
        </div>
      </div>
    </AppShell>
  );
}