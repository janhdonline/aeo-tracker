# AEO Visibility Tracker — Complete Build Specification

> **ব্যবহারকারীর জন্য (বাংলায়):** এই ডকুমেন্টটি আপনার AI কোডিং এজেন্টকে (Cursor, Claude Code, Copilot ইত্যাদি) দিয়ে বলুন: "Read this spec and build the project phase by phase." প্রতিটা ফেজের শেষে Acceptance Criteria চেক করে তারপর পরের ফেজে যাবেন। পুরো সিস্টেমের আর্কিটেকচার ব্যাখ্যা (কেন কী) জানতে "AEO চেকার টুল — আর্কিটেকচার ও ডেটাবেস ডিজাইন" ক্যানভাসটি দেখুন।

## 1. Project Overview

**Product:** A SaaS web application that tracks and improves a brand's visibility in AI-generated answers (ChatGPT, Perplexity, Gemini, Grok). The user adds their domain + keywords; the system queries AI engines weekly, parses which brands and sources are mentioned, computes a visibility score and share-of-voice trend, and — the key differentiator — generates actionable fix briefs and re-verifies them two weeks later (closed execution loop).

**Target user:** Small/mid-size businesses, marketers, and SEO agencies who cannot afford enterprise tools ($250+/mo). Positioning: "Monitoring + Execution" at $49–79/mo.

**Differentiators to preserve in every phase:**
1. Execution loop (gap → fix brief → verification), not dashboard-only
2. Top-down query discovery (system suggests keywords from industry input)
3. Source intelligence (which websites feed the answers)
4. Reddit/community layer tracking
5. Flat transparent pricing, all engines included

## 2. Tech Stack (do not substitute without reason)

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 14+ (App Router) | TypeScript, server components |
| Hosting | Vercel | Hobby for dev, Pro after first paying customer |
| Database + Auth | Supabase (Postgres, RLS, Edge Functions) | Free tier for MVP |
| Billing | Lemon Squeezy | Merchant of record (Stripe unavailable in Bangladesh); webhook → plan limits |
| AI engines | Perplexity Sonar API, OpenAI API (web search enabled), Google Gemini API (grounding), xAI Grok API (phase 2+) | Adapters must be swappable |
| Email | Resend | Weekly report + alerts |
| Charts | Recharts or Chart.js | Score trend, share of voice |
| Styling | Tailwind CSS | Dark, clean dashboard |

## 3. Repository Structure

```
aeo-tracker/
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Landing page
│   │   ├── pricing/page.tsx
│   │   ├── login/page.tsx                # Supabase auth
│   │   ├── dashboard/
│   │   │   ├── page.tsx                  # Project list
│   │   │   ├── projects/[id]/page.tsx    # Overview + trend charts
│   │   │   ├── projects/[id]/keywords/page.tsx
│   │   │   ├── projects/[id]/runs/page.tsx
│   │   │   └── projects/[id]/briefs/page.tsx   # Fix briefs (differentiator)
│   │   ├── report/[domain]/page.tsx      # PUBLIC indexed report (SEO funnel)
│   │   ├── api/
│   │   │   ├── cron/scan/route.ts        # Vercel cron entry
│   │   │   ├── scan/run/route.ts         # Trigger scan (authenticated)
│   │   │   └── webhooks/lemonsqueezy/route.ts
│   ├── components/                       # UI components
│   ├── lib/
│   │   ├── supabase/                     # Client, server, admin clients
│   │   ├── engines/
│   │   │   ├── types.ts                  # EngineAdapter interface
│   │   │   ├── perplexity.ts
│   │   │   ├── openai.ts
│   │   │   ├── gemini.ts
│   │   │   └── grok.ts                   # Phase 2
│   │   ├── parser/
│   │   │   ├── citations.ts              # Domain/link extraction
│   │   │   ├── mentions.ts                # Brand matching
│   │   │   └── sentiment.ts              # Phase 2
│   │   ├── prompts/                      # Templates + versioning
│   │   ├── scoring.ts                    # Visibility score
│   │   ├── briefs/                       # Fix brief generator
│   │   └── discovery.ts                  # Keyword discovery engine
│   └── types/                            # Shared TypeScript types
├── supabase/
│   └── migrations/                       # SQL below, in order
├── .env.example
├── vercel.json                           # Cron config
└── README.md
```

## 4. Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # server-only
DATABASE_URL=                        # direct Postgres connection for cron
PERPLEXITY_API_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
GROK_API_KEY=                        # phase 2
LEMONSQUEEZY_WEBHOOK_SECRET=
LEMONSQUEEZY_STORE_ID=
NEXT_PUBLIC_APP_URL=
CRON_SECRET=                         # shared secret for /api/cron/scan
RESEND_API_KEY=
```

## 5. Database Schema (Supabase migrations, run in this order)

### Migration 001 — core tables

```sql
-- profiles: 1:1 with auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  plan text not null default 'free',        -- free | starter | pro
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  domain text not null,
  brand_name text not null,
  brand_aliases text[] default '{}',       -- ["BrandName", "brand-name"]
  competitor_domains text[] default '{}',
  industry text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, domain)
);

create table public.keywords (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  keyword text not null,
  intent text not null default 'informational',  -- informational | commercial | navigational
  source text not null default 'user',           -- user | discovery
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (project_id, keyword)
);

create table public.scan_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'pending',   -- pending | running | done | failed
  total_queries int not null default 0,
  api_cost_usd numeric(10,4) not null default 0
);

create table public.query_results (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.scan_runs(id) on delete cascade,
  keyword_id uuid not null references public.keywords(id) on delete cascade,
  engine text not null,                     -- perplexity | openai | gemini | grok
  prompt_version text not null,
  prompt_used text not null,
  raw_answer text not null,
  citations jsonb not null default '[]',   -- [{domain, url, title}]
  cost_usd numeric(10,4) not null default 0,
  created_at timestamptz not null default now()
);

create table public.mentions (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references public.query_results(id) on delete cascade,
  matched_entity text not null,            -- brand_name | domain | alias
  mention_type text not null,             -- named | linked | implied
  position_in_answer int,                 -- 1-based token/paragraph position
  context_snippet text
);

create table public.competitor_appearances (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null references public.query_results(id) on delete cascade,
  competitor_domain text not null,
  frequency int not null default 1
);

create table public.snapshot_scores (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  snapshot_date date not null,
  visibility_score int not null,            -- 0..100
  share_of_voice_pct numeric(5,2) not null, -- your mentions / all brand mentions
  total_mentions int not null default 0,
  competitor_mentions int not null default 0,
  keywords_covered int not null default 0,
  keywords_total int not null default 0,
  unique (project_id, snapshot_date)
);
```

### Migration 002 — execution loop (the differentiator)

```sql
create table public.fix_briefs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  result_id uuid references public.query_results(id) on delete set null,
  gap_type text not null,                  -- missing_mention | weak_position | competitor_wins | source_gap
  gap_description text not null,           -- human summary of the gap
  recommendation jsonb not null,           -- {action, target_page_or_source, content_hint, priority}
  status text not null default 'open',     -- open | applied | dismissed
  created_at timestamptz not null default now(),
  applied_at timestamptz
);

create table public.verification_runs (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.fix_briefs(id) on delete cascade,
  checked_at timestamptz not null default now(),
  resolved boolean not null default false,
  evidence text                             -- which query result shows improvement
);
```

### Migration 003 — usage, cost caps, and sources

```sql
create table public.api_usage (
  id bigint generated always as identity primary key,
  project_id uuid references public.projects(id) on delete cascade,
  run_id uuid references public.scan_runs(id) on delete cascade,
  engine text not null,
  cost_usd numeric(10,4) not null,
  created_at timestamptz not null default now()
);

create table public.source_stats (
  id bigint generated always as identity primary key,
  project_id uuid not null references public.projects(id) on delete cascade,
  snapshot_date date not null,
  source_domain text not null,             -- e.g. reddit.com, nicheblog.com
  appearance_count int not null default 0,
  is_reddit boolean not null default false,
  unique (project_id, snapshot_date, source_domain)
);
```

### Migration 004 — RLS (mandatory)

```sql
alter table public.projects enable row level security;
alter table public.keywords enable row level security;
alter table public.scan_runs enable row level security;
alter table public.query_results enable row level security;
alter table public.mentions enable row level security;
alter table public.competitor_appearances enable row level security;
alter table public.snapshot_scores enable row level security;
alter table public.fix_briefs enable row level security;
alter table public.verification_runs enable row level security;
alter table public.source_stats enable row level security;

-- Owner-only policies on all user tables (repeat per table):
create policy "owner_all_projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "owner_read_keywords" on public.keywords
  for select using (
    exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid())
  );
-- (agent: generate equivalent owner policies for every child table, joining through projects)

-- service role bypasses RLS for cron jobs; never expose service key to the client.
```

### Migration 005 — Lemon Squeezy webhook → plan

```sql
alter table public.profiles add column lemonsqueezy_customer_id text;
alter table public.profiles add column plan_keywords_limit int not null default 10;
alter table public.profiles add column plan_engines text[] not null default '{perplexity}';
alter table public.profiles add column plan_run_frequency text not null default 'monthly'; -- free: monthly, paid: weekly
```

## 6. Plan Limits (enforce everywhere: API + UI)

| Plan | Keywords | Engines | Frequency | Features |
|---|---|---|---|---|
| Free | 10 | 1 (Perplexity) | monthly | Basic score, watermarked public report |
| Starter $49 | 50 | 3 | weekly | Full dashboard, trends, source stats |
| Pro $79 | 150 | 4 (incl. Grok) | weekly | Fix briefs, verification loop, email reports, CSV export |

## 7. Core Engine Design

### 7.1 Engine adapter interface (`lib/engines/types.ts`)

```typescript
export interface EngineQuery { prompt: string; keyword: string; intent: string; }
export interface EngineResponse {
  answerText: string;
  citations: { domain: string; url: string; title: string }[];
  costUsd: number;
}
export interface EngineAdapter {
  id: string;                                  // "perplexity" | "openai" | "gemini" | "grok"
  run(query: EngineQuery): Promise<EngineResponse>;
}
```

Every adapter must: (a) catch its own errors and return a typed result (never crash the run), (b) report `costUsd` for the `api_usage` ledger, (c) normalize citations to the shared shape.

### 7.2 Engine specifics

- **Perplexity**: `POST https://api.perplexity.ai/chat/completions` with model `sonar`. Citations arrive in the `citations`/`search_results` field — extract domains directly. Build this FIRST (simplest, cheapest, powers the whole free tier).
- **OpenAI**: chat completions with the web-search tool enabled; parse inline annotations/markdown links from the answer for sources.
- **Gemini**: generateContent with `google_search` grounding; sources are in `groundingMetadata.groundingChunks`.
- **Grok (phase 2)**: xAI chat completions with live search; note: most competitors do NOT cover Grok — this is a marketing point.

### 7.3 Prompt templates (versioned, `lib/prompts/`)

For each keyword generate exactly 3 prompts (version: `v1`):

```typescript
const TEMPLATES = [
  (kw) => `${kw}?`,                                              // direct
  (kw) => `I'm evaluating options. ${kw} — what do you recommend and why?`, // intent-rich
  (kw) => `Compare the top 5 options for "${kw}" with pros and cons.`,      // comparative
];
```

Store the rendered prompt and `prompt_version` in every `query_results` row. Never change `v1` semantics after launch — bump to `v2` so historical comparisons stay valid.

### 7.4 Parser (`lib/parser/`)

1. **Citations**: normalize each citation URL to a registrable domain (strip `www.`, subdomains, paths). If the engine returned no structured citations, extract markdown/http links from `raw_answer` as fallback.
2. **Brand matching** (`mentions.ts`): a result counts as a mention if any of `brand_name`, `brand_aliases`, or the project `domain` appears in the answer text (named), in the citations (linked), or a clear pronoun/anaphora reference within the same paragraph as a prior explicit mention (implied). Record `position_in_answer` (paragraph index) and a ±200 char `context_snippet`.
3. **Competitor extraction**: count occurrences of every `competitor_domains` entry in text + citations → upsert `competitor_appearances` (frequency).
4. **Source stats**: aggregate citation domains per project per date → `source_stats` (flag `is_reddit` for reddit.com).

### 7.5 Scoring (`lib/scoring.ts`)

```
Visibility Score (0–100) =
  coverage      = mentioned_queries / total_queries                    → weight 40
+ prominence    = f(avg position_in_answer, mention_type mix)          → weight 30
                   (linked=1.0, named=0.8, implied=0.4; earlier paragraphs score higher)
+ competitiveness = your_mentions / (your + competitor mentions)       → weight 20
+ breadth       = distinct keywords with ≥1 mention / active keywords   → weight 10
```

Also compute `share_of_voice_pct = your_mentions / all_brand_mentions × 100`. Write one `snapshot_scores` row per project per run-date. All trends on the dashboard read ONLY from `snapshot_scores` (fast, no recomputation).

### 7.6 Fix brief generator (`lib/briefs/`)

After each run, for every `query_results` row where the project brand has no mention:

1. Classify gap: `missing_mention` (brand absent), `weak_position` (implied only), `competitor_wins` (≥1 competitor mentioned, brand absent), `source_gap` (a source domain appears ≥3 times across the project's results but brand's site never appears there).
2. Build `recommendation` JSON: `{action: "update_page" | "get_listed" | "create_content" | "engage_community", target: <page or domain>, content_hint: <1-2 sentences>, priority: "high"|"medium"|"low"}`.
3. Use a cheap LLM call (gpt-4o-mini class) to draft `gap_description` and `content_hint` from the stored `raw_answer` context — never hallucinate beyond stored data.
4. Two weeks after a brief is marked `applied`, the cron re-runs only that brief's keyword(s) and writes a `verification_runs` row with `resolved` = brand now mentioned.

### 7.7 Keyword discovery (`lib/discovery.ts`) — differentiator #2

Input: project `industry` + one sentence about the customer's pain point. Pipeline:
1. LLM generates 40–80 candidate questions real buyers would ask AI assistants.
2. Cluster and dedupe; score each by intent (prefer commercial).
3. Mark `source = 'discovery'` when inserted into `keywords`.
Free plan: discovery allowed once per project. Paid: unlimited.

## 8. Scan Orchestration

- `vercel.json` cron: `{"crons": [{"path": "/api/cron/scan", "schedule": "0 3 * * 1"}]}` (weekly, Monday 03:00 UTC). The route validates `CRON_SECRET`.
- Flow: fetch all active projects → for each, respect plan limits (engines, frequency) → create `scan_runs` row → generate prompts → run adapters concurrently in batches of 10 (per-engine rate limits) → parse → write mentions/competitors/sources → compute score → snapshot → generate fix briefs → finish run with totals + `api_cost_usd`.
- **Hard cost guard**: before each batch, sum `api_usage` for the project's current month; if > $15, pause the project and email the owner. Free-tier projects: max 30 LLM calls per run (10 keywords × 1 template × 1 engine).

## 9. Pages & Key UI Requirements

1. **Landing (`/`)**: headline "See how AI answers talk about your brand", free-check input (domain), pricing anchor, live example report link.
2. **Free check flow**: user enters domain → run 5 canned prompts on Perplexity only → generate public report page `/report/<domain>` (cached, watermarked "Powered by AEO Tracker — track weekly with a free account"). This page MUST be server-rendered (SSR/SSG) for indexing — it is the programmatic SEO funnel.
3. **Dashboard project view**: score trend line (Recharts), share-of-voice area chart, engine breakdown bars, top sources list (highlight Reddit), mention feed (latest snippets), competitor comparison table.
4. **Briefs page**: list of fix briefs grouped by status; "Mark as applied" button; verification history per brief. This page is the product's hero — build it with care.
5. **Pricing**: three plans, Lemon Squeezy checkout links, comparison table emphasizing: all engines included, no prompt metering games, monthly billing.

## 10. Build Phases & Acceptance Criteria

### Phase 0 — Setup (day 1–2)
Tasks: Next.js + TypeScript + Tailwind scaffold, Supabase project, migrations 001–005, RLS verified, CI deploy to Vercel preview.
✅ Accept: `supabase db reset` runs clean; a test user can create a project via API with RLS blocking other users' access.

### Phase 1 — Scanner MVP (day 3–9)
Tasks: Perplexity adapter, prompt templates v1, citation + mention parser, scoring, snapshot writer, manual "Run scan" button.
✅ Accept: for a real domain (e.g. "shopify.com", keyword "best ecommerce platform"), a run produces: 30 `query_results` rows, correct mention detection (Shopify appears in most answers), a `snapshot_scores` row, and per-run cost logged. Unit tests for parser with 5 fixture answers (with/without citations, implied mention, competitor).

### Phase 2 — Dashboard + Billing (day 10–17)
Tasks: auth pages, project CRUD, dashboard charts, keyword manager, Lemon Squeezy webhook (verify signature with `LEMONSQUEEZY_WEBHOOK_SECRET`, update `profiles.plan` + limits), plan enforcement middleware.
✅ Accept: test checkout (Lemon Squeezy test mode) upgrades a user; free user blocked above 10 keywords and 1 engine; charts show real trend over 2+ runs.

### Phase 3 — Differentiators (day 18–28)
Tasks: OpenAI + Gemini adapters, fix-brief generator + briefs UI, verification cron, keyword discovery, source stats + Reddit flag, Grok adapter (stretch).
✅ Accept: a gap produces a readable brief with a concrete recommendation; marking a brief "applied" schedules verification; discovery generates ≥30 sensible questions for a sample industry; source stats correctly flag reddit.com.

### Phase 4 — SEO Funnel + Polish (day 29–35)
Tasks: public `/report/[domain]` pages with JSON-LD WebApplication schema + unique meta per page, weekly Resend email (score delta + top 3 gaps), error monitoring (Sentry free tier), rate limiting on free-check endpoint (per IP, e.g. 3/day), CSV export.
✅ Accept: a public report renders fully server-side (view-source shows score data), sitemap includes report pages, email sends with correct deltas.

## 11. Non-Functional Requirements

- All scanner logic in server code only; never expose engine API keys to the client.
- Every external API call wrapped in timeout (30s) + retry (1 retry, exponential backoff).
- Log nothing sensitive; store `raw_answer` unmodified (it is the data asset).
- Accessibility: keyboard-navigable dashboard, contrast-checked palette.
- Keep `lib/` framework-agnostic where possible (pure functions for parser/scoring → easy unit tests).

## 12. Definition of Done (Launch checklist)

- [ ] All Phase 1–4 acceptance criteria pass
- [ ] Vercel Pro enabled (commercial use allowed)
- [ ] Lemon Squeezy live mode verified end-to-end
- [ ] RLS penetration test: user A cannot read user B's project (attempt via client SDK)
- [ ] Cron runs 2 consecutive weeks without manual intervention
- [ ] Cost guard fires in staging when monthly cap exceeded
- [ ] Landing page Lighthouse ≥ 90 performance, ≥ 95 SEO
- [ ] Privacy policy + ToS pages live (required by Lemon Squeezy)
- [ ] First real user completes: signup → add project → run scan → read brief (ask a friend)

## 13. Post-Launch Roadmap (do NOT build before launch)

1. Grok engine coverage completion + marketing push ("we track Grok, others don't")
2. Agency tier: multi-project workspaces, white-label reports (agencies resell)
3. E-commerce SKU visibility module: schema/GTIN/feed audit + shopping-surface test (blue-ocean market)
4. Sentiment analysis on mention snippets
5. Public "AI Visibility Index" industry benchmark page (link magnet)

## 14. Advanced Moat Layer (research-backed upgrades, build after Phase 4)

These features are ranked by competitive impact. Each cites the evidence that justifies it. Do not build before launch — they are the moat, the core spec is the product.

### 15.1 Statistical sampling engine (HIGHEST priority — the trust moat)

**Evidence:** LLM answers are highly non-deterministic. A single AI answer carries almost no brand-discriminating signal (reliability ≈ 0.01, study: "Where Does the Noise Come From?", 2026); repeating one prompt barely helps (reliability improves ~0.0003 past the fifth repeat). The industry-standard fix is a polling model inspired by election forecasting: 250–500 high-intent queries, sampled over time, to get statistically stable estimates. A brand mentioned once in a hundred answers is statistically indistinguishable from zero — yet most tools display single-answer dashboards.

**Spec changes:**
- **Sampling design:** instead of re-running the same 3 templates per keyword, spread the sample budget across the query set (keyword variants + discovery questions). One pass = one sample; next weekly run = next sample. After 4+ runs, compute rolling estimates per keyword per engine.
- **Every displayed score must carry uncertainty:** show `estimate ± interval` (e.g., Wilson score interval for mention rate). Display `effective_n` (number of samples behind the estimate). Suppress trend arrows until `effective_n ≥ 10` per keyword; show "collecting data" state instead — this honesty IS the marketing.
- **Migration 006a (SQL):**

```sql
alter table public.query_results add column sample_index int not null default 1;
alter table public.snapshot_scores add column ci_low numeric(5,2);
alter table public.snapshot_scores add column ci_high numeric(5,2);
alter table public.snapshot_scores add column effective_n int not null default 0;
```

- **Dashboard copy:** "Scores based on N sampled answers with 95% confidence intervals — not a single prompt, unlike most tools."
- **Cost model note:** sampling wide (not deep) is affordable on cheap engines; factor into the cost guard.

### 15.2 Mention vs citation dual-metrics (display-layer upgrade)

**Evidence:** Semrush (June 2026) found 61.7% of AI citations never name the brand they link to; on Gemini, brands are named in 83.7% of answers but domains cited only 21.4% of the time. Mentions build association; citations drive traffic. Most competitor dashboards blur them.

**Spec changes:**
- The parser already separates `named`/`linked`/`implied` — now make the dashboard show TWO primary metrics: **Mention Rate** and **Citation Rate**, per engine, with the divergence highlighted ("Gemini names you but doesn't link you → traffic leak").
- Add a "Traffic leak" brief type: high mention rate + low citation rate → fix brief recommending structured, link-worthy content formats (comparison tables, stats pages).

### 15.3 AI Crawler Readiness Audit (free lead-magnet tool, huge SEO funnel)

**Evidence:** In an August 2026 check of 314 live sites, 43% refused at least one AI crawler — usually at the server level while robots.txt said nothing (silent misconfiguration). Client-rendered JS sites serve bots an empty shell; on small-business sites, 88.7% of AI bot requests were training/index crawlers that still get the live page, and 69% of requests using ChatGPT-User's name on 404s were exploit probes, not ChatGPT — meaning naive UA-based analytics mislead.

**Spec changes — build as `/tools/ai-crawler-audit` (public, free, no login):**
1. Fetch the user's robots.txt → parse AI-crawler rules (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot) → flag contradictions.
2. Fetch the homepage twice — once with a normal UA, once with `GPTBot` UA — extract readable text length both times; if bot-visible text < 40% of human text, flag "JS shell — bots see almost nothing".
3. Check for llms.txt presence (informational only — see 15.4).
4. Output: a shareable, server-rendered report page (adds to the programmatic SEO funnel) + CTA to full tracking.

### 15.4 Honest llms.txt / agentic-infrastructure layer (differentiate by truth)

**Evidence:** llms.txt is NOT an AI-search ranking factor — Google stated explicitly (May 2026 guide) it doesn't affect AI Overviews/AI Mode; one analysis of 500M+ AI bot visits found only 408 llms.txt fetches by search/answer bots. BUT it IS agentic infrastructure: IDE agents (Cursor, Claude Code, Cline) and MCP integrations fetch it constantly, and MCP servers expose brand content directly to agents.

**Spec changes:**
- llms.txt + llms-full.txt **generator** (accurate Markdown format) with honest copy: "this makes your site legible to agents and IDE assistants — it will NOT directly boost ChatGPT citations, and any vendor claiming otherwise is overselling."
- Optional (later): a brand **MCP server template** for customers (pricing/docs as agent-readable tools) — very few SMB-priced competitors will ship this.

### 15.5 Agent traffic analytics (lightweight version of Profound's enterprise feature)

**Evidence:** Profound's Agent Analytics (server-log based bot tracking) is enterprise-only. Bot traffic overtook human traffic in June 2026 (Cloudflare). But naive UA-based logging is exploitable (spoofed crawlers) — differentiate real bots from spoofed ones.

**Spec changes:**
- Ship a tiny **npm package**: `aeo-tracker-middleware` (Next.js/Vercel middleware + Express plugin) that logs AI-bot User-Agent hits to our ingestion API.
- Enrich: verify against known bot UA patterns + flag "unverified UA" (spoof-prone) instead of trusting the header.
- Dashboard panel per project: "AI bot visits by engine/page this week" and correlation view: "GPTBot fetched /pricing 12×; your citations to /pricing: 0 → content gap."
- Ingestion endpoint must be rate-limited and keyed per project; log format: `{project_key, ua, path, ts}` only — no PII.

### 15.6 Hallucination watch (differentiate from Scrunch's narrative monitoring)

**Spec changes:** during parsing, run a cheap LLM check on mention snippets for factual claims about the brand (price, features, status). If a claim contradicts a "brand facts" sheet the user maintains (simple JSON: price, product names, availability), raise a **Misinformation Alert** with the exact quote + engine + date. Phase after launch; manual review before emailing alerts (avoid false alarms).

### 15.7 Public AI Visibility Index (link magnet)

**Spec changes:** aggregate anonymized `source_stats` + citation domains across all projects into `/index/<industry>` pages: "Most-cited sources in <industry> AI answers this month" (LinkedIn is now the #1 most-cited domain for professional queries — these pages will earn links). Add `projects.industry` to the aggregation query only; never expose any project identity.

### 15.8 Pitch data to bake into marketing (from research)

- 88% of Google AI Mode citations are not in the organic SERP for the same query — traditional rank tracking misses AI reality (Moz, Feb 2026).
- Traditional SEO metrics explain only 4–7% of AI citation variance across studies — AEO needs its own tooling.
- AI-referred visitors convert 2.15–4.4× better than organic search visitors (Similarweb 2026; Semrush 2025) — the ROI story for the dashboard hero section.



## 15. Guidance for the Coding Agent

- Build phases in order; stop after each phase and run its acceptance criteria before continuing.
- Never invent placeholder API behavior: engine adapters must make real calls, and parser tests must use committed fixture JSON files.
- All money paths (webhook, plan limits) must have negative tests (tampered signature, over-limit attempt).
- Prefer small, typed, pure functions in `lib/`; keep React components presentational.
- When a requirement is ambiguous, choose the simpler option that preserves the 5 differentiators (Section 1).

## 16. $0 Launch Variant (budget mode)

Goal: run the entire product at $0/month until the first paying customer. These substitutions replace the defaults in Section 2. Do not change anything else — the architecture is identical.

### 16.1 Hosting substitution: Cloudflare Pages (NOT Vercel Hobby)

Vercel's Hobby plan is explicitly non-commercial (their fair-use guidelines) — a monetized product violates it. Cloudflare Pages free tier has no commercial-use prohibition, unlimited bandwidth, 500 builds/month, 100 projects. Deploy Next.js via `@opennextjs/cloudflare` (or `wrangler pages`). Caveat: Workers runtime is V8 isolates with partial Node.js compat — the agent must verify all server routes run under the Workers runtime and use Node compat flags where needed.

### 16.2 Cron substitution: Supabase pg_cron + Edge Functions

Do NOT rely on host-based cron. Register the scan job as a Supabase scheduled Edge Function (`supabase/functions/scan-scheduler/`, scheduled via `pg_cron`/dashboard schedule). This works identically regardless of host and costs nothing (500K invocations/month free). The CRON_SECRET check stays the same.

### 16.3 Engine substitution: Gemini free tier as engine #1

Google AI Studio free tier: ~1,500 requests/day, 15 RPM, no card, permanent — enough for all free-tier users plus early paying users. Use Gemini 2.5 Flash with `google_search` grounding as the default (and only free-plan) engine. Swap the free-plan default from Perplexity to Gemini; keep the adapter architecture untouched so Perplexity/OpenAI are added later by pasting an API key.

⚠️ Record in README: (a) free-tier prompts may be used for Google training — fine for public brand queries, but document it; (b) 15 RPM means the scanner must batch with a ~4s gap; (c) at first revenue, switch the project to paid Gemini keys (still the cheapest engine) and add Perplexity ($5 credit) as engine #2.

Secondary free engine (optional, phase 2): Groq free tier (1,000 req/day/model, no training on data) for fix-brief generation instead of OpenAI.

### 16.4 Everything else (already $0)

- Supabase free: 500 MB DB, 50K MAU, 2 projects. ⚠️ Free projects pause after 7 days of inactivity — the weekly cron run keeps it active; verify after first deploy and restore manually if paused.
- Lemon Squeezy: no monthly fee; 5% + $0.50 per sale only.
- Resend free: 100 emails/day.
- Sentry developer plan: free.
- Rate limiting: implement in Postgres (a `rate_limits` table with timestamps) instead of a paid service.

### 16.5 The one unavoidable cost: domain (~$10/year)

The product can technically run on `<name>.pages.dev` for $0, but do NOT do the marketing/SEO push on a free subdomain — build the domain into the plan before the Product Hunt / community launch. Everything else in this section stays $0 until revenue.

### 16.6 Revenue-triggered upgrade ladder

| Milestone | Upgrade | Cost |
|---|---|---|
| First paying customer | Nothing mandatory — review Gemini quota | $0 |
| ~5 customers | Perplexity API key (engine #2), Supabase Pro if DB > 400 MB | ~$30/mo |
| ~10–15 customers or >1 engine scan load | Supabase Pro $25 + paid Gemini keys | ~$35–50/mo |
| $500+ MRR | Optional: Vercel Pro or Cloudflare Workers paid; OpenAI API for briefs | $20–60/mo |

Rule: every upgrade must be paid for by MRR already earned, never in anticipation.