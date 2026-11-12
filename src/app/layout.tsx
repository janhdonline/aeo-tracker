import type { Metadata, Viewport } from "next";
import { ChunkErrorRecovery } from "@/components/ChunkErrorRecovery";
import { GlobalAnnouncementBanner } from "@/components/GlobalAnnouncementBanner";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const inter = {
  variable: "font-sans",
  className: "font-sans",
};

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://aeo-checker.com"
).replace(/\/$/, "");
const title = "AEO Tracker — AI Search & Answer Engine Optimization Platform";
const description =
  "Measure and scale your brand's visibility in AI answers. Benchmark citations across ChatGPT, Google Gemini, Claude, and Perplexity with verified diagnostic intelligence.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | AEO Tracker",
  },
  description,
  applicationName: "AEO Tracker",
  authors: [{ name: "AEO Tracker" }],
  creator: "AEO Tracker",
  publisher: "AEO Tracker",
  category: "technology",
  classification: "SEO & Answer Engine Optimization",
  keywords: [
    "AEO tracker",
    "AEO checker",
    "AEO visibility",
    "Answer Engine Optimization",
    "AI search visibility",
    "AI SEO tool",
    "brand monitoring in AI",
    "SEO AEO analysis",
    "ChatGPT brand visibility",
    "Gemini visibility",
    "DeepSeek visibility",
    "Perplexity SEO",
    "AI citation tracking",
    "share of voice AI",
    "AI brand mentions",
    "GPTBot optimization",
    "ClaudeBot SEO",
    "AI crawler audit",
    "llms.txt generator",
    "traffic leak detection",
    "AI visibility score",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AEO Tracker",
    title,
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AEO Tracker — SEO and AEO visibility dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${siteUrl}/#software-application`,
  name: "AEO Tracker",
  alternateName: "AEO Visibility Platform",
  url: siteUrl,
  description,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "SEO & Answer Engine Optimization",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  inLanguage: "en",
  screenshot: `${siteUrl}/og-image.png`,
  featureList: [
    "AI visibility score and brand mention tracking",
    "Prompt-level AEO analytics and charts",
    "Competitor share-of-voice benchmarking",
    "AI citation and source discovery",
    "Brand sentiment analysis across AI answers",
    "Prioritized AEO action plans and one-time reports",
    "Traffic leak detection (mention vs citation rate)",
    "AI crawler readiness audit",
    "llms.txt generator for AI agents",
    "Weekly email digests with score changes",
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    description: "Free instant SEO and AEO visibility scan. No credit card required.",
  },
  publisher: {
    "@type": "Organization",
    name: "AEO Tracker",
    url: siteUrl,
  },
  mainEntityOfPage: siteUrl,
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  url: siteUrl,
  name: "AEO Tracker",
  description,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/report/{search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className={`${inter.variable} ${inter.className} flex min-h-full flex-col bg-white text-[#111827]`}>
        <ImpersonationBanner />
        <GlobalAnnouncementBanner />
        <ChunkErrorRecovery />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([softwareApplicationSchema, websiteSchema]) }}
        />
        {children}
      </body>
    </html>
  );
}
