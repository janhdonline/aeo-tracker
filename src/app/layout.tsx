import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ChunkErrorRecovery } from "@/components/ChunkErrorRecovery";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://aeo-checker.com"
).replace(/\/$/, "");
const title = "AEO Checker — SEO & AEO Visibility Platform";
const description =
  "Analyze your website's SEO and AEO visibility. See how your brand appears in AI answers from ChatGPT, Gemini, DeepSeek, and Perplexity—with actionable fixes.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | AEO Checker",
  },
  description,
  applicationName: "AEO Checker",
  authors: [{ name: "AEO Checker" }],
  creator: "AEO Checker",
  publisher: "AEO Checker",
  category: "technology",
  classification: "SEO & Answer Engine Optimization",
  keywords: [
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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "AEO Checker",
    title,
    description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AEO Checker — SEO and AEO visibility dashboard",
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
  name: "AEO Checker",
  alternateName: "AEO Visibility Tracker",
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
    name: "AEO Checker",
    url: siteUrl,
  },
  mainEntityOfPage: siteUrl,
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is AEO (Answer Engine Optimization)?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "AEO is the practice of optimizing your brand visibility in AI-generated answers from ChatGPT, Gemini, Perplexity, and other AI assistants. Unlike SEO which targets Google search results, AEO focuses on appearing in AI chatbot responses.",
      },
    },
    {
      "@type": "Question",
      name: "How is AEO different from SEO?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "SEO optimizes for traditional search engines (Google, Bing), while AEO optimizes for AI assistants. SEO focuses on keywords and backlinks; AEO focuses on brand mentions, citations, and authority signals that AI models use to generate answers.",
      },
    },
    {
      "@type": "Question",
      name: "Why does AI citation rate matter?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Many AI answers mention your brand but do not link to your website. This is called a traffic leak — you get brand awareness but no website visits. AEO tools help you identify and fix these gaps.",
      },
    },
    {
      "@type": "Question",
      name: "Is llms.txt an SEO ranking factor?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Google has confirmed llms.txt is not an AI search ranking factor. However, it helps AI agents and IDE assistants understand your content, which can lead to better AI-driven discovery.",
      },
    },
    {
      "@type": "Question",
      name: "Which AI engines does this tool track?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We track ChatGPT, Google Gemini, Perplexity, and Grok. Each engine is queried separately and results are analyzed for brand mentions, citations, and sentiment.",
      },
    },
    {
      "@type": "Question",
      name: "Can I cancel my subscription anytime?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can cancel your Lemon Squeezy subscription at any time with no cancellation fees. Your plan remains active until the end of the billing period.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className={`${inter.variable} ${inter.className} flex min-h-full flex-col bg-white text-[#111827]`}>
        <ChunkErrorRecovery />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([softwareApplicationSchema, faqSchema]) }}
        />
        {children}
      </body>
    </html>
  );
}
