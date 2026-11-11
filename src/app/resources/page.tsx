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
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
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
        {/* Obsidian Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0B0F17] p-8 sm:p-14 text-white border border-slate-800 shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-lime-500/15 blur-3xl" />
          <div className="relative max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-lime-400/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#D4F63C] ring-1 ring-lime-400/20">
              <Sparkles className="h-3.5 w-3.5 text-[#D4F63C]" />
              Knowledge Hub &amp; Tooling
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Free AEO Tools, Research &amp; <span className="text-[#D4F63C]">Knowledge Base</span>
            </h1>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Everything you need to optimize your brand for ChatGPT Search, Perplexity, Google AI Overviews, and Claude citations.
            </p>
          </div>
        </div>

        {/* Bento Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-7 shadow-card hover:border-slate-900/20 hover:shadow-xl transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-xs ${item.color}`}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <h2 className="text-base font-black text-slate-950 group-hover:text-emerald-600 transition-colors mb-2">
                    {item.title}
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                  <span>Explore Resource</span>
                  <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 shadow-card flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              Want a comprehensive audit for your business?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Start free today — unlock live answer engine benchmarking in 60 seconds.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-xs font-black text-white shadow-xs hover:bg-slate-800 transition cursor-pointer shrink-0"
          >
            <span>Launch Free Studio</span>
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
