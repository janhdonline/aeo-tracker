'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  X,
  Layers,
  ArrowRight,
  Bot,
  Zap,
} from 'lucide-react';

export interface ProductSKU {
  id: string;
  project_id: string;
  name: string;
  sku_code: string;
  category: string;
  target_url: string;
  description: string;
  visibility_score: number;
  citations_count: number;
  status: 'active' | 'leak' | 'optimizing';
  created_at?: string;
}

interface ProductSKUManagerProps {
  projectId: string;
  domain: string;
  brandName: string;
}

export function ProductSKUManager({ projectId, domain, brandName }: ProductSKUManagerProps) {
  const [products, setProducts] = useState<ProductSKU[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [auditingId, setAuditingId] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [category, setCategory] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [projectId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${projectId}/products`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          sku_code: skuCode,
          category: category || 'Software Product',
          target_url: targetUrl || `https://${domain}`,
          description,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          setProducts((prev) => [data.product, ...prev]);
          setShowAddModal(false);
          setName('');
          setSkuCode('');
          setCategory('');
          setTargetUrl('');
          setDescription('');
        }
      }
    } catch (e) {
      console.error('Failed to add product:', e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      await fetch(`/api/projects/${projectId}/products?productId=${productId}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Failed to delete product:', e);
    }
  };

  const handleRunAudit = async (prod: ProductSKU) => {
    setAuditingId(prod.id);
    try {
      const res = await fetch(`/api/projects/${projectId}/products/audit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: prod.id,
          productName: prod.name,
          category: prod.category,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAuditResult(data);
        // Update product score in state
        setProducts((prev) =>
          prev.map((p) =>
            p.id === prod.id
              ? {
                  ...p,
                  visibility_score: data.newVisibilityScore,
                  citations_count: data.newCitationsCount,
                }
              : p
          )
        );
      }
    } catch (e) {
      console.error('Audit failed:', e);
    } finally {
      setAuditingId(null);
    }
  };

  const avgProductScore =
    products.length > 0
      ? Math.round(products.reduce((acc, p) => acc + p.visibility_score, 0) / products.length)
      : 84;

  const totalCitations = products.reduce((acc, p) => acc + p.citations_count, 0);

  return (
    <div className="space-y-6">
      {/* Top Rollup KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Tracked SKUs
          </span>
          <span className="font-display text-2xl font-black text-slate-900 tabular-nums">
            {products.length}
          </span>
          <span className="text-[11px] text-slate-500 block">Products under {brandName}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Avg SKU Visibility
          </span>
          <span className="font-display text-2xl font-black text-emerald-600 tabular-nums">
            {avgProductScore}/100
          </span>
          <span className="text-[11px] text-slate-500 block">Roll-up AEO authority</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            SKU AI Citations
          </span>
          <span className="font-display text-2xl font-black text-blue-600 tabular-nums">
            {totalCitations}
          </span>
          <span className="text-[11px] text-slate-500 block">Direct product mentions</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Citation Health
          </span>
          <span className="font-display text-2xl font-black text-indigo-600 tabular-nums">
            {products.filter((p) => p.status === 'active').length}/{products.length}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold block">Active in generative search</span>
        </div>
      </div>

      {/* Main Section Header with Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="font-display text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            <span>Product & Sub-SKU Entity Hierarchy</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor discrete AI visibility scores for each product and service under <strong>{domain}</strong>.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="h-3.5 w-3.5 text-emerald-400" />
          <span>Add Product SKU</span>
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">Loading product hierarchy...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200 bg-white p-6 space-y-3">
          <Package className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No sub-products defined yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Adding individual products allows you to track whether ChatGPT and Perplexity recommend specific features (e.g. Stripe Connect vs Stripe Billing).
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5" />
            Add First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-card hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {prod.sku_code || 'SKU'}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${
                          prod.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : prod.status === 'leak'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {prod.status === 'active'
                          ? 'High Visibility'
                          : prod.status === 'leak'
                          ? 'Citation Leak'
                          : 'Optimizing'}
                      </span>
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-900 leading-snug">
                      {prod.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">{prod.category}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-display text-lg font-black text-slate-900 block tabular-nums">
                      {prod.visibility_score}/100
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 block">AEO Score</span>
                  </div>
                </div>

                {prod.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>
                )}

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] flex items-center justify-between">
                  <span className="text-slate-500">AI Citations:</span>
                  <span className="font-bold text-slate-900">{prod.citations_count} captured</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleRunAudit(prod)}
                  disabled={auditingId === prod.id}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${auditingId === prod.id ? 'animate-spin' : ''}`}
                  />
                  <span>{auditingId === prod.id ? 'Auditing AI...' : 'Run SKU Audit'}</span>
                </button>

                <div className="flex items-center gap-1">
                  {prod.target_url && (
                    <a
                      href={prod.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Open Product URL"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(prod.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Product SKU"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Strategic Education Callout */}
      <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
          <span>
            <strong>AEO Product Entity Strategy:</strong> When commercial buyers prompt ChatGPT (&ldquo;What is the best marketplace payment engine?&rdquo;), models search for specific sub-product entities (e.g. <em>Stripe Connect</em>), not just the parent brand. Tracking individual SKUs pinpoints which sub-products are losing market share to competitors.
          </span>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="h-4 w-4 text-indigo-600" />
                  Add Sub-Product / SKU Entity
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Stripe Connect or Notion AI"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">SKU / Code Identifier</label>
                    <input
                      type="text"
                      value={skuCode}
                      onChange={(e) => setSkuCode(e.target.value)}
                      placeholder="e.g. CONN-MKT"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Category / Domain</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Marketplace Split Payments"
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Landing Page URL</label>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder={`https://${domain}/features/connect`}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Core Capability Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief definition of what this product solves for commercial buyers..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Creating SKU...' : 'Save Product SKU'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Audit Result Modal */}
      <AnimatePresence>
        {auditResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                    Live SKU Answer Radar Telemetry
                  </span>
                  <h3 className="font-display text-base font-bold text-slate-900">
                    {auditResult.productName} Visibility Audit
                  </h3>
                </div>
                <button
                  onClick={() => setAuditResult(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <span className="text-slate-400 font-medium">Commercial Prompt Audited:</span>
                <p className="font-bold text-slate-900 italic">&ldquo;{auditResult.queryTested}&rdquo;</p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">Model Quotations:</span>
                <div className="space-y-2">
                  {auditResult.engineBreakdown?.map((eb: any, i: number) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900">{eb.engine}</span>
                        <p className="text-[11px] text-slate-600 mt-0.5">{eb.snippet}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded shrink-0">
                        {eb.position}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px] text-emerald-900 leading-relaxed">
                💡 <strong>Optimization Tip:</strong> {auditResult.recommendation}
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-100">
                <button
                  onClick={() => setAuditResult(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
