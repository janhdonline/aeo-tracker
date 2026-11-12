import type { Metadata } from 'next';
import Link from 'next/link';
import { LogoMark } from '@/components/landing/BrandLogos';
import {
  Mail,
  Sparkles,
  Building,
  Send,
  Clock,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us — AEO Tracker Enterprise Support',
  description:
    'Get in touch with the AEO Tracker team for technical support, enterprise API inquiries, and partner integration.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact AEO Tracker Support',
    description:
      'Have questions about AI answer engine optimization or custom telemetry? Contact our team.',
    url: '/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans antialiased text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Top Header */}
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
              href="/pricing"
              className="text-xs font-semibold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-lg transition"
            >
              Pricing
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-12">
        {/* Executive Slate Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-8 sm:p-12 text-white border border-slate-800 shadow-card">
          <div className="hero-grid pointer-events-none absolute inset-0 opacity-15" aria-hidden="true" />
          <div className="relative max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3.5 py-1 text-xs font-medium text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              Technical Concierge &amp; Inquiries
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">
              Connect with Our <span className="text-emerald-400">AEO Engineering</span> Team
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Whether you need crawler whitelist verification, agency multi-workspace setups, or custom LLM diagnostic reports, our engineering team responds within one business day.
            </p>
          </div>
        </div>

        {/* Grid: Channels + Direct Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Channels */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs mb-4">
                <Mail className="h-5 w-5 text-emerald-400" />
              </span>
              <h2 className="font-display text-sm font-bold text-slate-950">General Inquiries &amp; Support</h2>
              <p className="text-xs text-slate-600 mt-1 mb-4 leading-relaxed">
                For account inquiries, prompt configuration, or public audit questions.
              </p>
              <a
                href="mailto:contact@aeovisibility.com"
                className="font-mono text-xs font-semibold text-slate-900 underline decoration-slate-300 hover:text-emerald-600 transition"
              >
                contact@aeovisibility.com
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-2xs mb-4">
                <Building className="h-5 w-5" />
              </span>
              <h2 className="font-display text-sm font-bold text-slate-950">Enterprise &amp; Agency Inquiries</h2>
              <p className="text-xs text-slate-600 mt-1 mb-4 leading-relaxed">
                For custom keyword capacity, dedicated IP endpoints, and service level agreements.
              </p>
              <a
                href="mailto:enterprise@aeovisibility.com"
                className="font-mono text-xs font-semibold text-slate-900 underline decoration-slate-300 hover:text-emerald-600 transition"
              >
                enterprise@aeovisibility.com
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 mb-1">
                <Clock className="h-4 w-4 text-emerald-600" />
                Response Commitment
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inbound requests are triaged directly by our technical team. Typical response time is under 4 business hours.
              </p>
            </div>
          </div>

          {/* Direct Message Form Card */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-7 sm:p-9 shadow-card">
            <h2 className="font-display text-lg font-bold text-slate-950 mb-1">Send a Direct Inquiry</h2>
            <p className="text-xs text-slate-600 mb-6">
              Please share your project details and an AEO specialist will reply directly.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for reaching out! Our team has received your message and will respond shortly.');
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tracked Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="yourcompany.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Message Details
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your tracking goals or technical requirements..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all shadow-2xs"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Inquiry</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark className="h-7 w-7" />
              <span className="font-display text-sm font-bold tracking-tight text-slate-900">
                AEO Tracker
              </span>
            </Link>
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {[
                { label: 'Pricing', href: '/pricing' },
                { label: 'About', href: '/about' },
                { label: 'Contact', href: '/contact' },
                { label: 'Compare', href: '/compare' },
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs font-medium text-slate-600 transition-colors hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row">
            <p>© 2026 AEO Tracker. All rights reserved.</p>
            <p className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              All systems operational · Enterprise telemetry active
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
