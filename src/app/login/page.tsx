'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/landing/BrandLogos';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleSignUp = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email || !password) {
      setError('Email and password are required.');
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setError('Check your email for the confirmation link.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/60 p-4">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="mb-3 hover:opacity-90 transition-opacity">
            <LogoMark />
          </Link>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            AEO Visibility Tracker
          </h2>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3.5 py-2.5 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              className="mt-1 block w-full px-3.5 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#eb9d2a] focus:border-[#eb9d2a] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="mt-1 block w-full px-3.5 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#eb9d2a] focus:border-[#eb9d2a] transition-colors"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-[#eb9d2a] hover:bg-[#d88b1e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eb9d2a] disabled:opacity-50 transition-all duration-200"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300 disabled:opacity-50 transition-all duration-200"
            >
              Sign Up
            </button>
          </div>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 transition-colors">
              ← Back to homepage
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
