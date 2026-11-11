'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/AppShell';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { LogoLoader } from '@/components/LogoLoader';
import { AITrafficHub } from '@/components/AITrafficHub';

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [projectDomain, setProjectDomain] = useState('');
  const [brandName, setBrandName] = useState('');
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const supabase = createClient();

  useEffect(() => {
    async function loadProject() {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user?.email) setUserEmail(authData.user.email);

        const { data: proj } = await supabase
          .from('projects')
          .select('domain, brand_name')
          .eq('id', params.id)
          .maybeSingle();

        if (proj) {
          setProjectDomain(proj.domain);
          setBrandName(proj.brand_name || proj.domain.split('.')[0]);
        } else {
          setProjectDomain('notion.so');
          setBrandName('Notion');
        }
      } catch {
        setProjectDomain('notion.so');
        setBrandName('Notion');
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [params.id]);

  if (loading) {
    return (
      <AppShell user={{ email: userEmail }}>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <ProjectSidebar projectId={params.id} domain={projectDomain || 'domain'} current="analytics" />
            <main className="flex-1 min-w-0">
              <div className="min-h-[50vh] flex items-center justify-center">
                <LogoLoader
                  variant="section"
                  text="Auditing AI Traffic & Referral Channels..."
                  subtext="Connecting to ChatGPT, Perplexity, Claude, and Gemini telemetry"
                />
              </div>
            </main>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      user={{ email: userEmail }}
      projectId={params.id}
      domain={projectDomain || 'domain'}
      activeSection="competitors"
      breadcrumbs={[
        { label: projectDomain || 'Project', href: `/dashboard/projects/${params.id}` },
        { label: 'AI Traffic & ROI Hub' },
      ]}
    >
      <div className="w-full px-6 sm:px-8 py-6 space-y-6">
        <ProjectSidebar projectId={params.id} domain={projectDomain || 'domain'} current="analytics" />

        <div className="w-full">
          <AITrafficHub
            projectId={params.id}
            domain={projectDomain || 'notion.so'}
            brandName={brandName || 'Notion'}
          />
        </div>
      </div>
    </AppShell>
  );
}
