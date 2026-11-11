export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { ListChecks } from 'lucide-react';
import Link from 'next/link';

export default async function RunsPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  let user: any = null;
  try {
    const authRes = await supabase.auth.getUser();
    user = authRes?.data?.user || null;
  } catch (err) {
    console.warn('RunsPage auth check error:', err);
    user = null;
  }

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

  const { data: runs } = await supabase
    .from('scan_runs')
    .select('*')
    .eq('project_id', params.id)
    .order('started_at', { ascending: false });

  const totalRuns = runs?.length || 0;
  const completedRuns = runs?.filter((r) => r.status === 'done').length || 0;
  const totalCost = (runs || []).reduce((acc, r) => acc + (Number(r.api_cost_usd) || 0), 0);
  const totalQueries = (runs || []).reduce((acc, r) => acc + (Number(r.total_queries) || 0), 0);

  return (
    <AppShell
      user={{ email: user.email, id: user.id }}
      projectId={params.id}
      domain={project.domain}
      activeSection="traffic"
      breadcrumbs={[
        { label: project.domain, href: `/dashboard/projects/${params.id}` },
        { label: 'AI Scan Runs & Telemetry' },
      ]}
    >
      <div className="w-full px-6 sm:px-8 py-6 space-y-6">
        <ProjectSidebar projectId={params.id} domain={project.domain} current="runs" />
        <div className="w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Execution Telemetry
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-semibold text-slate-600">{project.domain}</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                AI Scan Runs &amp; Audit Log
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Historical multi-engine search passes across ChatGPT, Gemini, Perplexity, and Claude for <strong>{project.brand_name || project.domain}</strong>.
              </p>
            </div>
            <Link
              href={`/dashboard/projects/${params.id}`}
              className="inline-flex items-center gap-1.5 border border-slate-200 bg-white px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs self-start sm:self-auto shrink-0 transition-colors"
            >
              Back to Overview
            </Link>
          </div>

          {/* Bento Stat Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-bento bg-white border border-slate-200/90 shadow-bento">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Total Audit Passes
              </span>
              <p className="font-display text-3xl font-black text-slate-950">{totalRuns}</p>
              <p className="mt-1 text-xs text-slate-500 font-medium">Recorded scan executions</p>
            </div>

            <div className="p-5 rounded-bento bg-white border border-slate-200/90 shadow-bento">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Completed Passes
              </span>
              <p className="font-display text-3xl font-black text-emerald-600">{completedRuns}</p>
              <p className="mt-1 text-xs text-emerald-700 font-medium">Successfully processed</p>
            </div>

            <div className="p-5 rounded-bento bg-white border border-slate-200/90 shadow-bento">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Queries Executed
              </span>
              <p className="font-display text-3xl font-black text-blue-600">{totalQueries}</p>
              <p className="mt-1 text-xs text-slate-500 font-medium">AI prompt evaluations</p>
            </div>

            {/* Obsidian Bento Card */}
            <div className="p-5 rounded-bento bg-[#0B0F17] border border-slate-800 shadow-bento text-white">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                API Operating Cost
              </span>
              <p className="font-display text-3xl font-black text-[#D4F63C]">${totalCost.toFixed(4)}</p>
              <p className="mt-1 text-xs text-slate-300 font-medium">Frontier inference compute</p>
            </div>
          </div>

          {/* Bento Table */}
          <div className="rounded-bento border border-slate-200/90 bg-white shadow-bento overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 pl-6 pr-4">Timestamp</th>
                    <th className="px-4 py-3.5">Execution Status</th>
                    <th className="px-4 py-3.5">Prompt Queries</th>
                    <th className="py-3.5 pl-4 pr-6 text-right">Inference Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {(runs || []).map((run) => (
                    <tr key={run.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 pl-6 pr-4 font-bold text-slate-900">
                        {new Date(run.started_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            run.status === 'done'
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                              : run.status === 'failed'
                              ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                              : 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                          }`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {run.status === 'done' ? 'COMPLETED' : run.status ? run.status.toUpperCase() : 'QUEUED'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600 font-semibold">
                        {run.total_queries} queries
                      </td>
                      <td className="py-4 pl-4 pr-6 text-right font-mono font-bold text-slate-900">
                        ${Number(run.api_cost_usd || 0).toFixed(4)}
                      </td>
                    </tr>
                  ))}
                  {(!runs || runs.length === 0) && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                        <ListChecks className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-bold text-slate-900">No scan runs recorded yet for this project.</p>
                        <p className="text-xs text-slate-400 mt-1 mb-4">Run an on-demand audit to benchmark AI search engines.</p>
                        <Link
                          href={`/dashboard/projects/${params.id}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
                        >
                          Go to Overview &amp; Run Scan →
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
