"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const prompts = [
  "Best CRM for small business",
  "Top project management tools",
  "Best email marketing software",
  "Best SEO tools 2026",
  "Top AI writing assistants",
  "Best accounting software",
  "Top helpdesk tools",
  "Best ecommerce platforms",
];

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    if (typeof window !== "undefined" && window.location.hash.includes("access_token")) {
      supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
        if (data.session) router.push("/dashboard");
      });
    }
  }, [router]);

  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!domain) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/free-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="font-display font-bold text-lg">AEO Visibility Tracker</span>
          <div className="flex gap-3">
            <a href="/login" className="text-sm font-medium px-4 py-2 text-slate-600 hover:text-slate-900">Login</a>
            <a href="/login" className="bg-[#eb9d2a] hover:bg-[#d88b1e] text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200">Sign Up</a>
          </div>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight">
          See how AI answers talk about <span className="text-[#eb9d2a]">your brand</span>
        </h1>
        <p className="mt-4 text-lg text-slate-500">Track your visibility across ChatGPT, Gemini, Claude, Perplexity, DeepSeek, Mistral.</p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {[
            { name: "ChatGPT", domain: "chat.openai.com" },
            { name: "Gemini", domain: "gemini.google.com" },
            { name: "Claude", domain: "claude.ai" },
            { name: "Perplexity", domain: "perplexity.ai" },
            { name: "DeepSeek", domain: "chat.deepseek.com" },
            { name: "Mistral", domain: "mistral.ai" },
          ].map((e, i) => (
            <span key={e.name} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white text-sm text-slate-600" style={{ animationDelay: `${i * 80}ms` }}>
              <img src={`https://www.google.com/s2/favicons?domain=${e.domain}&sz=64`} alt="" className="w-4 h-4" />
              {e.name}
            </span>
          ))}
        </div>
        <div className="mt-3 flex gap-2 justify-center text-xs text-slate-400">
          Try: {["shopify.com","notion.com","stripe.com"].map((d)=>(
            <button key={d} onClick={()=>setDomain(d)} className="underline hover:text-[#eb9d2a]">{d}</button>
          ))}
        </div>
        <form onSubmit={handleCheck} className="mt-8 flex gap-2 justify-center">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="yourdomain.com"
            className="border border-slate-300 rounded-lg px-4 py-3 w-64 shadow-sm focus:ring-2 focus:ring-[#eb9d2a] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#eb9d2a] hover:bg-[#d88b1e] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Free check"}
          </button>
        </form>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {result && (
          <div className="mt-6 text-left border rounded-2xl p-6 bg-slate-50 shadow-sm">
            <p className="font-display font-bold">Visibility score: {result.visibilityScore}</p>
            <p className="text-sm text-slate-500">{result.totalMentions} mentions across {result.totalQueries} queries</p>
            <a href={`/report/${domain}`} className="text-[#eb9d2a] underline mt-2 inline-block">View full report</a>
          </div>
        )}
      </section>

      <section className="overflow-hidden py-8">
        <div className="flex marquee gap-4">
          {[...prompts, ...prompts].map((p, i) => (
            <span key={i} className="whitespace-nowrap px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-600">{p}</span>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "AI answers analyzed", value: "10k+" },
          { label: "Keywords tracked", value: "5k+" },
          { label: "Brands monitored", value: "500+" },
          { label: "Engines covered", value: "6" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <p className="font-display text-3xl font-bold text-[#eb9d2a]">{s.value}</p>
            <p className="text-sm text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-3 gap-6">
        {[
          { title: "Track visibility", desc: "Monitor how AI engines mention your brand across keywords." },
          { title: "Find gaps", desc: "Get actionable fix briefs to close visibility gaps." },
          { title: "Verify fixes", desc: "Re-check after changes to confirm improvement." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
            <h3 className="font-display text-xl font-bold">{f.title}</h3>
            <p className="text-slate-500 mt-2">{f.desc}</p>
          </div>
        ))}
      </section>

      <section id="pricing" className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl bg-gradient-to-r from-[#eb9d2a]/10 to-[#eb9d2a]/5 p-12 border border-slate-200">
          <h2 className="font-display text-3xl font-bold">Start tracking your AI visibility today</h2>
          <a href="/login" className="inline-block mt-6 bg-[#eb9d2a] hover:bg-[#d88b1e] text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200">Get Started</a>
        </div>
      </section>

      <section id="faq" className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="font-display text-2xl font-bold text-center mb-6">FAQ</h2>
        {[
          { q: "What is AEO?", a: "Answer Engine Optimization improves your visibility in AI-generated answers." },
          { q: "How does tracking work?", a: "We query multiple AI engines weekly and parse mentions of your brand." },
          { q: "Which engines are covered?", a: "ChatGPT, Gemini, Claude, Perplexity, DeepSeek, and Mistral." },
          { q: "Can I cancel anytime?", a: "Yes, subscriptions can be cancelled at any time." },
          { q: "Is there a free tier?", a: "Yes, free plan includes basic tracking." },
        ].map((f, i) => (
          <details key={i} className="border border-slate-200 rounded-xl p-4 mb-3">
            <summary className="font-display font-bold cursor-pointer">{f.q}</summary>
            <p className="text-slate-500 mt-2">{f.a}</p>
          </details>
        ))}
      </section>

      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8 text-sm text-slate-500">
          <div><p className="font-display font-bold text-slate-900">AEO Visibility Tracker</p><p className="mt-2">Track your brand in AI answers.</p></div>
          <div><p className="font-semibold text-slate-900">Product</p><ul className="mt-2 space-y-1"><li><a href="#features" className="hover:text-[#eb9d2a]">Features</a></li><li><a href="#pricing" className="hover:text-[#eb9d2a]">Pricing</a></li><li><a href="/report/shopify.com" className="hover:text-[#eb9d2a]">Example report</a></li></ul></div>
          <div><p className="font-semibold text-slate-900">Resources</p><ul className="mt-2 space-y-1"><li><a href="#how" className="hover:text-[#eb9d2a]">How it works</a></li><li><a href="#faq" className="hover:text-[#eb9d2a]">FAQs</a></li></ul></div>
          <div><p className="font-semibold text-slate-900">Company</p><ul className="mt-2 space-y-1"><li><a href="#" className="hover:text-[#eb9d2a]">About</a></li><li><a href="#" className="hover:text-[#eb9d2a]">Contact</a></li><li><a href="/privacy" className="hover:text-[#eb9d2a]">Privacy</a></li><li><a href="/terms" className="hover:text-[#eb9d2a]">Terms</a></li></ul></div>
        </div>
      </footer>
    </main>
  );
}
