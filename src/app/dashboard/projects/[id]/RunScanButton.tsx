'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { LogoLoader } from '@/components/LogoLoader';

export function RunScanButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState<string>('Running Live Scan...');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRunScan = async () => {
    setLoading(true);
    setError(null);
    setStatusText('Querying AI Engines...');

    try {
      let response = await fetch('/api/scan/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Scan failed');
      }

      let data = await response.json();
      let iteration = 1;

      // Automatically loop through all remaining query chunks until complete
      while (data.hasMore && data.runId) {
        iteration++;
        setStatusText(`Auditing Citations (Chunk ${iteration})...`);
        response = await fetch('/api/scan/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ runId: data.runId }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Chunk processing failed');
        }

        data = await response.json();
      }

      setStatusText('Syncing Visibility Scores...');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setLoading(false);
      setStatusText('Running Live Scan...');
    }
  };

  return (
    <motion.div
      whileHover={{ scale: loading ? 1 : 1.02 }}
      whileTap={{ scale: loading ? 1 : 0.98 }}
    >
      <button
        onClick={handleRunScan}
        disabled={loading}
        className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 font-semibold text-xs shadow-xs"
      >
        {loading ? (
          <LogoLoader variant="mini" text={statusText} />
        ) : (
          <>
            <Play className="h-3.5 w-3.5 fill-current text-emerald-400" />
            <span>Run Scan</span>
          </>
        )}
      </button>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-red-500 text-xs mt-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}
