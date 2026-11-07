-- Migration 005: Lemon Squeezy webhook -> plan
-- profiles columns (lemonsqueezy_customer_id, plan_keywords_limit,
-- plan_engines, plan_run_frequency) are created in 001_profiles.sql.
-- Here we add the server-side function that the webhook route calls to
-- upgrade/downgrade a plan based on the verified Lemon Squeezy payload.

create or replace function public.set_plan_from_lemonsqueezy(
  p_customer_id text,
  p_plan_name text,
  p_status text default 'active'
)
returns void as $$
declare
  v_keywords int;
  v_engines text[];
  v_frequency text;
begin
  -- Map plan name -> limits (kept in sync with PLAN_LIMITS in src/lib/types)
  v_keywords := case p_plan_name
    when 'free' then 10
    when 'starter' then 50
    when 'pro' then 150
    else 10
  end;

  v_engines := case p_plan_name
    when 'free' then array['gemini']::text[]
    when 'starter' then array['gemini','perplexity','openai']::text[]
    when 'pro' then array['gemini','perplexity','openai','grok']::text[]
    else array['gemini']::text[]
  end;

  v_frequency := case
    when p_plan_name = 'free' then 'monthly'
    else 'weekly'
  end;

  update public.profiles
  set
    plan = p_plan_name,
    lemonsqueezy_customer_id = p_customer_id,
    plan_keywords_limit = v_keywords,
    plan_engines = v_engines,
    plan_run_frequency = v_frequency,
    updated_at = now()
  where lemonsqueezy_customer_id = p_customer_id;
end;
$$ language plpgsql security definer;

-- updated_at trigger for profiles
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
