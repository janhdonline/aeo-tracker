# AEO Visibility Tracker

Track and improve your brand's visibility in AI-generated answers (ChatGPT, Perplexity, Gemini, Grok).

## $0 Launch Variant

This project is configured to run at $0/month until the first paying customer.

### Caveats

1. **Gemini free-tier training**: Free-tier prompts may be used for Google training. This is fine for public brand queries, but document it for users.
2. **1,500 RPD cap**: Google AI Studio free tier provides ~1,500 requests/day. The scanner must batch with ~4s gaps to respect 15 RPM.
3. **Supabase free-project pause**: Free projects pause after 7 days of inactivity. The weekly cron run keeps it active; verify after first deploy and restore manually if paused.

### Deployment

#### Cloudflare Pages (recommended for $0)

1. Install `@opennextjs/cloudflare` (or use `wrangler pages`)
2. Configure `wrangler.toml` with your environment variables
3. Deploy with `npx wrangler pages deploy`

#### Vercel (alternative)

1. Connect the repo to Vercel
2. Set environment variables in the dashboard
3. Cron is configured via `vercel.json`

### Cron

The scan job runs as a scheduled Supabase Edge Function (`supabase/functions/scan-scheduler/`), triggered by pg_cron every Monday at 03:00 UTC. The CRON_SECRET Bearer check is enforced.

### Environment Variables

See `.env.example` for all required variables.

### Development

```bash
npm install
npm run dev
```

### Testing

```bash
npm test        # Run unit tests
npm run build   # Build for production
```