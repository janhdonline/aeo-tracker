'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Copy,
  Check,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ExecutivePulseProps {
  domain: string;
  score: number;
  deltaText?: string;
  onJumpToFixes?: () => void;
}

export function ExecutivePulseCard({
  domain = 'notion.so',
  score = 84,
  deltaText = '+8.4%',
  onJumpToFixes,
}: ExecutivePulseProps) {
  const [copied, setCopied] = useState(false);

  const executiveSummaryText = `Executive AI Visibility Briefing for ${domain}:
- Overall AEO Visibility: ${score}/100 (${deltaText} 7-day velocity)
- Strongest Engine: Perplexity Pro (93% positive citation polarity)
- Traffic Leak Alert: 2 high-intent buyer comparison prompts in Claude and ChatGPT are referencing brand name without rendering hyperlinked citations.
- Priority Action: 1 schema markup update and /llms.txt deployment recommended to secure lost referral clicks.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(executiveSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl border border-slate-200/90 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-7 text-white shadow-xl overflow-hidden"
    >
      {/* Background glow highlights */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Humanized Editorial Narrative */}
        <div className="space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              Executive AI Pulse
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Human-Curated Algorithmic Briefing
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
              • Updated 12m ago
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
            <span className="text-emerald-400">{domain}</span> gained{' '}
            <span className="text-cyan-300 font-mono">{deltaText} visibility</span> in Perplexity & SearchGPT, but{' '}
            <span className="text-amber-300 underline decoration-amber-400/60 underline-offset-4">
              2 buyer prompts
            </span>{' '}
            are leaking citations to competitors.
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            AI search models cite your pricing in 48 commercial queries, but mention the brand without a direct link on 14 buyer queries. Deploying an official <code className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded-md text-xs font-mono">/llms.txt</code> and Product Schema will convert these mentions into direct referral traffic.
          </p>

          {/* Micro Traffic Leak Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Attribution Conversion:</span>
              <div className="w-28 sm:w-36 h-2 rounded-full bg-slate-800 overflow-hidden ring-1 ring-slate-700">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 w-[68%]" />
              </div>
              <span className="font-bold font-mono text-emerald-300">68%</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              <span>Est. Lost Clicks: ~1,240 /mo</span>
            </div>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 px-4 py-2.5 text-xs font-bold text-white transition-all shadow-xs cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-slate-300" />
                <span>Copy Executive Summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (onJumpToFixes) {
                onJumpToFixes();
              } else {
                const el = document.getElementById('aeo-action-center');
                el?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-95"
          >
            <Zap className="h-4 w-4" />
            <span>Apply Priority Fixes</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.section>
  );
}
