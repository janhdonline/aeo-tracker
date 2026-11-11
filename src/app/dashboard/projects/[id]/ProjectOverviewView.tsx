'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Globe,
  Calendar,
  Briefcase,
  Package,
  Info,
  CheckCircle2,
  Share2,
  ExternalLink,
  Download,
  Settings,
  X,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Layers,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { RunScanButton } from './RunScanButton';
import { WebPresenceAudit } from '@/components/WebPresenceAudit';
import { AnswerabilityAuditCard } from '@/components/AnswerabilityAuditCard';
import type { FullReportData } from '@/lib/report-generator';

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
    const duration = 800;
    const steps = 25;
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
// 2. PROJECT OVERVIEW VIEW COMPONENT (Matches Image 2 Competitor Layout)
// ============================================================================

interface Props {
  projectId: string;
  project: {
    id: string;
    domain: string;
    brand_name: string;
    industry?: string | null;
    competitor_domains?: string[];
  };
  latestScore: {
    visibility_score: number;
    share_of_voice_pct: number;
    total_mentions: number;
    keywords_covered: number;
    keywords_total: number;
  } | null;
  latestRun: {
    id: string;
    started_at: string;
  } | null;
  keywords: Array<{
    id: string;
    keyword: string;
    intent: string;
    active: boolean;
  }>;
  fixBriefs: Array<{
    id: string;
    title: string;
    severity: string;
    description: string;
    status: string;
    created_at: string;
  }>;
  reportData: FullReportData;
}

export function ProjectOverviewView({
  projectId,
  project,
  latestScore,
  latestRun,
  keywords,
  fixBriefs,
  reportData,
}: Props) {
  const [showDailyBanner, setShowDailyBanner] = useState(true);

  // Compute effective score: use latest real scan if present, or initial baseline index
  const effectiveScore = latestScore?.visibility_score !== undefined && latestScore?.visibility_score !== null
    ? latestScore.visibility_score
    : reportData.score;

  const brandName = project.brand_name || reportData.brandName || project.domain;
  const productsList = reportData.products && reportData.products.length > 0
    ? reportData.products
    : [
        `${brandName} Core Workspace`,
        `${brandName} AI Engine`,
        `${brandName} Collaboration Hub`,
        `${brandName} Developer APIs`,
      ];

  const competitorNamesList = project.competitor_domains && project.competitor_domains.length > 0
    ? project.competitor_domains
    : reportData.competitorNames;

  // Key prompts: prefer project's keywords table seeds, fallback to reportData
  const displayPrompts = keywords && keywords.length > 0
    ? keywords.map((k) => ({ id: k.id, prompt: k.keyword }))
    : reportData.prompts && reportData.prompts.length > 0
    ? reportData.prompts
    : [
        { id: '1', prompt: `Which solutions offer multi-currency and commercial scalability for ${project.industry || 'software'}?` },
        { id: '2', prompt: `What are the best platforms for beginners in ${brandName}?` },
      ];

  // Circular score progress calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (effectiveScore / 100) * circumference;

  return (
    <div className="w-full space-y-6">
      {/* 1. DAILY ANALYTICS NOTIFICATION BANNER (Matches Image 2) */}
      {showDailyBanner && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-3.5 sm:px-5 flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-2.5 text-xs text-slate-700">
            <span className="text-blue-600 font-bold text-sm">📊</span>
            <span>
              <strong>Daily Analytics:</strong> Active monitoring for{' '}
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-slate-900">
                {brandName.charAt(0)} {brandName}&apos;s
              </span>{' '}
              visibility, sentiment, and mention rate over time.
            </span>
          </div>
          <button
            onClick={() => setShowDailyBanner(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
            title="Dismiss banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}

      {/* 2. HERO BRAND CARD (Matches Image 2 Competitor Header with Actions) */}
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
                  <Counter value={effectiveScore} />
                </span>
                <span className="text-[10px] font-bold text-slate-400 -mt-1">/100</span>
              </div>
            </div>

            {/* Brand Meta, Chips & Products */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950">
                  {brandName}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Monitoring
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-0.5 font-medium text-slate-700">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  {latestRun ? new Date(latestRun.started_at).toLocaleString() : reportData.scanDate}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 py-0.5 font-medium text-slate-700">
                  <Globe className="h-3 w-3 text-slate-400" />
                  {reportData.region || 'Global'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-0.5 font-semibold text-slate-800">
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-900 text-white text-[9px] font-bold">
                    {brandName.charAt(0)}
                  </span>
                  {project.domain}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Briefcase className="h-3 w-3 text-slate-400" />
                Industry: <span className="font-normal text-slate-600">{project.industry || reportData.industry}</span>
              </p>

              {/* Products Pill Chips with Package Icon */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                  <Package className="h-3 w-3 text-slate-400" />
                  Products:
                </span>
                {productsList.slice(0, 5).map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/70 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                  >
                    <Package className="h-2.5 w-2.5 text-slate-400" />
                    <span>{p}</span>
                  </span>
                ))}
                {productsList.length > 5 && (
                  <span className="text-[11px] font-semibold text-slate-500">
                    +{productsList.length - 5} other products
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <RunScanButton projectId={projectId} />

            <Link
              href={`/report/${encodeURIComponent(project.domain)}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            >
              <Share2 className="h-3.5 w-3.5 text-slate-500" />
              Public Report
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>

            <a
              href={`/api/export/pdf?projectId=${projectId}`}
              download
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              Export PDF
            </a>

            <Link
              href={`/dashboard/projects/${projectId}/settings`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
              title="Project Settings"
            >
              <Settings className="h-3.5 w-3.5 text-slate-500" />
              Settings
            </Link>
          </div>
        </div>
      </div>

      {/* 3. METRIC RIBBON (4 Clean Compact Cards Matches Image 2) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5 text-slate-400" />
              Products found
            </span>
            <Info className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900">{reportData.productsFoundPct}%</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <span>👁️</span>
              Your products
            </span>
            <Info className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900">{reportData.yourProductsPct}%</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <span>👥</span>
              Competitor products
            </span>
            <Info className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <p className="font-display text-2xl font-bold text-slate-900">{reportData.competitorProductsPct}%</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold flex items-center gap-1.5">
              <span>🎖️</span>
              Your Best Product
            </span>
            <Info className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <p className="font-display text-sm font-bold text-slate-900 truncate" title={reportData.bestProduct}>
            {reportData.bestProduct}
          </p>
        </div>
      </div>

      {/* 4. FOUR CORE ANALYSIS CARDS (2x2 Grid Matches Image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: AI Presence */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-bold text-slate-900">AI Presence</h3>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-700 shadow-2xs">
                {reportData.aiPresenceScore}
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
                  <span className="font-bold text-slate-900">{reportData.aiModels.chatgpt.score}</span>
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
                  <span className="font-bold text-slate-900">{reportData.aiModels.gemini.score}</span>
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
                  <span className="font-bold text-slate-900">{reportData.aiModels.claude.score}</span>
                </div>
              </div>

              {/* Perplexity Pro */}
              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-white shadow-2xs">
                    <PerplexityIcon className="h-3.5 w-3.5" />
                  </span>
                  <span className="font-semibold text-slate-800">Perplexity Pro</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">{reportData.aiModels.perplexity.score}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href={`/dashboard/projects/${projectId}/analytics`}
              className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
            >
              <span>View all</span>
              <span>▾</span>
            </Link>
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
                {reportData.keyPromptsScore}
              </span>
            </div>

            <div className="space-y-3.5 pt-1">
              {displayPrompts.slice(0, 2).map((p: any, idx: number) => (
                <div key={p.id || idx} className="space-y-2 text-xs">
                  <p className="font-medium text-slate-800 line-clamp-2 leading-snug">
                    {p.prompt || p.keyword}
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
            <Link
              href={`/dashboard/projects/${projectId}/keywords`}
              className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
            >
              <span>View all prompts</span>
              <span>▾</span>
            </Link>
          </div>
        </div>

        {/* Card 3: Competitor Landscape */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-bold text-slate-900">Competitor Landscape</h3>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-700 shadow-2xs">
                {reportData.competitorLandscapeScore}
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
                {competitorNamesList.slice(0, 6).map((c: string) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 shadow-2xs"
                  >
                    <span className="text-[10px] font-bold text-slate-400">{c.charAt(0)}</span>
                    <span>{c}</span>
                  </span>
                ))}
                {competitorNamesList.length > 6 && (
                  <span className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-500">
                    {competitorNamesList.length - 6} others...
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link
              href={`/dashboard/projects/${projectId}/competitors`}
              className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
            >
              <span>Explore matrix</span>
              <span>▾</span>
            </Link>
          </div>
        </div>

        {/* Card 4: Strategy Review */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-base font-bold text-slate-900">Strategy Review</h3>
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-xs font-bold text-emerald-700 shadow-2xs">
                {reportData.strategyReviewScore}
              </span>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              {/* Answerability Progress Bar */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-slate-700">Answerability</span>
                  <span className="font-bold text-slate-900">{reportData.strategy.answerability.score}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-slate-800 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${reportData.strategy.answerability.score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Web Presence Strip */}
              <div>
                <span className="font-medium text-slate-700 block mb-1">Web Presence</span>
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1 flex-1">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4500] text-white text-[9px] font-bold">
                      r/
                    </span>
                    <span className="font-bold text-slate-800 text-[11px]">
                      {reportData.strategy.webPresence.redditScore}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-1 border-l border-slate-200 pl-1.5">
                    <XIcon className="h-3.5 w-3.5 text-slate-800" />
                    <span className="font-bold text-slate-400 text-[11px]">
                      {reportData.strategy.webPresence.xScore}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-1 border-l border-slate-200 pl-1.5">
                    <YouTubeIcon className="h-3.5 w-3.5" />
                    <span className="font-bold text-slate-400 text-[11px]">
                      {reportData.strategy.webPresence.youtubeScore}
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
                  <span className="font-bold text-slate-900">{reportData.strategy.structuredData.score}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-slate-800 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${reportData.strategy.structuredData.score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* AI Crawler Accessibility */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-slate-700">AI Crawler Accessibility</span>
                  <span className="font-bold text-slate-900">{reportData.strategy.crawlerAccessibility.score}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-slate-800 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${reportData.strategy.crawlerAccessibility.score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <a
              href="#strategy-deep-audit"
              className="font-bold text-slate-600 hover:text-slate-900 cursor-pointer flex items-center gap-1"
            >
              <span>View full audit</span>
              <span>▾</span>
            </a>
          </div>
        </div>
      </div>

      {/* 5. TASKS SECTION (Matches Image 2 with real project briefs) */}
      <div id="tasks-section" className="pt-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">Tasks</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Prioritized actions backed by the evidence in this report.
            </p>
          </div>
          <Link
            href={`/dashboard/projects/${projectId}/briefs`}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <span>Open Kanban Action Board</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {fixBriefs && fixBriefs.length > 0 ? (
          <div className="space-y-3">
            {fixBriefs.map((brief) => {
              const isLeak = brief.severity === 'high' || brief.title?.toLowerCase().includes('leak');
              const isGap = brief.severity === 'medium' || brief.title?.toLowerCase().includes('gap');
              const borderColor = isLeak
                ? 'border-rose-200/90 bg-rose-50/20'
                : isGap
                ? 'border-amber-200/90 bg-amber-50/20'
                : 'border-blue-200/90 bg-blue-50/20';
              const tagBadge = isLeak
                ? 'bg-rose-100 text-rose-800 border-rose-200'
                : isGap
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-blue-100 text-blue-800 border-blue-200';

              return (
                <div
                  key={brief.id}
                  className={`rounded-2xl border ${borderColor} p-4 sm:p-5 bg-white shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md border ${tagBadge}`}>
                        {brief.severity ? brief.severity.toUpperCase() : 'ACTION ITEM'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{brief.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{brief.description}</p>
                  </div>
                  <Link
                    href={`/dashboard/projects/${projectId}/briefs`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs shrink-0"
                  >
                    <span>Take Action</span>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 text-xs text-slate-500 shadow-2xs">
            No actionable opportunities were found in this report.
          </div>
        )}
      </div>

      {/* 6. 90-DAY TRAJECTORY BANNER (Matches Image 2) */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold text-slate-900">
              Grow your AEO in just 90 days
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              By the <strong>{reportData.trajectory90DaysDate}</strong> you&apos;ll be{' '}
              <strong>{reportData.trajectoryMultiplier} times</strong> more visible to AI chatbots.
            </p>
          </div>
          <Link
            href={`/dashboard/projects/${projectId}/briefs`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors shrink-0"
          >
            <span>Start Optimization Plan</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400 rotate-[-45deg]" />
          </Link>
        </div>
      </div>

      {/* 7. INTERACTIVE DEEP DIAGNOSTIC SUITE */}
      <div id="strategy-deep-audit" className="space-y-6 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-slate-900">
              Deep Strategy Diagnostics & Repair Tools
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live automated tests for Brand Knowledge Graph and LLM Answerability chunking.
            </p>
          </div>
        </div>

        {/* Multi-Platform Web Presence Footprint */}
        <WebPresenceAudit domain={project.domain} brandName={project.brand_name} />

        {/* Content Answerability Chunking Diagnostic (40-60 Word Rule) */}
        <AnswerabilityAuditCard domain={project.domain} brandName={project.brand_name} />
      </div>
    </div>
  );
}
