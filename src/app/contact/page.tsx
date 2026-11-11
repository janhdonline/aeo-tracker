import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us — AEO Checker Support',
  description: 'Get in touch with the AEO Checker team for support, feature requests, enterprise inquiries, and partnerships.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact AEO Checker Support',
    description: 'Have questions about AI search optimization or our API? Reach out to our team.',
    url: '/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="font-display text-4xl font-bold tracking-tight mb-6">Contact Us</h1>
        <p className="text-slate-600 leading-relaxed mb-4">Have questions or feedback? Reach out to us at <a href="mailto:contact@aeovisibility.com" className="text-slate-900 font-semibold underline hover:text-emerald-600 transition-colors">contact@aeovisibility.com</a>.</p>
        <p className="text-slate-600 leading-relaxed">We typically respond within one business day.</p>
      </div>
    </main>
  );
}
