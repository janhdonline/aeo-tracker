import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400 * 1000).toISOString();
    const sixtyDaysAgo = new Date(Date.now() - 60 * 86400 * 1000).toISOString();
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400 * 1000).toISOString();
    const oneEightyDaysAgo = new Date(Date.now() - 180 * 86400 * 1000).toISOString();
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400 * 1000).toISOString();

    const [
      queries30Res,
      queries60Res,
      queries90Res,
      queries180Res,
      oldErrorsRes,
      oldHealthRes,
      totalQueriesRes,
    ] = await Promise.all([
      admin.from('query_results').select('id', { count: 'exact', head: true }).lt('created_at', thirtyDaysAgo),
      admin.from('query_results').select('id', { count: 'exact', head: true }).lt('created_at', sixtyDaysAgo),
      admin.from('query_results').select('id', { count: 'exact', head: true }).lt('created_at', ninetyDaysAgo),
      admin.from('query_results').select('id', { count: 'exact', head: true }).lt('created_at', oneEightyDaysAgo),
      admin.from('error_logs').select('id', { count: 'exact', head: true }).lt('created_at', thirtyDaysAgo),
      admin.from('engine_health_logs').select('id', { count: 'exact', head: true }).lt('checked_at', fourteenDaysAgo),
      admin.from('query_results').select('id', { count: 'exact', head: true }),
    ]);

    const q30 = queries30Res.count || 0;
    const q60 = queries60Res.count || 0;
    const q90 = queries90Res.count || 0;
    const q180 = queries180Res.count || 0;
    const oldErrors = oldErrorsRes.count || 0;
    const oldHealth = oldHealthRes.count || 0;
    const totalQueries = totalQueriesRes.count || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalQueries,
        oldQueriesNinetyDays: q90,
        oldErrorsThirtyDays: oldErrors,
        oldHealthLogsFourteenDays: oldHealth,
        totalReclaimableRows: q90 + oldErrors + oldHealth,
        breakdown: {
          queries: q90,
          errors: oldErrors,
          healthLogs: oldHealth,
        },
        horizons: {
          '30': q30 + oldErrors + oldHealth,
          '60': q60 + oldErrors + oldHealth,
          '90': q90 + oldErrors + oldHealth,
          '180': q180 + oldErrors + oldHealth,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { retentionDays = 90, pruneQueries = true, pruneErrors = true, pruneHealth = true } = body;

    const admin = createAdminClient();
    const thresholdIso = new Date(Date.now() - Number(retentionDays) * 86400 * 1000).toISOString();
    let prunedQueries = 0;
    let prunedErrors = 0;
    let prunedHealth = 0;

    // Prune query_results older than retentionDays
    if (pruneQueries) {
      const { data: deletedQueries, error: qErr } = await admin
        .from('query_results')
        .delete()
        .lt('created_at', thresholdIso)
        .select('id');

      if (!qErr && deletedQueries) {
        prunedQueries = deletedQueries.length;
      }
    }

    if (pruneErrors) {
      const thirtyDaysIso = new Date(Date.now() - 30 * 86400 * 1000).toISOString();
      const { data: deletedErr, error: eErr } = await admin
        .from('error_logs')
        .delete()
        .lt('created_at', thirtyDaysIso)
        .select('id');

      if (!eErr && deletedErr) {
        prunedErrors = deletedErr.length;
      }
    }

    if (pruneHealth) {
      const fourteenDaysIso = new Date(Date.now() - 14 * 86400 * 1000).toISOString();
      const { data: deletedH, error: hErr } = await admin
        .from('engine_health_logs')
        .delete()
        .lt('checked_at', fourteenDaysIso)
        .select('id');

      if (!hErr && deletedH) {
        prunedHealth = deletedH.length;
      }
    }

    const totalPruned = prunedQueries + prunedErrors + prunedHealth;

    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
      action: 'database_hygiene_prune_executed',
      target_type: 'database',
      new_value: {
        retentionDays,
        prunedQueries,
        prunedErrors,
        prunedHealth,
        totalPruned,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Database hygiene prune finished. Cleaned ${totalPruned} historical records.`,
      pruned: {
        queries: prunedQueries,
        errors: prunedErrors,
        healthLogs: prunedHealth,
        total: totalPruned,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
