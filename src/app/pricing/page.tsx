import { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { Check, ShieldCheck, Zap, Sparkles, ArrowRight, Lock, HelpCircle } from 'lucide-react';
import { LogoMark } from '@/components/landing/BrandLogos';
import { LemonOverlay } from '@/components/LemonOverlay';
import { getPaymentConfig, getAllPlanConfigs } from '@/lib/config';
import { formatPriceForCountry } from '@/lib/geo-currency';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing — AEO Visibility Tracker',
  description: 'Simple, transparent pricing for AI visibility tracking.',
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
      badge: 'Discovery',
      price: '$0',
      period: 'forever',
      localPrice: null,
      description: freeConfig?.description || 'Essential baseline diagnostics for early-stage founders and small sites.',
      features: [
        `${freeConfig?.keywords_limit || 10} Monitored Keywords`,
        'Google Gemini 2.5 Flash Engine',
        'Monthly Automated Health Audits',
        'Baseline AEO Visibility Score',
        'Public Competitor Benchmark',
        'Community Support',
      ],
      cta: 'Start Free Forever',
      href: '/login',
      isLemon: false,
      highlight: false,
    },
    {
      name: starterConfig?.display_name || 'Growth Starter',
      badge: 'Most Popular',
      price: '$49',
      period: '/month',
      localPrice: starterLocal.startsWith('$') ? null : starterLocal,
      description: starterConfig?.description || 'Designed for growing SaaS brands aiming to dominate Gemini and Perplexity search answers.',
      features: [
        `${starterConfig?.keywords_limit || 50} Monitored Keywords`,
        'Gemini + Perplexity AI Engines',
        'Weekly Automated Scans & Re-indexing',
        'Actionable Citability Fix Briefs',
        'Executive Email Weekly Digest',
        'Brand Sentiment & Hallucination Radar',
        'Competitor Share-of-Voice Tracking',
        'Full CSV & PDF Exports',
      ],
      cta: 'Unlock Starter Access',
      href: starterUrl,
      isLemon: true,
      highlight: true,
    },
    {
      name: proConfig?.display_name || 'Enterprise Pro',
      badge: 'Powerhouse',
      price: '$79',
      period: '/month',
      localPrice: proLocal.startsWith('$') ? null : proLocal,
      description: proConfig?.description || 'Maximum firepower for high-growth tech companies, agencies, and market leaders.',
      features: [
        `${proConfig?.keywords_limit || 150} Monitored Keywords`,
        'All AI Engines (Gemini, Perplexity, OpenAI, Grok)',
        'Daily/Weekly High-Frequency Scans',
        'Priority Fix Briefs & LLMs.txt Tools',
        'Agency Multi-User Workspaces',
        'Real-Time Fact Drift & Negative Mentions',
        'Custom Webhook Event Dispatching',
        'Dedicated 1-on-1 AEO Strategy Support',
      ],
      cta: 'Scale with Pro Power',
      href: proUrl,
      isLemon: true,
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans antialiased text-slate-900 selection:bg-[#D4F63C] selection:text-black">
      <LemonOverlay />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-slate-950 tracking-tight flex items-center gap-2.5 group">
            <LogoMark className="h-8 w-8" />
            <span className="font-black text-lg tracking-tight group-hover:text-slate-800 transition-colors">
              AEO Checker
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-xl transition"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white shadow-xs hover:bg-slate-800 transition"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 w-full">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider mb-4 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#D4F63C]" />
            Flat, Transparent & Zero Lock-in
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight mb-4">
            Invest in Your <span className="underline decoration-[#D4F63C] decoration-wavy decoration-2">AI Visibility</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Monitor mentions, detect hallucinations, and outrank competitors across ChatGPT, Gemini, Perplexity, and Grok.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[28px] flex flex-col justify-between transition-all duration-300 p-8 sm:p-9 ${
                plan.highlight
                  ? 'bg-slate-950 text-white shadow-2xl ring-2 ring-slate-950 relative -translate-y-1'
                  : 'bg-white border border-slate-200/90 text-slate-900 shadow-sm hover:shadow-xl hover:border-slate-300'
              }`}
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      plan.highlight
                        ? 'bg-[#D4F63C] text-black shadow-xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {plan.badge}
                  </span>
                  {plan.highlight && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#D4F63C]">
                      <Zap className="w-3.5 h-3.5 fill-[#D4F63C]" />
                      Recommended
                    </span>
                  )}
                </div>

                <h2 className={`text-2xl font-black tracking-tight mb-2 ${plan.highlight ? 'text-white' : 'text-slate-950'}`}>
                  {plan.name}
                </h2>
                <p className={`text-xs leading-relaxed mb-6 min-h-[36px] ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mb-6 pb-6 border-b border-slate-200/20">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-5xl font-black tracking-tight ${plan.highlight ? 'text-white' : 'text-slate-950'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-xs font-bold ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.period}
                    </span>
                  </div>
                  {plan.localPrice && (
                    <div className="text-xs font-bold text-[#D4F63C] mt-1.5 flex items-center gap-1">
                      <span>Approx. {plan.localPrice}/mo in your currency</span>
                    </div>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3.5 mb-8">
                  <div className={`text-[11px] font-black uppercase tracking-wider ${plan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>
                    What is included
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-xs leading-relaxed">
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                            plan.highlight
                              ? 'bg-[#D4F63C] text-black'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
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
                    className={`w-full py-4 px-6 rounded-full text-center text-xs font-black shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer lemonsqueezy-button ${
                      plan.highlight
                        ? 'bg-[#D4F63C] hover:bg-[#c2e42e] text-black shadow-lg hover:shadow-xl'
                        : 'bg-slate-950 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    href={plan.href}
                    className={`w-full py-4 px-6 rounded-full text-center text-xs font-black shadow-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                      plan.highlight
                        ? 'bg-[#D4F63C] hover:bg-[#c2e42e] text-black'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200/80'
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                <div className={`mt-3 text-center text-[10px] font-medium ${plan.highlight ? 'text-slate-400' : 'text-slate-400'}`}>
                  Instant setup · No long-term lock-in
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges & Guarantee */}
        <div className="mt-16 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-around gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs font-black text-slate-950">14-Day Refund Guarantee</div>
              <div className="text-[11px] text-slate-500">Zero-risk trial on all subscriptions</div>
            </div>
          </div>

          <div className="h-px sm:h-8 sm:w-px bg-slate-200 w-full sm:w-auto" />

          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs font-black text-slate-950">Bank-Grade Security</div>
              <div className="text-[11px] text-slate-500">256-bit SSL encrypted billing via LemonSqueezy</div>
            </div>
          </div>

          <div className="h-px sm:h-8 sm:w-px bg-slate-200 w-full sm:w-auto" />

          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <div className="text-xs font-black text-slate-950">Instant Activation</div>
              <div className="text-[11px] text-slate-500">Your AI engine scans start within 60 seconds</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-400">
          <p>© 2026 AEO Checker. All prices in USD unless specified. Tax calculated at checkout.</p>
        </div>
      </footer>
    </div>
  );
}
