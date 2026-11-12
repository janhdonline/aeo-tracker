import { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Check, ShieldCheck, Zap, Sparkles, ArrowRight, Lock } from 'lucide-react';
import { LogoMark } from '@/components/landing/BrandLogos';
import { LemonOverlay } from '@/components/LemonOverlay';
import { getPaymentConfig, getAllPlanConfigs } from '@/lib/config';
import { formatPriceForCountry } from '@/lib/geo-currency';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing — AEO Tracker Enterprise Telemetry',
  description: 'Simple, transparent pricing for AI visibility tracking and generative engine optimization.',
  alternates: {
    canonical: '/pricing',
  },
};

const DEFAULT_STARTER_URL =
  'https://aeo-tracker.lemonsqueezy.com/checkout/buy/482b92a7-0f99-4689-9653-d58fb35bc3cf';
const DEFAULT_PRO_URL =
  'https://aeo-tracker.lemonsqueezy.com/checkout/buy/41f8ba70-e418-48da-8554-e25210808053';

export default async function PricingPage() {
  const headersList = headers();
  const country = headersList.get('cf-ipcountry') || headersList.get('x-vercel-ip-country') || 'US';

  const rawStarterUrl = (await getPaymentConfig('ls_starter_checkout_url')) || DEFAULT_STARTER_URL;
  const rawProUrl = (await getPaymentConfig('ls_pro_checkout_url')) || DEFAULT_PRO_URL;

  // Add embed=1 parameter so Lemon.js opens in-page overlay modal seamlessly
  const starterUrl = `${rawStarterUrl}${rawStarterUrl.includes('?') ? '&' : '?'}embed=1`;
  const proUrl = `${rawProUrl}${rawProUrl.includes('?') ? '&' : '?'}embed=1`;

  // Localized price estimates
  const starterLocal = await formatPriceForCountry(49, country);
  const proLocal = await formatPriceForCountry(79, country);

  // Dynamic plan configs from database
  const dbPlans = await getAllPlanConfigs();
  const starterConfig = dbPlans.find((p) => p.plan_name === 'starter');
  const proConfig = dbPlans.find((p) => p.plan_name === 'pro');
  const freeConfig = dbPlans.find((p) => p.plan_name === 'free');

  const plans = [
    {
      name: freeConfig?.display_name || 'Free Tier',
      badge: 'Evaluation',
      price: '$0',
      period: 'forever',
      localPrice: null,
      description: freeConfig?.description || 'Essential baseline diagnostics for founders, developers, and single-domain evaluation.',
      features: [
        `${freeConfig?.keywords_limit || 10} Monitored Keywords`,
        'Google Gemini 2.5 Flash Engine',
        'Monthly Automated Health Audits',
        'Baseline AEO Visibility Score',
        'Public Competitor Benchmark',
        'Standard Documentation Support',
      ],
      cta: 'Start Free Forever',
      href: '/login',
      isLemon: false,
      highlight: false,
    },
    {
      name: starterConfig?.display_name || 'Growth Starter',
      badge: 'Recommended',
      price: '$49',
      period: '/month',
      localPrice: starterLocal.startsWith('$') ? null : starterLocal,
      description: starterConfig?.description || 'Engineered for scaling SaaS brands aiming to capture prominent Gemini and Perplexity citations.',
      features: [
        `${starterConfig?.keywords_limit || 50} Monitored Keywords`,
        'Gemini + Perplexity AI Engines',
        'Weekly Automated Diagnostic Runs',
        'Actionable Citability Fix Briefs',
        'Executive Email Weekly Digest',
        'Brand Sentiment & Hallucination Radar',
        'Competitor Share-of-Voice Tracking',
        'Full CSV & PDF Board-Ready Exports',
      ],
      cta: 'Activate Starter Access',
      href: starterUrl,
      isLemon: true,
      highlight: true,
    },
    {
      name: proConfig?.display_name || 'Enterprise Pro',
      badge: 'High Frequency',
      price: '$79',
      period: '/month',
      localPrice: proLocal.startsWith('$') ? null : proLocal,
      description: proConfig?.description || 'Maximum diagnostic telemetry for enterprise companies, multi-brand portfolios, and agencies.',
      features: [
        `${proConfig?.keywords_limit || 150} Monitored Keywords`,
        'All AI Engines (Gemini, Perplexity, OpenAI, Grok)',
        'Daily High-Frequency Multi-Engine Runs',
        'Priority Fix Briefs & LLMs.txt Tools',
        'Agency Multi-User Workspaces',
        'Real-Time Fact Drift & Negative Mentions',
        'Custom Webhook Event Dispatching',
        'Dedicated 1-on-1 AEO Strategy Support',
      ],
      cta: 'Deploy Enterprise Pro',
      href: proUrl,
      isLemon: true,
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-slate-900 selection:bg-slate-900 selection:text-white">
      <LemonOverlay />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto py-3.5 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2.5 group">
            <LogoMark className="h-7 w-7" />
            <span className="font-display font-bold text-base tracking-tight text-slate-900">
              AEO Tracker
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/about"
              className="text-xs font-semibold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-lg transition"
            >
              About
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-lg transition"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-2xs hover:bg-slate-800 transition"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium mb-4 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Predictable, Flat-Rate Pricing · Zero Setup Fees
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight mb-4">
            Invest in Verified AI Visibility
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Continuously audit brand citations, detect factual drift, and benchmark competitors across ChatGPT, Gemini, Perplexity, and Grok.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl flex flex-col justify-between transition-all duration-200 p-7 sm:p-8 ${
                plan.highlight
                  ? 'bg-slate-950 text-white shadow-card-hover border border-slate-800 relative -translate-y-1'
                  : 'bg-white border border-slate-200 text-slate-900 shadow-card hover:border-slate-300 hover:shadow-card-hover'
              }`}
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-md font-mono text-[10px] font-semibold uppercase tracking-wider ${
                      plan.highlight
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {plan.badge}
                  </span>
                  {plan.highlight && (
                    <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-400">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Most Popular
                    </span>
                  )}
                </div>

                <h2 className={`font-display text-xl font-bold tracking-tight mb-2 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                  {plan.name}
                </h2>
                <p className={`text-xs leading-relaxed mb-6 min-h-[36px] ${plan.highlight ? 'text-slate-400' : 'text-slate-600'}`}>
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className={`mb-6 pb-6 border-b ${plan.highlight ? 'border-slate-800' : 'border-slate-100'}`}>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`font-display text-4xl sm:text-5xl font-bold tracking-tight ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-xs font-semibold ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.period}
                    </span>
                  </div>
                  {plan.localPrice && (
                    <div className="text-xs font-medium text-emerald-400 mt-1.5 flex items-center gap-1 font-mono">
                      <span>Approx. {plan.localPrice}/mo in your local currency</span>
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <div className={`text-[11px] font-semibold uppercase tracking-wider font-mono ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                    Plan Specifications
                  </div>
                  <ul className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs leading-relaxed">
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded mt-0.5 ${
                            plan.highlight
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <Check className="h-3 w-3 stroke-[2.5]" />
                        </span>
                        <span className={plan.highlight ? 'text-slate-200' : 'text-slate-700'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action CTA Button */}
              <div className="pt-4">
                {plan.isLemon ? (
                  <a
                    href={plan.href}
                    className={`w-full py-3.5 px-6 rounded-xl text-center text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer lemonsqueezy-button ${
                      plan.highlight
                        ? 'bg-white hover:bg-slate-100 text-slate-950 shadow-sm'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    href={plan.href}
                    className="w-full py-3.5 px-6 rounded-xl text-center text-xs font-bold uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 shadow-2xs"
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                <div className="mt-3 text-center text-[10px] font-mono text-slate-400">
                  Instant activation · Cancel anytime
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges & Guarantee */}
        <div className="mt-14 bg-white border border-slate-200 rounded-xl p-6 shadow-card max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs font-bold text-slate-900">14-Day Full Satisfaction Guarantee</div>
              <div className="text-[11px] text-slate-500">Zero-risk trial on all subscription tiers</div>
            </div>
          </div>

          <div className="h-px sm:h-8 sm:w-px bg-slate-200 w-full sm:w-auto" />

          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-blue-50 text-blue-700">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs font-bold text-slate-900">Encrypted Enterprise Billing</div>
              <div className="text-[11px] text-slate-500">256-bit SSL encrypted PCI-DSS billing via LemonSqueezy</div>
            </div>
          </div>

          <div className="h-px sm:h-8 sm:w-px bg-slate-200 w-full sm:w-auto" />

          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs font-bold text-slate-900">Immediate Telemetry</div>
              <div className="text-[11px] text-slate-500">Multi-model audit triggers within 60 seconds</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© 2026 AEO Tracker. All prices in USD unless specified. Tax calculated at checkout.</p>
        </div>
      </footer>
    </div>
  );
}
