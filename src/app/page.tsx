"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
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
import type { LiveDashboardData } from "@/lib/types";
import DashboardPreview from "@/components/landing/DashboardPreview";
import AiModelRotator from "@/components/landing/AiModelRotator";
import AiEngineSwitcher from "@/components/landing/AiEngineSwitcher";
import ReportPreview from "@/components/landing/ReportPreview";
import { ProgressBar, Sparkline } from "@/components/landing/Charts";
import { LogoLoader } from "@/components/LogoLoader";
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
      "Discover high-intent prompts where your brand is missing from AI answers, ranked by commercial opportunity.",
    icon: Map,
    tone: "bg-slate-50 text-slate-800 border border-slate-200",
    visual: "prompts",
  },
  {
    title: "AI Share of Voice",
    description:
      "Benchmark how frequently you are cited against competitors across ChatGPT, Gemini, Perplexity, and Claude.",
    icon: Share2,
    tone: "bg-slate-50 text-slate-800 border border-slate-200",
    visual: "voice",
  },
  {
    title: "Competitor Mention Gap",
    description:
      "Identify the exact prompts where competitors win recommendations and the citations powering their ranking.",
    icon: Crosshair,
    tone: "bg-slate-50 text-slate-800 border border-slate-200",
    visual: "gap",
  },
  {
    title: "Citation Source Intelligence",
    description:
      "Track the directories, Reddit discussions, reviews, and authority publications LLMs rely on for answers.",
    icon: Link2,
    tone: "bg-slate-50 text-slate-800 border border-slate-200",
    visual: "citations",
  },
  {
    title: "Answer Accuracy Audit",
    description:
      "Verify that AI engines represent your pricing, specifications, and positioning with 100% precision.",
    icon: ShieldCheck,
    tone: "bg-slate-50 text-slate-800 border border-slate-200",
    visual: "accuracy",
  },
  {
    title: "Actionable Fix Roadmap",
    description:
      "Transform every visibility gap into a structured, step-by-step roadmap your team can execute immediately.",
    icon: ListChecks,
    tone: "bg-slate-50 text-slate-800 border border-slate-200",
    visual: "plan",
  },
];

const insights = [
  {
    title: "Increase Reddit Discussion Presence",
    description: "Participate in 4 high-intent buyer discussions where your category is actively evaluated.",
    impact: "+12 pts",
    priority: "High priority",
    time: "2 weeks",
    icon: MessageCircle,
    tone: "bg-slate-50 text-slate-800 border border-slate-200",
  },
  {
    title: "Strengthen Copilot & Bing Citations",
    description: "Your brand is cited in only 3 of 9 Bing Copilot answers for core commercial queries.",
    impact: "+8 pts",
    priority: "Medium priority",
    time: "3 weeks",
    icon: Search,
    tone: "bg-slate-50 text-slate-800 border border-slate-200",
  },
  {
    title: "Deploy Structured Comparison Hub",
    description: "Capture high-intent alternative and comparison prompts currently led by competitors.",
    impact: "+6 pts",
    priority: "Quick win",
    time: "1 week",
    icon: FileText,
    tone: "bg-slate-50 text-slate-800 border border-slate-200",
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
  if (score >= 80) return "border-slate-200 bg-slate-50 text-slate-900";
  if (score >= 70) return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-amber-200 bg-amber-50 text-amber-700";
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

function isLiveDashboardData(value: unknown): value is LiveDashboardData {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<LiveDashboardData>;
  const hasValidTrends =
    Array.isArray(candidate.trends) &&
    candidate.trends.length > 0 &&
    candidate.trends.every((series) => {
      const item = series as Partial<LiveDashboardData["trends"][number]> | undefined;

      return (
        item !== undefined &&
        typeof item.label === "string" &&
        typeof item.color === "string" &&
        Array.isArray(item.values) &&
        item.values.length >= 2 &&
        item.values.every((point) => typeof point === "number" && Number.isFinite(point))
      );
    });

  return (
    typeof candidate.domain === "string" &&
    typeof candidate.score === "number" &&
    typeof candidate.webPresence === "number" &&
    typeof candidate.brandSentiment === "number" &&
    typeof candidate.totalQueries === "number" &&
    typeof candidate.totalMentions === "number" &&
    typeof candidate.mentionedQueries === "number" &&
    typeof candidate.citationsCount === "number" &&
    typeof candidate.promptCoverage === "number" &&
    typeof candidate.sentimentLabel === "string" &&
    typeof candidate.lastUpdated === "string" &&
    Array.isArray(candidate.promptBars) &&
    candidate.promptBars.every((bar) => typeof bar === "number" && Number.isFinite(bar)) &&
    Array.isArray(candidate.trendLabels) &&
    candidate.trendLabels.every((label) => typeof label === "string") &&
    hasValidTrends
  );
}

function SectionBadge({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/90 bg-slate-50/90 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-slate-700 shadow-2xs">
      <Icon className="h-3.5 w-3.5 text-slate-600" />
      <span>{children}</span>
    </span>
  );
}

function FeatureVisual({ kind }: { kind: FeatureKind }) {
  if (kind === "prompts") {
    return (
      <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
        <div className="flex items-center justify-between text-[9px]">
          <span className="font-medium text-gray-500">Untapped prompts</span>
          <span className="rounded-full bg-slate-50 px-1.5 py-0.5 font-semibold text-slate-900">3 new</span>
        </div>
        <div className="mt-2.5 space-y-2">
          {["best crm for startups", "ai seo tools comparison", "how to rank in chatgpt"].map(
            (prompt, index) => (
              <div key={prompt} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-50" />
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
          <span className="flex items-center gap-1 text-[9px] font-semibold text-slate-900">
            <TrendingUp className="h-3 w-3" />
            +6.4%
          </span>
        </div>
        <div className="mt-2.5 flex h-2 overflow-hidden rounded-full">
          <span className="w-[43%] bg-slate-50" />
          <span className="w-[31%] bg-blue-400" />
          <span className="w-[26%] bg-violet-400" />
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[8px] text-gray-500">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-50" />
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
            { label: "Your brand", value: 54, color: "bg-slate-50" },
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
                  index === 0 ? "bg-slate-50" : index === 1 ? "bg-blue-500" : index === 2 ? "bg-violet-500" : "bg-gray-400"
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
          <div className="h-full w-[68%] rounded-full bg-slate-50" />
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
                    index === 2 ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-900"
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
              index === 0 ? "bg-slate-50 text-slate-900" : "bg-gray-100 text-gray-400"
            }`}
          >
            <Check className="h-2.5 w-2.5" />
          </span>
          <span className="min-w-0 flex-1 truncate text-[9px] text-gray-600">{task.label}</span>
          <span className="text-[8px] font-semibold text-slate-900">{task.value}</span>
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
        <span className="h-1 w-1 rounded-full bg-slate-50" />
        <span className="mx-auto h-1.5 w-16 rounded-full bg-gray-200" />
      </div>
      <div className="flex bg-[#F9FAFB]">
        <div className="flex w-6 flex-col items-center gap-1.5 border-r border-gray-200 bg-white py-2">
          <span className="h-1.5 w-1.5 rounded-sm bg-slate-50" />
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
              <span className="text-slate-900">+{Math.round(score / 8)}%</span>
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
  const prefersReducedMotion = useReducedMotion();
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [dashboardData, setDashboardData] = useState<LiveDashboardData | null>(null);
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then((res: any) => {
      if (res?.data?.user) {
        setUser(res.data.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user || null);
    });

    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      supabase.auth.getSession().then(({ data }: { data: { session: unknown } }) => {
        if (data.session) router.push("/dashboard");
      });
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  function pickExample(exampleDomain: string) {
    const normalized = normalizeDomain(exampleDomain);
    setDomain(normalized);
    setLoading(true);
    router.push(`/report/${encodeURIComponent(normalized)}`);
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
    router.push(`/report/${encodeURIComponent(normalized)}`);
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#" className="flex items-center gap-2.5" aria-label="AEO Tracker home">
            <LogoMark />
            <span className="font-sans text-[16px] font-bold tracking-tight text-slate-950">
              AEO Tracker
            </span>
          </a>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-medium text-slate-600 transition-colors hover:text-slate-950"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/pricing"
              className="text-xs font-medium text-slate-600 transition-colors hover:text-slate-950"
            >
              Pricing
            </Link>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:text-slate-950"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-slate-800 active:scale-[0.99]"
                >
                  Go to Dashboard
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:text-slate-950"
                >
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-slate-800 active:scale-[0.99]"
                >
                  Get Started
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-2xs transition-colors hover:text-slate-900 lg:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 pb-4 pt-3 shadow-lg lg:hidden">
            <nav className="flex flex-col" aria-label="Mobile navigation">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950"
              >
                Pricing
              </Link>
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-center text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white"
                  >
                    Go to Dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-2 text-center text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white"
                  >
                    Get Started Free
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-white">
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

          <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-20 sm:pt-24 lg:pt-28">
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-slate-50/90 px-3.5 py-1 text-xs font-medium text-slate-700 shadow-2xs"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-50" />
              <span>Enterprise Answer Engine Optimization (AEO) Platform</span>
            </motion.div>

            <motion.h1
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              className="mx-auto mt-6 max-w-4xl font-sans text-[40px] font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl lg:text-[70px]"
            >
              Measure &amp; scale your brand&apos;s visibility in AI answers.
            </motion.h1>

            <motion.p
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              className="mx-auto mt-6 max-w-2xl text-balance text-[15px] font-normal leading-relaxed text-slate-600 sm:text-lg sm:leading-8"
            >
              The authoritative platform to audit citations, benchmark competitor share of voice, and scale commercial recommendations across
              <AiModelRotator />
            </motion.p>

            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.22 }}
              className="mx-auto mt-9 max-w-2xl"
            >
              <form id="analyze" onSubmit={handleAnalyze}>
                <div className="rounded-xl border border-slate-300 bg-white p-1.5 shadow-xs transition-all focus-within:border-slate-800 focus-within:ring-2 focus-within:ring-slate-900/10 sm:flex sm:items-center">
                  <label htmlFor="website-url" className="sr-only">
                    Website URL
                  </label>
                  <div className="flex flex-1 items-center gap-3 px-3 py-2">
                    <Globe2 className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
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
                      placeholder="Enter website domain (e.g. stripe.com)"
                      className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:font-normal placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-xs font-semibold text-white shadow-2xs transition-all hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0 sm:w-auto cursor-pointer"
                  >
                    {loading ? (
                      <LogoLoader variant="mini" text="Scanning Engines..." />
                    ) : (
                      <>
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        <span>Run Audit</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>

                {/* AI Engine Live Operational Status */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { name: 'Google Gemini', model: '2.5 Flash' },
                    { name: 'OpenAI', model: 'ChatGPT-4o' },
                    { name: 'Perplexity', model: 'Sonar Pro' },
                    { name: 'Claude', model: 'Claude 3.7' },
                  ].map((engine) => (
                    <div
                      key={engine.name}
                      className="flex items-center justify-center gap-2 px-3 py-1.5 bg-slate-50/90 border border-slate-200/90 rounded-md text-xs font-medium text-slate-700 shadow-2xs"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-50" />
                      <span className="font-semibold text-slate-800">{engine.name}</span>
                      <span className="text-[11px] text-slate-400 hidden sm:inline">{engine.model}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <span className="mr-1 text-xs font-medium text-slate-500">Quick audits:</span>
                  {heroExamples.map((example) => (
                    <button
                      key={example.name}
                      type="button"
                      onClick={() => pickExample(example.domain)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-2xs transition-all hover:border-slate-300 hover:text-slate-900 cursor-pointer"
                    >
                      <BrandIcon brand={example.name} />
                      {example.name}
                    </button>
                  ))}
                </div>

                <div aria-live="polite">
                  {loading && (
                    <div className="mx-auto mt-5 max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <LogoLoader
                        variant="section"
                        text={`Scanning AI visibility for ${domain || "website"}...`}
                        subtext="Querying Perplexity, ChatGPT, Gemini & Claude models for commercial mentions"
                      />
                    </div>
                  )}

                  {error && (
                    <p className="mt-4 text-xs font-medium text-red-600" role="alert">
                      {error}
                    </p>
                  )}

                  {result && (
                    <div className="mx-auto mt-5 max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-xs">
                      <div className="flex items-center gap-3 p-4">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-900 border border-slate-200">
                          <CheckCircle2 className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900">Analysis complete</p>
                          <p className="truncate text-xs text-slate-500">
                            {result.domain} · Visibility Score{" "}
                            <span className="font-semibold text-slate-800">{result.visibilityScore}/100</span>{" "}
                            · {result.totalMentions} mentions across {result.totalQueries} prompts
                          </p>
                        </div>
                        <Link
                          href={user ? "/dashboard" : "/login"}
                          className="hidden shrink-0 items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 sm:inline-flex"
                        >
                          {user ? "View in Dashboard" : "Unlock report"}
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                      <div className="h-1 w-full bg-slate-100">
                        <div
                          className="h-full bg-slate-50 transition-[width] duration-500"
                          style={{ width: `${Math.min(result.visibilityScore, 100)}%` }}
                        />
                      </div>
                      <a
                        href="#product"
                        className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
                      >
                        Live dashboard telemetry ready
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                          View details
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </a>
                    </div>
                  )}
                </div>

                <p className="mt-4 text-xs text-slate-500">
                  Instant scan · 100% free · No credit card required
                </p>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Social proof */}
        <section className="border-y border-slate-200/80 bg-slate-50/50 py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
              Benchmarking generative visibility across 63,000+ commercial domains
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-70 grayscale transition-all duration-300 hover:opacity-90 hover:grayscale-0 sm:gap-x-14">
              <MailchimpLogo />
              <GoogleAnalyticsLogo />
              <HubSpotLogo />
              <WordPressLogo />
              <CanvaLogo />
            </div>
          </div>
        </section>

        {/* Product dashboard preview */}
        <section id="product" className="relative border-b border-slate-200/80 bg-slate-50/40 py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
              <SectionBadge icon={Sparkles}>Live dashboard telemetry</SectionBadge>
              <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-4xl">
                Every AI signal. One clear view.
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-600">
                Track visibility, sentiment, prompts, and competitors across the engines your
                customers actually use.
              </p>
            </div>
            <DashboardPreview data={dashboardData} isLoading={loading} />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-white py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <SectionBadge icon={Sparkles}>Diagnostic Capabilities</SectionBadge>
              <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-4xl">
                Daily Enterprise Analytics
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-slate-600">
                Continuous tracking of core visibility, prompt attribution, and sentiment across generative search models.
              </p>
            </div>

            <motion.div
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              variants={staggerContainer}
              className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.article
                    key={feature.title}
                    variants={fadeUp}
                    whileHover={
                      prefersReducedMotion
                        ? undefined
                        : { y: -2, transition: { duration: 0.15, ease: "easeOut" } }
                    }
                    className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:border-slate-300 hover:shadow-card-hover"
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200/90 ${feature.tone}`}
                      >
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <ArrowUpRight className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <h3 className="mt-5 font-sans text-base font-bold tracking-tight text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{feature.description}</p>
                    <div className="mt-auto pt-5">
                      <FeatureVisual kind={feature.visual} />
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* How it works + personalised insights */}
        <section id="how-it-works" className="relative overflow-hidden border-y border-slate-200/80 bg-slate-50/50 py-20 sm:py-24">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <div>
                <SectionBadge icon={Globe2}>Methodology</SectionBadge>
                <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  How Generative Engine Optimization Works
                </h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
                  AI engines do not just rank links—they synthesize answers from verified authorities they trust.
                  AEO Tracker aligns your content, citations, and digital footprint so your brand becomes the primary cited source.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    {
                      title: "AI engines aggregate verified sources",
                      description: "They analyze reviews, technical docs, forums, and your digital footprint.",
                    },
                    {
                      title: "They synthesize and cite authoritative brands",
                      description: "Your domain authority and citation frequency determine which brands get recommended.",
                    },
                    {
                      title: "You systematically close citation gaps",
                      description: "Resolve missing entity references and track measurable score improvements daily.",
                    },
                  ].map((step, index) => (
                    <div key={step.title} className="flex items-start gap-3.5">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white font-mono text-xs font-semibold text-slate-700 shadow-2xs">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <AiEngineSwitcher />
              </div>

              <div>
                <SectionBadge icon={Sparkles}>Actionable Intelligence</SectionBadge>
                <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Personalized Diagnostic Insights
                </h2>
                <p className="mt-3 max-w-lg text-sm text-slate-600">
                  Prioritized actions generated directly from your live gap analysis—engineered for measurable impact.
                </p>

                <div className="mt-6 space-y-3">
                  {insights.map((insight) => {
                    const Icon = insight.icon;
                    return (
                      <a
                        key={insight.title}
                        href="#analyze"
                        className="group flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-card transition-all duration-150 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card-hover"
                      >
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 ${insight.tone}`}
                        >
                          <Icon className="h-4 w-4" strokeWidth={2} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-bold tracking-tight text-slate-900">
                              {insight.title}
                            </p>
                            <span className="shrink-0 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                              {insight.impact}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">{insight.description}</p>
                          <div className="mt-2 flex items-center gap-2 text-[10px] font-medium text-slate-500">
                            <span className="flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-50" />
                              {insight.priority}
                            </span>
                            <span>·</span>
                            <span>{insight.time}</span>
                          </div>
                        </div>
                        <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-700" />
                      </a>
                    );
                  })}
                </div>

                <a
                  href="#features"
                  className="group mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  <span>View all 12 prioritized recommendations</span>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                </a>

                {/* Executive Projected Impact Card */}
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-5 text-white shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Projected Impact
                      </p>
                      <p className="mt-1 font-sans text-3xl font-bold tracking-tight text-white">
                        +26 <span className="text-sm font-normal text-slate-400">pts</span>
                      </p>
                    </div>
                    <span className="rounded-md border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-200">
                      30-Day Window
                    </span>
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full w-[68%] rounded-full bg-cyan-400" />
                  </div>
                  <p className="mt-2.5 text-xs text-slate-400">
                    Estimated visibility lift upon completing the top 3 high-priority citation actions.
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
                <SectionBadge icon={Sparkles}>Empirical Benchmarks</SectionBadge>
                <h2 className="mt-4 font-sans text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Industry Audit Examples
                </h2>
                <p className="mt-3 max-w-xl text-base text-slate-600">
                  See how leading brands perform across commercial AI answer engines—and identify immediate market opportunities.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-medium text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-50" />
                Updated weekly
              </span>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {examples.map((example) => (
                <motion.a
                  key={example.brand}
                  href="#analyze"
                  onClick={(event) => {
                    event.preventDefault();
                    pickExample(example.domain);
                  }}
                  aria-label={`Analyze ${example.brand} AI visibility`}
                  whileHover={
                    prefersReducedMotion
                      ? undefined
                      : { y: -2, transition: { duration: 0.15 } }
                  }
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.995 }}
                  className="group rounded-xl border border-slate-200 bg-white p-5 text-left shadow-card transition-all duration-150 hover:border-slate-300 hover:shadow-card-hover"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <BrandIcon brand={example.brand} className="h-8 w-8 rounded-lg text-xs" />
                      <div className="min-w-0">
                        <h3 className="truncate">
                          <BrandWordmark brand={example.brand} />
                        </h3>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">{example.domain}</p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-xs font-semibold ${scoreTone(
                        example.score
                      )}`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {example.score}
                      <span className="font-normal opacity-60">/100</span>
                    </span>
                  </div>

                  <ExamplePreview score={example.score} trend={example.trend} />

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">Run audit</span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white">
                      <ArrowUpRight className="h-3 w-3" />
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA - Executive Slate Container */}
        <section className="bg-white pb-20 pt-4 sm:pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 px-6 py-16 text-center shadow-card-hover sm:px-12 sm:py-20">
              <div className="hero-grid pointer-events-none absolute inset-0 opacity-15" aria-hidden="true" />
              <div className="relative mx-auto max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3.5 py-1 text-xs font-medium text-slate-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-50" />
                  Enterprise Answer Engine Telemetry
                </span>
                <h2 className="mt-6 text-balance font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Be the answer your customers find.
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-300">
                  Join thousands of forward-looking marketing and growth teams using AEO Tracker to measure, audit, and expand visibility across generative search engines.
                </p>
                <div className="mt-8 flex flex-col items-stretch justify-center gap-3.5 sm:flex-row sm:items-center">
                  <Link
                    href={user ? "/dashboard" : "/login"}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-sm transition-all hover:bg-slate-100 hover:shadow-md"
                  >
                    <span>{user ? "Go to Dashboard" : "Start Free Audit"}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition-all hover:bg-slate-800 hover:border-slate-600"
                  >
                    View Pricing Plans
                  </Link>
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    No credit card required
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    Instant multi-model audit
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    SOC-2 compliant data handling
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <a href="#" className="flex items-center gap-2.5" aria-label="AEO Tracker home">
              <LogoMark className="h-7 w-7" />
              <span className="font-sans text-sm font-bold tracking-tight text-slate-900">
                AEO Tracker
              </span>
            </a>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Footer navigation">
              {[
                { label: "Pricing", href: "/pricing" },
                { label: "About", href: "/about" },
                { label: "Compare", href: "/compare" },
                { label: "Blog", href: "/blog" },
                { label: "Contact", href: "/contact" },
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row">
            <p>© 2026 AEO Tracker. All rights reserved.</p>
            <p className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-50" />
              All systems operational · Enterprise telemetry active
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
