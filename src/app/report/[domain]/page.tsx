export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
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
    openGraph: {
      title: `${capitalized} - AEO Analysis & AI Visibility Report`,
      description: `Complete Answer Engine Optimization (AEO) benchmark, citation rate, and competitor Share of Voice for ${domain}`,
      type: 'website',
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
  try {
    const authRes = await supabase.auth.getUser();
    user = authRes?.data?.user || null;
  } catch {
    user = null;
  }

  // Generate full rich analysis dataset for this domain
  const reportData = generateFullReportData(cleanDomain);

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReportView data={reportData} userEmail={user?.email || null} />
    </>
  );
}
