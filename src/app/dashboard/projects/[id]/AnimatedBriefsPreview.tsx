'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

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

  function getSeverityConfig(gapType: string) {
    switch (gapType) {
      case 'traffic_leak':
      case 'competitor_wins':
        return {
          border: 'border-l-rose-500',
          bg: 'hover:bg-rose-50/40 bg-rose-50/15',
          badgeText: 'HIGH IMPACT',
          badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: ShieldAlert,
        };
      case 'source_gap':
        return {
          border: 'border-l-amber-500',
          bg: 'hover:bg-amber-50/40 bg-amber-50/15',
          badgeText: 'MEDIUM',
          badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: AlertTriangle,
        };
      case 'weak_position':
      case 'missing_mention':
      default:
        return {
          border: 'border-l-blue-500',
          bg: 'hover:bg-blue-50/40 bg-blue-50/15',
          badgeText: 'OPPORTUNITY',
          badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: AlertCircle,
        };
    }
  }

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
          <h3 className="font-display text-base font-bold text-slate-900">
            Open Fix Briefs ({openBriefs.length})
          </h3>
        </div>
        <Link
          href={`/dashboard/projects/${projectId}/briefs`}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {openBriefs.slice(0, 5).map((brief) => {
            const config = getSeverityConfig(brief.gap_type);

            return (
              <motion.div
                key={brief.id}
                variants={item}
                initial="hidden"
                animate="show"
                exit="exit"
                layout
                className={`border-l-4 ${config.border} ${config.bg} pl-3.5 pr-3 py-2.5 rounded-r-xl transition-all border-y border-r border-slate-100/60`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-bold text-xs text-slate-900 capitalize">
                    {brief.gap_type.replace(/_/g, ' ')}
                  </p>
                  <span
                    className={`inline-flex items-center rounded-md px-1.5 py-0.2 text-[9px] font-bold border ${config.badgeStyle}`}
                  >
                    {config.badgeText}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {brief.gap_description}
                </p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
