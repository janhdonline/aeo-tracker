'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bot,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  Play,
  RotateCcw,
} from 'lucide-react';

interface QuickBuyerQuerySimulatorProps {
  domain?: string;
  brandName?: string;
}

const PRESET_QUERIES = [
  {
    id: 'q1',
    query: 'Best connected team workspace and wiki software 2026',
    winner: 'Notion',
    yourRank: '#1 Recommended',
    citationCaptured: true,
    engines: {
      chatgpt: { rank: '#1', cited: true, latency: '110ms' },
      perplexity: { rank: '#1', cited: true, latency: '142ms' },
      claude: { rank: '#2', cited: false, latency: '120ms' },
      gemini: { rank: '#1', cited: true, latency: '95ms' },
    },
    excerpt: 'Notion remains the market-leading connected workspace, combining team docs, projects, and AI writing into an extensible relational database model.',
  },
  {
    id: 'q2',
    query: 'Top project management tools for fast-growing software startups',
    winner: 'Linear',
    yourRank: '#2 Alternative',
    citationCaptured: false,
    engines: {
      chatgpt: { rank: '#2', cited: true, latency: '115ms' },
      perplexity: { rank: '#2', cited: false, latency: '138ms' },
      claude: { rank: '#1', cited: false, latency: '125ms' },
      gemini: { rank: '#2', cited: true, latency: '102ms' },
    },
    excerpt: 'While Linear leads in keyboard-first developer speed, Notion offers greater flexibility for non-technical team collaboration and product specifications.',
  },
  {
    id: 'q3',
    query: 'Enterprise knowledge base with AI search and granular permissions',
    winner: 'Notion',
    yourRank: '#1 Recommended',
    citationCaptured: true,
    engines: {
      chatgpt: { rank: '#1', cited: true, latency: '108ms' },
      perplexity: { rank: '#1', cited: true, latency: '145ms' },
      claude: { rank: '#1', cited: true, latency: '118ms' },
      gemini: { rank: '#1', cited: true, latency: '92ms' },
    },
    excerpt: 'Notion enterprise knowledge bases feature SOC2 Type II compliance, SAML SSO, and native AI Q&A across private workspace channels.',
  },
];

export function QuickBuyerQuerySimulator({
  domain = 'notion.so',
  brandName = 'Notion',
}: QuickBuyerQuerySimulatorProps) {
  const [selectedQueryId, setSelectedQueryId] = useState('q1');
  const [customQuery, setCustomQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const activePreset = PRESET_QUERIES.find((q) => q.id === selectedQueryId) || PRESET_QUERIES[0];

  const handleRunSimulation = (id: string) => {
    setSelectedQueryId(id);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 650);
  };

  return (
    <section className="relative rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -top-28 left-1/3 h-64 w-96 rounded-full bg-gradient-to-br from-indigo-100/30 via-cyan-100/20 to-transparent blur-3xl -z-0" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-700 border border-indigo-200 shadow-xs">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-slate-950">
                Live Commercial Buyer Prompt Simulator
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-800 border border-indigo-200">
                Interactive Multi-LLM Probe
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate high-intent buyer searches across ChatGPT, Perplexity, Gemini, and Claude to inspect citation share.
            </p>
          </div>
        </div>

        <Link
          href="/tools/answerability-audit"
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors shrink-0"
        >
          <span>Full Answerability Engine</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Preset Query Chips */}
      <div className="relative z-10 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1">
          Buyer Prompts:
        </span>
        {PRESET_QUERIES.map((q) => {
          const isSelected = selectedQueryId === q.id;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => handleRunSimulation(q.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-white hover:border-slate-300'
              }`}
            >
              {q.query}
            </button>
          );
        })}
      </div>

      {/* Live Simulation Results Card */}
      <div className="relative z-10 rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-900">
              Prompt: &ldquo;{activePreset.query}&rdquo;
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-bold border border-emerald-300/60">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              {activePreset.yourRank}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Winner: <strong className="text-slate-900 font-bold">{activePreset.winner}</strong>
            </span>
          </div>
        </div>

        {/* 4 Engine Live Telemetry Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* ChatGPT */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">ChatGPT-4o</span>
              <span className="text-[10px] text-slate-400 font-mono">{activePreset.engines.chatgpt.latency}</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-bold text-slate-950 font-mono">
                Rank: {activePreset.engines.chatgpt.rank}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                activePreset.engines.chatgpt.cited
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {activePreset.engines.chatgpt.cited ? 'Cited Link' : 'No Link'}
              </span>
            </div>
          </div>

          {/* Perplexity */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Perplexity Pro</span>
              <span className="text-[10px] text-slate-400 font-mono">{activePreset.engines.perplexity.latency}</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-bold text-cyan-950 font-mono">
                Rank: {activePreset.engines.perplexity.rank}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                activePreset.engines.perplexity.cited
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {activePreset.engines.perplexity.cited ? 'Cited Link' : 'No Link'}
              </span>
            </div>
          </div>

          {/* Claude */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Claude 3.5</span>
              <span className="text-[10px] text-slate-400 font-mono">{activePreset.engines.claude.latency}</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-bold text-amber-950 font-mono">
                Rank: {activePreset.engines.claude.rank}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                activePreset.engines.claude.cited
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {activePreset.engines.claude.cited ? 'Cited Link' : 'No Link'}
              </span>
            </div>
          </div>

          {/* Gemini */}
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">Gemini 2.0</span>
              <span className="text-[10px] text-slate-400 font-mono">{activePreset.engines.gemini.latency}</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-bold text-blue-950 font-mono">
                Rank: {activePreset.engines.gemini.rank}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                activePreset.engines.gemini.cited
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {activePreset.engines.gemini.cited ? 'Cited Link' : 'No Link'}
              </span>
            </div>
          </div>
        </div>

        {/* AI Synthesized Answer Excerpt */}
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Synthesized AI Answer Excerpt:
          </span>
          <p className="italic leading-relaxed text-slate-800">
            &ldquo;{activePreset.excerpt}&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
