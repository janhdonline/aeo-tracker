import type { Metadata } from 'next';
import Link from 'next/link';
import { LogoMark } from '@/components/landing/BrandLogos';
import {
  Mail,
  MessageSquare,
  Sparkles,
  Building,
  ShieldCheck,
  Send,
  Clock,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us — AEO Checker Support & Enterprise',
  description:
    'Get in touch with the AEO Checker team for technical support, feature requests, enterprise inquiries, and partnerships.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact AEO Checker Support',
    description:
      'Have questions about AI search optimization or our API? Reach out to our team.',
    url: '/contact',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans antialiased text-slate-900 selection:bg-[#D4F63C] selection:text-black">
      {/* Top Header */}
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
              href="/pricing"
              className="text-xs font-bold text-slate-600 hover:text-slate-950 px-3 py-2 rounded-xl transition"
            >
              Pricing
            </Link>
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 w-full space-y-12">
        {/* Obsidian Bento Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0B0F17] p-8 sm:p-12 text-white border border-slate-800 shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-lime-500/15 blur-3xl" />
          <div className="relative max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-lime-400/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#D4F63C] ring-1 ring-lime-400/20">
              <Sparkles className="h-3.5 w-3.5 text-[#D4F63C]" />
              Dedicated 24/7 Concierge
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Connect with Our <span className="text-[#D4F63C]">AEO Engineering</span> Team
            </h1>
            <p className="text-xs sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Whether you need custom crawler whitelist integration, agency multi-workspace billing, or deep LLM telemetry diagnostics, our team responds within one business day.
            </p>
          </div>
        </div>

        {/* Bento Grid: Contact Channels + Direct Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Bento Channels */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-card">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xs mb-4">
                <Mail className="h-5 w-5 text-[#D4F63C]" />
              </span>
              <h2 className="text-sm font-black text-slate-950">General Inquiries &amp; Support</h2>
              <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                For help with your monitored keywords, citation tracking, or platform accounts.
              </p>
              <a
                href="mailto:contact@aeovisibility.com"
                className="text-xs font-bold text-slate-950 underline decoration-slate-300 hover:text-emerald-600 transition"
              >
                contact@aeovisibility.com
              </a>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-card">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-xs mb-4">
                <Building className="h-5 w-5" />
              </span>
              <h2 className="text-sm font-black text-slate-950">Enterprise &amp; Agency Scale</h2>
              <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
                For high-volume query throughput, custom webhook web-hooks, and SLA support.
              </p>
              <a
                href="mailto:enterprise@aeovisibility.com"
                className="text-xs font-bold text-slate-950 underline decoration-slate-300 hover:text-emerald-600 transition"
              >
                enterprise@aeovisibility.com
              </a>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-card">
              <div className="flex items-center gap-2 text-xs font-black text-slate-900 mb-1">
                <Clock className="h-4 w-4 text-indigo-600" />
                Response Guarantee
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                We review inbound requests continuously. Typical turnaround is under 4 business hours.
              </p>
            </div>
          </div>

          {/* Direct Message Form Card */}
          <div className="lg:col-span-2 rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-card">
            <h2 className="text-lg font-black text-slate-950 mb-1">Send a Direct Transmission</h2>
            <p className="text-xs text-slate-500 mb-6">
              Fill out the details below and an AEO specialist will get back to you promptly.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('Thank you for reaching out! Our team has received your message and will respond shortly.');
              }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Rivera"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@company.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Tracked Domain (Optional)
                </label>
                <input
                  type="text"
                  placeholder="yourcompany.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Message / Inquiry
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Tell us what you are looking to achieve with AEO..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-all shadow-2xs"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-xs font-bold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5 text-[#D4F63C]" />
                  <span>Transmit Message</span>
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
              <LogoMark className="h-8 w-8" />
              <span className="text-[15px] font-black tracking-[-0.03em] text-[#0B0F17]">
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
                  className="text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-slate-100 pt-6 text-[11px] font-medium text-slate-400 sm:flex-row">
            <p>© 2026 AEO Tracker. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
              Built for the AI Answer Engine era.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
