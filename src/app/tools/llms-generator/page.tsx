'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Copy, Check, Sparkles, ArrowRight } from 'lucide-react';
import { generateLlmsTxt } from '@/lib/llms-generator';
import Link from 'next/link';
import { LogoMark } from '@/components/landing/BrandLogos';

export default function LlmsGeneratorPage() {
  const [brandName, setBrandName] = useState('');
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!brandName || !domain) return;

    const result = generateLlmsTxt({
      brandName,
      domain,
      description: description || `${brandName} is a leading provider of innovative solutions.`,
    });

    setOutput(result.llmsTxt);
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      <main className="flex-1 max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-slate-950 text-white shadow-xs mb-3">
            <FileText className="h-8 w-8 text-[#D4F63C]" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Authoritative llms.txt Generator</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Structure your company knowledge into a standardized <code className="font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">/llms.txt</code> file for GPTBot, ClaudeBot, and IDE agents.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-card border border-slate-200/90 p-6 sm:p-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Brand Name *</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Domain *</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="acme.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Brand Value Proposition &amp; Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of your products, primary features, and core competitive advantages..."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!brandName || !domain}
              className="w-full bg-slate-950 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold disabled:opacity-50 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-[#D4F63C]" />
              <span>Generate Authoritative llms.txt</span>
            </button>
          </div>
        </div>

        {output && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="bg-[#0B0F17] rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#D4F63C]" />
                  <h2 className="text-white text-xs font-mono font-bold">/llms.txt output</h2>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[#D4F63C]" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied to Clipboard!' : 'Copy Code'}
                </button>
              </div>
              <pre className="text-xs text-slate-200 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto leading-relaxed">
                {output}
              </pre>
            </div>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-4 text-xs text-emerald-950 font-medium">
              <strong>Implementation:</strong> Save this file in your root public directory (e.g.{' '}
              <code className="font-mono bg-emerald-100/70 px-1 py-0.5 rounded font-bold">https://{domain || 'yourdomain.com'}/llms.txt</code>).
              AI crawlers from Anthropic, OpenAI, and Perplexity will automatically parse this specification.
            </div>
          </motion.div>
        )}
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
