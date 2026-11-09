'use client';

import { motion, useReducedMotion } from 'framer-motion';

export interface StatItem {
  label: string;
  value: number | string;
  subtext?: string;
  badge?: string;
}

interface Props {
  items: StatItem[];
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export function AnimatedStatCard({ items }: Props) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={container}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="show"
      className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6"
    >
      {items.map((s) => (
        <motion.div
          key={s.label}
          variants={item}
          whileHover={prefersReducedMotion ? undefined : { y: -2, transition: { duration: 0.18 } }}
          className="group relative bg-white p-5 rounded-2xl shadow-xs border border-slate-200/80 hover:shadow-card hover:border-slate-300 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</h3>
            {s.badge && (
              <span className="rounded-full bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                {s.badge}
              </span>
            )}
          </div>
          <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">{s.value}</p>
          {s.subtext && (
            <p className="mt-1 text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <span>{s.subtext}</span>
            </p>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
