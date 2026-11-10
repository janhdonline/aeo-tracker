import { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Check, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { LogoMark } from '@/components/landing/BrandLogos';
import { LemonOverlay } from '@/components/LemonOverlay';
import { getPaymentConfig, getAllPlanConfigs } from '@/lib/config';
import { formatPriceForCountry } from '@/lib/geo-currency';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing — AEO Visibility Tracker',
  description: 'Simple, transparent pricing for AI visibility tracking.',
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
      name: freeConfig?.display_name || 'Free',
      price: '$0',
      localPrice: null,
      description: freeConfig?.description || 'Perfect for getting started with AI visibility tracking.',
      features: [
        `${freeConfig?.keywords_limit || 10} Monitored Keywords`,
        'Google Gemini AI Engine',
        'Monthly Automated Scans',
        'Standard Visibility Score',
        'Public Benchmark Audit',
      ],
      cta: 'Get Started Free',
      href: '/login',
      isLemon: false,
      highlight: false,
    },
    {
      name: starterConfig?.display_name || 'Starter',
      price: '$49',
      localPrice: starterLocal.startsWith('$') ? null : starterLocal,
      description: starterConfig?.description || 'Best for growing businesses, startups, and high-growth brands.',
      features: [
        `${starterConfig?.keywords_limit || 50} Monitored Keywords`,
        'Gemini + Perplexity AI Engines',
        'Weekly Automated Scans',
        'Actionable Fix Briefs',
        'Email Change Digest',
        'Brand Sentiment Analysis',
        'Competitor SoV Benchmarks',
      ],
      cta: 'Subscribe to Starter',
      href: starterUrl,
      isLemon: true,
      highlight: true,
    },
    {
      name: proConfig?.display_name || 'Pro',
      price: '$79',
      localPrice: proLocal.startsWith('$') ? null : proLocal,
      description: proConfig?.description || 'For power users, agencies, and enterprise brands.',
      features: [
        `${proConfig?.keywords_limit || 150} Monitored Keywords`,
        'All AI Engines (Gemini, Perplexity, OpenAI, Grok)',
        'Weekly Automated Scans',
        'Priority Fix Briefs & LLMs.txt Tools',
        'Agency & Team Workspaces',
        'Anti-Hallucination Fact Watch',
        'VIP Priority Support',
      ],
      cta: 'Subscribe to Pro',
      href: proUrl,
      isLemon: true,
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <LemonOverlay />

      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5 group">
            <LogoMark className="h-8 w-8" />
            <span className="font-display group-hover:text-slate-700 transition-colors">
              AEO Checker
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition-colors"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-4 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            Transparent & Flat Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-600">
            Track, benchmark, and maximize your brand visibility across AI answer engines like Gemini, ChatGPT, and Perplexity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-sm border flex flex-col justify-between transition-all duration-200 ${
                plan.highlight
                  ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-md relative'
                  : 'border-slate-200 hover:border-slate-300'
              } p-8`}
            >
              <div>
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                )}

                <h2 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h2>
                <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="text-4xl font-extrabold text-slate-900">
                    {plan.price}
                    <span className="text-sm font-normal text-slate-500 ml-1">/month</span>
                  </div>
                  {plan.localPrice && (
                    <div className="text-xs font-medium text-emerald-600 mt-1">
                      {plan.localPrice}/month
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-100 mb-6" />

                <ul className="space-y-3.5 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                      <Check className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.isLemon ? (
                <a
                  href={plan.href}
                  className={`w-full py-3.5 px-4 rounded-xl text-center text-sm font-bold shadow-xs transition-all duration-150 block cursor-pointer lemonsqueezy-button ${
                    plan.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                </a>
              ) : (
                <Link
                  href={plan.href}
                  className={`w-full py-3.5 px-4 rounded-xl text-center text-sm font-bold shadow-xs transition-all duration-150 block ${
                    plan.highlight
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>7-Day Money-Back Guarantee. Cancel anytime with a single click.</span>
        </div>
      </main>
    </div>
  );
}
