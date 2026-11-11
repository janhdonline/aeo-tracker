'use client';

import { useState } from 'react';
import { FileText, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';

export interface PageCitabilityRow {
  path: string;
  score: number;
  wordCount: number;
  answerabilityScore: number;
  schemaValid: boolean;
  dimensions: {
    length: number; // 0-100
    structure: number; // 0-100
    citationDensity: number; // 0-100
  };
}

interface PageCitabilityTableProps {
  domain: string;
  initialPages?: PageCitabilityRow[];
}

export function PageCitabilityTable({ domain, initialPages }: PageCitabilityTableProps) {
  const defaultPages: PageCitabilityRow[] = [
    {
      path: '/',
      score: 84,
      wordCount: 820,
      answerabilityScore: 88,
      schemaValid: true,
      dimensions: { length: 85, structure: 90, citationDensity: 78 },
    },
    {
      path: '/pricing',
      score: 72,
      wordCount: 450,
      answerabilityScore: 75,
      schemaValid: true,
      dimensions: { length: 70, structure: 80, citationDensity: 65 },
    },
    {
      path: '/docs',
      score: 91,
      wordCount: 1650,
      answerabilityScore: 94,
      schemaValid: true,
      dimensions: { length: 95, structure: 92, citationDensity: 88 },
    },
    {
      path: '/features',
      score: 78,
      wordCount: 680,
      answerabilityScore: 82,
      schemaValid: false,
      dimensions: { length: 75, structure: 85, citationDensity: 72 },
    },
    {
      path: '/blog/what-is-aeo',
      score: 65,
      wordCount: 1240,
      answerabilityScore: 68,
      schemaValid: false,
      dimensions: { length: 80, structure: 65, citationDensity: 52 },
    },
    {
      path: '/about',
      score: 58,
      wordCount: 320,
      answerabilityScore: 55,
      schemaValid: false,
      dimensions: { length: 50, structure: 60, citationDensity: 62 },
    },
  ];

  const [pages] = useState<PageCitabilityRow[]>(initialPages || defaultPages);

  const avgScore = Math.round(
    pages.reduce((acc, p) => acc + p.score, 0) / (pages.length || 1)
  );

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white text-xs font-bold shadow-2xs">
              <FileText className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-bold text-slate-950">
              Page Citability
            </h3>
            <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700 border border-teal-200">
              Average Score: {avgScore}/100
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Route-by-route audit of content chunking, entity density, and machine answer extraction.
          </p>
        </div>
      </div>

      {/* Pages Table */}
      <div className="rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
              <tr>
                <th className="py-2.5 px-4">Page Route</th>
                <th className="py-2.5 px-4 text-center">Citability Score</th>
                <th className="py-2.5 px-4">Dimensions (Length · Structure · Citations)</th>
                <th className="py-2.5 px-4 text-right">Schema</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {pages.map((row) => {
                const isHigh = row.score >= 80;
                const isMedium = row.score >= 60 && row.score < 80;
                const scoreColor = isHigh
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : isMedium
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200';

                return (
                  <tr key={row.path} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-800">
                      {row.path}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-xs border ${scoreColor}`}>
                        {row.score}
                      </span>
                    </td>
                    <td className="py-3 px-4 min-w-[180px]">
                      {/* 3 Dimension Mini Bars */}
                      <div className="flex items-center gap-1.5">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${Math.max(15, row.dimensions.length * 0.4)}px` }}
                          title={`Content Length & Chunking: ${row.dimensions.length}%`}
                        />
                        <div
                          className="h-2 rounded-full bg-emerald-500"
                          style={{ width: `${Math.max(15, row.dimensions.structure * 0.4)}px` }}
                          title={`Heading Structure: ${row.dimensions.structure}%`}
                        />
                        <div
                          className="h-2 rounded-full bg-amber-500"
                          style={{ width: `${Math.max(15, row.dimensions.citationDensity * 0.4)}px` }}
                          title={`Citation Density: ${row.dimensions.citationDensity}%`}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {row.schemaValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Valid
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">
                          Missing
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
