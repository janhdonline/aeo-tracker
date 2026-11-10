'use client';

import { useEffect, useState } from 'react';

interface BannerData {
  active: boolean;
  text: string;
  type: 'info' | 'warning' | 'alert';
  link?: string;
}

export function GlobalAnnouncementBanner() {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadStatus() {
      try {
        const res = await fetch('/api/system/status');
        if (!res.ok) return;
        const data = await res.json();
        if (data.banner && data.banner.active && data.banner.text) {
          const sessionDismissed = sessionStorage.getItem('dismissed_banner_' + data.banner.text);
          if (isMounted) {
            setBanner(data.banner);
            setDismissed(Boolean(sessionDismissed));
          }
        }
      } catch {
        // Silently ignore network hiccup
      }
    }

    loadStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!banner || !banner.active || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    sessionStorage.setItem('dismissed_banner_' + banner.text, 'true');
    setDismissed(true);
  };

  const colorStyles = {
    info: 'bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-blue-900/90 border-blue-500/30 text-blue-100',
    warning: 'bg-gradient-to-r from-amber-950/90 via-orange-950/90 to-amber-950/90 border-amber-500/30 text-amber-100',
    alert: 'bg-gradient-to-r from-rose-950/90 via-red-950/90 to-rose-950/90 border-rose-500/30 text-rose-100',
  }[banner.type];

  const badgeStyles = {
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    alert: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  }[banner.type];

  return (
    <div
      role="alert"
      className={`relative z-50 w-full border-b px-4 py-2.5 backdrop-blur-md transition-all duration-300 ${colorStyles}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${badgeStyles}`}
          >
            {banner.type}
          </span>
          <span className="truncate font-medium">{banner.text}</span>
          {banner.link && (
            <a
              href={banner.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80"
            >
              Learn more →
            </a>
          )}
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss banner"
          className="rounded p-1 opacity-70 transition hover:bg-white/10 hover:opacity-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
