'use client';

import { useState } from 'react';
import { Calendar, TrendingUp, History, Clock } from 'lucide-react';

export interface ScanHistoryItem {
  id: string;
  dateStr: string;
  score: number;
  delta?: number;
  engineCount?: number;
}

interface ScoreHistoryTimelineProps {
  history?: ScanHistoryItem[];
  currentScore?: number;
}

export function ScoreHistoryTimeline({ history: propHistory, currentScore }: ScoreHistoryTimelineProps) {
  const defaultHistory: ScanHistoryItem[] = [
    { id: '1', dateStr: 'Nov 11, 06:05 AM', score: currentScore || 88, delta: +4 },
    { id: '2', dateStr: 'Nov 04, 07:29 PM', score: 84, delta: +2 },
    { id: '3', dateStr: 'Oct 28, 03:55 PM', score: 82, delta: 0 },
    { id: '4', dateStr: 'Oct 21, 06:50 AM', score: 82, delta: +6 },
    { id: '5', dateStr: 'Oct 14, 10:27 PM', score: 76, delta: +2 },
    { id: '6', dateStr: 'Oct 07, 05:11 PM', score: 74, delta: -2 },
    { id: '7', dateStr: 'Sep 30, 03:05 PM', score: 76, delta: +8 },
    { id: '8', dateStr: 'Sep 23, 09:50 AM', score: 68, delta: 0 },
  ];

  const items = propHistory && propHistory.length > 0 ? propHistory : defaultHistory;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold shadow-2xs">
            <History className="h-4 w-4" />
          </span>
          <h3 className="font-display text-base font-bold text-slate-950">
            Score History
          </h3>
        </div>
        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
          Automated Scans
        </span>
      </div>
      <p className="text-xs text-slate-500">
        Historical audit trajectory and AI visibility evolution across scheduled scans.
      </p>

      {/* History Rows List matching user reference image */}
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        {items.map((item, idx) => {
          const isLatest = idx === 0;
          return (
            <div
              key={item.id || idx}
              className={`flex items-center justify-between p-3 text-xs transition-colors hover:bg-slate-50/60 ${
                isLatest ? 'bg-emerald-50/20' : ''
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium text-slate-800">{item.dateStr}</span>
                {isLatest && (
                  <span className="rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2">
                    LATEST
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {item.delta !== undefined && item.delta !== 0 && (
                  <span
                    className={`text-[10px] font-bold ${
                      item.delta > 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {item.delta > 0 ? `+${item.delta}` : item.delta}
                  </span>
                )}
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                  {item.score}/100
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400 text-center pt-1">
        {items.length} historical scans archived in timeline
      </p>
    </div>
  );
}
