'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Globe, Sparkles, Target, Activity, LucideIcon } from 'lucide-react';

export interface StatItem {
  label: string;
  value: number | string;
  subtext?: string;
  badge?: string;
  icon?: LucideIcon;
  accent?: 'blue' | 'purple' | 'emerald' | 'amber';
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
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
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
    const duration = 800;
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

const defaultIcons: LucideIcon[] = [Globe, Sparkles, Target, Activity];
const defaultAccents: Array<'blue' | 'purple' | 'emerald' | 'amber'> = [
  'blue',
  'purple',
  'emerald',
  'amber',
];

const accentStyles = {
  blue: {
    bg: 'bg-blue-50/80',
    border: 'border-blue-100',
    text: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-700 border-blue-200/60',
    glow: 'group-hover:border-blue-300',
  },
  purple: {
    bg: 'bg-purple-50/80',
    border: 'border-purple-100',
    text: 'text-purple-600',
    badge: 'bg-purple-50 text-purple-700 border-purple-200/60',
    glow: 'group-hover:border-purple-300',
  },
  emerald: {
    bg: 'bg-emerald-50/80',
    border: 'border-emerald-100',
    text: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    glow: 'group-hover:border-emerald-300',
  },
  amber: {
    bg: 'bg-amber-50/80',
    border: 'border-amber-100',
    text: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-700 border-amber-200/60',
    glow: 'group-hover:border-amber-300',
  },
};

export function AnimatedDashboardStats({ items }: { items: StatItem[] }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={container}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {items.map((s, idx) => {
        const IconComponent = s.icon || defaultIcons[idx % defaultIcons.length];
        const accentKey = s.accent || defaultAccents[idx % defaultAccents.length];
        const styles = accentStyles[accentKey];

        return (
          <motion.div
            key={s.label}
            variants={item}
            whileHover={prefersReducedMotion ? undefined : { y: -3, transition: { duration: 0.18 } }}
            className={`group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-card transition-all duration-200 ${styles.glow} overflow-hidden`}
          >
            {/* Subtle Top-Right Ambient Glow */}
            <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-slate-100/50 blur-xl group-hover:bg-emerald-100/30 transition-colors" />

            <div className="flex items-center justify-between mb-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${styles.bg} ${styles.border} ${styles.text} shadow-2xs`}>
                <IconComponent className="h-4 w-4" />
              </div>
              {s.badge && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border ${styles.badge}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
                  {s.badge}
                </span>
              )}
            </div>

            <div>
              <p className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {s.numeric && typeof s.value === 'number' ? (
                  <CountUp target={s.value} />
                ) : (
                  s.value
                )}
              </p>
              <p className="text-xs font-semibold text-slate-700 mt-1 leading-tight">
                {s.label}
              </p>
              {s.subtext && (
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                  {s.subtext}
                </p>
              )}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}