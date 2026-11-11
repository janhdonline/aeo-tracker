'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, RefreshCw, ShieldAlert, Bot } from 'lucide-react';
import { AI_CRAWLERS } from '@/lib/constants/crawlers';

interface CrawlerState {
  name: string;
  company: string;
  role: string;
  allowed: boolean;
  reason?: string;
}

interface AIBotAccessMatrixProps {
  domain: string;
  initialCrawlers?: CrawlerState[];
}

export function AIBotAccessMatrix({ domain, initialCrawlers }: AIBotAccessMatrixProps) {
  const [crawlers, setCrawlers] = useState<CrawlerState[]>(
    initialCrawlers ||
      AI_CRAWLERS.map((c) => ({
        name: c.name,
        company: c.company,
        role: c.role,
        allowed: true,
      }))
  );
  const [loading, setLoading] = useState(false);
  const [lastTested, setLastTested] = useState<string | null>(null);

  const allowedCount = crawlers.filter((c) => c.allowed).length;
  const blockedCount = crawlers.length - allowedCount;

  const handleRunAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tools/ai-crawler-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.crawlers && Array.isArray(data.crawlers)) {
          setCrawlers(data.crawlers);
        }
        setLastTested(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn('Crawler retest failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-2xs">
              <Bot className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-bold text-slate-950">
              AI Bot Access
            </h3>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              {allowedCount}/{crawlers.length} Allowed
            </span>
            {blockedCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
                {blockedCount} Blocked
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {allowedCount}/{crawlers.length} frontier AI search and reasoning engines can currently index your domain without robots.txt restrictions.
          </p>
        </div>

        {/* Live Re-test Button */}
        <button
          onClick={handleRunAudit}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors shrink-0 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Auditing robots.txt...' : 'Re-verify Crawlers'}</span>
        </button>
      </div>

      {/* 23-Crawler 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
        {crawlers.map((c) => (
          <div
            key={c.name}
            className={`flex items-start justify-between p-3 rounded-xl border transition-all ${
              c.allowed
                ? 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 shadow-2xs'
                : 'border-rose-200 bg-rose-50/30'
            }`}
          >
            <div className="space-y-0.5 min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900 truncate">
                  {c.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  ({c.company})
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate" title={c.role}>
                {c.role}
              </p>
            </div>

            <div className="shrink-0 mt-0.5">
              {c.allowed ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-600" />
              )}
            </div>
          </div>
        ))}
      </div>

      {lastTested && (
        <p className="text-[11px] text-slate-400 text-right pt-1">
          Last tested against live robots.txt at {lastTested}
        </p>
      )}
    </div>
  );
}
