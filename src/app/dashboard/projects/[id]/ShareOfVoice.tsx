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

  const palette = ['#10b981', '#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899'];

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 mb-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-display text-base font-bold text-slate-900">Share of Voice</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Mentions across {total} AI responses in the latest scan
          </p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold text-emerald-600">{yourPct}%</p>
          <p className="text-xs text-slate-500 font-medium">your share</p>
        </div>
      </div>

      {/* Your bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold text-slate-800 truncate mr-2">{yourDomain}</span>
          <span className="text-xs font-bold text-slate-900 shrink-0">
            {yourMentions} mentions · {yourPct}%
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${yourPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full bg-emerald-500"
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