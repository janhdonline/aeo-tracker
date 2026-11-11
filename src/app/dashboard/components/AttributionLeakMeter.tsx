'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Zap,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface AttributionLeakMeterProps {
  domain?: string;
  brandName?: string;
  citationsCount?: number;
}

export function AttributionLeakMeter({
  domain = 'notion.so',
  brandName = 'Notion',
  citationsCount = 48,
}: AttributionLeakMeterProps) {
  const [showExplanation, setShowExplanation] = useState(false);

  // Realistic telemetry metrics
  const totalMentions = 1420;
  const verifiedCitations = citationsCount;
  const citationRate = ((verifiedCitations / totalMentions) * 100).toFixed(1);
  const leakedMentions = totalMentions - verifiedCitations;
  const estimatedLostTraffic = Math.round(leakedMentions * 0.18); // ~247 clicks lost/mo
  const estimatedLostValue = Math.round(estimatedLostTraffic * 48); // ~$11.8k pipeline

  return (
    <section className="relative rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5 overflow-hidden">
      {/* Background Amber/Rose Ambient Glow */}
      <div className="pointer-events-none absolute -top-24 right-0 h-64 w-96 rounded-full bg-gradient-to-br from-amber-100/35 via-rose-50/20 to-transparent blur-3xl -z-0" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-700 border border-amber-200 shadow-xs">
            <TrendingDown className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-slate-950">
                AI Traffic Leak & Attribution Conversion Meter
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                Opportunity Audit
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks how many times AI search engines mention <strong className="text-slate-800 font-semibold">{brandName}</strong> vs convert into clickable hyperlink citations.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>{showExplanation ? 'Hide Guide' : 'What is Attribution Leak?'}</span>
        </button>
      </div>

      {showExplanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-950 space-y-1.5"
        >
          <p className="font-bold flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
            The 2026 AI Attribution Gap
          </p>
          <p className="leading-relaxed text-amber-900/90">
            LLMs frequently mention brand names in synthesized answers without generating a clickable markdown hyperlink. Without a direct citation link, prospective commercial buyers cannot click through to your signup or pricing page. Converting unlinked text mentions into verified citations is the highest-ROI opportunity in AEO.
          </p>
        </motion.div>
      )}

      {/* Visual Conversion Funnel Meter */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Step 1: AI Brand Mentions */}
        <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            1. Total AI Impressions
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-2xl font-black text-slate-950 tabular-nums">
              {totalMentions.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">brand mentions</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across ChatGPT, Gemini, Perplexity, Claude
          </p>
        </div>

        {/* Step 2: Clickable Citations */}
        <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-300 ring-2 ring-emerald-200/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              2. Verified Hyperlinks
            </span>
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-2xl font-black text-emerald-950 tabular-nums">
              {verifiedCitations}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
              {citationRate}% converted
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">
            Clickable references directing traffic
          </p>
        </div>

        {/* Step 3: Attribution Leakage */}
        <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-300 ring-2 ring-rose-200/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
              3. Unlinked Mentions
            </span>
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-2xl font-black text-rose-950 tabular-nums">
              {leakedMentions.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-rose-700">leaked</span>
          </div>
          <p className="text-[11px] text-rose-700 mt-1">
            Text mentions without clickable links
          </p>
        </div>

        {/* Step 4: Estimated Pipeline Opportunity */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              4. Recoverable Pipeline
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-display text-2xl font-black text-emerald-400 tabular-nums">
                +${estimatedLostValue.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">/mo est.</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              From converting top 15% leaked mentions
            </p>
          </div>
          <Link
            href="/tools/answerability-audit"
            className="mt-3 inline-flex items-center justify-between text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors pt-2 border-t border-slate-800"
          >
            <span>Run 45-Word Chunk Fix</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Progress Bar of Conversion Efficiency */}
      <div className="relative z-10 space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-600">Attribution Conversion Progress</span>
          <span className="text-slate-900 font-mono">
            {verifiedCitations} of {totalMentions} mentions linked ({citationRate}%)
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${citationRate}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-l-full"
            title="Converted Citations"
          />
          <div
            style={{ width: `${100 - parseFloat(citationRate)}%` }}
            className="h-full bg-rose-200/80 rounded-r-full"
            title="Leaked Mentions"
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Verified Clickable Links ({citationRate}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-300" />
            Unlinked Mentions ({(100 - parseFloat(citationRate)).toFixed(1)}% Leaked)
          </span>
        </div>
      </div>
    </section>
  );
}
