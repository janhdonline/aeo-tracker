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
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
    >
      {items.map((s) => (
        <motion.div
          key={s.label}
          variants={item}
          whileHover={prefersReducedMotion ? undefined : { y: -3, transition: { duration: 0.18 } }}
          className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-[#eb9d2a]/40 transition-shadow duration-200"
        >
          <p className="font-display text-3xl font-bold text-slate-900">
            {s.numeric && typeof s.value === 'number' ? (
              <CountUp target={s.value} />
            ) : (
              s.value
            )}
          </p>
          <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          <span className="absolute bottom-3 right-4 h-1 w-8 rounded-full bg-[#eb9d2a]/20 opacity-0 transition-opacity group-hover:opacity-100" />
        </motion.div>
      ))}
    </motion.div>
  );
}