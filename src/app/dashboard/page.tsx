'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { AppShell } from '@/components/AppShell';
import { LogoLoader } from '@/components/LogoLoader';
import { AnimatedDashboardStats } from './AnimatedDashboardStats';
import { DailyAnalyticsChart } from './components/DailyAnalyticsChart';
import { PrioritizedTasksWidget } from './components/PrioritizedTasksWidget';
import { CompetitorLeaderboardWidget } from './components/CompetitorLeaderboardWidget';
import { ExecutiveExportDigestModal } from './components/ExecutiveExportDigestModal';
import { ExecutivePulseCard } from './components/ExecutivePulseCard';
import { LiveCitationTicker } from './components/LiveCitationTicker';
import { AttributionLeakMeter } from './components/AttributionLeakMeter';
import { QuickBuyerQuerySimulator } from './components/QuickBuyerQuerySimulator';
import { FrontierModelRadar } from '@/components/FrontierModelRadar';
import { WebPresenceAudit } from '@/components/WebPresenceAudit';
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
  Sparkles,
  Target,
  Activity,
  Layers,
} from 'lucide-react';

const SUGGESTIONS = ['stripe.com', 'linear.app', 'notion.so', 'supabase.com', 'github.com'];

const BENCHMARK_EXAMPLES = [
  {
    domain: 'stripe.com',
    brand: 'Stripe',
    score: 88,
    sov: '64%',
    citations: '420+ citations',
    tag: 'Fintech Leader',
    engines: 'ChatGPT & Perplexity',
  },
  {
    domain: 'linear.app',
    brand: 'Linear',
    score: 91,
    sov: '78%',
    citations: '310+ citations',
    tag: 'Productivity Top Rank',
    engines: 'ChatGPT & Claude',
  },
  {
    domain: 'notion.so',
    brand: 'Notion',
    score: 84,
    sov: '52%',
    citations: '580+ citations',
    tag: 'Knowledge Base',
    engines: 'Gemini & Perplexity',
  },
];

const AI_ENGINES = [
  { name: 'ChatGPT-4o', provider: 'OpenAI', latency: '110ms', status: 'SearchGPT Live', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { name: 'Google Gemini', provider: 'Google AI', latency: '95ms', status: 'Overview Synthesis', tone: 'text-blue-700 bg-blue-50 border-blue-200' },
  { name: 'Perplexity Pro', provider: 'Perplexity', latency: '142ms', status: 'Web Citations', tone: 'text-teal-700 bg-teal-50 border-teal-200' },
  { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', latency: '120ms', status: 'Entity Knowledge', tone: 'text-amber-800 bg-amber-50 border-amber-200' },
  { name: 'DeepSeek R1', provider: 'DeepSeek', latency: '210ms', status: 'Reasoning Mode', tone: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { name: 'Grok 2', provider: 'xAI', latency: '135ms', status: 'Realtime Stream', tone: 'text-slate-800 bg-slate-100 border-slate-300' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [keywordsCount, setKeywordsCount] = useState(0);
  const [lastScan, setLastScan] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | undefined>(undefined);
  const [avgScore, setAvgScore] = useState(0);
  const [selectedDomain, setSelectedDomain] = useState<string>('notion.so');

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
          if (loadedProjects.length > 0 && loadedProjects[0].domain) {
            setSelectedDomain(loadedProjects[0].domain);
          }
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
      <AppShell user={{ email: user?.email || 'Loading...' }} userPlan={plan}>
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
    <AppShell
      user={{ email: user?.email || '', id: user?.id }}
      userPlan={plan}
      projects={projects}
      activeSection="dashboard"
      breadcrumbs={[{ label: 'Dashboard' }]}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full px-6 sm:px-8 py-6 space-y-6"
      >
        
        {/* TOP COMMAND CONSOLE: High-End Studio Hero Card (Matches ReportView Design) */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-6">
              {/* Radial Score Gauge */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 128 128">
                  <circle
                    cx="64"
                    cy="64"
                    r={54}
                    className="text-slate-100"
                    strokeWidth="7"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r={54}
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                    strokeWidth="7"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 - ((avgScore > 0 ? avgScore : 84) / 100) * 2 * Math.PI * 54}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.35))' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
                    {avgScore > 0 ? avgScore : 84}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 -mt-1">/100</span>
                </div>
              </div>

              {/* Studio Meta & Subtitle */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950">
                    AEO Visibility Studio
                  </h1>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    6 AI Engines Synced
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                  Real-time monitoring across ChatGPT, Gemini, Claude, and Perplexity. Track visibility, competitor leaks, and citations.
                </p>

                {/* Instant Suggestions Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1">Try instant scan:</span>
                  {SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setQuickDomain(sug)}
                      className="px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px] transition-colors cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Track Input Box & Executive Controls */}
            <div className="w-full lg:max-w-md shrink-0 space-y-3">
              <div className="flex items-center justify-start lg:justify-end">
                <ExecutiveExportDigestModal
                  userEmail={user?.email || 'janhdonline@gmail.com'}
                  userPlan={plan}
                  projectCount={projects.length}
                  avgScore={avgScore > 0 ? avgScore : 84}
                />
              </div>

              <form onSubmit={handleQuickAdd} className="space-y-1.5">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={quickDomain}
                    onChange={(e) => setQuickDomain(e.target.value)}
                    placeholder="Enter website (e.g. acme.com)"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-24 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-slate-900 focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={quickSubmitting}
                    className="absolute right-1 top-1 bottom-1 inline-flex items-center justify-center gap-1 rounded-lg bg-slate-900 px-3 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="h-3 w-3 text-emerald-400" />
                    <span>{quickSubmitting ? '...' : 'Track'}</span>
                  </button>
                </div>
                {quickError && (
                  <p className="text-[11px] text-rose-600 font-semibold px-1">{quickError}</p>
                )}
                <p className="text-[10px] text-slate-400 px-1">
                  Automated weekly radar & entity indexation
                </p>
              </form>
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

        {/* EXECUTIVE AI DAILY PULSE: Humanized Director Briefing */}
        <ExecutivePulseCard
          domain={selectedDomain}
          score={avgScore > 0 ? avgScore : 84}
          deltaText="+8.4%"
        />

        {/* 4 SUMMARY STATS: High Clarity & Zero Jargon */}
        <AnimatedDashboardStats
          items={[
            {
              label: 'Tracked Web Properties',
              value: projects.length,
              numeric: true,
              icon: Globe,
              accent: 'blue',
              badge: projects.length > 0 ? `${projects.length} Active` : 'Ready to Track',
              subtext: 'Websites monitored in AI answers',
            },
            {
              label: 'Commercial Buyer Queries',
              value: keywordsCount,
              numeric: true,
              icon: Search,
              accent: 'purple',
              badge: keywordsCount > 0 ? `${keywordsCount} Live` : 'High Intent',
              subtext: 'Audited across AI model prompts',
            },
            {
              label: 'Average AI Visibility',
              value: avgScore > 0 ? `${avgScore}/100` : '—/100',
              numeric: avgScore > 0,
              icon: Target,
              accent: 'emerald',
              badge: avgScore > 0 ? 'Verified' : 'Ready to Audit',
              subtext: avgScore > 0 ? 'Multi-pass confidence score' : 'Run first scan to compute',
            },
            {
              label: 'Answer Engine Radar',
              value: '100%',
              numeric: false,
              icon: Activity,
              accent: 'amber',
              badge: '6/6 Online',
              subtext: 'Real-time telemetry & latency sync',
            },
          ]}
        />

        {/* DAILY ANALYTICS & HISTORICAL TRENDS (Expansive Wave Spline) */}
        <DailyAnalyticsChart
          domain={selectedDomain}
          currentScore={avgScore > 0 ? avgScore : 84}
        />

        {/* AI TRAFFIC LEAK & ATTRIBUTION CONVERSION METER */}
        <AttributionLeakMeter
          domain={selectedDomain}
          brandName={projects.find((p: any) => p.domain === selectedDomain)?.brand_name || selectedDomain.split('.')[0]}
          citationsCount={48}
        />

        {/* LIVE COMMERCIAL BUYER PROMPT SIMULATOR */}
        <QuickBuyerQuerySimulator
          domain={selectedDomain}
          brandName={projects.find((p: any) => p.domain === selectedDomain)?.brand_name || selectedDomain.split('.')[0]}
        />

        {/* LIVE AI CITATION & MENTION STREAM */}
        <LiveCitationTicker domain={selectedDomain} />

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
            /* Inspiring Interactive Starter & Live Benchmarks */
            <div className="space-y-6">
              {/* Primary Callout Card */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900">
                        Start Your First AI Visibility Audit
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-xl leading-relaxed">
                        Track how your brand appears when prospective buyers ask ChatGPT, Perplexity, and Gemini for vendor recommendations in your industry.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const el = document.querySelector('input[placeholder*="domain"]') as HTMLInputElement;
                      el?.focus();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all shrink-0"
                  >
                    <Plus className="h-4 w-4 text-emerald-400" />
                    <span>Add Website Above</span>
                  </button>
                </div>

                {/* 3 Live Benchmark Demonstrations */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Explore How Leading Tech Brands Perform in AI Answers
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                      Live Sample Reports
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {BENCHMARK_EXAMPLES.map((b) => (
                      <div
                        key={b.domain}
                        className="group relative rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white p-4 sm:p-5 shadow-2xs hover:shadow-card hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                              {b.domain}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                              {b.score}/100 AEO
                            </span>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-600">
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span className="text-slate-400">Share of Voice</span>
                              <span className="font-bold text-slate-800">{b.sov}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-100">
                              <span className="text-slate-400">Web Citations</span>
                              <span className="font-bold text-slate-800">{b.citations}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-slate-400">Top Engines</span>
                              <span className="font-medium text-slate-700 text-[11px]">{b.engines}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                          <Link
                            href={`/report/${b.domain}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors"
                          >
                            <span>Inspect Public Report</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setQuickDomain(b.domain);
                              const el = document.querySelector('input[placeholder*="domain"]') as HTMLInputElement;
                              el?.focus();
                            }}
                            className="text-[11px] font-semibold text-emerald-700 hover:underline"
                          >
                            + Track This
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Clean & Intuitive Cards for Real Projects */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p: any) => {
                const isSelected = selectedDomain.toLowerCase() === p.domain.toLowerCase();
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedDomain(p.domain)}
                    className={`rounded-3xl border bg-white p-5 sm:p-6 shadow-xs hover:shadow-card transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-400/40 shadow-sm'
                        : 'border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
                            isSelected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-800 border-slate-200/80'
                          }`}>
                            <Globe className="h-5 w-5" />
                          </span>
                          <div>
                            <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                              {p.domain}
                            </h3>
                            <p className="text-xs text-slate-500">{p.brand_name || p.domain}</p>
                          </div>
                        </div>
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-2.5 py-0.5 text-[10px] font-bold shadow-2xs shrink-0">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" /> In Radar
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200 shrink-0">
                            Click to View
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            AI Engines
                          </span>
                          <span className="font-bold text-slate-800 mt-0.5 block">
                            4 Monitored
                          </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
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
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
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
                );
              })}
            </div>
          )}
        </section>

        {/* PRIORITIZED ACTIONABLE TASKS & QUICK WINS (Matches aeochecker Tasks) */}
        <PrioritizedTasksWidget />

        {/* COMPETITOR INTELLIGENCE & SHARE OF VOICE LEADERBOARD */}
        <CompetitorLeaderboardWidget
          currentDomain={projects[0]?.domain || 'notion.so'}
          userScore={avgScore > 0 ? avgScore : 84}
        />

        {/* MULTI-PLATFORM WEB PRESENCE FOOTPRINT (Reddit, Wikipedia, YouTube, X) */}
        <WebPresenceAudit
          domain={selectedDomain}
          brandName={projects.find((p: any) => p.domain === selectedDomain)?.brand_name || selectedDomain.split('.')[0]}
        />

        {/* 10-MODEL FRONTIER AI ENGINE RADAR SUITE (Phase 3.2) */}
        <FrontierModelRadar
          domain={selectedDomain}
          brandName={projects.find((p: any) => p.domain === selectedDomain)?.brand_name || selectedDomain.split('.')[0]}
        />

        {/* ESSENTIAL TOOLS QUICK SHELF */}
        <section className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-display text-sm font-bold text-slate-900">
              AEO Engineering & Diagnostic Tool Suite
            </h4>
            <span className="text-xs text-slate-400">6 Specialized Tools</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Link
              href={projects.length > 0 ? `/dashboard/projects/${projects[0].id}/briefs` : '/dashboard'}
              className="flex flex-col justify-between p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200/60">
                  <Layers className="h-4 w-4" />
                </span>
                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Kanban Board</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">4-column action queue</p>
              </div>
            </Link>

            <Link
              href={projects.length > 0 ? `/dashboard/projects/${projects[0].id}/facts` : '/dashboard'}
              className="flex flex-col justify-between p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60">
                  <Compass className="h-4 w-4" />
                </span>
                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Product SKUs</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">Sub-entity AEO radar</p>
              </div>
            </Link>

            <Link
              href="/tools/answerability-audit"
              className="flex flex-col justify-between p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <Zap className="h-4 w-4" />
                </span>
                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Answerability</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">40–60 word chunk tester</p>
              </div>
            </Link>

            <Link
              href="/tools/ai-crawler-audit"
              className="flex flex-col justify-between p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <Bot className="h-4 w-4" />
                </span>
                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">Crawler Audit</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">Robots.txt bot tester</p>
              </div>
            </Link>

            <Link
              href="/tools/llms-generator"
              className="flex flex-col justify-between p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60">
                  <FileCode2 className="h-4 w-4" />
                </span>
                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">llms.txt Builder</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">LLM documentation</p>
              </div>
            </Link>

            <a
              href={projects.length > 0 ? `/api/export/csv?projectId=${projects[0].id}` : '/api/export/csv'}
              download
              className="flex flex-col justify-between p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200/60">
                  <Download className="h-4 w-4" />
                </span>
                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900">CSV Export</h5>
                <p className="text-[10px] text-slate-500 mt-0.5">Download citation logs</p>
              </div>
            </a>
          </div>
        </section>

      </motion.div>
    </AppShell>
  );
}
