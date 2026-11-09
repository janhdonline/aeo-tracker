import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AEO Blog — AI SEO Insights & Guides',
  description: 'Learn about Answer Engine Optimization, AI search trends, and how to improve your brand visibility in ChatGPT, Gemini, and Perplexity.',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'AEO Visibility Tracker',
  },
};

const posts = [
  {
    slug: 'what-is-aeo',
    title: 'What is AEO? The Complete Guide to Answer Engine Optimization',
    excerpt: 'Learn how Answer Engine Optimization works and why it matters for your brand in the age of AI search.',
    date: '2026-11-01',
    category: 'AEO Basics',
  },
  {
    slug: 'aeo-vs-seo',
    title: 'AEO vs SEO: What\'s the Difference?',
    excerpt: 'Traditional SEO focuses on Google. AEO focuses on AI chatbots. Here\'s how they differ and why you need both.',
    date: '2026-10-28',
    category: 'Strategy',
  },
  {
    slug: 'chatgpt-seo-guide',
    title: 'How to Get Mentioned in ChatGPT Answers',
    excerpt: 'Practical strategies to increase your brand visibility in ChatGPT responses.',
    date: '2026-10-20',
    category: 'ChatGPT',
  },
  {
    slug: 'google-gemini-seo',
    title: 'Google Gemini SEO: Optimizing for AI Overviews',
    excerpt: 'Gemini now powers Google AI Overviews. Learn how to get cited in these answers.',
    date: '2026-10-15',
    category: 'Google Gemini',
  },
  {
    slug: 'perplexity-optimization',
    title: 'How to Rank in Perplexity Answers',
    excerpt: 'Perplexity cites sources differently than traditional search. Here\'s how to optimize.',
    date: '2026-10-10',
    category: 'Perplexity',
  },
  {
    slug: 'ai-traffic-analytics',
    title: 'AI Bot Traffic: Analytics vs Reality',
    excerpt: 'Why traditional analytics mislead and how to track AI crawler visits properly.',
    date: '2026-10-05',
    category: 'Analytics',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">AEO Blog</h1>
        <p className="text-xl text-slate-600 mb-12">Insights on Answer Engine Optimization, AI search, and brand visibility.</p>

        <div className="space-y-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
              <article className="border-b border-slate-200 pb-8 last:border-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">{post.category}</span>
                  <span className="text-xs text-slate-500">{post.date}</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                  {post.title}
                </h2>
                <p className="text-slate-600">{post.excerpt}</p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
