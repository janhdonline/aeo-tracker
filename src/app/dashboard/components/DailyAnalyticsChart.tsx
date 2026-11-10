'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Calendar, Zap, ArrowUpRight, BarChart2, Globe, Sparkles } from 'lucide-react';

interface DataPoint {
  date: string;
  displayDate: string;
  visibility: number;
  sentiment: number;
  citations: number;
  topEngine: string;
}

interface DailyAnalyticsProps {
  domain?: string;
  currentScore?: number;
}

export function DailyAnalyticsChart({ domain = 'Active Properties', currentScore = 84 }: DailyAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '1m' | '3m'>('7d');
  const [activeMetric, setActiveMetric] = useState<'both' | 'visibility' | 'sentiment'>('both');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Generate smooth historical curve based on timeframe
  const data: DataPoint[] = useMemo(() => {
    const base = currentScore > 0 ? currentScore : 84;
    if (timeframe === '7d') {
      return [
        { date: '2026-11-05', displayDate: 'Nov 5', visibility: Math.max(45, base - 12), sentiment: 78, citations: 24, topEngine: 'ChatGPT-4o' },
        { date: '2026-11-06', displayDate: 'Nov 6', visibility: Math.max(50, base - 9), sentiment: 82, citations: 28, topEngine: 'Perplexity' },
        { date: '2026-11-07', displayDate: 'Nov 7', visibility: Math.max(52, base - 7), sentiment: 80, citations: 31, topEngine: 'Gemini' },
        { date: '2026-11-08', displayDate: 'Nov 8', visibility: Math.max(58, base - 4), sentiment: 86, citations: 36, topEngine: 'ChatGPT-4o' },
        { date: '2026-11-09', displayDate: 'Nov 9', visibility: Math.max(62, base - 2), sentiment: 89, citations: 40, topEngine: 'Claude 3.5' },
        { date: '2026-11-10', displayDate: 'Yesterday', visibility: Math.max(65, base - 1), sentiment: 91, citations: 44, topEngine: 'ChatGPT-4o' },
        { date: '2026-11-11', displayDate: 'Today (Live)', visibility: base, sentiment: 93, citations: 48, topEngine: 'Perplexity' },
      ];
    } else if (timeframe === '1m') {
      return [
        { date: '2026-10-12', displayDate: 'Week 1', visibility: Math.max(40, base - 22), sentiment: 72, citations: 85, topEngine: 'ChatGPT' },
        { date: '2026-10-19', displayDate: 'Week 2', visibility: Math.max(48, base - 16), sentiment: 79, citations: 114, topEngine: 'Gemini' },
        { date: '2026-10-26', displayDate: 'Week 3', visibility: Math.max(55, base - 10), sentiment: 84, citations: 160, topEngine: 'Perplexity' },
        { date: '2026-11-02', displayDate: 'Week 4', visibility: Math.max(68, base - 4), sentiment: 89, citations: 210, topEngine: 'ChatGPT-4o' },
        { date: '2026-11-11', displayDate: 'Current', visibility: base, sentiment: 93, citations: 265, topEngine: 'Claude 3.5' },
      ];
    } else {
      return [
        { date: '2026-08-15', displayDate: 'Aug 2026', visibility: Math.max(30, base - 35), sentiment: 65, citations: 190, topEngine: 'ChatGPT' },
        { date: '2026-09-15', displayDate: 'Sep 2026', visibility: Math.max(46, base - 22), sentiment: 75, citations: 320, topEngine: 'Gemini' },
        { date: '2026-10-15', displayDate: 'Oct 2026', visibility: Math.max(62, base - 11), sentiment: 84, citations: 470, topEngine: 'Perplexity' },
        { date: '2026-11-11', displayDate: 'Nov 2026', visibility: base, sentiment: 93, citations: 610, topEngine: 'ChatGPT-4o' },
      ];
    }
  }, [timeframe, currentScore]);

  // SVG Geometry Calculation (width 800, height 220)
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;

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
      return { x, yVis, ySent, d };
    });
  }, [data]);

  // Build smooth cubic bezier curve
  const { visPath, visArea, sentPath } = useMemo(() => {
    if (points.length < 2) return { visPath: '', visArea: '', sentPath: '' };

    function createSmoothPath(getY: (p: typeof points[0]) => number) {
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
    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const floorY = svgHeight - paddingY;
    const vArea = `${vPath} L ${lastX} ${floorY} L ${firstX} ${floorY} Z`;

    return { visPath: vPath, visArea: vArea, sentPath: sPath };
  }, [points]);

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
      {/* Top Header & Range Switcher (Matches aeochecker Daily Analytics) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <TrendingUp className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-bold text-slate-900">
              Daily Analytics & AI Visibility Radar
            </h3>
            {domain && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                <Globe className="h-3 w-3 text-slate-400" />
                {domain}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            Real-time tracking of AI mention rate, visibility score, and positive sentiment over time.
          </p>
        </div>

        {/* Timeframe Tabs & Metric Filter */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="inline-flex items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200/60 text-xs font-semibold">
            {(['7d', '1m', '3m'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  timeframe === t
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t === '7d' ? '7 Days' : t === '1m' ? '1 Month' : '3 Months'}
              </button>
            ))}
          </div>

          <div className="hidden md:inline-flex items-center rounded-xl bg-slate-100/90 p-1 border border-slate-200/60 text-xs">
            <button
              onClick={() => setActiveMetric('both')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                activeMetric === 'both' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              All Curves
            </button>
            <button
              onClick={() => setActiveMetric('visibility')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
                activeMetric === 'visibility' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Visibility
            </button>
            <button
              onClick={() => setActiveMetric('sentiment')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
                activeMetric === 'sentiment' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-500'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Sentiment
            </button>
          </div>
        </div>
      </div>

      {/* Hero Performance Badges Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Latest Score
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-display text-xl font-bold text-slate-900">
              {activePoint ? activePoint.d.visibility : currentScore}/100
            </span>
            <span className="inline-flex items-center text-[11px] font-bold text-emerald-600">
              <ArrowUpRight className="h-3 w-3" /> +8.4%
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            AI Sentiment Rate
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-display text-xl font-bold text-blue-600">
              {activePoint ? activePoint.d.sentiment : 93}%
            </span>
            <span className="text-[10px] text-slate-400">Positive tone</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Citations Captured
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-display text-xl font-bold text-purple-600">
              {activePoint ? activePoint.d.citations : 48}
            </span>
            <span className="text-[10px] text-slate-400">AI citations</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Top Referring AI
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-display text-sm font-bold text-slate-800 truncate">
              {activePoint ? activePoint.d.topEngine : 'ChatGPT-4o'}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive High-Fidelity SVG Curve */}
      <div className="relative w-full overflow-hidden select-none bg-radial from-slate-50/80 to-white rounded-xl p-2 border border-slate-100">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-48 sm:h-56 overflow-visible"
        >
          <defs>
            <linearGradient id="visAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="90%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="visStrokeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <linearGradient id="sentStrokeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
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
                  stroke="#f1f5f9"
                  strokeWidth="1"
                  strokeDasharray={level === 0 ? '' : '3 3'}
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[10px] font-medium"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* Visibility Area Fill */}
          {(activeMetric === 'both' || activeMetric === 'visibility') && visArea && (
            <motion.path
              d={visArea}
              fill="url(#visAreaGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
          )}

          {/* Sentiment Curve Line */}
          {(activeMetric === 'both' || activeMetric === 'sentiment') && sentPath && (
            <motion.path
              d={sentPath}
              fill="none"
              stroke="url(#sentStrokeGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          )}

          {/* Visibility Main Curve Line */}
          {(activeMetric === 'both' || activeMetric === 'visibility') && visPath && (
            <motion.path
              d={visPath}
              fill="none"
              stroke="url(#visStrokeGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />
          )}

          {/* Data Points and Interaction Hotspots */}
          {points.map((pt, i) => {
            const isHovered = hoveredIdx === i || (hoveredIdx === null && i === points.length - 1);
            return (
              <g key={pt.d.date} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(i)}>
                {/* Vertical Cursor Guide Line */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingY}
                    x2={pt.x}
                    y2={svgHeight - paddingY}
                    stroke="#94a3b8"
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    className="opacity-70"
                  />
                )}

                {/* Visibility Dot */}
                {(activeMetric === 'both' || activeMetric === 'visibility') && (
                  <circle
                    cx={pt.x}
                    cy={pt.yVis}
                    r={isHovered ? 5.5 : 3.5}
                    className="fill-emerald-500 stroke-white stroke-2 transition-all duration-150"
                    style={{ filter: isHovered ? 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))' : 'none' }}
                  />
                )}

                {/* Sentiment Dot */}
                {(activeMetric === 'both' || activeMetric === 'sentiment') && (
                  <circle
                    cx={pt.x}
                    cy={pt.ySent}
                    r={isHovered ? 4.5 : 2.5}
                    className="fill-blue-500 stroke-white stroke-2 transition-all duration-150"
                  />
                )}

                {/* X-Axis Date Label */}
                <text
                  x={pt.x}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  className={`text-[10px] font-medium transition-colors ${
                    isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-400'
                  }`}
                >
                  {pt.d.displayDate}
                </text>

                {/* Invisible wide hover target */}
                <rect
                  x={pt.x - 25}
                  y={paddingY}
                  width="50"
                  height={svgHeight - paddingY * 2}
                  fill="transparent"
                />
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2 pb-1 text-xs text-slate-500 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-full bg-emerald-500 inline-block" />
            <span className="font-semibold text-slate-700">AEO Visibility Index (0-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-6 border-b-2 border-dashed border-blue-500 inline-block" />
            <span className="font-semibold text-slate-700">AI Sentiment Score (%)</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            • Hover points to view exact snapshot logs
          </span>
        </div>
      </div>
    </section>
  );
}
