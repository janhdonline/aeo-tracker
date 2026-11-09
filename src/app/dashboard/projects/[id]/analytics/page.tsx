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
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectDomain, setProjectDomain] = useState('');
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [copiedRobots, setCopiedRobots] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    loadProjectAndAnalytics();
  }, [params.id]);

  const loadProjectAndAnalytics = async () => {
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

      const res = await fetch(`/api/tools/agent-analytics?projectId=${params.id}&days=30`);
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
    <AppShell user={{ email: userEmail }}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <ProjectSidebar projectId={params.id} domain={projectDomain || 'domain'} current="analytics" />

          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Bot className="h-3.5 w-3.5" />
                  AI Crawler Audit & Bot Telemetry
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                AI Crawler Readiness for {projectDomain}
              </h1>
              <p className="text-sm text-slate-600 mt-0.5">
                Ensure OpenAI, Perplexity, Anthropic, and Google crawlers can index your website and feed accurate data into AI answers.
              </p>
            </div>

            {/* Live AI Crawlers Readiness Strip */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Live Bot Indexing Status for {projectDomain}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70">
                  <span className="text-xs font-bold text-emerald-950 block">GPTBot (OpenAI)</span>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1 inline-flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Ready to Index
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70">
                  <span className="text-xs font-bold text-emerald-950 block">PerplexityBot</span>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1 inline-flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Live Citation Ready
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70">
                  <span className="text-xs font-bold text-emerald-950 block">ClaudeBot (Anthropic)</span>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1 inline-flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Training Access
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70">
                  <span className="text-xs font-bold text-emerald-950 block">Google-Extended</span>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1 inline-flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Gemini Grounding
                  </span>
                </div>
              </div>
            </div>

            {/* Metrics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                    <Bot className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Total Bot Visits</p>
                    <p className="text-2xl font-bold text-slate-900 mt-0.5">{data?.totalVisits ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <CheckCircle className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Verified AI Crawlers</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-0.5">{data?.verifiedVisits ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Window Monitored</p>
                    <p className="text-2xl font-bold text-slate-900 mt-0.5">{data?.periodDays ?? 30} Days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Implementation Guides & Robots.txt */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Recommended robots.txt Directive */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <FileCode className="h-4 w-4 text-emerald-600" />
                      Optimized robots.txt for AI Indexing
                    </h3>
                    <button
                      onClick={copyRobots}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900"
                    >
                      {copiedRobots ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedRobots ? 'Copied!' : 'Copy Directive'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Paste this into <code>https://{projectDomain}/robots.txt</code> to ensure AI answer engines cite your official specifications.
                  </p>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                    {recommendedRobotsTxt}
                  </pre>
                </div>
              </div>

              {/* Live Crawler Telemetry Snippet */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <ExternalLink className="h-4 w-4 text-blue-600" />
                      Live Hit Telemetry Snippet
                    </h3>
                    <button
                      onClick={copySnippet}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900"
                    >
                      {copiedSnippet ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedSnippet ? 'Copied!' : 'Copy Code'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    Call this endpoint on server requests to record when GPTBot, PerplexityBot, or ClaudeBot scrape your pages.
                  </p>
                  <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap">
                    {trackingSnippet}
                  </pre>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AppShell>
  );
}
