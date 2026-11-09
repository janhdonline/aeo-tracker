'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home, LogIn } from 'lucide-react';
import { LogoMark } from '@/components/landing/BrandLogos';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client or server rendering error
    console.error('Captured by Next.js App ErrorBoundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <div className="flex justify-center mb-5">
          <Link href="/">
            <LogoMark className="h-12 w-12" />
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          {error?.message && !error.message.includes('Server Components render')
            ? error.message
            : 'An unexpected issue occurred while rendering this page. You can try refreshing or returning to the dashboard.'}
        </p>

        {error?.digest && (
          <div className="bg-slate-50 rounded-lg p-2.5 mb-6 text-xs font-mono text-slate-500 break-all select-all">
            Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>

          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <Link
            href="/login"
            className="w-full inline-flex items-center justify-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium py-1.5 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In / Switch Account
          </Link>
        </div>
      </div>
    </div>
  );
}
