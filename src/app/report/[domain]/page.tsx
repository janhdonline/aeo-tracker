export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { Metadata } from 'next';
import { generateFullReportData } from '@/lib/report-generator';
import { ReportView } from './ReportView';

interface Props {
  params: { domain: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const domain = decodeURIComponent(params.domain)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];

  const capitalized = domain.charAt(0).toUpperCase() + domain.slice(1);

  return {
    title: `${capitalized} - AEO Analysis & AI Visibility Report`,
    description: `See how ${domain} appears in AI-generated answers across ChatGPT, Google Gemini, Claude, and Perplexity. Powered by AEO Checker.`,
    alternates: {
      canonical: `/report/${domain}`,
    },
    openGraph: {
      title: `${capitalized} - AEO Analysis & AI Visibility Report`,
      description: `Complete Answer Engine Optimization (AEO) benchmark, citation rate, and competitor Share of Voice for ${domain}`,
      type: 'website',
      url: `/report/${domain}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${capitalized} - AEO Visibility Report`,
      description: `AI visibility audit and competitor citations for ${domain}`,
    },
  };
}

export default async function PublicReportPage({ params }: Props) {
  const rawDomain = decodeURIComponent(params.domain);
  const cleanDomain = rawDomain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0];

  const cookieStore = cookies();
  const allCookies = cookieStore.getAll();
  const hasAuthCookie = allCookies.some(
    (c) => c.name.startsWith('sb-') || c.name.includes('auth-token')
  );

  // Get current authenticated user if logged in
  let user: any = null;
  let userPlan: string | null = null;
  if (hasAuthCookie) {
    try {
      const supabase = await createClient();
      const authRes = await supabase.auth.getUser();
      user = authRes?.data?.user || null;
      if (user?.id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', user.id)
          .maybeSingle();
        if (prof?.plan) {
          userPlan = prof.plan;
        }
      }
    } catch {
      user = null;
      userPlan = null;
    }
  }

  // Generate full default baseline data for this domain
  const baseDefaults = generateFullReportData(cleanDomain);

  // Check public_reports_cache first
  let reportData: any = baseDefaults;
  const admin = createAdminClient();
  try {
    const { data: cached } = await admin
      .from('public_reports_cache')
      .select('*')
      .eq('domain', cleanDomain)
      .maybeSingle();

    if (cached) {
      let metrics = cached.summary_metrics;
      if (typeof metrics === 'string') {
        try { metrics = JSON.parse(metrics); } catch {}
      }
      let modelAnalyses = cached.model_analyses;
      if (typeof modelAnalyses === 'string') {
        try { modelAnalyses = JSON.parse(modelAnalyses); } catch {}
      }
      let promptDetails = cached.prompt_details;
      if (typeof promptDetails === 'string') {
        try { promptDetails = JSON.parse(promptDetails); } catch {}
      }
      let productRankings = cached.product_rankings;
      if (typeof productRankings === 'string') {
        try { productRankings = JSON.parse(productRankings); } catch {}
      }
      let sources = cached.sources;
      if (typeof sources === 'string') {
        try { sources = JSON.parse(sources); } catch {}
      }

      reportData = {
        ...baseDefaults,
        ...(metrics && typeof metrics === 'object' ? metrics : {}),
        domain: cached.domain || baseDefaults.domain,
        brandName: cached.brand_name || baseDefaults.brandName,
        score: cached.visibility_score ?? baseDefaults.score,
        shareOfVoice: cached.share_of_voice_pct ? `${cached.share_of_voice_pct}%` : `${baseDefaults.score}%`,
        modelAnalyses: Array.isArray(modelAnalyses) && modelAnalyses.length > 0 ? modelAnalyses : baseDefaults.aiChatbotsTable,
        promptDetails: Array.isArray(promptDetails) && promptDetails.length > 0 ? promptDetails : baseDefaults.prompts,
        prompts: Array.isArray(promptDetails) && promptDetails.length > 0 ? promptDetails : baseDefaults.prompts,
        productRankings: Array.isArray(productRankings) && productRankings.length > 0 ? productRankings : baseDefaults.productRankings,
        sources: Array.isArray(sources) && sources.length > 0 ? sources : [],
        products: (Array.isArray(metrics?.products) && metrics.products.length > 0)
          ? metrics.products
          : (Array.isArray(cached.products) && cached.products.length > 0 ? cached.products : baseDefaults.products),
        productsFoundPct: metrics?.productsFoundPct ?? cached.productsFoundPct ?? baseDefaults.productsFoundPct,
        yourProductsPct: metrics?.yourProductsPct ?? cached.yourProductsPct ?? baseDefaults.yourProductsPct,
        competitorProductsPct: metrics?.competitorProductsPct ?? cached.competitorProductsPct ?? baseDefaults.competitorProductsPct,
        bestProduct: metrics?.bestProduct || cached.bestProduct || baseDefaults.bestProduct,
        aiModels: {
          ...baseDefaults.aiModels,
          ...(metrics?.aiModels || {}),
        },
        strategy: {
          ...baseDefaults.strategy,
          ...(metrics?.strategy || {}),
        },
        trajectoryPoints: Array.isArray(metrics?.trajectoryPoints) ? metrics.trajectoryPoints : baseDefaults.trajectoryPoints,
        fanoutOpportunities: Array.isArray(metrics?.fanoutOpportunities) ? metrics.fanoutOpportunities : baseDefaults.fanoutOpportunities,
        competitorDots: Array.isArray(metrics?.competitorDots) ? metrics.competitorDots : baseDefaults.competitorDots,
        competitorNames: Array.isArray(metrics?.competitorNames) ? metrics.competitorNames : baseDefaults.competitorNames,
      };
    } else {
      try {
        await admin.from('public_reports_cache').upsert(
          {
            domain: cleanDomain,
            brand_name: baseDefaults.brandName,
            visibility_score: baseDefaults.score,
            share_of_voice_pct: parseFloat(String(baseDefaults.score)) || 0,
            summary_metrics: {
              totalAudited: 4,
              scoreBadge: baseDefaults.scoreBadge,
              engineCoveragePct: 100,
              sourceCitationsCount: baseDefaults.productRankings?.length || 12,
              fanoutQueries: baseDefaults.fanoutOpportunities?.length || 6,
              competitors: baseDefaults.competitorNames || [],
              products: baseDefaults.products,
              productsFoundPct: baseDefaults.productsFoundPct,
              yourProductsPct: baseDefaults.yourProductsPct,
              competitorProductsPct: baseDefaults.competitorProductsPct,
              bestProduct: baseDefaults.bestProduct,
            },
            model_analyses: baseDefaults.aiChatbotsTable,
            prompt_details: baseDefaults.prompts,
            product_rankings: baseDefaults.productRankings,
            sources: [],
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'domain' }
        );
      } catch (cacheErr) {
        console.warn('Failed to cache public report:', cacheErr);
      }
    }
  } catch (err) {
    console.warn('Error reading public_reports_cache:', err);
  }

  // If this domain is already tracked in our database with snapshot scores, overlay real score
  try {
    const { data: project } = await admin
      .from('projects')
      .select('id, brand_name, domain')
      .eq('domain', cleanDomain)
      .maybeSingle();

    if (project) {
      const { data: latestScore } = await admin
        .from('snapshot_scores')
        .select('*')
        .eq('project_id', project.id)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestScore && latestScore.visibility_score > 0) {
        reportData.score = latestScore.visibility_score;
        reportData.scoreBadge =
          reportData.score >= 75
            ? 'Strong AI Visibility'
            : reportData.score >= 50
            ? 'Moderate AI Visibility'
            : 'Needs Optimization';
      }
    }
  } catch (err) {
    console.warn('Error reading existing project score for public report:', err);
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-checker.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AnalysisNewsArticle',
    headline: `${cleanDomain} AEO Visibility & AI Citation Analysis`,
    description: `Complete Answer Engine Optimization report for ${cleanDomain}`,
    datePublished: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'AEO Checker',
    },
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Reports', item: `${siteUrl}/report` },
      { '@type': 'ListItem', position: 3, name: cleanDomain, item: `${siteUrl}/report/${cleanDomain}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbs]) }}
      />
      <ReportView data={reportData} userEmail={user?.email || null} userPlan={userPlan} />
    </>
  );
}
