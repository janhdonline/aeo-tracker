// Lightweight error monitoring using Supabase (no external paid service).
// Logs errors to an `error_logs` table for the dashboard to display.
// Falls back to console.error if Supabase is unavailable.

import { createAdminClient } from '@/lib/supabase/admin';

export interface ErrorLog {
  message: string;
  stack?: string;
  endpoint?: string;
  severity?: 'error' | 'warning' | 'info';
  metadata?: Record<string, unknown>;
}

export async function logError(log: ErrorLog): Promise<void> {
  // Always log to console for debugging
  console.error(`[error-monitor] ${log.severity || 'error'}: ${log.message}`, log.metadata);

  try {
    const adminClient = createAdminClient();
    await adminClient.from('error_logs').insert({
      message: log.message,
      stack: log.stack,
      endpoint: log.endpoint,
      severity: log.severity || 'error',
      metadata: log.metadata || {},
    });
  } catch (error) {
    // Silently fail if error_logs table doesn't exist or DB is unavailable
    console.error('[error-monitor] Failed to log to Supabase:', error);
  }
}

export function captureException(error: unknown, endpoint?: string, metadata?: Record<string, unknown>): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  logError({ message, stack, endpoint, severity: 'error', metadata });
}

export function captureWarning(message: string, endpoint?: string, metadata?: Record<string, unknown>): void {
  logError({ message, endpoint, severity: 'warning', metadata });
}
