'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface Props {
  data: number[];
}

export function TrendChart({ data }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const vals = data;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const pts = vals
    .map((v, i) => `${(i / (vals.length - 1)) * 300},${80 - ((v - min) / range) * 70 - 5}`)
    .join(' ');

  return (
    <motion.svg
      viewBox="0 0 300 80"
      className="w-full h-20"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.polyline
        points={pts}
        fill="none"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0, pathOffset: 0 }}
        animate={{ pathLength: 1 }}
        transition={prefersReducedMotion ? undefined : { duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      {vals.map((v, i) => (
        <motion.circle
          key={i}
          cx={(i / (vals.length - 1)) * 300}
          cy={80 - ((v - min) / range) * 70 - 5}
          r="2.5"
          fill="#10b981"
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: prefersReducedMotion ? 0 : 0.3 + i * 0.06, ease: 'backOut' }}
        />
      ))}
    </motion.svg>
  );
}