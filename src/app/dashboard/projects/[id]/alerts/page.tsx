'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';

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
  const [filter, setFilter] = useState('unreviewed');
  const supabase = createClient();

  useEffect(() => {
    loadAlerts();
  }, [params.id, filter]);

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
  const reviewed = alerts.filter(a => a.reviewed);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Hallucination Alerts</h1>
        <p className="text-slate-600 mb-8">
          AI answers that contradict your brand facts. Review and mark as resolved.
        </p>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('unreviewed')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unreviewed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Unreviewed ({unreviewed.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({alerts.length})
          </button>
        </div>

        <AnimatePresence>
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 text-slate-500"
            >
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-lg font-medium">No hallucination alerts</p>
              <p className="mt-1">AI answers are consistent with your brand facts.</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className={`rounded-xl border p-5 ${
                    alert.reviewed ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`h-4 w-4 ${alert.reviewed ? 'text-slate-400' : 'text-red-500'}`} />
                        <span className="text-xs font-semibold text-slate-500 uppercase">{alert.engine}</span>
                        <span className="text-xs text-slate-400">{alert.fact_type}</span>
                        <span className="text-xs text-slate-400">{new Date(alert.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-800 mb-2">&ldquo;{alert.quote}&rdquo;</p>
                      <div className="flex gap-4 text-sm">
                        <span className="text-red-600">Claimed: <strong>{alert.claimed_value}</strong></span>
                        <span className="text-emerald-600">Expected: <strong>{alert.expected_value}</strong></span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Confidence: {Math.round(alert.confidence * 100)}%</p>
                    </div>
                    {!alert.reviewed && (
                      <button
                        onClick={() => handleReview(alert.id, true)}
                        className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Resolve
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
