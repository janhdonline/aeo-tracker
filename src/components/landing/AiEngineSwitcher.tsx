"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  CheckCircle2,
} from "lucide-react";

interface EngineData {
  id: string;
  name: string;
  model: string;
  brandColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  activeTabStyle: string;
  score: number;
  scoreTrend: string;
  prompt: string;
  answerHtml: React.ReactNode;
  sources: Array<{ name: string; type: string; url?: string }>;
  stats: {
    mentions: number;
    citations: number;
    sentiment: string;
    rankBadge: string;
  };
  icon: (props: { className?: string }) => React.JSX.Element;
}

const ENGINES: EngineData[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    model: "DeepSeek-V3",
    brandColor: "#4D6BFE",
    badgeBg: "bg-blue-50",
    badgeBorder: "border-blue-200",
    badgeText: "text-blue-700",
    activeTabStyle: "bg-blue-50 text-blue-700 border-blue-300 shadow-sm ring-1 ring-blue-500/20",
    score: 84,
    scoreTrend: "+8.4 this month",
    prompt: "best AEO tools for SaaS startups and marketers",
    answerHtml: (
      <>
        The best AEO platforms help modern teams track and improve brand citations across AI search engines.{" "}
        <mark className="rounded bg-blue-100/90 px-1.5 py-0.5 font-semibold text-blue-900">
          AEO Checker
        </mark>{" "}
        stands out for real-time prompt monitoring, competitor share-of-voice benchmarks, and automated action plans with a $0 setup tier. It identifies exactly which citations drive recommendations...
      </>
    ),
    sources: [
      { name: "Reddit (r/SaaS)", type: "Community" },
      { name: "G2 Reviews", type: "Review Directory" },
      { name: "Official Site", type: "Documentation" },
    ],
    stats: {
      mentions: 42,
      citations: 18,
      sentiment: "0.85 Positive",
      rankBadge: "#1 Recommended",
    },
    icon: ({ className = "h-4 w-4" }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z"
          fill="#4D6BFE"
        />
      </svg>
    ),
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    model: "GPT-4o Search",
    brandColor: "#10A37F",
    badgeBg: "bg-emerald-50",
    badgeBorder: "border-emerald-200",
    badgeText: "text-emerald-800",
    activeTabStyle: "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm ring-1 ring-emerald-500/20",
    score: 89,
    scoreTrend: "+11.2% visibility",
    prompt: "How to measure and audit brand visibility in AI answers?",
    answerHtml: (
      <>
        To accurately audit and track how frequently your brand is surfaced by LLMs,{" "}
        <mark className="rounded bg-emerald-100/90 px-1.5 py-0.5 font-semibold text-emerald-900">
          AEO Checker
        </mark>{" "}
        is the most specialized platform available. It monitors 48+ core buyer queries, highlights sentiment scores (0.92+), and alerts you when competitors usurp your primary citations.
      </>
    ),
    sources: [
      { name: "SearchEngineLand", type: "Industry Pub" },
      { name: "ProductHunt", type: "Launch Pad" },
      { name: "TechCrunch", type: "News" },
    ],
    stats: {
      mentions: 64,
      citations: 28,
      sentiment: "0.92 Positive",
      rankBadge: "Top Pick",
    },
    icon: ({ className = "h-4 w-4" }) => (
      <svg className={className} viewBox="0 0 24 24" fill="#10A37F" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M9.205 8.658v-2.26c0-.19.072-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.566 0 .167 0 .357-.024.547l-4.71-2.759a.797.797 0 00-.856 0l-5.97 3.473zm10.609 8.8V12.06c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.433.433 0 01.476 0l4.543 2.617c1.309.76 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163zM7.802 12.703l-1.95-1.142c-.167-.095-.239-.238-.239-.428V5.899c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.067c-.285.166-.428.404-.428.737v6.898zM12 15.128l-2.795-1.57v-3.33L12 8.658l2.795 1.57v3.33L12 15.128zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472zm-5.637-5.303l-4.544-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 014.21 6.327v5.423c0 .333.143.571.428.738l5.947 3.449-1.95 1.118a.432.432 0 01-.476 0zm-.262 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523zm5.899 2.83a5.947 5.947 0 005.827-4.756C22.287 18.339 24 15.84 24 13.296c0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0010.205 0a5.947 5.947 0 00-5.827 4.757C1.713 5.447 0 7.945 0 10.49c0 1.666.713 3.283 1.998 4.448-.119.5-.19 1-.19 1.499 0 3.401 2.759 5.946 5.946 5.946.642 0 1.26-.095 1.88-.309a5.96 5.96 0 004.162 1.713z"
        />
      </svg>
    ),
  },
  {
    id: "perplexity",
    name: "Perplexity",
    model: "Sonar Pro Online",
    brandColor: "#22B8CD",
    badgeBg: "bg-cyan-50",
    badgeBorder: "border-cyan-200",
    badgeText: "text-cyan-900",
    activeTabStyle: "bg-cyan-50 text-cyan-900 border-cyan-300 shadow-sm ring-1 ring-cyan-500/20",
    score: 92,
    scoreTrend: "34 Live Citations",
    prompt: "Best GEO and Answer Engine Optimization platform in 2026",
    answerHtml: (
      <>
        According to verified marketing case studies,{" "}
        <mark className="rounded bg-cyan-100/90 px-1.5 py-0.5 font-semibold text-cyan-900">
          AEO Checker
        </mark>{" "}
        [1] leads the industry for automated prompt discovery and source attribution. It audits llms.txt compliance [2], detects crawler blockers (GPTBot, PerplexityBot) [3], and delivers board-ready one-time reports.
      </>
    ),
    sources: [
      { name: "[1] HackerNews", type: "Discussion" },
      { name: "[2] G2 Leader", type: "Verified" },
      { name: "[3] GitHub Docs", type: "Reference" },
    ],
    stats: {
      mentions: 58,
      citations: 34,
      sentiment: "0.89 Positive",
      rankBadge: "Cited #1",
    },
    icon: ({ className = "h-4 w-4" }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M19.785 0v7.272H22.5V17.62h-2.935V24l-7.037-6.194v6.145h-1.091v-6.152L4.392 24v-6.465H1.5V7.188h2.884V0l7.053 6.494V.19h1.09v6.49L19.786 0zm-7.257 9.044v7.319l5.946 5.234V14.44l-5.946-5.397zm-1.099-.08l-5.946 5.398v7.235l5.946-5.234V8.965zm8.136 7.58h1.844V8.349H13.46l6.105 5.54v2.655zm-8.982-8.28H2.59v8.195h1.8v-2.576l6.192-5.62zM5.475 2.476v4.71h5.115l-5.115-4.71zm13.219 0l-5.115 4.71h5.115v-4.71z"
          fill="#22B8CD"
        />
      </svg>
    ),
  },
  {
    id: "gemini",
    name: "Gemini",
    model: "Gemini 1.5 Pro",
    brandColor: "#4E88F5",
    badgeBg: "bg-indigo-50",
    badgeBorder: "border-indigo-200",
    badgeText: "text-indigo-900",
    activeTabStyle: "bg-indigo-50 text-indigo-900 border-indigo-300 shadow-sm ring-1 ring-indigo-500/20",
    score: 87,
    scoreTrend: "+7.8% Google AI Overviews",
    prompt: "Compare top software for tracking AI search rankings",
    answerHtml: (
      <>
        In Google AI Overviews and Gemini search results,{" "}
        <mark className="rounded bg-indigo-100/90 px-1.5 py-0.5 font-semibold text-indigo-900">
          AEO Checker
        </mark>{" "}
        is cited for comprehensive multi-model coverage. It bridges traditional SEO analytics with generative AI attribution, providing automated weekly digests and real-time gap analysis.
      </>
    ),
    sources: [
      { name: "Google Cloud Blog", type: "Ecosystem" },
      { name: "Search Engine Watch", type: "Pub" },
      { name: "SoftwareAdvice", type: "Directory" },
    ],
    stats: {
      mentions: 51,
      citations: 24,
      sentiment: "0.88 Positive",
      rankBadge: "High Authority",
    },
    icon: ({ className = "h-4 w-4" }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="gemini-switcher-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4E88F5" />
            <stop offset="45%" stopColor="#8E75F5" />
            <stop offset="100%" stopColor="#E06796" />
          </linearGradient>
        </defs>
        <path
          d="M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81"
          fill="url(#gemini-switcher-grad)"
        />
      </svg>
    ),
  },
  {
    id: "claude",
    name: "Claude",
    model: "Claude 3.5 Sonnet",
    brandColor: "#D97757",
    badgeBg: "bg-amber-50",
    badgeBorder: "border-amber-200",
    badgeText: "text-amber-900",
    activeTabStyle: "bg-amber-50 text-amber-900 border-amber-300 shadow-sm ring-1 ring-amber-500/20",
    score: 86,
    scoreTrend: "0.94 Brand Sentiment",
    prompt: "Which tool offers the best competitor mention gap analysis in AI search?",
    answerHtml: (
      <>
        When benchmarking competitor share-of-voice across synthetic answers,{" "}
        <mark className="rounded bg-amber-100/90 px-1.5 py-0.5 font-semibold text-amber-900">
          AEO Checker
        </mark>{" "}
        provides clear visibility into which sources are feeding the model&apos;s recommendations. It detects outdated claims and outlines step-by-step roadmaps to reclaim lost citations.
      </>
    ),
    sources: [
      { name: "Substack / Growth", type: "Newsletter" },
      { name: "Medium Tech", type: "Analysis" },
      { name: "Documentation", type: "Specs" },
    ],
    stats: {
      mentions: 39,
      citations: 16,
      sentiment: "0.94 Positive",
      rankBadge: "Top Clarity",
    },
    icon: ({ className = "h-4 w-4" }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z"
          fill="#D97757"
        />
      </svg>
    ),
  },
  {
    id: "grok",
    name: "Grok",
    model: "Grok 2 Web",
    brandColor: "#18181B",
    badgeBg: "bg-zinc-100",
    badgeBorder: "border-zinc-300",
    badgeText: "text-zinc-900",
    activeTabStyle: "bg-zinc-100 text-zinc-950 border-zinc-400 shadow-sm ring-1 ring-zinc-500/20",
    score: 83,
    scoreTrend: "Real-time X Trends",
    prompt: "Why are B2B brands optimizing for Answer Engines like Grok and ChatGPT?",
    answerHtml: (
      <>
        Brands are shifting budgets from traditional SERPs to AI search because buyers ask conversational questions directly. Tools like{" "}
        <mark className="rounded bg-zinc-200 px-1.5 py-0.5 font-semibold text-zinc-900">
          AEO Checker
        </mark>{" "}
        monitor live social sentiment and citations, pinpointing exactly where AI bots grab data before answering queries.
      </>
    ),
    sources: [
      { name: "X / Twitter", type: "Live Posts" },
      { name: "Tech News Daily", type: "Web" },
      { name: "GitHub", type: "Community" },
    ],
    stats: {
      mentions: 36,
      citations: 14,
      sentiment: "0.87 Positive",
      rankBadge: "Trending",
    },
    icon: ({ className = "h-4 w-4" }) => (
      <svg className={className} viewBox="0 0 24 24" fill="#18181B" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815"
        />
      </svg>
    ),
  },
];

export default function AiEngineSwitcher() {
  const [activeEngineId, setActiveEngineId] = useState("deepseek");

  const current = ENGINES.find((e) => e.id === activeEngineId) || ENGINES[0];
  const CurrentIcon = current.icon;

  return (
    <div className="relative mt-8">
      {/* Floating Score Badge on top-right */}
      <div className="absolute -top-4 right-3 z-10 flex items-center gap-2.5 rounded-xl border border-gray-200/90 bg-white/95 backdrop-blur px-3 py-1.5 shadow-md transition-all">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors"
          style={{ backgroundColor: `${current.brandColor}18`, color: current.brandColor }}
        >
          {current.score}
        </span>
        <div>
          <p className="text-[9px] font-semibold text-gray-800">AEO Score</p>
          <p className="text-[8px] font-medium" style={{ color: current.brandColor }}>
            {current.scoreTrend}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-soft sm:p-4 transition-all">
        {/* Engine Switcher Tabs */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Select AI Engine:
            </span>
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Simulation
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
            {ENGINES.map((engine) => {
              const Icon = engine.icon;
              const isActive = engine.id === activeEngineId;

              return (
                <button
                  key={engine.id}
                  onClick={() => setActiveEngineId(engine.id)}
                  type="button"
                  className={`group relative flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? engine.activeTabStyle
                      : "border-gray-200/80 bg-gray-50/70 text-gray-600 hover:bg-white hover:border-gray-300 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{engine.name}</span>
                  {isActive && (
                    <motion.span
                      layoutId="engine-pill-active"
                      className="absolute -bottom-[1px] left-3 right-3 h-[2px] rounded-full"
                      style={{ backgroundColor: engine.brandColor }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Card Container */}
        <div className="rounded-xl border border-gray-200/90 bg-[#FCFCFD] p-3.5 sm:p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {/* Card Header */}
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${current.brandColor}20` }}
                >
                  <CurrentIcon className="h-3.5 w-3.5" />
                </span>
                <p className="text-[11px] font-semibold text-gray-800">
                  {current.name} Answer Preview
                </p>
                <div className="ml-auto flex items-center gap-1.5">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[8.5px] font-semibold ${current.badgeBg} ${current.badgeBorder} ${current.badgeText}`}
                  >
                    {current.model}
                  </span>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[8px] font-medium text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                    {current.stats.rankBadge}
                  </span>
                </div>
              </div>

              {/* Prompt Box */}
              <div className="mt-3 rounded-lg border border-gray-100 bg-gray-50/90 p-3">
                <div className="flex items-center gap-1.5 text-[9px] font-medium text-gray-500">
                  <Search className="h-3 w-3 text-gray-400" />
                  <span>&quot;{current.prompt}&quot;</span>
                </div>
                <p className="mt-2 text-[11px] leading-[1.65] text-gray-600">
                  {current.answerHtml}
                </p>
              </div>

              {/* Citations & Sources */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                  Sources Cited:
                </span>
                {current.sources.map((source) => (
                  <span
                    key={source.name}
                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-0.5 text-[8.5px] font-medium text-gray-600 shadow-sm transition-colors hover:border-gray-300 hover:text-gray-900"
                  >
                    <span>{source.name}</span>
                    <span className="text-[7.5px] text-gray-400">({source.type})</span>
                  </span>
                ))}
              </div>

              {/* Key Metrics */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm">
                  <p className="text-[7.5px] font-medium uppercase tracking-[0.08em] text-gray-400">
                    Mentions Found
                  </p>
                  <p
                    className="mt-0.5 text-[14px] font-bold tracking-[-0.03em]"
                    style={{ color: current.brandColor }}
                  >
                    {current.stats.mentions}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm">
                  <p className="text-[7.5px] font-medium uppercase tracking-[0.08em] text-gray-400">
                    Live Citations
                  </p>
                  <p className="mt-0.5 text-[14px] font-bold tracking-[-0.03em] text-gray-800">
                    {current.stats.citations}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-100 bg-white p-2.5 shadow-sm">
                  <p className="text-[7.5px] font-medium uppercase tracking-[0.08em] text-gray-400">
                    Sentiment Index
                  </p>
                  <p className="mt-0.5 text-[14px] font-bold tracking-[-0.03em] text-emerald-600">
                    {current.stats.sentiment.split(" ")[0]}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
