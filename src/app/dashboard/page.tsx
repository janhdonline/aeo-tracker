'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/AppShell';
import { AnimatedDashboardStats } from './AnimatedDashboardStats';
import { PLAN_LIMITS } from '@/lib/types';
import { Loader2, Plus, FileText, ArrowRight, ExternalLink } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [keywordsCount, setKeywordsCount] = useState(0);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [plan, setPlan] = useState('free');
  const [avgScore, setAvgScore] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const supabase = createClient();
        const authRes = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
        const currentUser = authRes?.data?.user;

        if (!currentUser) {
          router.replace('/login');
          return;
        }

        setUser({ email: currentUser.email || '', id: currentUser.id });

        // Fetch user projects
        const { data: projData } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        const loadedProjects = projData || [];
        setProjects(loadedProjects);

        // Fetch user profile for plan info
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('plan, plan_keywords_limit')
            .eq('id', currentUser.id)
            .single();

          if (profile?.plan) {
            setPlan(profile.plan);
          }
        } catch {
          // Defaults to free
        }

        const projectIds = loadedProjects.map((p: any) => p.id);

        if (projectIds.length > 0) {
          // Count active tracked keywords
          try {
            const { count } = await supabase
              .from('keywords')
              .select('id', { count: 'exact', head: true })
              .in('project_id', projectIds)
              .eq('active', true);
            setKeywordsCount(count || 0);
          } catch {
            // Ignored
          }

          // Last scan run
          try {
            const { data: runs } = await supabase
              .from('scan_runs')
              .select('started_at')
              .in('project_id', projectIds)
              .order('started_at', { ascending: false })
              .limit(1);
            if (runs?.[0]?.started_at) {
              setLastScan(runs[0].started_at);
            }
          } catch {
            // Ignored
          }

          // Average score across snapshots
          try {
            const { data: scoreData } = await supabase
              .from('snapshot_scores')
              .select('visibility_score')
              .in('project_id', projectIds);

            if (scoreData && scoreData.length > 0) {
              const avg = Math.round(
                scoreData.reduce((acc: number, curr: any) => acc + (curr.visibility_score || 0), 0) /
                  scoreData.length
              );
              setAvgScore(avg);
            }
          } catch {
            // Ignored
          }
        }
      } catch (err) {
        console.warn('Dashboard client load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  const planLimit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.keywords || 10;

  if (loading) {
    return (
      <AppShell user={{ email: user?.email || 'Loading...' }}>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#eb9d2a] mb-3" />
          <p className="text-sm font-medium text-slate-500">Loading your AEO dashboard...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={{ email: user?.email || '' }}>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Projects</h2>
            <p className="text-sm text-slate-500 mt-0.5">Track and optimize your website visibility across AI engines</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-1.5 bg-[#eb9d2a] hover:bg-[#d88b1e] text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4" /> New Project
            </Link>
            <a
              href="/api/export/csv"
              className="border border-slate-200 px-4 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Export CSV
            </a>
            <Link
              href="/report/shopify.com"
              className="border border-slate-200 px-4 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              View sample report
            </Link>
          </div>
        </div>

        {/* Plan Info Banner */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  plan === 'pro'
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : plan === 'starter'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {plan} Plan
              </span>
              <span className="text-sm text-slate-600 font-medium">
                {keywordsCount} / {planLimit} keywords tracked
              </span>
            </div>
            <div className="flex-1 max-w-xs">
              <div className="flex justify-between text-xs text-slate-500 mb-1 font-medium">
                <span>Keyword Limit Usage</span>
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
              className="text-sm font-semibold text-[#eb9d2a] hover:text-[#d88b1e] transition-colors"
            >
              {plan === 'free' ? 'Upgrade Plan →' : 'Manage Subscription'}
            </Link>
          </div>
        </div>

        <AnimatedDashboardStats
          items={[
            { label: 'Total Projects', value: projects.length, numeric: true },
            { label: 'Keywords Tracked', value: keywordsCount, numeric: true },
            { label: 'Avg AEO Score', value: avgScore, numeric: true },
            {
              label: 'Last Scan',
              value: lastScan ? new Date(lastScan).toLocaleDateString() : '—',
            },
          ]}
        />

        {projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8 shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-[#eb9d2a] mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <p className="font-display text-lg font-bold text-slate-900">No projects yet</p>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              Create your first project to start tracking your brand visibility across ChatGPT, Gemini, and DeepSeek.
            </p>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-2 mt-5 bg-[#eb9d2a] hover:bg-[#d88b1e] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all"
            >
              <Plus className="h-4 w-4" /> Create First Project
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p: any) => (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-[#eb9d2a]/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">{p.domain}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{p.brand_name}</p>
                  </div>
                  <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                  <Link
                    href={`/dashboard/projects/${p.id}`}
                    className="text-sm font-semibold text-[#eb9d2a] hover:text-[#d88b1e] inline-flex items-center gap-1"
                  >
                    View Project <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <span className="text-slate-300">|</span>
                  <Link
                    href={`/dashboard/projects/${p.id}/keywords`}
                    className="text-sm text-slate-600 hover:text-slate-900 font-medium"
                  >
                    Keywords
                  </Link>
                  <span className="text-slate-300">|</span>
                  <Link
                    href={`/report/${p.domain}`}
                    className="text-sm text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1"
                  >
                    Report <ExternalLink className="h-3 w-3" />
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
