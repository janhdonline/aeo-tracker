'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ExternalLink,
  Bot,
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Filter,
} from 'lucide-react';

interface CitationEvent {
  id: string;
  engine: 'ChatGPT-4o' | 'Perplexity Pro' | 'Google Gemini' | 'Claude 3.5 Sonnet';
  engineColor: string;
  prompt: string;
  citedUrl: string;
  status: 'cited' | 'leak';
  timestamp: string;
}

const SAMPLE_EVENTS: CitationEvent[] = [
  {
    id: 'evt-1',
    engine: 'Perplexity Pro',
    engineColor: 'text-teal-700 bg-teal-50 border-teal-200',
    prompt: 'best modern wiki and project management tool for engineering teams 2026',
    citedUrl: 'notion.so/product/wikis',
    status: 'cited',
    timestamp: '4m ago',
  },
  {
    id: 'evt-2',
    engine: 'ChatGPT-4o',
    engineColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    prompt: 'notion pricing vs linear pricing comparison for small teams',
    citedUrl: 'notion.so/pricing',
    status: 'leak',
    timestamp: '18m ago',
  },
  {
    id: 'evt-3',
    engine: 'Claude 3.5 Sonnet',
    engineColor: 'text-amber-800 bg-amber-50 border-amber-200',
    prompt: 'how to structure company knowledge base with markdown and AI assistance',
    citedUrl: 'notion.so/help/guides',
    status: 'cited',
    timestamp: '42m ago',
  },
  {
    id: 'evt-4',
    engine: 'Google Gemini',
    engineColor: 'text-blue-700 bg-blue-50 border-blue-200',
    prompt: 'is Notion safe for enterprise compliance and SOC 2 data storage?',
    citedUrl: 'notion.so/security',
    status: 'cited',
    timestamp: '1h ago',
  },
  {
    id: 'evt-5',
    engine: 'Perplexity Pro',
    engineColor: 'text-teal-700 bg-teal-50 border-teal-200',
    prompt: 'top 5 AI powered productivity suites to replace Evernote in 2026',
    citedUrl: 'notion.so/templates',
    status: 'cited',
    timestamp: '2h ago',
  },
];

export function LiveCitationTicker({ domain = 'notion.so' }: { domain?: string }) {
  const [filterEngine, setFilterEngine] = useState<string>('all');

  const filtered = filterEngine === 'all'
    ? SAMPLE_EVENTS
    : SAMPLE_EVENTS.filter((e) => e.engine.toLowerCase().includes(filterEngine.toLowerCase()));

  return (
    <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
      {/* Header with Live Ping & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs">
            <Activity className="h-4 w-4 text-emerald-400" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-slate-900">
                Live AI Citation & Mention Stream
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Stream
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Real-time feed of synthetic commercial queries citing <span className="font-medium text-slate-800">{domain}</span>
            </p>
          </div>
        </div>

        {/* Engine Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Engines' },
            { id: 'perplexity', label: 'Perplexity' },
            { id: 'chatgpt', label: 'ChatGPT' },
            { id: 'claude', label: 'Claude' },
            { id: 'gemini', label: 'Gemini' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterEngine(f.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterEngine === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stream Items List */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all"
            >
              <div className="flex items-start sm:items-center gap-3">
                {/* Engine Badge */}
                <span
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold border shrink-0 ${item.engineColor}`}
                >
                  <Bot className="h-3 w-3" />
                  {item.engine}
                </span>

                {/* Prompt & Citation Target */}
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    &ldquo;{item.prompt}&rdquo;
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                      {item.citedUrl}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="h-3 w-3" />
                      {item.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                {item.status === 'cited' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/70">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    Cited with Link
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200/70">
                    <AlertCircle className="h-3 w-3 text-amber-600" />
                    Mention Only (Traffic Leak)
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
