import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free AI Crawler Audit Tool (2026) — Test GPTBot, ClaudeBot & 23 AI Bots | AEO Checker',
  description:
    'Instantly audit your website robots.txt and llms.txt against 23 AI search crawlers. Verify if ChatGPT, Claude, Perplexity, and Gemini can crawl and cite your brand.',
  alternates: {
    canonical: '/tools/ai-crawler-audit',
  },
  openGraph: {
    title: 'Free AI Crawler Audit Tool — Test 23 AI Bots Live',
    description:
      'Verify if GPTBot, ClaudeBot, PerplexityBot, and Google-Extended are allowed or blocked on your site with live HTTP audit.',
    url: '/tools/ai-crawler-audit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Crawler Audit Tool — 23 AI Crawlers Test',
    description: 'Instant live audit for robots.txt & /llms.txt AI search readiness.',
  },
};

export default function AICrawlerAuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-checker.com';

  const webAppJson = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Crawler Readiness Audit Tool',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    url: `${siteUrl}/tools/ai-crawler-audit`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Free live scanner to audit website robots.txt and llms.txt against 23 AI web crawlers.',
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Resources', item: `${siteUrl}/resources` },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'AI Crawler Audit',
        item: `${siteUrl}/tools/ai-crawler-audit`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([webAppJson, breadcrumbs]),
        }}
      />
      {children}
    </>
  );
}
