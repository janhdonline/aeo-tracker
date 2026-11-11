'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, Bot, FileText } from 'lucide-react';

import Link from 'next/link';
import { LogoMark } from '@/components/landing/BrandLogos';

interface AuditResult {
  domain: string;
  robotsTxtFetched: boolean;
  llmsTxtFound: boolean;
  jsShellDetected: boolean;
  issues: string[];
  warnings: string[];
  summary: { score: number; status: 'pass' | 'warning' | 'fail'; };
}

export default function AICrawlerAuditPage() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAudit = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/tools/ai-crawler-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit failed');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const statusColor = result?.summary.status === 'pass' ? 'text-emerald-600' : result?.summary.status === 'warning' ? 'text-yellow-600' : 'text-red-600';
  const statusBg = result?.summary.status === 'pass' ? 'bg-emerald-50 border-emerald-200' : result?.summary.status === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans antialiased text-slate-900 selection:bg-[#D4F63C] selection:text-black">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2.5 group">
            <LogoMark className="h-8 w-8" />
            <span className="font-black text-lg tracking-tight group-hover:text-slate-800 transition-colors">
              AEO Checker
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/pricing"
              className="text-xs font-bold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-xl transition"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="text-xs font-bold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-xl transition"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white shadow-xs hover:bg-slate-800 transition"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-950 text-white shadow-xs mb-3">
            <Shield className="h-8 w-8 text-[#D4F63C]" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">AI Crawler Readiness Audit</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Check if your website is properly configured for AI indexers like GPTBot, ClaudeBot, and PerplexityBot.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
              onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
            />
            <button
              onClick={handleAudit}
              disabled={loading || !domain.trim()}
              className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 transition-all shadow-xs"
            >
              {loading ? 'Scanning...' : 'Audit'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Score Card */}
              <div className={`rounded-2xl border p-6 ${statusBg}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">AI Crawler Score</p>
                    <p className={`text-4xl font-bold ${statusColor}`}>{result.summary.score}/100</p>
                    <p className="text-sm text-slate-500 mt-1 capitalize">{result.summary.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Domain</p>
                    <p className="font-semibold text-slate-900">{result.domain}</p>
                  </div>
                </div>
              </div>

              {/* Checks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {result.robotsTxtFetched ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                    <span className="font-medium">robots.txt Found</span>
                  </div>
                  <p className="text-sm text-slate-600">{result.robotsTxtFetched ? 'Your robots.txt was fetched successfully.' : 'Could not fetch robots.txt.'}</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {result.llmsTxtFound ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <FileText className="h-5 w-5 text-yellow-500" />}
                    <span className="font-medium">llms.txt</span>
                  </div>
                  <p className="text-sm text-slate-600">{result.llmsTxtFound ? 'llms.txt found — good for AI agent discoverability.' : 'No llms.txt found.'}</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {result.jsShellDetected ? <XCircle className="h-5 w-5 text-red-500" /> : <CheckCircle className="h-5 w-5 text-emerald-500" />}
                    <span className="font-medium">JS Shell Check</span>
                  </div>
                  <p className="text-sm text-slate-600">{result.jsShellDetected ? 'Bot sees significantly less content than humans. Consider SSR.' : 'Content rendering looks consistent for bots.'}</p>
                </div>
              </div>

              {/* Issues */}
              {result.issues.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-800">Issues Found</span>
                  </div>
                  <ul className="space-y-2">
                    {result.issues.map((issue, i) => (
                      <li key={i} className="flex items-start gap-2 text-red-700 text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {result.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold text-yellow-800">Suggestions</span>
                  </div>
                  <ul className="space-y-2">
                    {result.warnings.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-yellow-700 text-sm">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-yellow-500 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* CTA */}
              <div className="text-center pt-4">
                <p className="text-xs sm:text-sm text-slate-600 mb-3 font-medium">Want to monitor and improve your AI visibility automatically?</p>
                <Link href="/login" className="inline-block bg-slate-950 hover:bg-slate-800 text-white px-6 py-3 rounded-full text-xs font-bold shadow-xs transition-all cursor-pointer">
                  Start Tracking Now →
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark className="h-8 w-8" />
              <span className="text-[15px] font-black tracking-[-0.03em] text-[#0B0F17]">
                AEO Tracker
              </span>
            </Link>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                { label: 'Pricing', href: '/pricing' },
                { label: 'About', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Compare', href: '/compare' },
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-slate-100 pt-6 text-[11px] font-medium text-slate-400 sm:flex-row">
            <p>© 2026 AEO Tracker. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
              Built for the AI Answer Engine era.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
