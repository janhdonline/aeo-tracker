import { Metadata } from 'next';
import Link from 'next/link';
import { Check } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Pricing — AEO Visibility Tracker',
  description: 'Simple, transparent pricing for AI visibility tracking.',
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started.',
    features: ['10 Keywords', 'Gemini Engine', 'Monthly Scans', 'Basic Report'],
    cta: 'Get Started',
    href: '/login',
  },
  {
    name: 'Starter',
    price: '$49',
    description: 'Best for small brands.',
    features: ['50 Keywords', 'Gemini + Perplexity', 'Weekly Scans', 'Fix Briefs', 'Email Digest'],
    cta: 'Buy Starter',
    href: `https://store.lemonsqueezy.com/buy/${process.env.LEMONSQUEEZY_STARTER_VARIANT_ID}`,
    highlight: true,
  },
  {
    name: 'Pro',
    price: '$79',
    description: 'For power users and agencies.',
    features: ['150 Keywords', 'All Engines (Inc. Grok)', 'Weekly Scans', 'Fix Briefs', 'Priority Support'],
    cta: 'Buy Pro',
    href: `https://store.lemonsqueezy.com/buy/${process.env.LEMONSQUEEZY_PRO_VARIANT_ID}`,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-xl font-bold">AEO Visibility Tracker</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-slate-600">Choose the perfect plan for your AEO needs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`bg-white rounded-2xl shadow-sm border ${plan.highlight ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'} p-8`}>
              <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
              <p className="text-slate-500 mb-6">{plan.description}</p>
              <div className="text-4xl font-bold mb-6">{plan.price}<span className="text-base font-normal text-slate-500">/mo</span></div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-500" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.href}
                className={`block w-full text-center py-3 rounded-lg font-semibold ${plan.highlight ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}