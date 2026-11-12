import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Download,
  Gauge,
  Globe2,
  KeyRound,
  ListChecks,
  Share2,
  Users,
} from "lucide-react";
import { LogoMark } from "./BrandLogos";
import { CircularProgress, ProgressBar } from "./Charts";

const reportMetrics = [
  {
    label: "AI Presence",
    score: 88,
    description: "Mentioned in high-intent AI answers",
    icon: Globe2,
    tone: "bg-emerald-50 text-emerald-600",
    bar: "bg-emerald-500",
  },
  {
    label: "Key Prompts",
    score: 78,
    description: "Winning prompts vs. competitors",
    icon: KeyRound,
    tone: "bg-blue-50 text-blue-600",
    bar: "bg-blue-500",
  },
  {
    label: "Competitor Landscape",
    score: 76,
    description: "Share of voice across AI engines",
    icon: Users,
    tone: "bg-violet-50 text-violet-600",
    bar: "bg-violet-500",
  },
  {
    label: "Strategy Review",
    score: 55,
    description: "Action plan completion",
    icon: ListChecks,
    tone: "bg-amber-50 text-amber-600",
    bar: "bg-amber-500",
  },
];

export default function ReportPreview() {
  return (
    <section id="reports" className="relative border-y border-slate-200/80 bg-slate-50/50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-medium text-slate-600 shadow-2xs">
              <Gauge className="h-3.5 w-3.5 text-emerald-600" />
              Executive PDF Documentation
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              One-Time Audits & Reports
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-600">
              A comprehensive, board-ready snapshot of your brand&apos;s AI visibility across all major engines. No subscription required—ideal for client pitches, quarterly reviews, and competitive audits.
            </p>
          </div>
          <a
            href="#analyze"
            className="group inline-flex w-fit items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-slate-800"
          >
            Generate Free Audit
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="mt-10 sm:mt-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-card sm:p-3">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <LogoMark className="h-7 w-7" />
                  <div>
                    <p className="font-display text-xs font-bold tracking-tight text-slate-900">
                      AEO Visibility Report
                    </p>
                    <p className="font-mono text-[10px] text-slate-500">Prepared for acme.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-[11px] font-medium text-slate-600 sm:flex">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                    Nov 5, 2026
                  </span>
                  <span className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs">
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </span>
                </div>
              </div>

              <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
                <div className="relative overflow-hidden border-b border-slate-200 bg-slate-50/40 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                  <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.25] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                        Overall AEO score
                      </span>
                      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-800">
                        Top 8th Percentile
                      </span>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <CircularProgress
                        value={90}
                        id="report-overall-score"
                        className="h-[188px] w-[188px] sm:h-[210px] sm:w-[210px]"
                        strokeWidth={7}
                      >
                        <span className="font-display text-[46px] font-bold leading-none tracking-tight text-slate-900 sm:text-[52px]">
                          90
                        </span>
                        <span className="mt-1 font-mono text-xs font-medium text-slate-400">/ 100</span>
                        <span className="mt-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
                          High Authority
                        </span>
                      </CircularProgress>
                    </div>

                    <div className="mt-5 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600">
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="font-semibold text-emerald-700">+14 points</span>
                      vs. baseline benchmark
                    </div>

                    <div className="mt-6 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white py-3 shadow-2xs">
                      {[
                        { value: "6", label: "AI engines" },
                        { value: "48", label: "Prompts" },
                        { value: "12", label: "Competitors" },
                      ].map((item) => (
                        <div key={item.label} className="px-2 text-center">
                          <p className="font-display text-base font-bold text-slate-900">{item.value}</p>
                          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                            {item.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-sm font-bold text-slate-900">Score Breakdown</h3>
                      <p className="mt-0.5 text-xs text-slate-500">Key dimensions of your AI search footprint</p>
                    </div>
                    <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-slate-600 sm:inline">
                      6 engines scanned
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {reportMetrics.map((metric) => {
                      const Icon = metric.icon;
                      return (
                        <div
                          key={metric.label}
                          className="group rounded-xl border border-slate-200 bg-white p-3.5 transition-all hover:border-slate-300 hover:shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200/80 ${metric.tone}`}>
                              <Icon className="h-3.5 w-3.5" strokeWidth={2.1} />
                            </span>
                            <span className="font-mono text-base font-bold text-slate-900">
                              {metric.score}
                            </span>
                          </div>
                          <p className="mt-2.5 text-xs font-semibold text-slate-800">{metric.label}</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{metric.description}</p>
                          <ProgressBar
                            value={metric.score}
                            className="mt-3"
                            heightClassName="h-1.5"
                            barClassName={metric.bar}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Domain Strategy Verified</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                        Brand citations confirmed in 88% of target high-intent purchasing queries.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-3 sm:px-5">
                <span className="font-mono text-[10px] text-slate-500">
                  Generated by AEO Tracker · Enterprise engine telemetry active
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-2xs">
                    <Share2 className="h-3.5 w-3.5" />
                    Share report
                  </span>
                  <span className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs">
                    View full report
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
