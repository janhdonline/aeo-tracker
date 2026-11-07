'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle, Clock } from 'lucide-react';

interface Brief {
  id: string;
  gap_type: string;
  gap_description: string;
  recommendation: {
    action: string;
    target: string;
    content_hint: string;
    priority: string;
  };
  status: string;
  created_at: string;
}

const briefVariants = {
  hidden: { opacity: 0, x: -16 },
  show: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16, transition: { duration: 0.15 } },
};

const priorityColor = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const gapTypeIcon = {
  missing_mention: <AlertCircle className="h-4 w-4" />,
  weak_position: <Clock className="h-4 w-4" />,
  competitor_wins: <AlertCircle className="h-4 w-4" />,
  source_gap: <AlertCircle className="h-4 w-4" />,
  traffic_leak: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
};

export function BriefsManager({ projectId, initialBriefs }: { projectId: string; initialBriefs: Brief[] }) {
  const [briefs, setBriefs] = useState(initialBriefs);
  const supabase = createClient();

  const handleMarkApplied = async (id: string) => {
    const { error } = await supabase
      .from('fix_briefs')
      .update({ status: 'applied', applied_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      setBriefs(briefs.map(b => b.id === id ? { ...b, status: 'applied' } : b));
    }
  };

  const handleDismiss = async (id: string) => {
    const { error } = await supabase
      .from('fix_briefs')
      .update({ status: 'dismissed' })
      .eq('id', id);

    if (!error) {
      setBriefs(briefs.map(b => b.id === id ? { ...b, status: 'dismissed' } : b));
    }
  };

  const openBriefs = briefs.filter(b => b.status === 'open');
  const appliedBriefs = briefs.filter(b => b.status === 'applied');
  const dismissedBriefs = briefs.filter(b => b.status === 'dismissed');

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {openBriefs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <h3 className="text-lg font-semibold">Open Briefs ({openBriefs.length})</h3>
            </div>
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {openBriefs.map((brief) => (
                  <motion.div
                    key={brief.id}
                    variants={briefVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    layout
                    className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-amber-400 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-amber-600">{gapTypeIcon[brief.gap_type as keyof typeof gapTypeIcon]}</span>
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {brief.gap_type.replace(/_/g, ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColor[brief.recommendation.priority as keyof typeof priorityColor]}`}>
                            {brief.recommendation.priority} priority
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 mt-1">{brief.gap_description}</p>
                        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-1">Recommendation</p>
                          <p className="text-sm text-amber-900">{brief.recommendation.content_hint}</p>
                          <p className="text-xs text-amber-700 mt-1">
                            Target: <span className="font-medium">{brief.recommendation.target}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <motion.button
                          onClick={() => handleMarkApplied(brief.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Apply
                        </motion.button>
                        <motion.button
                          onClick={() => handleDismiss(brief.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center gap-1.5 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                          Dismiss
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {appliedBriefs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-green-700">Applied ({appliedBriefs.length})</h3>
            <div className="space-y-2">
              <AnimatePresence>
                {appliedBriefs.map((brief) => (
                  <motion.div
                    key={brief.id}
                    variants={briefVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-400"
                  >
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      <p className="text-sm text-gray-700">{brief.gap_description}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {dismissedBriefs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-500">Dismissed ({dismissedBriefs.length})</h3>
            <div className="space-y-2">
              <AnimatePresence>
                {dismissedBriefs.map((brief) => (
                  <motion.div
                    key={brief.id}
                    variants={briefVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-300 opacity-60"
                  >
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-gray-500 shrink-0" />
                      <p className="text-sm text-gray-600">{brief.gap_description}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {briefs.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200"
        >
          <Check className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No fix briefs yet</p>
          <p className="text-sm text-gray-400 mt-1">Run a scan to generate recommendations</p>
        </motion.div>
      )}
    </div>
  );
}
