import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About AEO Checker — AI Search & Answer Engine Optimization',
  description: 'Learn about AEO Checker, our mission to make AI search visibility transparent, and how we help brands track citations across ChatGPT, Gemini, Claude, and Perplexity.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About AEO Checker — AI Search Visibility Platform',
    description: 'We help brands monitor and optimize their presence in AI-generated answers across major LLMs.',
    url: '/about',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-display text-4xl font-bold tracking-tight mb-6">About AEO Checker</h1>
        <p className="text-slate-600 leading-relaxed mb-4">AEO Visibility Tracker helps brands understand how they appear in AI-generated answers. We monitor ChatGPT, Gemini, Claude, Perplexity, DeepSeek, and Mistral so you can see what AI says about your brand.</p>
        <p className="text-slate-600 leading-relaxed mb-4">Our mission is to give every business, from solo founders to agencies, the same visibility intelligence that large enterprises pay thousands for — at a fraction of the cost.</p>
        <p className="text-slate-600 leading-relaxed">We believe AEO is the next frontier of search. As users shift from clicking blue links to reading AI answers, brands must track and improve their presence in those answers.</p>
      </div>
    </main>
  );
}
