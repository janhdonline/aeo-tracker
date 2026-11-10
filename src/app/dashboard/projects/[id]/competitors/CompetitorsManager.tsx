'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Plus,
  Trash2,
  ExternalLink,
  Shield,
  TrendingUp,
  Award,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Flame,
  Search,
} from 'lucide-react';

interface CompetitorsManagerProps {
  projectId: string;
  domain: string;
  brandName: string;
  initialCompetitors: string[];
  competitorCounts: Record<string, number>;
  yourMentions: number;
}

const COMMON_SUGGESTIONS: Record<string, string[]> = {
  notion: ['coda.io', 'clickup.com', 'slite.com', 'obsidian.md', 'airtable.com', 'monday.com'],
  stripe: ['adyen.com', 'paddle.com', 'braintreepayments.com', 'checkout.com', 'square.com'],
  linear: ['jira.atlassian.com', 'asana.com', 'shortcut.com', 'height.app', 'github.com'],
  supabase: ['firebase.google.com', 'planetscale.com', 'nhost.io', 'neon.tech', 'appwrite.io'],
  default: ['competitor1.com', 'competitor2.com', 'alternative.io'],
};

export function CompetitorsManager({
  projectId,
  domain,
  brandName,
  initialCompetitors,
  competitorCounts,
  yourMentions,
}: CompetitorsManagerProps) {
  const router = useRouter();
  const [competitors, setCompetitors] = useState<string[]>(initialCompetitors);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Compute suggestions based on current domain
  const domainKey = domain.split('.')[0]?.toLowerCase() || '';
  const suggestions = (COMMON_SUGGESTIONS[domainKey] || COMMON_SUGGESTIONS.default).filter(
    (s) => !competitors.includes(s) && s !== domain
  );

  // Compute total mentions across brand + tracked competitors
  const competitorTotalMentions = Object.values(competitorCounts).reduce((acc, curr) => acc + curr, 0);
  const grandTotal = yourMentions + competitorTotalMentions;
  const yourSoVPct = grandTotal > 0 ? Math.round((yourMentions / grandTotal) * 100) : 0;

  async function handleAddCompetitor(domainToAdd?: string) {
    const raw = domainToAdd || newCompetitor;
    const clean = raw
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0];

    if (!clean || !clean.includes('.')) {
      setError('Please enter a valid domain (e.g. competitor.com)');
      return;
    }

    if (clean === domain.toLowerCase()) {
      setError('You cannot add your own domain as a competitor');
      return;
    }

    if (competitors.includes(clean)) {
      setError('This competitor is already being tracked');
      return;
    }

    const updated = [...competitors, clean];
    await saveCompetitors(updated, `Added ${clean} to tracking radar`);
    if (!domainToAdd) setNewCompetitor('');
  }

  async function handleRemoveCompetitor(compToRemove: string) {
    const updated = competitors.filter((c) => c !== compToRemove);
    await saveCompetitors(updated, `Removed ${compToRemove} from tracking radar`);
  }

  async function saveCompetitors(updatedList: string[], successMsg: string) {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitor_domains: updatedList,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update competitors');
      }

      setCompetitors(updatedList);
      setSuccess(successMsg);
      router.refresh();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message || 'Error updating competitor list');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 4 SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tracked Competitors</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-slate-900">{competitors.length}</span>
            <span className="text-xs text-slate-500 font-medium">domains monitored</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Share of Voice</span>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Live Index
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-emerald-600">{yourSoVPct}%</span>
            <span className="text-xs text-slate-500 font-medium">{yourMentions} mentions</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Competitor Mentions</span>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Citation Pressure
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-slate-900">{competitorTotalMentions}</span>
            <span className="text-xs text-slate-500 font-medium">citations captured</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Head-to-Head Win Rate</span>
            <Award className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-bold text-blue-600">
              {grandTotal > 0 ? Math.round((yourMentions / (yourMentions + Math.max(1, competitorTotalMentions))) * 100) : 65}%
            </span>
            <span className="text-xs text-slate-500 font-medium">in buyer queries</span>
          </div>
        </div>
      </div>

      {/* ADD COMPETITOR CONTROL BAR */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900">Add Competitor Web Property</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Track how rival vendors perform when potential buyers query ChatGPT, Perplexity, Gemini, and Claude for recommendations.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddCompetitor();
          }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
        >
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Globe className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={newCompetitor}
              onChange={(e) => setNewCompetitor(e.target.value)}
              placeholder="e.g. coda.io, clickup.com, linear.app"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-slate-900 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !newCompetitor.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5 text-emerald-400" />
            <span>{isSubmitting ? 'Saving...' : 'Add Competitor'}</span>
          </button>
        </form>

        {/* Suggestion Chips */}
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" /> Suggested Rivals:
            </span>
            {suggestions.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddCompetitor(sug)}
                className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-[11px] transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>+ {sug}</span>
              </button>
            ))}
          </div>
        )}

        {/* Status Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}
      </div>

      {/* COMPETITORS RADAR TABLE */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Head-to-Head Competitor Radar</h3>
            <p className="text-xs text-slate-500">Live comparison of market presence across commercial AI queries.</p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {competitors.length + 1} Properties Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pl-2">Brand & Domain</th>
                <th className="pb-3">Tracking Status</th>
                <th className="pb-3">Share of Voice</th>
                <th className="pb-3 text-center">AI Citations</th>
                <th className="pb-3 text-center">Threat Rating</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {/* Your Brand Row */}
              <tr className="bg-emerald-50/50 border-l-4 border-l-emerald-500">
                <td className="py-3.5 pl-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs">
                      YOU
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">{brandName || domain}</span>
                        <span className="inline-flex items-center rounded-md bg-emerald-100 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                          Primary Domain
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">{domain}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Monitored Active
                  </span>
                </td>
                <td className="py-3.5 min-w-[140px]">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-slate-900">{yourSoVPct}%</span>
                      <span className="text-slate-400">Baseline</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(10, yourSoVPct)}%` }} />
                    </div>
                  </div>
                </td>
                <td className="py-3.5 text-center font-bold text-emerald-700 text-sm">
                  {yourMentions}
                </td>
                <td className="py-3.5 text-center">
                  <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    Defending Brand
                  </span>
                </td>
                <td className="py-3.5 text-right pr-2">
                  <Link
                    href={`/report/${domain}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
                  >
                    <span>View Report</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </td>
              </tr>

              {/* Competitor Rows */}
              {competitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <Layers className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">No competitors tracked yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Add competitor domains above or choose from suggested tech rivals to monitor their AI visibility.
                    </p>
                  </td>
                </tr>
              ) : (
                competitors.map((comp) => {
                  const count = competitorCounts[comp] || 0;
                  const compPct = grandTotal > 0 ? Math.round((count / grandTotal) * 100) : 0;
                  const isHighThreat = count > yourMentions;

                  return (
                    <tr key={comp} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 pl-3">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-xs uppercase">
                            {comp.charAt(0)}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 text-xs sm:text-sm block">
                              {comp.split('.')[0].replace(/[-_]/g, ' ').toUpperCase()}
                            </span>
                            <span className="text-[11px] text-slate-400">{comp}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                          Weekly Audit
                        </span>
                      </td>

                      <td className="py-3.5 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-bold text-slate-800">{compPct}%</span>
                            <span className="text-slate-400">{count} mentions</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isHighThreat ? 'bg-rose-500' : 'bg-slate-600'}`}
                              style={{ width: `${Math.max(5, compPct)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 text-center font-bold text-slate-800 text-sm">
                        {count}
                      </td>

                      <td className="py-3.5 text-center">
                        <span
                          className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                            isHighThreat
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : count > 0
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isHighThreat ? 'High Threat' : count > 0 ? 'Moderate' : 'Low Visibility'}
                        </span>
                      </td>

                      <td className="py-3.5 text-right pr-2">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/report/${comp}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                            title="Inspect Competitor Public Report"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleRemoveCompetitor(comp)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove from tracking"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
