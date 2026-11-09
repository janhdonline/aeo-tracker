import Link from 'next/link';
import { Compass, Home, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-5 ring-8 ring-blue-50/50">
          <Compass className="w-7 h-7" />
        </div>

        <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
          404 Not Found
        </span>

        <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-2">Page Not Found</h1>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          The page you are looking for doesn&apos;t exist, has been removed, or the link has expired.
        </p>

        <div className="flex flex-col gap-2.5">
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <LayoutDashboard className="w-4 h-4" />
            Go to Dashboard
          </Link>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Home className="w-4 h-4" />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
