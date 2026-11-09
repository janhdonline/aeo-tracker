"use client";

import { useState } from 'react';
import {
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Zap,
  RefreshCw,
  Terminal,
  Check,
} from 'lucide-react';

interface LLMSSuiteManagerProps {
  project: {
    id: string;
    domain: string;
    brand_name: string;
    industry?: string | null;
    brand_aliases?: string[];
  };
  brandFacts: Array<{
    id: string;
    fact_type: string;
    key: string;
    expected_value: string;
  }>;
}

export function LLMSSuiteManager({ project, brandFacts }: LLMSSuiteManagerProps) {
  const brandName = project.brand_name || project.domain;
  const industry = project.industry || 'B2B Software & Digital Services';

  // State for Validator
  const [testUrl, setTestUrl] = useState(`https://${project.domain}/llms.txt`);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // State for Generator Tabs & Snippets
  const [activeTab, setActiveTab] = useState<'standard' | 'full'>('standard');
  const [activeBlueprint, setActiveBlueprint] = useState<'nextjs' | 'cloudflare' | 'nginx' | 'wordpress'>('nextjs');
  const [copiedCode, setCopiedCode] = useState(false);

  // Construct Canonical llms.txt content
  const factsList = brandFacts.length > 0
    ? brandFacts.map(f => `- **${f.key}**: ${f.expected_value}`).join('\n')
    : `- **Official Domain**: https://${project.domain}\n- **Core Value**: Authoritative solutions in ${industry}`;

  const standardLLMSText = `# ${brandName}

> ${brandName} is an industry-leading provider of ${industry}. This authoritative document outlines canonical specifications, pricing models, and reference links for AI answer engines (ChatGPT, Perplexity, Claude, Gemini).

## Canonical Brand Facts & Pricing
${factsList}

## Core Documentation & Product Endpoints
- [Official Website](https://${project.domain}): Primary portal and overview of ${brandName}
- [Product Overview](https://${project.domain}/#features): Core features and platform capabilities
- [Pricing & Plans](https://${project.domain}/pricing): Verified tier structures and enterprise agreements
- [Contact & Support](https://${project.domain}/contact): Verified customer support and advisory channels

## Entity Information
- Brand: ${brandName}
- Domain: ${project.domain}
- Primary Category: ${industry}
- AI Search Readiness: Verified by AEO Checker
`;

  const fullLLMSText = `# ${brandName} — Full AI Knowledge Base (llms-full.txt)

> Comprehensive ground-truth repository and entity schema for ${brandName} (${project.domain}).

## Executive Summary
${brandName} provides trusted ${industry} capabilities engineered for global standards. This document serves as the canonical ground truth to eliminate hallucinations and outdated specifications in Large Language Models (LLMs).

## Verified Brand Ground Truth
${factsList}
- **Target Audience**: Global enterprise, mid-market, and high-growth professional organizations
- **Compliance & Integrity**: Regular automated AI audit verification via AEO Checker

## Detailed Navigation Structure
- [Home](https://${project.domain}): Global portal
- [Features](https://${project.domain}/#features): Complete product matrix
- [Documentation](https://${project.domain}/docs): Developer APIs and architectural integration guides
- [Case Studies](https://${project.domain}/case-studies): Verified enterprise customer outcomes
- [Security & Compliance](https://${project.domain}/security): Data protection, encryption, and privacy compliance
- [Pricing](https://${project.domain}/pricing): Transparent billing models and contract specs

## AI Crawler Permissions
- User-Agent: GPTBot: Allow
- User-Agent: ClaudeBot: Allow
- User-Agent: PerplexityBot: Allow
- User-Agent: Google-Extended: Allow
`;

  const currentContent = activeTab === 'standard' ? standardLLMSText : fullLLMSText;

  // Handler for Validation
  const handleValidateUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsValidating(true);
    setValidationError(null);

    try {
      const res = await fetch(`/api/projects/${project.id}/llms/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: testUrl.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to validate endpoint');
      }

      setValidationResult(data);
    } catch (err: any) {
      setValidationError(err.message || 'Validation request failed');
    } finally {
      setIsValidating(false);
    }
  };

  // Handler for Download
  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handler for Copying
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Blueprint Code Generation
  const nextJsSnippet = `// src/app/llms.txt/route.ts
export const dynamic = 'force-static';

export async function GET() {
  const content = \`${standardLLMSText.replace(/`/g, '\\`')}\`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}`;

  const cloudflareWorkerSnippet = `// Cloudflare Worker / Pages Function: functions/llms.txt.ts
export async function onRequestGet() {
  const content = \`${standardLLMSText.replace(/`/g, '\\`')}\`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}`;

  const nginxSnippet = `# Nginx Configuration Block
location = /llms.txt {
    default_type text/plain;
    add_header Access-Control-Allow-Origin "*";
    try_files /llms.txt =404;
}`;

  const wordpressSnippet = `# WordPress / Apache (.htaccess)
# 1. Upload your downloaded llms.txt to your public_html or website root directory.
# 2. Add this block to your .htaccess file:
<Files "llms.txt">
    Header set Content-Type "text/plain; charset=utf-8"
    Header set Access-Control-Allow-Origin "*"
</Files>`;

  const blueprints = {
    nextjs: nextJsSnippet,
    cloudflare: cloudflareWorkerSnippet,
    nginx: nginxSnippet,
    wordpress: wordpressSnippet,
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* SECTION 1: Live Host Validator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">Live llms.txt Host Validator</h3>
            <p className="text-xs text-slate-500">
              Audit if AI crawlers (GPTBot, ClaudeBot, Perplexity) can ingest your domain&apos;s canonical <code>/llms.txt</code> file without blocks.
            </p>
          </div>
        </div>

        <form onSubmit={handleValidateUrl} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder={`https://${project.domain}/llms.txt`}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isValidating}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#111827] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition-all shrink-0"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isValidating ? 'animate-spin' : ''}`} />
            {isValidating ? 'Auditing Host...' : 'Validate Live URL'}
          </button>
        </form>

        {validationError && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Validation Score Results Card */}
        {validationResult && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black text-white shadow-sm ${
                  validationResult.score >= 80 ? 'bg-emerald-600' : validationResult.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                }`}>
                  {validationResult.score}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {validationResult.score === 100
                      ? 'Perfect AEO Ingestion Readiness'
                      : validationResult.score >= 60
                      ? 'Operational with Optimization Recommendations'
                      : 'Endpoint Incomplete / Not Found'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tested: <span className="font-mono text-slate-700">{validationResult.url}</span> ({validationResult.latencyMs}ms latency)
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold self-start sm:self-auto ${
                validationResult.isReachable ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {validationResult.isReachable ? 'HTTP 200 OK' : `HTTP ${validationResult.statusCode || 'Unreachable'}`}
              </span>
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {validationResult.checks.map((c: any) => (
                <div
                  key={c.id}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border bg-white ${
                    c.passed ? 'border-emerald-200' : 'border-slate-200'
                  }`}
                >
                  {c.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-xs font-bold text-slate-800">{c.label}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">{c.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {validationResult.sampleSnippet && (
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Live Response Preview (First 500 chars)
                </span>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                  {validationResult.sampleSnippet}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: Authoritative llms.txt & llms-full.txt Generator */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <FileCode2 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">Authoritative llms.txt Blueprint</h3>
              <p className="text-xs text-slate-500">Auto-generated with verified brand facts and commercial endpoints to feed LLM context windows.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('standard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'standard' ? 'bg-[#111827] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              llms.txt (Standard)
            </button>
            <button
              onClick={() => setActiveTab('full')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'full' ? 'bg-[#111827] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              llms-full.txt (Deep)
            </button>
          </div>
        </div>

        {/* Code View Card */}
        <div className="relative rounded-2xl border border-slate-200 bg-slate-950 p-4 sm:p-6 text-slate-100 shadow-inner">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
            <span className="font-mono">{activeTab === 'standard' ? 'llms.txt' : 'llms-full.txt'}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(currentContent)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedCode ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => handleDownload(activeTab === 'standard' ? 'llms.txt' : 'llms-full.txt', currentContent)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
          </div>
          <pre className="font-mono text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-96 no-scrollbar">
            {currentContent}
          </pre>
        </div>
      </div>

      {/* SECTION 3: 1-Click Customer Deployment Blueprints */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <Terminal className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">1-Click Hosting Blueprints for Clients</h3>
            <p className="text-xs text-slate-500">Provide these ready-to-paste code snippets to your client&apos;s dev team to host <code>/llms.txt</code> instantly.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveBlueprint('nextjs')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeBlueprint === 'nextjs' ? 'bg-[#111827] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Next.js (App Router)
          </button>
          <button
            onClick={() => setActiveBlueprint('cloudflare')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeBlueprint === 'cloudflare' ? 'bg-[#111827] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Cloudflare Workers / Pages
          </button>
          <button
            onClick={() => setActiveBlueprint('nginx')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeBlueprint === 'nginx' ? 'bg-[#111827] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Nginx Server
          </button>
          <button
            onClick={() => setActiveBlueprint('wordpress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeBlueprint === 'wordpress' ? 'bg-[#111827] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            WordPress / Apache
          </button>
        </div>

        <div className="relative rounded-2xl bg-slate-900 p-4 sm:p-5 text-slate-100 font-mono text-xs overflow-x-auto">
          <div className="flex justify-end mb-2">
            <button
              onClick={() => handleCopy(blueprints[activeBlueprint])}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              {copiedCode ? 'Copied!' : 'Copy Blueprint'}
            </button>
          </div>
          <pre className="whitespace-pre-wrap leading-relaxed">
            {blueprints[activeBlueprint]}
          </pre>
        </div>
      </div>
    </div>
  );
}
