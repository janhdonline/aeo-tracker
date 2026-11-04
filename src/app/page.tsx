"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
    <main className="min-h-screen bg-white text-black">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <span className="font-bold text-lg">AEO Visibility Tracker</span>
          <div className="flex gap-3">
            <a href="/login" className="text-sm font-medium px-4 py-2">Sign In</a>
            <a href="/login" className="bg-[#eb9d2a] hover:bg-[#d88b1e] text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200">Get Started</a>
          </div>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">See how AI answers talk about your brand</h1>
        <p className="mt-4 text-lg text-[#313131]">Track your visibility across Perplexity, ChatGPT, Gemini, and Grok.</p>
        <form onSubmit={handleCheck} className="mt-8 flex gap-2 justify-center">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="yourdomain.com"
            className="border border-gray-300 rounded-lg px-4 py-3 w-64 shadow-sm focus:ring-2 focus:ring-[#eb9d2a] focus:outline-none"
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
          <div className="mt-6 text-left border rounded-xl p-6 bg-[#eeefe9] shadow-sm">
            <p className="font-semibold">Visibility score: {result.visibilityScore}</p>
            <p className="text-sm text-[#313131]">{result.totalMentions} mentions across {result.totalQueries} queries</p>
            <a href={`/report/${domain}`} className="text-[#eb9d2a] underline mt-2 inline-block">View full report</a>
          </div>
        )}
        <div className="mt-8 flex gap-4 justify-center text-sm">
          <a href="#pricing" className="underline">Pricing</a>
          <a href="/report/shopify.com" className="underline">Live example report</a>
        </div>
      </section>

      <section id="pricing" className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center">Pricing</h2>
        <p className="text-center text-[#313131] mt-2">Three plans. All engines included.</p>
      </section>
    </main>
  );
}
