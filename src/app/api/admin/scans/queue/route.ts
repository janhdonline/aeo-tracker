import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { getConfigNumber } from '@/lib/config';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'all';
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100);

    const admin = createAdminClient();
    const stuckTimeoutMs = await getConfigNumber('stuck_timeout_ms', 600_000); // 10 mins default
    const stuckThresholdIso = new Date(Date.now() - stuckTimeoutMs).toISOString();
    const todayIso = new Date(Date.now() - 86400 * 1000).toISOString();

    // Query scan_runs with project info
    let query = admin
      .from('scan_runs')
      .select(`
        id,
        project_id,
        started_at,
        finished_at,
        status,
        total_queries,
        api_cost_usd,
        projects (
          id,
          brand_name,
          domain,
          user_id
        )
      `)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: runs, error: runsError } = await query;
    if (runsError) {
      return NextResponse.json({ error: runsError.message }, { status: 500 });
    }

    // Get aggregated counts for quick dashboard metrics
    const { data: countsData } = await admin
      .from('scan_runs')
      .select('status, started_at')
      .gte('started_at', todayIso);

    let runningCount = 0;
    let pendingCount = 0;
    let stuckCount = 0;
    let failedToday = 0;
    let completedToday = 0;

    for (const r of countsData || []) {
      if (r.status === 'running') {
        runningCount++;
        if (r.started_at && r.started_at < stuckThresholdIso) {
          stuckCount++;
        }
      } else if (r.status === 'pending') {
        pendingCount++;
      } else if (r.status === 'failed') {
        failedToday++;
      } else if (r.status === 'done') {
        completedToday++;
      }
    }

    const formattedRuns = (runs || []).map((r: any) => {
      const isStuck = r.status === 'running' && r.started_at && r.started_at < stuckThresholdIso;
      return {
        id: r.id,
        projectId: r.project_id,
        brandName: r.projects?.brand_name || 'Unknown',
        domain: r.projects?.domain || 'Unknown',
        startedAt: r.started_at,
        finishedAt: r.finished_at,
        status: isStuck ? 'stuck' : r.status,
        totalQueries: r.total_queries || 0,
        apiCostUsd: r.api_cost_usd || 0,
        isStuck: Boolean(isStuck),
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        running: runningCount,
        pending: pendingCount,
        stuck: stuckCount,
        failedToday,
        completedToday,
      },
      runs: formattedRuns,
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
    const { action, scanId } = body;

    const admin = createAdminClient();

    if (action === 'kill') {
      if (!scanId) {
        return NextResponse.json({ error: 'scanId is required' }, { status: 400 });
      }

      const { data, error } = await admin
        .from('scan_runs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
        })
        .eq('id', scanId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'scan_terminated_by_admin',
        target_type: 'scan_runs',
        target_id: scanId,
      });

      return NextResponse.json({
        success: true,
        message: 'Scan terminated successfully',
        scan: data,
      });
    }

    if (action === 'retry') {
      if (!scanId) {
        return NextResponse.json({ error: 'scanId is required' }, { status: 400 });
      }

      const { data, error } = await admin
        .from('scan_runs')
        .update({
          status: 'pending',
          finished_at: null,
        })
        .eq('id', scanId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'scan_retried_by_admin',
        target_type: 'scan_runs',
        target_id: scanId,
      });

      return NextResponse.json({
        success: true,
        message: 'Scan reset to pending status for re-processing',
        scan: data,
      });
    }

    if (action === 'kill_all_stuck') {
      const stuckTimeoutMs = await getConfigNumber('stuck_timeout_ms', 600_000);
      const stuckThresholdIso = new Date(Date.now() - stuckTimeoutMs).toISOString();

      const { data: stuckRuns, error: findError } = await admin
        .from('scan_runs')
        .select('id')
        .eq('status', 'running')
        .lt('started_at', stuckThresholdIso);

      if (findError) {
        return NextResponse.json({ error: findError.message }, { status: 500 });
      }

      const stuckIds = (stuckRuns || []).map((r) => r.id);
      if (stuckIds.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No stuck scans found to terminate',
          killedCount: 0,
        });
      }

      const { error: updateError } = await admin
        .from('scan_runs')
        .update({
          status: 'failed',
          finished_at: new Date().toISOString(),
        })
        .in('id', stuckIds);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'batch_kill_stuck_scans',
        target_type: 'scan_runs',
        new_value: { killedCount: stuckIds.length, scanIds: stuckIds },
      });

      return NextResponse.json({
        success: true,
        message: `Successfully killed ${stuckIds.length} stuck scan(s)`,
        killedCount: stuckIds.length,
      });
    }

    return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
