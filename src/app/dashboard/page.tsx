'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/AppShell';
import { AnimatedDashboardStats } from './AnimatedDashboardStats';
import { PLAN_LIMITS } from '@/lib/types';
import {
  Loader2,
  Plus,
  FileText,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Compass,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Bot,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Share2,
  Download,
  Zap,
} from 'lucide-react';

const AI_ENGINES = [
  { name: 'ChatGPT-4o / SearchGPT', status: 'Active Grounding', accuracy: '94% Citation Recall', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { name: 'Google Gemini 2.0', status: 'Direct Grounding', accuracy: 'Real-time Web Graph', tone: 'text-blue-700 bg-blue-50 border-blue-200' },
  { name: 'Perplexity Pro', status: 'Live Indexing', accuracy: 'Deep Source Extraction', tone: 'text-teal-700 bg-teal-50 border-teal-200' },
  { name: 'DeepSeek R1 / V3', status: 'Reasoning Mode', accuracy: 'Algorithmic Synthesis', tone: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { name: 'Claude 3.5 Sonnet', status: 'Contextual Recs', accuracy: 'High-Intent Benchmark', tone: 'text-amber-800 bg-amber-50 border-amber-200' },
  { name: 'Grok 2 / xAI', status: 'Realtime Stream', accuracy: 'Social & Sentiment Vector', tone: 'text-slate-800 bg-slate-100 border-slate-300' },
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

  // Sample Demo Preview Tab
  const [activeDemoTab, setActiveDemoTab] = useState<'overview' | 'sources' | 'facts'>('overview');
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

        // Fetch user profile for plan info safely
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
      setQuickError('Please enter a valid website domain (e.g. revolut.com or yourbrand.io)');
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

  const planLimit = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS]?.keywords || 10;

  if (loading) {
    return (
      <AppShell user={{ email: user?.email || 'Loading...' }}>
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#eb9d2a] mb-3" />
          <p className="text-sm font-medium text-slate-500">Connecting to Answer Engine Radar...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell user={{ email: user?.email || '' }}>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* HERO COMMAND CENTER BANNER & QUICK DOMAIN TRACKER */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#131b2e] to-slate-900 p-5 sm:p-9 text-white shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 rounded-full bg-[#eb9d2a]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300 mb-4 overflow-hidden">
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
                <span className="truncate">Live Engine Radar · ChatGPT, Gemini, Perplexity, DeepSeek</span>
              </div>
              <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                AEO Visibility Command Center
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-slate-300 leading-relaxed">
                Monitor where AI recommends your brand, reverse-engineer high-authority citation sources, and eliminate hallucinated pricing or claims.
              </p>

              {/* Instant Website Tracking Form */}
              <form onSubmit={handleQuickAdd} className="mt-6 flex flex-col sm:flex-row gap-2.5 max-w-xl">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={quickDomain}
                    onChange={(e) => setQuickDomain(e.target.value)}
                    placeholder="Enter website URL (e.g. revolut.com, stripe.com)"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/90 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-400 shadow-inner focus:border-[#eb9d2a] focus:outline-none focus:ring-2 focus:ring-[#eb9d2a]/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={quickSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#eb9d2a] to-[#d88b1e] px-5 py-3 text-sm font-semibold text-white shadow-md hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {quickSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Tracking...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" /> Track Website
                    </>
                  )}
                </button>
              </form>
              {quickError && (
                <p className="mt-2 text-xs text-rose-400 font-medium">{quickError}</p>
              )}

              {/* Quick Presets */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>Quick try:</span>
                {['revolut.com', 'stripe.com', 'linear.app', 'shopify.com'].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setQuickDomain(example)}
                    className="rounded-md border border-slate-700/80 bg-slate-800/60 px-2 py-0.5 text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Summary Pill & Actions */}
            <div className="flex flex-col gap-3 shrink-0 rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between gap-6 pb-3 border-b border-white/10">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Active Tier</span>
                <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 uppercase">
                  {plan}
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Tracked Projects:</span>
                  <span className="font-semibold text-white">{projects.length}</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Keywords in Orbit:</span>
                  <span className="font-semibold text-white">{keywordsCount} / {planLimit}</span>
                </div>
                <div className="flex justify-between gap-6">
                  <span className="text-slate-400">Statistical Engine:</span>
                  <span className="font-semibold text-emerald-400">Wilson 95% Confidence</span>
                </div>
              </div>
              <Link
                href="/pricing"
                className="mt-2 block w-full text-center rounded-lg bg-white/10 py-2 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
              >
                {plan === 'free' ? 'Unlock PRO Multi-Sampling →' : 'Manage Subscription'}
              </Link>
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
                    Your Supabase project needs its database tables initialized. Open our SQL script and run it once in your Supabase SQL Editor to activate live project tracking and profile tiers.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="/api/tools/schema"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-xs font-semibold shadow-sm transition-colors"
                >
                  <FileCode className="h-3.5 w-3.5" /> View Setup SQL Script ↗
                </a>
              </div>
            </div>
          </div>
        )}

        {/* STATS OVERVIEW CARDS */}
        <AnimatedDashboardStats
          items={[
            { label: 'Active Projects', value: projects.length, numeric: true },
            { label: 'Keywords Tracked', value: keywordsCount, numeric: true },
            { label: 'Average AEO Score', value: avgScore > 0 ? avgScore : '—', numeric: avgScore > 0 },
            {
              label: 'Last Engine Audit',
              value: lastScan ? new Date(lastScan).toLocaleDateString() : 'Ready to Run',
            },
          ]}
        />

        {/* REALTIME ANSWER ENGINE STATUS GRID */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Answer Engine Coverage</h2>
              <p className="text-xs text-slate-500">Live connectivity and sampling matrices across leading foundation models</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> 6 Engines Synced
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {AI_ENGINES.map((engine) => (
              <div
                key={engine.name}
                className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-slate-800 truncate">{engine.name}</span>
                </div>
                <div className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border inline-block ${engine.tone}`}>
                  {engine.status}
                </div>
                <p className="mt-2 text-[11px] text-slate-500 leading-tight">{engine.accuracy}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4 PAID SUPERPOWERS SPOTLIGHT */}
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/70 to-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="h-3.5 w-3.5" /> Proprietary AEO Advantages
              </div>
              <h2 className="font-display text-xl font-bold text-slate-900">
                Why Standard SEO Tools Fail at AEO
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-sm">
              Answer engines don&apos;t rank 10 blue links; they synthesize answers. Here is how our engine guarantees market dominance:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-300 transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 mb-3">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Source Reverse-Engineering</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Identifies the exact Reddit threads, Trustpilot reviews, and G2 tables LLMs cite before naming your competitors.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300 transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 mb-3">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Wilson 95% Confidence</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Protects against LLM temperature noise. Multi-pass sampling proves statistically whether your brand truly wins.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-amber-300 transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700 mb-3">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">AI Hallucination Watchdog</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Audits whether ChatGPT or Gemini is quoting obsolete pricing or fabricated claims, with instant <code className="text-slate-800">llms.txt</code> patches.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-300 transition-colors">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 mb-3">
                <Share2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Traffic Leak Diagnostic</h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Measures Mention vs Citation gaps. When AI names your brand without a clickable link, you lose high-intent buyer traffic.
              </p>
            </div>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-xl font-bold text-slate-900">Tracked Web Properties</h2>
              <p className="text-xs text-slate-500">Your monitored domains and recurring visibility scans</p>
            </div>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#eb9d2a] hover:text-[#d88b1e]"
            >
              Advanced Project Setup <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {projects.length === 0 ? (
            /* INTERACTIVE SAMPLE SHOWCASE WHEN ZERO PROJECTS */
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold shadow-sm">
                      S
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <h3 className="font-display text-lg font-bold text-slate-900">shopify.com</h3>
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                          Sample Benchmark Preview
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">Shopify Global Commerce · 84/100 AEO Visibility Score</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setActiveDemoTab('overview')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        activeDemoTab === 'overview'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveDemoTab('sources')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        activeDemoTab === 'sources'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Citation Sources
                    </button>
                    <button
                      onClick={() => setActiveDemoTab('facts')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        activeDemoTab === 'facts'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Fact Watchdog
                    </button>
                    <Link
                      href="/report/shopify.com"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    >
                      Full Report <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Tab 1: Overview */}
                {activeDemoTab === 'overview' && (
                  <div className="pt-5 grid sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                      <span className="text-xs font-medium text-slate-500">AI Mention Frequency</span>
                      <p className="mt-1 font-display text-2xl font-bold text-slate-900">89.4%</p>
                      <p className="mt-1 text-[11px] text-emerald-600 font-semibold">Wilson 95% CI: [82.1% — 93.6%]</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                      <span className="text-xs font-medium text-slate-500">Citation Click-Through Rate</span>
                      <p className="mt-1 font-display text-2xl font-bold text-slate-900">76.2%</p>
                      <p className="mt-1 text-[11px] text-blue-600 font-semibold">13.2% Traffic Leak to Competitors</p>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                      <span className="text-xs font-medium text-slate-500">Core Category Competitors</span>
                      <p className="mt-1 font-display text-2xl font-bold text-slate-900">Woo, BigCommerce</p>
                      <p className="mt-1 text-[11px] text-slate-500">3 Gap Opportunities Identified</p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Sources */}
                {activeDemoTab === 'sources' && (
                  <div className="pt-5 space-y-2">
                    {[
                      { domain: 'reddit.com/r/ecommerce', authority: 'High Citation Weight', velocity: '48 mentions/mo', status: 'Injected' },
                      { domain: 'trustpilot.com/review/shopify', authority: 'Trust Pillar', velocity: '92 reviews/mo', status: 'Dominant' },
                      { domain: 'g2.com/categories/e-commerce-platforms', authority: 'B2B Authority', velocity: 'Top 3 Grid', status: 'Action Needed' },
                    ].map((src) => (
                      <div key={src.domain} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs gap-1 sm:gap-4">
                        <span className="font-semibold text-slate-800 break-all">{src.domain}</span>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <span className="text-slate-500">{src.authority}</span>
                          <span className="text-slate-600 font-medium">{src.velocity}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">{src.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Facts */}
                {activeDemoTab === 'facts' && (
                  <div className="pt-5 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                      <div className="flex items-start sm:items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                        <span className="font-medium text-emerald-900">Basic Plan Pricing: $39/month verified across ChatGPT & Claude</span>
                      </div>
                      <span className="font-bold text-emerald-700 shrink-0">Verified</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                      <div className="flex items-start sm:items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                        <span className="font-medium text-amber-900">Perplexity cited outdated 2.9% transaction fee instead of 2.6%</span>
                      </div>
                      <span className="font-bold text-amber-700 shrink-0">llms.txt Fix Ready</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p: any) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-[#eb9d2a]/40 transition-all duration-200 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-[#eb9d2a] transition-colors">
                        {p.domain}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">{p.brand_name}</p>
                    </div>
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                      Tracking
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-400 block">AI Status</span>
                      <span className="font-semibold text-slate-700">Active Scan</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Sources Audited</span>
                      <span className="font-semibold text-emerald-600">PRO Available</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 text-xs">
                    <Link
                      href={`/dashboard/projects/${p.id}`}
                      className="font-bold text-[#eb9d2a] hover:text-[#d88b1e] inline-flex items-center gap-1"
                    >
                      Audit View <ArrowRight className="h-3 w-3" />
                    </Link>
                    <span className="text-slate-200">|</span>
                    <Link
                      href={`/dashboard/projects/${p.id}/sources`}
                      className="text-slate-600 hover:text-slate-900 font-medium"
                    >
                      Sources (PRO)
                    </Link>
                    <span className="text-slate-200">|</span>
                    <Link
                      href={`/dashboard/projects/${p.id}/keywords`}
                      className="text-slate-600 hover:text-slate-900 font-medium"
                    >
                      Keywords
                    </Link>
                    <span className="text-slate-200">|</span>
                    <Link
                      href={`/report/${p.domain}`}
                      className="text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-0.5"
                    >
                      Report <ExternalLink className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* QUICK TOOLS & AEO ESSENTIALS FOOTER SHELF */}
        <section className="pt-4 border-t border-slate-200/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Essential AEO Optimization Toolkit
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/tools/ai-crawler-audit"
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
            >
              <Bot className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">AI Crawler Audit</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Test robots.txt access for GPTBot & Perplexity</p>
              </div>
            </Link>

            <Link
              href="/tools/llms-generator"
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
            >
              <FileCode className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">llms.txt Generator</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Structured documentation for AI models</p>
              </div>
            </Link>

            <Link
              href="/report/shopify.com"
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
            >
              <FileText className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Sample Report</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Explore full AEO intelligence teardown</p>
              </div>
            </Link>

            <a
              href="/api/export/csv"
              className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
            >
              <Download className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">CSV Data Export</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Export rank history & prompt answers</p>
              </div>
            </a>
          </div>
        </section>

      </main>
    </AppShell>
  );
}
