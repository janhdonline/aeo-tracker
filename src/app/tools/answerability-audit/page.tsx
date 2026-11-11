'use client';

import Link from 'next/link';
import { AnswerabilityAuditCard } from '@/components/AnswerabilityAuditCard';
import {
  Zap,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Bot,
} from 'lucide-react';

export default function AnswerabilityToolPage() {
  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Banner Navigation */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/tools/ai-crawler-audit"
              className="text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Crawler Audit
            </Link>
            <Link
              href="/tools/llms-generator"
              className="text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              llms.txt Builder
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
            >
              Start Free Audit
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <Zap className="h-3.5 w-3.5" />
            <span>Generative Search Quotation Standard</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Content &quot;Answerability&quot; Diagnostic
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Test whether your website text satisfies the <strong>40–60 word chunking rule</strong>. AI models (ChatGPT Search, Google AI Overviews, Perplexity) lift concise definition passages verbatim when prospective buyers search for category recommendations.
          </p>
        </div>

        {/* Primary Interactive Diagnostic Card */}
        <AnswerabilityAuditCard domain="yourbrand.com" />

        {/* 3 Strategic Rules of AI Answerability */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-100">
              01
            </div>
            <h3 className="font-display text-base font-bold text-slate-900">
              The 40–60 Word Window
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Long paragraphs over 80 words get truncated or summarized away by LLMs. Keeping core definition passages between 40 and 60 words gives ChatGPT and Perplexity exact blocks to quote verbatim.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
              02
            </div>
            <h3 className="font-display text-base font-bold text-slate-900">
              First Sentence Category Rule
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Always follow your H1 heading with <em>&ldquo;[Brand] is a [Category] that [Core Benefit]&rdquo;</em>. Generative engines use this first sentence for entity grounding and head-to-head comparison answers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm border border-amber-100">
              03
            </div>
            <h3 className="font-display text-base font-bold text-slate-900">
              FAQ Schema Synergy
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mirroring your 45-word definition passages in JSON-LD FAQPage schema yields 2.4x higher quotation frequency in Google AI Overviews and Perplexity Pro citations.
            </p>
          </div>
        </section>

        {/* CTA Footer Card */}
        <section className="rounded-3xl border border-slate-900 bg-slate-900 text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-card">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-display text-xl sm:text-2xl font-bold">
              Want automated answerability audits across all your pages?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Track multi-engine AI visibility, competitor citation leaks, and crawl your entire website with AEO Tracker.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all shrink-0 cursor-pointer"
          >
            <span>Open AEO Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
    </div>
  );
}
