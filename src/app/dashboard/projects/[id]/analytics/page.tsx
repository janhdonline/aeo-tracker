'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import { Bot, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface EngineStat {
  visits: number;
  verified: number;
  unverified: number;
}

interface PathStat {
  visits: number;
  citations: number;
}

interface AnalyticsData {
  engineStats: Record<string, EngineStat>;
  pathStats: Record<string, PathStat>;
  totalVisits: number;
  verifiedVisits: number;
  periodDays: number;
}

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadAnalytics();
  }, [params.id]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tools/agent-analytics?projectId=${params.id}&days=30`);
      if (!res.ok) throw new Error('Failed to load analytics');
      const data = await res.json();
      setData(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (gap: number) => {
    if (gap > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (gap < 0) return <TrendingDown className="h-4 w-4 text-emerald-500" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  const getTrendLabel = (gap: number) => {
    if (gap > 0) return 'Bot > Citations (gap)';
    if (gap < 0) return 'Citations > Bot (surplus)';
    return 'Balanced';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <Bot className="h-12 w-12 text-[#eb9d2a] mx-auto mb-4 animate-spin" />
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const engineEntries = Object.entries(data.engineStats);
  const pathEntries = Object.entries(data.pathStats);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Agent Traffic Analytics</h1>
        <p className="text-slate-600 mb-8">
          Track AI crawler visits by engine and page. Correlate bot visits with citations.
        </p>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 text-[#eb9d2a]" />
              <div>
                <p className="text-sm text-slate-500">Total Bot Visits</p>
                <p className="text-3xl font-bold text-slate-900">{data.totalVisits}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
              <div>
                <p className="text-sm text-slate-500">Verified Bots</p>
                <p className="text-3xl font-bold text-emerald-600">{data.verifiedVisits}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Period</p>
                <p className="text-3xl font-bold text-slate-900">{data.periodDays} days</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Engine Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Visits by Engine</h2>
          {Object.keys(data.engineStats).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(data.engineStats).map(([engine, stat]) => (
                <motion.div
                  key={engine}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-slate-900 capitalize">{engine}</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                      {stat.visits} visits
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      {stat.verified} verified
                    </span>
                    {stat.unverified > 0 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        {stat.unverified} unverified
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No bot visits recorded yet</p>
          )}
        </div>

        {/* Path Correlation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Bot Visits vs Citations by Page</h2>
          {Object.keys(data.pathStats).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Path</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Bot Visits</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Citations</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(data.pathStats)
                    .sort((a, b) => b[1].visits - a[1].visits)
                    .slice(0, 20)
                    .map(([path, stat]) => {
                      const gap = stat.visits - stat.citations;
                      return (
                        <tr key={path} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm font-mono text-slate-700">{path}</td>
                          <td className="px-4 py-3 text-right text-sm text-slate-700">{stat.visits}</td>
                          <td className="px-4 py-3 text-right text-sm text-slate-700">{stat.citations}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`flex items-center justify-end gap-1 font-medium ${
                              gap > 0 ? 'text-red-600' : gap < 0 ? 'text-emerald-600' : 'text-slate-500'
                            }`}>
                              {getTrendIcon(gap)}
                              {Math.abs(gap)} ({getTrendLabel(gap)})
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No path data yet</p>
          )}
        </div>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-slate-600 mb-4">Want to track agent traffic on your site?</p>
          <a href="/dashboard/projects/new" className="inline-block bg-[#eb9d2a] hover:bg-[#d88b1e] text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            Add Your Domain
          </a>
        </div>
      </div>
    </div>
  );
}
