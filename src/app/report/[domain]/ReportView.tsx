'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  Globe,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  BarChart3,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Calendar,
  Layers,
  FileText,
  MessageSquare,
  TrendingUp,
  Settings,
  User,
  Zap,
  X,
  Compass,
  Package,
  PanelLeftClose,
  PanelLeft,
  Link2,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { ScoreBreakdown } from '@/components/ScoreBreakdown';
import { SuggestedFixesCard } from '@/components/SuggestedFixesCard';
import { AIBotAccessMatrix } from '@/components/AIBotAccessMatrix';
import { PlatformOptimizationTabs } from '@/components/PlatformOptimizationTabs';
import { PageCitabilityTable } from '@/components/PageCitabilityTable';
import { ScoreHistoryTimeline } from '@/components/ScoreHistoryTimeline';
import type { FullReportData } from '@/lib/report-generator';

interface Props {
  data: FullReportData;
  userEmail?: string | null;
  userPlan?: string | null;
}

// ============================================================================
// 1. BRAND & AI ENGINE HIGH-FIDELITY SVG ICONS
// ============================================================================

function OpenAIIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66v.009zM8.307 13.916l-2.02-1.164a.08.08 0 0 1-.038-.057V7.11a4.5 4.5 0 0 1 7.37-3.453l-.142.08L8.7 6.5a.795.795 0 0 0-.393.681zm1.096-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.612-1.5z" />
    </svg>
  );
}

function GeminiIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z" />
    </svg>
  );
}

function ClaudeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M4.5 10.5C3.67 10.5 3 11.17 3 12s.67 1.5 1.5 1.5h2.25c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5H4.5zm12.75 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h2.25c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5h-2.25zM12 3c-.83 0-1.5.67-1.5 1.5v2.25c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V4.5c0-.83-.67-1.5-1.5-1.5zm0 12.75c-.83 0-1.5.67-1.5 1.5v2.25c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-2.25c0-.83-.67-1.5-1.5-1.5zm-5.3 2.58a1.5 1.5 0 0 0-2.12 2.12l1.6 1.6a1.5 1.5 0 0 0 2.12-2.12l-1.6-1.6zm10.6-10.6a1.5 1.5 0 0 0-2.12 2.12l1.6 1.6a1.5 1.5 0 0 0 2.12-2.12l-1.6-1.6zM6.7 5.72a1.5 1.5 0 0 0-2.12-2.12l-1.6 1.6a1.5 1.5 0 0 0 2.12 2.12l1.6-1.6zm10.6 10.6a1.5 1.5 0 0 0-2.12-2.12l-1.6 1.6a1.5 1.5 0 0 0 2.12 2.12l1.6-1.6z" />
    </svg>
  );
}

function PerplexityIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" />
    </svg>
  );
}

function GrokIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function XIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} text-[#FF0000]`}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// Animated Counter component
function Counter({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 900;
    const steps = 30;
    const increment = value / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
}

// ============================================================================
// 2. MAIN REPORT VIEW COMPONENT
// ============================================================================

export function ReportView({ data, userEmail, userPlan }: Props) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'report' | 'prompts' | 'chatbots' | 'strategy' | 'competitors'>('report');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [modalFeature, setModalFeature] = useState('Daily Analytics & Continuous Tracking');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showDailyBanner, setShowDailyBanner] = useState(true);
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);

  const [currentPlan, setCurrentPlan] = useState<string | null>(userPlan || null);

  useEffect(() => {
    if (userPlan) {
      setCurrentPlan(userPlan);
      return;
    }
    async function checkPlan() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('plan')
            .eq('id', session.user.id)
            .maybeSingle();
          if (prof?.plan) {
            setCurrentPlan(prof.plan);
          }
        }
      } catch {
        // ignore
      }
    }
    checkPlan();
  }, [userPlan]);

  // Accordion toggles
  const [promptsOpen, setPromptsOpen] = useState(true);
  const [productsOpen, setProductsOpen] = useState(true);
  const [chatbotsOpen, setChatbotsOpen] = useState(true);
  const [competitorsOpen, setCompetitorsOpen] = useState(true);
  const [strategyOpen, setStrategyOpen] = useState(true);

  const isLoggedIn = Boolean(userEmail);
  const isPaid = currentPlan === 'pro' || currentPlan === 'starter';
  const isPro = currentPlan === 'pro';

  const handleLockedClick = (featureName: string) => {
    if (isPaid || isLoggedIn) {
      router.push('/dashboard');
      return;
    }
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
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 flex antialiased selection:bg-slate-900 selection:text-white">
      {/* ============================================================== */}
      {/* 1. LEFT FULL-WIDTH / COLLAPSIBLE SIDEBAR (Matches Competitor) */}
      {/* ============================================================== */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-64'
        } bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 select-none transition-all duration-200 z-30 fixed lg:static inset-y-0 left-0`}
      >
        <div className="flex flex-col">
          {/* Top Logo & Collapse Toggle */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
            {!sidebarCollapsed ? (
              <Link href="/" className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white shadow-2xs">
                  <Globe className="h-4 w-4 text-emerald-400" />
                </span>
                <span className="font-display text-base font-bold tracking-tight text-slate-900">
                  AEO Checker
                </span>
              </Link>
            ) : (
              <Link href="/" className="mx-auto" title="AEO Checker Home">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-white shadow-2xs">
                  <Globe className="h-4 w-4 text-emerald-400" />
                </span>
              </Link>
            )}

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors hidden sm:block"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Primary Navigation Links */}
          <div className="p-3 space-y-4">
            {/* AEO Reports Section Header / Item (Active Highlight) */}
            <div>
              <button
                onClick={() => {
                  setActiveTab('report');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'report'
                    ? 'bg-slate-100 text-slate-950 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title="AEO Reports"
              >
                <FileText className="h-4 w-4 text-slate-700 shrink-0" />
                {!sidebarCollapsed && <span>AEO Reports</span>}
              </button>
            </div>

            {/* Daily Analytics Section */}
            <div className="space-y-0.5">
              {!sidebarCollapsed && (
                <div className="flex items-center justify-between px-3 pt-2 pb-1.5">
                  <span className="text-[11px] font-bold text-slate-400 tracking-wider">
                    Daily Analytics
                  </span>
                  <BarChart3 className="h-3.5 w-3.5 text-slate-300" />
                </div>
              )}

              {/* Dashboard (Opens Upgrade Modal) */}
              <button
                onClick={() => handleLockedClick('Automated Daily Tracking Dashboard')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Dashboard"
              >
                <BarChart3 className="h-4 w-4 text-slate-400 shrink-0" />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </button>

              {/* Prompts (Scroll to Prompts) */}
              <button
                onClick={() => {
                  setActiveTab('prompts');
                  scrollToSection('key-prompts-section');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Prompts Breakdown"
              >
                <MessageSquare className="h-4 w-4 text-slate-400 shrink-0" />
                {!sidebarCollapsed && <span>Prompts</span>}
              </button>

              {/* Sources */}
              <button
                onClick={() => handleLockedClick('Source Intelligence & Citation Radar')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Sources"
              >
                <Link2 className="h-4 w-4 text-slate-400 shrink-0" />
                {!sidebarCollapsed && <span>Sources</span>}
              </button>

              {/* Competitors (Scroll to Competitors) */}
              <button
                onClick={() => {
                  setActiveTab('competitors');
                  scrollToSection('competitors-section');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Competitors Matrix"
              >
                <Layers className="h-4 w-4 text-slate-400 shrink-0" />
                {!sidebarCollapsed && <span>Competitors</span>}
              </button>

              {/* AI Traffic */}
              <button
                onClick={() => handleLockedClick('AI Referral Traffic & Conversion Analytics')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="AI Traffic"
              >
                <TrendingUp className="h-4 w-4 text-slate-400 shrink-0" />
                {!sidebarCollapsed && <span>AI Traffic</span>}
              </button>

              {/* Products (Scroll to Products) */}
              <button
                onClick={() => scrollToSection('products-section')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Products Ranking"
              >
                <Package className="h-4 w-4 text-slate-400 shrink-0" />
                {!sidebarCollapsed && <span>Products</span>}
              </button>

              {/* Online Presence */}
              <button
                onClick={() => {
                  setActiveTab('strategy');
                  scrollToSection('strategy-section');
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Online Presence Footprint"
              >
                <Compass className="h-4 w-4 text-slate-400 shrink-0" />
                {!sidebarCollapsed && <span>Online Presence</span>}
              </button>

              {/* Brands */}
              <button
                onClick={() => handleLockedClick('Brand Entity Watchdog & Aliases')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Brands"
              >
                <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                {!sidebarCollapsed && <span>Brands</span>}
              </button>

              {/* Tasks */}
              <button
                onClick={() => scrollToSection('tasks-section')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Prioritized Tasks"
              >
                <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                {!sidebarCollapsed && <span>Tasks</span>}
              </button>

              {/* Settings */}
              <button
                onClick={() => handleLockedClick('Custom Project Settings')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                title="Settings"
              >
                <Settings className="h-4 w-4 text-slate-400 shrink-0" />
                {!sidebarCollapsed && <span>Settings</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom User Account Row */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => handleLockedClick('User Profile & Team Settings')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            title="Account"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px]">
                {userEmail ? userEmail.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
              </span>
              {!sidebarCollapsed && (
                <span className="truncate max-w-[120px] font-semibold text-slate-800">
                  {userEmail || 'Account'}
                </span>
              )}
            </div>
            {!sidebarCollapsed && <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MAIN FULL-WIDTH WORKSPACE CANVAS                            */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA]">
        {/* Top Header Row with Breadcrumbs & Action Buttons */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              AEO Reports
            </Link>
            <span className="text-slate-300">&gt;</span>
            <span className="text-slate-900 font-bold">Report</span>
          </div>

          <div className="flex items-center gap-3">
            {isPaid ? (
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-extrabold tracking-wide uppercase shadow-2xs ${
                    isPro
                      ? 'border-emerald-500/25 bg-emerald-50 text-emerald-700'
                      : 'border-blue-500/25 bg-blue-50 text-blue-700'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      isPro ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
                    }`}
                  />
                  <span>{isPro ? 'PRO ACTIVE' : 'STARTER ACTIVE'}</span>
                </span>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 text-xs font-bold shadow-2xs transition-all"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <button
                onClick={() => handleLockedClick('Pro AEO Intelligence Suite')}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 px-5 py-2 text-xs font-extrabold text-white shadow-xs hover:opacity-95 transition-all uppercase tracking-wide cursor-pointer"
              >
                UPGRADE
              </button>
            )}
          </div>
        </header>

        {/* Sub-Header Bar: Back Arrow on Left, Issue Button on Right */}
        <div className="px-6 sm:px-8 pt-5 pb-2 flex items-center justify-between">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors"
            title="Back to home"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <button
            onClick={() => setShowIssueModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            <span>Issue</span>
          </button>
        </div>

        {/* Main Content Area (Spacious Full Width, matches competitor) */}
        <main className="w-full px-6 sm:px-8 pb-16 space-y-6">
          {/* Daily Analytics Notification Banner */}
          {showDailyBanner && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-3.5 sm:px-5 flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-2.5 text-xs text-slate-700">
                <span className="text-blue-600 font-bold text-sm">📊</span>
                <span>
                  <strong>Daily Analytics:</strong> Start tracking{' '}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-slate-900">
                    {data.brandName.charAt(0)} {data.brandName}&apos;s
                  </span>{' '}
                  visibility, sentiment, and mention rate over time.
                </span>
              </div>
              <button
                onClick={() => setShowDailyBanner(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* 3. HERO BRAND CARD                                             */}
          {/* ============================================================== */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start sm:items-center gap-6">
                {/* Clean Radial Score Gauge with Animated Emerald Arc */}
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 128 128">
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      className="text-slate-100"
                      strokeWidth="7"
                      stroke="currentColor"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r={radius}
                      className="text-emerald-500"
                      strokeWidth="7"
                      strokeDasharray={circumference}
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      style={{
                        filter: 'drop-shadow(0 0 4px rgba(34, 197, 94, 0.35))',
                      }}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
                      <Counter value={data.score} />
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 -mt-1">/100</span>
                  </div>
                </div>

                {/* Brand Meta, Chips & Products */}
                <div className="space-y-2">
                  <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950">
                    {data.brandName}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-0.5 font-medium text-slate-700">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      {data.scanDate}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-0.5 font-medium text-slate-700">
                      <Globe className="h-3 w-3 text-slate-400" />
                      {data.region}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-0.5 font-semibold text-slate-800">
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-900 text-white text-[9px] font-bold">
                        {data.brandName.charAt(0)}
                      </span>
                      {data.domain}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Briefcase className="h-3 w-3 text-slate-400" />
                    Industry: <span className="font-normal text-slate-600">{data.industry}</span>
                  </p>

                  {/* Products Pill Chips with Package Icon */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                      <Package className="h-3 w-3 text-slate-400" />
                      Products:
                    </span>
                    {data.products.slice(0, 5).map((p) => (
                      <span
                        key={p}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/70 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                      >
                        <Package className="h-2.5 w-2.5 text-slate-400" />
                        <span>{p}</span>
                      </span>
                    ))}
                    {data.products.length > 5 && (
                      <span className="text-[11px] font-semibold text-slate-500">
                        {data.products.length - 5} other products
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Start Tracking Button */}
              <div className="w-full lg:w-auto shrink-0">
                <button
                  onClick={() => handleLockedClick('Continuous Daily Tracking')}
                  className="w-full lg:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-800 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-slate-500 rotate-[-45deg]" />
                  <span>Start Tracking</span>
                </button>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 4. METRIC RIBBON (4 Clean Compact Cards)                       */}
          {/* ============================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5 text-slate-400" />
                  Products found
                </span>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="font-display text-2xl font-bold text-slate-900">{data.productsFoundPct}%</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <span>👁️</span>
                  Your products
                </span>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="font-display text-2xl font-bold text-slate-900">{data.yourProductsPct}%</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <span>👥</span>
                  Competitor products
                </span>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="font-display text-2xl font-bold text-slate-900">{data.competitorProductsPct}%</p>
            </div>

            <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <span>🎖️</span>
                  Your Best Product
                </span>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="font-display text-sm font-bold text-slate-900 truncate" title={data.bestProduct}>
                {data.bestProduct}
              </p>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 5. FOUR CORE ANALYSIS CARDS (2x2 Grid)                         */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: AI Presence */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-base font-bold text-slate-900">AI Presence</h3>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-700 shadow-2xs">
                    {data.aiPresenceScore}
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {/* OpenAI / ChatGPT */}
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-950 text-white shadow-2xs">
                        <OpenAIIcon className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-semibold text-slate-800">ChatGPT-4o</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-slate-900">{data.aiModels.chatgpt.score}</span>
                    </div>
                  </div>

                  {/* Google Gemini */}
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
                        <GeminiIcon className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-semibold text-slate-800">Google Gemini</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-slate-900">{data.aiModels.gemini.score}</span>
                    </div>
                  </div>

                  {/* Anthropic Claude */}
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#D97706] text-white shadow-2xs">
                        <ClaudeIcon className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-semibold text-slate-800">Anthropic Claude</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-slate-900">{data.aiModels.claude.score}</span>
                    </div>
                  </div>

                  {/* Perplexity */}
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-white shadow-2xs">
                        <PerplexityIcon className="h-3.5 w-3.5" />
                      </span>
                      <span className="font-semibold text-slate-800">Perplexity Pro</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-slate-900">{data.aiModels.perplexity.score}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => scrollToSection('chatbots-section')}
                  className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  View all ▾
                </button>
                <div className="flex items-center gap-2 text-slate-400">
                  <span title="Radar Scan">◎</span>
                  <span title="Crawler Connection">⟲</span>
                </div>
              </div>
            </div>

            {/* Card 2: Key Prompts */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-base font-bold text-slate-900">Key Prompts</h3>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-700 shadow-2xs">
                    {data.keyPromptsScore}
                  </span>
                </div>

                <div className="space-y-3.5 pt-1">
                  {data.prompts.slice(0, 2).map((p, idx) => (
                    <div key={p.id} className="space-y-2 text-xs">
                      <p className="font-medium text-slate-800 line-clamp-2 leading-snug">
                        {p.prompt}
                      </p>
                      <div className="flex items-center justify-between">
                        {/* Mini AI Engine Icon Row */}
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-slate-900 text-white">
                            <OpenAIIcon className="h-2.5 w-2.5" />
                          </span>
                          <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-blue-600 text-white">
                            <GeminiIcon className="h-2.5 w-2.5" />
                          </span>
                          <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-[#D97706] text-white">
                            <ClaudeIcon className="h-2.5 w-2.5" />
                          </span>
                          <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-teal-600 text-white">
                            <PerplexityIcon className="h-2.5 w-2.5" />
                          </span>
                          <span className="flex h-4 w-4 items-center justify-center rounded-sm bg-slate-800 text-white">
                            <GrokIcon className="h-2.5 w-2.5" />
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] shadow-2xs">
                          {idx === 0 ? '86%' : '100%'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => scrollToSection('key-prompts-section')}
                  className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  View all prompts ▾
                </button>
              </div>
            </div>

            {/* Card 3: Competitor Landscape */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-base font-bold text-slate-900">Competitor Landscape</h3>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-700 shadow-2xs">
                    {data.competitorLandscapeScore}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Your company or product was included <strong>6 out of 6</strong> times in industry/product related queries.
                </p>

                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Competitors Mentioned:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {data.competitorNames.slice(0, 6).map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 shadow-2xs"
                      >
                        <span className="text-[10px] font-bold text-slate-400">{c.charAt(0)}</span>
                        <span>{c}</span>
                      </span>
                    ))}
                    {data.competitorNames.length > 6 && (
                      <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500">
                        {data.competitorNames.length - 6} others...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => scrollToSection('competitors-section')}
                  className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Explore matrix ▾
                </button>
              </div>
            </div>

            {/* Card 4: Strategy Review */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-base font-bold text-slate-900">Strategy Review</h3>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-700 shadow-2xs">
                    {data.strategyReviewScore}
                  </span>
                </div>

                <div className="space-y-3 pt-1 text-xs">
                  {/* Answerability Progress Bar */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-700">Answerability</span>
                      <span className="font-bold text-slate-900">{data.strategy.answerability.score}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-slate-800 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${data.strategy.answerability.score}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Web Presence Strip (Matches Image 2 exactly) */}
                  <div>
                    <span className="font-medium text-slate-700 block mb-1">Web Presence</span>
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1 flex-1">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4500] text-white text-[9px] font-bold">
                          r/
                        </span>
                        <span className="font-bold text-slate-800 text-[11px]">
                          {data.strategy.webPresence.redditScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-1 border-l border-slate-200 pl-1.5">
                        <XIcon className="h-3.5 w-3.5 text-slate-800" />
                        <span className="font-bold text-slate-400 text-[11px]">
                          {data.strategy.webPresence.xScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-1 border-l border-slate-200 pl-1.5">
                        <YouTubeIcon className="h-3.5 w-3.5" />
                        <span className="font-bold text-slate-400 text-[11px]">
                          {data.strategy.webPresence.youtubeScore}
                        </span>
                      </div>
                      <div className="flex items-center justify-center border-l border-slate-200 pl-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      </div>
                    </div>
                  </div>

                  {/* Structured Data Progress Bar */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-700">Structured Data</span>
                      <span className="font-bold text-slate-900">{data.strategy.structuredData.score}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-slate-800 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${data.strategy.structuredData.score}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* AI Crawler Accessibility */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-slate-700">AI Crawler Accessibility</span>
                      <span className="font-bold text-slate-900">{data.strategy.crawlerAccessibility.score}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-slate-800 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${data.strategy.crawlerAccessibility.score}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => scrollToSection('strategy-section')}
                  className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  View full audit ▾
                </button>
              </div>
            </div>
          </div>

          {/* QUICK IN-PAGE JUMP BAR */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            <a href="#score-breakdown" className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs whitespace-nowrap">
              Score Breakdown
            </a>
            <a href="#suggested-fixes" className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs whitespace-nowrap">
              Suggested Fixes
            </a>
            <a href="#ai-bot-access" className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs whitespace-nowrap">
              AI Bot Access (23 Crawlers)
            </a>
            <a href="#platform-optimization" className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs whitespace-nowrap">
              Platform Optimization
            </a>
            <a href="#page-citability" className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs whitespace-nowrap">
              Page Citability
            </a>
            <a href="#score-history" className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs whitespace-nowrap">
              Score History
            </a>
            <a href="#tasks-section" className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs whitespace-nowrap">
              Tasks
            </a>
          </div>

          {/* ============================================================== */}
          {/* 5.5 UNDERSTANDABLE READINESS & OPTIMIZATION SUITE              */}
          {/* (Score Breakdown, Fixes Prompt Copy, 23 AI Bots, Citability,    */}
          {/*  Platform Playbooks, Score History)                            */}
          {/* ============================================================== */}
          <div id="readiness-suite" className="space-y-6 pt-2">
            <div id="score-breakdown">
              <ScoreBreakdown />
            </div>
            <div id="suggested-fixes">
              <SuggestedFixesCard domain={data.domain} />
            </div>
            <div id="ai-bot-access">
              <AIBotAccessMatrix domain={data.domain} />
            </div>
            <div id="platform-optimization">
              <PlatformOptimizationTabs domain={data.domain} />
            </div>
            <div id="page-citability">
              <PageCitabilityTable domain={data.domain} />
            </div>
            <div id="score-history">
              <ScoreHistoryTimeline currentScore={data.score} />
            </div>
          </div>

          {/* ============================================================== */}
          {/* 6. TASKS SECTION (Matches Image 2)                             */}
          {/* ============================================================== */}
          <div id="tasks-section" className="pt-2">
            <h3 className="font-display text-base font-bold text-slate-900">Tasks</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Prioritized actions backed by the evidence in this report.
            </p>
            <div className="mt-3 rounded-2xl border border-slate-200/90 bg-white p-5 text-xs text-slate-500 shadow-2xs">
              No actionable opportunities were found in this report.
            </div>
          </div>

          {/* ============================================================== */}
          {/* 7. 90-DAY TRAJECTORY AREA CHART (Smooth High-End Graph)        */}
          {/* ============================================================== */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Grow your AEO in just 90 days
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  By the <strong>{data.trajectory90DaysDate}</strong> you&apos;ll be{' '}
                  <strong>{data.trajectoryMultiplier} times</strong> more visible to AI chatbots.
                </p>
              </div>
              <button
                onClick={() => handleLockedClick('90-Day Optimization Growth Plan')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 rotate-[-45deg]" />
              </button>
            </div>

            {/* Smooth Animated SVG Area Chart with Milestones */}
            <div className="relative h-56 w-full mt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="smoothAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.45" />
                    <stop offset="45%" stopColor="#86efac" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#dcfce7" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guidelines */}
                <line x1="0" y1="20" x2="1000" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="70" x2="1000" y2="70" stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="120" x2="1000" y2="120" stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="0" y1="170" x2="1000" y2="170" stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" />

                {/* Smooth Area Path */}
                <path
                  d="M 0 145 C 160 140, 320 110, 500 82 C 680 58, 840 40, 1000 28 L 1000 200 L 0 200 Z"
                  fill="url(#smoothAreaGrad)"
                />

                {/* Smooth Top Line with Draw-In Animation */}
                <motion.path
                  d="M 0 145 C 160 140, 320 110, 500 82 C 680 58, 840 40, 1000 28"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.4, ease: 'easeInOut' }}
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(34, 197, 94, 0.4))',
                  }}
                />

                {/* Milestone 1: Day 1 Baseline */}
                <circle
                  cx="0"
                  cy="145"
                  r="6"
                  fill="#f59e0b"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveMilestone(1)}
                  onMouseLeave={() => setActiveMilestone(null)}
                />

                {/* Milestone 2: Day 30 Knowledge Seed */}
                <circle
                  cx="333"
                  cy="110"
                  r="5"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveMilestone(30)}
                  onMouseLeave={() => setActiveMilestone(null)}
                />

                {/* Milestone 3: Day 60 Citation Footprint */}
                <circle
                  cx="666"
                  cy="62"
                  r="5.5"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveMilestone(60)}
                  onMouseLeave={() => setActiveMilestone(null)}
                />

                {/* Milestone 4: Day 90 Category Peak */}
                <circle
                  cx="1000"
                  cy="28"
                  r="7"
                  fill="#10b981"
                  stroke="#ffffff"
                  strokeWidth="3"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveMilestone(90)}
                  onMouseLeave={() => setActiveMilestone(null)}
                />
              </svg>

              {/* Chart Milestone Labels */}
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-2 px-1">
                <span className="text-amber-600 font-bold">Day 1: Baseline ({data.score}%)</span>
                <span>Day 30: AI Indexation</span>
                <span>Day 60: Entity Graph Lift</span>
                <span className="text-emerald-700 font-bold">Day 90: Projected Lift (~88%)</span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* 8. KEY PROMPTS ACCORDION (Deep Dive with AI Responses)         */}
          {/* ============================================================== */}
          <div id="key-prompts-section" className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
            <button
              onClick={() => setPromptsOpen(!promptsOpen)}
              className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700 text-xs font-bold">
                  {data.keyPromptsScore}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Key Prompts</h3>
                  <p className="text-xs text-slate-500">Live AI answers across Google AI Overviews, ChatGPT, Claude, and Perplexity</p>
                </div>
              </div>
              {promptsOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
            </button>

            {promptsOpen && (
              <div className="p-6 pt-0 space-y-6 border-t border-slate-100">
                {/* Metric Strip */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
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

                {/* Individual Prompts */}
                {data.prompts.map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-200 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="font-display text-sm font-bold text-slate-900">&ldquo;{p.prompt}&rdquo;</h4>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 self-start sm:self-auto">
                        <CheckCircle2 className="h-3 w-3" />
                        {p.status}
                      </span>
                    </div>

                    {/* Google AI Overview Box */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] font-bold">
                          G
                        </span>
                        <span>AI Overview Response</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-sans">{p.overviewAnswer}</p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-blue-100/60">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                          Cited Sources:
                        </span>
                        {p.sources.map((s) => (
                          <span
                            key={s}
                            className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-600 shadow-2xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* 9. PRODUCTS ACCORDION                                           */}
          {/* ============================================================== */}
          <div id="products-section" className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
            <button
              onClick={() => setProductsOpen(!productsOpen)}
              className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-xs font-bold">
                  {data.products.length}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Products & Offerings</h3>
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
                          <td className="py-3 text-slate-900 flex items-center gap-1.5">
                            <Package className="h-3 w-3 text-slate-400" />
                            <span>{p.name}</span>
                          </td>
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

          {/* ============================================================== */}
          {/* 10. AI CHATBOTS TABLE ACCORDION                                */}
          {/* ============================================================== */}
          <div id="chatbots-section" className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
            <button
              onClick={() => setChatbotsOpen(!chatbotsOpen)}
              className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold">
                  {data.aiPresenceScore}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">AI Chatbots Information Analysis</h3>
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

          {/* ============================================================== */}
          {/* 11. COMPETITORS 2D MATRIX ACCORDION (Interactive Scatter Plot) */}
          {/* ============================================================== */}
          <div id="competitors-section" className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
            <button
              onClick={() => setCompetitorsOpen(!competitorsOpen)}
              className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700 text-xs font-bold">
                  {data.competitorLandscapeScore}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Competitive Matrix</h3>
                  <p className="text-xs text-slate-500">Mention rate against sentiment of captured AI answers</p>
                </div>
              </div>
              {competitorsOpen ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
            </button>

            {competitorsOpen && (
              <div className="p-6 pt-0 space-y-6 border-t border-slate-100">
                <div className="relative border border-slate-200 rounded-2xl p-6 bg-slate-50/50">
                  <div className="h-72 w-full relative">
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                      <div className="border-r border-b border-slate-200 p-2 text-[10px] font-bold text-slate-400">
                        Loved, less visible
                      </div>
                      <div className="border-b border-slate-200 p-2 text-right text-[10px] font-bold text-emerald-700 bg-emerald-50/40">
                        ★ Leaders (High Visibility & Sentiment)
                      </div>
                      <div className="border-r border-slate-200 p-2 text-[10px] font-bold text-slate-400 flex items-end">
                        Emerging
                      </div>
                      <div className="p-2 text-right text-[10px] font-bold text-slate-400 flex items-end justify-end">
                        Visible, weaker sentiment
                      </div>
                    </div>

                    {data.competitorDots.map((dot) => {
                      const left = `${Math.min(92, Math.max(8, dot.mentionRate * 1.4))}%`;
                      const bottom = `${Math.min(90, Math.max(10, dot.sentiment))}%`;
                      return (
                        <div
                          key={dot.name}
                          style={{ left, bottom }}
                          className="absolute -translate-x-1/2 translate-y-1/2 flex items-center gap-1.5 group cursor-pointer z-10"
                        >
                          <div className="relative">
                            {dot.isYourBrand && (
                              <span className="absolute -inset-1.5 rounded-full bg-emerald-400/50 animate-ping" />
                            )}
                            <span
                              className={`relative flex h-6 w-6 items-center justify-center rounded-full text-white text-[10px] font-bold shadow-sm ring-2 ring-white ${
                                dot.isYourBrand ? 'bg-emerald-600 ring-emerald-300 scale-125' : 'bg-indigo-600'
                              }`}
                            >
                              {dot.name.charAt(0)}
                            </span>
                          </div>
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

          {/* ============================================================== */}
          {/* 12. STRATEGY REVIEW ACCORDION                                  */}
          {/* ============================================================== */}
          <div id="strategy-section" className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-xs">
            <button
              onClick={() => setStrategyOpen(!strategyOpen)}
              className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-700 text-xs font-bold">
                  {data.strategyReviewScore}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900">Strategy Review & AI Crawlers</h3>
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
        </main>
      </div>

      {/* ============================================================== */}
      {/* 13. FREEMIUM UNLOCK / UPGRADE CONVERSION MODAL                 */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showUnlockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="max-w-md w-full rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 relative"
            >
              <button
                onClick={() => setShowUnlockModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-xs">
                  <Zap className="h-5 w-5 text-emerald-400 fill-current" />
                </span>
                <div>
                  <h4 className="font-display text-base font-bold text-slate-900">Unlock Continuous Tracking</h4>
                  <p className="text-xs text-slate-500">{modalFeature}</p>
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs text-slate-700">
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

              <div className="space-y-2">
                <Link
                  href={`/login?domain=${encodeURIComponent(data.domain)}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition-colors"
                >
                  <span>Sign In / Create Profile to Unlock</span>
                  <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                </Link>

                <Link
                  href="/pricing"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
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

      {/* ============================================================== */}
      {/* 14. REPORT ISSUE MODAL                                         */}
      {/* ============================================================== */}
      <AnimatePresence>
        {showIssueModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4 relative"
            >
              <button
                onClick={() => setShowIssueModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h4 className="font-display text-base">Report Data Discrepancy</h4>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Notice an issue with citations or entity recognition for <strong>{data.domain}</strong>? Our crawler re-indexes weekly.
              </p>

              <textarea
                placeholder="Describe the issue..."
                className="w-full h-24 rounded-xl border border-slate-200 p-3 text-xs focus:outline-none focus:border-slate-900"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowIssueModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowIssueModal(false);
                    alert('Thank you! Your feedback has been queued.');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
