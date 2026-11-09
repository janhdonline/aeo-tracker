'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';

interface Brief {
  id: string;
  gap_type: string;
  gap_description: string;
  status: string;
}

const item = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, x: 14, transition: { duration: 0.15 } },
};

export function AnimatedBriefsPreview({ projectId, briefs }: { projectId: string; briefs: Brief[] }) {
  const prefersReducedMotion = useReducedMotion();
  const openBriefs = briefs.filter((b) => b.status === 'open');

  if (openBriefs.length === 0) return null;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500" />
          </span>
          <h3 className="font-display text-lg font-semibold">Open Fix Briefs ({openBriefs.length})</h3>
        </div>
        <Link href={`/dashboard/projects/${projectId}/briefs`} className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors">
          View all →
        </Link>
      </div>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {openBriefs.slice(0, 5).map((brief) => (
            <motion.div
              key={brief.id}
              variants={item}
              initial="hidden"
              animate="show"
              exit="exit"
              layout
              className="border-l-4 border-yellow-400 pl-4 py-2 hover:bg-amber-50/50 rounded-r-lg transition-colors"
            >
              <p className="font-medium text-slate-900">{brief.gap_type.replace(/_/g, ' ')}</p>
              <p className="text-sm text-slate-600">{brief.gap_description}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}