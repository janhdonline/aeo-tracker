'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
  Activity,
  Layers,
  FileCode,
  Check,
  Copy,
  X,
  ArrowRight,
} from 'lucide-react';
import { FRONTIER_AI_MODELS, FrontierAIModel, simulate10ModelProbe } from '@/lib/models-radar';

interface FrontierModelRadarProps {
  domain?: string;
  brandName?: string;
}

export function FrontierModelRadar({
  domain = 'notion.so',
  brandName = 'Notion',
}: FrontierModelRadarProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModel, setActiveModel] = useState<FrontierAIModel | null>(null);
  const [isProbingFleet, setIsProbingFleet] = useState(false);
  const [copiedBot, setCopiedBot] = useState(false);
  const [probedResults, setProbedResults] = useState<any[] | null>(null);

  const categories = [
    { id: 'all', label: 'All 10 Models', count: 10 },
    { id: 'search_agent', label: 'Search Agents', count: 3 },
    { id: 'reasoning', label: 'Reasoning Engines', count: 2 },
    { id: 'sovereign_global', label: 'Global Frontier', count: 3 },
    { id: 'overview', label: 'Overview Synthesizers', count: 2 },
  ];

  const filteredModels = FRONTIER_AI_MODELS.filter((m) => {
    if (selectedCategory === 'all') return true;
    return m.category === selectedCategory;
  });

  const handleProbeFleet = () => {
    setIsProbingFleet(true);
    setTimeout(() => {
      const results = simulate10ModelProbe(domain, `Best software capabilities for ${brandName}`);
      setProbedResults(results);
      setIsProbingFleet(false);
    }, 850);
  };

  const copyBotDirective = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBot(true);
    setTimeout(() => setCopiedBot(false), 2000);
  };

  return (
    <section className="relative rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5 overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute -top-32 right-1/4 h-72 w-[600px] rounded-full bg-gradient-to-br from-indigo-100/30 via-emerald-50/25 to-transparent blur-3xl -z-0" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-700 border border-indigo-200 shadow-xs">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-slate-950">
                10-Model Frontier AI Engine Radar
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                10/10 Models Operational
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live crawler status, citation protocols, and latency telemetry across all 10 frontier answer engines.
            </p>
          </div>
        </div>

        {/* Fleet Probe Button */}
        <button
          type="button"
          onClick={handleProbeFleet}
          disabled={isProbingFleet}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isProbingFleet ? 'animate-spin' : ''}`} />
          <span>{isProbingFleet ? 'Probing 10 Engines...' : 'Probe All 10 Models'}</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="relative z-10 flex flex-wrap items-center gap-2">
        {categories.map((c) => {
          const isSelected = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-white hover:border-slate-300'
              }`}
            >
              <span>{c.label}</span>
              <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] ${
                isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-200/80 text-slate-700'
              }`}>
                {c.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 10-Model Interactive Bento Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            onClick={() => setActiveModel(model)}
            className="group flex flex-col justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-2xs transition-all cursor-pointer"
          >
            <div>
              <div className="flex items-start justify-between gap-1 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                  {model.provider}
                </span>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              </div>

              <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-1">
                {model.name}
              </h4>
              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{model.status}</p>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                {model.latency}
              </span>
              <span className="text-slate-400 font-mono">Bot: {model.crawlBot}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Deep Telemetry Inspector Modal / Drawer */}
      <AnimatePresence>
        {activeModel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {activeModel.provider}
                    </span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {activeModel.categoryLabel}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-black text-slate-950">
                    {activeModel.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeModel.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModel(null)}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Telemetry Stats Strip */}
              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Latency</span>
                  <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{activeModel.latency}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">AI Market Share</span>
                  <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block">{activeModel.marketShare}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Crawl Agent</span>
                  <span className="font-mono font-bold text-emerald-700 text-xs mt-0.5 block">{activeModel.crawlBot}</span>
                </div>
              </div>

              {/* Citation Mechanism & Playbook */}
              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-cyan-50/70 border border-cyan-200/80">
                  <span className="font-bold text-cyan-900 block mb-1">
                    How {activeModel.name} Extracts Citations:
                  </span>
                  <p className="text-cyan-800 leading-relaxed text-[11px]">
                    {activeModel.citationMechanism}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                  <span className="font-bold text-emerald-900 block mb-1">
                    AEO Optimization Directive:
                  </span>
                  <p className="text-emerald-800 leading-relaxed text-[11px]">
                    {activeModel.optimizationRule}
                  </p>
                </div>
              </div>

              {/* robots.txt Directive Snippet */}
              <div className="p-3.5 rounded-2xl bg-slate-950 text-white space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-slate-400">Required robots.txt rule:</span>
                  <button
                    type="button"
                    onClick={() => copyBotDirective(activeModel.botDirective)}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    {copiedBot ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedBot ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="font-mono text-emerald-400 text-xs">
                  {activeModel.botDirective}
                </pre>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveModel(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
