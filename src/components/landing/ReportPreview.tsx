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
    <section id="reports" className="relative border-y border-gray-200/70 bg-[#F9FAFB] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-semibold text-gray-600 shadow-sm">
              <Gauge className="h-3.5 w-3.5 text-emerald-500" />
              Board-ready in minutes
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-[#111827] sm:text-4xl lg:text-[42px]">
              One-Time Reports
            </h2>
            <p className="mt-3 max-w-xl text-[15px] leading-7 text-gray-500 sm:text-base">
              A complete, shareable snapshot of your AI visibility. No subscription required—perfect
              for pitches, audits, and strategy reviews.
            </p>
          </div>
          <a
            href="#analyze"
            className="group inline-flex w-fit items-center gap-2 rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md"
          >
            Get your report
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <div className="mt-10 sm:mt-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-lift sm:rounded-3xl sm:p-3">
            <div className="overflow-hidden rounded-xl border border-gray-200 sm:rounded-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-4 sm:px-5">
                <div className="flex items-center gap-2.5">
                  <LogoMark className="h-8 w-8" />
                  <div>
                    <p className="text-[12px] font-semibold tracking-[-0.02em] text-gray-900">
                      AEO Visibility Report
                    </p>
                    <p className="text-[10px] text-gray-400">Prepared for acme.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[10px] font-medium text-gray-500 sm:flex">
                    <CalendarDays className="h-3 w-3 text-gray-400" />
                    Nov 5, 2026
                  </span>
                  <span className="flex items-center gap-1.5 rounded-lg bg-[#111827] px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-sm">
                    <Download className="h-3 w-3" />
                    Download PDF
                  </span>
                </div>
              </div>

              <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
                <div className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-b from-emerald-50/70 via-white to-white p-6 sm:p-8 lg:border-b-0 lg:border-r">
                  <div className="dot-grid pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                        Overall AEO score
                      </span>
                      <span className="rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[9px] font-semibold text-emerald-700 shadow-sm">
                        Top 8%
                      </span>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <CircularProgress
                        value={90}
                        id="report-overall-score"
                        className="h-[188px] w-[188px] sm:h-[210px] sm:w-[210px]"
                        strokeWidth={7}
                      >
                        <span className="text-[46px] font-semibold leading-none tracking-[-0.07em] text-gray-900 sm:text-[52px]">
                          90
                        </span>
                        <span className="mt-1 text-[11px] font-medium text-gray-400">/ 100</span>
                        <span className="mt-2 rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-semibold text-emerald-700">
                          Excellent
                        </span>
                      </CircularProgress>
                    </div>

                    <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-gray-500">
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="font-semibold text-emerald-700">14 points</span>
                      higher than your last audit
                    </div>

                    <div className="mt-6 grid grid-cols-3 divide-x divide-gray-200 rounded-xl border border-gray-200 bg-white/80 py-3 shadow-sm backdrop-blur">
                      {[
                        { value: "6", label: "AI engines" },
                        { value: "48", label: "Prompts" },
                        { value: "12", label: "Competitors" },
                      ].map((item) => (
                        <div key={item.label} className="px-2 text-center">
                          <p className="text-[16px] font-semibold tracking-[-0.04em] text-gray-900">{item.value}</p>
                          <p className="mt-0.5 text-[8px] font-medium uppercase tracking-[0.1em] text-gray-400">
                            {item.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-[13px] font-semibold tracking-[-0.02em] text-gray-900">Score breakdown</h3>
                      <p className="mt-0.5 text-[10px] text-gray-400">Every dimension of your AI search presence</p>
                    </div>
                    <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-700 ring-1 ring-emerald-100 sm:inline">
                      6 engines scanned
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {reportMetrics.map((metric) => {
                      const Icon = metric.icon;
                      return (
                        <div
                          key={metric.label}
                          className="group rounded-xl border border-gray-200 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${metric.tone}`}>
                              <Icon className="h-3.5 w-3.5" strokeWidth={2.1} />
                            </span>
                            <span className="text-[18px] font-semibold leading-none tracking-[-0.04em] text-gray-900">
                              {metric.score}
                            </span>
                          </div>
                          <p className="mt-3 text-[11px] font-semibold text-gray-800">{metric.label}</p>
                          <p className="mt-0.5 text-[9px] leading-4 text-gray-400">{metric.description}</p>
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

                  <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <p className="text-[10px] font-semibold text-gray-800">Your AEO strategy is working</p>
                      <p className="mt-0.5 text-[9px] leading-4 text-gray-500">
                        Your brand is now recommended in 88% of high-intent AI answers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-[#FCFCFD] px-4 py-3.5 sm:px-5">
                <span className="text-[9px] text-gray-400">
                  Generated by AEO Checker · Data refreshed in real time
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[9px] font-medium text-gray-500 shadow-sm">
                    <Share2 className="h-3 w-3" />
                    Share report
                  </span>
                  <span className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[9px] font-semibold text-gray-700 shadow-sm">
                    View full report
                    <ArrowUpRight className="h-3 w-3" />
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
