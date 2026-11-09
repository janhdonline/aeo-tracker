'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/AppShell';
import { LogoLoader } from '@/components/LogoLoader';
import { AnimatedDashboardStats } from './AnimatedDashboardStats';
import {
  Plus,
  ArrowRight,
  ExternalLink,
  Globe,
  Bot,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Download,
  Zap,
  ShieldCheck,
  Compass,
  FileCode2,
} from 'lucide-react';

const AI_ENGINES = [
  { name: 'ChatGPT-4o', status: 'Active Index', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { name: 'Google Gemini', status: 'Live Overview', tone: 'text-blue-700 bg-blue-50 border-blue-200' },
  { name: 'Perplexity Pro', status: 'Web Citations', tone: 'text-teal-700 bg-teal-50 border-teal-200' },
  { name: 'Claude 3.5', status: 'High-Intent Recs', tone: 'text-amber-800 bg-amber-50 border-amber-200' },
  { name: 'DeepSeek R1', status: 'Reasoning Mode', tone: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { name: 'Grok 2', status: 'Realtime Stream', tone: 'text-slate-800 bg-slate-100 border-slate-300' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [keywordsCount, setKeywordsCount] = useState(0);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [plan, setPlan] = useState('free');
  const [avgScore, setAvgScore] = useState(0);

  // Quick-Add Website State
  const [quickDomain, setQuickDomain] = useState('');
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickError, setQuickError] = useState('');
  const [schemaNeeded, setSchemaNeeded] = useState(false);

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

        // Fetch user projects safely
        let loadedProjects: any[] = [];
        try {
          const { data: projData, error: projErr } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

          if (projErr && (projErr.code === '42P01' || String(projErr.message).includes('403') || String(projErr.message).includes('permission'))) {
            setSchemaNeeded(true);
          }
          loadedProjects = projData || [];
          setProjects(loadedProjects);
        } catch {
          // Defaults to empty
        }

        // Fetch user profile
        try {
          const { data: profile, error: profErr } = await supabase
            .from('profiles')
            .select('plan, plan_keywords_limit')
            .eq('id', currentUser.id)
            .maybeSingle();

          if (profErr && (profErr.code === '42P01' || String(profErr.message).includes('403') || String(profErr.message).includes('permission'))) {
            setSchemaNeeded(true);
          }
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

  async function handleQuickAdd(e: React.FormEvent) {
    e.preventDefault();
    setQuickError('');

    const cleanDomain = quickDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    if (!cleanDomain || !cleanDomain.includes('.')) {
      setQuickError('Please enter a valid website domain (e.g. yourbrand.com)');
      return;
    }

    if (!user?.id) {
      router.push('/login');
      return;
    }

    setQuickSubmitting(true);
    try {
      const base = cleanDomain.split('.')[0] || cleanDomain;
      const brandName = base.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      const supabase = createClient();
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          domain: cleanDomain,
          brand_name: brandName,
          brand_aliases: [brandName],
          competitor_domains: [],
        })
        .select()
        .single();

      if (error) {
        setQuickError(error.message);
      } else if (data?.id) {
        router.push(`/dashboard/projects/${data.id}`);
      }
    } catch (err: any) {
      setQuickError(err?.message || 'Failed to initialize website tracking');
    } finally {
      setQuickSubmitting(false);
    }
  }

  if (loading) {
    return (
      <AppShell user={{ email: user?.email || 'Loading...' }}>
        <div className="min-h-[70vh] flex items-center justify-center">
          <LogoLoader
            variant="section"
            text="Connecting to Answer Engine Radar..."
            subtext="Loading your tracked websites and AI visibility snapshots"
          />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={{ email: user?.email || '' }}>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* TOP COMMAND HEADER: Clean, Professional, Beginner-Friendly */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800 mb-3">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI Engine Radar Online · 6 Engines Monitored</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                AEO Visibility Hub
              </h1>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                Monitor where AI engines (ChatGPT, Perplexity, Gemini) recommend your website, find missing citations, and fix hallucinated facts.
              </p>
            </div>

            {/* Quick Track Input Form */}
            <div className="w-full lg:max-w-md">
              <form onSubmit={handleQuickAdd} className="flex gap-2">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={quickDomain}
                    onChange={(e) => setQuickDomain(e.target.value)}
                    placeholder="Add website (e.g. acme.com)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={quickSubmitting}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors shrink-0 disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {quickSubmitting ? 'Adding...' : 'Track Website'}
                </button>
              </form>
              {quickError && (
                <p className="mt-2 text-xs text-rose-600 font-semibold">{quickError}</p>
              )}
            </div>
          </div>
        </section>

        {schemaNeeded && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 shadow-sm text-amber-950">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-950">1-Step Supabase Database Setup</h4>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                    Your Supabase project needs its database tables initialized. Open our SQL script and run it once in your Supabase SQL Editor.
                  </p>
                </div>
              </div>
              <a
                href="/api/tools/schema"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-colors shrink-0"
              >
                <FileCode className="h-3.5 w-3.5" /> View Setup SQL Script ↗
              </a>
            </div>
          </div>
        )}

        {/* 4 SUMMARY STATS: High Clarity & Zero Jargon */}
        <AnimatedDashboardStats
          items={[
            { label: 'Tracked Websites', value: projects.length, numeric: true },
            { label: 'Buyer Queries Monitored', value: keywordsCount, numeric: true },
            { label: 'Average AI Score', value: avgScore > 0 ? `${avgScore}/100` : 'Ready to Scan', numeric: avgScore > 0 },
            {
              label: 'Last Engine Audit',
              value: lastScan ? new Date(lastScan).toLocaleDateString() : 'Ready to Run',
            },
          ]}
        />

        {/* PRIMARY SECTION: Tracked Web Properties (Front & Center!) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Tracked Web Properties
              </h2>
              <p className="text-xs text-slate-500">
                Select a website to view full AI visibility scores, citation blueprints, and recommendation briefs.
              </p>
            </div>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              + New Custom Setup
            </Link>
          </div>

          {projects.length === 0 ? (
            /* Friendly Beginner Empty State */
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mx-auto">
                <Globe className="h-6 w-6" />
              </span>
              <div className="max-w-md mx-auto">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Track Your First Website
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Enter your business domain above or click below to launch automated AI visibility monitoring across ChatGPT, Perplexity, and Gemini.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    const el = document.querySelector('input[placeholder*="Add website"]') as HTMLInputElement;
                    el?.focus();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Website Now
                </button>
              </div>
            </div>
          ) : (
            /* Clean & Intuitive Cards for Real Projects */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p: any) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs hover:shadow-card hover:border-slate-300 transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800 border border-slate-200/80">
                          <Globe className="h-5 w-5" />
                        </span>
                        <div>
                          <Link href={`/dashboard/projects/${p.id}`}>
                            <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {p.domain}
                            </h3>
                          </Link>
                          <p className="text-xs text-slate-500">{p.brand_name || p.domain}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/60 shrink-0">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          AI Engines
                        </span>
                        <span className="font-bold text-slate-800 mt-0.5 block">
                          4 Monitored
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Tracking Mode
                        </span>
                        <span className="font-bold text-emerald-700 mt-0.5 block">
                          Weekly Radar
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Bottom Action Strip */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/dashboard/projects/${p.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-xs transition-colors"
                    >
                      Open Workspace
                      <ArrowRight className="h-3.5 w-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/report/${p.domain}`}
                        target="_blank"
                        className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                        title="View Public Report"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <Link
                        href={`/dashboard/projects/${p.id}/settings`}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        Settings
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ANSWER ENGINE RADAR STATUS STRIP (Simple & Compact) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-emerald-600" />
              <h3 className="font-display text-sm font-bold text-slate-900">
                Answer Engine Radar Status
              </h3>
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              All 6 AI Models Operational
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {AI_ENGINES.map((engine) => (
              <div
                key={engine.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800">{engine.name}</p>
                  <p className="text-[10px] text-slate-500">{engine.status}</p>
                </div>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              </div>
            ))}
          </div>
        </section>

        {/* ESSENTIAL TOOLS QUICK SHELF */}
        <section className="pt-2">
          <div className="grid sm:grid-cols-3 gap-3">
            <Link
              href="/tools/ai-crawler-audit"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Bot className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">AI Crawler Audit</h4>
                <p className="text-[11px] text-slate-500">Test robots.txt bot access</p>
              </div>
            </Link>

            <Link
              href="/tools/llms-generator"
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <FileCode2 className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">llms.txt Builder</h4>
                <p className="text-[11px] text-slate-500">Generate AI documentation</p>
              </div>
            </Link>

            <a
              href={projects.length > 0 ? `/api/export/csv?projectId=${projects[0].id}` : '/api/export/csv'}
              download
              className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-xs"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
                <Download className="h-4 w-4" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-slate-900">CSV Export</h4>
                <p className="text-[11px] text-slate-500">Download citation logs</p>
              </div>
            </a>
          </div>
        </section>

      </main>
    </AppShell>
  );
}
