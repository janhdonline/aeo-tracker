# AEO Tracker — Completion Plan (100%)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete all missing pieces from the spec so the product is launch-ready — migrations, pricing page, runs history, sitemap, keyword discovery integration, verification cron, and typo fixes.

**Architecture:** This is a Next.js 14 App Router project deployed to Cloudflare Pages via OpenNext. All backend logic lives in server components and API routes. Database is Supabase with RLS. The missing pieces are: SQL migrations that haven't been created, three UI pages, one sitemap, one new API route for verification cron, and integration of the discovery engine into the scan flow.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase (Postgres), pdfmake, Resend, Vitest, Lemon Squeezy webhooks.

**Spec:** `aeo-visibility-tracker.md`

## Global Constraints

- All scanner logic in server code only; never expose engine API keys to the client.
- Every external API call wrapped in timeout (30s) + retry (1 retry, exponential backoff).
- Log nothing sensitive; store `raw_answer` unmodified.
- Plan enforcement enforced at both API and UI layers.
- Public report pages MUST be server-rendered for indexing.
- Migration SQL runs in order; 001 already exists, 002–005 must be added.
- Lemon Squeezy variant IDs referenced as env vars: `LEMONSQUEEZY_STARTER_VARIANT_ID`, `LEMONSQUEEZY_PRO_VARIANT_ID`.

## Review Focus

1. **RLS blocking cross-user access** — user A must not read user B's projects via anon client.
2. **Cost guard fires at $15/month** — monthly spend over $15 pauses project and fails run.
3. **Free-check rate limit per IP** — 3 requests/day per IP enforced.
4. **Keyword discovery fills gap with meaningful queries** — not just hardcoded templates.
5. **Verification cron re-checks briefs applied ≥14 days ago** — writes resolved status.
6. **Sitemap includes all public report URLs** — SEO funnel works.
7. **Plan limits respected in UI and API** — free user blocked above 10 keywords and 1 engine.
8. **Pricing page shows 3 plans with working checkout links** — Lemon Squeezy flow complete.

---

### Task 1: Database Migrations 002–005

**Files:**
- Create: `supabase/migrations/002_fix_briefs_and_verification.sql`
- Create: `supabase/migrations/003_usage_and_source_stats.sql`
- Create: `supabase/migrations/004_rls_policies.sql`
- Create: `supabase/migrations/005_profile_plan_columns.sql`

**Interfaces:**
- Consumes: Nothing (database schema layer)
- Produces: Tables `fix_briefs`, `verification_runs`, `api_usage`, `source_stats`, `rate_limits`; updated `profiles` with plan columns; RLS policies on all tables

- [ ] **Step 1: Create migration 002 — fix_briefs and verification_runs**

```sql
-- supabase/migrations/002_fix_briefs_and_verification.sql
create table if not exists public.fix_briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  result_id uuid references public.query_results(id) on delete set null,
  gap_type text not null check (gap_type in ('missing_mention', 'weak_position', 'competitor_wins', 'source_gap')),
  gap_description text not null,
  recommendation jsonb not null default '{}',
  status text not null default 'open' check (status in ('open', 'applied', 'dismissed')),
  created_at timestamptz not null default now(),
  applied_at timestamptz
);

create table if not exists public.verification_runs (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.fix_briefs(id) on delete cascade,
  checked_at timestamptz not null default now(),
  resolved boolean not null default false,
  evidence text
);

create index if not exists idx_fix_briefs_project_id on public.fix_briefs(project_id);
create index if not exists idx_verification_runs_brief_id on public.verification_runs(brief_id);
```

- [ ] **Step 2: Create migration 003 — api_usage and source_stats**

```sql
-- supabase/migrations/003_usage_and_source_stats.sql
create table if not exists public.api_usage (
  id bigint generated always as identity primary key,
  project_id uuid references public.projects(id) on delete cascade,
  run_id uuid references public.scan_runs(id) on delete cascade,
  engine text not null,
  cost_usd numeric(10,4) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.source_stats (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  snapshot_date date not null,
  source_domain text not null,
  appearance_count int not null default 0,
  is_reddit boolean not null default false,
  unique (project_id, snapshot_date, source_domain)
);

create table if not exists public.rate_limits (
  id bigint generated always as identity primary key,
  ip_address text not null,
  endpoint text not null,
  request_count int not null default 0,
  window_start timestamptz not null default now(),
  unique (ip_address, endpoint, window_start)
);

create index if not exists idx_api_usage_project_id on public.api_usage(project_id);
create index if not exists idx_api_usage_run_id on public.api_usage(run_id);
create index if not exists idx_source_stats_project on public.source_stats(project_id, snapshot_date);
```

- [ ] **Step 3: Create migration 004 — RLS policies**

```sql
-- supabase/migrations/004_rls_policies.sql
alter table public.fix_briefs enable row level security;
alter table public.verification_runs enable row level security;
alter table public.api_usage enable row level security;
alter table public.source_stats enable row level security;
alter table public.rate_limits enable row level security;

create policy "owner_all_fix_briefs" on public.fix_briefs
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

create policy "owner_all_verification_runs" on public.verification_runs
  for all using (
    exists (select 1 from public.fix_briefs fb join public.projects p on p.id = fb.project_id where fb.id = brief_id and p.user_id = auth.uid())
  );

create policy "owner_all_api_usage" on public.api_usage
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

create policy "owner_all_source_stats" on public.source_stats
  for all using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );

-- Rate limits are public-facing, allow insert/select for all authenticated
create policy "allow_insert_rate_limits" on public.rate_limits
  for insert with check (true);

create policy "allow_select_rate_limits" on public.rate_limits
  for select using (true);
```

- [ ] **Step 4: Create migration 005 — profile plan columns**

```sql
-- supabase/migrations/005_profile_plan_columns.sql
alter table public.profiles add column if not exists lemonsqueezy_customer_id text;
alter table public.profiles add column if not exists plan text not null default 'free' check (plan in ('free', 'starter', 'pro'));
alter table public.profiles add column if not exists plan_keywords_limit int not null default 10;
alter table public.profiles add column if not exists plan_engines text[] not null default array['gemini'];
alter table public.profiles add column if not exists plan_run_frequency text not null default 'monthly' check (plan_run_frequency in ('monthly', 'weekly'));
```

- [ ] **Step 5: Verify migrations syntax**

Run: `supabase db diff --use-migrations` (or check with `psql` if available)
Expected: No syntax errors

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/
git commit -m "feat: add migrations 002-005 for fix_briefs, verification, usage, RLS, and plan columns"
```

---

### Task 2: Pricing Page with Lemon Squeezy Integration

**Files:**
- Create: `src/app/pricing/page.tsx`
- Modify: `src/app/page.tsx` (add pricing section link if missing)

**Interfaces:**
- Consumes: Env vars `LEMONSQUEEZY_STARTER_VARIANT_ID`, `LEMONSQUEEZY_PRO_VARIANT_ID`, `NEXT_PUBLIC_APP_URL`
- Produces: Public pricing page at `/pricing` with 3 plans and checkout links

- [ ] **Step 1: Write pricing page component**

Create `src/app/pricing/page.tsx` with:
- Header: "Simple, transparent pricing"
- Three cards: Free ($0), Starter ($49/mo), Pro ($79/mo)
- Feature comparison table highlighting: keywords limit, engines, frequency, fix briefs, verification loop
- CTA buttons linking to Lemon Squeezy checkout:
  - Starter: `https://store.lemonsqueezy.com/buy/[LEMONSQUEEZY_STARTER_VARIANT_ID]`
  - Pro: `https://store.lemonsqueezy.com/buy/[LEMONSQUEEZY_PRO_VARIANT_ID]`
- Footer note: "All engines included. No hidden fees. Cancel anytime."

- [ ] **Step 2: Add Open Graph metadata to pricing page**

Include metadata export with title "Pricing — AEO Visibility Tracker", description mentioning all engines included.

- [ ] **Step 3: Verify pricing page renders**

Run: `npm run build` (or `next build` if open-next not required)
Expected: No build errors, pricing page accessible at `/pricing`

- [ ] **Step 4: Commit**

```bash
git add src/app/pricing/page.tsx
git commit -m "feat: add pricing page with Lemon Squeezy checkout links"
```

---

### Task 3: Runs History Page

**Files:**
- Create: `src/app/dashboard/projects/[id]/runs/page.tsx`
- Create: `src/app/dashboard/projects/[id]/runs/RunRow.tsx` (optional sub-component)

**Interfaces:**
- Consumes: Project ID from params, Supabase admin client
- Produces: Paginated list of scan runs with status, date, queries processed, cost

- [ ] **Step 1: Create runs page**

The page should:
- Require auth (redirect to /login if no user)
- Fetch project by ID, verify ownership
- Fetch scan_runs for project ordered by started_at DESC
- Display table with columns: Date, Status (badge: done/failed/running), Queries, Cost, Actions (link to details if needed)
- Include "Back to Project" link

- [ ] **Step 2: Add status badges**

Status colors:
- done: green
- failed: red
- running: yellow (with pulse animation)
- pending: gray

- [ ] **Step 3: Verify page renders**

Run: `npm run build`
Expected: Build succeeds, runs page accessible

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/projects/\[id\]/runs/
git commit -m "feat: add runs history page for scan history"
```

---

### Task 4: Sitemap and Robots.txt for SEO

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_APP_URL` env var
- Produces: Auto-generated sitemap with all public report pages

- [ ] **Step 1: Create sitemap.ts**

```typescript
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-checker.com'
  
  // Static pages
  const staticPages = ['/', '/pricing', '/about', '/contact', '/privacy', '/terms'].map(
    (path) => ({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '/' ? 1 : 0.8,
    })
  )
  
  // Note: Dynamic report URLs require a DB query; for now we include a few example domains
  // In production, fetch all public projects and map to /report/[domain]
  const exampleReports = ['shopify.com', 'stripe.com', 'notion.so'].map((domain) => ({
    url: `${baseUrl}/report/${domain}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))
  
  return [...staticPages, ...exampleReports]
}
```

- [ ] **Step 2: Create robots.ts**

```typescript
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/login', '/api/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-checker.com'}/sitemap.xml`,
  }
}
```

- [ ] **Step 3: Verify sitemap and robots render**

Run: `curl http://localhost:3000/sitemap.xml` and `curl http://localhost:3000/robots.txt`
Expected: Valid XML/sitemap output

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: add sitemap and robots.txt for SEO"
```

---

### Task 5: Remove Typo Directory and Fix Briefs Page

**Files:**
- Delete: `src/app/report/[domain}` (typo directory with curly brace)
- Verify: `src/app/dashboard/projects/[id]/briefs/BriefsManager.tsx` is complete

**Interfaces:**
- Consumes: None (cleanup task)
- Produces: Clean file structure

- [ ] **Step 1: Remove typo directory**

Note: Directory `src/app/report/[domain}` (with closing curly brace instead of bracket) is a typo that prevents Next.js from routing correctly. It must be removed.

Command to run (after user confirms):
```bash
rm -rf "src/app/report/[domain}"
```

- [ ] **Step 2: Verify BriefsManager is complete**

Read `src/app/dashboard/projects/[id]/briefs/BriefsManager.tsx` fully. Ensure it handles:
- Open briefs with "Mark Applied" and "Dismiss" buttons
- Applied briefs section
- Dismissed briefs section
- Status badges
- Link back to project overview

If incomplete, add missing functionality.

- [ ] **Step 3: Run build to verify no broken imports**

Run: `npm run build`
Expected: Build succeeds, no "cannot find module" errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: remove typo report directory and verify briefs page"
```

---

### Task 6: Integrate Keyword Discovery

**Files:**
- Modify: `src/lib/discovery.ts`
- Modify: `src/app/api/scan/run/route.ts` (or wherever project creation happens)
- Create: `src/app/dashboard/projects/[id]/discover/page.tsx` (optional UI for manual discovery)

**Interfaces:**
- Consumes: `project.industry`, `project.brand_name`
- Produces: Array of `DiscoveredKeyword[]` with intent and score

- [ ] **Step 1: Enhance discovery.ts with LLM-powered suggestions**

Replace hardcoded templates with actual LLM call using Gemini (cheap/free tier):
- Prompt: "Generate 40 keyword questions that buyers ask about [industry] products. Include commercial, informational, and navigational intents. Return as JSON array with keyword, intent, and score (0-1) fields."
- Parse response and return `DiscoveredKeyword[]`
- Fallback to templates if LLM fails

- [ ] **Step 2: Add discovery endpoint**

Create `src/app/api/discover/route.ts`:
- POST endpoint
- Accepts `{ projectId }`
- Verifies user owns project
- Calls `discoverKeywords()` with project data
- Inserts discovered keywords into DB with `source = 'discovery'`
- Returns inserted keywords

- [ ] **Step 3: Add discover button to project page**

In `src/app/dashboard/projects/[id]/page.tsx`, add "Discover Keywords" button that calls the API.

- [ ] **Step 4: Enforce discovery limits by plan**

Free plan: discovery allowed once per project.
Starter/Pro: unlimited.

Check `profiles.plan` and `keywords` count before allowing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/discovery.ts src/app/api/discover/ src/app/dashboard/projects/\[id\]/page.tsx
git commit -m "feat: integrate keyword discovery with LLM and plan limits"
```

---

### Task 7: Verification Cron Job

**Files:**
- Create: `src/app/api/cron/verify/route.ts`
- Modify: `vercel.json` (add second cron entry)

**Interfaces:**
- Consumes: CRON_SECRET for auth
- Produces: Verification runs for briefs applied ≥14 days ago

- [ ] **Step 1: Create verification cron route**

```typescript
// src/app/api/cron/verify/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { runVerification } from '@/lib/verification';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const adminClient = createAdminClient();
    
    // Find briefs applied 14+ days ago
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const { data: briefs } = await adminClient
      .from('fix_briefs')
      .select('*')
      .eq('status', 'applied')
      .not('applied_at', 'is', null)
      .gte('applied_at', fourteenDaysAgo.toISOString());
    
    const results = [];
    
    for (const brief of briefs || []) {
      try {
        const result = await runVerification(brief.id);
        results.push({ briefId: brief.id, resolved: result.resolved });
      } catch (error) {
        console.error(`Verification failed for brief ${brief.id}:`, error);
        results.push({ briefId: brief.id, error: String(error) });
      }
    }
    
    return NextResponse.json({ verified: results.length, results });
  } catch (error) {
    console.error('Verification cron error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification cron failed' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Update vercel.json with second cron**

```json
{
  "crons": [
    {
      "path": "/api/cron/scan",
      "schedule": "0 3 * * 1"
    },
    {
      "path": "/api/cron/verify",
      "schedule": "0 4 * * 1"
    }
  ]
}
```

- [ ] **Step 3: Verify cron route auth**

Ensure both cron routes validate `CRON_SECRET` header.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/cron/verify/route.ts vercel.json
git commit -m "feat: add verification cron job for fix briefs"
```

---

### Task 8: Missing Tests and Edge Cases

**Files:**
- Create: `tests/discovery.test.ts`
- Create: `tests/verification.test.ts`
- Create: `tests/sitemap.test.ts`
- Modify: `tests/negative.test.ts` (add more cases)

**Interfaces:**
- Consumes: `discoverKeywords()`, `runVerification()`, sitemap function
- Produces: Test coverage for new features

- [ ] **Step 1: Add discovery tests**

Test `discoverKeywords()` with different industries:
- saas → expects commercial keywords
- ecommerce → expects buying-intent keywords
- healthcare → expects informational keywords

- [ ] **Step 2: Add verification tests**

Mock `runVerification()` to test:
- Brief resolved when brand mentioned in new scan
- Brief not resolved when still absent
- Evidence text populated correctly

- [ ] **Step 3: Add sitemap tests**

Verify sitemap includes:
- All static pages
- Report pages for example domains
- Correct URLs and priorities

- [ ] **Step 4: Run full test suite**

Run: `npm test`
Expected: All tests pass (should be 30+ tests total)

- [ ] **Step 5: Commit**

```bash
git add tests/
git commit -m "test: add discovery, verification, and sitemap tests"
```

---

### Task 9: Final Build and Deployment Check

**Files:**
- All previous tasks
- README.md update

**Interfaces:**
- Consumes: All completed tasks
- Produces: Ready-to-deploy codebase

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Zero errors, zero warnings (except known open-next warnings)

- [ ] **Step 2: Verify all pages load**

Check each page:
- `/` — landing page
- `/pricing` — pricing with 3 plans
- `/report/shopify.com` — public report (SSR)
- `/dashboard` — requires login
- `/dashboard/projects/[id]` — project overview
- `/dashboard/projects/[id]/runs` — scan history
- `/dashboard/projects/[id]/briefs` — fix briefs
- `/dashboard/projects/[id]/keywords` — keyword manager

- [ ] **Step 3: Update README.md**

Add:
- Migration run instructions (`supabase db push`)
- Environment variables checklist
- Deploy steps for Cloudflare Pages
- Test commands

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup, README update, build verification"
```

---

## Summary of What Gets Built

| Task | Deliverable | Spec Section |
|---|---|---|
| 1 | Migrations 002–005 | Section 5 (all migrations) |
| 2 | Pricing page | Section 9.5 (Pricing page) |
| 3 | Runs page | Section 9.3 (Dashboard) |
| 4 | Sitemap + robots | Section 10 Phase 4 |
| 5 | Typo fix + briefs verify | Cleanup |
| 6 | Keyword discovery | Section 7.7 |
| 7 | Verification cron | Section 7.6 + 10 Phase 3 |
| 8 | Tests | Section 10 acceptance criteria |
| 9 | Build check | Section 12 Definition of Done |

**Estimated additional code:** ~800 lines (mostly SQL + React pages)
**Estimated time:** 2–3 hours for experienced Next.js developer
