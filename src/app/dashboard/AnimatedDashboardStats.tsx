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
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

function SmartCountUp({ rawValue }: { rawValue: number | string }) {
  const prefersReducedMotion = useReducedMotion();
  const rawString = String(rawValue);

  // Extract number and suffix, e.g. "84/100" -> num: 84, suffix: "/100"; "100%" -> num: 100, suffix: "%"
  const match = rawString.match(/^(\d+)(.*)$/);
  const targetNum = match ? parseInt(match[1], 10) : null;
  const suffix = match ? match[2] : '';

  const [currentNum, setCurrentNum] = useState(0);

  useEffect(() => {
    if (targetNum === null || prefersReducedMotion) {
      if (targetNum !== null) setCurrentNum(targetNum);
      return;
    }

    let start = 0;
    const duration = 900;
    const step = Math.max(1, Math.ceil(targetNum / (duration / 16)));
    const id = setInterval(() => {
      start += step;
      if (start >= targetNum) {
        setCurrentNum(targetNum);
        clearInterval(id);
        return;
      }
      setCurrentNum(start);
    }, 16);
    return () => clearInterval(id);
  }, [targetNum, prefersReducedMotion]);

  if (targetNum === null) {
    return <span className="tabular-nums font-mono">{rawValue}</span>;
  }

  return (
    <span className="tabular-nums font-mono">
      {currentNum}
      {suffix && <span className="font-sans font-semibold text-slate-400 text-lg">{suffix}</span>}
    </span>
  );
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
    bg: 'bg-blue-50/90',
    border: 'border-blue-200/70',
    text: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-700 border-blue-200/70',
    glow: 'hover:border-blue-300 hover:ring-2 hover:ring-blue-100',
  },
  purple: {
    bg: 'bg-purple-50/90',
    border: 'border-purple-200/70',
    text: 'text-purple-600',
    badge: 'bg-purple-50 text-purple-700 border-purple-200/70',
    glow: 'hover:border-purple-300 hover:ring-2 hover:ring-purple-100',
  },
  emerald: {
    bg: 'bg-emerald-50/90',
    border: 'border-emerald-200/70',
    text: 'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    glow: 'hover:border-emerald-300 hover:ring-2 hover:ring-emerald-100',
  },
  amber: {
    bg: 'bg-amber-50/90',
    border: 'border-amber-200/70',
    text: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-700 border-amber-200/70',
    glow: 'hover:border-amber-300 hover:ring-2 hover:ring-amber-100',
  },
};

export function AnimatedDashboardStats({ items }: { items: StatItem[] }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={container}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {items.map((s, idx) => {
        const IconComponent = s.icon || defaultIcons[idx % defaultIcons.length];
        const accentKey = s.accent || defaultAccents[idx % defaultAccents.length];
        const styles = accentStyles[accentKey];

        return (
          <motion.div
            key={s.label}
            variants={item}
            whileHover={
              prefersReducedMotion ? undefined : { y: -3, transition: { duration: 0.18 } }
            }
            className={`group relative rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs hover:shadow-card transition-all duration-200 ${styles.glow} overflow-hidden`}
          >
            {/* Subtle Top-Right Ambient Glow */}
            <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-slate-100/50 blur-xl group-hover:bg-emerald-100/30 transition-colors" />

            <div className="flex items-center justify-between mb-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${styles.bg} ${styles.border} ${styles.text} shadow-2xs`}
              >
                <IconComponent className="h-5 w-5" />
              </div>
              {s.badge && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${styles.badge}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
                  {s.badge}
                </span>
              )}
            </div>

            <div>
              <p className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                <SmartCountUp rawValue={s.value} />
              </p>
              <p className="text-xs font-bold text-slate-800 mt-1 leading-tight">
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
