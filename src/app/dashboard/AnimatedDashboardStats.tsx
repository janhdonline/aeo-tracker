'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface StatItem {
  label: string;
  value: number | string;
  numeric?: boolean;
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

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setCount(target);
      return;
    }
    let start = 0;
    const duration = 900;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const id = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(id);
        return;
      }
      setCount(start);
    }, 16);
    return () => clearInterval(id);
  }, [target, prefersReducedMotion]);

  return <span>{count}</span>;
}

export function AnimatedDashboardStats({ items }: { items: StatItem[] }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={container}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="show"
      className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 mb-8"
    >
      {items.map((s) => (
        <motion.div
          key={s.label}
          variants={item}
          whileHover={prefersReducedMotion ? undefined : { y: -2, transition: { duration: 0.18 } }}
          className="group relative rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs hover:shadow-card hover:border-slate-300 transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {s.numeric && typeof s.value === 'number' ? (
                <CountUp target={s.value} />
              ) : (
                s.value
              )}
            </p>
            <span className="h-2 w-2 rounded-full bg-emerald-500 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-200" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1 truncate">{s.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}