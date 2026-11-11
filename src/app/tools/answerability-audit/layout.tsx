import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content Answerability Diagnostic Tool (40–60 Word Rule) | AEO Checker',
  description:
    'Test if your website copy satisfies the 40–60 word AI featured chunking rule. Optimize paragraphs for verbatim quotation by Google AI Overviews, ChatGPT Search, and Perplexity.',
  alternates: {
    canonical: '/tools/answerability-audit',
  },
  openGraph: {
    title: 'Content Answerability Diagnostic Tool — 40–60 Word AI Rule',
    description:
      'Audit your landing page paragraphs against generative AI quotation standards. Receive rewritten 45-word featured answer blocks ready for publication.',
    url: '/tools/answerability-audit',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Content Answerability Diagnostic Tool — AEO Chunk Tester',
    description: 'Optimize your copy for direct AI featured citations in ChatGPT and Google AI Overviews.',
  },
};

export default function AnswerabilityAuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-checker.com';

  const webAppJson = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Content Answerability Diagnostic Engine',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    url: `${siteUrl}/tools/answerability-audit`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Free diagnostic tool to test landing page content chunking against generative search answer quotation rules.',
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Tools',
        item: `${siteUrl}/resources`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Content Answerability Diagnostic',
        item: `${siteUrl}/tools/answerability-audit`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {children}
    </>
  );
}
