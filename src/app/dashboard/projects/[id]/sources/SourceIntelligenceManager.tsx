"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Copy,
  ExternalLink,
  Layers,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Building2,
  Newspaper,
  Globe2,
  CheckCircle2,
} from "lucide-react";
import type { SourceIntelligenceItem } from "@/lib/source-intelligence";

interface Props {
  projectId: string;
  domain: string;
  brandName: string;
  sources: SourceIntelligenceItem[];
}

export function SourceIntelligenceManager({ projectId, domain, brandName, sources }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [injectedItems, setInjectedItems] = useState<Record<string, boolean>>({});

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleInjected = (id: string) => {
    setInjectedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredSources =
    selectedCategory === "all"
      ? sources
      : sources.filter((s) => s.category === selectedCategory);

  const communityCount = sources.filter((s) => s.category === "community").length;
  const directoryCount = sources.filter((s) => s.category === "directory").length;
  const editorialCount = sources.filter((s) => s.category === "editorial").length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Influencing Sources
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{sources.length}</p>
          <p className="mt-1 text-xs text-slate-500">
            Domains feeding ChatGPT, Perplexity & Gemini answers
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Community / Reddit Weight
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
              <MessageSquare className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {sources.length > 0 ? Math.round((communityCount / sources.length) * 100) : 34}%
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-medium">
            High sentiment authority in AI RAG synthesis
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Injection Blueprints Ready
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold tracking-tight text-emerald-600">
            {sources.length} Actions
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Ready-to-copy snippets to reclaim lost citations
          </p>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: "all", label: `All Sources (${sources.length})` },
          { key: "community", label: `Community & Reddit (${communityCount})` },
          { key: "directory", label: `Directories & Reviews (${directoryCount})` },
          { key: "editorial", label: `Media & Blogs (${editorialCount})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedCategory(tab.key)}
            className={`rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
              selectedCategory === tab.key
                ? "border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sources Feed */}
      <div className="space-y-4">
        {filteredSources.map((source) => {
          const isInjected = !!injectedItems[source.id];
          const isCopied = copiedId === source.id;

          return (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-2xl border p-5 transition-all ${
                isInjected
                  ? "border-emerald-200 bg-emerald-50/30"
                  : "border-slate-200 bg-white shadow-sm"
              }`}
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-bold text-sm">
                    {source.domain.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{source.domain}</h3>
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                        {source.categoryLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cited {source.appearanceCount} times across AI engine answers
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                    Authority Influence: {source.influenceScore}/100
                  </span>
                  <button
                    onClick={() => handleToggleInjected(source.id)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${
                      isInjected
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {isInjected ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Injected
                      </>
                    ) : (
                      "Mark as Injected"
                    )}
                  </button>
                </div>
              </div>

              {/* Rationale & Injection Section */}
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Why AI Cited This */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                    <Globe2 className="h-3.5 w-3.5 text-slate-500" />
                    <span>Why AI Engines Cited This Source</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {source.whyAiCitedReason}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[11px] font-medium text-slate-400">Current Beneficiary:</span>
                    <span className="rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-semibold text-red-700">
                      {source.competitorBeneficiary}
                    </span>
                  </div>
                </div>

                {/* The Injection Blueprint */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{source.injectionBlueprint.actionTitle}</span>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {source.injectionBlueprint.estimatedLift}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {source.injectionBlueprint.actionDescription}
                  </p>

                  <div className="relative rounded-lg border border-slate-200 bg-white p-3 font-mono text-xs text-slate-800 shadow-inner">
                    <pre className="whitespace-pre-wrap font-sans text-xs text-slate-700">
                      {source.injectionBlueprint.copyableSnippet}
                    </pre>

                    <button
                      onClick={() =>
                        handleCopy(source.id, source.injectionBlueprint.copyableSnippet)
                      }
                      className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-500" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
