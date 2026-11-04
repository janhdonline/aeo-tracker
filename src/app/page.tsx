"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data }: { data: { session: any } }) => {
        if (data.session) router.push('/dashboard');
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
    <main className="flex flex-col items-center min-h-screen px-4 py-16 bg-white text-black">
      <section className="max-w-3xl w-full text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          See how AI answers talk about your brand
        </h1>
        <p className="mt-4 text-lg text-zinc-600">
          Track your visibility across Perplexity, ChatGPT, Gemini, and Grok.
        </p>
        <form onSubmit={handleCheck} className="mt-8 flex gap-2 justify-center">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="yourdomain.com"
            className="border border-zinc-300 rounded px-4 py-2 w-64"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white rounded px-6 py-2 disabled:opacity-50"
          >
            {loading ? "Checking..." : "Free check"}
          </button>
        </form>
        {error && <p className="mt-4 text-red-600">{error}</p>}
        {result && (
          <div className="mt-6 text-left border rounded p-4">
            <p className="font-semibold">Visibility score: {result.visibilityScore}</p>
            <p className="text-sm text-zinc-600">
              {result.totalMentions} mentions across {result.totalQueries} queries
            </p>
            <a href={`/report/${domain}`} className="text-blue-600 underline mt-2 inline-block">
              View full report
            </a>
          </div>
        )}
        <div className="mt-8 flex gap-4 justify-center text-sm">
          <a href="#pricing" className="underline">Pricing</a>
          <a href="/report/shopify.com" className="underline">Live example report</a>
        </div>
      </section>
      <section id="pricing" className="max-w-3xl w-full mt-16">
        <h2 className="text-2xl font-bold text-center">Pricing</h2>
        <p className="text-center text-zinc-600 mt-2">Three plans. All engines included.</p>
      </section>
    </main>
  );
}
