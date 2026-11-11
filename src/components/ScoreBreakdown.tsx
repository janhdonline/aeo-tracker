'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Info } from 'lucide-react';

export interface CategoryCheckItem {
  name: string;
  passed: boolean;
  explanation: string;
}

export interface ScoreCategory {
  key: string;
  title: string;
  score: number; // out of 20
  maxScore: number;
  passedCount: number;
  totalChecks: number;
  checks: CategoryCheckItem[];
}

interface ScoreBreakdownProps {
  categories?: ScoreCategory[];
}

export function ScoreBreakdown({ categories: propCategories }: ScoreBreakdownProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  // Default balanced 100-point breakdown across 5 core pillars (20 pts each)
  const defaultCategories: ScoreCategory[] = [
    {
      key: 'ai_access',
      title: 'AI Access',
      score: 16,
      maxScore: 20,
      passedCount: 4,
      totalChecks: 5,
      checks: [
        { name: 'robots.txt accessible & valid', passed: true, explanation: 'robots.txt responds with HTTP 200 without gateway block.' },
        { name: 'GPTBot & SearchGPT allowed', passed: true, explanation: 'OpenAI crawlers have uninhibited access to public routes.' },
        { name: 'ClaudeBot & PerplexityBot permitted', passed: true, explanation: 'Anthropic and Perplexity user-agents are not disallowed.' },
        { name: 'Origin latency < 500ms for AI scrapers', passed: true, explanation: 'Origin server returns clean responses before scraper timeout.' },
        { name: 'JavaScript shell rendering barrier', passed: false, explanation: 'Heavy client-side hydration hides 35% of text from raw HTTP scrapers.' },
      ],
    },
    {
      key: 'content_structure',
      title: 'Content Structure',
      score: 16,
      maxScore: 20,
      passedCount: 4,
      totalChecks: 5,
      checks: [
        { name: 'Logical H1 -> H2 -> H3 hierarchy', passed: true, explanation: 'Headings provide clear topical anchor points for LLM attention.' },
        { name: '40-60 word concise answer blocks', passed: true, explanation: 'Paragraphs contain self-contained definitive factual statements.' },
        { name: 'Semantic HTML5 landmark tags (<main>, <article>)', passed: true, explanation: 'Proper semantic document tree separates primary content from navigation.' },
        { name: 'Entity definition in opening section', passed: true, explanation: 'First 100 words clearly state what the brand and product offer.' },
        { name: 'Bullet-point summary sections', passed: false, explanation: 'Lacks structured key takeaways or bullet summaries for prompt injection.' },
      ],
    },
    {
      key: 'schema_presence',
      title: 'Schema Presence',
      score: 4,
      maxScore: 20,
      passedCount: 1,
      totalChecks: 5,
      checks: [
        { name: 'Valid JSON-LD block detected', passed: true, explanation: 'Basic JSON-LD snippet present in document <head>.' },
        { name: 'Organization name & logo verified', passed: false, explanation: 'Missing official Organization schema with logo and legal name.' },
        { name: 'FAQPage / HowTo Q&A markup', passed: false, explanation: 'No FAQPage schema found for direct zero-click answers.' },
        { name: 'sameAs social & authority entity links', passed: false, explanation: 'Missing sameAs links to Wikipedia, LinkedIn, X, or Crunchbase.' },
        { name: 'Article or SoftwareApplication markup', passed: false, explanation: 'No domain-specific Article or Software schema to disambiguate features.' },
      ],
    },
    {
      key: 'meta_quality',
      title: 'Meta Quality',
      score: 12,
      maxScore: 20,
      passedCount: 3,
      totalChecks: 5,
      checks: [
        { name: 'Title length (10-70 characters)', passed: true, explanation: 'Page title is focused and within optimal LLM ingestion range.' },
        { name: 'OpenGraph & Twitter Card tags', passed: true, explanation: 'og:title, og:description, and og:image tags are valid.' },
        { name: 'Canonical URL declared properly', passed: true, explanation: 'rel="canonical" prevents AI model citation fragmentation.' },
        { name: 'Description length (50-200 characters)', passed: false, explanation: 'Meta description is either missing or too brief for AI summaries.' },
        { name: 'Language & charset declarations', passed: false, explanation: 'Missing explicit hreflang or content language meta tag.' },
      ],
    },
    {
      key: 'citability',
      title: 'Citability',
      score: 8,
      maxScore: 20,
      passedCount: 2,
      totalChecks: 5,
      checks: [
        { name: 'Primary brand entity recognizable', passed: true, explanation: 'Brand identity is cited consistently across primary sections.' },
        { name: 'External source verification links', passed: true, explanation: 'References reputable third-party benchmarks or statistics.' },
        { name: 'Official /llms.txt truth registry', passed: false, explanation: 'No /llms.txt manifest found for deterministic AI factual retrieval.' },
        { name: 'Comparative feature matrices/tables', passed: false, explanation: 'No Markdown or HTML tables comparing specs for LLM comparisons.' },
        { name: 'Statististics & metric density (>2 per 200w)', passed: false, explanation: 'Numerical claims lack supporting data benchmarks for citations.' },
      ],
    },
  ];

  const categories = propCategories || defaultCategories;

  const toggleCategory = (key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white text-xs font-bold shadow-2xs">
              📊
            </span>
            <h3 className="font-display text-base font-bold text-slate-950">
              Score Breakdown
            </h3>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            5 Categories · 100 Pts Total
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Detailed diagnostic analysis across the 5 fundamental pillars of Answer Engine Optimization.
        </p>
      </div>

      {/* 5 Category Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
        {categories.map((cat) => {
          const isExpanded = expandedKey === cat.key;
          const pct = Math.round((cat.score / cat.maxScore) * 100);
          const isGood = pct >= 70;
          const isMedium = pct >= 40 && pct < 70;

          const scoreColor = isGood
            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
            : isMedium
            ? 'text-amber-700 bg-amber-50 border-amber-200'
            : 'text-rose-700 bg-rose-50 border-rose-200';

          const barColor = isGood
            ? 'bg-emerald-500'
            : isMedium
            ? 'bg-amber-500'
            : 'bg-rose-500';

          return (
            <div
              key={cat.key}
              onClick={() => toggleCategory(cat.key)}
              className={`group cursor-pointer rounded-xl border p-3.5 transition-all duration-150 ${
                isExpanded
                  ? 'border-slate-950 bg-slate-50/60 shadow-xs'
                  : 'border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/40 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {cat.title}
                </span>
                <span className={`inline-flex items-center text-[11px] font-extrabold px-1.5 py-0.2 rounded-md border ${scoreColor}`}>
                  {cat.score}/{cat.maxScore}
                </span>
              </div>

              {/* Progress Track */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-medium">
                  {cat.passedCount}/{cat.totalChecks} passed
                </span>
                <span className="text-slate-400 group-hover:text-slate-700 transition-colors">
                  {isExpanded ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Accordion Drawer */}
      <AnimatePresence>
        {expandedKey && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-2"
          >
            {categories
              .filter((c) => c.key === expandedKey)
              .map((cat) => (
                <div
                  key={cat.key}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="text-xs font-bold text-slate-900">
                      {cat.title} Checklist Criteria
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Passing {cat.passedCount} of {cat.totalChecks} requirements ({Math.round((cat.score / cat.maxScore) * 100)}%)
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {cat.checks.map((chk, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 text-xs rounded-lg p-2 bg-white border border-slate-200/70"
                      >
                        {chk.passed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900">{chk.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {chk.explanation}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            chk.passed
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {chk.passed ? 'PASSED' : 'MISSING'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
