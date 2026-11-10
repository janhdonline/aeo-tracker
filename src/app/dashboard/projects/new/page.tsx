'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { Globe, ArrowRight, ShieldCheck, Sparkles, Building2, Layers } from 'lucide-react';
import Link from 'next/link';

export default function NewProjectPage() {
  const [domain, setDomain] = useState('');
  const [brandName, setBrandName] = useState('');
  const [brandAliases, setBrandAliases] = useState('');
  const [competitorDomains, setCompetitorDomains] = useState('');
  const [industry, setIndustry] = useState('B2B SaaS & Cloud Software');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then((res: any) => {
      if (res?.data?.user?.email) {
        setUserEmail(res.data.user.email);
      }
    });
  }, []);

  const sanitizeDomain = (raw: string) => {
    return raw
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .split('?')[0];
  };

  const handleDomainChange = (val: string) => {
    setDomain(val);
    if (!brandName) {
      const clean = sanitizeDomain(val);
      const namePart = clean.split('.')[0];
      if (namePart && namePart.length > 1) {
        setBrandName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanDomain = sanitizeDomain(domain);
    if (!cleanDomain || !cleanDomain.includes('.')) {
      setError('Please enter a valid domain (e.g. yourcompany.com)');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const authRes = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    const user = authRes?.data?.user;
    if (!user) {
      setError('You must be logged in to create a project');
      setLoading(false);
      return;
    }

    const finalBrand = brandName.trim() || cleanDomain.split('.')[0];
    const aliases = brandAliases
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const competitors = competitorDomains
      .split(',')
      .map((s) => sanitizeDomain(s))
      .filter((s) => s.length > 0 && s.includes('.'));

    const { data, error: insertError } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        domain: cleanDomain,
        brand_name: finalBrand,
        brand_aliases: aliases.length > 0 ? aliases : [finalBrand],
        competitor_domains: competitors,
        industry: industry || null,
        active: true,
      })
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push(`/dashboard/projects/${data.id}`);
    }
  };

  return (
    <AppShell user={{ email: userEmail || undefined }}>
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-6">
          <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Track New Property</span>
        </div>

        {/* Card Header */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-card mb-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xs">
              <Globe className="h-6 w-6 text-emerald-400" />
            </span>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60 mb-2">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                AI Visibility Studio Setup
              </div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950">
                Track a New Web Property
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Configure your business domain and primary competitors to monitor where ChatGPT, Perplexity, Gemini, and Claude cite your brand.
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl bg-rose-50 border border-rose-200/80 p-4 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Domain & Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Website Domain <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => handleDomainChange(e.target.value)}
                    placeholder="acme.com"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">e.g. stripe.com or linear.app</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Acme Inc"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
                />
                <p className="mt-1 text-[11px] text-slate-500">How AI models should identify your brand</p>
              </div>
            </div>

            {/* Industry Vertical */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Industry Vertical
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
              >
                <option value="B2B SaaS & Cloud Software">B2B SaaS & Cloud Software</option>
                <option value="Fintech & Banking">Fintech & Banking</option>
                <option value="AI & Developer Tools">AI & Developer Tools</option>
                <option value="Cybersecurity & Privacy">Cybersecurity & Privacy</option>
                <option value="E-Commerce & D2C Retail">E-Commerce & D2C Retail</option>
                <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                <option value="Professional Services & Agency">Professional Services & Agency</option>
                <option value="Other / Emerging Tech">Other / Emerging Tech</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-500">Tailors buyer prompts and citation intelligence</p>
            </div>

            {/* Brand Aliases */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Brand Aliases (Optional, comma-separated)
              </label>
              <input
                type="text"
                value={brandAliases}
                onChange={(e) => setBrandAliases(e.target.value)}
                placeholder="Acme, AcmeHQ, Acme Software"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
              />
              <p className="mt-1 text-[11px] text-slate-500">Prevents false negatives if AI engines use abbreviated names</p>
            </div>

            {/* Competitor Domains */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tracked Competitors (Optional, comma-separated)
              </label>
              <input
                type="text"
                value={competitorDomains}
                onChange={(e) => setCompetitorDomains(e.target.value)}
                placeholder="competitor1.com, competitor2.io"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-900 focus:ring-1 focus:ring-slate-900 focus:outline-none transition-all shadow-2xs"
              />
              <p className="mt-1 text-[11px] text-slate-500">Used to compute Share of Voice & citation gap analysis</p>
            </div>

            {/* Submit Action */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <Link
                href="/dashboard"
                className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <span>Initializing Property...</span>
                ) : (
                  <>
                    <span>Create & Launch Monitoring</span>
                    <ArrowRight className="h-3.5 w-3.5 text-emerald-400" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Feature Highlights Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-600">
          <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Real-time Citation Radar
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Monitors Perplexity, ChatGPT, and Gemini for verified citations of your domain.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
              <Building2 className="h-4 w-4 text-indigo-600" />
              Share of Voice
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Direct market intelligence benchmarking against named competitors.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
              <Layers className="h-4 w-4 text-purple-600" />
              One-Click Action Briefs
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Automated blueprints to capture missed citations and correct hallucinations.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
