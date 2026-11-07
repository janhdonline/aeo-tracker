-- Migration 004: Row Level Security on all user tables + public read for reports
-- Owner-only access joined through projects for child tables.
-- Service role bypasses RLS for cron jobs; never expose service key to the client.

alter table public.projects enable row level security;
alter table public.keywords enable row level security;
alter table public.scan_runs enable row level security;
alter table public.query_results enable row level security;
alter table public.mentions enable row level security;
alter table public.competitor_appearances enable row level security;
alter table public.snapshot_scores enable row level security;
alter table public.scan_results enable row level security;
alter table public.fix_briefs enable row level security;
alter table public.verification_runs enable row level security;
alter table public.api_usage enable row level security;
alter table public.source_stats enable row level security;

-- projects: direct ownership
create policy "owner_all_projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- keywords: ownership via project
create policy "owner_all_keywords" on public.keywords
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- scan_runs: ownership via project
create policy "owner_all_scan_runs" on public.scan_runs
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- query_results: ownership via run -> project
create policy "owner_all_query_results" on public.query_results
  for all using (
    exists (
      select 1 from public.scan_runs r
      join public.projects p on p.id = r.project_id
      where r.id = run_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.scan_runs r
      join public.projects p on p.id = r.project_id
      where r.id = run_id and p.user_id = auth.uid()
    )
  );

-- mentions: ownership via result -> run -> project
create policy "owner_all_mentions" on public.mentions
  for all using (
    exists (
      select 1 from public.query_results q
      join public.scan_runs r on r.id = q.run_id
      join public.projects p on p.id = r.project_id
      where q.id = result_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.query_results q
      join public.scan_runs r on r.id = q.run_id
      join public.projects p on p.id = r.project_id
      where q.id = result_id and p.user_id = auth.uid()
    )
  );

-- competitor_appearances: ownership via result -> run -> project
create policy "owner_all_competitor_appearances" on public.competitor_appearances
  for all using (
    exists (
      select 1 from public.query_results q
      join public.scan_runs r on r.id = q.run_id
      join public.projects p on p.id = r.project_id
      where q.id = result_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.query_results q
      join public.scan_runs r on r.id = q.run_id
      join public.projects p on p.id = r.project_id
      where q.id = result_id and p.user_id = auth.uid()
    )
  );

-- snapshot_scores: ownership via project
create policy "owner_all_snapshot_scores" on public.snapshot_scores
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- scan_results: ownership via run -> project
create policy "owner_all_scan_results" on public.scan_results
  for all using (
    exists (
      select 1 from public.projects p
      join public.scan_runs sr on sr.project_id = p.id
      where sr.id = scan_results.run_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.projects p
      join public.scan_runs sr on sr.project_id = p.id
      where sr.id = scan_results.run_id and p.user_id = auth.uid()
    )
  );

-- fix_briefs: ownership via project
create policy "owner_all_fix_briefs" on public.fix_briefs
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- verification_runs: ownership via brief -> project
create policy "owner_all_verification_runs" on public.verification_runs
  for all using (
    exists (
      select 1 from public.fix_briefs fb
      join public.projects p on p.id = fb.project_id
      where fb.id = verification_runs.brief_id and p.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.fix_briefs fb
      join public.projects p on p.id = fb.project_id
      where fb.id = verification_runs.brief_id and p.user_id = auth.uid()
    )
  );

-- api_usage: owner read only
create policy "owner_read_api_usage" on public.api_usage
  for select using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- source_stats: owner read only
create policy "owner_read_source_stats" on public.source_stats
  for select using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- Public read access for report pages (anon can read projects + snapshot_scores
-- for public reports). The report page uses the anon client.
create policy "public_read_projects" on public.projects
  for select using (true);

create policy "public_read_snapshot_scores" on public.snapshot_scores
  for select using (true);
