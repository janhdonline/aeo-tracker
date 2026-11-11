import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — AEO Checker',
  description: 'Terms and conditions for using the AEO Checker platform, automated AI scan APIs, and diagnostic tools.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-display text-4xl font-bold tracking-tight mb-6">Terms of Service</h1>
        <p className="text-slate-600 leading-relaxed mb-4">By using AEO Visibility Tracker you agree to use the service lawfully. Subscriptions are billed via Lemon Squeezy. We provide the service as-is without warranties.</p>
        <p className="text-slate-600 leading-relaxed">Contact: contact@aeovisibility.com.</p>
      </div>
    </main>
  );
}
