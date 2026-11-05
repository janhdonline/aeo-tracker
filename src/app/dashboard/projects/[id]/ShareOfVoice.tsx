'use client';

import { motion } from 'framer-motion';

interface Props {
  yourDomain: string;
  yourMentions: number;
  competitorCounts: Record<string, number>;
}

export function ShareOfVoice({ yourDomain, yourMentions, competitorCounts }: Props) {
  const entries = Object.entries(competitorCounts)
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count);

  const total = yourMentions + entries.reduce((s, e) => s + e.count, 0);
  if (total === 0) return null;

  const yourPct = Math.round((yourMentions / total) * 100);
  const rows = entries.map((e) => ({
    ...e,
    pct: Math.round((e.count / total) * 100),
  }));

  const palette = ['#eb9d2a', '#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-lg font-semibold">Share of Voice</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mentions across {total} AI responses in the latest scan
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold text-[#eb9d2a]">{yourPct}%</p>
          <p className="text-xs text-slate-500">your share</p>
        </div>
      </div>

      {/* Your bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-slate-800 truncate mr-2">{yourDomain}</span>
          <span className="text-sm font-semibold text-slate-900 shrink-0">
            {yourMentions} · {yourPct}%
          </span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${yourPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-[#eb9d2a]"
          />
        </div>
      </div>

      {/* Competitor bars */}
      <div className="space-y-3">
        {rows.map((row, i) => (
          <div key={row.domain}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-slate-700 truncate mr-2">{row.domain}</span>
              <span className="text-sm font-semibold text-slate-900 shrink-0">
                {row.count} · {row.pct}%
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${row.pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.05 * (i + 1) }}
                className="h-full rounded-full"
                style={{ backgroundColor: palette[i % palette.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}