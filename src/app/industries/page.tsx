import { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'AI Visibility Index — Industry Benchmarks',
  description: 'See which websites are most cited in AI answers by industry. Aggregated from 1000+ AEO visibility scans.',
  openGraph: { type: 'website', locale: 'en_US' },
};

const industries = [
  { slug: 'saas', name: 'SaaS' },
  { slug: 'ecommerce', name: 'E-commerce' },
  { slug: 'healthcare', name: 'Healthcare' },
  { slug: 'finance', name: 'Finance' },
  { slug: 'legal', name: 'Legal' },
  { slug: 'real-estate', name: 'Real Estate' },
  { slug: 'education', name: 'Education' },
  { slug: 'marketing', name: 'Marketing' },
  { slug: 'media', name: 'Media & Publishing' },
  { slug: 'hospitality', name: 'Hospitality' },
];

export default function IndexPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">AI Visibility Index</h1>
        <p className="text-xl text-slate-600 mb-12">
          See which websites are most cited in AI answers, organized by industry.
          Data aggregated from 1000+ AEO visibility scans.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {industries.map((industry) => (
            <Link
              key={industry.slug}
              href={`/index/${industry.slug}`}
              className="block p-6 rounded-xl border border-slate-200 hover:border-[#eb9d2a] hover:shadow-md transition-all"
            >
              <h2 className="text-lg font-semibold text-slate-900">{industry.name}</h2>
              <p className="text-sm text-slate-500 mt-1">
                Most-cited sources in AI answers for {industry.name.toLowerCase()} businesses
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
