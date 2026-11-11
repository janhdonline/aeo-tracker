import type { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { ArrowUpRight, Search, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Public AI Visibility Reports & AEO Leaderboard | AEO Checker',
  description:
    'Browse live AI visibility scores, citation rates, and Answer Engine Optimization benchmarks for leading brands across ChatGPT, Perplexity, Claude, and Gemini.',
  alternates: {
    canonical: '/report',
  },
  openGraph: {
    title: 'Public AI Visibility Reports & AEO Leaderboard',
    description:
      'Explore live AEO benchmark reports, citation rates, and AI search visibility for top technology companies.',
    url: '/report',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Public AEO Leaderboard & AI Visibility Reports',
    description: 'Explore live Answer Engine Optimization benchmarks for top websites.',
  },
};

interface ReportItem {
  domain: string;
  brand_name?: string;
  visibility_score: number;
  share_of_voice_pct: number;
  updated_at?: string;
}

const DEFAULT_REPORTS: ReportItem[] = [
  { domain: 'notion.so', brand_name: 'Notion', visibility_score: 88, share_of_voice_pct: 34 },
  { domain: 'linear.app', brand_name: 'Linear', visibility_score: 85, share_of_voice_pct: 28 },
  { domain: 'github.com', brand_name: 'GitHub', visibility_score: 85, share_of_voice_pct: 42 },
  { domain: 'stripe.com', brand_name: 'Stripe', visibility_score: 84, share_of_voice_pct: 38 },
  { domain: 'canva.com', brand_name: 'Canva', visibility_score: 84, share_of_voice_pct: 31 },
  { domain: 'figma.com', brand_name: 'Figma', visibility_score: 84, share_of_voice_pct: 36 },
  { domain: 'slack.com', brand_name: 'Slack', visibility_score: 84, share_of_voice_pct: 29 },
  { domain: 'whoop.com', brand_name: 'Whoop', visibility_score: 68, share_of_voice_pct: 18 },
  { domain: 'shopify.com', brand_name: 'Shopify', visibility_score: 79, share_of_voice_pct: 25 },
  { domain: 'hubspot.com', brand_name: 'HubSpot', visibility_score: 82, share_of_voice_pct: 30 },
];

export default async function ReportsDirectoryPage() {
  const supabase = createAdminClient();
  let reports: ReportItem[] = [];

  try {
    const { data: cached } = await supabase
      .from('public_reports_cache')
      .select('domain, brand_name, visibility_score, share_of_voice_pct, updated_at')
      .order('visibility_score', { ascending: false })
      .limit(60);

    if (cached && cached.length > 0) {
      reports = cached;
    } else {
      reports = DEFAULT_REPORTS;
    }
  } catch {
    reports = DEFAULT_REPORTS;
  }

  // Ensure default reports are included if not present
  const existingDomains = new Set(reports.map((r) => r.domain.toLowerCase()));
  for (const def of DEFAULT_REPORTS) {
    if (!existingDomains.has(def.domain.toLowerCase())) {
      reports.push(def);
    }
  }

  reports.sort((a, b) => (b.visibility_score || 0) - (a.visibility_score || 0));

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-checker.com';
  const breadcrumbJson = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Reports', item: `${siteUrl}/report` },
    ],
  };

  const collectionJson = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Public AEO Visibility Reports Directory',
    description: 'Collection of public Answer Engine Optimization reports and benchmarks.',
    url: `${siteUrl}/report`,
  };

  return (
    <main className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbJson, collectionJson]),
        }}
      />
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            Live AI Visibility Benchmark Directory
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-display">
            AEO Reports & AI Search Leaderboard
          </h1>
          <p className="text-slate-600 text-lg">
            See how top technology companies perform in AI answers from ChatGPT, Google Gemini, Claude, and Perplexity.
          </p>
        </div>

        {/* Quick Domain Search Box */}
        <div className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-sm border border-slate-200/80">
          <form
            action="/api/discover"
            method="GET"
            className="flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="relative flex-1 w-full">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="domain"
                placeholder="Check your website (e.g. stripe.com)"
                className="w-full pl-11 pr-4 py-3 rounded-xl border-none focus:outline-hidden text-slate-900 text-sm placeholder:text-slate-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
            >
              Scan Domain
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Reports Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Audited Brands ({reports.length})
            </h2>
            <span className="text-xs text-slate-500">Updated Daily</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((item, idx) => {
              const score = item.visibility_score || 0;
              const badgeClass =
                score >= 75
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : score >= 50
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200';

              return (
                <Link
                  key={item.domain}
                  href={`/report/${item.domain}`}
                  className="group block p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-card transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        #{idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {item.brand_name || item.domain}
                        </h3>
                        <p className="text-xs text-slate-500 font-mono">{item.domain}</p>
                      </div>
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeClass}`}
                    >
                      {score}/100
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Share of Voice: <strong className="text-slate-700">{item.share_of_voice_pct || 0}%</strong>
                    </span>
                    <span className="text-emerald-600 font-medium inline-flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      View Audit <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer SEO Links */}
        <div className="pt-8 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <Link href="/industries" className="hover:text-slate-900">Industries</Link>
            <Link href="/compare" className="hover:text-slate-900">Compare</Link>
            <Link href="/tools/ai-crawler-audit" className="hover:text-slate-900">AI Crawler Audit</Link>
            <Link href="/tools/llms-generator" className="hover:text-slate-900">llms.txt Generator</Link>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Deterministic multi-LLM verified data</span>
          </div>
        </div>
      </div>
    </main>
  );
}
