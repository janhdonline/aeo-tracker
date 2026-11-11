'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Code2,
  FileText,
  ShieldCheck,
  Bot,
  ExternalLink,
  Kanban,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  category: 'schema' | 'robots' | 'facts' | 'content';
  categoryLabel: string;
  priority: 'high' | 'medium' | 'quick_win';
  impact: string;
  engines: string[];
  description: string;
  snippetType: 'json' | 'text' | 'markdown';
  snippet: string;
  completed?: boolean;
}

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Deploy Organization & SoftwareApplication JSON-LD Schema',
    category: 'schema',
    categoryLabel: 'Structured Data',
    priority: 'high',
    impact: '+12 pts AEO Uplift',
    engines: ['Gemini', 'Perplexity Pro', 'ChatGPT-4o'],
    description:
      'Perplexity and Gemini prioritize websites with explicit schema.org entity graphs. Add this JSON-LD block inside your <head> to anchor your brand identity and verified social profiles.',
    snippetType: 'json',
    snippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Your Brand Name",
  "operatingSystem": "All",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "Your Company Inc.",
    "url": "https://yourwebsite.com",
    "sameAs": [
      "https://twitter.com/yourbrand",
      "https://github.com/yourbrand",
      "https://linkedin.com/company/yourbrand"
    ]
  }
}
</script>`,
  },
  {
    id: 'task-2',
    title: 'Explicitly Allow AI Crawlers in robots.txt',
    category: 'robots',
    categoryLabel: 'Crawler Access',
    priority: 'high',
    impact: '+10 pts AEO Uplift',
    engines: ['SearchGPT', 'PerplexityBot', 'ClaudeBot', 'Google-Extended'],
    description:
      'Ensure modern generative search engines are not blocked by generic Disallow rules. Allow GPTBot, PerplexityBot, and Google-Extended to index your landing pages and feature docs.',
    snippetType: 'text',
    snippet: `# AI Answer Engine Crawler Directives
User-agent: GPTBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://yourwebsite.com/sitemap.xml`,
  },
  {
    id: 'task-3',
    title: 'Publish Markdown llms.txt at Domain Root',
    category: 'content',
    categoryLabel: 'LLM Native Docs',
    priority: 'quick_win',
    impact: '+8 pts AEO Uplift',
    engines: ['All 6 AI Models', 'Cursor / Claude'],
    description:
      'A /llms.txt file provides clean, markdown-formatted facts that LLMs can ingest in seconds without parsing complex HTML or JavaScript DOM trees.',
    snippetType: 'markdown',
    snippet: `# Your Brand Name
> The definitive AEO & AI visibility platform for modern tech companies.

## Core Products & Capabilities
- Multi-Engine Radar: Audits visibility across ChatGPT, Perplexity, Gemini, and Claude.
- Citation Leak Detection: Alerts when competitors are cited instead of your product.
- Commercial Buyer Query Tracking: Monitors 100+ industry prompts weekly.

## Official Resources
- Pricing: https://yourwebsite.com/pricing
- Documentation: https://yourwebsite.com/docs
- API: https://yourwebsite.com/api`,
  },
  {
    id: 'task-4',
    title: 'Publish Dedicated "Alternative & Versus" Comparison Matrix',
    category: 'facts',
    categoryLabel: 'Competitive Positioning',
    priority: 'medium',
    impact: '+6 pts AEO Uplift',
    engines: ['ChatGPT-4o', 'Claude 3.5 Sonnet'],
    description:
      'When buyers ask "What is the best alternative to [Competitor]?", AI models look for clear comparison tables with structured feature lists and pricing breakdowns.',
    snippetType: 'markdown',
    snippet: `## Why Teams Switch from [Competitor] to [YourBrand]
| Feature | [YourBrand] | [Competitor] |
| :--- | :--- | :--- |
| Realtime Radar Sync | Yes (6 Engines) | No (Manual only) |
| Weekly Executive Digest | Automated (PDF/Email) | Add-on ($49/mo) |
| Direct Schema Validator | Built-in | None |`,
  },
];

export function PrioritizedTasksWidget() {
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [filter, setFilter] = useState<'all' | 'high' | 'quick_win' | 'completed'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'completed') return t.completed;
    if (filter === 'high') return t.priority === 'high';
    if (filter === 'quick_win') return t.priority === 'quick_win';
    return true;
  });

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <section id="aeo-action-center" className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5 scroll-mt-6">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 border border-rose-200/60">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-bold text-slate-900">
              AEO Action Center: Prioritized Tasks & Fixes
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200/60">
              {completedCount}/{tasks.length} Resolved
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Prioritized engineering actions backed by Answer Engine telemetry to maximize citation rates across all models.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
          >
            <Kanban className="h-3.5 w-3.5 text-blue-600" />
            <span>Open Kanban Action Board</span>
          </Link>

          {/* Filter Pills */}
          <div className="inline-flex items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200/60 text-xs font-semibold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === 'high'
                ? 'bg-white text-rose-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            High Impact
          </button>
          <button
            onClick={() => setFilter('quick_win')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === 'quick_win'
                ? 'bg-white text-emerald-700 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Quick Wins
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-white text-slate-900 shadow-xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Done ({completedCount})
          </button>
        </div>
        </div>
      </div>

      {/* Task List Cards */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">No tasks in this view</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Switch filters above to inspect other opportunities.</p>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const isExpanded = expandedId === t.id;
            const isCopied = copiedId === t.id;

            return (
              <div
                key={t.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  t.completed
                    ? 'border-slate-200 bg-slate-50/50 opacity-70'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Task Main Row */}
                <div className="p-4 sm:p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5 flex-1">
                    {/* Completion Checkbox */}
                    <button
                      onClick={() => toggleComplete(t.id)}
                      className={`h-5 w-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors cursor-pointer ${
                        t.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 hover:border-slate-400 bg-white'
                      }`}
                      title={t.completed ? 'Mark as incomplete' : 'Mark as done'}
                    >
                      {t.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Priority Badge */}
                        {t.priority === 'high' && (
                          <span className="inline-flex items-center rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                            HIGH IMPACT
                          </span>
                        )}
                        {t.priority === 'quick_win' && (
                          <span className="inline-flex items-center rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            QUICK WIN
                          </span>
                        )}
                        {t.priority === 'medium' && (
                          <span className="inline-flex items-center rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            MEDIUM IMPACT
                          </span>
                        )}

                        <span className="text-[11px] font-semibold text-slate-500">
                          {t.categoryLabel}
                        </span>

                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          {t.impact}
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-bold text-slate-900 ${
                          t.completed ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {t.title}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {t.description}
                      </p>

                      {/* Targeted Engines Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Boosts:
                        </span>
                        {t.engines.map((eng) => (
                          <span
                            key={eng}
                            className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                          >
                            {eng}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : t.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Code2 className="h-3.5 w-3.5 text-blue-600" />
                      <span>{isExpanded ? 'Hide Code Snippet' : 'View Fix Snippet'}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Fix Drawer with 1-Click Copy Code */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-100 bg-slate-950 p-4 sm:p-5 text-slate-100"
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-emerald-400" />
                          <span className="text-xs font-mono text-slate-300">
                            Implementation Snippet ({t.snippetType.toUpperCase()})
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(t.id, t.snippet)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/20 px-3 py-1 text-xs font-semibold text-white transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied to Clipboard!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 text-slate-300" />
                              <span>Copy Snippet</span>
                            </>
                          )}
                        </button>
                      </div>

                      <pre className="text-xs font-mono text-emerald-300 overflow-x-auto p-3 rounded-lg bg-black/50 border border-slate-800 leading-relaxed whitespace-pre-wrap">
                        {t.snippet}
                      </pre>
                      <p className="text-[11px] text-slate-400 mt-2">
                        💡 Tip: Place this directly in your web project. Answer engines will reflect this on their next crawl cycle within 24-48 hours.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
