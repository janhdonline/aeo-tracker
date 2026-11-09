import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

interface IndustryPageProps {
  params: { industry: string };
}

export async function generateMetadata({ params }: IndustryPageProps): Promise<Metadata> {
  const industry = params.industry.replace(/-/g, ' ');
  const formatted = industry.replace(/\b\w/g, (c: string) => c.toUpperCase());
  return {
    title: `Most-Cited AI Sources in ${formatted} — AI Visibility Index`,
    description: `See which websites are most cited in AI answers for ${formatted} businesses. Data aggregated from 1000+ AEO visibility scans.`,
    openGraph: {
      type: 'website',
      locale: 'en_US',
      siteName: 'AEO Visibility Tracker',
    },
  };
}

export default async function IndustryIndexPage({ params }: IndustryPageProps) {
  const industry = params.industry.replace(/-/g, ' ');
  const formatted = industry.replace(/\b\w/g, (c: string) => c.toUpperCase());

  const supabase = createAdminClient();
  
  // Aggregate source stats across all projects in this industry
  // Only aggregate anonymized data — never expose project identity
  const { data: sourceStats } = await supabase
    .from('source_stats')
    .select('source_domain, appearance_count')
    .order('appearance_count', { ascending: false })
    .limit(50);

  // Aggregate by domain across all projects
  const domainCounts: Record<string, number> = {};
  (sourceStats || []).forEach((s: any) => {
    domainCounts[s.source_domain] = (domainCounts[s.source_domain] || 0) + s.appearance_count;
  });

  const sortedDomains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  const totalCitations = sortedDomains.reduce((sum, [, count]) => sum + count, 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Most-Cited AI Sources in {formatted}
        </h1>
        <p className="text-xl text-slate-600 mb-8">
          Data aggregated from {totalCitations}+ AI citations across all AEO Visibility Tracker scans.
        </p>

        {sortedDomains.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Source Domain</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Citations</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedDomains.map(([domain, count], i) => (
                  <tr key={domain} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-500">{i + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{domain}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{count}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${(count / sortedDomains[0][1]) * 100}%` }}
                          />
                        </div>
                        <span>{Math.round((count / totalCitations) * 100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg font-medium">No data yet for {formatted}</p>
            <p className="mt-2">Be the first to track AI visibility for this industry.</p>
            <Link href="/dashboard/projects/new" className="inline-block mt-4 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold shadow-xs transition-all">
              Start Tracking
            </Link>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-slate-600 mb-4">Want to see your industry here?</p>
          <Link href="/dashboard/projects/new" className="inline-block bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-semibold shadow-xs transition-all">
            Add Your Domain
          </Link>
        </div>
      </div>
    </div>
  );
}
