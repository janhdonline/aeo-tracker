-- Migration 009: Agent Traffic Analytics (spec section 15.5)
-- Lightweight version of Profound's enterprise feature.
-- Tracks AI bot visits by engine/page, correlates with citations.
-- Differentiate real bots from spoofed ones.

create table public.agent_visits (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  engine text not null,              -- gptbot | claude | perplexity | google | etc
  path text not null,                -- the URL path visited
  user_agent text not null,          -- raw UA string
  is_verified boolean not null default false,  -- verified against known bot patterns
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.agent_correlation (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  date date not null,
  path text not null,
  engine text not null,
  bot_visits int not null default 0,
  citations int not null default 0,
  unique (project_id, date, path, engine)
);

create index if not exists idx_agent_visits_project on public.agent_visits(project_id);
create index if not exists idx_agent_visits_created on public.agent_visits(created_at);
create index if not exists idx_agent_correlation_project on public.agent_correlation(project_id);

alter table public.agent_visits enable row level security;
alter table public.agent_correlation enable row level security;

create policy "owner_all_agent_visits" on public.agent_visits
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

create policy "owner_all_agent_correlation" on public.agent_correlation
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );
