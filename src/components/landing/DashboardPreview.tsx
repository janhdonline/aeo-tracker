"use client";

import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  FileText,
  Globe2,
  HelpCircle,
  KeyRound,
  LayoutDashboard,
  LineChart,
  Link2,
  Lock,
  MoreHorizontal,
  MousePointerClick,
  Search,
  Settings,
  Smile,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LiveDashboardData } from "@/lib/types";
import { CircularProgress, DailyTrendsChart, ProgressBar, Sparkline } from "./Charts";

const sidebarItems: Array<{ label: string; icon: LucideIcon; active?: boolean; badge?: string }> = [
  { label: "Overview", icon: LayoutDashboard, active: true },
  { label: "Visibility", icon: LineChart },
  { label: "Prompts", icon: Sparkles, badge: "3" },
  { label: "Competitors", icon: Users },
  { label: "Citations", icon: Link2 },
  { label: "Reports", icon: FileText },
];

const fallbackDashboard: LiveDashboardData = {
  domain: "aeo-checker.com",
  score: 84,
  webPresence: 84,
  brandSentiment: 0.85,
  sentimentLabel: "Positive",
  totalQueries: 14,
  totalMentions: 32,
  mentionedQueries: 12,
  citationsCount: 96,
  promptCoverage: 82,
  promptBars: [34, 46, 42, 58, 52, 66, 73, 64, 82],
  trendLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  trends: [
    {
      label: "AEO Score",
      color: "#10B981",
      values: [58, 64, 61, 72, 70, 79, 84],
    },
    {
      label: "AI Mention Rate",
      color: "#3B82F6",
      values: [42, 45, 43, 50, 56, 55, 62],
    },
    {
      label: "Brand Sentiment",
      color: "#8B5CF6",
      values: [36, 40, 47, 45, 51, 49, 56],
    },
  ],
  lastUpdated: new Date(0).toISOString(),
};

type BrandRanking = {
  name: string;
  domain: string;
  score: number;
  change: string;
  initial: string;
  you?: boolean;
};

const competitorRankings: BrandRanking[] = [
  { name: "Semrush", domain: "semrush.com", score: 76, change: "+1.8", initial: "S" },
  { name: "Ahrefs", domain: "ahrefs.com", score: 71, change: "+0.9", initial: "A" },
  { name: "Surfer SEO", domain: "surferseo.com", score: 64, change: "-0.6", initial: "S" },
  { name: "BrightEdge", domain: "brightedge.com", score: 59, change: "+0.3", initial: "B" },
];

const trafficMetrics = [
  {
    label: "AI visits",
    value: "12,480",
    change: "+24.8%",
    icon: Globe2,
    tone: "bg-emerald-50 text-emerald-600",
    values: [24, 28, 26, 34, 32, 41, 47],
    color: "#10B981",
    positive: true,
  },
  {
    label: "Key events",
    value: "1,284",
    change: "+18.2%",
    icon: MousePointerClick,
    tone: "bg-blue-50 text-blue-600",
    values: [18, 23, 21, 28, 31, 29, 38],
    color: "#3B82F6",
    positive: true,
  },
  {
    label: "Search clicks",
    value: "34,920",
    change: "-3.1%",
    icon: Search,
    tone: "bg-violet-50 text-violet-600",
    values: [46, 44, 45, 40, 41, 37, 36],
    color: "#8B5CF6",
    positive: false,
  },
  {
    label: "Crawler hits",
    value: "8,472",
    change: "+12.6%",
    icon: Activity,
    tone: "bg-amber-50 text-amber-600",
    values: [22, 26, 25, 31, 29, 35, 39],
    color: "#F59E0B",
    positive: true,
  },
];

const sentimentTones = {
  Positive: {
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    bar: "bg-emerald-500",
    icon: "text-emerald-500",
  },
  Neutral: {
    badge: "bg-amber-50 text-amber-700 ring-amber-100",
    bar: "bg-amber-500",
    icon: "text-amber-500",
  },
  Negative: {
    badge: "bg-red-50 text-red-700 ring-red-100",
    bar: "bg-red-500",
    icon: "text-red-500",
  },
};

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(Number.isFinite(value) ? value : 0)));
}

function formatBrandName(domain: string) {
  const base = domain.split(".")[0] || domain;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function SidebarNavItem({
  label,
  icon: Icon,
  active,
  badge,
}: {
  label: string;
  icon: LucideIcon;
  active?: boolean;
  badge?: string;
}) {
  return (
    <div
      title={label}
      aria-current={active ? "page" : undefined}
      className={`group flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-[11px] font-medium transition-colors ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-gray-500 hover:bg-gray-100/80 hover:text-gray-900"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"}`} strokeWidth={1.9} />
      <span className="hidden sm:inline">{label}</span>
      {badge && (
        <span
          className={`ml-auto hidden rounded-full px-1.5 py-0.5 text-[8px] font-semibold sm:inline ${
            active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function CardHeading({
  label,
  icon: Icon,
  tone = "emerald",
}: {
  label: string;
  icon: LucideIcon;
  tone?: "emerald" | "blue" | "purple" | "gray";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-violet-50 text-violet-600",
    gray: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className={`flex h-6 w-6 items-center justify-center rounded-md ${tones[tone]}`}>
          <Icon className="h-3 w-3" strokeWidth={2.2} />
        </span>
        <span className="text-[11px] font-semibold tracking-[-0.01em] text-gray-700">{label}</span>
      </div>
      <MoreHorizontal className="h-3.5 w-3.5 text-gray-300" />
    </div>
  );
}

function TopMetricCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[166px] flex-col rounded-xl border border-gray-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(17,24,39,0.025)] ${className}`}
    >
      {children}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <motion.div
      key="dashboard-skeleton"
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Analyzing your website and loading dashboard data</span>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="min-h-[166px] animate-pulse rounded-xl border border-gray-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(17,24,39,0.025)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-md bg-gray-100" />
                <div className="h-2.5 w-20 rounded-full bg-gray-100" />
              </div>
              <div className="h-2 w-4 rounded-full bg-gray-100" />
            </div>
            <div className="mt-4 flex items-center gap-4">
              <div className="h-[84px] w-[84px] shrink-0 rounded-full border-[8px] border-gray-100" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-20 rounded-md bg-gray-100" />
                <div className="h-2 w-full rounded-full bg-gray-100" />
                <div className="h-2 w-4/5 rounded-full bg-gray-100" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(17,24,39,0.025)]">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-3 w-24 rounded-full bg-gray-100" />
              <div className="h-2 w-36 rounded-full bg-gray-100" />
            </div>
            <div className="h-2 w-32 rounded-full bg-gray-100" />
          </div>
          <div className="mt-4 h-[180px] rounded-lg bg-gradient-to-b from-gray-100/80 to-gray-50" />
          <div className="mt-3 h-2 w-52 rounded-full bg-gray-100" />
        </div>
        <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(17,24,39,0.025)]">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-3 w-28 rounded-full bg-gray-100" />
              <div className="h-2 w-24 rounded-full bg-gray-100" />
            </div>
            <div className="h-5 w-14 rounded-md bg-gray-100" />
          </div>
          <div className="mt-4 space-y-2.5">
            {[0, 1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gray-100" />
                <div className="h-6 w-6 rounded bg-gray-100" />
                <div className="h-2.5 flex-1 rounded-full bg-gray-100" />
                <div className="h-2.5 w-6 rounded-full bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(17,24,39,0.025)]">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded-full bg-gray-100" />
          <div className="h-2 w-48 rounded-full bg-gray-100" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="rounded-lg border border-gray-100 bg-[#FCFCFD] p-2.5">
              <div className="h-2 w-16 rounded-full bg-gray-100" />
              <div className="mt-2 h-4 w-20 rounded bg-gray-100" />
              <div className="mt-3 h-5 w-full rounded bg-gray-50" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPreview({
  data,
  isLoading = false,
}: {
  data?: LiveDashboardData | null;
  isLoading?: boolean;
}) {
  const dashboard = data ?? fallbackDashboard;
  const isLive = Boolean(data);
  const score = clampPercent(dashboard.webPresence);
  const sentimentPercent = clampPercent(dashboard.brandSentiment * 100);
  const promptCoverage = clampPercent(dashboard.promptCoverage);
  const sentimentTone = sentimentTones[dashboard.sentimentLabel] ?? sentimentTones.Positive;
  const displayBrandName = isLive ? formatBrandName(dashboard.domain) : "AEO Checker";
  const displayDomain = isLive ? dashboard.domain : "aeo-checker.com";
  const workspaceInitial = displayBrandName.charAt(0).toUpperCase();
  const chartSeries = dashboard.trends.length >= 2 ? dashboard.trends : fallbackDashboard.trends;
  const chartLabels = isLive ? dashboard.trendLabels : undefined;
  const promptBars = dashboard.promptBars.length > 0 ? dashboard.promptBars : fallbackDashboard.promptBars;
  const rankings: BrandRanking[] = [
    {
      name: displayBrandName,
      domain: displayDomain,
      score,
      change: isLive ? "New" : "+4.2",
      you: true,
      initial: workspaceInitial,
    },
    ...competitorRankings,
  ];

  return (
    <div className="relative mx-auto max-w-[1220px] overflow-x-hidden">
      <div
        className="absolute -inset-x-4 -top-10 bottom-8 -z-10 rounded-[44px] bg-gradient-to-b from-emerald-100/50 via-blue-100/25 to-transparent blur-2xl"
        aria-hidden="true"
      />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_30px_90px_-32px_rgba(17,24,39,0.32)] ring-1 ring-gray-900/[0.03] sm:rounded-[22px]">
        {/* Browser chrome */}
        <div className="flex h-11 items-center gap-3 border-b border-gray-200 bg-[#F9FAFB] px-3 sm:px-4">
          <div className="flex shrink-0 items-center gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          </div>

          <div className="mx-auto flex min-w-0 max-w-[430px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[10px] font-medium text-gray-500 shadow-sm">
            <Lock className="h-2.5 w-2.5 shrink-0 text-emerald-500" strokeWidth={2.4} />
            <span className="truncate">
              app.aeo-checker.com/overview{isLive ? `/${dashboard.domain}` : ""}
            </span>
          </div>

          <div className="hidden shrink-0 items-center gap-1.5 sm:flex" aria-hidden="true">
            <span className="h-5 w-5 rounded-md border border-gray-200 bg-white" />
            <span className="h-5 w-5 rounded-md border border-gray-200 bg-white" />
          </div>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <aside className="flex w-[58px] shrink-0 flex-col border-r border-gray-200 bg-[#FCFCFD] sm:w-[204px]">
            <div className="flex h-16 items-center gap-2.5 border-b border-gray-100 px-3 sm:px-4">
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-[#111827]">
                <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#FCFCFD]" />
              </span>
              <span className="hidden text-[13px] font-semibold tracking-[-0.025em] text-gray-900 sm:inline">
                AEO Checker
              </span>
            </div>

            <div className="hidden px-3 pt-4 sm:block">
              <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 text-left shadow-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[10px] font-bold text-emerald-700">
                  {workspaceInitial}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10px] font-semibold text-gray-800">
                    {isLive ? dashboard.domain : "Acme Inc."}
                  </span>
                  <span className="block text-[8px] text-gray-400">
                    {isLive ? "Live analysis" : "Pro workspace"}
                  </span>
                </span>
                <ChevronDown className="h-3 w-3 shrink-0 text-gray-400" />
              </div>
            </div>

            <nav className="mt-3 flex flex-col gap-1 px-2 sm:mt-5" aria-label="Dashboard preview navigation">
              {sidebarItems.map((item) => (
                <SidebarNavItem key={item.label} {...item} />
              ))}
            </nav>

            <div className="mt-auto hidden px-2 pb-3 pt-6 sm:block">
              <div className="mb-2 space-y-1 border-t border-gray-100 pt-3">
                <div className="flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-gray-500 hover:bg-gray-100/80">
                  <Settings className="h-3.5 w-3.5 text-gray-400" />
                  Settings
                </div>
                <div className="flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[10px] font-medium text-gray-500 hover:bg-gray-100/80">
                  <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                  Help center
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 text-[8px] font-bold text-white">
                  JD
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[9px] font-semibold text-gray-800">Jamie Davis</span>
                  <span className="block truncate text-[8px] text-gray-400">jamie@acme.com</span>
                </span>
                <ChevronDown className="h-3 w-3 text-gray-300" />
              </div>
            </div>

            <div className="mt-auto flex flex-col items-center gap-3 pb-4 pt-5 sm:hidden">
              <Settings className="h-4 w-4 text-gray-400" />
              <HelpCircle className="h-4 w-4 text-gray-400" />
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 text-[8px] font-bold text-white">
                JD
              </span>
            </div>
          </aside>

          {/* Main dashboard */}
          <div className="min-w-0 flex-1">
            <header className="flex h-16 items-center justify-between gap-3 border-b border-gray-200 bg-white px-3.5 sm:px-5">
              <div className="min-w-0">
                <div className="flex items-center gap-1 text-[8px] font-medium text-gray-400">
                  <span>Workspace</span>
                  <ChevronRight className="h-2.5 w-2.5" />
                  <span className="text-gray-500">Overview</span>
                  {isLive && (
                    <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[7px] font-semibold text-emerald-700">
                      <span className="h-1 w-1 rounded-full bg-emerald-500" />
                      Live scan
                    </span>
                  )}
                </div>
                <h3 className="truncate text-[14px] font-semibold tracking-[-0.03em] text-gray-900 sm:text-[15px]">
                  {isLive ? `Overview for ${dashboard.domain}` : "Good morning, Jamie"}
                </h3>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="hidden items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[9px] font-medium text-gray-600 shadow-sm md:flex">
                  <CalendarDays className="h-3 w-3 text-gray-400" />
                  {isLive ? "Latest scan" : "Last 7 days"}
                  <ChevronDown className="h-2.5 w-2.5 text-gray-400" />
                </div>
                <button
                  type="button"
                  aria-label="Notifications"
                  className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:text-gray-900"
                >
                  <Bell className="h-3.5 w-3.5" />
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </button>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 text-[8px] font-bold text-white ring-2 ring-white">
                  JD
                </span>
              </div>
            </header>

            <div className="bg-[#F9FAFB] p-3 sm:p-4 lg:p-5" aria-busy={isLoading}>
              <AnimatePresence mode="wait" initial={false}>
                {isLoading ? (
                  <DashboardSkeleton key="dashboard-skeleton" />
                ) : (
                  <motion.div
                    key={isLive ? `dashboard-${dashboard.domain}` : "dashboard-fallback"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="space-y-3"
                  >
                    {/* Top cards */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <TopMetricCard className="border-emerald-100/80 bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/50">
                        <CardHeading label="Web presence" icon={Globe2} tone="emerald" />
                        <div className="mt-3 flex flex-1 items-center gap-3">
                          <CircularProgress
                            value={score}
                            id="dashboard-web-presence"
                            className="h-[84px] w-[84px]"
                            strokeWidth={8}
                          >
                            <span className="text-[22px] font-semibold tracking-[-0.05em] leading-none text-gray-900">
                              {score}
                            </span>
                            <span className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                              AEO score
                            </span>
                          </CircularProgress>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                              <ArrowUpRight className="h-3 w-3" />
                              {isLive ? `${dashboard.totalMentions} mentions` : "8.4%"}
                            </div>
                            <p className="mt-0.5 text-[8px] text-gray-400">
                              {isLive ? `across ${dashboard.totalQueries} analysed prompts` : "vs. previous 30 days"}
                            </p>
                            <div className="mt-2.5 space-y-1.5">
                              <div className="flex items-center justify-between gap-2 text-[8px]">
                                <span className="flex items-center gap-1 text-gray-500">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                  Prompts analysed
                                </span>
                                <span className="font-semibold text-gray-700">{dashboard.totalQueries}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2 text-[8px]">
                                <span className="flex items-center gap-1 text-gray-500">
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                  Answer citations
                                </span>
                                <span className="font-semibold text-gray-700">{dashboard.citationsCount}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TopMetricCard>

                      <TopMetricCard>
                        <CardHeading label="Brand Sentiment" icon={Smile} tone="purple" />
                        <div className="mt-3 flex items-end justify-between gap-2">
                          <div>
                            <p className="text-[27px] font-semibold leading-none tracking-[-0.055em] text-gray-900">
                              {dashboard.brandSentiment.toFixed(2)}
                            </p>
                            <p className="mt-1 text-[8px] text-gray-400">Sentiment index</p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[8px] font-semibold ring-1 ${sentimentTone.badge}`}
                          >
                            {dashboard.sentimentLabel}
                          </span>
                        </div>
                        <div className="mt-3">
                          <ProgressBar
                            value={sentimentPercent}
                            heightClassName="h-1.5"
                            barClassName={sentimentTone.bar}
                          />
                          <div className="mt-1.5 flex justify-between text-[7px] text-gray-400">
                            <span>Negative</span>
                            <span>Neutral</span>
                            <span>Positive</span>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5 text-[8px] text-gray-500">
                          {isLive ? (
                            <Sparkles className={`h-3 w-3 ${sentimentTone.icon}`} />
                          ) : (
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                          )}
                          <span className="font-semibold text-gray-700">
                            {isLive ? `${dashboard.totalQueries} answers` : "+12%"}
                          </span>
                          {isLive ? "analysed in your latest scan" : "more positive than last week"}
                        </div>
                      </TopMetricCard>

                      <TopMetricCard>
                        <CardHeading label="Key Prompts" icon={KeyRound} tone="blue" />
                        <div className="mt-3 flex items-end justify-between gap-2">
                          <div>
                            <p className="text-[27px] font-semibold leading-none tracking-[-0.055em] text-gray-900">
                              {promptCoverage}%
                            </p>
                            <p className="mt-1 text-[8px] text-gray-400">
                              {dashboard.mentionedQueries} of {dashboard.totalQueries} tracked prompts
                            </p>
                          </div>
                          <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                            <ArrowUpRight className="h-2.5 w-2.5" />
                            {isLive ? `${dashboard.totalMentions} mentions` : "6.2%"}
                          </span>
                        </div>
                        <div className="mt-3 flex h-[46px] items-end gap-1">
                          {promptBars.map((height, index) => (
                            <span
                              key={index}
                              className={`flex-1 rounded-[2px] ${
                                index === promptBars.length - 1
                                  ? "bg-emerald-500"
                                  : index === promptBars.length - 2
                                    ? "bg-emerald-300"
                                    : "bg-gray-100"
                              }`}
                              style={{ height: `${Math.max(6, clampPercent(height))}%` }}
                            />
                          ))}
                        </div>
                        <div className="mt-1.5 flex justify-between text-[7px] text-gray-400">
                          <span>{isLive ? "P1" : "Mon"}</span>
                          <span>{isLive ? `P${promptBars.length}` : "Today"}</span>
                        </div>
                      </TopMetricCard>
                    </div>

                    {/* Charts and rankings */}
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
                      <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(17,24,39,0.025)]">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-[12px] font-semibold tracking-[-0.02em] text-gray-800">
                              {isLive ? "Prompt trends" : "Daily trends"}
                            </p>
                            <p className="mt-0.5 text-[8px] text-gray-400">
                              {isLive
                                ? `Visibility across ${dashboard.totalQueries} analysed prompts`
                                : "AI visibility over the last 7 days"}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            {chartSeries.map((series) => (
                              <span key={series.label} className="flex items-center gap-1 text-[7px] font-medium text-gray-500">
                                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: series.color }} />
                                {series.label}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2">
                          <DailyTrendsChart
                            series={chartSeries}
                            labels={chartLabels}
                            ariaLabel={
                              isLive
                                ? `Prompt trends for ${dashboard.domain}, showing AEO score, AI mention rate, and brand sentiment`
                                : "Daily trends showing AEO score, AI mention rate, and brand sentiment over the last seven days"
                            }
                          />
                        </div>
                        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2.5 text-[8px]">
                          {isLive ? (
                            <span className="flex items-center gap-1 text-gray-500">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50">
                                <Sparkles className="h-2.5 w-2.5 text-emerald-600" />
                              </span>
                              Live analysis for <span className="font-semibold text-gray-700">{dashboard.domain}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-500">
                              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-50">
                                <ArrowUpRight className="h-2.5 w-2.5 text-emerald-600" />
                              </span>
                              AEO score is up <span className="font-semibold text-gray-700">18.2%</span> this week
                            </span>
                          )}
                          <span className="text-gray-400">{isLive ? "Updated just now" : "Updated 2m ago"}</span>
                        </div>
                      </div>

                      <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(17,24,39,0.025)]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-[12px] font-semibold tracking-[-0.02em] text-gray-800">Brand Rankings</p>
                            <p className="mt-0.5 text-[8px] text-gray-400">Share of AI answers</p>
                          </div>
                          <span className="flex items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-1 text-[7px] font-medium text-gray-500">
                            {isLive ? "Live scan" : "This week"}
                            <ChevronDown className="h-2 w-2" />
                          </span>
                        </div>

                        <div className="mt-3 grid grid-cols-[16px_minmax(0,1fr)_38px_26px] items-center gap-1 border-b border-gray-100 pb-1.5 text-[7px] font-semibold uppercase tracking-[0.08em] text-gray-400">
                          <span>#</span>
                          <span>Brand</span>
                          <span className="text-right">Score</span>
                          <span className="text-right">7d</span>
                        </div>

                        <div className="mt-1.5 flex flex-1 flex-col divide-y divide-gray-100">
                          {rankings.map((brand, index) => (
                            <div
                              key={`${brand.name}-${index}`}
                              className={`grid grid-cols-[16px_minmax(0,1fr)_38px_26px] items-center gap-1 rounded-lg px-1 py-2 transition-colors ${
                                brand.you
                                  ? "bg-blue-50 ring-1 ring-blue-100"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <span
                                className={`text-[8px] font-semibold ${
                                  brand.you ? "text-blue-600" : "text-gray-400"
                                }`}
                              >
                                {index + 1}
                              </span>
                              <div className="flex min-w-0 items-center gap-1.5">
                                <span
                                  className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] text-[7px] font-bold ${
                                    brand.you
                                      ? "bg-white text-blue-600 ring-1 ring-blue-100"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {brand.initial}
                                </span>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1">
                                    <p className="truncate text-[9px] font-semibold text-gray-800">{brand.name}</p>
                                    {brand.you && (
                                      <span className="rounded bg-blue-100 px-1 py-px text-[6px] font-bold uppercase tracking-wide text-blue-600">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <p className="truncate text-[7px] text-gray-400">{brand.domain}</p>
                                </div>
                              </div>
                              <span className="text-right text-[9px] font-semibold text-gray-800">{brand.score}</span>
                              <span
                                className={`text-right text-[7px] font-semibold ${
                                  brand.change.startsWith("-")
                                    ? "text-red-500"
                                    : brand.change === "New"
                                      ? "text-blue-600"
                                      : "text-emerald-600"
                                }`}
                              >
                                {brand.change}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-2 border-t border-gray-100 pt-2">
                          <span className="flex items-center justify-center gap-1 text-[8px] font-semibold text-gray-500">
                            View full rankings
                            <ArrowRight className="h-2.5 w-2.5" />
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Traffic impact */}
                    <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(17,24,39,0.025)]">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[12px] font-semibold tracking-[-0.02em] text-gray-800">Traffic impact</p>
                          <p className="mt-0.5 text-[8px] text-gray-400">The business results behind your AI visibility</p>
                        </div>
                        <span className="hidden items-center gap-1 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-1 text-[7px] font-medium text-gray-500 sm:flex">
                          Last 30 days
                          <ChevronDown className="h-2 w-2" />
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
                        {trafficMetrics.map((metric) => {
                          const Icon = metric.icon;
                          return (
                            <div
                              key={metric.label}
                              className="rounded-lg border border-gray-100 bg-[#FCFCFD] p-2.5 transition-colors hover:border-gray-200 hover:bg-white"
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="min-w-0">
                                  <p className="truncate text-[8px] font-medium text-gray-500">{metric.label}</p>
                                  <p className="mt-1 text-[17px] font-semibold leading-none tracking-[-0.04em] text-gray-900">
                                    {metric.value}
                                  </p>
                                </div>
                                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${metric.tone}`}>
                                  <Icon className="h-2.5 w-2.5" strokeWidth={2.2} />
                                </span>
                              </div>
                              <div className="mt-1.5 flex items-end justify-between gap-1">
                                <span
                                  className={`flex items-center gap-0.5 text-[7px] font-semibold ${
                                    metric.positive ? "text-emerald-600" : "text-red-500"
                                  }`}
                                >
                                  {metric.positive ? (
                                    <ArrowUpRight className="h-2 w-2" />
                                  ) : (
                                    <ArrowDownRight className="h-2 w-2" />
                                  )}
                                  {metric.change}
                                </span>
                                <Sparkline
                                  values={metric.values}
                                  className="h-5 w-12"
                                  color={metric.color}
                                  fillColor={`${metric.color}18`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
