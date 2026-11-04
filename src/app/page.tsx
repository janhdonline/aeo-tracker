"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Crosshair,
  FileText,
  Globe2,
  Link2,
  ListChecks,
  Loader2,
  Map,
  Menu,
  MessageCircle,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import DashboardPreview from "@/components/landing/DashboardPreview";
import ReportPreview from "@/components/landing/ReportPreview";
import { ProgressBar, Sparkline } from "@/components/landing/Charts";
import {
  BrandIcon,
  BrandWordmark,
  CanvaLogo,
  GoogleAnalyticsLogo,
  HubSpotLogo,
  LogoMark,
  MailchimpLogo,
  WordPressLogo,
  heroExamples,
  type ExampleBrand,
} from "@/components/landing/BrandLogos";

type CheckResult = {
  domain: string;
  visibilityScore: number;
  totalQueries: number;
  totalMentions: number;
};

type FeatureKind = "prompts" | "voice" | "gap" | "citations" | "accuracy" | "plan";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  visual: FeatureKind;
};

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Reports", href: "#reports" },
  { label: "Examples", href: "#examples" },
];

const features: Feature[] = [
  {
    title: "Prompt Opportunity Map",
    description:
      "Discover high-intent prompts where your brand is missing from AI answers, ranked by revenue opportunity.",
    icon: Map,
    tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    visual: "prompts",
  },
  {
    title: "AI Share of Voice",
    description:
      "Benchmark how often you are mentioned against competitors across ChatGPT, Gemini, DeepSeek, and more.",
    icon: Share2,
    tone: "bg-blue-50 text-blue-600 ring-blue-100",
    visual: "voice",
  },
  {
    title: "Competitor Mention Gap",
    description:
      "See exactly which competitors win the mentions you are missing—and the prompts driving their advantage.",
    icon: Crosshair,
    tone: "bg-violet-50 text-violet-600 ring-violet-100",
    visual: "gap",
  },
  {
    title: "Citation Sources",
    description:
      "Track the forums, directories, and publications AI engines trust when they recommend brands in your category.",
    icon: Link2,
    tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    visual: "citations",
  },
  {
    title: "AI Answer Accuracy",
    description:
      "Audit whether AI describes your product, pricing, and positioning correctly—and catch outdated claims early.",
    icon: ShieldCheck,
    tone: "bg-blue-50 text-blue-600 ring-blue-100",
    visual: "accuracy",
  },
  {
    title: "AEO Action Plan",
    description:
      "Turn every visibility gap into a prioritised, step-by-step roadmap your team can execute this week.",
    icon: ListChecks,
    tone: "bg-violet-50 text-violet-600 ring-violet-100",
    visual: "plan",
  },
];

const insights = [
  {
    title: "Increase your Reddit Presence",
    description: "Join 4 high-intent threads where your brand is already being discussed.",
    impact: "+12 pts",
    priority: "High impact",
    time: "2 weeks",
    icon: MessageCircle,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Improve Bing Rankings",
    description: "Your brand appears in only 3 of 9 Bing Copilot answers for core prompts.",
    impact: "+8 pts",
    priority: "Medium impact",
    time: "3 weeks",
    icon: Search,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    title: "Publish a comparison page",
    description: "Capture high-intent “vs” prompts currently owned by two competitors.",
    impact: "+6 pts",
    priority: "Quick win",
    time: "1 week",
    icon: FileText,
    tone: "bg-violet-50 text-violet-600",
  },
];

const examples: Array<{
  brand: ExampleBrand;
  domain: string;
  score: number;
  trend: number[];
}> = [
  { brand: "Uber", domain: "uber.com", score: 72, trend: [24, 29, 27, 34, 31, 39, 44] },
  { brand: "Stripe", domain: "stripe.com", score: 86, trend: [31, 36, 34, 43, 46, 51, 58] },
  { brand: "Discord", domain: "discord.com", score: 64, trend: [22, 25, 23, 27, 30, 28, 34] },
  { brand: "Stanley", domain: "stanley1913.com", score: 78, trend: [28, 31, 35, 33, 40, 44, 47] },
  { brand: "Whoop", domain: "whoop.com", score: 81, trend: [25, 32, 30, 38, 42, 40, 49] },
  { brand: "Figma", domain: "figma.com", score: 89, trend: [34, 38, 42, 40, 49, 55, 61] },
  { brand: "Y Combinator", domain: "ycombinator.com", score: 76, trend: [27, 30, 33, 36, 34, 42, 46] },
  { brand: "Zara", domain: "zara.com", score: 68, trend: [21, 26, 24, 30, 33, 31, 37] },
  { brand: "Revolut", domain: "revolut.com", score: 83, trend: [29, 34, 32, 40, 43, 47, 53] },
];

function normalizeDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0]
    .split("?")[0];
}

function scoreTone(score: number) {
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (score >= 70) return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

function SectionBadge({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-semibold text-gray-600 shadow-sm">
      <Icon className="h-3.5 w-3.5 text-emerald-500" />
      {children}
    </span>
  );
}

function FeatureVisual({ kind }: { kind: FeatureKind }) {
  if (kind === "prompts") {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
        <div className="flex items-center justify-between text-[9px]">
          <span className="font-medium text-gray-500">Untapped prompts</span>
          <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 font-semibold text-emerald-700">3 new</span>
        </div>
        <div className="mt-2.5 space-y-2">
          {["best crm for startups", "ai seo tools comparison", "how to rank in chatgpt"].map(
            (prompt, index) => (
              <div key={prompt} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span className="min-w-0 flex-1 truncate text-[9px] text-gray-500">{prompt}</span>
                <span className="text-[9px] font-semibold text-gray-700">{[92, 81, 74][index]}</span>
              </div>
            )
          )}
        </div>
      </div>
    );
  }

  if (kind === "voice") {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[9px] text-gray-500">Your share of voice</p>
            <p className="mt-0.5 text-xl font-semibold tracking-[-0.04em] text-gray-900">42.8%</p>
          </div>
          <span className="flex items-center gap-1 text-[9px] font-semibold text-emerald-600">
            <TrendingUp className="h-3 w-3" />
            +6.4%
          </span>
        </div>
        <div className="mt-2.5 flex h-2 overflow-hidden rounded-full">
          <span className="w-[43%] bg-emerald-500" />
          <span className="w-[31%] bg-blue-400" />
          <span className="w-[26%] bg-violet-400" />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[8px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            You
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Semrush
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            Ahrefs
          </span>
        </div>
      </div>
    );
  }

  if (kind === "gap") {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
        <div className="flex items-center justify-between text-[9px]">
          <span className="font-medium text-gray-500">Mention gap</span>
          <span className="font-semibold text-violet-600">-24%</span>
        </div>
        <div className="mt-2.5 space-y-2.5">
          {[
            { label: "Semrush", value: 78, color: "bg-blue-500" },
            { label: "Ahrefs", value: 71, color: "bg-violet-500" },
            { label: "Your brand", value: 54, color: "bg-emerald-500" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-[9px]">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-semibold text-gray-700">{item.value}</span>
              </div>
              <ProgressBar
                value={item.value}
                className="mt-1"
                heightClassName="h-1.5"
                barClassName={item.color}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "citations") {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
        <div className="flex flex-wrap gap-1.5">
          {["Reddit", "G2", "Wikipedia", "TechCrunch"].map((source, index) => (
            <span
              key={source}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[9px] font-medium text-gray-600 shadow-sm"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  index === 0 ? "bg-emerald-500" : index === 1 ? "bg-blue-500" : index === 2 ? "bg-violet-500" : "bg-gray-400"
                }`}
              />
              {source}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-[9px]">
          <span className="text-gray-500">Reddit citations</span>
          <span className="font-semibold text-gray-700">+31%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-[68%] rounded-full bg-emerald-500" />
        </div>
      </div>
    );
  }

  if (kind === "accuracy") {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
        <div className="space-y-2">
          {["Pricing & plans accurate", "Product category correct", "Brand claims verified"].map(
            (label, index) => (
              <div key={label} className="flex items-center gap-2 text-[9px] text-gray-600">
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    index === 2 ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                  }`}
                >
                  {index === 2 ? <span className="text-[9px] font-bold">!</span> : <Check className="h-2.5 w-2.5" />}
                </span>
                {label}
              </div>
            )
          )}
        </div>
        <p className="mt-2.5 text-[8px] text-gray-400">1 outdated claim found</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 rounded-xl border border-gray-100 bg-gray-50/80 p-3">
      {[
        { label: "Publish comparison page", value: "+8" },
        { label: "Refresh pricing schema", value: "+5" },
      ].map((task, index) => (
        <div
          key={task.label}
          className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5 shadow-sm"
        >
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
              index === 0 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
            }`}
          >
            <Check className="h-2.5 w-2.5" />
          </span>
          <span className="min-w-0 flex-1 truncate text-[9px] text-gray-600">{task.label}</span>
          <span className="text-[8px] font-semibold text-emerald-600">{task.value}</span>
        </div>
      ))}
      <p className="px-1 pt-0.5 text-[8px] text-gray-400">2 of 6 actions complete</p>
    </div>
  );
}

function ExamplePreview({
  score,
  trend,
}: {
  score: number;
  trend: number[];
}) {
  const color = score >= 80 ? "#10B981" : "#3B82F6";

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-1 border-b border-gray-100 bg-gray-50 px-2.5 py-1.5">
        <span className="h-1 w-1 rounded-full bg-red-300" />
        <span className="h-1 w-1 rounded-full bg-amber-300" />
        <span className="h-1 w-1 rounded-full bg-emerald-300" />
        <span className="mx-auto h-1.5 w-16 rounded-full bg-gray-200" />
      </div>
      <div className="flex bg-[#F9FAFB]">
        <div className="flex w-6 flex-col items-center gap-1.5 border-r border-gray-200 bg-white py-2">
          <span className="h-1.5 w-1.5 rounded-sm bg-emerald-500" />
          <span className="h-1.5 w-1.5 rounded-sm bg-gray-200" />
          <span className="h-1.5 w-1.5 rounded-sm bg-gray-200" />
          <span className="h-1.5 w-1.5 rounded-sm bg-gray-200" />
        </div>
        <div className="min-w-0 flex-1 p-2">
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-semibold text-gray-700">Overview</span>
            <span className="rounded bg-white px-1 py-0.5 text-[5px] text-gray-400 ring-1 ring-gray-200">
              7 days
            </span>
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-1">
            <div className="rounded border border-gray-200 bg-white p-1.5">
              <p className="text-[5px] uppercase tracking-[0.08em] text-gray-400">Visibility</p>
              <p className="text-[9px] font-semibold text-gray-800">{score}</p>
            </div>
            <div className="rounded border border-gray-200 bg-white p-1.5">
              <p className="text-[5px] uppercase tracking-[0.08em] text-gray-400">Prompts</p>
              <p className="text-[9px] font-semibold text-gray-800">{Math.round(score * 0.16)}</p>
            </div>
          </div>
          <div className="mt-1.5 rounded border border-gray-200 bg-white p-1.5">
            <div className="flex items-center justify-between text-[5px] text-gray-400">
              <span>AEO trend</span>
              <span className="text-emerald-600">+{Math.round(score / 8)}%</span>
            </div>
            <Sparkline
              values={trend}
              className="mt-1 h-6 w-full"
              color={color}
              fillColor={score >= 80 ? "rgba(16,185,129,0.12)" : "rgba(59,130,246,0.12)"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.location.hash.includes("access_token")) {
      return;
    }

    const supabase = createClient();
    supabase.auth.getSession().then(({ data }: { data: { session: unknown } }) => {
      if (data.session) router.push("/dashboard");
    });
  }, [router]);

  function pickExample(exampleDomain: string) {
    setDomain(exampleDomain);
    setError("");
    setResult(null);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  async function handleAnalyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeDomain(domain);

    if (!normalized) {
      setError("Enter a website URL to analyze.");
      return;
    }

    setDomain(normalized);
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/free-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: normalized }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "We couldn't analyze that website. Please try again.");
      }

      setResult({
        domain: data.domain ?? normalized,
        visibilityScore: data.visibilityScore ?? 0,
        totalQueries: data.totalQueries ?? 0,
        totalMentions: data.totalMentions ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2.5" aria-label="AEO Checker home">
            <LogoMark />
            <span className="text-[17px] font-semibold tracking-[-0.035em] text-[#111827]">
              AEO Checker
            </span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] font-medium text-gray-500 transition-colors hover:text-gray-900"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <a
              href="/login"
              className="rounded-lg px-3 py-2 text-[13px] font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              Log in
            </a>
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#111827] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md"
            >
              Try for free
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:text-gray-900 lg:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-3 shadow-lg lg:hidden">
            <nav className="flex flex-col" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
              <a
                href="/login"
                className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Log in
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111827] px-4 py-3 text-sm font-semibold text-white"
              >
                Try for free
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-white">
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-80" aria-hidden="true" />
          <div
            className="pointer-events-none absolute left-1/2 top-[-140px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-emerald-100/50 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-[8%] top-52 h-56 w-56 rounded-full bg-blue-100/40 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute right-[7%] top-64 h-56 w-56 rounded-full bg-violet-100/40 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24 lg:pt-28">
            <div className="fade-up inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[11px] font-medium text-gray-600 shadow-sm sm:text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]" />
              63,100+ websites analysed
            </div>

            <h1 className="fade-up fade-up-delay-1 mx-auto mt-6 max-w-4xl text-[36px] font-semibold leading-[1.03] tracking-[-0.055em] text-[#111827] sm:text-6xl lg:text-[76px]">
              Check your website
              <span className="mt-1 block">
                <span className="relative inline-block">
                  <span className="relative z-10">
                    SEO{" "}
                    <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-blue-600 bg-clip-text text-transparent">
                      AEO
                    </span>
                  </span>
                  <svg
                    viewBox="0 0 220 12"
                    className="absolute -bottom-2 left-0 h-2.5 w-full text-emerald-200 sm:-bottom-3"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 8.5C42 3.5 86 2.5 128 5.2C159 7.2 190 6.2 218 3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </span>
            </h1>

            <p className="fade-up fade-up-delay-2 mx-auto mt-6 max-w-2xl text-balance text-[15px] leading-7 text-gray-500 sm:text-lg sm:leading-8">
              Answer Engine Optimization improves your website&apos;s visibility to AIs like
              DeepSeek
            </p>

            <form id="analyze" onSubmit={handleAnalyze} className="fade-up fade-up-delay-3 mx-auto mt-9 max-w-2xl">
              <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-[0_16px_50px_-24px_rgba(17,24,39,0.32)] transition-all focus-within:border-emerald-300 focus-within:ring-4 focus-within:ring-emerald-500/10 sm:flex sm:items-center">
                <label htmlFor="website-url" className="sr-only">
                  Website URL
                </label>
                <div className="flex flex-1 items-center gap-3 px-3 py-2">
                  <Globe2 className="h-5 w-5 shrink-0 text-gray-400" strokeWidth={1.8} />
                  <input
                    ref={inputRef}
                    id="website-url"
                    name="domain"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    spellCheck={false}
                    value={domain}
                    onChange={(event) => setDomain(event.target.value)}
                    placeholder="Enter the website url"
                    className="min-w-0 flex-1 bg-transparent text-[15px] font-medium text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#111827] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-gray-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0 sm:w-auto"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {loading ? "Analyzing..." : "Analyze"}
                  {!loading && (
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  )}
                </button>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <span className="mr-1 text-xs font-medium text-gray-400">Examples:</span>
                {heroExamples.map((example) => (
                  <button
                    key={example.name}
                    type="button"
                    onClick={() => pickExample(example.domain)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:text-gray-900 hover:shadow"
                  >
                    <BrandIcon brand={example.name} />
                    {example.name}
                  </button>
                ))}
              </div>

              <div aria-live="polite">
                {error && (
                  <p className="mt-4 text-xs font-medium text-red-500" role="alert">
                    {error}
                  </p>
                )}

                {result && (
                  <div className="mx-auto mt-5 max-w-xl overflow-hidden rounded-2xl border border-emerald-200 bg-white text-left shadow-md">
                    <div className="flex items-center gap-3 p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                        <CheckCircle2 className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">Analysis complete</p>
                        <p className="truncate text-xs text-gray-500">
                          {result.domain} · Score{" "}
                          <span className="font-semibold text-gray-700">{result.visibilityScore}/100</span>{" "}
                          · {result.totalMentions} mentions across {result.totalQueries} prompts
                        </p>
                      </div>
                      <a
                        href="/login"
                        className="hidden shrink-0 items-center gap-1 rounded-lg bg-[#111827] px-3 py-2 text-[11px] font-semibold text-white hover:bg-gray-800 sm:inline-flex"
                      >
                        Unlock report
                        <ArrowRight className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="h-1 w-full bg-gray-100">
                      <div
                        className="h-full bg-emerald-500 transition-[width] duration-700"
                        style={{ width: `${Math.min(result.visibilityScore, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-4 text-[11px] text-gray-400">
                Free instant scan · No credit card required
              </p>
            </form>
          </div>
        </section>

        {/* Social proof */}
        <section className="border-y border-gray-200/70 bg-white py-9 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-[12px] font-medium text-gray-500">
              Trusted by marketers that also use
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-9 gap-y-5 opacity-75 grayscale sm:gap-x-12">
              <MailchimpLogo />
              <GoogleAnalyticsLogo />
              <HubSpotLogo />
              <WordPressLogo />
              <CanvaLogo />
            </div>
          </div>
        </section>

        {/* Product dashboard preview */}
        <section id="product" className="relative border-b border-gray-200/70 bg-[#F9FAFB] py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-9 max-w-2xl text-center sm:mb-12">
              <SectionBadge icon={Sparkles}>Live dashboard preview</SectionBadge>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[#111827] sm:text-4xl lg:text-[42px]">
                Every AI signal. One clear view.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-gray-500 sm:text-base">
                Track visibility, sentiment, prompts, and competitors across the engines your
                customers actually use.
              </p>
            </div>
            <DashboardPreview />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <SectionBadge icon={Sparkles}>Features</SectionBadge>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[#111827] sm:text-4xl lg:text-[42px]">
                Daily Analytics
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-[15px] leading-7 text-gray-500 sm:text-base">
                Daily tracking of the most important metrics in AI search
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:mt-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <article
                    key={feature.title}
                    className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200/80 hover:shadow-lg sm:p-6"
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${feature.tone}`}
                      >
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-gray-300 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gray-500 group-hover:opacity-100" />
                    </div>
                    <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.025em] text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-500">{feature.description}</p>
                    <div className="mt-auto pt-5">
                      <FeatureVisual kind={feature.visual} />
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works + personalised insights */}
        <section id="how-it-works" className="relative overflow-hidden border-y border-gray-200/70 bg-[#F9FAFB] py-20 sm:py-24">
          <div className="pointer-events-none absolute right-[-8%] top-10 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <div>
                <SectionBadge icon={Globe2}>AEO / GEO explained</SectionBadge>
                <h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-[-0.045em] text-[#111827] sm:text-4xl lg:text-[42px]">
                  How does AEO/GEO Work?
                </h2>
                <p className="mt-4 max-w-xl text-[15px] leading-7 text-gray-500 sm:text-base">
                  AI engines don&apos;t just rank links—they synthesise answers from the sources they
                  trust. AEO/GEO aligns your content, citations, and reputation so your brand becomes
                  part of those answers.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    {
                      title: "AI engines gather sources",
                      description: "They read reviews, forums, docs, and your website.",
                    },
                    {
                      title: "They compare and cite brands",
                      description: "Your reputation across the web shapes what gets mentioned.",
                    },
                    {
                      title: "You close the gaps",
                      description: "Fix citations and content, then track the lift daily.",
                    },
                  ].map((step, index) => (
                    <div key={step.title} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white text-[10px] font-semibold text-emerald-700 shadow-sm">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-gray-800">{step.title}</p>
                        <p className="mt-0.5 text-xs leading-5 text-gray-500">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative mt-8">
                  <div className="absolute -top-4 right-4 z-10 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-white px-3 py-2 shadow-md">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
                      84
                    </span>
                    <div>
                      <p className="text-[9px] font-semibold text-gray-800">AEO score</p>
                      <p className="text-[8px] font-medium text-emerald-600">+8.4 this month</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-soft sm:p-4">
                    <div className="rounded-xl border border-gray-200 bg-[#FCFCFD] p-3.5 sm:p-4">
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#111827]">
                          <Sparkles className="h-3 w-3 text-white" />
                        </span>
                        <p className="text-[10px] font-semibold text-gray-800">AI answer preview</p>
                        <span className="ml-auto rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[8px] font-medium text-gray-500">
                          DeepSeek
                        </span>
                      </div>

                      <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50/80 p-3">
                        <div className="flex items-center gap-1.5 text-[8px] text-gray-400">
                          <Search className="h-2.5 w-2.5" />
                          &quot;best AEO tools for SaaS&quot;
                        </div>
                        <p className="mt-2 text-[10px] leading-[1.6] text-gray-600">
                          The best AEO platforms help teams track brand mentions across AI engines.{" "}
                          <mark className="rounded bg-emerald-100 px-1 py-0.5 font-semibold text-emerald-800">
                            AEO Checker
                          </mark>{" "}
                          stands out for daily prompt monitoring, competitor benchmarks, and
                          actionable recommendations...
                        </p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <span className="mr-1 text-[7px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                          Sources
                        </span>
                        {["Reddit", "G2", "Your site"].map((source) => (
                          <span
                            key={source}
                            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-[8px] font-medium text-gray-500 shadow-sm"
                          >
                            {source}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {[
                          { label: "Mentions", value: "42" },
                          { label: "Citations", value: "18" },
                          { label: "Sentiment", value: "0.85" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-lg border border-gray-100 bg-white p-2 shadow-sm"
                          >
                            <p className="text-[7px] font-medium uppercase tracking-[0.08em] text-gray-400">
                              {item.label}
                            </p>
                            <p className="mt-0.5 text-[13px] font-semibold tracking-[-0.03em] text-gray-800">
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <SectionBadge icon={Sparkles}>Personalised for you</SectionBadge>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[#111827] sm:text-[34px]">
                  Get personalised insights
                </h2>
                <p className="mt-3 max-w-lg text-[15px] leading-7 text-gray-500">
                  Prioritised actions based on your actual gaps—not generic SEO advice.
                </p>

                <div className="mt-6 space-y-3">
                  {insights.map((insight) => {
                    const Icon = insight.icon;
                    return (
                      <a
                        key={insight.title}
                        href="#analyze"
                        className="group flex w-full items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                      >
                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${insight.tone}`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[13px] font-semibold tracking-[-0.01em] text-gray-900">
                              {insight.title}
                            </p>
                            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 ring-1 ring-emerald-100">
                              {insight.impact}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-gray-500">{insight.description}</p>
                          <div className="mt-2 flex items-center gap-2 text-[9px] font-medium text-gray-400">
                            <span className="flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              {insight.priority}
                            </span>
                            <span>·</span>
                            <span>{insight.time}</span>
                          </div>
                        </div>
                        <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-gray-500" />
                      </a>
                    );
                  })}
                </div>

                <a
                  href="#features"
                  className="group mt-4 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[12px] font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
                >
                  View all 12 personalised insights
                  <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5" />
                </a>

                <div className="mt-4 rounded-2xl bg-[#111827] p-5 text-white shadow-md">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                        Projected impact
                      </p>
                      <p className="mt-2 text-3xl font-semibold tracking-[-0.05em]">
                        +26 <span className="text-base font-medium text-gray-400">pts</span>
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[9px] font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
                      Next 30 days
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />
                  </div>
                  <p className="mt-2 text-[9px] text-gray-400">
                    If you complete the top 3 recommended actions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* One-time reports */}
        <ReportPreview />

        {/* View examples */}
        <section id="examples" className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <SectionBadge icon={Sparkles}>Real brands, real data</SectionBadge>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] text-[#111827] sm:text-4xl lg:text-[42px]">
                  View Examples
                </h2>
                <p className="mt-3 max-w-xl text-[15px] leading-7 text-gray-500 sm:text-base">
                  See how leading brands show up across AI answers—and where their biggest
                  opportunities live.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-[11px] font-medium text-gray-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Updated weekly
              </span>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {examples.map((example) => (
                <button
                  key={example.brand}
                  type="button"
                  onClick={() => pickExample(example.domain)}
                  className="group rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <BrandIcon brand={example.brand} className="h-7 w-7 rounded-md text-[9px]" />
                      <div className="min-w-0">
                        <BrandWordmark brand={example.brand} />
                        <p className="mt-0.5 truncate text-[10px] text-gray-400">{example.domain}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${scoreTone(
                        example.score
                      )}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {example.score}
                      <span className="font-normal opacity-60">/100</span>
                    </span>
                  </div>

                  <ExamplePreview score={example.score} trend={example.trend} />

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-gray-500">View full report</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all group-hover:border-emerald-200 group-hover:bg-emerald-50 group-hover:text-emerald-600">
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-white pb-20 pt-2 sm:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-[#F9FAFB] px-6 py-14 text-center shadow-soft sm:px-12 sm:py-16">
              <div className="hero-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
              <div
                className="pointer-events-none absolute left-1/2 top-[-90px] h-64 w-[480px] -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl"
                aria-hidden="true"
              />
              <div className="relative mx-auto max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Start your free scan
                </span>
                <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.055em] text-[#111827] sm:text-5xl">
                  Be the answer your customers find.
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-[15px] leading-7 text-gray-500 sm:text-base">
                  Join 63,100+ marketers using AEO Checker to measure, improve, and win visibility
                  in AI search.
                </p>
                <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                  <a
                    href="/login"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#111827] px-8 py-4 text-[15px] font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-lg"
                  >
                    Try for free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-4 text-[15px] font-semibold text-gray-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-400 hover:text-gray-900 hover:shadow-md"
                  >
                    Get in Touch
                  </a>
                </div>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    No credit card required
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Cancel anytime
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
            <a href="#" className="flex items-center gap-2.5" aria-label="AEO Checker home">
              <LogoMark className="h-8 w-8" />
              <span className="text-[15px] font-semibold tracking-[-0.03em] text-[#111827]">
                AEO Checker
              </span>
            </a>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Footer navigation">
              {[
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs font-medium text-gray-400 transition-colors hover:text-gray-700"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-gray-100 pt-6 text-[11px] text-gray-400 sm:flex-row">
            <p>© 2026 AEO Checker. All rights reserved.</p>
            <p>Built for the AI search era.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
