'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Zap,
  ArrowUpRight,
  BarChart2,
  Globe,
  Sparkles,
  Bot,
  Activity,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export interface DataPoint {
  date: string;
  displayDate: string;
  visibility: number;
  sentiment: number;
  citations: number;
  competitorAvg: number;
  topEngine: string;
  deltaText: string;
}

interface DailyAnalyticsProps {
  domain?: string;
  currentScore?: number;
  onDomainChange?: (domain: string) => void;
}

type MetricMode = 'visibility' | 'citations' | 'sentiment' | 'all' | 'competitor';

export function DailyAnalyticsChart({
  domain = 'notion.so',
  currentScore = 84,
}: DailyAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  // User choice: default primary focus is "visibility" (AEO Visibility Score)
  const [activeMetric, setActiveMetric] = useState<MetricMode>('visibility');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate historical curve data based on timeframe & domain score
  const data: DataPoint[] = useMemo(() => {
    const base = currentScore > 0 ? currentScore : 84;
    if (timeframe === '7d') {
      return [
        {
          date: '2026-11-05',
          displayDate: 'Nov 5',
          visibility: Math.max(48, base - 10),
          sentiment: 79,
          citations: 28,
          competitorAvg: 68,
          topEngine: 'ChatGPT-4o',
          deltaText: '+2.1%',
        },
        {
          date: '2026-11-06',
          displayDate: 'Nov 6',
          visibility: Math.max(52, base - 8),
          sentiment: 82,
          citations: 32,
          competitorAvg: 70,
          topEngine: 'Perplexity Pro',
          deltaText: '+3.4%',
        },
        {
          date: '2026-11-07',
          displayDate: 'Nov 7',
          visibility: Math.max(55, base - 6),
          sentiment: 81,
          citations: 35,
          competitorAvg: 69,
          topEngine: 'Gemini',
          deltaText: '+1.8%',
        },
        {
          date: '2026-11-08',
          displayDate: 'Nov 8',
          visibility: Math.max(62, base - 4),
          sentiment: 86,
          citations: 39,
          competitorAvg: 72,
          topEngine: 'ChatGPT-4o',
          deltaText: '+4.5%',
        },
        {
          date: '2026-11-09',
          displayDate: 'Nov 9',
          visibility: Math.max(68, base - 2),
          sentiment: 89,
          citations: 43,
          competitorAvg: 73,
          topEngine: 'Claude 3.5',
          deltaText: '+3.2%',
        },
        {
          date: '2026-11-10',
          displayDate: 'Yesterday',
          visibility: Math.max(76, base - 1),
          sentiment: 91,
          citations: 46,
          competitorAvg: 75,
          topEngine: 'ChatGPT-4o',
          deltaText: '+5.6%',
        },
        {
          date: '2026-11-11',
          displayDate: 'Today (Live)',
          visibility: base,
          sentiment: 93,
          citations: 48,
          competitorAvg: 76,
          topEngine: 'Perplexity Pro',
          deltaText: '+8.4%',
        },
      ];
    } else if (timeframe === '30d') {
      return [
        {
          date: '2026-10-12',
          displayDate: 'Oct 12',
          visibility: Math.max(40, base - 24),
          sentiment: 72,
          citations: 18,
          competitorAvg: 62,
          topEngine: 'ChatGPT',
          deltaText: '+1.2%',
        },
        {
          date: '2026-10-19',
          displayDate: 'Oct 19',
          visibility: Math.max(48, base - 18),
          sentiment: 77,
          citations: 24,
          competitorAvg: 65,
          topEngine: 'Gemini',
          deltaText: '+3.8%',
        },
        {
          date: '2026-10-26',
          displayDate: 'Oct 26',
          visibility: Math.max(56, base - 12),
          sentiment: 83,
          citations: 31,
          competitorAvg: 69,
          topEngine: 'Perplexity',
          deltaText: '+5.1%',
        },
        {
          date: '2026-11-02',
          displayDate: 'Nov 2',
          visibility: Math.max(69, base - 5),
          sentiment: 88,
          citations: 40,
          competitorAvg: 72,
          topEngine: 'ChatGPT-4o',
          deltaText: '+7.4%',
        },
        {
          date: '2026-11-11',
          displayDate: 'Current',
          visibility: base,
          sentiment: 93,
          citations: 48,
          competitorAvg: 76,
          topEngine: 'Claude 3.5',
          deltaText: '+8.4%',
        },
      ];
    } else {
      return [
        {
          date: '2026-08-15',
          displayDate: 'Aug 2026',
          visibility: Math.max(30, base - 35),
          sentiment: 66,
          citations: 14,
          competitorAvg: 58,
          topEngine: 'ChatGPT',
          deltaText: '+2.0%',
        },
        {
          date: '2026-09-15',
          displayDate: 'Sep 2026',
          visibility: Math.max(46, base - 22),
          sentiment: 76,
          citations: 26,
          competitorAvg: 64,
          topEngine: 'Gemini',
          deltaText: '+6.2%',
        },
        {
          date: '2026-10-15',
          displayDate: 'Oct 2026',
          visibility: Math.max(62, base - 11),
          sentiment: 84,
          citations: 38,
          competitorAvg: 70,
          topEngine: 'Perplexity',
          deltaText: '+11.5%',
        },
        {
          date: '2026-11-11',
          displayDate: 'Nov 2026',
          visibility: base,
          sentiment: 93,
          citations: 48,
          competitorAvg: 76,
          topEngine: 'ChatGPT-4o',
          deltaText: '+18.4%',
        },
      ];
    }
  }, [timeframe, currentScore]);

  // SVG Geometry Calculation (width 860, height 260)
  const svgWidth = 860;
  const svgHeight = 250;
  const paddingX = 46;
  const paddingY = 32;

  const points = useMemo(() => {
    const usableWidth = svgWidth - paddingX * 2;
    const usableHeight = svgHeight - paddingY * 2;
    const count = data.length;

    return data.map((d, i) => {
      const x = paddingX + (i / (count - 1)) * usableWidth;
      // visibility y (0 to 100)
      const yVis = svgHeight - paddingY - (d.visibility / 100) * usableHeight;
      // sentiment y (0 to 100)
      const ySent = svgHeight - paddingY - (d.sentiment / 100) * usableHeight;
      // citations scaled (0 to 60 -> scaled to 100)
      const yCit = svgHeight - paddingY - ((d.citations / 60) * 100 / 100) * usableHeight;
      // competitor benchmark y
      const yComp = svgHeight - paddingY - (d.competitorAvg / 100) * usableHeight;

      return { x, yVis, ySent, yCit, yComp, d };
    });
  }, [data]);

  // Build smooth cubic bezier curves
  const { visPath, visArea, sentPath, citPath, compPath } = useMemo(() => {
    if (points.length < 2) {
      return { visPath: '', visArea: '', sentPath: '', citPath: '', compPath: '' };
    }

    function createSmoothPath(getY: (p: (typeof points)[0]) => number) {
      let pth = `M ${points[0].x} ${getY(points[0])}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cx1 = p0.x + (p1.x - p0.x) * 0.45;
        const cy1 = getY(p0);
        const cx2 = p0.x + (p1.x - p0.x) * 0.55;
        const cy2 = getY(p1);
        pth += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${getY(p1)}`;
      }
      return pth;
    }

    const vPath = createSmoothPath((p) => p.yVis);
    const sPath = createSmoothPath((p) => p.ySent);
    const cPath = createSmoothPath((p) => p.yCit);
    const cmPath = createSmoothPath((p) => p.yComp);

    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const floorY = svgHeight - paddingY;
    const vArea = `${vPath} L ${lastX} ${floorY} L ${firstX} ${floorY} Z`;

    return { visPath: vPath, visArea: vArea, sentPath: sPath, citPath: cPath, compPath: cmPath };
  }, [points]);

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  // Tooltip positioning
  const tooltipXPercent = activePoint
    ? ((activePoint.x - paddingX) / (svgWidth - paddingX * 2)) * 100
    : 50;

  return (
    <section className="relative rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6 overflow-hidden">
      {/* Background Ambient Glow (Electric Indigo + Emerald) */}
      <div className="pointer-events-none absolute -top-24 right-1/4 h-72 w-96 rounded-full bg-gradient-to-br from-emerald-100/40 via-cyan-50/30 to-indigo-100/30 blur-3xl -z-0" />

      {/* Top Header & Range Controls */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h3 className="font-display text-lg font-bold text-slate-900 tracking-tight">
              AI Visibility & Citation Radar
            </h3>
            {domain && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-0.5 text-xs font-semibold text-white shadow-2xs">
                <Globe className="h-3 w-3 text-emerald-400" />
                {domain}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Multi-engine visibility curve, real-time citation frequency, and algorithmic sentiment trajectory.
          </p>
        </div>

        {/* Timeframe & Metric Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Slider */}
          <div className="inline-flex items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200/70 text-xs font-semibold shadow-inner">
            {(['7d', '30d', '90d'] as const).map((t) => {
              const active = timeframe === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTimeframe(t)}
                  className={`relative px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs ${
                    active ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeTimeframePill"
                      className="absolute inset-0 rounded-lg bg-white shadow-xs"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">
                    {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : '90 Days'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Metric Mode Filter Tabs */}
          <div className="inline-flex items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200/70 text-xs shadow-inner">
            {[
              { id: 'visibility', label: 'Visibility Score', dot: 'bg-emerald-500' },
              { id: 'citations', label: 'Citations', dot: 'bg-cyan-500' },
              { id: 'sentiment', label: 'Sentiment', dot: 'bg-indigo-500' },
              { id: 'competitor', label: 'vs Rivals', dot: 'bg-amber-500' },
              { id: 'all', label: 'All Curves', dot: 'bg-slate-400' },
            ].map((m) => {
              const active = activeMetric === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveMetric(m.id as MetricMode)}
                  className={`relative px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5 ${
                    active ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="activeMetricPill"
                      className="absolute inset-0 rounded-lg bg-white shadow-xs"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <span className={`relative z-10 h-2 w-2 rounded-full ${m.dot}`} />
                  <span className="relative z-10 hidden sm:inline">{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4 Interactive KPI Micro-Cards with Sparklines */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Latest Score */}
        <div
          onClick={() => setActiveMetric('visibility')}
          className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
            activeMetric === 'visibility'
              ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-200/40 shadow-xs'
              : 'bg-slate-50/70 border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-700 transition-colors">
              Latest AEO Score
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-2xl font-black tracking-tight text-slate-900 tabular-nums">
              {activePoint ? activePoint.d.visibility : currentScore}
              <span className="text-sm font-bold text-slate-400">/100</span>
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {activePoint?.d.deltaText || '+8.4%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">7-day benchmark velocity</p>
        </div>

        {/* Metric 2: AI Citations */}
        <div
          onClick={() => setActiveMetric('citations')}
          className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
            activeMetric === 'citations'
              ? 'bg-cyan-50/60 border-cyan-300 ring-2 ring-cyan-200/40 shadow-xs'
              : 'bg-slate-50/70 border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-cyan-700 transition-colors">
              Citations Captured
            </span>
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-2xl font-black tracking-tight text-cyan-900 tabular-nums">
              {activePoint ? activePoint.d.citations : 48}
            </span>
            <span className="text-xs font-semibold text-cyan-600">+12 this wk</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Verified hyperlinks in answers</p>
        </div>

        {/* Metric 3: AI Sentiment */}
        <div
          onClick={() => setActiveMetric('sentiment')}
          className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
            activeMetric === 'sentiment'
              ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-200/40 shadow-xs'
              : 'bg-slate-50/70 border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-700 transition-colors">
              AI Sentiment Tone
            </span>
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-2xl font-black tracking-tight text-indigo-900 tabular-nums">
              {activePoint ? activePoint.d.sentiment : 93}%
            </span>
            <span className="text-xs font-semibold text-indigo-600">Favorable</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Natural language brand polarity</p>
        </div>

        {/* Metric 4: Top Engine & Competitor Benchmark */}
        <div
          onClick={() => setActiveMetric('competitor')}
          className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
            activeMetric === 'competitor'
              ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-200/40 shadow-xs'
              : 'bg-slate-50/70 border-slate-200/70 hover:bg-white hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-700 transition-colors">
              Top Engine / Rivals
            </span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 truncate">
              {activePoint ? activePoint.d.topEngine : 'Perplexity Pro'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            vs Rivals:{' '}
            <strong className="text-amber-700">
              +{activePoint ? activePoint.d.visibility - activePoint.d.competitorAvg : 8} pts lead
            </strong>
          </p>
        </div>
      </div>

      {/* Main Interactive Canvas & Glowing Spline Curve */}
      <div
        ref={containerRef}
        className="relative z-10 w-full overflow-hidden select-none bg-radial from-slate-50/90 via-white to-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-inner"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Dynamic Floating Glassmorphic Tooltip */}
        <AnimatePresence>
          {hoveredIdx !== null && activePoint && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                left: `${Math.min(84, Math.max(16, tooltipXPercent))}%`,
              }}
              className="pointer-events-none absolute top-4 -translate-x-1/2 z-30 min-w-[210px] rounded-2xl border border-slate-800/10 bg-slate-900/95 p-3.5 text-white shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-200">{activePoint.d.displayDate}</span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  {activePoint.d.deltaText}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    AEO Score:
                  </span>
                  <span className="font-bold font-mono text-emerald-300">
                    {activePoint.d.visibility}/100
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    Citations:
                  </span>
                  <span className="font-bold font-mono text-cyan-300">{activePoint.d.citations}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" />
                    Sentiment:
                  </span>
                  <span className="font-bold font-mono text-indigo-300">{activePoint.d.sentiment}%</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400">Top Engine:</span>
                  <span className="font-semibold text-slate-300">{activePoint.d.topEngine}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-52 sm:h-64 overflow-visible"
        >
          <defs>
            {/* Emerald Area Gradient */}
            <linearGradient id="glowVisArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Cyan Citations Area Gradient */}
            <linearGradient id="glowCitArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>

            {/* Strokes Gradients */}
            <linearGradient id="visStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            <linearGradient id="citStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>

            <linearGradient id="sentStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>

            {/* Ambient Line Drop Shadow */}
            <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#10b981" floodOpacity="0.35" />
            </filter>
            <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#06b6d4" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((level) => {
            const y = svgHeight - paddingY - (level / 100) * (svgHeight - paddingY * 2);
            return (
              <g key={level}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={level === 0 ? '' : '4 4'}
                  strokeOpacity={level === 0 ? 0.9 : 0.6}
                />
                <text
                  x={paddingX - 12}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-mono font-semibold"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* Competitor Benchmark Curve (Amber dashed) */}
          {(activeMetric === 'competitor' || activeMetric === 'all') && compPath && (
            <motion.path
              d={compPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeDasharray="5 5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          )}

          {/* Citations Curve (Cyan) */}
          {(activeMetric === 'citations' || activeMetric === 'all') && (
            <>
              <motion.path
                d={citPath}
                fill="none"
                stroke="url(#citStroke)"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#cyanGlow)"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
              />
            </>
          )}

          {/* Sentiment Curve (Electric Indigo) */}
          {(activeMetric === 'sentiment' || activeMetric === 'all') && sentPath && (
            <motion.path
              d={sentPath}
              fill="none"
              stroke="url(#sentStroke)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          )}

          {/* Visibility Area Fill & Spline (Emerald) */}
          {(activeMetric === 'visibility' || activeMetric === 'all') && visArea && (
            <motion.path
              d={visArea}
              fill="url(#glowVisArea)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
          )}

          {(activeMetric === 'visibility' || activeMetric === 'all') && visPath && (
            <motion.path
              d={visPath}
              fill="none"
              stroke="url(#visStroke)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#emeraldGlow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          )}

          {/* Interactive Crosshair & Cursor Guides */}
          {points.map((pt, i) => {
            const isHovered = hoveredIdx === i || (hoveredIdx === null && i === points.length - 1);
            return (
              <g
                key={pt.d.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
              >
                {/* Vertical Guide Line */}
                {isHovered && (
                  <motion.line
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    x1={pt.x}
                    y1={paddingY}
                    x2={pt.x}
                    y2={svgHeight - paddingY}
                    stroke="#0f172a"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="opacity-40"
                  />
                )}

                {/* Visibility Dot */}
                {(activeMetric === 'visibility' || activeMetric === 'all') && (
                  <circle
                    cx={pt.x}
                    cy={pt.yVis}
                    r={isHovered ? 6 : 4}
                    className="fill-emerald-500 stroke-white stroke-2 transition-all duration-150"
                    style={{
                      filter: isHovered
                        ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))'
                        : 'drop-shadow(0 0 2px rgba(16, 185, 129, 0.3))',
                    }}
                  />
                )}

                {/* Citations Dot */}
                {(activeMetric === 'citations' || activeMetric === 'all') && (
                  <circle
                    cx={pt.x}
                    cy={pt.yCit}
                    r={isHovered ? 5.5 : 3.5}
                    className="fill-cyan-500 stroke-white stroke-2 transition-all duration-150"
                    style={{
                      filter: isHovered
                        ? 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.8))'
                        : 'none',
                    }}
                  />
                )}

                {/* Sentiment Dot */}
                {(activeMetric === 'sentiment' || activeMetric === 'all') && (
                  <circle
                    cx={pt.x}
                    cy={pt.ySent}
                    r={isHovered ? 5 : 3}
                    className="fill-indigo-500 stroke-white stroke-2 transition-all duration-150"
                  />
                )}

                {/* X-Axis Date Labels */}
                <text
                  x={pt.x}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  className={`text-[11px] font-mono transition-colors ${
                    isHovered
                      ? 'fill-slate-950 font-bold'
                      : 'fill-slate-400 font-medium'
                  }`}
                >
                  {pt.d.displayDate}
                </text>

                {/* Hotspot bounding box */}
                <rect
                  x={pt.x - (svgWidth / (points.length * 2))}
                  y={paddingY}
                  width={svgWidth / points.length}
                  height={svgHeight - paddingY * 2}
                  fill="transparent"
                />
              </g>
            );
          })}
        </svg>

        {/* Legend & Telemetry Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-6 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 shadow-2xs inline-block" />
              <span className="font-semibold text-slate-700">AEO Visibility (0-100)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-6 rounded-full bg-cyan-500 inline-block" />
              <span className="font-semibold text-slate-700">AI Citations Captured</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-6 border-b-2 border-dashed border-indigo-500 inline-block" />
              <span className="font-semibold text-slate-700">Sentiment Polarity (%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-6 border-b-2 border-dashed border-amber-500 inline-block" />
              <span className="font-semibold text-slate-700">Competitor Benchmark</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Hover points for micro-snapshot analysis</span>
          </div>
        </div>
      </div>
    </section>
  );
}
