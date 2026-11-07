-- Migration 008: Hallucination Watch (spec section 15.6)
-- Fact-check AI claims against a brand facts sheet.
-- If a claim contradicts the facts, raise a Misinformation Alert
-- with the exact quote + engine + date for manual review.

create table public.brand_facts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  fact_type text not null,              -- price | feature | availability | status | claim
  key text not null,                    -- e.g. "aeropress_pro", "pricing"
  expected_value text not null,         -- e.g. "$89", "available"
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, fact_type, key)
);

create table public.misinformation_alerts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  result_id uuid references public.query_results(id) on delete set null,
  engine text not null,
  quote text not null,
  claimed_value text not null,
  expected_value text not null,
  fact_type text not null,
  confidence numeric(3,2) not null default 0.5,  -- 0-1, how confident the LLM is
  reviewed boolean not null default false,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_brand_facts_project on public.brand_facts(project_id);
create index if not exists idx_misinformation_project on public.misinformation_alerts(project_id);
create index if not exists idx_misinformation_reviewed on public.misinformation_alerts(reviewed);

alter table public.brand_facts enable row level security;
alter table public.misinformation_alerts enable row level security;

create policy "owner_all_brand_facts" on public.brand_facts
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

create policy "owner_all_misinformation" on public.misinformation_alerts
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );
