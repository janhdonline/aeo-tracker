'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  ArrowUpRight,
  Globe,
  Sparkles,
  Bot,
  Activity,
  ShieldCheck,
  Zap,
  Radio,
  Layers,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export interface DataPoint {
  date: string;
  displayDate: string;
  timeLabel: string;
  visibility: number;
  sentiment: number;
  citations: number;
  competitorAvg: number;
  topEngine: string;
  deltaText: string;
  eventNote?: string;
  modelBreakdown: {
    chatgpt: number;
    perplexity: number;
    claude: number;
    gemini: number;
  };
}

interface DailyAnalyticsProps {
  domain?: string;
  currentScore?: number;
  onDomainChange?: (domain: string) => void;
}

type MetricMode = 'visibility' | 'citations' | 'sentiment' | 'competitor' | 'all';

export function DailyAnalyticsChart({
  domain = 'notion.so',
  currentScore = 84,
}: DailyAnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
  const [activeMetric, setActiveMetric] = useState<MetricMode>('visibility');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isSimulatingProbe, setIsSimulatingProbe] = useState(false);
  const [probeCount, setProbeCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic realistic fluctuating wave data (peaks, dips, momentum, high frequency cadence)
  const data: DataPoint[] = useMemo(() => {
    const base = currentScore > 0 ? currentScore : 84;
    const boost = probeCount * 0.4;

    if (timeframe === '7d') {
      // 14 intraday high-frequency radar points (Morning + Evening probes) creating authentic undulating waves (ঢেউমালা)
      return [
        {
          date: '2026-11-05T09:00:00Z',
          displayDate: 'Nov 5 AM',
          timeLabel: '09:00 UTC',
          visibility: Math.max(50, base - 16), // 68
          sentiment: 76,
          citations: 26,
          competitorAvg: 67,
          topEngine: 'ChatGPT-4o',
          deltaText: '-2.4%',
          eventNote: 'Weekly crawl re-indexation',
          modelBreakdown: { chatgpt: 72, perplexity: 68, claude: 64, gemini: 66 },
        },
        {
          date: '2026-11-05T21:00:00Z',
          displayDate: 'Nov 5 PM',
          timeLabel: '21:00 UTC',
          visibility: Math.max(52, base - 13), // 71
          sentiment: 79,
          citations: 29,
          competitorAvg: 68,
          topEngine: 'Perplexity Pro',
          deltaText: '+3.1%',
          eventNote: 'Reddit discussion citation index',
          modelBreakdown: { chatgpt: 74, perplexity: 73, claude: 67, gemini: 69 },
        },
        {
          date: '2026-11-06T09:00:00Z',
          displayDate: 'Nov 6 AM',
          timeLabel: '09:00 UTC',
          visibility: Math.max(55, base - 9), // 75
          sentiment: 82,
          citations: 34,
          competitorAvg: 69,
          topEngine: 'Perplexity Pro',
          deltaText: '+5.8%',
          eventNote: 'Organization schema entity linked',
          modelBreakdown: { chatgpt: 76, perplexity: 82, claude: 70, gemini: 72 },
        },
        {
          date: '2026-11-06T21:00:00Z',
          displayDate: 'Nov 6 PM',
          timeLabel: '21:00 UTC',
          visibility: Math.max(53, base - 11), // 73
          sentiment: 81,
          citations: 32,
          competitorAvg: 69,
          topEngine: 'Claude 3.5',
          deltaText: '-1.4%',
          eventNote: 'Nightly latency verification',
          modelBreakdown: { chatgpt: 75, perplexity: 79, claude: 71, gemini: 70 },
        },
        {
          date: '2026-11-07T09:00:00Z',
          displayDate: 'Nov 7 AM',
          timeLabel: '09:00 UTC',
          visibility: Math.max(50, base - 15), // 69
          sentiment: 78,
          citations: 30,
          competitorAvg: 68,
          topEngine: 'Gemini',
          deltaText: '-4.1%',
          eventNote: 'Competitor comparison page query spike',
          modelBreakdown: { chatgpt: 71, perplexity: 74, claude: 65, gemini: 76 },
        },
        {
          date: '2026-11-07T21:00:00Z',
          displayDate: 'Nov 7 PM',
          timeLabel: '21:00 UTC',
          visibility: Math.max(54, base - 10), // 74
          sentiment: 83,
          citations: 35,
          competitorAvg: 70,
          topEngine: 'ChatGPT-4o',
          deltaText: '+4.5%',
          eventNote: 'SearchGPT commercial snippet cite',
          modelBreakdown: { chatgpt: 79, perplexity: 78, claude: 72, gemini: 71 },
        },
        {
          date: '2026-11-08T09:00:00Z',
          displayDate: 'Nov 8 AM',
          timeLabel: '09:00 UTC',
          visibility: Math.max(58, base - 6), // 78
          sentiment: 87,
          citations: 40,
          competitorAvg: 71,
          topEngine: 'ChatGPT-4o',
          deltaText: '+8.2%',
          eventNote: '45-word definition snippet captured',
          modelBreakdown: { chatgpt: 84, perplexity: 82, claude: 76, gemini: 77 },
        },
        {
          date: '2026-11-08T21:00:00Z',
          displayDate: 'Nov 8 PM',
          timeLabel: '21:00 UTC',
          visibility: Math.max(56, base - 8), // 76
          sentiment: 85,
          citations: 38,
          competitorAvg: 71,
          topEngine: 'Claude 3.5',
          deltaText: '-1.8%',
          eventNote: 'Model temperature oscillation',
          modelBreakdown: { chatgpt: 81, perplexity: 80, claude: 78, gemini: 75 },
        },
        {
          date: '2026-11-09T09:00:00Z',
          displayDate: 'Nov 9 AM',
          timeLabel: '09:00 UTC',
          visibility: Math.max(54, base - 10), // 74
          sentiment: 84,
          citations: 37,
          competitorAvg: 72,
          topEngine: 'Perplexity Pro',
          deltaText: '-2.6%',
          eventNote: 'Weekend search pattern shift',
          modelBreakdown: { chatgpt: 78, perplexity: 83, claude: 75, gemini: 73 },
        },
        {
          date: '2026-11-09T21:00:00Z',
          displayDate: 'Nov 9 PM',
          timeLabel: '21:00 UTC',
          visibility: Math.max(57, base - 7), // 77
          sentiment: 88,
          citations: 41,
          competitorAvg: 73,
          topEngine: 'ChatGPT-4o',
          deltaText: '+3.9%',
          eventNote: 'llms.txt raw documentation cached',
          modelBreakdown: { chatgpt: 83, perplexity: 84, claude: 77, gemini: 76 },
        },
        {
          date: '2026-11-10T09:00:00Z',
          displayDate: 'Yesterday AM',
          timeLabel: '09:00 UTC',
          visibility: Math.max(61, base - 4), // 80
          sentiment: 90,
          citations: 44,
          competitorAvg: 74,
          topEngine: 'Perplexity Pro',
          deltaText: '+6.5%',
          eventNote: 'Multi-agent deep research citation',
          modelBreakdown: { chatgpt: 85, perplexity: 89, claude: 80, gemini: 79 },
        },
        {
          date: '2026-11-10T21:00:00Z',
          displayDate: 'Yesterday PM',
          timeLabel: '21:00 UTC',
          visibility: Math.max(63, base - 2), // 82
          sentiment: 91,
          citations: 46,
          competitorAvg: 74,
          topEngine: 'ChatGPT-4o',
          deltaText: '+7.8%',
          eventNote: 'SoftwareApplication schema validated',
          modelBreakdown: { chatgpt: 88, perplexity: 89, claude: 81, gemini: 82 },
        },
        {
          date: '2026-11-11T09:00:00Z',
          displayDate: 'Today AM',
          timeLabel: '09:00 UTC',
          visibility: Math.min(100, Math.round(base - 1 + boost)), // 83
          sentiment: 92,
          citations: 47 + probeCount,
          competitorAvg: 75,
          topEngine: 'Perplexity Pro',
          deltaText: '+8.1%',
          eventNote: 'Live buyer intent radar peak',
          modelBreakdown: { chatgpt: 89, perplexity: 93, claude: 84, gemini: 83 },
        },
        {
          date: '2026-11-11T12:00:00Z',
          displayDate: 'Today (Live)',
          timeLabel: 'Live Now',
          visibility: Math.min(100, Math.round(base + boost)), // 84
          sentiment: 93,
          citations: 48 + probeCount,
          competitorAvg: 76,
          topEngine: 'Perplexity Pro',
          deltaText: '+8.4%',
          eventNote: 'All 6 Frontier Answer Engines Synced',
          modelBreakdown: { chatgpt: 91, perplexity: 95, claude: 86, gemini: 84 },
        },
      ];
    } else if (timeframe === '30d') {
      return [
        {
          date: '2026-10-12',
          displayDate: 'Oct 12',
          timeLabel: 'Week 1',
          visibility: Math.max(40, base - 26),
          sentiment: 71,
          citations: 18,
          competitorAvg: 62,
          topEngine: 'ChatGPT',
          deltaText: '+1.2%',
          eventNote: 'Baseline audit initialization',
          modelBreakdown: { chatgpt: 68, perplexity: 62, claude: 59, gemini: 60 },
        },
        {
          date: '2026-10-16',
          displayDate: 'Oct 16',
          timeLabel: 'Mid W1',
          visibility: Math.max(45, base - 21),
          sentiment: 74,
          citations: 22,
          competitorAvg: 63,
          topEngine: 'Gemini',
          deltaText: '+4.5%',
          eventNote: 'FAQ schema deployed',
          modelBreakdown: { chatgpt: 70, perplexity: 66, claude: 62, gemini: 69 },
        },
        {
          date: '2026-10-19',
          displayDate: 'Oct 19',
          timeLabel: 'Week 2',
          visibility: Math.max(48, base - 18),
          sentiment: 78,
          citations: 26,
          competitorAvg: 65,
          topEngine: 'Gemini',
          deltaText: '+6.4%',
          eventNote: 'AI Crawler allow in robots.txt',
          modelBreakdown: { chatgpt: 73, perplexity: 71, claude: 66, gemini: 74 },
        },
        {
          date: '2026-10-23',
          displayDate: 'Oct 23',
          timeLabel: 'Mid W2',
          visibility: Math.max(43, base - 23),
          sentiment: 75,
          citations: 21,
          competitorAvg: 66,
          topEngine: 'ChatGPT-4o',
          deltaText: '-2.8%',
          eventNote: 'Claude model weights refresh',
          modelBreakdown: { chatgpt: 72, perplexity: 68, claude: 61, gemini: 70 },
        },
        {
          date: '2026-10-26',
          displayDate: 'Oct 26',
          timeLabel: 'Week 3',
          visibility: Math.max(51, base - 15),
          sentiment: 79,
          citations: 28,
          competitorAvg: 67,
          topEngine: 'Perplexity',
          deltaText: '+3.5%',
          eventNote: 'Wikipedia sameAs entity mapped',
          modelBreakdown: { chatgpt: 75, perplexity: 79, claude: 70, gemini: 72 },
        },
        {
          date: '2026-10-30',
          displayDate: 'Oct 30',
          timeLabel: 'Late Oct',
          visibility: Math.max(56, base - 10),
          sentiment: 83,
          citations: 34,
          competitorAvg: 69,
          topEngine: 'Claude 3.5',
          deltaText: '+7.1%',
          eventNote: 'Product SKU hierarchy indexed',
          modelBreakdown: { chatgpt: 80, perplexity: 82, claude: 78, gemini: 75 },
        },
        {
          date: '2026-11-02',
          displayDate: 'Nov 2',
          timeLabel: 'Week 4',
          visibility: Math.max(58, base - 9),
          sentiment: 86,
          citations: 39,
          competitorAvg: 71,
          topEngine: 'ChatGPT-4o',
          deltaText: '+9.1%',
          eventNote: '40-60 word answerability rewrite',
          modelBreakdown: { chatgpt: 86, perplexity: 85, claude: 80, gemini: 78 },
        },
        {
          date: '2026-11-06',
          displayDate: 'Nov 6',
          timeLabel: 'Mid W4',
          visibility: Math.max(63, base - 5),
          sentiment: 89,
          citations: 43,
          competitorAvg: 73,
          topEngine: 'Perplexity Pro',
          deltaText: '+5.4%',
          eventNote: 'Direct link citation share 52%',
          modelBreakdown: { chatgpt: 87, perplexity: 91, claude: 82, gemini: 80 },
        },
        {
          date: '2026-11-09',
          displayDate: 'Nov 9',
          timeLabel: 'Late Nov',
          visibility: Math.max(60, base - 8),
          sentiment: 87,
          citations: 41,
          competitorAvg: 74,
          topEngine: 'Claude 3.5',
          deltaText: '-1.8%',
          eventNote: 'Competitor marketing campaign',
          modelBreakdown: { chatgpt: 84, perplexity: 88, claude: 81, gemini: 79 },
        },
        {
          date: '2026-11-11',
          displayDate: 'Live Radar',
          timeLabel: 'Current',
          visibility: Math.min(100, Math.round(base + boost)),
          sentiment: 93,
          citations: 48 + probeCount,
          competitorAvg: 76,
          topEngine: 'Perplexity Pro',
          deltaText: '+8.4%',
          eventNote: 'Category leadership established',
          modelBreakdown: { chatgpt: 91, perplexity: 95, claude: 86, gemini: 84 },
        },
      ];
    } else {
      // 90 Days multi-month macro wave
      return [
        {
          date: '2026-08-15',
          displayDate: 'Aug 15',
          timeLabel: 'Mid Aug',
          visibility: Math.max(30, base - 42),
          sentiment: 62,
          citations: 12,
          competitorAvg: 58,
          topEngine: 'ChatGPT',
          deltaText: '+0.5%',
          eventNote: 'Initial radar deployment',
          modelBreakdown: { chatgpt: 58, perplexity: 52, claude: 48, gemini: 50 },
        },
        {
          date: '2026-09-01',
          displayDate: 'Sep 1',
          timeLabel: 'Early Sep',
          visibility: Math.max(40, base - 28),
          sentiment: 72,
          citations: 22,
          competitorAvg: 61,
          topEngine: 'Gemini',
          deltaText: '+6.2%',
          eventNote: 'Domain entity verification',
          modelBreakdown: { chatgpt: 68, perplexity: 65, claude: 60, gemini: 71 },
        },
        {
          date: '2026-09-15',
          displayDate: 'Sep 15',
          timeLabel: 'Mid Sep',
          visibility: Math.max(36, base - 33),
          sentiment: 69,
          citations: 19,
          competitorAvg: 63,
          topEngine: 'Perplexity',
          deltaText: '-3.1%',
          eventNote: 'Google AI Overview rollout',
          modelBreakdown: { chatgpt: 66, perplexity: 69, claude: 58, gemini: 64 },
        },
        {
          date: '2026-10-01',
          displayDate: 'Oct 1',
          timeLabel: 'Early Oct',
          visibility: Math.max(48, base - 19),
          sentiment: 77,
          citations: 28,
          competitorAvg: 66,
          topEngine: 'ChatGPT-4o',
          deltaText: '+8.8%',
          eventNote: 'SearchGPT alpha release',
          modelBreakdown: { chatgpt: 76, perplexity: 73, claude: 67, gemini: 69 },
        },
        {
          date: '2026-10-15',
          displayDate: 'Oct 15',
          timeLabel: 'Mid Oct',
          visibility: Math.max(56, base - 12),
          sentiment: 82,
          citations: 36,
          competitorAvg: 69,
          topEngine: 'Claude 3.5',
          deltaText: '+11.4%',
          eventNote: 'Answerability optimization',
          modelBreakdown: { chatgpt: 81, perplexity: 82, claude: 79, gemini: 76 },
        },
        {
          date: '2026-11-01',
          displayDate: 'Nov 1',
          timeLabel: 'Early Nov',
          visibility: Math.max(54, base - 15),
          sentiment: 81,
          citations: 34,
          competitorAvg: 72,
          topEngine: 'ChatGPT-4o',
          deltaText: '-2.4%',
          eventNote: 'Competitor counter-campaign',
          modelBreakdown: { chatgpt: 79, perplexity: 80, claude: 74, gemini: 73 },
        },
        {
          date: '2026-11-11',
          displayDate: 'Current',
          timeLabel: 'Live Sync',
          visibility: Math.min(100, Math.round(base + boost)),
          sentiment: 93,
          citations: 48 + probeCount,
          competitorAvg: 76,
          topEngine: 'Perplexity Pro',
          deltaText: '+18.4%',
          eventNote: 'Record AEO share of voice',
          modelBreakdown: { chatgpt: 91, perplexity: 95, claude: 86, gemini: 84 },
        },
      ];
    }
  }, [timeframe, currentScore, probeCount]);

  // Wide SVG Dimensions: 1200 x 360 for high-amplitude dramatic wave (ঢেউমালা)
  const svgWidth = 1200;
  const svgHeight = 360;
  const paddingX = 0; // Pure 0px horizontal padding for TRUE full-bleed edge-to-edge span!
  const paddingTop = 42;
  const paddingBottom = 48;

  // Adaptive Altitude Scaling: Hugs data variance tightly so wave utilizes 70% of canvas height (প্রকৃত ঢেউমালা)
  const { minBound, maxBound } = useMemo(() => {
    const allVis = data.map((d) => d.visibility);
    const minVal = Math.min(...allVis);
    const maxVal = Math.max(...allVis);
    // Dynamic breathing room of 6 points above and below creates generous wave oscillation
    const lower = Math.max(0, Math.floor(minVal - 6));
    const upper = Math.min(100, Math.ceil(maxVal + 6));
    return { minBound: lower, maxBound: upper };
  }, [data]);

  // Transform coordinates
  const points = useMemo(() => {
    const usableWidth = svgWidth - paddingX * 2;
    const usableHeight = svgHeight - paddingTop - paddingBottom;
    const count = data.length;
    const range = Math.max(8, maxBound - minBound);

    return data.map((d, i) => {
      const x = paddingX + (i / (count - 1)) * usableWidth;

      // Visibility dynamic altitude ratio
      const visRatio = Math.max(0, Math.min(1, (d.visibility - minBound) / range));
      const yVis = svgHeight - paddingBottom - visRatio * usableHeight;

      // Sentiment scaled (60 to 100)
      const sentRatio = Math.max(0, Math.min(1, (d.sentiment - 60) / 40));
      const ySent = svgHeight - paddingBottom - sentRatio * usableHeight;

      // Citations scaled
      const citRatio = Math.max(0, Math.min(1, (d.citations - 10) / 50));
      const yCit = svgHeight - paddingBottom - citRatio * usableHeight;

      // Competitor benchmark
      const compRatio = Math.max(0, Math.min(1, (d.competitorAvg - minBound) / range));
      const yComp = svgHeight - paddingBottom - compRatio * usableHeight;

      return { x, yVis, ySent, yCit, yComp, d };
    });
  }, [data, minBound, maxBound, svgWidth, svgHeight, paddingX, paddingTop, paddingBottom]);

  // High-precision smooth cubic bezier curves with natural tension (0.40)
  const { visPath, visArea, sentPath, citPath, compPath } = useMemo(() => {
    if (points.length < 2) {
      return { visPath: '', visArea: '', sentPath: '', citPath: '', compPath: '' };
    }

    function createSmoothSpline(getY: (p: (typeof points)[0]) => number) {
      let pth = `M ${points[0].x} ${getY(points[0])}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        // Control point tension factor 0.40 creates organic flowing water waves (ঢেউমালা)
        const cx1 = p0.x + (p1.x - p0.x) * 0.4;
        const cy1 = getY(p0);
        const cx2 = p0.x + (p1.x - p0.x) * 0.6;
        const cy2 = getY(p1);
        pth += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${getY(p1)}`;
      }
      return pth;
    }

    const vPath = createSmoothSpline((p) => p.yVis);
    const sPath = createSmoothSpline((p) => p.ySent);
    const cPath = createSmoothSpline((p) => p.yCit);
    const cmPath = createSmoothSpline((p) => p.yComp);

    const lastX = points[points.length - 1].x;
    const firstX = points[0].x;
    const floorY = svgHeight - paddingBottom;
    const vArea = `${vPath} L ${lastX} ${floorY} L ${firstX} ${floorY} Z`;

    return { visPath: vPath, visArea: vArea, sentPath: sPath, citPath: cPath, compPath: cmPath };
  }, [points, svgHeight, paddingBottom]);

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : points[points.length - 1];

  // Tooltip positioning percentage
  const tooltipXPercent = activePoint
    ? (activePoint.x / svgWidth) * 100
    : 95;

  // Grid steps (4 horizontal altitude bands)
  const gridSteps = useMemo(() => {
    const range = maxBound - minBound;
    const step = Math.round(range / 3);
    return [minBound, minBound + step, minBound + step * 2, maxBound];
  }, [minBound, maxBound]);

  // Simulate instant live telemetry probe
  const handleTriggerProbe = useCallback(() => {
    setIsSimulatingProbe(true);
    setTimeout(() => {
      setProbeCount((c) => c + 1);
      setIsSimulatingProbe(false);
    }, 850);
  }, []);

  return (
    <section className="relative rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6 overflow-hidden">
      {/* Background Ambient Glow (Electric Emerald + Cyan + Indigo) */}
      <div className="pointer-events-none absolute -top-36 right-1/4 h-96 w-[700px] rounded-full bg-gradient-to-br from-emerald-100/35 via-cyan-100/25 to-indigo-100/20 blur-3xl -z-0" />

      {/* Top Header & Range Controls */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white shadow-xs">
              <TrendingUp className="h-5 w-5" />
            </span>
            <h3 className="font-display text-xl font-bold text-slate-950 tracking-tight">
              AI Visibility & Citation Radar
            </h3>
            {domain && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-2xs">
                <Globe className="h-3 w-3 text-emerald-400" />
                {domain}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Multi-engine continuous visibility wave, real-time citation frequency, and algorithmic sentiment trajectory.
          </p>
        </div>

        {/* Timeframe & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Radar Trigger Button */}
          <button
            type="button"
            onClick={handleTriggerProbe}
            disabled={isSimulatingProbe}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Probe all 6 AI engines right now"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${isSimulatingProbe ? 'animate-spin' : ''}`} />
            <span>{isSimulatingProbe ? 'Probing LLMs...' : 'Trigger Radar Probe'}</span>
          </button>

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

          {/* Metric Filter Tabs */}
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

      {/* 4 Interactive KPI Micro-Cards (with Sparklines & Clickable Focus) */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Latest Score */}
        <div
          onClick={() => setActiveMetric('visibility')}
          className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
            activeMetric === 'visibility'
              ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-300/40 shadow-xs'
              : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-700 transition-colors">
              Latest AEO Score
            </span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-2xl font-black tracking-tight text-slate-950 tabular-nums">
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
              ? 'bg-cyan-50/70 border-cyan-400 ring-2 ring-cyan-300/40 shadow-xs'
              : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-cyan-700 transition-colors">
              Citations Captured
            </span>
            <span className="h-2 w-2 rounded-full bg-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-2xl font-black tracking-tight text-cyan-950 tabular-nums">
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
              ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-300/40 shadow-xs'
              : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-700 transition-colors">
              AI Sentiment Tone
            </span>
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-2xl font-black tracking-tight text-indigo-950 tabular-nums">
              {activePoint ? activePoint.d.sentiment : 93}%
            </span>
            <span className="text-xs font-semibold text-indigo-600">Favorable</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Natural language brand polarity</p>
        </div>

        {/* Metric 4: Top Engine / Competitor Lead */}
        <div
          onClick={() => setActiveMetric('competitor')}
          className={`group p-4 rounded-2xl border transition-all cursor-pointer ${
            activeMetric === 'competitor'
              ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-300/40 shadow-xs'
              : 'bg-slate-50/70 border-slate-200/80 hover:bg-white hover:border-slate-300 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-700 transition-colors">
              Top Engine / Rivals
            </span>
            <span className="h-2 w-2 rounded-full bg-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display text-lg font-bold tracking-tight text-slate-950 truncate">
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

      {/* EXPANSIVE FULL-WIDTH SEAMLESS CANVAS (ZERO INNER BOX BORDER, PURE FLOWING WAVE) */}
      <div
        ref={containerRef}
        className="relative z-10 -mx-6 sm:-mx-8 overflow-hidden select-none bg-gradient-to-b from-slate-50/60 via-white to-white pt-6 pb-2 border-t border-b border-slate-100"
        onMouseLeave={() => setHoveredIdx(null)}
      >
        {/* Dynamic Glassmorphic Floating HUD Tooltip */}
        <AnimatePresence>
          {hoveredIdx !== null && activePoint && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              style={{
                left: `${Math.min(84, Math.max(16, tooltipXPercent))}%`,
              }}
              className="pointer-events-none absolute top-4 -translate-x-1/2 z-30 min-w-[260px] rounded-2xl border border-slate-800/80 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
                <div>
                  <span className="text-xs font-bold text-slate-100 block">{activePoint.d.displayDate}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{activePoint.d.timeLabel}</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-bold text-emerald-300">
                  {activePoint.d.deltaText}
                </span>
              </div>

              {/* Core Metrics */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    AEO Visibility:
                  </span>
                  <span className="font-bold font-mono text-emerald-300">
                    {activePoint.d.visibility}/100
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    Live Citations:
                  </span>
                  <span className="font-bold font-mono text-cyan-300">{activePoint.d.citations} captured</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" />
                    AI Sentiment:
                  </span>
                  <span className="font-bold font-mono text-indigo-300">{activePoint.d.sentiment}% Favorable</span>
                </div>
              </div>

              {/* Multi-LLM Model Breakdown */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Model Citation Rate
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                  <span className="text-slate-300">ChatGPT: <strong className="text-white">{activePoint.d.modelBreakdown.chatgpt}%</strong></span>
                  <span className="text-slate-300">Perplexity: <strong className="text-cyan-300">{activePoint.d.modelBreakdown.perplexity}%</strong></span>
                  <span className="text-slate-300">Claude: <strong className="text-amber-300">{activePoint.d.modelBreakdown.claude}%</strong></span>
                  <span className="text-slate-300">Gemini: <strong className="text-blue-300">{activePoint.d.modelBreakdown.gemini}%</strong></span>
                </div>
              </div>

              {activePoint.d.eventNote && (
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 shrink-0" />
                  <span className="truncate">{activePoint.d.eventNote}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-72 sm:h-96 lg:h-[400px] overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Emerald Glowing Area Gradient with Multi-Stop Depth */}
            <linearGradient id="fluidVisAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.38" />
              <stop offset="35%" stopColor="#06b6d4" stopOpacity="0.18" />
              <stop offset="75%" stopColor="#3b82f6" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Cyan Citations Area Gradient */}
            <linearGradient id="fluidCitAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>

            {/* Vibrant Multi-Color Spline Stroke */}
            <linearGradient id="fluidVisStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="35%" stopColor="#10b981" />
              <stop offset="70%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <linearGradient id="fluidCitStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>

            <linearGradient id="fluidSentStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>

            {/* Glowing Drop Shadows */}
            <filter id="waveEmeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#10b981" floodOpacity="0.5" />
            </filter>
            <filter id="waveCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#06b6d4" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Full-Width Grid Lines & Floating Left Altitude Labels */}
          {gridSteps.map((level) => {
            const range = Math.max(8, maxBound - minBound);
            const ratio = (level - minBound) / range;
            const y = svgHeight - paddingBottom - ratio * (svgHeight - paddingTop - paddingBottom);
            return (
              <g key={level}>
                <line
                  x1={0}
                  y1={y}
                  x2={svgWidth}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                  strokeDasharray={level === minBound ? '' : '5 8'}
                  strokeOpacity={level === minBound ? 0.9 : 0.65}
                />
                <text
                  x={16}
                  y={y - 6}
                  textAnchor="start"
                  className="fill-slate-400 text-[11px] font-mono font-bold"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* Competitor Benchmark Curve (Amber dashed line) */}
          {(activeMetric === 'competitor' || activeMetric === 'all') && compPath && (
            <motion.path
              d={compPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="6 6"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.85 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          )}

          {/* Citations Curve (Cyan) */}
          {(activeMetric === 'citations' || activeMetric === 'all') && (
            <motion.path
              d={citPath}
              fill="none"
              stroke="url(#fluidCitStroke)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#waveCyanGlow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
            />
          )}

          {/* Sentiment Curve (Electric Indigo) */}
          {(activeMetric === 'sentiment' || activeMetric === 'all') && sentPath && (
            <motion.path
              d={sentPath}
              fill="none"
              stroke="url(#fluidSentStroke)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          )}

          {/* Visibility Area Fill & Spline (Emerald Wave) */}
          {(activeMetric === 'visibility' || activeMetric === 'all') && visArea && (
            <motion.path
              d={visArea}
              fill="url(#fluidVisAreaGrad)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.85 }}
            />
          )}

          {(activeMetric === 'visibility' || activeMetric === 'all') && visPath && (
            <motion.path
              id="telemetryWavePath"
              d={visPath}
              fill="none"
              stroke="url(#fluidVisStroke)"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#waveEmeraldGlow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.25, ease: [0.16, 1, 0.3, 1] }}
            />
          )}

          {/* Live Traveling Particle on Wave (Simulates Real-Time Streaming Telemetry) */}
          {(activeMetric === 'visibility' || activeMetric === 'all') && visPath && (
            <circle r={4.5} className="fill-white stroke-emerald-400 stroke-2" style={{ filter: 'drop-shadow(0 0 6px #10b981)' }}>
              <animateMotion
                path={visPath}
                dur="8s"
                repeatCount="indefinite"
                rotate="auto"
              />
            </circle>
          )}

          {/* Interactive Laser Crosshair & Hotspots */}
          {points.map((pt, i) => {
            const isLast = i === points.length - 1;
            const isHovered = hoveredIdx === i || (hoveredIdx === null && isLast);
            return (
              <g
                key={pt.d.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
              >
                {/* Vertical Laser Guide Line */}
                {isHovered && (
                  <motion.line
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    x1={pt.x}
                    y1={paddingTop}
                    x2={pt.x}
                    y2={svgHeight - paddingBottom}
                    stroke="#0f172a"
                    strokeWidth="1.6"
                    strokeDasharray="3 3"
                    className="opacity-40"
                  />
                )}

                {/* Animated Pulsing Beacon on Today (Live) point */}
                {isLast && (activeMetric === 'visibility' || activeMetric === 'all') && (
                  <>
                    <circle
                      cx={pt.x}
                      cy={pt.yVis}
                      r={18}
                      className="fill-emerald-400/20 animate-ping"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.yVis}
                      r={10}
                      className="fill-emerald-500/30 animate-pulse"
                    />
                  </>
                )}

                {/* Visibility Dot */}
                {(activeMetric === 'visibility' || activeMetric === 'all') && (
                  <circle
                    cx={pt.x}
                    cy={pt.yVis}
                    r={isHovered ? 7.5 : 5}
                    className="fill-emerald-500 stroke-white stroke-2 transition-all duration-150"
                    style={{
                      filter: isHovered
                        ? 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.95))'
                        : 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.45))',
                    }}
                  />
                )}

                {/* Citations Dot */}
                {(activeMetric === 'citations' || activeMetric === 'all') && (
                  <circle
                    cx={pt.x}
                    cy={pt.yCit}
                    r={isHovered ? 6.5 : 4}
                    className="fill-cyan-500 stroke-white stroke-2 transition-all duration-150"
                    style={{
                      filter: isHovered
                        ? 'drop-shadow(0 0 10px rgba(6, 182, 212, 0.9))'
                        : 'none',
                    }}
                  />
                )}

                {/* Sentiment Dot */}
                {(activeMetric === 'sentiment' || activeMetric === 'all') && (
                  <circle
                    cx={pt.x}
                    cy={pt.ySent}
                    r={isHovered ? 6 : 3.5}
                    className="fill-indigo-500 stroke-white stroke-2 transition-all duration-150"
                  />
                )}

                {/* X-Axis Date Labels (Thinned out for clarity) */}
                {(timeframe !== '7d' || i % 2 === 0 || isLast) && (
                  <text
                    x={pt.x}
                    y={svgHeight - 16}
                    textAnchor={i === 0 ? 'start' : isLast ? 'end' : 'middle'}
                    className={`text-[11px] font-mono tracking-tight transition-colors ${
                      isHovered
                        ? 'fill-slate-950 font-bold text-xs'
                        : 'fill-slate-400 font-medium'
                    }`}
                  >
                    {pt.d.displayDate}
                  </text>
                )}

                {/* Generous hover target bounding box */}
                <rect
                  x={pt.x - svgWidth / (points.length * 2)}
                  y={paddingTop}
                  width={svgWidth / points.length}
                  height={svgHeight - paddingTop - paddingBottom}
                  fill="transparent"
                />
              </g>
            );
          })}
        </svg>

        {/* Legend & Telemetry Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 sm:px-8 pt-3 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-6 rounded-full bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-400 shadow-2xs inline-block" />
              <span className="font-semibold text-slate-900">AEO Visibility Wave</span>
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

          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Full-width telemetry sync • Multi-LLM verified</span>
          </div>
        </div>
      </div>
    </section>
  );
}
