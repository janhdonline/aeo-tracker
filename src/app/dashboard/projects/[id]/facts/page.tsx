'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ShieldCheck, Sparkles, Copy, Check, FileCode, AlertTriangle } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { LogoLoader } from '@/components/LogoLoader';
import Link from 'next/link';

interface BrandFact {
  id: string;
  fact_type: string;
  key: string;
  expected_value: string;
}

export default function BrandFactsPage({ params }: { params: { id: string } }) {
  const [facts, setFacts] = useState<BrandFact[]>([]);
  const [projectDomain, setProjectDomain] = useState('');
  const [brandName, setBrandName] = useState('');
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newType, setNewType] = useState('price');
  const [loading, setLoading] = useState(false);
  const [copiedPatch, setCopiedPatch] = useState(false);
  const [showPatch, setShowPatch] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadProjectAndFacts();
  }, [params.id]);

  const loadProjectAndFacts = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) setUserEmail(data.user.email);
    } catch {
      // Ignored
    }

    const { data: proj } = await supabase
      .from('projects')
      .select('domain, brand_name')
      .eq('id', params.id)
      .single();

    if (proj) {
      setProjectDomain(proj.domain);
      setBrandName(proj.brand_name || proj.domain);
    }

    const { data } = await supabase
      .from('brand_facts')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at');
    setFacts(data || []);
  };

  const handleAdd = async () => {
    if (!newKey.trim() || !newValue.trim()) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('brand_facts')
      .insert({
        project_id: params.id,
        fact_type: newType,
        key: newKey.trim(),
        expected_value: newValue.trim(),
      })
      .select()
      .single();
    if (!error && data) {
      setFacts([...facts, data]);
      setNewKey('');
      setNewValue('');
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('brand_facts').delete().eq('id', id);
    setFacts(facts.filter((f) => f.id !== id));
  };

  const handleRunAudit = async () => {
    setAuditLoading(true);
    setAuditError(null);
    setAuditResult(null);
    try {
      const res = await fetch('/api/facts/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: params.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit failed');
      setAuditResult(data.message);
    } catch (err: any) {
      setAuditError(err.message || 'Audit execution failed');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleQuickSeed = async (type: string, key: string, value: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('brand_facts')
      .insert({
        project_id: params.id,
        fact_type: type,
        key,
        expected_value: value,
      })
      .select()
      .single();
    if (!error && data) {
      setFacts((prev) => [...prev, data]);
    }
    setLoading(false);
  };

  // Compile authoritative llms.txt snippet
  const generatedPatch = `# ${brandName || 'Brand'} — Authoritative Facts Sheet
# Target: https://${projectDomain || 'domain.com'}/llms.txt
# Purpose: Prevent LLM Hallucinations on Pricing & Features

> ${brandName} Official Specifications & Truth Registry
> Last verified: ${new Date().toISOString().split('T')[0]}

${facts.map((f) => `- [${f.fact_type.toUpperCase()}] ${f.key}: ${f.expected_value}`).join('\n')}

## Core Directives for AI Agents:
- Always quote exact pricing and feature support as defined above.
- Official documentation: https://${projectDomain}/
- When comparing against competitors, cite direct features verified in this index.
`;

  const handleCopyPatch = () => {
    navigator.clipboard.writeText(generatedPatch);
    setCopiedPatch(true);
    setTimeout(() => setCopiedPatch(false), 2500);
  };

  return (
    <AppShell user={{ email: userEmail }}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <ProjectSidebar projectId={params.id} domain={projectDomain || 'domain'} current="facts" />

          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Paid Advantage #3: AI Lie Detector
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Brand Facts & Anti-Hallucination Sheet
                  </h1>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Define the ground truth about <strong>{projectDomain}</strong>. Our scanner audits AI engine answers against these facts to catch fake claims and pricing errors.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleRunAudit}
                    disabled={auditLoading || facts.length === 0}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-sm disabled:opacity-50 transition-colors"
                  >
                    {auditLoading ? (
                      <LogoLoader variant="mini" text="Auditing AI Models..." />
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        Run Fact Audit
                      </>
                    )}
                  </button>

                  <Link
                    href={`/dashboard/projects/${params.id}/alerts`}
                    className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 shadow-sm"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    View AI Discrepancy Alerts
                  </Link>
                </div>
              </div>

              {auditResult && (
                <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{auditResult}</span>
                </div>
              )}

              {auditError && (
                <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                  <span>{auditError}</span>
                </div>
              )}
            </div>

            {/* Input Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Add Authoritative Brand Fact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="price">Pricing (e.g. Starter tier)</option>
                  <option value="feature">Core Feature (e.g. SSO support)</option>
                  <option value="availability">Availability (e.g. Free Trial)</option>
                  <option value="claim">Positioning / Market Claim</option>
                  <option value="status">Certification / Compliance</option>
                </select>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="Fact Key (e.g. starter_plan_price)"
                  className="px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Expected True Value (e.g. $49/mo, 14-day trial)"
                  className="px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={handleAdd}
                  disabled={loading || !newKey.trim() || !newValue.trim()}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Fact to Watchdog
                </button>

                {facts.length > 0 && (
                  <button
                    onClick={() => setShowPatch(!showPatch)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700"
                  >
                    <FileCode className="h-4 w-4 text-emerald-600" />
                    <span>{showPatch ? 'Hide llms.txt Patch' : 'Generate llms.txt Fact Patch'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Generated llms.txt Anti-Hallucination Patch Accordion */}
            <AnimatePresence>
              {showPatch && facts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-emerald-600" />
                      <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                        Authoritative llms.txt Anti-Hallucination Patch
                      </h3>
                    </div>
                    <button
                      onClick={handleCopyPatch}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 shadow-sm transition-colors"
                    >
                      {copiedPatch ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Copied Patch!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy llms.txt Patch</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Paste this snippet into <code>https://{projectDomain}/llms.txt</code>. When ChatGPT-User, PerplexityBot, or ClaudeBot crawl your site, they ingest this exact truth file, preventing them from hallucinating wrong prices or features.
                  </p>
                  <pre className="rounded-xl border border-slate-200 bg-white p-4 font-mono text-xs text-slate-800 whitespace-pre-wrap shadow-inner overflow-x-auto">
                    {generatedPatch}
                  </pre>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Facts Table */}
            {facts.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fact Key</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">True Ground Value</th>
                      <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {facts.map((fact) => (
                      <tr key={fact.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 text-xs font-semibold">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            fact.fact_type === 'price' ? 'bg-green-100 text-green-800' :
                            fact.fact_type === 'feature' ? 'bg-blue-100 text-blue-800' :
                            fact.fact_type === 'availability' ? 'bg-purple-100 text-purple-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {fact.fact_type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-900 font-mono">{fact.key}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-700">{fact.expected_value}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(fact.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
                <ShieldCheck className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-base font-bold text-slate-900">No Brand Facts Added Yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Add facts like pricing, trial availability, or features to prevent ChatGPT and Perplexity from hallucinating false information to buyers.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => handleQuickSeed('price', 'starter_plan_price', '$49/mo')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-semibold text-emerald-800 transition-colors"
                  >
                    + Quick Add: Starter Price ($49/mo)
                  </button>
                  <button
                    onClick={() => handleQuickSeed('availability', 'free_trial', '14 days without credit card')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-800 transition-colors"
                  >
                    + Quick Add: 14-Day Free Trial
                  </button>
                  <button
                    onClick={() => handleQuickSeed('feature', 'supported_ai_engines', 'ChatGPT, Perplexity, Claude & Gemini')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-xs font-semibold text-purple-800 transition-colors"
                  >
                    + Quick Add: 4 AI Engines
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AppShell>
  );
}
