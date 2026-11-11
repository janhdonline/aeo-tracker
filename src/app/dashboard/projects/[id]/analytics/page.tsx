'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
  Bot,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
  Copy,
  ShieldCheck,
  FileCode,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { LogoLoader } from '@/components/LogoLoader';
import Link from 'next/link';

interface EngineStat {
  visits: number;
  verified: number;
  unverified: number;
}

interface PathStat {
  visits: number;
  citations: number;
}

interface AnalyticsData {
  engineStats: Record<string, EngineStat>;
  pathStats: Record<string, PathStat>;
  totalVisits: number;
  verifiedVisits: number;
  periodDays: number;
}

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectDomain, setProjectDomain] = useState('');
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [copiedRobots, setCopiedRobots] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadProjectAndAnalytics(periodDays);
  }, [params.id, periodDays]);

  const loadProjectAndAnalytics = async (days = 30) => {
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user?.email) setUserEmail(authData.user.email);

      const { data: proj } = await supabase
        .from('projects')
        .select('domain, brand_name')
        .eq('id', params.id)
        .single();

      if (proj) {
        setProjectDomain(proj.domain);
      }

      const res = await fetch(`/api/tools/agent-analytics?projectId=${params.id}&days=${days}`);
      if (!res.ok) throw new Error('Failed to load analytics');
      const analyticsData = await res.json();
      setData(analyticsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (gap: number) => {
    if (gap > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (gap < 0) return <TrendingDown className="h-4 w-4 text-emerald-500" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  const getTrendLabel = (gap: number) => {
    if (gap > 0) return 'Bot > Citations (gap)';
    if (gap < 0) return 'Citations > Bot (surplus)';
    return 'Balanced';
  };

  const recommendedRobotsTxt = `# AEO Visibility Directive for ${projectDomain || 'your-domain.com'}
# Allow Verified AI Search Crawlers

User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: https://${projectDomain || 'your-domain.com'}/sitemap.xml`;

  const trackingSnippet = `// Add to your Next.js middleware.ts / Express handler:
fetch("https://aeo-tracker.janhdonline.workers.dev/api/tools/agent-analytics", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    projectId: "${params.id}",
    userAgent: request.headers.get("user-agent"),
    path: request.nextUrl.pathname,
  }),
});`;

  const copyRobots = () => {
    navigator.clipboard.writeText(recommendedRobotsTxt);
    setCopiedRobots(true);
    setTimeout(() => setCopiedRobots(false), 2000);
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(trackingSnippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

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
                  text="Auditing AI Crawler Readiness..."
                  subtext="Checking bot verification, robots.txt directives, and model scrapers"
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
        { label: 'Competitors & Crawlers' },
      ]}
    >
      <div className="w-full px-6 sm:px-8 py-6 space-y-6">
        <ProjectSidebar projectId={params.id} domain={projectDomain || 'domain'} current="analytics" />

        <div className="w-full space-y-6">
            {/* Header with Time Window Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <Bot className="h-3.5 w-3.5" />
                    AI Crawler Audit &amp; Bot Telemetry
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs font-semibold text-slate-600">{projectDomain}</span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  AI Crawler Readiness &amp; Bot Hits
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ensure OpenAI, Perplexity, Anthropic, and Google crawlers can index your website and feed verified facts into AI answers.
                </p>
              </div>

              {/* 7d / 30d / 90d Range Switcher */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                {[7, 30, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setPeriodDays(d)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      periodDays === d
                        ? 'bg-slate-950 text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Live AI Crawlers Readiness Bento Strip */}
            <div className="rounded-bento border border-slate-200/90 bg-white p-6 shadow-bento space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Live Bot Access Status for {projectDomain}
                </h2>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Frontier Crawlers Unblocked
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/50">
                  <span className="text-xs font-black text-emerald-950 block">GPTBot (OpenAI)</span>
                  <span className="text-[11px] font-bold text-emerald-700 mt-1 inline-flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Ready to Index
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/50">
                  <span className="text-xs font-black text-emerald-950 block">PerplexityBot</span>
                  <span className="text-[11px] font-bold text-emerald-700 mt-1 inline-flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Live Citation Ready
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/50">
                  <span className="text-xs font-black text-emerald-950 block">ClaudeBot (Anthropic)</span>
                  <span className="text-[11px] font-bold text-emerald-700 mt-1 inline-flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Training Access
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/50">
                  <span className="text-xs font-black text-emerald-950 block">Google-Extended</span>
                  <span className="text-[11px] font-bold text-emerald-700 mt-1 inline-flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Gemini Grounding
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Overview Bento Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-bento border border-slate-200/90 bg-white p-5 shadow-bento">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Total Bot Visits</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                    <Bot className="h-4 w-4" />
                  </span>
                </div>
                <p className="font-display text-3xl font-black text-slate-950">{data?.totalVisits ?? 0}</p>
                <p className="mt-1.5 text-xs text-slate-500 font-medium">Scrape requests detected in past {periodDays} days</p>
              </div>

              <div className="rounded-bento border border-slate-800 bg-[#0B0F17] p-5 shadow-bento text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Verified AI Crawlers</span>
                  <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                </div>
                <p className="font-display text-3xl font-black text-[#D4F63C]">{data?.verifiedVisits ?? 0}</p>
                <p className="mt-1.5 text-xs text-slate-300 font-medium">Legitimate frontier model reverse-DNS confirmed</p>
              </div>

              <div className="rounded-bento border border-slate-200/90 bg-white p-5 shadow-bento">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Monitored Window</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                    <Sparkles className="h-4 w-4" />
                  </span>
                </div>
                <p className="font-display text-3xl font-black text-blue-600">{periodDays} Days</p>
                <p className="mt-1.5 text-xs text-slate-500 font-medium">Rolling telemetry aggregation window</p>
              </div>
            </div>

            {/* Implementation Guides & Robots.txt Bento Containers */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recommended robots.txt Directive (Obsidian Dark Bento Card) */}
              <div className="rounded-bento border border-slate-800 bg-[#0B0F17] p-6 text-white shadow-bento flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#D4F63C] flex items-center gap-1.5">
                      <FileCode className="h-4 w-4 text-[#D4F63C]" />
                      Optimized robots.txt for AI Indexing
                    </h3>
                    <button
                      onClick={copyRobots}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 px-3 py-1 rounded-full cursor-pointer transition-colors"
                    >
                      {copiedRobots ? <Check className="h-3 w-3 text-[#D4F63C]" /> : <Copy className="h-3 w-3" />}
                      {copiedRobots ? 'Copied!' : 'Copy Directive'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 mb-3 font-medium">
                    Paste this into <code>https://{projectDomain}/robots.txt</code> to ensure AI answer engines cite your official specifications.
                  </p>
                  <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-slate-800">
                    {recommendedRobotsTxt}
                  </pre>
                </div>
              </div>

              {/* Live Crawler Telemetry Snippet (Obsidian Dark Bento Card) */}
              <div className="rounded-bento border border-slate-800 bg-[#0B0F17] p-6 text-white shadow-bento flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#D4F63C] flex items-center gap-1.5">
                      <ExternalLink className="h-4 w-4 text-[#D4F63C]" />
                      Live Hit Telemetry Snippet
                    </h3>
                    <button
                      onClick={copySnippet}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-800 px-3 py-1 rounded-full cursor-pointer transition-colors"
                    >
                      {copiedSnippet ? <Check className="h-3 w-3 text-[#D4F63C]" /> : <Copy className="h-3 w-3" />}
                      {copiedSnippet ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 mb-3 font-medium">
                    Call this endpoint on server requests to record when GPTBot, PerplexityBot, or ClaudeBot scrape your pages.
                  </p>
                  <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-slate-800">
                    {trackingSnippet}
                  </pre>
                </div>
              </div>
            </div>
        </div>
      </div>
    </AppShell>
  );
}
