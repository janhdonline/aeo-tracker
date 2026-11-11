'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check, Sparkles, AlertCircle, ChevronDown, ChevronUp, ArrowRight, Code2 } from 'lucide-react';

export interface FixIssue {
  id: string;
  title: string;
  category: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  solutionSnippet?: string;
  fixHref?: string;
  fixLabel?: string;
}

interface SuggestedFixesProps {
  domain: string;
  issues?: FixIssue[];
}

export function SuggestedFixesCard({ domain, issues: propIssues }: SuggestedFixesProps) {
  const [copied, setCopied] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const defaultIssues: FixIssue[] = [
    {
      id: 'llms_txt',
      title: 'Missing: llms.txt exists',
      category: 'Truth Registry',
      severity: 'critical',
      description: 'AI bots require a concise /llms.txt Markdown manifest to extract authoritative facts without crawler latency.',
      solutionSnippet: `# /llms.txt\n> ${domain}: Official AI Truth Registry\n\n## Core Offerings\n- Definitive product features and real-time capabilities.\n- Documentation: https://${domain}/docs`,
      fixHref: `/tools/llms-generator`,
      fixLabel: 'Generate llms.txt',
    },
    {
      id: 'heading_structure',
      title: 'Missing: Heading structure present (H1 -> H2 -> H3)',
      category: 'Content Structure',
      severity: 'high',
      description: 'Your landing page is missing a single definitive H1 tag with natural question-answering H2 headers.',
      solutionSnippet: `<h1>${domain} · Unified Platform</h1>\n<h2>What is ${domain}?</h2>\n<p>Direct 40-60 word answer paragraph here.</p>`,
    },
    {
      id: 'json_ld_schema',
      title: 'Missing: JSON-LD schema found',
      category: 'Structured Data',
      severity: 'critical',
      description: 'SearchGPT and Gemini rely on Schema.org JSON-LD to confirm legal entity identity and brand ownership.',
      solutionSnippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "${domain}",\n  "url": "https://${domain}"\n}\n</script>`,
    },
    {
      id: 'org_name_logo',
      title: 'Missing: Organization name & logo schema',
      category: 'Structured Data',
      severity: 'high',
      description: 'Entity knowledge graphs require organization logo, legal name, and founding date for brand disambiguation.',
      solutionSnippet: `"logo": "https://${domain}/logo.png",\n"name": "${domain}"`,
    },
    {
      id: 'faq_page_schema',
      title: 'Missing: FAQPage or HowTo schema',
      category: 'Direct Answers',
      severity: 'high',
      description: 'Zero-click answers are powered by FAQPage schema with concise question-answer pairs.',
      solutionSnippet: `{\n  "@type": "Question",\n  "name": "How does ${domain} compare to alternatives?",\n  "acceptedAnswer": { "@type": "Answer", "text": "Concise answer here." }\n}`,
    },
    {
      id: 'article_schema',
      title: 'Missing: Article / WebPage schema markup',
      category: 'Structured Data',
      severity: 'medium',
      description: 'Helps Claude and Perplexity attribute specific author bylines and publication dates to your content.',
    },
    {
      id: 'title_length',
      title: 'Missing: Title length optimization (10-70 chars)',
      category: 'Meta Quality',
      severity: 'medium',
      description: 'Page title is either missing or too verbose, causing AI search engines to truncate or hallucinate title context.',
    },
    {
      id: 'desc_length',
      title: 'Missing: Description length optimization (50-200 chars)',
      category: 'Meta Quality',
      severity: 'medium',
      description: 'Meta description should be between 50 and 200 characters to form the default snippet preview in search.',
    },
  ];

  const issues = propIssues || defaultIssues;

  const handleCopyPrompt = () => {
    const promptText = `Act as an elite Answer Engine Optimization (AEO) and technical SEO engineer.
My website is: https://${domain}
AEO Checker identified the following ${issues.length} critical issues that reduce my visibility across ChatGPT, Perplexity, Google Gemini, and Claude:

${issues
  .map(
    (issue, i) =>
      `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title}\n   - Issue: ${issue.description}`
  )
  .join('\n\n')}

Please provide:
1. Complete, copy-paste-ready Schema.org JSON-LD scripts (Organization, FAQPage, and WebPage schema) for my domain.
2. A customized /llms.txt manifest following the official llms.txt standard.
3. The recommended robots.txt rules to grant access to all 23 modern AI web crawlers.
4. Specific guidance on refactoring my headline hierarchy and 40-60 word answer blocks for maximum citation frequency.`;

    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleIssue = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white text-xs font-bold shadow-2xs">
              ⚡
            </span>
            <h3 className="font-display text-base font-bold text-slate-950">
              Suggested Fixes
            </h3>
            <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
              {issues.length} Issues Found
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Prioritized tactical checklist to elevate your domain&apos;s citability and crawlability.
          </p>
        </div>

        {/* 1-Click Copy AI Prompt Button */}
        <button
          onClick={handleCopyPrompt}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-all cursor-pointer shrink-0"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied Prompt!</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Copy all Fixes to Prompt with AI</span>
              <Copy className="h-3 w-3 text-slate-400 ml-0.5" />
            </>
          )}
        </button>
      </div>

      {/* Issues List with Red Dot Styling matching user image */}
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
        {issues.map((issue) => {
          const isExpanded = expandedId === issue.id;
          return (
            <div key={issue.id} className="transition-colors hover:bg-slate-50/50">
              <div
                onClick={() => toggleIssue(issue.id)}
                className="flex items-center justify-between p-3.5 cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {issue.title}
                  </span>
                  <span className="hidden sm:inline-flex items-center text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded bg-slate-100">
                    {issue.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-slate-400">
                    {isExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 bg-slate-50/60 border-t border-slate-100 space-y-3 text-xs">
                  <p className="text-slate-600 leading-relaxed">{issue.description}</p>

                  {issue.solutionSnippet && (
                    <div className="rounded-lg bg-slate-900 text-slate-100 p-3 font-mono text-[11px] overflow-x-auto relative">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5 mb-2">
                        <span className="flex items-center gap-1">
                          <Code2 className="h-3 w-3 text-emerald-400" /> Solution Blueprint
                        </span>
                      </div>
                      <pre className="whitespace-pre-wrap">{issue.solutionSnippet}</pre>
                    </div>
                  )}

                  {issue.fixHref && (
                    <Link
                      href={issue.fixHref}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      <span>{issue.fixLabel || 'Fix with generator'}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
