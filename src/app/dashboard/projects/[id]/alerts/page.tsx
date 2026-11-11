'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, ArrowLeft, ShieldAlert } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import Link from 'next/link';

interface Alert {
  id: string;
  engine: string;
  quote: string;
  claimed_value: string;
  expected_value: string;
  fact_type: string;
  confidence: number;
  reviewed: boolean;
  created_at: string;
}

export default function AlertsPage({ params }: { params: { id: string } }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [projectDomain, setProjectDomain] = useState('');
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [filter, setFilter] = useState('unreviewed');
  const supabase = createClient();

  useEffect(() => {
    loadProject();
    loadAlerts();
  }, [params.id, filter]);

  const loadProject = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) setUserEmail(data.user.email);
    } catch {
      // Ignored
    }

    const { data } = await supabase
      .from('projects')
      .select('domain')
      .eq('id', params.id)
      .single();
    if (data) setProjectDomain(data.domain);
  };

  const loadAlerts = async () => {
    let query = supabase
      .from('misinformation_alerts')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false });

    if (filter === 'unreviewed') {
      query = query.eq('reviewed', false);
    }

    const { data } = await query;
    setAlerts(data || []);
  };

  const handleReview = async (id: string, reviewed: boolean) => {
    await supabase
      .from('misinformation_alerts')
      .update({ reviewed, reviewed_at: reviewed ? new Date().toISOString() : null })
      .eq('id', id);
    loadAlerts();
  };

  const unreviewed = alerts.filter(a => !a.reviewed);

  return (
    <AppShell
      user={{ email: userEmail }}
      projectId={params.id}
      domain={projectDomain || 'domain'}
      activeSection="products"
      breadcrumbs={[
        { label: projectDomain || 'Project', href: `/dashboard/projects/${params.id}` },
        { label: 'Citations & Alerts' },
      ]}
    >
      <div className="w-full px-6 sm:px-8 py-6 space-y-6">
        <ProjectSidebar projectId={params.id} domain={projectDomain || 'domain'} current="facts" />

        <div className="w-full space-y-6">
            {/* Header: Bento Watchdog Console */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Link
                    href={`/dashboard/projects/${params.id}/facts`}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back to Facts Sheet
                  </Link>
                  <span className="text-slate-300">/</span>
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/80 flex items-center gap-1.5">
                    <ShieldAlert className="h-3 w-3 text-rose-600" />
                    Hallucination Sentinel
                  </span>
                </div>
                <h1 className="font-display text-2xl font-black tracking-tight text-slate-950">
                  AI Discrepancy &amp; Hallucination Alerts
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Automated surveillance catching where ChatGPT, Perplexity, Claude, or Gemini contradict your verified ground truth.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex rounded-2xl border border-slate-200/90 bg-white p-1 shadow-2xs">
                  <button
                    onClick={() => setFilter('unreviewed')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      filter === 'unreviewed' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Active Discrepancies ({unreviewed.length})
                  </button>
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      filter === 'all' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All History ({alerts.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Bento Quick Stat Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Pending Action</span>
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-black text-slate-950">{unreviewed.length}</div>
                <p className="text-[11px] text-slate-400 mt-1">Requires truth verification or brief dispatch</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Resolved Truths</span>
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-black text-slate-950">
                  {alerts.filter(a => a.reviewed).length}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Audit verified against official facts sheet</p>
              </div>

              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>Watchdog Status</span>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <div className="text-sm font-black text-emerald-700">Autonomous Sentinel Active</div>
                <p className="text-[11px] text-slate-400 mt-1">Running continuous checks across 6 frontier LLMs</p>
              </div>
            </div>

            {alerts.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence>
                  {alerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className={`rounded-3xl border p-5 sm:p-6 shadow-xs transition-all ${
                        alert.reviewed
                          ? 'bg-slate-50/70 border-slate-200/80 opacity-80'
                          : 'bg-white border-rose-200 ring-1 ring-rose-100 shadow-sm'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-white">
                              {alert.engine}
                            </span>
                            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200">
                              {alert.fact_type}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400">
                              Detected: {new Date(alert.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="ml-auto sm:ml-0 inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/60">
                              {Math.round(alert.confidence * 100)}% Confidence
                            </span>
                          </div>

                          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs text-slate-800 font-medium italic leading-relaxed">
                            &ldquo;{alert.quote}&rdquo;
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="rounded-xl bg-rose-50 border border-rose-200/70 p-3">
                              <span className="block text-[10px] font-black uppercase tracking-wider text-rose-700 mb-1">
                                AI Claimed (Hallucination)
                              </span>
                              <span className="font-bold text-rose-950 text-xs sm:text-sm">
                                {alert.claimed_value}
                              </span>
                            </div>

                            <div className="rounded-xl bg-emerald-50 border border-emerald-200/70 p-3">
                              <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-1">
                                Verified Ground Truth
                              </span>
                              <span className="font-bold text-emerald-950 text-xs sm:text-sm">
                                {alert.expected_value}
                              </span>
                            </div>
                          </div>
                        </div>

                        {!alert.reviewed ? (
                          <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 pt-2 lg:pt-0">
                            <button
                              onClick={() => handleReview(alert.id, true)}
                              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Resolve Discrepancy
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 self-start">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            Resolved &amp; Logged
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-14 text-center">
                <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-base font-black text-slate-900">Zero Hallucinations Detected</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  All surveyed answer engines are currently representing your verified brand facts with 100% accuracy.
                </p>
              </div>
            )}
        </div>
      </div>
    </AppShell>
  );
}
