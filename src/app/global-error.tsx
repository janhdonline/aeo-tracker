'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured by Next.js GlobalError:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc', color: '#1e293b' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ maxWidth: '440px', width: '100%', backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ width: '56px', height: '56px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '14px', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
              ⚠️
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px', color: '#0f172a' }}>
              Application Encountered an Error
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, margin: '0 0 24px' }}>
              An unexpected system error occurred. We apologize for the inconvenience. Please try refreshing the page or restarting your session.
            </p>

            <button
              onClick={() => reset()}
              style={{ width: '100%', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '10px' }}
            >
              Try Again
            </button>

            <a
              href="/"
              style={{ display: 'block', width: '100%', backgroundColor: '#f1f5f9', color: '#334155', textDecoration: 'none', padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, boxSizing: 'border-box' }}
            >
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
