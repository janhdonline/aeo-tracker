'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Globe,
  ExternalLink,
  Shield,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  Flame,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface CompetitorEntry {
  domain: string;
  brand: string;
  isSelf?: boolean;
  score: number;
  sovPct: number;
  citations: number;
  topEngines: string[];
  status: 'Leader' | 'Strong Contender' | 'Challenger' | 'Laggard';
  headToHeadWinPct: number;
}

const DEFAULT_LEADERBOARD: CompetitorEntry[] = [
  {
    domain: 'linear.app',
    brand: 'Linear',
    score: 91,
    sovPct: 34,
    citations: 620,
    topEngines: ['ChatGPT', 'Claude 3.5', 'Perplexity'],
    status: 'Leader',
    headToHeadWinPct: 74,
  },
  {
    domain: 'stripe.com',
    brand: 'Stripe',
    score: 88,
    sovPct: 29,
    citations: 540,
    topEngines: ['ChatGPT', 'Perplexity Pro'],
    status: 'Strong Contender',
    headToHeadWinPct: 68,
  },
  {
    domain: 'notion.so',
    brand: 'Notion',
    isSelf: true,
    score: 84,
    sovPct: 24,
    citations: 480,
    topEngines: ['Gemini', 'Perplexity', 'ChatGPT'],
    status: 'Strong Contender',
    headToHeadWinPct: 62,
  },
  {
    domain: 'supabase.com',
    brand: 'Supabase',
    score: 79,
    sovPct: 18,
    citations: 390,
    topEngines: ['Gemini', 'ChatGPT'],
    status: 'Challenger',
    headToHeadWinPct: 54,
  },
  {
    domain: 'github.com',
    brand: 'GitHub',
    score: 94,
    sovPct: 41,
    citations: 890,
    topEngines: ['ChatGPT', 'Claude 3.5', 'Grok 2'],
    status: 'Leader',
    headToHeadWinPct: 82,
  },
];

interface CompetitorWidgetProps {
  currentDomain?: string;
  userScore?: number;
}

export function CompetitorLeaderboardWidget({ currentDomain = 'notion.so', userScore = 84 }: CompetitorWidgetProps) {
  const [selectedSort, setSelectedSort] = useState<'score' | 'sov' | 'citations'>('score');

  const sortedList = [...DEFAULT_LEADERBOARD].sort((a, b) => {
    if (selectedSort === 'score') return b.score - a.score;
    if (selectedSort === 'sov') return b.sovPct - a.sovPct;
    return b.citations - a.citations;
  });

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60">
              <Award className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-bold text-slate-900">
              Competitor Intelligence & Share of Voice Leaderboard
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-200/60">
              5 Tech Benchmarks
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Head-to-head citation comparison across commercial prompts in ChatGPT, Perplexity, Claude, and Gemini.
          </p>
        </div>

        {/* Sort Pills */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">Sort by:</span>
          <div className="inline-flex items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200/60 font-semibold">
            <button
              onClick={() => setSelectedSort('score')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedSort === 'score'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              AEO Score
            </button>
            <button
              onClick={() => setSelectedSort('sov')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedSort === 'sov'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Share of Voice
            </button>
            <button
              onClick={() => setSelectedSort('citations')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedSort === 'citations'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Citations
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pl-2">Rank & Property</th>
              <th className="pb-3 text-center">AEO Score</th>
              <th className="pb-3">Share of Voice</th>
              <th className="pb-3 text-center">AI Citations</th>
              <th className="pb-3 hidden md:table-cell">Top AI Channels</th>
              <th className="pb-3 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {sortedList.map((c, idx) => {
              const isUser = c.isSelf || c.domain.toLowerCase() === currentDomain.toLowerCase();
              return (
                <tr
                  key={c.domain}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    isUser ? 'bg-emerald-50/40 border-l-4 border-l-emerald-500' : ''
                  }`}
                >
                  {/* Brand & Rank */}
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-600">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {c.brand}
                          </span>
                          {isUser && (
                            <span className="inline-flex items-center rounded-md bg-emerald-100/80 px-1.5 py-0.2 text-[10px] font-bold text-emerald-800">
                              Your Brand
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">{c.domain}</span>
                      </div>
                    </div>
                  </td>

                  {/* AEO Score */}
                  <td className="py-3.5 text-center">
                    <span
                      className={`inline-flex items-center justify-center rounded-xl px-2.5 py-1 text-xs font-extrabold ${
                        c.score >= 90
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.score >= 80
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {c.score}/100
                    </span>
                  </td>

                  {/* Share of Voice Bar */}
                  <td className="py-3.5 min-w-[140px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-slate-800">{c.sovPct}%</span>
                        <span className="text-slate-400">Head-to-head {c.headToHeadWinPct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isUser ? 'bg-emerald-500' : 'bg-slate-700'
                          }`}
                          style={{ width: `${Math.min(100, c.sovPct * 2.5)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* AI Citations */}
                  <td className="py-3.5 text-center font-bold text-slate-800">
                    {c.citations}+
                  </td>

                  {/* Top AI Channels */}
                  <td className="py-3.5 hidden md:table-cell">
                    <div className="flex flex-wrap items-center gap-1">
                      {c.topEngines.map((eng) => (
                        <span
                          key={eng}
                          className="text-[10px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                        >
                          {eng}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Inspect CTA */}
                  <td className="py-3.5 text-right pr-2">
                    <Link
                      href={`/report/${c.domain}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs transition-colors"
                    >
                      <span>Report</span>
                      <ExternalLink className="h-3 w-3 text-slate-400" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Insight Box */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500 shrink-0" />
          <span>
            <strong>AI Competitive Insight:</strong> Competitors with explicit comparison pages capture <span className="font-bold text-slate-900">42% more buyer-intent prompts</span> in Claude and ChatGPT Search.
          </span>
        </div>
        <Link
          href="/compare"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors shrink-0"
        >
          <span>Run Custom Comparison</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
