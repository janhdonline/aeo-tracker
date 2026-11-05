import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className={`${inter.variable} ${inter.className} flex min-h-full flex-col bg-white text-[#111827]`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
