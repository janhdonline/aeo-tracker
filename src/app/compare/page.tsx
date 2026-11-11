import type { Metadata } from 'next';
import Link from 'next/link';
import { LogoMark } from '@/components/landing/BrandLogos';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Layers,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'AEO Tools Comparison — Best AI Visibility Trackers 2026',
  description:
    'Compare the best AEO and AI visibility tracking tools. See how AEO Tracker differs from legacy SEO platforms and high-priced enterprise software.',
  alternates: {
    canonical: '/compare',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/compare',
  },
};

const comparisons = [
  {
    feature: 'Multi-Engine AI Coverage',
    description: 'Surveillance across all major frontier answer engines simultaneously',
    ours: 'All 10 Engines (ChatGPT, Perplexity, Gemini, Claude, Grok, DeepSeek, Mistral)',
    others: 'Restricted to 1-2 engines or simulated proxies',
    win: true,
  },
  {
    feature: 'Actionable Fix Briefs & Blueprint Kanban',
    description: 'Automated guidance showing which citation sources will win mentions',
    ours: 'AI-generated fix briefs with exact citation URLs (Reddit, G2, Wiki)',
    others: 'Raw ranking graphs only — no step-by-step fix blueprints',
    win: true,
  },
  {
    feature: 'Ground Truth & Hallucination Sentinel',
    description: 'Surveillance against false pricing quotes and specs in AI answers',
    ours: 'Autonomous watchdog flagging false answers with 100% confidence',
    others: 'No hallucination detection or brand facts verification',
    win: true,
  },
  {
    feature: '14-Day Post-Fix Verification Loop',
    description: 'Continuous validation to verify if citation recommendations worked',
    ours: 'Automated re-scan loop checking citation capture after 14 days',
    others: 'Manual guesswork — no automated verification pipeline',
    win: true,
  },
  {
    feature: 'Authoritative llms.txt & Crawler Engine',
    description: 'Full suite to generate, host, and validate knowledge files for GPTBot',
    ours: 'Built-in llms.txt generator, host validator & crawler simulator',
    others: 'Not offered or requires third-party plugins',
    win: true,
  },
  {
    feature: 'Transparent Flat Pricing',
    description: 'Simple and affordable subscription without aggressive annual contracts',
    ours: 'Free tier + Flat $49–$79/mo (All engines included, cancel anytime)',
    others: '$250 to $1,500/mo enterprise lock-in with mandatory sales calls',
    win: true,
  },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans antialiased text-slate-900 selection:bg-[#D4F63C] selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2.5 group">
            <LogoMark className="h-8 w-8" />
            <span className="font-black text-lg tracking-tight group-hover:text-slate-800 transition-colors">
              AEO Checker
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="text-xs font-bold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-xl transition"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-xl transition"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white shadow-xs hover:bg-slate-800 transition"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 w-full space-y-12">
        {/* Obsidian Bento Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0B0F17] p-8 sm:p-14 text-white border border-slate-800 shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-lime-500/15 blur-3xl" />
          <div className="relative max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-lime-400/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#D4F63C] ring-1 ring-lime-400/20">
              <Sparkles className="h-3.5 w-3.5 text-[#D4F63C]" />
              Competitive Benchmark
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Why Forward-Thinking Teams Choose <span className="text-[#D4F63C]">AEO Tracker</span>
            </h1>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Legacy SEO suites are built for a world of 10 blue links. AEO Tracker is purpose-engineered from the ground up for the generative search era.
            </p>
          </div>
        </div>

        {/* Bento Comparison Table Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/90">
                  <th className="py-4 pl-4 pr-6 text-xs font-black uppercase tracking-wider text-slate-950 w-2/5">
                    Strategic Capability
                  </th>
                  <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50/60 rounded-t-2xl w-2/5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-950 text-[#D4F63C] text-[10px]">
                        ★
                      </span>
                      <span>AEO Tracker</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 text-xs font-black uppercase tracking-wider text-slate-400 w-1/5">
                    Legacy / Other Tools
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {comparisons.map((row) => (
                  <tr key={row.feature} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-5 pl-4 pr-6 align-top">
                      <div className="font-black text-slate-900 text-sm">{row.feature}</div>
                      <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {row.description}
                      </div>
                    </td>
                    <td className="py-5 px-6 align-top bg-emerald-50/30 font-bold text-slate-900">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{row.ours}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 align-top text-slate-500">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
                        <span className="leading-snug">{row.others}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xs mb-4">
              <Zap className="h-5 w-5 text-[#D4F63C]" />
            </span>
            <h2 className="text-sm font-black text-slate-950 mb-1">Instant Setup in &lt;60s</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              No complex DNS configurations, server agents, or tracking pixels. Simply input your domain and get instant multi-engine intelligence.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs mb-4">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h2 className="text-sm font-black text-slate-950 mb-1">Bank-Grade Data Privacy</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your business keywords and intelligence queries are never sold or pooled. Isolated workspaces keep your strategy protected.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs mb-4">
              <Layers className="h-5 w-5" />
            </span>
            <h2 className="text-sm font-black text-slate-950 mb-1">Zero Lock-In Contracts</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Month-to-month flexibility with one-click cancellation. No 12-month lock-in contracts or surprise enterprise overages.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Start outranking your competitors in AI search
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Join leading tech founders and growth marketers on AEO Tracker.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-xs font-black text-white shadow-xs hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <span>Start Free Today</span>
            <ArrowRight className="h-4 w-4 text-[#D4F63C]" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark className="h-8 w-8" />
              <span className="text-[15px] font-black tracking-[-0.03em] text-[#0B0F17]">
                AEO Tracker
              </span>
            </Link>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                { label: 'Pricing', href: '/pricing' },
                { label: 'About', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Compare', href: '/compare' },
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-slate-100 pt-6 text-[11px] font-medium text-slate-400 sm:flex-row">
            <p>© 2026 AEO Tracker. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
              Built for the AI Answer Engine era.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
