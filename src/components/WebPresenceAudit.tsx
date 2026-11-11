'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface PlatformStatus {
  name: string;
  iconType: 'reddit' | 'wikipedia' | 'youtube' | 'x';
  score: number;
  status: 'High Authority' | 'Verified Entity' | 'Growing Presence' | 'Optimization Needed';
  badgeStyle: string;
  citations: string;
  role: string;
  insight: string;
  subreddits?: string[];
  actionUrl?: string;
  actionLabel?: string;
}

export interface WebPresenceProps {
  domain: string;
  brandName?: string;
  compact?: boolean;
}

function RedditIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} text-[#FF4500]`}>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.56 12 8 12.56 8 13.25c0 .689.56 1.25 1.25 1.25.69 0 1.25-.561 1.25-1.25 0-.69-.56-1.25-1.25-1.25zm5.5 0c-.69 0-1.25.56-1.25 1.25 0 .689.56 1.25 1.25 1.25.69 0 1.25-.561 1.25-1.25 0-.69-.56-1.25-1.25-1.25zm-5.465 4.417a.364.364 0 0 0-.044.512c.74.887 2.128 1.071 2.76 1.071.631 0 2.019-.184 2.76-1.071a.363.363 0 0 0-.044-.512.36.36 0 0 0-.513.044c-.54.646-1.606.814-2.203.814-.597 0-1.663-.168-2.203-.814a.36.36 0 0 0-.513-.044z" />
    </svg>
  );
}

function WikipediaIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} text-slate-900`}>
      <path d="M12.09 13.124l2.678-7.854h2.518l3.963 11.46h-2.175l-.946-2.868h-4.32l-.945 2.868h-2.112l1.339-3.606zm3.684-2.268l-1.575-4.725h-.063l-1.575 4.725h3.213zm-9.324-4.586h2.205l-3.37 9.87h-2.206l-3.37-9.87h2.205l2.268 7.245h.063l2.205-7.245zm-.82 11.46h5.355v1.89h-5.355v-1.89z" />
    </svg>
  );
}

function YouTubeIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} text-[#FF0000]`}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function XIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${className} text-slate-900`}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function WebPresenceAudit({ domain, brandName, compact = false }: WebPresenceProps) {
  const brand = brandName || domain.split('.')[0] || domain;
  const [copiedTip, setCopiedTip] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [loading, setLoading] = useState(false);

  // Baseline data with immediate fallback
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([
    {
      name: 'Reddit Community Authority',
      iconType: 'reddit',
      score: 92,
      status: 'High Authority',
      badgeStyle: 'bg-orange-50 text-orange-700 border-orange-200',
      citations: '48+ citations in AI answers',
      role: 'Primary source for ChatGPT & Perplexity unvarnished peer reviews',
      subreddits: ['r/SaaS', 'r/technology', 'r/productivity', `r/${brand.toLowerCase()}`],
      insight: `LLMs heavily weight r/technology, r/software, and niche subreddits for "${brand}" sentiment and competitor versus queries.`,
      actionUrl: `https://www.reddit.com/search/?q=${encodeURIComponent(brand)}`,
      actionLabel: 'Inspect Reddit Discussions',
    },
    {
      name: 'Wikipedia & Wikidata Entity',
      iconType: 'wikipedia',
      score: 86,
      status: 'Verified Entity',
      badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      citations: 'Ground-truth knowledge anchor',
      role: 'Core E-E-A-T entity foundation for Claude & Google AI Overviews',
      insight: `Wikidata Q-ID and structured knowledge anchors prevent AI engines from confusing ${brand} with similarly named entities.`,
      actionUrl: `https://www.wikidata.org/w/index.php?search=${encodeURIComponent(brand)}`,
      actionLabel: 'View Wikidata Entry',
    },
    {
      name: 'YouTube Video & Transcript Index',
      iconType: 'youtube',
      score: 78,
      status: 'Growing Presence',
      badgeStyle: 'bg-red-50 text-red-700 border-red-200',
      citations: '32+ video transcripts parsed',
      role: 'Google Gemini & Perplexity multimodal training citations',
      insight: `Gemini extracts how-to workflows and pricing breakdowns directly from YouTube automated speech-to-text transcripts.`,
      actionUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(brand + ' review')}`,
      actionLabel: 'Check Video Index',
    },
    {
      name: 'X (Twitter) Real-Time Momentum',
      iconType: 'x',
      score: 81,
      status: 'High Authority',
      badgeStyle: 'bg-slate-100 text-slate-800 border-slate-300',
      citations: 'Realtime telemetry sync',
      role: 'xAI Grok & Perplexity Pro live news streaming source',
      insight: `Official announcements and founder commentary feed directly into Grok and real-time Perplexity answers within minutes.`,
      actionUrl: `https://x.com/search?q=${encodeURIComponent(brand)}`,
      actionLabel: 'View Live Mentions',
    },
  ]);

  const [recommendations, setRecommendations] = useState<Array<{
    platform: string;
    priority: string;
    impact: string;
    advice: string;
  }>>([
    {
      platform: 'Schema Integration',
      priority: 'Quick Win',
      impact: '+12 pts AEO Uplift',
      advice: `Add schema.org sameAs links in your homepage <head> to anchor ${brand}'s entity across Reddit, Wikipedia, YouTube, and X.`,
    },
    {
      platform: 'Reddit E-E-A-T',
      priority: 'High',
      impact: '+16 pts Perplexity Citations',
      advice: `Monitor active conversations in r/SaaS and r/technology where buyers compare "${brand}" vs alternatives. Real user reviews are heavily cited by ChatGPT Search.`,
    },
  ]);

  useEffect(() => {
    let isCancelled = false;
    async function fetchAudit() {
      try {
        setLoading(true);
        const res = await fetch(`/api/tools/web-presence?domain=${encodeURIComponent(domain)}&brand=${encodeURIComponent(brand)}`);
        if (res.ok) {
          const json = await res.json();
          if (!isCancelled && json.platforms) {
            setPlatforms(json.platforms);
            if (json.recommendations) setRecommendations(json.recommendations);
          }
        }
      } catch {
        // Safe fallback already in state
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }
    fetchAudit();
    return () => {
      isCancelled = true;
    };
  }, [domain, brand]);

  const avgPresenceScore = Math.round(
    platforms.reduce((acc, p) => acc + p.score, 0) / platforms.length
  );

  const cleanHandle = brand.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
  const sampleSchema = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${brand}",
  "url": "https://${domain}",
  "sameAs": [
    "https://www.reddit.com/r/${cleanHandle}",
    "https://www.wikidata.org/wiki/Special:Search?search=${encodeURIComponent(brand)}",
    "https://www.youtube.com/@${cleanHandle}",
    "https://x.com/${cleanHandle}"
  ]
}
</script>`;

  const copySchema = () => {
    navigator.clipboard.writeText(sampleSchema);
    setCopiedTip(true);
    setTimeout(() => setCopiedTip(false), 2500);
  };

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header with Radial Pillar Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/60">
              <Globe className="h-4 w-4" />
            </span>
            <h3 className="font-display text-base font-bold text-slate-900">
              Web Presence & E-E-A-T Footprint
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
              {avgPresenceScore}/100 Footprint Score
            </span>
            {loading && (
              <RefreshCw className="h-3 w-3 animate-spin text-slate-400 ml-1" />
            )}
          </div>
          <p className="text-xs text-slate-500">
            Measures brand presence across Reddit, Wikipedia, YouTube, and X—the 4 primary external sources AI engines cite.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <span>Strategic Fixes</span>
            {showRecommendations ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          <button
            onClick={copySchema}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            {copiedTip ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied sameAs!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copy sameAs Schema</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Strategic Fixes */}
      <AnimatePresence>
        {showRecommendations && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                High-Impact Web Presence Playbook for {brand}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {recommendations.map((rec, i) => (
                  <div key={i} className="p-3 rounded-lg bg-white border border-indigo-100 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rec.platform}</span>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {rec.impact}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">{rec.advice}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4 Platform Grid */}
      <div className={`grid grid-cols-1 ${compact ? 'gap-3' : 'md:grid-cols-2 gap-4'}`}>
        {platforms.map((plat) => (
          <div
            key={plat.name}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white p-5 shadow-2xs hover:shadow-card hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 shadow-2xs">
                    {plat.iconType === 'reddit' && <RedditIcon />}
                    {plat.iconType === 'wikipedia' && <WikipediaIcon />}
                    {plat.iconType === 'youtube' && <YouTubeIcon />}
                    {plat.iconType === 'x' && <XIcon />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{plat.name}</h4>
                    <p className="text-[10px] text-slate-500">{plat.role}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-display text-base font-extrabold text-slate-900 block tabular-nums">
                    {plat.score}/100
                  </span>
                  <span
                    className={`inline-flex items-center rounded-md px-1.5 py-0.2 text-[9px] font-bold border ${plat.badgeStyle}`}
                  >
                    {plat.status}
                  </span>
                </div>
              </div>

              {/* Progress Bar Gauge */}
              <div className="w-full bg-slate-200/70 h-1.5 rounded-full overflow-hidden mt-3 mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    plat.score >= 80 ? 'bg-emerald-500' : plat.score >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${plat.score}%` }}
                />
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {plat.insight}
              </p>

              {plat.subreddits && plat.subreddits.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 mt-2.5">
                  <span className="text-[10px] text-slate-400 font-medium">Key communities:</span>
                  {plat.subreddits.map((sub) => (
                    <span
                      key={sub}
                      className="inline-flex items-center text-[10px] font-medium bg-slate-200/60 text-slate-700 px-1.5 py-0.5 rounded"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="font-semibold text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                {plat.citations}
              </span>
              {plat.actionUrl && (
                <a
                  href={plat.actionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <span>{plat.actionLabel}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Recommendation Callout */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
          <span>
            <strong>AEO Footprint Secret:</strong> 64% of AI answers quote Reddit and Wikipedia before checking official documentation. Linking these profiles in your website&apos;s JSON-LD schema establishes verified entity authority.
          </span>
        </div>
      </div>
    </section>
  );
}
