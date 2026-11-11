'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  AlertCircle,
  Clock,
  Sparkles,
  Kanban,
  List,
  ArrowRight,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Zap,
  Code2,
  Copy,
  ExternalLink,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  Layers,
  ArrowLeft,
} from 'lucide-react';

interface Brief {
  id: string;
  gap_type: string;
  gap_description: string;
  recommendation: {
    action: string;
    target: string;
    content_hint: string;
    priority: string;
    snippet?: string;
    impact?: string;
  };
  status: string;
  created_at: string;
}

const priorityConfig = {
  high: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    border: 'border-l-rose-500',
    label: 'HIGH IMPACT',
    impact: '+18 pts AEO Lift',
  },
  medium: {
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    border: 'border-l-amber-500',
    label: 'MEDIUM',
    impact: '+12 pts Visibility',
  },
  low: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    border: 'border-l-blue-500',
    label: 'QUICK WIN',
    impact: '+8 pts Citations',
  },
};

function generateDefaultSnippet(gapType: string, target: string, hint: string): string {
  const t = gapType.toLowerCase();
  if (t.includes('schema') || t.includes('json')) {
    return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "${target || 'Your Platform'}",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "description": "${hint || 'Official structured knowledge definition for AI search engines.'}"
}
</script>`;
  }
  if (t.includes('crawler') || t.includes('robot')) {
    return `# Allow Frontier AI Answer Engines
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /`;
  }
  return `<!-- 40–60 Word Featured Answer Block -->
<div class="aeo-answer-block">
  <h3>What is ${target || 'our platform'}?</h3>
  <p>${target || 'Our platform'} is an industry-leading solution that provides automated visibility intelligence. Designed for growth and engineering teams, it monitors citation leaks and structures verified facts that AI models quote directly in generative answers.</p>
</div>`;
}

export function BriefsManager({
  projectId,
  initialBriefs,
}: {
  projectId: string;
  initialBriefs: Brief[];
}) {
  const [briefs, setBriefs] = useState<Brief[]>(initialBriefs);
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSnippetBrief, setActiveSnippetBrief] = useState<Brief | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const supabase = createClient();

  const handleGenerateBriefs = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/briefs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (data.briefs && data.briefs.length > 0) {
        setBriefs((prev) => [...prev, ...data.briefs]);
      }
    } catch (e) {
      console.error('Failed to generate briefs:', e);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    newStatus: 'open' | 'in_progress' | 'applied' | 'resolved' | 'dismissed'
  ) => {
    const updatePayload =
      newStatus === 'applied'
        ? { status: newStatus, applied_at: new Date().toISOString() }
        : { status: newStatus };

    const { error } = await supabase.from('fix_briefs').update(updatePayload).eq('id', id);

    // Optimistically update in state
    setBriefs((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );

    if (activeSnippetBrief && activeSnippetBrief.id === id) {
      setActiveSnippetBrief({ ...activeSnippetBrief, status: newStatus });
    }
  };

  const handleCopySnippet = (snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2200);
  };

  // Filter logic
  const filteredBriefs = briefs.filter((b) => {
    const matchesFilter =
      selectedFilter === 'all' ||
      (b.recommendation?.priority || 'medium').toLowerCase() === selectedFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      b.gap_description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.gap_type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const backlogBriefs = filteredBriefs.filter((b) => b.status === 'open' || !b.status);
  const inProgressBriefs = filteredBriefs.filter((b) => b.status === 'in_progress');
  const appliedBriefs = filteredBriefs.filter((b) => b.status === 'applied');
  const resolvedBriefs = filteredBriefs.filter(
    (b) => b.status === 'resolved' || b.status === 'dismissed'
  );

  return (
    <div className="space-y-6">
      {/* Top Controls: Search, Priority Filter, View Switcher & Generate */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Switcher */}
          <div className="inline-flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200/60 text-xs font-semibold">
            <button
              onClick={() => setViewMode('kanban')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Kanban className="h-3.5 w-3.5 text-blue-600" />
              <span>Kanban Action Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="h-3.5 w-3.5 text-slate-600" />
              <span>List View</span>
            </button>
          </div>

          {/* Priority Filters */}
          <div className="flex items-center gap-1">
            {(['all', 'high', 'medium', 'low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedFilter === p
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p === 'all'
                  ? 'All Tasks'
                  : p === 'high'
                  ? 'High Impact'
                  : p === 'medium'
                  ? 'Medium'
                  : 'Quick Wins'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tasks..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
            />
          </div>

          <button
            onClick={handleGenerateBriefs}
            disabled={generating}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Sparkles className={`h-3.5 w-3.5 text-emerald-400 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Scanning...' : 'Scan & Generate Briefs'}</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. VISUAL 4-COLUMN KANBAN BOARD                                */}
      {/* ============================================================== */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {/* COLUMN 1: BACKLOG & AI GAPS */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <h4 className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Backlog & AI Gaps
                </h4>
              </div>
              <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                {backlogBriefs.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {backlogBriefs.length === 0 ? (
                <div className="text-center py-12 rounded-xl bg-white/60 border border-dashed border-slate-200 text-xs text-slate-400">
                  No open gaps in backlog.
                </div>
              ) : (
                backlogBriefs.map((brief) => {
                  const prio =
                    priorityConfig[brief.recommendation?.priority as keyof typeof priorityConfig] ||
                    priorityConfig.medium;

                  return (
                    <div
                      key={brief.id}
                      className={`rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:shadow-card transition-all space-y-2.5 border-l-4 ${prio.border}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                          {brief.gap_type.replace(/_/g, ' ')}
                        </span>
                        <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold border ${prio.bg}`}>
                          {prio.label}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {brief.gap_description}
                      </p>

                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 line-clamp-2">
                        {brief.recommendation?.content_hint}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="font-bold text-emerald-700 text-[10px]">
                          {brief.recommendation?.impact || prio.impact}
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveSnippetBrief(brief)}
                          className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5"
                        >
                          <Code2 className="h-3 w-3" />
                          <span>Code Fix</span>
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleUpdateStatus(brief.id, 'dismissed')}
                          className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(brief.id, 'in_progress')}
                          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>Start Task</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 2: IN PROGRESS */}
          <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/20 p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-indigo-200/60">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <h4 className="font-display text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  In Progress
                </h4>
              </div>
              <span className="rounded-full bg-white border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                {inProgressBriefs.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {inProgressBriefs.length === 0 ? (
                <div className="text-center py-12 rounded-xl bg-white/60 border border-dashed border-indigo-200 text-xs text-indigo-600/70">
                  No active tasks. Click &quot;Start Task&quot; on any gap.
                </div>
              ) : (
                inProgressBriefs.map((brief) => (
                  <div
                    key={brief.id}
                    className="rounded-xl border border-indigo-200 bg-white p-3.5 shadow-2xs space-y-2.5 border-l-4 border-l-indigo-500"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 truncate">
                        {brief.gap_type.replace(/_/g, ' ')}
                      </span>
                      <span className="rounded bg-indigo-100 text-indigo-800 px-1.5 py-0.2 text-[9px] font-bold">
                        CODING / DRAFTING
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      {brief.gap_description}
                    </p>

                    <div className="flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={() => setActiveSnippetBrief(brief)}
                        className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-0.5"
                      >
                        <Code2 className="h-3 w-3" />
                        <span>Inspect Snippet</span>
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleUpdateStatus(brief.id, 'open')}
                        className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(brief.id, 'applied')}
                        className="inline-flex items-center gap-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white px-2.5 py-1 text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                      >
                        <span>Mark Applied</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 3: APPLIED TO PRODUCTION */}
          <div className="rounded-2xl border border-teal-200/80 bg-teal-50/20 p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-teal-200/60">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                <h4 className="font-display text-xs font-bold text-teal-950 uppercase tracking-wider">
                  Applied (Verifying)
                </h4>
              </div>
              <span className="rounded-full bg-white border border-teal-200 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                {appliedBriefs.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {appliedBriefs.length === 0 ? (
                <div className="text-center py-12 rounded-xl bg-white/60 border border-dashed border-teal-200 text-xs text-teal-600/70">
                  Applied fixes will appear here for scan verification.
                </div>
              ) : (
                appliedBriefs.map((brief) => (
                  <div
                    key={brief.id}
                    className="rounded-xl border border-teal-200 bg-white p-3.5 shadow-2xs space-y-2.5 border-l-4 border-l-teal-500"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 truncate">
                        {brief.gap_type.replace(/_/g, ' ')}
                      </span>
                      <span className="rounded bg-teal-100 text-teal-800 px-1.5 py-0.2 text-[9px] font-bold">
                        DEPLOYED
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      {brief.gap_description}
                    </p>

                    <div className="p-2 rounded-lg bg-teal-50/60 text-[10px] text-teal-800 font-medium">
                      ⏱ Next weekly radar scan checks AI answers for quotation.
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleUpdateStatus(brief.id, 'in_progress')}
                        className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        ← Re-open
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(brief.id, 'resolved')}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                      >
                        <Check className="h-3 w-3" />
                        <span>Resolved</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 4: VERIFIED RESOLVED */}
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/20 p-3.5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <h4 className="font-display text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Verified Resolved
                </h4>
              </div>
              <span className="rounded-full bg-white border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                {resolvedBriefs.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[300px]">
              {resolvedBriefs.length === 0 ? (
                <div className="text-center py-12 rounded-xl bg-white/60 border border-dashed border-emerald-200 text-xs text-emerald-600/70">
                  Resolved tasks will be archived here.
                </div>
              ) : (
                resolvedBriefs.map((brief) => (
                  <div
                    key={brief.id}
                    className="rounded-xl border border-emerald-200 bg-white/90 p-3.5 shadow-2xs space-y-2 border-l-4 border-l-emerald-500"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        VERIFIED
                      </span>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    </div>

                    <p className="text-xs font-semibold text-slate-800 leading-snug">
                      {brief.gap_description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleUpdateStatus(brief.id, 'open')}
                        className="text-[10px] font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Restore</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* 2. CLASSIC LIST VIEW                                           */
        /* ============================================================== */
        <div className="space-y-3">
          {filteredBriefs.map((brief) => {
            const prio =
              priorityConfig[brief.recommendation?.priority as keyof typeof priorityConfig] ||
              priorityConfig.medium;

            return (
              <div
                key={brief.id}
                className={`rounded-xl border border-slate-200 bg-white p-4 shadow-2xs border-l-4 ${prio.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {brief.gap_type.replace(/_/g, ' ')}
                    </span>
                    <span className={`rounded px-1.5 py-0.2 text-[9px] font-bold border ${prio.bg}`}>
                      {prio.label}
                    </span>
                    <span className="rounded bg-slate-100 text-slate-700 px-1.5 py-0.2 text-[9px] font-bold uppercase">
                      Status: {brief.status || 'open'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{brief.gap_description}</h4>
                  <p className="text-xs text-slate-600">{brief.recommendation?.content_hint}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveSnippetBrief(brief)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Code2 className="h-3.5 w-3.5 text-blue-600" />
                    <span>View Snippet</span>
                  </button>

                  {brief.status !== 'applied' && brief.status !== 'resolved' && (
                    <button
                      onClick={() => handleUpdateStatus(brief.id, 'applied')}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Apply</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. CODE SNIPPET DRAWER / MODAL                                 */}
      {/* ============================================================== */}
      <AnimatePresence>
        {activeSnippetBrief && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                    AEO Implementation Blueprint
                  </span>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {activeSnippetBrief.gap_description}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveSnippetBrief(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Code Snippet:</span>
                  <button
                    onClick={() =>
                      handleCopySnippet(
                        activeSnippetBrief.recommendation?.snippet ||
                          generateDefaultSnippet(
                            activeSnippetBrief.gap_type,
                            activeSnippetBrief.recommendation?.target,
                            activeSnippetBrief.recommendation?.content_hint
                          )
                      )
                    }
                    className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    {copiedSnippet ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Code Snippet</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto max-h-56 leading-relaxed">
                  <code>
                    {activeSnippetBrief.recommendation?.snippet ||
                      generateDefaultSnippet(
                        activeSnippetBrief.gap_type,
                        activeSnippetBrief.recommendation?.target,
                        activeSnippetBrief.recommendation?.content_hint
                      )}
                  </code>
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Where to place:</span>
                <p>
                  Target: <strong>{activeSnippetBrief.recommendation?.target || 'Site Header (<head>)'}</strong>.
                  After deploying to your production website, click &quot;Mark Applied&quot; below to trigger weekly verification.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveSnippetBrief(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(activeSnippetBrief.id, 'applied');
                    setActiveSnippetBrief(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Mark Applied to Website</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
