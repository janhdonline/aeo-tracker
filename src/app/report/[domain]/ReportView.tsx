'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Bot,
  Sparkles,
  BarChart3,
  ExternalLink,
  Share2,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  FileText,
  Search,
  MessageSquare,
  TrendingUp,
  Settings,
  HelpCircle,
  User,
  Zap,
  X,
  Compass,
} from 'lucide-react';
import type { FullReportData } from '@/lib/report-generator';

interface Props {
  data: FullReportData;
  userEmail?: string | null;
}

export function ReportView({ data, userEmail }: Props) {
  const [activeTab, setActiveTab] = useState<'report' | 'prompts' | 'chatbots' | 'strategy' | 'competitors'>('report');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [modalFeature, setModalFeature] = useState('Daily Analytics & Continuous Tracking');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showDailyBanner, setShowDailyBanner] = useState(true);

  // Accordion toggles
  const [promptsOpen, setPromptsOpen] = useState(true);
  const [productsOpen, setProductsOpen] = useState(true);
  const [chatbotsOpen, setChatbotsOpen] = useState(true);
  const [competitorsOpen, setCompetitorsOpen] = useState(true);
  const [strategyOpen, setStrategyOpen] = useState(true);

  const handleLockedClick = (featureName: string) => {
    setModalFeature(featureName);
    setShowUnlockModal(true);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Circular score progress calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.score / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col antialiased">
      {/* Top Banner Notice */}
      {showDailyBanner && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border-b border-blue-100 px-4 py-2.5 text-xs text-slate-700 flex items-center justify-between shadow-2xs">
          <div className="max-w-7xl mx-auto flex items-center gap-2 flex-1 justify-center sm:justify-start">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
              📊
            </span>
            <span>
              <strong>Daily Analytics:</strong> Start tracking <strong>{data.brandName}</strong>&apos;s visibility, sentiment, and citation rate over time.
            </span>
            <button
              onClick={() => handleLockedClick('Automated Daily Tracking')}
              className="ml-2 font-bold text-blue-700 hover:text-blue-900 underline underline-offset-2 cursor-pointer"
            >
              Start Free Trial ↗
            </button>
          </div>
          <button
            onClick={() => setShowDailyBanner(false)}
            className="text-slate-400 hover:text-slate-600 p-1"
            title="Dismiss notice"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main App Container with Left Slim Rail */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SLIM ICON SIDEBAR (Matches competitor layout) */}
        <aside className="w-14 sm:w-16 bg-white border-r border-slate-200/80 flex flex-col items-center py-4 justify-between shrink-0 select-none z-20">
          <div className="flex flex-col items-center gap-4 w-full">
            {/* Logo Mark */}
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-xs hover:bg-slate-800 transition-colors"
              title="AEO Checker Home"
            >
              <Globe className="h-5 w-5 text-emerald-400" />
            </Link>

            <div className="w-8 h-[1px] bg-slate-200 my-1" />

            {/* Sidebar Navigation Items */}
            <nav className="flex flex-col items-center gap-2 w-full px-2">
              {/* Report (Active) */}
              <button
                onClick={() => {
                  setActiveTab('report');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  activeTab === 'report'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="AEO Report"
              >
                <BarChart3 className="h-5 w-5" />
              </button>

              {/* Tasks / Briefs (Locked) */}
              <button
                onClick={() => handleLockedClick('Actionable Fix Briefs & Tasks')}
                className="relative group flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                title="Tasks & Fix Briefs (Locked)"
              >
                <FileText className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[9px] font-bold ring-2 ring-white">
                  <Lock className="h-2.5 w-2.5" />
                </span>
              </button>

              {/* Key Prompts (Active Scroll) */}
              <button
                onClick={() => {
                  setActiveTab('prompts');
                  scrollToSection('key-prompts-section');
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  activeTab === 'prompts'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Key Prompts Breakdown"
              >
                <MessageSquare className="h-5 w-5" />
              </button>

              {/* Daily Analytics (Locked) */}
              <button
                onClick={() => handleLockedClick('Continuous Daily Analytics')}
                className="relative group flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                title="Daily Analytics (Locked)"
              >
                <TrendingUp className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[9px] font-bold ring-2 ring-white">
                  <Lock className="h-2.5 w-2.5" />
                </span>
              </button>

              {/* AI Chatbots (Active Scroll) */}
              <button
                onClick={() => {
                  setActiveTab('chatbots');
                  scrollToSection('chatbots-section');
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  activeTab === 'chatbots'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="AI Chatbots Analysis"
              >
                <Bot className="h-5 w-5" />
              </button>

              {/* Competitors (Active Scroll) */}
              <button
                onClick={() => {
                  setActiveTab('competitors');
                  scrollToSection('competitors-section');
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  activeTab === 'competitors'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Competitor Landscape Matrix"
              >
                <Layers className="h-5 w-5" />
              </button>

              {/* Strategy & Crawlers (Active Scroll) */}
              <button
                onClick={() => {
                  setActiveTab('strategy');
                  scrollToSection('strategy-section');
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                  activeTab === 'strategy'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Strategy Review & AI Crawlers"
              >
                <Compass className="h-5 w-5" />
              </button>

              {/* Settings (Locked) */}
              <button
                onClick={() => handleLockedClick('Custom Project Settings & Aliases')}
                className="relative group flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                title="Settings (Locked)"
              >
                <Settings className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white text-[9px] font-bold ring-2 ring-white">
                  <Lock className="h-2.5 w-2.5" />
                </span>
              </button>
            </nav>
          </div>

          {/* Bottom Avatar / Profile Button */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleLockedClick('User Profile & Team Settings')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              title={userEmail ? `Signed in as ${userEmail}` : 'Log in to unlock full profile'}
            >
              {userEmail ? (
                <span className="text-xs font-bold uppercase">{userEmail.charAt(0)}</span>
              ) : (
                <User className="h-4 w-4" />
              )}
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar (Breadcrumb & Action Buttons) */}
          <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/" className="hover:text-slate-900 transition-colors">
                AEO Reports
              </Link>
              <span>&gt;</span>
              <span className="text-slate-900 font-bold">Report: {data.domain}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowIssueModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span>Issue</span>
              </button>

              <button
                onClick={() => handleLockedClick('Pro AEO Intelligence Suite')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-95 transition-opacity"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>UPGRADE</span>
              </button>
            </div>
          </header>

          {/* Main Body Canvas */}
          <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            {/* HERO BRAND CARD (Matches competitor screenshot) */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-card">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  {/* Circular Radial Score Progress Ring */}
                  <div className="relative flex items-center justify-center shrink-0">
                    <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        className="text-slate-100"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                      />
                      <circle
                        cx="60"
                        cy="60"
                        r={radius}
                        className="text-emerald-500 transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
                        {data.score}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 -mt-1">/100</span>
                    </div>
                  </div>

                  {/* Brand Meta & Product Chips */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
                        {data.brandName}
                      </h1>
                      <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                        {data.scoreBadge}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {data.scanDate}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                        <Globe className="h-3 w-3 text-slate-400" />
                        {data.region}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 font-semibold">
                        {data.domain}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-600">
                      Industry: <span className="font-normal text-slate-500">{data.industry}</span>
                    </p>

                    {/* Product Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-500 mr-1">Products:</span>
                      {data.products.slice(0, 4).map((p) => (
                        <span
                          key={p}
                          className="rounded-full bg-slate-100 border border-slate-200/60 px-2.5 py-0.5 text-[11px] font-medium text-slate-700"
                        >
                          {p}
                        </span>
                      ))}
                      {data.products.length > 4 && (
                        <span className="text-[11px] font-semibold text-blue-600">
                          +{data.products.length - 4} other products
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Action Button */}
                <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => handleLockedClick('Continuous Daily Tracking')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <span>Start Tracking</span>
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* METRIC RIBBON (4 Stats in a row) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">Products found</span>
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="font-display text-2xl font-bold text-slate-900">{data.productsFoundPct}%</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">Your products</span>
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="font-display text-2xl font-bold text-slate-900">{data.yourProductsPct}%</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">Competitor products</span>
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="font-display text-2xl font-bold text-slate-900">{data.competitorProductsPct}%</p>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-1">
                  <span className="text-xs font-semibold">Your Best Product</span>
                  <Info className="h-3.5 w-3.5 text-slate-400" />
                </div>
                <p className="font-display text-sm font-bold text-slate-900 truncate" title={data.bestProduct}>
                  {data.bestProduct}
                </p>
              </div>
            </div>

            {/* 4 CORE ANALYSIS CARDS (2x2 Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: AI Presence */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-slate-900">AI Presence</h3>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    {data.aiPresenceScore}
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white text-[10px]">
                        GPT
                      </span>
                      <span>ChatGPT-4o</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-slate-900">{data.aiModels.chatgpt.score}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
                        G
                      </span>
                      <span>Google Gemini</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-slate-900">{data.aiModels.gemini.score}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-white text-[10px]">
                        C
                      </span>
                      <span>Anthropic Claude</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-slate-900">{data.aiModels.claude.score}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white text-[10px]">
                        P
                      </span>
                      <span>Perplexity AI</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-slate-900">{data.aiModels.perplexity.score}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => scrollToSection('chatbots-section')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    View all 6 engines ▾
                  </button>
                  <span className="text-[11px] text-slate-400">Real-time LLM grounding</span>
                </div>
              </div>

              {/* Card 2: Key Prompts */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-slate-900">Key Prompts</h3>
                  <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-bold text-amber-700">
                    {data.keyPromptsScore}
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {data.prompts.slice(0, 2).map((p) => (
                    <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-800 line-clamp-1">{p.prompt}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.coveragePct > 50
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {p.coveragePct}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${p.coveragePct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => scrollToSection('key-prompts-section')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    View prompt breakdowns ▾
                  </button>
                  <span className="text-[11px] text-slate-400">Commercial buyer intent</span>
                </div>
              </div>

              {/* Card 3: Competitor Landscape */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-slate-900">Competitor Landscape</h3>
                  <span className="rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-xs font-bold text-purple-700">
                    {data.competitorLandscapeScore}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Your brand was included in <strong>6 out of 6</strong> industry and category recommendation queries.
                </p>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Competitors Mentioned:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {data.competitorNames.slice(0, 6).map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-700"
                      >
                        {c}
                      </span>
                    ))}
                    {data.competitorNames.length > 6 && (
                      <span className="rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                        +{data.competitorNames.length - 6} others...
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => scrollToSection('competitors-section')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    Explore 2D matrix ▾
                  </button>
                  <span className="text-[11px] text-slate-400">Share of Voice</span>
                </div>
              </div>

              {/* Card 4: Strategy Review */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-slate-900">Strategy Review</h3>
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                    {data.strategyReviewScore}
                  </span>
                </div>

                <div className="space-y-2.5 pt-1 text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-700">Answerability</span>
                      <span className="font-bold text-slate-900">{data.strategy.answerability.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${data.strategy.answerability.score}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-700">Structured Data Schema</span>
                      <span className="font-bold text-slate-900">{data.strategy.structuredData.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${data.strategy.structuredData.score}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-700">AI Crawler Accessibility</span>
                      <span className="font-bold text-slate-900">{data.strategy.crawlerAccessibility.score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${data.strategy.crawlerAccessibility.score}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => scrollToSection('strategy-section')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800"
                  >
                    View audit details ▾
                  </button>
                  <span className="text-[11px] text-slate-400">Technical AEO</span>
                </div>
              </div>
            </div>

            {/* 90-DAY TRAJECTORY AREA CHART CARD */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-card relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    Grow your AEO in just 90 days
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    By <strong>{data.trajectory90DaysDate}</strong> you&apos;ll be <strong>{data.trajectoryMultiplier}x</strong> more visible to AI chatbots.
                  </p>
                </div>
                <button
                  onClick={() => handleLockedClick('90-Day Optimization Roadmap')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                >
                  Start Free Trial ↗
                </button>
              </div>

              {/* Area Chart SVG */}
              <div className="relative h-44 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 800 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="trajectoryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guideline */}
                  <line x1="0" y1="20" x2="800" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                  <line x1="0" y1="80" x2="800" y2="80" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
                  <line x1="0" y1="140" x2="800" y2="140" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />

                  {/* Area fill */}
                  <path
                    d="M 0 110 Q 200 95, 400 65 T 800 25 L 800 160 L 0 160 Z"
                    fill="url(#trajectoryGrad)"
                  />
                  {/* Top stroke curve */}
                  <path
                    d="M 0 110 Q 200 95, 400 65 T 800 25"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Benchmark Marker Dots */}
                  <circle cx="0" cy="110" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="800" cy="25" r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />
                </svg>

                {/* Left and Right Legend Labels */}
                <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2 px-1">
                  <span>Day 1: Baseline ({data.score}/100)</span>
                  <span>Day 45: Mid-Trajectory</span>
                  <span className="text-emerald-700 font-bold">Day 90: Target (84/100)</span>
                </div>
              </div>
            </div>

            {/* FULL REPORT ACCORDION: KEY PROMPTS DEEP DIVE */}
            <div id="key-prompts-section" className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-card">
              <button
                onClick={() => setPromptsOpen(!promptsOpen)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700 text-xs font-bold">
                    50
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">Key Prompts</h3>
                    <p className="text-xs text-slate-500">How AI models answer commercial buyer queries for your sector</p>
                  </div>
                </div>
                {promptsOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </button>

              {promptsOpen && (
                <div className="p-6 pt-0 space-y-6 border-t border-slate-100">
                  {/* Metric Strip for Prompts */}
                  <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase">Overview Presence</p>
                      <p className="text-xl font-extrabold text-slate-900 mt-0.5">100%</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase">Brand Mentions</p>
                      <p className="text-xl font-extrabold text-emerald-600 mt-0.5">50%</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase">Site Citations</p>
                      <p className="text-xl font-extrabold text-blue-600 mt-0.5">35%</p>
                    </div>
                  </div>

                  {/* Individual Prompt Details */}
                  {data.prompts.map((p) => (
                    <div key={p.id} className="rounded-2xl border border-slate-200 p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h4 className="font-display text-sm font-bold text-slate-900">&ldquo;{p.prompt}&rdquo;</h4>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 self-start sm:self-auto">
                          <CheckCircle2 className="h-3 w-3" />
                          {p.status}
                        </span>
                      </div>

                      {/* Google AI Overview Box */}
                      <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px]">
                            G
                          </span>
                          <span>AI Overview Response</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed font-sans">{p.overviewAnswer}</p>

                        {/* Direct Cited Sources */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-blue-100/60">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                            Cited Sources:
                          </span>
                          {p.sources.map((s) => (
                            <span
                              key={s}
                              className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-600"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Multi-Model Breakdown */}
                      <div className="space-y-2">
                        {p.modelResponses.map((mr) => (
                          <div key={mr.model} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{mr.model}</span>
                              <span className="text-[10px] text-emerald-700 font-bold">Mention Verified</span>
                            </div>
                            <p className="text-slate-600">{mr.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Query Fanout Opportunities */}
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-display text-sm font-bold text-slate-900">Query Fanout Opportunities</h4>
                        <p className="text-[11px] text-slate-500">
                          Follow-up searches AI models execute to answer buyer queries, and how to capture them.
                        </p>
                      </div>
                      <span className="text-xs font-bold text-blue-600">4 Opportunities</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.fanoutOpportunities.map((fo) => (
                        <div key={fo.query} className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                              {fo.type}
                            </span>
                            <span className="text-xs font-bold text-slate-700">{fo.confidence}% confidence</span>
                          </div>
                          <p className="text-xs font-bold text-slate-900 leading-snug">{fo.query}</p>
                          <p className="text-[11px] text-slate-500 leading-relaxed">{fo.recommendedAngle}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FULL REPORT ACCORDION: PRODUCTS VISIBILITY */}
            <div className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-card">
              <button
                onClick={() => setProductsOpen(!productsOpen)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-xs font-bold">
                    8
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">Products & Offerings</h3>
                    <p className="text-xs text-slate-500">Ranking of your products vs competitor products in AI answers</p>
                  </div>
                </div>
                {productsOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </button>

              {productsOpen && (
                <div className="p-6 pt-0 space-y-4 border-t border-slate-100">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                          <th className="py-2.5">Rank</th>
                          <th className="py-2.5">Product Name</th>
                          <th className="py-2.5">Brand</th>
                          <th className="py-2.5 text-right">Share</th>
                          <th className="py-2.5 text-right">Mentions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.productRankings.map((p) => (
                          <tr key={p.rank} className={p.isYourProduct ? 'bg-emerald-50/40 font-semibold' : ''}>
                            <td className="py-3 font-bold text-slate-800">#{p.rank}</td>
                            <td className="py-3 text-slate-900">{p.name}</td>
                            <td className="py-3 text-slate-600">{p.brand}</td>
                            <td className="py-3 text-right text-emerald-700 font-bold">{p.share}%</td>
                            <td className="py-3 text-right text-slate-700">{p.mentions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* FULL REPORT ACCORDION: AI CHATBOTS TABLE */}
            <div id="chatbots-section" className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-card">
              <button
                onClick={() => setChatbotsOpen(!chatbotsOpen)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold">
                    95
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">AI Chatbots Information Analysis</h3>
                    <p className="text-xs text-slate-500">Breakdown across OpenAI, Gemini, Claude, Perplexity, Grok, and DeepSeek</p>
                  </div>
                </div>
                {chatbotsOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </button>

              {chatbotsOpen && (
                <div className="p-6 pt-0 space-y-4 border-t border-slate-100">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                          <th className="py-2.5">Engine / Model</th>
                          <th className="py-2.5">Name Recognized</th>
                          <th className="py-2.5">Industry Recognized</th>
                          <th className="py-2.5">Uncertainty</th>
                          <th className="py-2.5 text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {data.aiChatbotsTable.map((m) => (
                          <tr key={`${m.name}-${m.subModel}`}>
                            <td className="py-3 font-semibold text-slate-900">
                              {m.name} · <span className="font-normal text-slate-500">{m.subModel}</span>
                            </td>
                            <td className="py-3">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            </td>
                            <td className="py-3">
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            </td>
                            <td className="py-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  m.uncertainty === 'None'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {m.uncertainty}
                              </span>
                            </td>
                            <td className="py-3 text-right font-bold text-slate-900">{m.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* FULL REPORT ACCORDION: COMPETITOR 2D MATRIX */}
            <div id="competitors-section" className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-card">
              <button
                onClick={() => setCompetitorsOpen(!competitorsOpen)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700 text-xs font-bold">
                    50
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">Competitive Matrix</h3>
                    <p className="text-xs text-slate-500">Mention rate against sentiment of captured AI answers</p>
                  </div>
                </div>
                {competitorsOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </button>

              {competitorsOpen && (
                <div className="p-6 pt-0 space-y-6 border-t border-slate-100">
                  {/* 2D Scatter Matrix SVG */}
                  <div className="relative border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                    <div className="h-64 w-full relative">
                      {/* Grid Quadrants */}
                      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                        <div className="border-r border-b border-slate-200 p-2 text-[10px] font-bold text-slate-400">
                          Loved, less visible
                        </div>
                        <div className="border-b border-slate-200 p-2 text-right text-[10px] font-bold text-emerald-700 bg-emerald-50/30">
                          ★ Leaders (High Visibility & Sentiment)
                        </div>
                        <div className="border-r border-slate-200 p-2 text-[10px] font-bold text-slate-400 flex items-end">
                          Emerging
                        </div>
                        <div className="p-2 text-right text-[10px] font-bold text-slate-400 flex items-end justify-end">
                          Visible, weaker sentiment
                        </div>
                      </div>

                      {/* Brand Dots */}
                      {data.competitorDots.map((dot) => {
                        const left = `${Math.min(92, Math.max(8, dot.mentionRate * 1.4))}%`;
                        const bottom = `${Math.min(90, Math.max(10, dot.sentiment))}%`;
                        return (
                          <div
                            key={dot.name}
                            style={{ left, bottom }}
                            className="absolute -translate-x-1/2 translate-y-1/2 flex items-center gap-1.5 group cursor-pointer z-10"
                          >
                            <span
                              className={`flex h-6 w-6 items-center justify-center rounded-full text-white text-[10px] font-bold shadow-sm ring-2 ring-white ${
                                dot.isYourBrand ? 'bg-emerald-600 ring-emerald-300 scale-125' : 'bg-indigo-600'
                              }`}
                            >
                              {dot.name.charAt(0)}
                            </span>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-2xs ${
                                dot.isYourBrand
                                  ? 'bg-slate-900 text-white'
                                  : 'bg-white border border-slate-200 text-slate-700'
                              }`}
                            >
                              {dot.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-4 pt-2 border-t border-slate-200">
                      <span>Low Mention Rate &larr;</span>
                      <span className="text-slate-600 font-bold">Mention Rate (Share of Voice)</span>
                      <span>&rarr; High Mention Rate</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FULL REPORT ACCORDION: STRATEGY & AI CRAWLER ACCESSIBILITY */}
            <div id="strategy-section" className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-card">
              <button
                onClick={() => setStrategyOpen(!strategyOpen)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-700 text-xs font-bold">
                    75
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">Strategy Review & AI Crawlers</h3>
                    <p className="text-xs text-slate-500">Structured data, semantic tags, Reddit presence, and robots.txt accessibility</p>
                  </div>
                </div>
                {strategyOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
              </button>

              {strategyOpen && (
                <div className="p-6 pt-0 space-y-6 border-t border-slate-100 text-xs">
                  {/* Content Answerability */}
                  <div className="space-y-2">
                    <h4 className="font-display text-sm font-bold text-slate-900">Content Answerability</h4>
                    <p className="text-slate-500 text-[11px]">
                      Measures whether your content is concise, factual, and formatted with data points for LLMs.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-700">Good Length</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-700">Conversational</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-700">Statistics</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-700">Citations</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  {/* Web Presence Footprint */}
                  <div className="space-y-2">
                    <h4 className="font-display text-sm font-bold text-slate-900">Web Presence Footprint</h4>
                    <p className="text-slate-500 text-[11px]">
                      Checks your footprint on Reddit, Wikipedia, YouTube, and X where LLMs collect consensus evidence.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-700">Wikipedia</span>
                        <span className="font-bold text-emerald-700">Found ✓</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-700">Reddit Score</span>
                        <span className="font-bold text-slate-900">{data.strategy.webPresence.redditScore}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-700">X / Twitter</span>
                        <span className="font-bold text-slate-500">{data.strategy.webPresence.xScore}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-700">YouTube</span>
                        <span className="font-bold text-slate-500">{data.strategy.webPresence.youtubeScore}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Crawler Accessibility */}
                  <div className="space-y-2">
                    <h4 className="font-display text-sm font-bold text-slate-900">AI Crawler Accessibility</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-700">Sitemap (sitemap.xml)</span>
                        <span className="text-emerald-700 font-bold">Valid ✓</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-700">Robots.txt (GPTBot/ClaudeBot)</span>
                        <span className="text-emerald-700 font-bold">Allowed ✓</span>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between">
                        <span className="font-medium text-slate-700">llms.txt AI Knowledge File</span>
                        <span className="text-amber-700 font-bold">Missing (Action Item)</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-700">Pre-rendered HTML Text</span>
                        <span className="text-emerald-700 font-bold">Supported ✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* BOTTOM CONVERSION CTA CARD */}
            <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-400">
                  <Sparkles className="h-3 w-3" />
                  Automated Daily AEO Monitoring
                </div>
                <h3 className="font-display text-2xl font-bold tracking-tight">
                  Track {data.domain}&apos;s AEO Trajectory Over Time
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Unlock daily scans, receive weekly email digests, get alert notifications for AI hallucinations, and benchmark against up to 10 competitors automatically.
                </p>
              </div>

              <button
                onClick={() => handleLockedClick('Full Continuous AEO Suite')}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-xs font-bold text-slate-950 shadow-md hover:bg-slate-100 transition-all cursor-pointer shrink-0"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-4 w-4 text-emerald-600" />
              </button>
            </div>
          </main>
        </div>
      </div>

      {/* UNLOCK / UPGRADE CONVERSION MODAL */}
      <AnimatePresence>
        {showUnlockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="max-w-md w-full rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative"
            >
              <button
                onClick={() => setShowUnlockModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xs">
                  <Zap className="h-6 w-6 text-emerald-400 fill-current" />
                </span>
                <div>
                  <h4 className="font-display text-lg font-bold text-slate-900">Unlock Premium Feature</h4>
                  <p className="text-xs text-slate-500">{modalFeature}</p>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Daily automated scans for {data.domain}</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>50+ commercial buyer prompts monitored</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Real-time competitor citation leak alerts</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Automated weekly PDF & email digests</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <Link
                  href={`/login?domain=${encodeURIComponent(data.domain)}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
                >
                  <span>Sign In / Create Profile to Unlock</span>
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                </Link>

                <Link
                  href="/pricing"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span>View All Subscription Plans</span>
                </Link>
              </div>

              <p className="text-[11px] text-center text-slate-400">
                No credit card required for initial setup · Instant activation
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT ISSUE FEEDBACK MODAL */}
      <AnimatePresence>
        {showIssueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 relative"
            >
              <button
                onClick={() => setShowIssueModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h4 className="font-display text-base">Report Data Discrepancy</h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Notice an issue with the AI citations or entity recognition for <strong>{data.domain}</strong>? Our crawler re-indexes every 7 days.
              </p>

              <textarea
                placeholder="Describe the issue or hallucinated citations..."
                className="w-full h-24 rounded-xl border border-slate-200 p-3 text-xs focus:outline-none focus:border-slate-900"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowIssueModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowIssueModal(false);
                    alert('Thank you! Your feedback has been queued for engine calibration.');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Submit Issue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
