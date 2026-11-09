import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'AEO Resources — Guides, Tools & Templates',
  description: 'Free AEO resources including AI crawler audit tool, llms.txt generator, keyword discovery guides, and more.',
  openGraph: { type: 'website', locale: 'en_US' },
};

const resources = [
  {
    title: 'AI Crawler Readiness Audit',
    description: 'Check if your website is properly configured for AI crawlers like GPTBot, ClaudeBot, and PerplexityBot.',
    href: '/tools/ai-crawler-audit',
    icon: '🤖',
  },
  {
    title: 'llms.txt Generator',
    description: 'Generate honest llms.txt files for AI agents and IDE assistants.',
    href: '/tools/llms-generator',
    icon: '📄',
  },
  {
    title: 'AEO vs SEO Guide',
    description: 'Learn the key differences between traditional SEO and Answer Engine Optimization.',
    href: '/blog/aeo-vs-seo',
    icon: '📚',
  },
  {
    title: 'What is AEO?',
    description: 'Complete guide to Answer Engine Optimization and why it matters.',
    href: '/blog/what-is-aeo',
    icon: '📖',
  },
  {
    title: 'Compare AEO Tools',
    description: 'See how our tool compares to other AI visibility trackers.',
    href: '/compare',
    icon: '⚖️',
  },
  {
    title: 'Free AEO Check',
    description: 'Get a free AI visibility check for any website.',
    href: '/',
    icon: '🔍',
  },
];

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">AEO Resources</h1>
        <p className="text-xl text-slate-600 mb-12">Free tools and guides to improve your AI visibility.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((r) => (
            <Link key={r.href} href={r.href} className="block p-6 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-card transition-all">
              <div className="text-3xl mb-3">{r.icon}</div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">{r.title}</h2>
              <p className="text-sm text-slate-600">{r.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
