'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, Bot, FileText } from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Shield className="h-12 w-12 text-[#eb9d2a] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900">AI Crawler Readiness Audit</h1>
          <p className="mt-2 text-slate-600">Check if your website is properly configured for AI crawlers like GPTBot, ClaudeBot, and PerplexityBot.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#eb9d2a] focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
            />
            <button
              onClick={handleAudit}
              disabled={loading || !domain.trim()}
              className="bg-[#eb9d2a] hover:bg-[#d88b1e] text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
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
                <p className="text-slate-600 mb-3">Want to monitor and improve your AI visibility?</p>
                <a href="/dashboard/projects/new" className="inline-block bg-[#eb9d2a] hover:bg-[#d88b1e] text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                  Start Tracking Now
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
