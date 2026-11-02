import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RunScanButton } from './RunScanButton';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!project) {
    redirect('/dashboard');
  }

  const { data: keywords } = await supabase
    .from('keywords')
    .select('*')
    .eq('project_id', params.id)
    .eq('active', true);

  const { data: latestScore } = await supabase
    .from('snapshot_scores')
    .select('*')
    .eq('project_id', params.id)
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  const { data: fixBriefs } = await supabase
    .from('fix_briefs')
    .select('*')
    .eq('project_id', params.id)
    .order('created_at', { ascending: false });

  return (
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">{project.domain}</h2>
              <p className="text-gray-600">{project.brand_name}</p>
            </div>
            <div className="flex gap-2">
              <RunScanButton projectId={params.id} />
              <a
                href={`/dashboard/projects/${params.id}/keywords`}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Keywords
              </a>
              <a
                href={`/dashboard/projects/${params.id}/briefs`}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Briefs
              </a>
            </div>
          </div>

          {latestScore && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 mb-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Visibility Score</h3>
                <p className="text-3xl font-bold">{latestScore.visibility_score}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Share of Voice</h3>
                <p className="text-3xl font-bold">{latestScore.share_of_voice_pct}%</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Total Mentions</h3>
                <p className="text-3xl font-bold">{latestScore.total_mentions}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-sm font-medium text-gray-500">Keywords Covered</h3>
                <p className="text-3xl font-bold">{latestScore.keywords_covered}/{latestScore.keywords_total}</p>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Keywords ({keywords?.length || 0})</h3>
            <div className="flex flex-wrap gap-2">
              {keywords?.map((kw) => (
                <span key={kw.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {kw.keyword}
                </span>
              ))}
            </div>
          </div>

          {fixBriefs && fixBriefs.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Open Fix Briefs ({fixBriefs.filter(b => b.status === 'open').length})</h3>
              <div className="space-y-2">
                {fixBriefs.filter(b => b.status === 'open').slice(0, 5).map((brief) => (
                  <div key={brief.id} className="border-l-4 border-yellow-400 pl-4 py-2">
                    <p className="font-medium">{brief.gap_type}</p>
                    <p className="text-sm text-gray-600">{brief.gap_description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}