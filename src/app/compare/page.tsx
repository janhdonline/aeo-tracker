import type { Metadata } from 'next';
import Link from 'next/link';
import { LogoMark } from '@/components/landing/BrandLogos';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Layers,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Compare AEO Tracker vs. Legacy SEO Platforms',
  description:
    'See how AEO Tracker differs from legacy SEO rank trackers with purpose-built generative engine monitoring across ChatGPT, Gemini, Perplexity, and Claude.',
  alternates: {
    canonical: '/compare',
  },
};

const comparisons = [
  {
    feature: 'Answer Engine Multi-Model Parity',
    description: 'Direct diagnostic queries across ChatGPT, Gemini, Perplexity, Claude & DeepSeek',
    ours: 'Built-in support across 5+ frontier generative engines',
    others: 'Google/Bing 10-blue-links SERPs only or single-engine beta',
    win: true,
  },
  {
    feature: 'Generative Attribution & Citation Mining',
    description: 'Identifies the precise URLs, forums, and documentation citations feeding AI answers',
    ours: 'Deep source citation mining with citability gap scores',
    others: 'Rank positions only, without answer attribution',
    win: true,
  },
  {
    feature: 'Hallucination & Brand Sentiment Radar',
    description: 'Detects false product claims, outdated pricing, and sentiment drift in real time',
    ours: 'Continuous hallucination monitoring & positive sentiment benchmarks',
    others: 'No brand reputation or hallucination diagnostics',
    win: true,
  },
  {
    feature: 'llms.txt Generator & Host Validator',
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
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto py-3.5 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2.5 group">
            <LogoMark className="h-7 w-7" />
            <span className="font-display font-bold text-base tracking-tight text-slate-900">
              AEO Tracker
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/pricing"
              className="text-xs font-semibold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-lg transition"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-2xs hover:bg-slate-800 transition"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-12">
        {/* Executive Slate Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-8 sm:p-12 text-white border border-slate-800 shadow-card">
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-15" aria-hidden="true" />
          <div className="relative max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3.5 py-1 text-xs font-medium text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              Competitive Architecture Benchmark
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Why High-Growth Teams Choose <span className="text-emerald-400">AEO Tracker</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Legacy SEO suites were built for traditional search engines and 10 blue links. AEO Tracker is purpose-engineered from the ground up for the generative answer engine era.
            </p>
          </div>
        </div>

        {/* Comparison Table Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3.5 pl-4 pr-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-2/5">
                    Strategic Capability
                  </th>
                  <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-slate-900 bg-slate-50/80 rounded-t-xl w-2/5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-emerald-400 text-[10px]">
                        ★
                      </span>
                      <span>AEO Tracker</span>
                    </div>
                  </th>
                  <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-slate-400 w-1/5">
                    Legacy SEO Tools
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {comparisons.map((row) => (
                  <tr key={row.feature} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-4 pr-6 align-top">
                      <div className="font-display font-bold text-slate-900 text-sm">{row.feature}</div>
                      <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {row.description}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-top bg-slate-50/40 font-medium text-slate-900">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{row.ours}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 align-top text-slate-500">
                      <div className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{row.others}</span>
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
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs mb-4">
              <Zap className="h-5 w-5 text-emerald-400" />
            </span>
            <h2 className="font-display text-sm font-bold text-slate-950 mb-1">Audit Ready in &lt;60s</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              No complex server integrations, manual proxies, or tracking snippets. Enter your domain to run immediate multi-engine intelligence.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-2xs mb-4">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <h2 className="font-display text-sm font-bold text-slate-950 mb-1">Enterprise Data Privacy</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your domain keywords and intelligence telemetry are never aggregated or resold. Isolated workspace architecture protects your market advantage.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 shadow-2xs mb-4">
              <Layers className="h-5 w-5" />
            </span>
            <h2 className="font-display text-sm font-bold text-slate-950 mb-1">Zero Lock-In Contracts</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent month-to-month subscriptions with self-serve cancellation. No forced multi-year enterprise lock-ins.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-8 sm:p-10 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-950">
              Outrank competitors in generative answers today
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Join leading tech founders and growth marketers on AEO Tracker.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <span>Start Free Audit</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark className="h-7 w-7" />
              <span className="font-display text-sm font-bold tracking-tight text-slate-900">
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
                  className="text-xs font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row">
            <p>© 2026 AEO Tracker. All rights reserved.</p>
            <p className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              All systems operational · Enterprise telemetry active
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
