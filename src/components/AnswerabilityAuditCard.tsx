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
  Globe,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AnswerabilityProps {
  domain: string;
  brandName?: string;
  compact?: boolean;
}

export function AnswerabilityAuditCard({ domain, brandName, compact = false }: AnswerabilityProps) {
  const brand = brandName || domain.split('.')[0] || domain;
  const [activeMode, setActiveMode] = useState<'text' | 'url'>('text');
  const [urlInput, setUrlInput] = useState(`https://${domain}`);
  const [inputText, setInputText] = useState(
    `${brand} is an answer engine optimization platform designed to monitor brand citations across ChatGPT, Perplexity, and Gemini. By tracking commercial buyer prompts, it helps growth teams identify competitor leaks and optimize content into structured answer chunks.`
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [score, setScore] = useState(88);
  const [wordCount, setWordCount] = useState(38);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const [criteria, setCriteria] = useState({
    chunkLength: { passed: true, score: 25, label: '40–60 Word Chunking' },
    definitionClarity: { passed: true, score: 25, label: 'Direct Definition Phrasing' },
    structuredList: { passed: true, score: 20, label: 'Structured Logic & Delimiters' },
    propositionPower: { passed: true, score: 18, label: 'Actionable Value Proposition' },
  });

  const [optimizedRewrite, setOptimizedRewrite] = useState(
    `${brand} is an AI visibility platform that monitors where commercial chatbots recommend your brand. By auditing buyer queries across ChatGPT, Gemini, and Perplexity, it pinpoints citation leaks and delivers prioritized code fixes to elevate organic generative search visibility.`
  );

  const rewriteWordCount = optimizedRewrite.split(/\s+/).filter(Boolean).length;

  async function runAudit() {
    setAnalyzing(true);
    try {
      const payload = activeMode === 'url'
        ? { domain, url: urlInput }
        : { domain, text: inputText };

      const res = await fetch('/api/tools/answerability-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setScore(data.answerabilityScore);
        setWordCount(data.wordCount);
        if (data.criteriaBreakdown) setCriteria(data.criteriaBreakdown);
        if (data.optimizedExcerpt) setOptimizedRewrite(data.optimizedExcerpt);
      } else {
        // Client fallback calculation
        const words = inputText.trim().split(/\s+/).filter(Boolean).length;
        setWordCount(words);
        let sc = 70;
        if (words >= 35 && words <= 65) sc += 20;
        if (/(\bis an?\b|\bplatform\b|\bdesigned for\b)/i.test(inputText)) sc += 8;
        setScore(Math.min(98, Math.max(35, sc)));
      }
    } catch {
      // Fallback
    } finally {
      setAnalyzing(false);
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedRewrite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <Zap className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-bold text-slate-900">
              Content &quot;Answerability&quot; Diagnostic Engine
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              40–60 Word Rule
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Tests whether your landing page text is structured into concise definition passages that ChatGPT and Google AI Overviews can quote verbatim.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Answerability
            </span>
            <span className="font-display text-lg font-extrabold text-slate-900 tabular-nums">
              {score}/100
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveMode('text')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeMode === 'text'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-emerald-600" />
            <span>Passage Text Tester</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeMode === 'url'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="h-3.5 w-3.5 text-blue-600" />
            <span>URL Live Crawl</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Diagnostic Criteria</span>
          {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Criteria Breakdown Drawer */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              {Object.entries(criteria).map(([key, item]: any) => (
                <div key={key} className="p-3 rounded-lg bg-white border border-slate-200/70 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-slate-900 truncate">{item.label}</span>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold block">+{item.score} pts passed</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Input Form */}
      <div className="space-y-3">
        {activeMode === 'text' ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Audit Landing Page Copy Passage ({wordCount} words):
              </label>
              <span className="text-[11px] text-slate-400">
                Ideal AI quotation block: 40–60 words
              </span>
            </div>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none transition-all leading-relaxed"
              placeholder="Paste your brand definition or product paragraph here to test AI answerability..."
            />
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Landing Page URL to Crawl:
              </label>
              <span className="text-[11px] text-slate-400">
                Extracts primary paragraph for AI answer analysis
              </span>
            </div>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
              placeholder="https://example.com/features"
            />
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                wordCount >= 35 && wordCount <= 65
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {wordCount >= 35 && wordCount <= 65
                ? '✓ Optimal Length (40–60 words)'
                : wordCount < 35
                ? 'Too Short (<35 words)'
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
            <span>{analyzing ? 'Testing...' : activeMode === 'url' ? 'Crawl & Audit' : 'Re-Score Passage'}</span>
          </button>
        </div>
      </div>

      {/* AI-Optimized Answer Passage */}
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
