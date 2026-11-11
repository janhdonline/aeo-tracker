import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free llms.txt Generator — Optimize for AI Search & LLMs | AEO Checker',
  description:
    'Generate standard-compliant /llms.txt and /llms-full.txt files to help AI agents, ChatGPT, and Claude discover, understand, and cite your content.',
  alternates: {
    canonical: '/tools/llms-generator',
  },
  openGraph: {
    title: 'Free llms.txt Generator for AI Search Engine Optimization',
    description:
      'Generate standard-compliant llms.txt files for AI assistants and agentic search engines.',
    url: '/tools/llms-generator',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free llms.txt Generator',
    description: 'Create standard-compliant /llms.txt for AI agents and LLM scrapers.',
  },
};

export default function LlmsGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-checker.com';

  const webAppJson = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'llms.txt Generator Tool',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    url: `${siteUrl}/tools/llms-generator`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Generate standard-compliant /llms.txt and /llms-full.txt files for AI agents and LLM crawlers.',
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
        name: 'llms.txt Generator',
        item: `${siteUrl}/tools/llms-generator`,
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
