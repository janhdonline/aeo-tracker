export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import Link from 'next/link';
import { LLMSSuiteManager } from './LLMSSuiteManager';
import { WebPresenceAudit } from '@/components/WebPresenceAudit';
import { FrontierModelRadar } from '@/components/FrontierModelRadar';
import { ArrowLeft } from 'lucide-react';

export default async function LLMSSuitePage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  let user: any = null;
  try {
    const authRes = await supabase.auth.getUser();
    user = authRes?.data?.user || null;
  } catch (err) {
    console.warn('LLMSSuitePage auth check error:', err);
    user = null;
  }

  if (!user) {
    redirect('/login');
  }

  const { data: project } = await supabase
    .from('projects')
    .select('id, domain, brand_name, industry, brand_aliases')
    .eq('id', params.id)
    .single();

  if (!project) {
    redirect('/dashboard');
  }

  // Fetch verified brand facts to populate canonical llms.txt
  const { data: brandFacts } = await supabase
    .from('brand_facts')
    .select('id, fact_type, key, expected_value')
    .eq('project_id', params.id);

  return (
    <AppShell
      user={{ email: user.email, id: user.id }}
      projectId={params.id}
      domain={project.domain}
      activeSection="presence"
      breadcrumbs={[
        { label: project.domain, href: `/dashboard/projects/${params.id}` },
        { label: 'Online Presence & llms.txt' },
      ]}
    >
      <div className="w-full px-6 sm:px-8 py-6 space-y-6">
        <ProjectSidebar projectId={params.id} domain={project.domain} current="llms" />
        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">
                Online Presence & AI File Suite
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit your multi-platform presence (Reddit, Wikipedia, YouTube, X) and validate the <strong>llms.txt</strong> protocol for <strong>{project.domain}</strong>.
              </p>
            </div>
            <Link
              href={`/dashboard/projects/${params.id}`}
              className="inline-flex items-center gap-1.5 border border-slate-200 bg-white px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors self-start sm:self-auto shadow-2xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Overview
            </Link>
          </div>

          <div className="space-y-8">
            {/* Multi-Platform Web Presence Footprint */}
            <WebPresenceAudit domain={project.domain} brandName={project.brand_name} />

            {/* 10-Model Frontier AI Engine Radar Suite */}
            <FrontierModelRadar domain={project.domain} brandName={project.brand_name} />

            {/* llms.txt Suite & Host Validator */}
            <LLMSSuiteManager
              project={project}
              brandFacts={brandFacts || []}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
