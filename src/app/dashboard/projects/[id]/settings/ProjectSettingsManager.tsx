"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Send,
  Trash2,
  ExternalLink,
  ShieldAlert,
  FileCode2,
  Building,
  Globe,
  Tag,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface ProjectSettingsManagerProps {
  project: {
    id: string;
    domain: string;
    brand_name: string;
    brand_aliases?: string[];
    competitor_domains?: string[];
    industry?: string | null;
    active: boolean;
    created_at: string;
  };
  userEmail: string;
}

const INDUSTRIES = [
  'Fintech & Banking',
  'Cybersecurity & Privacy',
  'B2B SaaS & Cloud Software',
  'E-Commerce & D2C Retail',
  'AI & Developer Tools',
  'Healthcare & Life Sciences',
  'Professional Services & Legal',
  'Real Estate & PropTech',
  'Travel, Hospitality & Logistics',
  'Other / Emerging Tech',
];

export function ProjectSettingsManager({ project, userEmail }: ProjectSettingsManagerProps) {
  const router = useRouter();

  // Brand & Accuracy State
  const [brandName, setBrandName] = useState(project.brand_name || '');
  const [industry, setIndustry] = useState(project.industry || INDUSTRIES[0]);
  const [aliases, setAliases] = useState<string[]>(project.brand_aliases || []);
  const [newAlias, setNewAlias] = useState('');

  // Competitor Domains State
  const [competitors, setCompetitors] = useState<string[]>(project.competitor_domains || []);
  const [newCompetitor, setNewCompetitor] = useState('');

  // Email Digest State
  const [recipientEmail, setRecipientEmail] = useState(userEmail);
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(true);
  const [misinformationAlertsEnabled, setMisinformationAlertsEnabled] = useState(true);

  // Status & Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDomainInput, setConfirmDomainInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Handlers for Aliases
  const handleAddAlias = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newAlias.trim();
    if (clean && !aliases.some((a) => a.toLowerCase() === clean.toLowerCase())) {
      setAliases([...aliases, clean]);
      setNewAlias('');
    }
  };

  const handleRemoveAlias = (aliasToRemove: string) => {
    setAliases(aliases.filter((a) => a !== aliasToRemove));
  };

  // Handlers for Competitors
  const handleAddCompetitor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newCompetitor
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '');
    if (clean && !competitors.includes(clean)) {
      setCompetitors([...competitors, clean]);
      setNewCompetitor('');
    }
  };

  const handleRemoveCompetitor = (compToRemove: string) => {
    setCompetitors(competitors.filter((c) => c !== compToRemove));
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/projects/${project.id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: brandName,
          industry,
          brand_aliases: aliases,
          competitor_domains: competitors,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setSaveSuccess(true);
      router.refresh();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setSaveError(err.message || 'Error updating settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Dispatch Test Email Digest
  const handleSendTestDigest = async () => {
    setIsSendingEmail(true);
    setEmailStatus(null);

    try {
      const res = await fetch(`/api/projects/${project.id}/email-digest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: recipientEmail.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch email digest');
      }

      setEmailStatus({
        success: true,
        message: data.message || `Executive digest dispatched to ${recipientEmail}`,
      });
    } catch (err: any) {
      setEmailStatus({
        success: false,
        message: err.message || 'Failed to dispatch email',
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Delete Project
  const handleDeleteProject = async () => {
    if (confirmDomainInput.trim().toLowerCase() !== project.domain.toLowerCase()) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/settings`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete project');
      }

      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Top Notification Toasts */}
      {saveSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold">Settings saved successfully! All future scans will use updated brand aliases and intelligence targets.</p>
        </div>
      )}

      {saveError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 flex items-center gap-3 animate-fade-in shadow-sm">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <p className="text-sm font-semibold">{saveError}</p>
        </div>
      )}

      {/* CARD 1: Brand Identity & Accuracy Tuning */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Building className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">Brand Identity & Accuracy Tuning</h3>
            <p className="text-xs text-slate-500">Fine-tune brand aliases to guarantee 100% accurate entity detection across ChatGPT, Perplexity, and Gemini.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Primary Brand Name
              </label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Revolut"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tracked Domain (Canonical)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={project.domain}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed font-mono"
                />
                <Link
                  href={`/report/${project.domain}`}
                  target="_blank"
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors shrink-0"
                  title="View Public Report"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Industry / Vertical
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white font-medium"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Aliases Tag Editor */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Brand Aliases & Trade Names
              </label>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                100% Mention Accuracy
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              When AI answers questions, it may refer to your client as <em>&quot;Revolut Bank&quot;</em>, <em>&quot;Revolut Ltd&quot;</em>, or <em>&quot;Revolut App&quot;</em>. Adding these aliases ensures no mentions are ever missed in Share of Voice calculations.
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {aliases.map((alias) => (
                <span
                  key={alias}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 shadow-xs"
                >
                  <Tag className="h-3 w-3 text-blue-500" />
                  {alias}
                  <button
                    type="button"
                    onClick={() => handleRemoveAlias(alias)}
                    className="text-slate-400 hover:text-rose-600 transition-colors ml-1 font-bold text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
              {aliases.length === 0 && (
                <span className="text-xs text-slate-400 italic">No aliases added yet. Add variants below.</span>
              )}
            </div>

            <form onSubmit={handleAddAlias} className="flex gap-2">
              <input
                type="text"
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value)}
                placeholder="Add alias (e.g. Revolut UK, Revolut Business) and press Enter"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                + Add Alias
              </button>
            </form>
          </div>

          {/* Competitor Domains Tag Editor */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tracked Competitor Domains
              </label>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">
                Share of Voice Benchmark
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              The scanner benchmarks your brand against these competitors across all commercial keywords.
            </p>

            <div className="flex flex-wrap gap-2 mb-3">
              {competitors.map((comp) => (
                <span
                  key={comp}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 shadow-xs"
                >
                  <Globe className="h-3 w-3 text-amber-500" />
                  {comp}
                  <button
                    type="button"
                    onClick={() => handleRemoveCompetitor(comp)}
                    className="text-slate-400 hover:text-rose-600 transition-colors ml-1 font-bold text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
              {competitors.length === 0 && (
                <span className="text-xs text-slate-400 italic">No competitors configured. Add competitor domains below.</span>
              )}
            </div>

            <form onSubmit={handleAddCompetitor} className="flex gap-2">
              <input
                type="text"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                placeholder="Add competitor domain (e.g. wise.com, n26.com)"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                + Add Competitor
              </button>
            </form>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#111827] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 transition-all"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving Changes...' : 'Save Brand Settings'}
            </button>
          </div>
        </div>
      </div>

      {/* CARD 2: Automated Weekly Executive Digest & Email Delivery */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Mail className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-900">Automated Weekly Executive PDF Digest</h3>
            <p className="text-xs text-slate-500">Scheduled delivery to keep your client updated on AI visibility gains, competitor gaps, and brand integrity.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Client / Recipient Email Address
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="client@company.com"
                className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
              <button
                type="button"
                onClick={handleSendTestDigest}
                disabled={isSendingEmail}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shrink-0 disabled:opacity-50"
              >
                <Send className="h-3.5 w-3.5" />
                {isSendingEmail ? 'Sending Test...' : 'Send Test Digest Now'}
              </button>
            </div>
            {emailStatus && (
              <div
                className={`mt-2.5 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  emailStatus.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {emailStatus.success ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />}
                <span>{emailStatus.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={weeklyDigestEnabled}
                onChange={(e) => setWeeklyDigestEnabled(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Send Scheduled Weekly Executive Digest (Mondays 09:00 UTC)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Dispatches a clean summary with Visibility Score delta, new AI citations, and direct PDF report download.</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={misinformationAlertsEnabled}
                onChange={(e) => setMisinformationAlertsEnabled(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">Instant AI Hallucination & Pricing Discrepancy Alerts</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Sends an instant alert whenever ChatGPT or Perplexity is caught quoting incorrect pricing or false product specs.</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* CARD 3: llms.txt Suite Quick Access */}
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shrink-0">
              <FileCode2 className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display text-base font-bold text-slate-900">AEO llms.txt Knowledge Engine & Validator</h3>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">Ready</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Validate your client&apos;s live <code>/llms.txt</code> endpoint and download authoritative knowledge snippets for GPTBot and ClaudeBot.
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/projects/${project.id}/llms`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors shrink-0"
          >
            Launch llms.txt Suite
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* CARD 4: Danger Zone */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
            <Trash2 className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-rose-950">Danger Zone</h3>
            <p className="text-xs text-rose-700">Permanently delete this project and all historical scan records.</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Deleting <strong>{project.domain}</strong> will permanently remove all keywords, historical scan runs, AI citations, and fix briefs. This action cannot be undone.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-xs"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Project...
        </button>
      </div>

      {/* Confirmation Modal for Project Deletion */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="max-w-md w-full rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="h-6 w-6" />
              <h4 className="font-display text-lg font-bold text-slate-900">Confirm Deletion</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please type <strong className="text-slate-900 font-mono select-all">{project.domain}</strong> below to confirm permanent deletion of this project.
            </p>
            <input
              type="text"
              value={confirmDomainInput}
              onChange={(e) => setConfirmDomainInput(e.target.value)}
              placeholder={project.domain}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono focus:border-rose-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmDomainInput('');
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProject}
                disabled={isDeleting || confirmDomainInput.trim().toLowerCase() !== project.domain.toLowerCase()}
                className="px-4 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
