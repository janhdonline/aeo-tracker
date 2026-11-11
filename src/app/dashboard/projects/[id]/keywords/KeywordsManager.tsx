'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Search,
  Plus,
  Sparkles,
  Trash2,
  Filter,
  Layers,
  Target,
  Bot,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Keyword {
  id: string;
  keyword: string;
  intent: string;
  source: string;
  active: boolean;
}

interface KeywordsManagerProps {
  projectId: string;
  initialKeywords: Keyword[];
  plan: 'free' | 'starter' | 'pro' | string;
}

const PLAN_LIMITS: Record<string, { keywords: number; engines: string[] }> = {
  free: { keywords: 10, engines: ['Google Gemini'] },
  starter: { keywords: 50, engines: ['Google Gemini', 'Perplexity', 'ChatGPT-4o'] },
  pro: { keywords: 150, engines: ['Google Gemini', 'Perplexity', 'ChatGPT-4o', 'xAI Grok'] },
};

export function KeywordsManager({ projectId, initialKeywords, plan }: KeywordsManagerProps) {
  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords);
  const [newKeyword, setNewKeyword] = useState('');
  const [newIntent, setNewIntent] = useState<'commercial' | 'informational' | 'navigational'>('commercial');
  const [filterIntent, setFilterIntent] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const supabase = createClient();

  const currentPlan = (plan?.toLowerCase() || 'free') as 'free' | 'starter' | 'pro';
  const planConfig = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.free;
  const planLimit = planConfig.keywords;
  const canAdd = keywords.length < planLimit;
  const usagePct = Math.min(100, Math.round((keywords.length / planLimit) * 100));

  const commercialCount = useMemo(
    () => keywords.filter((k) => k.intent?.toLowerCase() === 'commercial').length,
    [keywords]
  );
  const informationalCount = useMemo(
    () => keywords.filter((k) => k.intent?.toLowerCase() === 'informational').length,
    [keywords]
  );

  const filteredKeywords = useMemo(() => {
    return keywords.filter((k) => {
      const matchesSearch = k.keyword.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterIntent === 'all' || k.intent?.toLowerCase() === filterIntent.toLowerCase();
      return matchesSearch && matchesFilter;
    });
  }, [keywords, searchQuery, filterIntent]);

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    if (!canAdd) {
      setFeedbackMsg({
        text: `Keyword limit reached (${planLimit} max for ${plan} tier). Upgrade to expand your radar.`,
        type: 'error',
      });
      return;
    }

    setIsAdding(true);
    setFeedbackMsg(null);

    try {
      const { data, error } = await supabase
        .from('keywords')
        .insert({
          project_id: projectId,
          keyword: newKeyword.trim(),
          intent: newIntent,
          source: 'user',
          active: true,
        })
        .select()
        .single();

      if (error) {
        setFeedbackMsg({ text: error.message, type: 'error' });
      } else if (data) {
        setKeywords([data, ...keywords]);
        setNewKeyword('');
        setFeedbackMsg({ text: `Added "${data.keyword}" to active AI tracking radar.`, type: 'success' });
      }
    } catch (err: any) {
      setFeedbackMsg({ text: err?.message || 'Failed to add keyword', type: 'error' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDiscover = async () => {
    setDiscoverLoading(true);
    setFeedbackMsg(null);
    try {
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });
      const result = await response.json();
      if (!response.ok) {
        setFeedbackMsg({ text: result.error || 'Discovery engine unavailable', type: 'error' });
      } else if (result.keywords && result.keywords.length > 0) {
        setKeywords([...result.keywords, ...keywords]);
        setFeedbackMsg({ text: `Discovered ${result.keywords.length} high-intent commercial prompts!`, type: 'success' });
      } else {
        setFeedbackMsg({ text: result.message || 'No additional commercial keywords discovered.', type: 'success' });
      }
    } catch (error: any) {
      setFeedbackMsg({ text: error?.message || 'Discovery engine error', type: 'error' });
    } finally {
      setDiscoverLoading(false);
    }
  };

  const handleDelete = async (id: string, kwName: string) => {
    await supabase.from('keywords').delete().eq('id', id);
    setKeywords(keywords.filter((k) => k.id !== id));
    setFeedbackMsg({ text: `Removed "${kwName}" from tracking.`, type: 'success' });
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP BENTO METRICS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Tracked Prompts */}
        <div className="rounded-bento border border-slate-200/90 bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Prompts
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-[#D4F63C] shadow-2xs">
              <Target className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-slate-950">{keywords.length}</span>
            <span className="text-xs font-semibold text-slate-400">/ {planLimit} capacity</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePct > 90 ? 'bg-rose-500' : 'bg-gradient-to-r from-[#D4F63C] to-emerald-500'
              }`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
        </div>

        {/* Metric 2: Commercial Buyer Intent */}
        <div className="rounded-bento border border-slate-200/90 bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Commercial Intent
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-slate-950">{commercialCount}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {keywords.length > 0 ? Math.round((commercialCount / keywords.length) * 100) : 0}% high-value
            </span>
          </div>
          <p className="mt-2.5 text-[11px] text-slate-500 font-medium">
            Queries where prospective buyers compare solutions
          </p>
        </div>

        {/* Metric 3: Informational / Problem Intent */}
        <div className="rounded-bento border border-slate-200/90 bg-white p-5 shadow-bento">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Problem / Info
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-slate-950">{informationalCount}</span>
            <span className="text-xs font-semibold text-slate-400">how-to / definitions</span>
          </div>
          <p className="mt-2.5 text-[11px] text-slate-500 font-medium">
            AI queries focused on solutions and educational guides
          </p>
        </div>

        {/* Metric 4: AI Engine Radar Coverage */}
        <div className="rounded-bento border border-slate-800 bg-[#0B0F17] p-5 shadow-bento text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Audited AI Engines
            </span>
            <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
          </div>
          <span className="font-display text-3xl font-black text-[#D4F63C]">
            {planConfig.engines.length}{' '}
            <span className="text-base font-normal text-slate-300">Frontier Models</span>
          </span>
          <div className="mt-2.5 flex flex-wrap gap-1">
            {planConfig.engines.map((eng) => (
              <span
                key={eng}
                className="text-[10px] font-bold bg-slate-800/90 text-slate-200 px-2 py-0.5 rounded-full border border-slate-700"
              >
                {eng}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. ADD KEYWORD COMMAND STRIP */}
      <div className="rounded-bento border border-slate-200/90 bg-white p-5 sm:p-6 shadow-bento">
        <form onSubmit={handleAddKeyword} className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Enter commercial prompt (e.g. 'Best enterprise expense automation software')"
                disabled={!canAdd}
                className="w-full rounded-full border border-slate-200/90 bg-slate-50/50 py-3 pl-11 pr-4 text-xs font-semibold text-slate-900 placeholder:text-slate-400 transition-all focus:border-slate-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D4F63C]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={newIntent}
                onChange={(e: any) => setNewIntent(e.target.value)}
                className="rounded-full border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#D4F63C]"
              >
                <option value="commercial">Commercial Intent</option>
                <option value="informational">Informational Intent</option>
                <option value="navigational">Navigational Intent</option>
              </select>

              <button
                type="submit"
                disabled={isAdding || !newKeyword.trim() || !canAdd}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-xs transition-all hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
              >
                <Plus className="h-4 w-4 text-[#D4F63C]" />
                <span>{isAdding ? 'Adding...' : 'Add Prompt'}</span>
              </button>

              <button
                type="button"
                onClick={handleDiscover}
                disabled={discoverLoading}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-xs transition-all hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className={`h-4 w-4 ${discoverLoading ? 'animate-spin' : ''}`} />
                <span>{discoverLoading ? 'Scanning...' : 'AI Discover'}</span>
              </button>
            </div>
          </div>

          {feedbackMsg && (
            <div
              className={`flex items-center gap-2 rounded-xl p-3 text-xs font-semibold ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}
        </form>
      </div>

      {/* 3. KEYWORD RADAR TABLE WITH BENTO STYLING */}
      <div className="rounded-bento border border-slate-200/90 bg-white shadow-bento overflow-hidden">
        {/* Table Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 p-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Filter Intent:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'all', label: `All (${keywords.length})` },
                { key: 'commercial', label: `Commercial (${commercialCount})` },
                { key: 'informational', label: `Informational (${informationalCount})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilterIntent(tab.key)}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all cursor-pointer ${
                    filterIntent === tab.key
                      ? 'bg-slate-950 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active prompts..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-slate-950 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left">
            <thead>
              <tr className="bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-500">
                <th className="py-3.5 pl-6 pr-4">Commercial Prompt / Keyword</th>
                <th className="px-4 py-3.5">Intent Category</th>
                <th className="px-4 py-3.5">Discovery Source</th>
                <th className="px-4 py-3.5">Radar Telemetry</th>
                <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              <AnimatePresence mode="popLayout">
                {filteredKeywords.map((kw) => {
                  const isCommercial = kw.intent?.toLowerCase() === 'commercial';
                  const isNavigational = kw.intent?.toLowerCase() === 'navigational';

                  return (
                    <motion.tr
                      key={kw.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="group transition-colors hover:bg-slate-50/60"
                    >
                      <td className="py-4 pl-6 pr-4 font-bold text-slate-950">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 text-[10px] font-black">
                            Q
                          </span>
                          <span>{kw.keyword}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isCommercial
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                              : isNavigational
                              ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
                              : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {kw.intent ? kw.intent.toUpperCase() : 'INFORMATIONAL'}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                          {kw.source === 'discovery' ? 'AI AUTO-DISCOVER' : 'CUSTOM INPUT'}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
                          Weekly Scan
                        </span>
                      </td>

                      <td className="py-4 pl-4 pr-6 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(kw.id, kw.keyword)}
                          className="rounded-lg p-1.5 text-slate-400 opacity-60 transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 cursor-pointer"
                          title="Remove prompt"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredKeywords.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              <Target className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No prompts match your criteria</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Add your primary industry prompts above or click &ldquo;AI Discover&rdquo; to auto-generate high-intent prompts.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
