'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, Search, Sparkles, Check, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Keyword {
  id: string;
  keyword: string;
  intent: string;
  source: string;
  active: boolean;
}

interface Props {
  projectId?: string;
  keywords: Keyword[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.85, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export function AnimatedKeywords({ projectId, keywords: initialKeywords }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords);
  const [newKeyword, setNewKeyword] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddKeyword(e: React.FormEvent) {
    e.preventDefault();
    const clean = newKeyword.trim();
    if (!clean || !projectId) return;

    if (keywords.some((k) => k.keyword.toLowerCase() === clean.toLowerCase())) {
      setError('Keyword already tracked');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsAdding(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: insertErr } = await supabase
        .from('keywords')
        .insert({
          project_id: projectId,
          keyword: clean,
          intent: 'commercial',
          source: 'user',
          active: true,
        })
        .select()
        .single();

      if (insertErr) {
        throw new Error(insertErr.message);
      }

      if (data) {
        setKeywords((prev) => [data, ...prev]);
        setNewKeyword('');
        setShowInput(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to add keyword');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <motion.div
      variants={container}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="show"
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6 space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-base font-bold text-slate-900">
              Monitored Keywords & Prompts ({keywords.length})
            </h3>
            <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200">
              Commercial Intent
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Buyer queries tested across ChatGPT, Perplexity, Gemini, and Claude.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {projectId && !showInput && (
            <button
              onClick={() => setShowInput(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-emerald-500" />
              <span>Add Keyword</span>
            </button>
          )}
          {projectId && (
            <Link
              href={`/dashboard/projects/${projectId}/keywords`}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Manage All →
            </Link>
          )}
        </div>
      </div>

      {/* Inline Quick Add Input */}
      {showInput && (
        <form onSubmit={handleAddKeyword} className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <input
              type="text"
              autoFocus
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="e.g. best project management tool for engineers..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-3 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isAdding || !newKeyword.trim()}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Plus className="h-3 w-3 text-emerald-400" />
            <span>{isAdding ? 'Adding...' : 'Add'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowInput(false)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2 py-2 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      )}

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {keywords.length === 0 ? (
        <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500">
          No keywords tracked yet. Click &quot;Add Keyword&quot; above to track buyer prompts.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 pt-1">
          <AnimatePresence mode="popLayout">
            {keywords.map((kw) => (
              <motion.span
                key={kw.id}
                variants={item}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -8, transition: { duration: 0.15 } }}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.04, y: -1 }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  kw.intent === 'commercial'
                    ? 'bg-purple-50/70 text-purple-800 border-purple-200/80 hover:bg-purple-100/70'
                    : kw.intent === 'navigational'
                    ? 'bg-blue-50/70 text-blue-800 border-blue-200/80 hover:bg-blue-100/70'
                    : 'bg-slate-100/80 text-slate-700 border-slate-200 hover:bg-slate-200/60'
                }`}
              >
                <span>{kw.keyword}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-md uppercase font-bold tracking-wider ${
                    kw.source === 'discovery'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-white/80 text-slate-600 border border-slate-200'
                  }`}
                >
                  {kw.source === 'discovery' ? 'AUTO SEED' : 'CUSTOM'}
                </span>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
