export const dynamic = 'force-dynamic';

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

  const supabase = await createClient();

  // Get current authenticated user if logged in
  let user: any = null;
  let userPlan: string | null = null;
  try {
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

  // Check public_reports_cache first
  let reportData: any = null;
  const admin = createAdminClient();
  try {
    const { data: cached } = await admin
      .from('public_reports_cache')
      .select('*')
      .eq('domain', cleanDomain)
      .maybeSingle();

    if (cached && cached.summary_metrics) {
      reportData = {
        domain: cached.domain,
        brandName: cached.brand_name,
        score: cached.visibility_score,
        shareOfVoice: `${cached.share_of_voice_pct}%`,
        ...cached.summary_metrics,
        modelAnalyses: cached.model_analyses,
        promptDetails: cached.prompt_details,
        productRankings: cached.product_rankings || [],
        sources: cached.sources || [],
      };
    }
  } catch (err) {
    console.warn('Error reading public_reports_cache:', err);
  }

  if (!reportData) {
    reportData = generateFullReportData(cleanDomain);
    try {
      await admin.from('public_reports_cache').upsert(
        {
          domain: cleanDomain,
          brand_name: reportData.brandName,
          visibility_score: reportData.score,
          share_of_voice_pct: parseFloat(reportData.shareOfVoice) || 0,
          summary_metrics: {
            totalAudited: reportData.totalAudited,
            scoreBadge: reportData.scoreBadge,
            engineCoveragePct: reportData.engineCoveragePct,
            sourceCitationsCount: reportData.sourceCitationsCount,
            fanoutQueries: reportData.fanoutQueries,
            competitors: reportData.competitors,
          },
          model_analyses: reportData.modelAnalyses,
          prompt_details: reportData.promptDetails,
          product_rankings: reportData.productRankings,
          sources: reportData.sources,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'domain' }
      );
    } catch (cacheErr) {
      console.warn('Failed to cache public report:', cacheErr);
    }
  }

  // If this domain is already tracked in our database with snapshot scores, overlay real score
  try {
    const { data: project } = await supabase
      .from('projects')
      .select('id, brand_name, domain')
      .eq('domain', cleanDomain)
      .maybeSingle();

    if (project) {
      const { data: latestScore } = await supabase
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
