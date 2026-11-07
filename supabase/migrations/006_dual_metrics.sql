-- Migration 006: Mention vs Citation dual-metrics columns
-- Differentiator: separate Mention Rate from Citation Rate so the dashboard
-- can show "traffic leaks" (brand named but not linked).
-- Also adds a traffic_leak gap type to fix_briefs.

alter table public.snapshot_scores
  add column if not exists mention_rate numeric(5,2),
  add column if not exists citation_rate numeric(5,2),
  add column if not exists traffic_leak boolean not null default false;

alter table public.fix_briefs
  alter column gap_type type text;
