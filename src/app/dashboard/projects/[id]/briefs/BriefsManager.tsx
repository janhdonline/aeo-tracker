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
} from 'lucide-react';
import { LogoLoader } from '@/components/LogoLoader';

interface Brief {
  id: string;
  gap_type: string;
  gap_description: string;
  recommendation: {
    action: string;
    target: string;
    content_hint: string;
    priority: string;
  };
  status: string;
  created_at: string;
}

const priorityConfig = {
  high: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    border: 'border-l-rose-500',
    label: 'HIGH IMPACT',
  },
  medium: {
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    border: 'border-l-amber-500',
    label: 'MEDIUM',
  },
  low: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    border: 'border-l-blue-500',
    label: 'OPPORTUNITY',
  },
};

export function BriefsManager({ projectId, initialBriefs }: { projectId: string; initialBriefs: Brief[] }) {
  const [briefs, setBriefs] = useState(initialBriefs);
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
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

  const handleUpdateStatus = async (id: string, newStatus: 'open' | 'applied' | 'dismissed') => {
    const updatePayload =
      newStatus === 'applied'
        ? { status: newStatus, applied_at: new Date().toISOString() }
        : { status: newStatus };

    const { error } = await supabase.from('fix_briefs').update(updatePayload).eq('id', id);

    if (!error) {
      setBriefs(briefs.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
    }
  };

  const openBriefs = briefs.filter((b) => b.status === 'open');
  const appliedBriefs = briefs.filter((b) => b.status === 'applied');
  const dismissedBriefs = briefs.filter((b) => b.status === 'dismissed');

  return (
    <div className="space-y-6">
      {/* Top Controls: View Switcher & Generate Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
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
        </div>

        <button
          onClick={handleGenerateBriefs}
          disabled={generating}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-xs transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Sparkles className={`h-3.5 w-3.5 text-emerald-400 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Generating AI Briefs...' : 'Scan & Generate New Briefs'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. VISUAL KANBAN ACTION BOARD (Competitor Feature Benchmark)   */}
      {/* ============================================================== */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* COLUMN 1: OPEN GAPS & BACKLOG */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <h4 className="font-display text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Open AI Gaps
                </h4>
              </div>
              <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                {openBriefs.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[220px]">
              {openBriefs.length === 0 ? (
                <div className="text-center py-12 rounded-xl bg-white/60 border border-dashed border-slate-200 text-xs text-slate-400">
                  No open gaps! Your brand has clean AI coverage.
                </div>
              ) : (
                openBriefs.map((brief) => {
                  const prio =
                    priorityConfig[brief.recommendation?.priority as keyof typeof priorityConfig] ||
                    priorityConfig.medium;

                  return (
                    <div
                      key={brief.id}
                      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:shadow-card transition-all space-y-2.5 border-l-4 ${prio.border}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                          {brief.gap_type.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.2 text-[9px] font-bold border ${prio.bg}`}
                        >
                          {prio.label}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        {brief.gap_description}
                      </p>

                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                        <span className="font-bold text-slate-700 block">
                          Target: {brief.recommendation?.target || 'Landing Page'}
                        </span>
                        <p className="text-slate-600 line-clamp-2">
                          {brief.recommendation?.content_hint}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleUpdateStatus(brief.id, 'dismissed')}
                          className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(brief.id, 'applied')}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                        >
                          <span>Mark Applied</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 2: APPLIED TO WEBSITE */}
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/20 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-200/60">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="font-display text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Applied (In Verification Loop)
                </h4>
              </div>
              <span className="rounded-full bg-white border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                {appliedBriefs.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[220px]">
              {appliedBriefs.length === 0 ? (
                <div className="text-center py-12 rounded-xl bg-white/60 border border-dashed border-emerald-200 text-xs text-emerald-600/70">
                  Click &quot;Mark Applied&quot; on any gap once you update your site code or schema.
                </div>
              ) : (
                appliedBriefs.map((brief) => (
                  <div
                    key={brief.id}
                    className="rounded-xl border border-emerald-200 bg-white p-4 shadow-2xs space-y-2 border-l-4 border-l-emerald-500"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        {brief.gap_type.replace(/_/g, ' ')}
                      </span>
                      <span className="rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[9px] font-bold">
                        APPLIED
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      {brief.gap_description}
                    </p>

                    <div className="p-2 rounded-lg bg-emerald-50/60 text-[11px] text-emerald-800">
                      ⏱ Next automated weekly scan will verify if AI engines quote this fix.
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => handleUpdateStatus(brief.id, 'open')}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" /> Re-open
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(brief.id, 'dismissed')}
                        className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COLUMN 3: DISMISSED / ARCHIVED */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                <h4 className="font-display text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Archived / Dismissed
                </h4>
              </div>
              <span className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                {dismissedBriefs.length}
              </span>
            </div>

            <div className="space-y-3 min-h-[220px]">
              {dismissedBriefs.length === 0 ? (
                <div className="text-center py-12 rounded-xl bg-white/60 border border-dashed border-slate-200 text-xs text-slate-400">
                  No dismissed tasks.
                </div>
              ) : (
                dismissedBriefs.map((brief) => (
                  <div
                    key={brief.id}
                    className="rounded-xl border border-slate-200 bg-white/80 p-3.5 shadow-2xs space-y-2 opacity-75 hover:opacity-100 transition-opacity"
                  >
                    <p className="text-xs font-medium text-slate-700 line-through">
                      {brief.gap_description}
                    </p>
                    <button
                      onClick={() => handleUpdateStatus(brief.id, 'open')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      <RotateCcw className="h-3 w-3" /> Restore to Open Gaps
                    </button>
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
        <div className="space-y-4">
          {openBriefs.map((brief) => {
            const prio =
              priorityConfig[brief.recommendation?.priority as keyof typeof priorityConfig] ||
              priorityConfig.medium;

            return (
              <div
                key={brief.id}
                className={`rounded-xl border border-slate-200 bg-white p-5 shadow-2xs border-l-4 ${prio.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {brief.gap_type.replace(/_/g, ' ')}
                    </span>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold border ${prio.bg}`}>
                      {prio.label}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{brief.gap_description}</h4>
                  <p className="text-xs text-slate-600">{brief.recommendation?.content_hint}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdateStatus(brief.id, 'applied')}
                    className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Apply Fix</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(brief.id, 'dismissed')}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
