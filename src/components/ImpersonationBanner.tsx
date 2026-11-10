'use client';

import { useEffect, useState } from 'react';

interface ImpersonationState {
  active: boolean;
  userId?: string;
  email?: string;
}

export function ImpersonationBanner() {
  const [state, setState] = useState<ImpersonationState | null>(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    fetch('/api/admin/impersonate')
      .then((res) => res.json())
      .then((data) => {
        if (data.active) {
          setState(data);
        }
      })
      .catch(() => {});
  }, []);

  if (!state || !state.active) {
    return null;
  }

  const handleExit = async () => {
    setExiting(true);
    try {
      await fetch('/api/admin/impersonate', { method: 'DELETE' });
      window.location.href = '/admin';
    } catch {
      window.location.href = '/admin';
    }
  };

  return (
    <div className="sticky top-0 z-[100] w-full border-b border-amber-600/50 bg-amber-500 px-4 py-2 text-slate-950 shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 text-xs font-medium sm:text-sm">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-red-600 animate-ping" />
          <span className="font-bold uppercase tracking-wider text-[11px] bg-amber-950/20 px-2 py-0.5 rounded">
            Impersonation Active
          </span>
          <span className="truncate">
            You are viewing the dashboard as{' '}
            <strong className="font-semibold underline">{state.email || state.userId}</strong>
          </span>
        </div>
        <button
          onClick={handleExit}
          disabled={exiting}
          className="rounded-md bg-slate-950 px-3 py-1 text-xs font-semibold text-white shadow transition hover:bg-slate-800 disabled:opacity-50"
        >
          {exiting ? 'Exiting...' : 'Exit to Admin'}
        </button>
      </div>
    </div>
  );
}
