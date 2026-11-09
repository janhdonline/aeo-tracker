export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import Link from 'next/link';
import { LogoMark } from '@/components/landing/BrandLogos';
import {
  Globe,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Bot,
  Sparkles,
  BarChart3,
  ExternalLink,
  Compass,
  Link2,
  Share2,
  AlertTriangle,
  Download,
} from 'lucide-react';

interface Props {
  params: { domain: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const domain = decodeURIComponent(params.domain);
  return {
    title: `${domain} - AI Visibility & AEO Benchmark Report`,
    description: `See how ${domain} performs in AI-generated answers across ChatGPT, Perplexity, Claude, and Gemini. Powered by AEO Checker.`,
    openGraph: {
      title: `${domain} - AI Visibility & AEO Benchmark Report`,
      description: `AI visibility score, share of voice, and citation benchmarks for ${domain}`,
      type: 'website',
    },
  };
}

export default async function PublicReportPage({ params }: Props) {
  const domain = decodeURIComponent(params.domain);
  const supabase = await createClient();

  // Get current user if authenticated
  let user: any = null;
  try {
    const authRes = await supabase.auth.getUser();
    user = authRes?.data?.user || null;
  } catch {
    user = null;
  }

  // Get project by domain (public access)
  const { data: project } = await supabase
    .from('projects')
    .select('id, domain, brand_name, user_id, created_at')
    .eq('domain', domain)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <Globe className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Report Not Found</h1>
          <p className="text-sm text-slate-500 mt-2">
            No public AEO tracking report is registered for <strong>{domain}</strong> yet.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Track this domain for free
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user && user.id === project.user_id;

  // Get latest snapshot score
  const { data: latestScore } = await supabase
    .from('snapshot_scores')
    .select('*')
    .eq('project_id', project.id)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Get historical snapshots
  const { data: scoreHistory } = await supabase
    .from('snapshot_scores')
    .select('snapshot_date, visibility_score, share_of_voice_pct, total_mentions, keywords_covered, keywords_total')
    .eq('project_id', project.id)
    .order('snapshot_date', { ascending: false })
    .limit(6);

  // Get fix briefs
  const { data: briefs } = await supabase
    .from('fix_briefs')
    .select('id, gap_type, gap_description, created_at')
    .eq('project_id', project.id)
    .order('created_at', { ascending: false })
    .limit(4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AEO Visibility Tracker',
    description: `AI visibility score and answer engine benchmark for ${project.domain}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#F8FAFC]">
        {/* Navigation Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-2.5 group">
                  <LogoMark className="h-8 w-8" />
                  <span className="font-display font-bold text-base text-slate-900 tracking-tight group-hover:text-slate-700 transition-colors">
                    AEO Checker
                  </span>
                </Link>
                <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 border border-slate-200">
                  Public Benchmark
                </span>
              </div>

              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1"
                    >
                      Dashboard
                    </Link>
                    {isOwner ? (
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
                      >
                        Project Workspace
                        <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                      >
                        My Dashboard
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                    >
                      Track for Free
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Owner Ribbon */}
          {isOwner && (
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      You are viewing your tracked property
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      This is the public share link for {project.domain}. Manage keywords, run live scans, and access source blueprints from your workspace.
                    </p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors self-start sm:self-auto"
                >
                  Manage in Workspace
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                </Link>
              </div>
            </div>
          )}

          {/* Hero Domain Overview Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <Globe className="h-5 w-5" />
                  </span>
                  <div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                      {project.domain}
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                      AI Visibility & Citation Benchmark for <span className="font-semibold text-slate-700">{project.brand_name || project.domain}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Automated Weekly Tracking
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                  <Bot className="h-3.5 w-3.5 text-slate-500" />
                  4 AI Engines
                </span>
                <a
                  href={`/api/export/pdf?projectId=${project.id}`}
                  download
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  Export PDF
                </a>
              </div>
            </div>

            {/* If Latest Score Exists: Display Rich Benchmark Stats */}
            {latestScore ? (
              <div className="pt-6 space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700">
                      Visibility Score
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-blue-900">
                        {latestScore.visibility_score}
                      </span>
                      <span className="text-xs font-bold text-blue-600">/100</span>
                    </div>
                    <span className="mt-1 block text-[10px] text-blue-700/80">
                      Multi-pass verified accuracy
                    </span>
                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                      Share of Voice
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-emerald-900">
                        {latestScore.share_of_voice_pct}%
                      </span>
                    </div>
                    <span className="mt-1 block text-[10px] text-emerald-700/80">
                      vs tracked competitor set
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Total Mentions
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {latestScore.total_mentions}
                      </span>
                    </div>
                    <span className="mt-1 block text-[10px] text-slate-500">
                      Direct AI model citations
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Coverage Ratio
                    </span>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold text-slate-900">
                        {latestScore.keywords_covered ?? 0}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        /{latestScore.keywords_total ?? 0}
                      </span>
                    </div>
                    <span className="mt-1 block text-[10px] text-slate-500">
                      Target commercial prompts
                    </span>
                  </div>
                </div>

                {/* Engine Breakdown Strip */}
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Monitored AI Answer Engines
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-100 bg-slate-50/80">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Perplexity AI</p>
                        <p className="text-[10px] text-slate-400">Live Web Citations</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-100 bg-slate-50/80">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">ChatGPT</p>
                        <p className="text-[10px] text-slate-400">SearchGPT Index</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-100 bg-slate-50/80">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Google Gemini</p>
                        <p className="text-[10px] text-slate-400">Overview Synthesis</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-100 bg-slate-50/80">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">Anthropic Claude</p>
                        <p className="text-[10px] text-slate-400">Entity Knowledge</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Score History Table */}
                {scoreHistory && scoreHistory.length > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Historical Benchmark Snapshots
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                          <tr>
                            <th className="px-4 py-2.5">Date</th>
                            <th className="px-4 py-2.5">Visibility Score</th>
                            <th className="px-4 py-2.5">Share of Voice</th>
                            <th className="px-4 py-2.5">Mentions</th>
                            <th className="px-4 py-2.5">Prompt Coverage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {scoreHistory.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="px-4 py-2.5 font-medium">{item.snapshot_date}</td>
                              <td className="px-4 py-2.5 font-bold text-blue-600">
                                {item.visibility_score}/100
                              </td>
                              <td className="px-4 py-2.5 font-semibold text-emerald-600">
                                {item.share_of_voice_pct}%
                              </td>
                              <td className="px-4 py-2.5">{item.total_mentions}</td>
                              <td className="px-4 py-2.5">
                                {item.keywords_covered ?? 0}/{item.keywords_total ?? 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* If No Scans Yet: Benchmark Queued & Active Status (Image 3 fix) */
              <div className="pt-6 space-y-6">
                <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 p-6 sm:p-8">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 mb-3">
                      <Sparkles className="h-3.5 w-3.5" />
                      Tracking Enrolled & Active
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Initial AEO Benchmark Queued for {project.domain}
                    </h2>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {project.domain} is actively registered for automated weekly AI engine monitoring.
                      Initial snapshot scores will populate automatically upon the first benchmark run.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      {isOwner ? (
                        <Link
                          href={`/dashboard/projects/${project.id}`}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all"
                        >
                          Run Live Scan Now in Dashboard
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : user ? (
                        <Link
                          href="/dashboard"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all"
                        >
                          Go to Dashboard
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      ) : (
                        <Link
                          href="/login"
                          className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 transition-all"
                        >
                          Track Your Website Free
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview of Monitored Capabilities */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    What This AEO Benchmark Tracks
                  </h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                        <Share2 className="h-4 w-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">AI Share of Voice</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Measures how frequently {project.brand_name || project.domain} is recommended over direct market competitors.
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                        <Compass className="h-4 w-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Citation Sources</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Reverse-engineers the exact Reddit threads, G2 reviews, and editorial URLs LLMs cite in user answers.
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-900">Fact & Hallucination Watch</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Detects inaccurate pricing, outdated features, or hallucinations cited by AI models about your brand.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {user
                  ? `Signed in as ${user.email}`
                  : 'Want to optimize your brand visibility in AI answers?'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {user
                  ? 'Access your full optimization workspace, source blueprints, and automated alerts.'
                  : 'Join 63,100+ marketers monitoring their brand presence on ChatGPT, Perplexity, and Claude.'}
              </p>
            </div>
            <div>
              {user ? (
                <Link
                  href={isOwner ? `/dashboard/projects/${project.id}` : '/dashboard'}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                >
                  {isOwner ? 'Open Project Workspace' : 'Go to Dashboard'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                >
                  Get started free
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
