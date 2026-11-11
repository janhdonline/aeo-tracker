'use client';

import { useState } from 'react';
import { Layers, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

interface PlatformTip {
  title: string;
  detail: string;
  severity: 'critical' | 'high' | 'medium';
}

interface PlatformGuide {
  id: string;
  name: string;
  tips: PlatformTip[];
}

interface PlatformOptimizationTabsProps {
  domain: string;
}

export function PlatformOptimizationTabs({ domain }: PlatformOptimizationTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('chatgpt');

  const platforms: PlatformGuide[] = [
    {
      id: 'chatgpt',
      name: 'ChatGPT / SearchGPT',
      tips: [
        {
          title: 'Enable /llms.txt at root',
          detail: 'ChatGPT and SearchGPT use /llms.txt to ingest structured brand truths without web scraping hallucinations.',
          severity: 'critical',
        },
        {
          title: 'Allow GPTBot & OAI-SearchBot in robots.txt',
          detail: 'Blanket "Disallow: /" prevents OpenAI\'s indexer from accessing your product pages for real-time citations.',
          severity: 'critical',
        },
        {
          title: 'Add Article or SoftwareApplication schema',
          detail: 'Helps ChatGPT extract structured metadata, author attribution, and product pricing models directly.',
          severity: 'high',
        },
        {
          title: 'Structure self-contained 40-60 word answer blocks',
          detail: 'ChatGPT citation algorithms heavily prioritize factual, standalone paragraphs immediately following H2 questions.',
          severity: 'high',
        },
      ],
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      tips: [
        {
          title: 'Cultivate brand footprint on Reddit & Wikipedia',
          detail: 'Perplexity Pro heavily weights community discussions (r/SaaS, r/technology) and Wikipedia entity pages for real-time answers.',
          severity: 'critical',
        },
        {
          title: 'Optimize Time to First Byte (TTFB < 300ms)',
          detail: 'Perplexity search bots enforce tight timeout budgets; origins slower than 400ms are dropped from live citation fanouts.',
          severity: 'high',
        },
        {
          title: 'Anchor H2 headers to commercial buyer questions',
          detail: 'Perplexity maps user queries to exact subheadings such as "How much does [product] cost?" or "Best alternatives to [competitor]".',
          severity: 'high',
        },
        {
          title: 'Keep fresh ISO-8601 publication timestamps',
          detail: 'Perplexity prioritizes content with dateModified tags within the last 90 days over legacy documentation.',
          severity: 'medium',
        },
      ],
    },
    {
      id: 'google_ai',
      name: 'Google AI Overviews',
      tips: [
        {
          title: 'Enforce E-E-A-T author and organization signals',
          detail: 'Google AI Overviews relies on verified author entities with sameAs links to LinkedIn, Scholar, and industry credentials.',
          severity: 'critical',
        },
        {
          title: 'Allow Google-Extended without blocking Googlebot',
          detail: 'Permits Gemini model training while keeping standard web search indexing operational.',
          severity: 'high',
        },
        {
          title: 'Add FAQPage schema with concise factual answers',
          detail: 'Directly injects your brand into the multi-source AI overview card above traditional search results.',
          severity: 'high',
        },
        {
          title: 'Use structured HTML comparative tables',
          detail: 'Google Gemini extracts tabular feature comparisons directly into comparison carousels.',
          severity: 'medium',
        },
      ],
    },
    {
      id: 'claude',
      name: 'Claude',
      tips: [
        {
          title: 'Authoritative entity context via Wikidata / Wikipedia',
          detail: 'Anthropic Claude models rely on semantic entity knowledge graphs to establish trust and brand legitimacy.',
          severity: 'critical',
        },
        {
          title: 'Clean Markdown-compatible semantic HTML hierarchy',
          detail: 'Claude prefers clean semantic documents over bloated script-heavy DOM trees.',
          severity: 'high',
        },
        {
          title: 'Allow ClaudeBot and Claude-User in robots.txt',
          detail: 'Ensures web access tools can fetch live documentation when Claude users query commercial solutions.',
          severity: 'high',
        },
        {
          title: 'Provide transparent pricing and feature limitations',
          detail: 'Claude favors balanced, objective technical overviews over promotional marketing copy.',
          severity: 'medium',
        },
      ],
    },
    {
      id: 'gemini',
      name: 'Gemini',
      tips: [
        {
          title: 'Connect Google Knowledge Graph entity schema',
          detail: 'Ensure your Organization schema includes legalName, foundingDate, and official identifiers.',
          severity: 'critical',
        },
        {
          title: 'Multimodal accessibility with rich descriptive alt tags',
          detail: 'Gemini 1.5 Pro evaluates diagram images, workflow charts, and screenshots when synthesizing answers.',
          severity: 'high',
        },
        {
          title: 'Publish clear developer API documentation',
          detail: 'Gemini frequently cites API endpoints, SDK examples, and code repositories when answering technical queries.',
          severity: 'medium',
        },
      ],
    },
    {
      id: 'bing',
      name: 'Bing Copilot',
      tips: [
        {
          title: 'Ping IndexNow API on every content update',
          detail: 'Bing Copilot indexes new content within minutes through the IndexNow protocol.',
          severity: 'critical',
        },
        {
          title: 'Verify domain ownership in Bing Webmaster Tools',
          detail: 'Ensures higher crawl priority for Microsoft Copilot citations and Edge sidebar integrations.',
          severity: 'high',
        },
        {
          title: 'Include structured tabular pricing matrices',
          detail: 'Copilot frequently renders comparison tables directly in the chat interface.',
          severity: 'medium',
        },
      ],
    },
  ];

  const currentPlatform = platforms.find((p) => p.id === activeTab) || platforms[0];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-2xs">
            ⚡
          </span>
          <h3 className="font-display text-base font-bold text-slate-950">
            Platform Optimization
          </h3>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Per-Platform Playbooks
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Tailored algorithmic recommendations to secure citations across each frontier AI engine.
        </p>
      </div>

      {/* Engine Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-100 pb-2">
        {platforms.map((p) => {
          const isActive = activeTab === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-950 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Active Tab Tips Container */}
      <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-200/70 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 border border-rose-200">
              <AlertTriangle className="h-3 w-3" />
              Critical {currentPlatform.tips.length} Action Items
            </span>
            <span className="text-xs font-bold text-slate-800">
              Optimization Playbook for {currentPlatform.name}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Algorithmic Citation Guidelines
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {currentPlatform.tips.map((tip, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-200/70 shadow-2xs"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900">{tip.title}</h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  {tip.detail}
                </p>
              </div>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${
                  tip.severity === 'critical'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {tip.severity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
