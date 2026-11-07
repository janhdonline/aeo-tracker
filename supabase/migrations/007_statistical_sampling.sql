-- Migration 007: Statistical Sampling Engine (spec section 15.1)
-- Polling model: spread sample budget across query set, track sample_index,
-- compute Wilson score intervals for uncertainty display.

alter table public.query_results
  add column if not exists sample_index int not null default 1;

alter table public.snapshot_scores
  add column if not exists ci_low numeric(5,2),
  add column if not exists ci_high numeric(5,2),
  add column if not exists effective_n int not null default 0;
