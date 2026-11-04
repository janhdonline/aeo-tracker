import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "AEO Visibility Tracker — Track Your Brand in AI Answers",
  description: "Monitor how ChatGPT, Gemini, Claude, Perplexity, DeepSeek, and Mistral talk about your brand. Get actionable fix briefs.",
  openGraph: {
    title: "AEO Visibility Tracker",
    description: "Track your brand's visibility in AI-generated answers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.variable} ${space.variable} ${inter.className} min-h-full flex flex-col bg-white text-slate-900`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "AEO Visibility Tracker",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
