import type { Metadata } from 'next';
import Link from 'next/link';
import { LogoMark } from '@/components/landing/BrandLogos';
import { Sparkles, Calendar, Tag, ArrowRight, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AEO Blog & Engineering Insights — AI Search Optimization',
  description:
    'Learn about Answer Engine Optimization, AI search trends, and how to improve your brand visibility in ChatGPT, Gemini, and Perplexity.',
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'AEO Visibility Tracker',
  },
};

const posts = [
  {
    slug: 'what-is-aeo',
    title: 'What is AEO? The Complete Guide to Answer Engine Optimization',
    excerpt: 'Learn how Answer Engine Optimization works and why it matters for your brand in the age of AI search.',
    date: 'Nov 01, 2026',
    category: 'AEO Basics',
  },
  {
    slug: 'aeo-vs-seo',
    title: "AEO vs SEO: What's the Difference?",
    excerpt: 'Traditional SEO focuses on Google blue links. AEO focuses on AI syntheses. Here is how they differ and why you need both.',
    date: 'Oct 28, 2026',
    category: 'Strategy',
  },
  {
    slug: 'chatgpt-seo-guide',
    title: 'How to Get Mentioned in ChatGPT Answers',
    excerpt: 'Practical strategies to increase your brand visibility and source citations in ChatGPT responses.',
    date: 'Oct 20, 2026',
    category: 'ChatGPT',
  },
  {
    slug: 'google-gemini-seo',
    title: 'Google Gemini SEO: Optimizing for AI Overviews',
    excerpt: 'Gemini now powers Google AI Overviews. Learn how to get cited in authoritative summary boxes.',
    date: 'Oct 15, 2026',
    category: 'Google Gemini',
  },
  {
    slug: 'perplexity-optimization',
    title: 'How to Rank in Perplexity Answers',
    excerpt: 'Perplexity indexes citations differently than traditional search. Here is how to engineer your domain presence.',
    date: 'Oct 10, 2026',
    category: 'Perplexity',
  },
  {
    slug: 'ai-traffic-analytics',
    title: 'AI Bot Traffic: Analytics vs Reality',
    excerpt: 'Why traditional analytics mislead and how to track AI crawler visits (GPTBot, ClaudeBot) properly.',
    date: 'Oct 05, 2026',
    category: 'Analytics',
  },
];

export default function BlogPage() {
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
              Research &amp; Intelligence
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              The Answer Engine <span className="text-[#D4F63C]">Optimization Blog</span>
            </h1>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Latest tactical blueprints, algorithmic reverse-engineering, and case studies on how brands dominate AI citations.
            </p>
          </div>
        </div>

        {/* Bento Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-7 shadow-card hover:border-slate-900/20 hover:shadow-xl transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                    {post.category}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-black text-slate-950 group-hover:text-emerald-600 transition-colors mb-2.5 leading-snug">
                  {post.title}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                <span>Read Full Blueprint</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
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
