import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

interface Props {
  params: { domain: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const domain = decodeURIComponent(params.domain);
  return {
    title: `${domain} - AI Visibility Report`,
    description: `See how ${domain} performs in AI-generated answers. Powered by AEO Visibility Tracker.`,
    openGraph: {
      title: `${domain} - AI Visibility Report`,
      description: `AI visibility score and share of voice for ${domain}`,
      type: 'website',
    },
  };
}

export default async function PublicReportPage({ params }: Props) {
  const domain = decodeURIComponent(params.domain);
  const supabase = await createClient();

  // Get project by domain (public access)
  const { data: project } = await supabase
    .from('projects')
    .select('id, domain, brand_name')
    .eq('domain', domain)
    .single();

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Report not found</h1>
          <p className="text-gray-600 mt-2">No public report available for {domain}</p>
        </div>
      </div>
    );
  }

  const { data: latestScore } = await supabase
    .from('snapshot_scores')
    .select('*')
    .eq('project_id', project.id)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AEO Visibility Tracker',
    description: 'Track and improve your brand visibility in AI-generated answers',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold">AEO Visibility Tracker</h1>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-3xl font-bold mb-2">{project.domain}</h2>
              <p className="text-gray-600 mb-6">AI Visibility Report for {project.brand_name}</p>

              {latestScore ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Visibility Score</h3>
                    <p className="text-4xl font-bold text-blue-600">{latestScore.visibility_score}/100</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500">Share of Voice</h3>
                    <p className="text-4xl font-bold text-green-600">{latestScore.share_of_voice_pct}%</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No scan data available yet.</p>
              )}

              <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  Powered by AEO Visibility Tracker — track weekly with a free account.
                </p>
                <a
                  href="/"
                  className="inline-block mt-2 text-blue-600 hover:underline text-sm"
                >
                  Get started free →
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}