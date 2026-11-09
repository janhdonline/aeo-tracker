import { Metadata } from 'next';
import Link from 'next/link';
import { Check, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { LogoMark } from '@/components/landing/BrandLogos';
import { getEnv } from '@/lib/env';
import { LemonOverlay } from '@/components/LemonOverlay';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Pricing — AEO Visibility Tracker',
  description: 'Simple, transparent pricing for AI visibility tracking.',
};

const DEFAULT_STARTER_URL =
  'https://aeo-tracker.lemonsqueezy.com/checkout/buy/482b92a7-0f99-4689-9653-d58fb35bc3cf';
const DEFAULT_PRO_URL =
  'https://aeo-tracker.lemonsqueezy.com/checkout/buy/41f8ba70-e418-48da-8554-e25210808053';

export default function PricingPage() {
  const rawStarterUrl =
    getEnv('LEMONSQUEEZY_STARTER_URL') ||
    process.env.LEMONSQUEEZY_STARTER_URL ||
    DEFAULT_STARTER_URL;

  const rawProUrl =
    getEnv('LEMONSQUEEZY_PRO_URL') ||
    process.env.LEMONSQUEEZY_PRO_URL ||
    DEFAULT_PRO_URL;

  // Add embed=1 parameter so Lemon.js opens in-page overlay modal seamlessly
  const starterUrl = `${rawStarterUrl}${rawStarterUrl.includes('?') ? '&' : '?'}embed=1`;
  const proUrl = `${rawProUrl}${rawProUrl.includes('?') ? '&' : '?'}embed=1`;

  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for getting started with AI visibility tracking.',
      features: [
        '10 Monitored Keywords',
        'Google Gemini AI Engine',
        'Monthly Automated Scans',
        'Standard Visibility Score',
        'CSV & PDF Report Export',
      ],
      cta: 'Get Started Free',
      href: '/login',
      isLemon: false,
      highlight: false,
    },
    {
      name: 'Starter',
      price: '$49',
      description: 'Best for growing businesses, startups, and high-growth brands.',
      features: [
        '50 Monitored Keywords',
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
      name: 'Pro',
      price: '$79',
      description: 'For power users, agencies, and enterprise brands.',
      features: [
        '150 Monitored Keywords',
        'All AI Engines (Gemini, Perplexity, OpenAI, Grok)',
        'Weekly Automated Scans',
        'Priority Fix Briefs & LLMs.txt Tools',
        'Competitor Leak Detection',
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
            <Link href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium bg-blue-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-100">
            <Zap className="w-3.5 h-3.5" />
            Flexible Pricing
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
                <div className="text-4xl font-extrabold text-slate-900 mb-6">
                  {plan.price}
                  <span className="text-sm font-normal text-slate-500 ml-1">/month</span>
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

              <a
                href={plan.href}
                className={`lemonsqueezy-button block w-full text-center py-3 px-4 rounded-xl font-semibold text-sm transition-colors shadow-sm cursor-pointer ${
                  plan.highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-3xl mx-auto shadow-sm">
          <ShieldCheck className="w-8 h-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">Money-Back Guarantee & Cancel Anytime</h3>
          <p className="text-sm text-slate-600">
            All paid plans can be cancelled anytime with zero hassle. Need enterprise volume or custom keywords?{' '}
            <Link href="/contact" className="text-blue-600 font-medium hover:underline">
              Contact our team
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
