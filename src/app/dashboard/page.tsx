export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const projectIds = (projects || []).map((p: any) => p.id);
  let keywordsCount = 0;
  let lastScan: string | null = null;
  if (projectIds.length) {
    const { count } = await supabase
      .from('keywords')
      .select('id', { count: 'exact', head: true })
      .in('project_id', projectIds)
      .eq('active', true);
    keywordsCount = count || 0;
    const { data: runs } = await supabase
      .from('scan_runs')
      .select('started_at')
      .in('project_id', projectIds)
      .order('started_at', { ascending: false })
      .limit(1);
    lastScan = runs?.[0]?.started_at || null;
  }

  const scores = (projects || []).length
    ? await supabase
        .from('snapshot_scores')
        .select('visibility_score, project_id')
        .in('project_id', projectIds)
    : { data: [] };
  const avgScore = (scores.data || []).length
    ? Math.round((scores.data as any[]).reduce((a, b) => a + (b.visibility_score || 0), 0) / (scores.data as any[]).length)
    : 0;

  return (
    <AppShell user={{ email: user.email }}>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-display text-2xl font-bold">Projects</h2>
          <div className="flex gap-2">
            <Link href="/dashboard/projects/new" className="bg-[#eb9d2a] hover:bg-[#d88b1e] text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-semibold">+ New Project</Link>
            <a href="/api/export/csv" className="border border-slate-200 px-4 py-2 rounded-lg text-sm hover:bg-slate-50">Export CSV</a>
            <Link href="/report/shopify.com" className="border border-slate-200 px-4 py-2 rounded-lg text-sm hover:bg-slate-50">View sample report</Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Projects", value: projects?.length || 0 },
            { label: "Keywords Tracked", value: keywordsCount },
            { label: "Avg AEO Score", value: avgScore },
            { label: "Last Scan", value: lastScan ? new Date(lastScan).toLocaleDateString() : "—" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="font-display text-3xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {!projects || projects.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="font-display text-xl font-bold text-slate-900">No projects yet</p>
            <p className="mt-2">Create your first project to start tracking AI visibility.</p>
            <Link href="/dashboard/projects/new" className="inline-block mt-4 bg-[#eb9d2a] hover:bg-[#d88b1e] text-white px-4 py-2 rounded-lg">+ New Project</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p: any) => (
              <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <h3 className="font-display text-lg font-bold">{p.domain}</h3>
                <p className="text-sm text-slate-500">{p.brand_name}</p>
                <div className="flex gap-2 mt-4">
                  <Link href={`/dashboard/projects/${p.id}`} className="text-sm text-[#eb9d2a] font-medium">View</Link>
                  <Link href={`/dashboard/projects/${p.id}/keywords`} className="text-sm text-slate-600">Keywords</Link>
                  <Link href={`/report/${p.domain}`} className="text-sm text-slate-600">Report</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
