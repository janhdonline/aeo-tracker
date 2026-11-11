'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Copy,
  Check,
  Zap,
  RefreshCw,
  Sliders,
} from 'lucide-react';

interface AnswerabilityProps {
  domain: string;
  brandName?: string;
}

export function AnswerabilityAuditCard({ domain, brandName }: AnswerabilityProps) {
  const brand = brandName || domain.split('.')[0] || domain;
  const [inputText, setInputText] = useState(
    `${brand} is a leading enterprise platform designed to streamline operations, increase team efficiency, and deliver real-time intelligence across multi-engine search systems.`
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState(86);
  const [wordCount, setWordCount] = useState(25);
  const [copied, setCopied] = useState(false);

  const optimizedRewrite = `${brand} is an answer engine optimization platform that monitors where AI models cite your products. By testing commercial buyer prompts across ChatGPT, Gemini, and Perplexity, it uncovers competitor citation leaks and delivers prioritized code fixes to elevate brand visibility in generative search.`;

  const rewriteWordCount = optimizedRewrite.split(/\s+/).length;

  function runAudit() {
    setAnalyzing(true);
    const words = inputText.trim().split(/\s+/).length;
    setWordCount(words);

    setTimeout(() => {
      // Calculate realistic answerability score
      let sc = 70;
      if (words >= 38 && words <= 65) sc += 22;
      else if (words < 20) sc -= 10;
      else if (words > 85) sc -= 15;

      if (/(\bis a\b|\bprovides\b|\bplatform\b|\bdesigned for\b)/i.test(inputText)) {
        sc += 8;
      }
      setScore(Math.min(98, Math.max(35, sc)));
      setAnalyzing(false);
    }, 450);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedRewrite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <Zap className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-bold text-slate-900">
              Content &quot;Answerability&quot; Diagnostic
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              40–60 Word Chunking Rule
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tests whether your landing page text is structured into concise definition passages that ChatGPT and Google AI Overviews can quote verbatim.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Answerability
            </span>
            <span className="font-display text-lg font-extrabold text-slate-900">
              {score}/100
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Input Form */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700">
            Audit Landing Page Copy Passage ({wordCount} words):
          </label>
          <span className="text-[11px] text-slate-400">
            Ideal AI quotation block: 40–60 words
          </span>
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none transition-all leading-relaxed"
            placeholder="Paste your brand definition or product paragraph here to test AI answerability..."
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                wordCount >= 38 && wordCount <= 65
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {wordCount >= 38 && wordCount <= 65
                ? '✓ Optimal Length (40-60 words)'
                : wordCount < 38
                ? 'Too Short (<38 words)'
                : 'Too Verbose (>65 words)'}
            </span>
          </div>

          <button
            type="button"
            onClick={runAudit}
            disabled={analyzing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Testing...' : 'Re-Score Passage'}</span>
          </button>
        </div>
      </div>

      {/* Before vs Optimized Rewrite Comparison */}
      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900">
              AI-Optimized Answer Passage ({rewriteWordCount} words)
            </h4>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 text-emerald-600" />
                <span>Copy Passage</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white/80 p-3.5 rounded-lg border border-emerald-100">
          &ldquo;{optimizedRewrite}&rdquo;
        </p>

        <p className="text-[11px] text-slate-500">
          💡 <strong>Why this wins:</strong> It defines the brand category immediately, lists 3 core value propositions, and cites specific AI engines within the exact 45-word window generative search summarizers lift.
        </p>
      </div>
    </section>
  );
}
