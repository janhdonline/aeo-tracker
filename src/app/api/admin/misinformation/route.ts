import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();

    // 1. Fetch Misinformation Alerts
    const { data: alerts, error: alertErr } = await admin
      .from('misinformation_alerts')
      .select('id, project_id, engine, quote, claimed_value, expected_value, fact_type, confidence, reviewed, reviewed_at, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (alertErr) throw alertErr;

    // 2. Fetch Associated Projects for Domain Context
    const { data: projects } = await admin
      .from('projects')
      .select('id, domain, name');

    const projectMap: Record<string, { domain: string; name: string }> = {};
    for (const p of projects || []) {
      projectMap[p.id] = { domain: p.domain, name: p.name || p.domain };
    }

    const enrichedAlerts = (alerts || []).map((a) => ({
      ...a,
      project: projectMap[a.project_id] || { domain: 'Unknown', name: 'Unknown Project' },
    }));

    // 3. Fetch Fix Briefs Summary
    const { data: briefs } = await admin
      .from('fix_briefs')
      .select('id, project_id, gap_type, gap_description, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20);

    const enrichedBriefs = (briefs || []).map((b) => ({
      ...b,
      project: projectMap[b.project_id] || { domain: 'Unknown', name: 'Unknown Project' },
    }));

    const unreviewedCount = (alerts || []).filter((a) => !a.reviewed).length;
    const highConfidenceCount = (alerts || []).filter((a) => !a.reviewed && Number(a.confidence) >= 0.8).length;

    return NextResponse.json({
      success: true,
      alerts: enrichedAlerts,
      briefs: enrichedBriefs,
      stats: {
        totalAlerts: (alerts || []).length,
        unreviewedAlerts: unreviewedCount,
        highConfidenceAlerts: highConfidenceCount,
        totalBriefs: (briefs || []).length,
        openBriefs: (briefs || []).filter((b) => b.status === 'open').length,
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
    const { action } = body;
    const admin = createAdminClient();

    if (action === 'mark_reviewed') {
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

      const { data: updated, error } = await admin
        .from('misinformation_alerts')
        .update({
          reviewed: true,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'misinformation_marked_reviewed',
        target_type: 'misinformation_alerts',
        target_id: id,
      });

      return NextResponse.json({ success: true, alert: updated });
    }

    if (action === 'create_brief') {
      const { project_id, gap_type, gap_description, recommendation } = body;

      if (!project_id || !gap_type || !gap_description) {
        return NextResponse.json({ error: 'project_id, gap_type, and gap_description are required' }, { status: 400 });
      }

      const { data: inserted, error } = await admin
        .from('fix_briefs')
        .insert({
          project_id,
          gap_type,
          gap_description,
          recommendation: recommendation || {
            action: 'Update Schema & llms.txt',
            priority: 'high',
          },
          status: 'open',
        })
        .select()
        .single();

      if (error) throw error;

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'fix_brief_created',
        target_type: 'fix_briefs',
        target_id: inserted.id,
        new_value: { project_id, gap_type },
      });

      return NextResponse.json({ success: true, brief: inserted });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
