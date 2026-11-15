import type { Metadata } from 'next';
import Link from 'next/link';
import { LogoMark } from '@/components/landing/BrandLogos';
import {
  Sparkles,
  Bot,
  FileCode2,
  BookOpen,
  Scale,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'AEO Resources & Diagnostic Tools — Free Guides & Generators',
  description:
    'Free AEO resources including AI crawler audit tool, llms.txt generator, keyword discovery guides, and competitive benchmarks.',
  alternates: {
    canonical: '/resources',
  },
  openGraph: { type: 'website', locale: 'en_US' },
};

const resources = [
  {
    title: 'AI Crawler Readiness Audit',
    description: 'Check if your website is properly configured for AI crawlers like GPTBot, ClaudeBot, and PerplexityBot.',
    href: '/tools/ai-crawler-audit',
    badge: 'Diagnostic Tool',
    icon: Bot,
    color: 'bg-slate-50 text-slate-900 border-slate-200',
  },
  {
    title: 'llms.txt Knowledge Generator',
    description: 'Generate honest, authoritative llms.txt files structured for LLM indexers and IDE assistants.',
    href: '/tools/llms-generator',
    badge: 'Interactive Generator',
    icon: FileCode2,
    color: 'bg-lime-50 text-lime-700 border-lime-200',
  },
  {
    title: 'AEO vs SEO Strategic Blueprint',
    description: 'Learn the architectural differences between traditional Google SEO and Answer Engine Optimization.',
    href: '/blog/aeo-vs-seo',
    badge: 'Deep Dive Guide',
    icon: BookOpen,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  },
  {
    title: 'What is AEO? The 2026 Handbook',
    description: 'Complete guide explaining citation share, hallucination defense, and brand entity recognition.',
    href: '/blog/what-is-aeo',
    badge: 'Executive Briefing',
    icon: BookOpen,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
  },
  {
    title: 'Compare AEO Platforms Matrix',
    description: 'Side-by-side comparison matrix showing capabilities against legacy SEO platforms and $250+/mo tools.',
    href: '/compare',
    badge: 'Benchmark',
    icon: Scale,
    color: 'bg-amber-50 text-amber-600 border-amber-100',
  },
  {
    title: 'Free Public AEO Visibility Audit',
    description: 'Run an instant live diagnostics check on any business domain across 6 answer engines.',
    href: '/',
    badge: 'Live Scanner',
    icon: Search,
    color: 'bg-purple-50 text-purple-600 border-purple-100',
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto py-3.5 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2.5 group">
            <LogoMark className="h-7 w-7" />
            <span className="font-sans font-bold text-base tracking-tight text-slate-900">
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
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Developer Tools &amp; Knowledge Hub
            </div>
            <h1 className="font-sans text-3xl sm:text-5xl font-bold tracking-tight text-white">
              AEO Diagnostic Tools &amp; <span className="text-cyan-300">Knowledge Hub</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Utility tools, crawler validators, and foundational documentation to optimize your domain for ChatGPT Search, Perplexity, Google AI Overviews, and Claude citations.
            </p>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-card hover:border-slate-300 hover:shadow-card-hover transition-all duration-150"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/90 shadow-2xs ${item.color}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <h2 className="font-sans text-base font-bold text-slate-950 group-hover:text-slate-900 transition-colors mb-2">
                    {item.title}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-slate-900 transition-colors">
                  <span>Explore Tool</span>
                  <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA Card */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-8 sm:p-10 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="font-sans text-xl sm:text-2xl font-bold text-slate-950">
              Want a comprehensive audit for your domain?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Start with a free real-time multi-engine audit in 60 seconds.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <span>Launch Free Studio</span>
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
              <span className="font-sans text-sm font-bold tracking-tight text-slate-900">
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
              <span className="h-1.5 w-1.5 rounded-full bg-slate-50" />
              All systems operational · Enterprise telemetry active
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
