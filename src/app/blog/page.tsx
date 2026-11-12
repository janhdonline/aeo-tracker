import type { Metadata } from 'next';
import Link from 'next/link';
import { LogoMark } from '@/components/landing/BrandLogos';
import {
  Sparkles,
  Calendar,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Engineering & Research Blog — AEO Tracker',
  description:
    'Tactical guides, empirical case studies, and algorithmic analysis on Answer Engine Optimization and generative AI search citations.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    title: 'AEO Tracker Research & Engineering Blog',
    description:
      'Learn how frontier AI search engines cite, synthesize, and rank brands in conversational search.',
    url: '/blog',
    type: 'website',
  },
};

const posts = [
  {
    slug: 'what-is-aeo-geo',
    title: 'The Comprehensive 2026 Guide to AEO and GEO',
    excerpt:
      'How answer engines synthesize recommendations differently from traditional search crawlers—and the 4-layer citation framework to capture them.',
    date: 'Nov 02, 2026',
    category: 'Foundations',
  },
  {
    slug: 'how-to-optimize-for-perplexity',
    title: 'Reverse Engineering Perplexity Sonar Citations',
    excerpt:
      'A deep dive into Perplexity’s retrieval-augmented architecture, domain authority weightings, and how to structure technical docs for inclusion.',
    date: 'Oct 28, 2026',
    category: 'Technical AEO',
  },
  {
    slug: 'llms-txt-best-practices',
    title: 'llms.txt Architecture: Best Practices for Enterprise Brands',
    excerpt:
      'Why modern frontier models prioritize standardized /llms.txt manifests and how to implement clean machine-readable documentation.',
    date: 'Oct 20, 2026',
    category: 'Standards',
  },
  {
    slug: 'chatgpt-search-seo-strategy',
    title: 'How ChatGPT Selects Source Citations for Commercial Queries',
    excerpt:
      'Empirical analysis of 10,000 commercial buying queries across OpenAI Search: which directories, reviews, and publishers matter most.',
    date: 'Oct 12, 2026',
    category: 'Data Studies',
  },
  {
    slug: 'ai-hallucination-defense',
    title: 'The AI Hallucination Defense Playbook for B2B Tech',
    excerpt:
      'How to detect and correct hallucinated pricing, legacy product specs, and phantom deprecations across LLM knowledge stores.',
    date: 'Oct 05, 2026',
    category: 'Analytics',
  },
];

export default function BlogPage() {
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
              Engineering &amp; Empirical Research
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
              The Answer Engine <span className="text-emerald-400">Optimization Journal</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Algorithmic reverse-engineering, empirical citation data studies, and architectural blueprints for capturing AI answer recommendations.
            </p>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-card hover:border-slate-300 hover:shadow-card-hover transition-all duration-150"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {post.date}
                  </span>
                </div>

                <h2 className="font-display text-base font-bold text-slate-950 group-hover:text-emerald-700 transition-colors mb-2.5 leading-snug">
                  {post.title}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                <span>Read Analysis</span>
                <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
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
