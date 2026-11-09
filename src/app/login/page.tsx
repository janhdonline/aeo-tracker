'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/landing/BrandLogos';
import { LogoLoader } from '@/components/LogoLoader';
import { Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Read error from redirect (e.g. from /auth/callback)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        setGoogleLoading(false);
      }
      // If successful, the browser will redirect to Google's consent screen automatically
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate Google sign in. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const supabase = createClient();

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
      } else if (data.session) {
        // Direct login if email confirmations are disabled in Supabase
        router.push('/dashboard');
        router.refresh();
      } else {
        setSuccessMessage('Account created! Please check your email inbox to confirm your account.');
        setLoading(false);
      }
    } else {
      // Sign in mode
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-50/80 p-4 sm:p-6">
      <div className="max-w-md w-full space-y-6 p-7 sm:p-8 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="mb-3 hover:opacity-90 transition-opacity">
            <LogoMark />
          </Link>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            AEO Visibility Tracker
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Track & boost your brand visibility across AI search engines
          </p>
        </div>

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Notifications: Error or Success */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-xl text-sm text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="leading-snug">{error}</div>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-sm text-emerald-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-snug">{successMessage}</div>
          </div>
        )}

        {/* Google OAuth Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={googleLoading || loading}
            className="w-full py-2.5 px-4 flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm shadow-sm transition-all duration-150 hover:shadow disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <LogoLoader variant="mini" text="Connecting to Google..." />
            ) : (
              <>
                <GoogleIcon />
                <span>
                  {mode === 'signup'
                    ? 'Sign up with Google'
                    : 'Continue with Google'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-xs uppercase tracking-wider text-slate-400 font-medium shrink-0">
            or with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form className="space-y-4" onSubmit={handleEmailAuth}>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eb9d2a] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Password
              </label>
              {mode === 'signup' && (
                <span className="text-[11px] text-slate-400">Min 6 characters</span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#eb9d2a] focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl shadow-md shadow-amber-500/20 text-sm font-semibold text-white bg-gradient-to-r from-[#eb9d2a] to-[#d88b1e] hover:from-[#d88b1e] hover:to-[#c47c17] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#eb9d2a] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <LogoLoader variant="mini" text="Processing..." />
            ) : mode === 'signup' ? (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Create Free Account</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>

          {/* Mode Switch Footer */}
          <div className="text-center pt-2">
            {mode === 'signin' ? (
              <p className="text-xs text-slate-500">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-[#eb9d2a] hover:text-[#d88b1e] underline underline-offset-2 transition-colors"
                >
                  Sign up free
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="font-semibold text-[#eb9d2a] hover:text-[#d88b1e] underline underline-offset-2 transition-colors"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          <div className="text-center pt-1">
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
              ← Back to homepage
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <LogoLoader
          variant="fullscreen"
          text="Authenticating..."
          subtext="Securing your AEO session..."
        />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
