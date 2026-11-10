'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MaintenancePage() {
  const [message, setMessage] = useState('We are undergoing scheduled infrastructure maintenance. Services will resume shortly.');

  useEffect(() => {
    fetch('/api/system/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.maintenanceMessage) {
          setMessage(data.maintenanceMessage);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center text-slate-100">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30">
          <svg className="h-8 w-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">System Maintenance</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">{message}</p>
        <div className="mt-8 flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          >
            Check Status Again
          </button>
          <Link
            href="/admin"
            className="text-xs text-slate-500 transition hover:text-slate-300"
          >
            Administrator Login
          </Link>
        </div>
      </div>
    </div>
  );
}
