import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-checker.com';

const BLOG_POSTS: Record<string, { slug: string; title: string; date: string; category: string; content: string }> = {
  'what-is-aeo': {
    slug: 'what-is-aeo',
    title: 'What is AEO? The Complete Guide to Answer Engine Optimization',
    date: '2026-11-01',
    category: 'AEO Basics',
    content: 'Answer Engine Optimization (AEO) is the practice of optimizing your brand\'s visibility in AI-generated answers from ChatGPT, Google Gemini, Perplexity, and other AI assistants.\n\n## Why AEO Matters\n\nAI search is growing rapidly. As more people use chatbots for research and decision-making, appearing in AI answers becomes a new form of digital visibility.\n\n## How AI Answers Work\n\nAI models like ChatGPT and Gemini:\n- Search the web for relevant information\n- Read articles, reviews, and expert content\n- Synthesize answers from multiple sources\n- Cite sources when possible\n\nYour goal is to be the source they cite.\n\n## Key AEO Strategies\n\n1. Create authoritative, well-cited content\n2. Get mentioned on high-authority sites AI models read\n3. Optimize for conversational queries\n4. Build brand mentions across the web\n5. Use structured data and clear content formats',
  },
  'aeo-vs-seo': {
    slug: 'aeo-vs-seo',
    title: "AEO vs SEO: What's the Difference?",
    date: '2026-10-28',
    category: 'Strategy',
    content: 'Traditional SEO optimizes for Google, Bing, and other search engines. AEO optimizes for ChatGPT, Gemini, Perplexity, and Claude.\n\n## Key Differences\n\nSEO focuses on keywords, backlinks, and technical optimization for traditional search engines. AEO focuses on brand mentions, citations, and authority signals that AI models use.\n\n## Why Both Matter\n\nYour website should be optimized for both traditional search AND AI answers. They reinforce each other.\n\n## The Future of Search\n\nAI assistants are changing how people find information. Companies that optimize for both SEO and AEO will have the strongest online presence.',
  },
};

interface PageProps { params: { slug: string } }

export function generateMetadata({ params }: PageProps): Metadata {
  const post = BLOG_POSTS[params.slug];
  if (!post) return { title: 'Post Not Found' };
  
  return {
    title: post.title + ' | AEO Blog',
    description: post.content.slice(0, 160),
    openGraph: { type: 'article', publishedTime: post.date, tags: [post.category] },
    alternates: { canonical: '/blog/' + params.slug },
  };
}

export function generateStaticParams() {
  return Object.keys(BLOG_POSTS).map((slug) => ({ slug }));
}

export default function BlogPostPage({ params }: PageProps) {
  const post = BLOG_POSTS[params.slug];
  if (!post) notFound();

  const breadcrumbJson = '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"' + siteUrl + '"},{"@type":"ListItem","position":2,"name":"Blog","item":"' + siteUrl + '/blog"},{"@type":"ListItem","position":3,"name":"' + post.title + '","item":"' + siteUrl + '/blog/' + params.slug + '"}]}';

  const articleJson = '{"@context":"https://schema.org","@type":"Article","headline":"' + post.title + '","datePublished":"' + post.date + '","dateModified":"' + post.date + '","author":{"@type":"Organization","name":"AEO Checker"},"publisher":{"@type":"Organization","name":"AEO Checker","logo":{"@type":"ImageObject","url":"' + siteUrl + '/og-image.png"}},"mainEntityOfPage":"' + siteUrl + '/blog/' + params.slug + '","articleSection":"' + post.category + '"}';

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: '{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"' + siteUrl + '"},{"@type":"ListItem","position":2,"name":"Blog","item":"' + siteUrl + '/blog"},{"@type":"ListItem","position":3,"name":"' + post.title + '","item":"' + siteUrl + '/blog/' + params.slug + '"}]}' }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: '{"@context":"https://schema.org","@type":"Article","headline":"' + post.title + '","datePublished":"' + post.date + '","dateModified":"' + post.date + '","author":{"@type":"Organization","name":"AEO Checker"},"publisher":{"@type":"Organization","name":"AEO Checker","logo":{"@type":"ImageObject","url":"' + siteUrl + '/og-image.png"}},"mainEntityOfPage":"' + siteUrl + '/blog/' + params.slug + '","articleSection":"' + post.category + '"}' }}
      />
      <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Link href="/blog" className="text-xs font-semibold text-slate-500 hover:text-slate-900 mb-8 inline-block">← Back to Blog</Link>
        <div className="mb-8">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">{post.category}</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mt-3 mb-2 tracking-tight">{post.title}</h1>
          <p className="text-xs text-slate-400">{post.date}</p>
        </div>
        <div className="prose prose-lg prose-slate max-w-none">
          {post.content.split('\n').map((p, i) => {
            if (p.startsWith('## ')) return <h2 key={i} className="text-2xl font-bold text-slate-900 mt-8 mb-4">{p.replace('## ', '')}</h2>;
            if (p.trim()) return <p key={i} className="text-slate-700 mb-4">{p}</p>;
            return null;
          })}
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-slate-600">Want to track your AI visibility? <Link href="/dashboard" className="text-slate-900 font-semibold hover:text-emerald-700 underline underline-offset-2">Start your free trial →</Link></p>
        </div>
      </div>
    </div>
  );
}
