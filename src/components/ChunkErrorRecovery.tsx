'use client';

import { useEffect } from 'react';

/**
 * Handles stale deployment chunk loading errors gracefully.
 *
 * When a new build is deployed to production (e.g. Cloudflare Workers),
 * existing browser sessions may attempt to prefetch or lazy-load chunk files
 * from the previous build that no longer exist on the server (returning 404).
 *
 * This component listens for ChunkLoadError and automatically reloads the page
 * once to fetch the latest deployment assets, preventing stuck navigation.
 */
export function ChunkErrorRecovery() {
  useEffect(() => {
    const isChunkFailure = (msg: string) => {
      const lower = msg.toLowerCase();
      return (
        lower.includes('chunkloaderror') ||
        lower.includes('loading chunk') ||
        lower.includes('failed to fetch rsc payload') ||
        lower.includes('loading css chunk')
      );
    };

    const handleWindowError = (event: ErrorEvent) => {
      const msg = event?.message || event?.error?.message || '';
      if (isChunkFailure(msg)) {
        triggerSafeReload();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = event?.reason?.message || String(event?.reason || '');
      if (isChunkFailure(msg)) {
        triggerSafeReload();
      }
    };

    const triggerSafeReload = () => {
      try {
        const STORAGE_KEY = 'aeo_last_chunk_reload';
        const lastReload = sessionStorage.getItem(STORAGE_KEY);
        const now = Date.now();

        // Allow at most 1 automatic reload per 15 seconds to avoid reload loops
        if (!lastReload || now - parseInt(lastReload, 10) > 15000) {
          sessionStorage.setItem(STORAGE_KEY, String(now));
          console.warn('Stale build chunks detected. Auto-reloading to fetch latest version...');
          window.location.reload();
        }
      } catch {
        // Fallback if sessionStorage is disabled/restricted
        window.location.reload();
      }
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
