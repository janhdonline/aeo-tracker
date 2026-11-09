'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface Keyword {
  id: string;
  keyword: string;
  intent: string;
  source: string;
  active: boolean;
}

interface Props {
  keywords: Keyword[];
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const item = {
  hidden: { opacity: 0, scale: 0.85, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export function AnimatedKeywords({ keywords }: Props) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      variants={container}
      initial={prefersReducedMotion ? false : 'hidden'}
      animate="show"
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6"
    >
      <h3 className="font-display text-lg font-semibold mb-4">Keywords ({keywords.length})</h3>
      {keywords.length === 0 ? (
        <p className="text-sm text-slate-500">No keywords yet. Add some or discover new ones!</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {keywords.map((kw) => (
              <motion.span
                key={kw.id}
                variants={item}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -8, transition: { duration: 0.15 } }}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.06, y: -2 }}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                  kw.intent === 'commercial'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : kw.intent === 'navigational'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {kw.keyword}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase tracking-wide ${
                    kw.source === 'discovery'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {kw.source}
                </span>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}