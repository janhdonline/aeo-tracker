import type { Metadata } from 'next';
import Link from 'next/link';
import { LogoMark } from '@/components/landing/BrandLogos';
import { ShieldAlert, Sparkles, Scale, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service — AEO Checker',
  description:
    'Terms and conditions for using the AEO Checker platform, automated AI scan APIs, and diagnostic tools.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsPage() {
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
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full space-y-8">
        {/* Obsidian Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0B0F17] p-8 sm:p-12 text-white border border-slate-800 shadow-2xl">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-lime-500/10 blur-3xl" />
          <div className="relative max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-lime-400/10 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-[#D4F63C] ring-1 ring-lime-400/20">
              <Scale className="h-3.5 w-3.5 text-[#D4F63C]" />
              Terms of Service
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Terms &amp; Operational Standards
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Clear, transparent terms governing usage of AEO Tracker diagnostics, automated scans, and reporting APIs.
            </p>
          </div>
        </div>

        {/* Bento Content Sections */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-card space-y-8 text-xs sm:text-sm leading-relaxed text-slate-600">
          <div>
            <h2 className="text-base font-black text-slate-950 mb-2">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using AEO Tracker (the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity.
            </p>
          </div>

          <div>
            <h2 className="text-base font-black text-slate-950 mb-2">
              2. Acceptable Use of AI Diagnostic APIs
            </h2>
            <p>
              AEO Tracker is designed to assist brands in monitoring their organic visibility across public generative search engines. You agree not to use the service to execute abusive scraping, bypass third-party rate limits maliciously, or reverse-engineer the citation algorithms.
            </p>
          </div>

          <div>
            <h2 className="text-base font-black text-slate-950 mb-2">
              3. Subscriptions &amp; 14-Day Refund Policy
            </h2>
            <p>
              Paid plans are billed on a recurring monthly or annual basis via Lemon Squeezy. You may cancel your subscription at any time directly through your billing portal. We offer an unconditional 14-day refund policy from your initial subscription date if you are not completely satisfied.
            </p>
          </div>

          <div>
            <h2 className="text-base font-black text-slate-950 mb-2">
              4. Service Availability &amp; Third-Party LLM Changes
            </h2>
            <p>
              AEO Tracker surveys third-party AI models (including ChatGPT, Perplexity, Gemini, Claude, and DeepSeek). While we strive for 99.9% uptime, answer engine API responses, latency, and model availability are subject to their respective providers.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            Last Updated: January 2026. For legal inquiries, contact{' '}
            <a href="mailto:contact@aeovisibility.com" className="font-bold text-slate-950 underline hover:text-emerald-600">
              contact@aeovisibility.com
            </a>.
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
