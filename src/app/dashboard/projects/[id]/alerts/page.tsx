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
    <AppShell user={{ email: userEmail }}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          <ProjectSidebar projectId={params.id} domain={projectDomain || 'domain'} current="facts" />

          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href={`/dashboard/projects/${params.id}/facts`}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Facts Sheet
                </Link>
                <span className="text-slate-300">/</span>
                <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" />
                  Hallucination Watchdog
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    AI Discrepancy & Hallucination Alerts
                  </h1>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Live detections where ChatGPT, Perplexity, or Gemini contradicted your verified brand facts.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                    <button
                      onClick={() => setFilter('unreviewed')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        filter === 'unreviewed' ? 'bg-red-50 text-red-700' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Active Discrepancies ({unreviewed.length})
                    </button>
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        filter === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All History
                    </button>
                  </div>
                </div>
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
                      className={`rounded-2xl border p-5 shadow-sm transition-all ${
                        alert.reviewed ? 'bg-slate-50 border-slate-200' : 'bg-red-50/50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className={`h-4 w-4 ${alert.reviewed ? 'text-slate-400' : 'text-red-500'}`} />
                            <span className="text-xs font-bold text-slate-700 uppercase bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                              {alert.engine}
                            </span>
                            <span className="text-xs font-semibold text-slate-500 uppercase">{alert.fact_type}</span>
                            <span className="text-xs text-slate-400">{new Date(alert.created_at).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-slate-800 font-medium mb-2">&ldquo;{alert.quote}&rdquo;</p>
                          <div className="flex flex-wrap gap-4 text-xs">
                            <span className="rounded-md bg-red-100/80 px-2 py-1 text-red-800 font-semibold">
                              AI Claimed: <strong>{alert.claimed_value}</strong>
                            </span>
                            <span className="rounded-md bg-emerald-100/80 px-2 py-1 text-emerald-800 font-semibold">
                              True Ground: <strong>{alert.expected_value}</strong>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-2">Discrepancy Confidence: {Math.round(alert.confidence * 100)}%</p>
                        </div>
                        {!alert.reviewed && (
                          <button
                            onClick={() => handleReview(alert.id, true)}
                            className="flex items-center gap-1.5 bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Resolve Discrepancy
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-base font-bold text-slate-900">Zero Hallucinations Detected</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  AI engines are currently answering accurately according to your verified brand facts.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </AppShell>
  );
}
