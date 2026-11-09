export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { AnimatedDashboardStats } from './AnimatedDashboardStats';
import Link from 'next/link';
import { PLAN_LIMITS } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  let projects: any[] = [];
  try {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    projects = data || [];
  } catch (err) {
    console.error('Failed to load projects:', err);
  }

  const projectIds = projects.map((p: any) => p.id);
  let keywordsCount = 0;
  let lastScan: string | null = null;

  if (projectIds.length > 0) {
    try {
      const { count } = await supabase
        .from('keywords')
        .select('id', { count: 'exact', head: true })
        .in('project_id', projectIds)
        .eq('active', true);
      keywordsCount = count || 0;

      const { data: runs } = await supabase
        .from('scan_runs')
        .select('started_at')
        .in('project_id', projectIds)
        .order('started_at', { ascending: false })
        .limit(1);
      lastScan = runs?.[0]?.started_at || null;
    } catch (err) {
      console.warn('Failed to load keywords or runs count:', err);
    }
  }

  // Fetch user profile for plan info
  let plan = 'free';
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, plan_keywords_limit')
      .eq('id', user.id)
      .single();
    plan = profile?.plan || 'free';
  } catch (err) {
    console.warn('Profile fetch note:', err);
  }

  const planLimit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.keywords || 10;

  let avgScore = 0;
  if (projectIds.length > 0) {
    try {
      const { data: scoreData } = await supabase
        .from('snapshot_scores')
        .select('visibility_score, project_id')
        .in('project_id', projectIds);

      if (scoreData && scoreData.length > 0) {
        avgScore = Math.round(
          scoreData.reduce((acc: number, curr: any) => acc + (curr.visibility_score || 0), 0) / scoreData.length
        );
      }
    } catch (err) {
      console.warn('Failed to load score averages:', err);
    }
  }

  return (
    <AppShell user={{ email: user.email }}>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl font-bold">Projects</h2>
          <div className="flex gap-2">
            <Link
              href="/dashboard/projects/new"
              className="bg-[#eb9d2a] hover:bg-[#d88b1e] text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-semibold"
            >
              + New Project
            </Link>
            <a
              href="/api/export/csv"
              className="border border-slate-200 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              Export CSV
            </a>
            <Link
              href="/report/shopify.com"
              className="border border-slate-200 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors"
            >
              View sample report
            </Link>
          </div>
        </div>

        {/* Plan Info Banner */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  plan === 'pro'
                    ? 'bg-emerald-100 text-emerald-700'
                    : plan === 'starter'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
              </span>
              <span className="text-sm text-slate-600">
                {keywordsCount} / {planLimit} keywords used
              </span>
            </div>
            <div className="flex-1 max-w-xs">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Keyword Usage</span>
                <span>{Math.round((keywordsCount / planLimit) * 100)}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (keywordsCount / planLimit) * 100)}%`,
                    backgroundColor: keywordsCount >= planLimit ? '#EF4444' : '#10B981',
                  }}
                />
              </div>
            </div>
            <Link
              href="/pricing"
              className="text-sm font-medium text-[#eb9d2a] hover:text-[#d88b1e] transition-colors"
            >
              {plan === 'free' ? 'Upgrade Plan' : 'Change Plan'}
            </Link>
          </div>
        </div>

        <AnimatedDashboardStats
          items={[
            { label: 'Total Projects', value: projects.length, numeric: true },
            { label: 'Keywords Tracked', value: keywordsCount, numeric: true },
            { label: 'Avg AEO Score', value: avgScore, numeric: true },
            { label: 'Last Scan', value: lastScan ? new Date(lastScan).toLocaleDateString() : '—' },
          ]}
        />

        {projects.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="font-display text-xl font-bold text-slate-900">No projects yet</p>
            <p className="mt-2">Create your first project to start tracking AI visibility.</p>
            <Link
              href="/dashboard/projects/new"
              className="inline-block mt-4 bg-[#eb9d2a] hover:bg-[#d88b1e] text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              + New Project
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p: any) => (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
              >
                <h3 className="font-display text-lg font-bold text-slate-900">{p.domain}</h3>
                <p className="text-sm text-slate-500">{p.brand_name}</p>
                <div className="flex gap-3 mt-4">
                  <Link
                    href={`/dashboard/projects/${p.id}`}
                    className="text-sm text-[#eb9d2a] font-medium hover:underline"
                  >
                    View
                  </Link>
                  <Link
                    href={`/dashboard/projects/${p.id}/keywords`}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    Keywords
                  </Link>
                  <Link
                    href={`/report/${p.domain}`}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    Report
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
