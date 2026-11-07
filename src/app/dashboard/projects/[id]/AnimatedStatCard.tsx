'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface StatItem {
  label: string;
  value: number | string;
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
          whileHover={prefersReducedMotion ? undefined : { y: -3, transition: { duration: 0.18 } }}
          className="group relative bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-[#eb9d2a]/40 transition-shadow duration-200"
        >
          <h3 className="text-sm font-medium text-slate-500">{s.label}</h3>
          <p className="font-display text-3xl font-bold text-slate-900 mt-1">{s.value}</p>
          <span className="absolute bottom-3 right-4 h-1 w-8 rounded-full bg-[#eb9d2a]/20 opacity-0 transition-opacity group-hover:opacity-100" />
        </motion.div>
      ))}
    </motion.div>
  );
}