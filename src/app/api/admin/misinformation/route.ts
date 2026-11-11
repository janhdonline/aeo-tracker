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
      project: projectMap[a.project_id] || { domain: 'Unknown Target', name: 'General Brand' },
    }));

    // 3. Fetch Fix Briefs Summary
    const { data: briefs } = await admin
      .from('fix_briefs')
      .select('id, project_id, gap_type, gap_description, status, created_at')
      .order('created_at', { ascending: false })
      .limit(30);

    const enrichedBriefs = (briefs || []).map((b) => ({
      ...b,
      project: projectMap[b.project_id] || { domain: 'Unknown Target', name: 'General Brand' },
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

    // Action 1: Mark Reviewed
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

    // Action 2: Create Technical Fix Brief
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
            action: 'Update Schema & llms.txt directives',
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

    // Action 3: Ingest Simulated False AI Claim
    if (action === 'simulate') {
      const {
        quote = 'Product claims false pricing and lacks key integrations',
        claimed_value = '$149/mo',
        expected_value = '$49/mo verified in pricing table',
        engine = 'chatgpt',
        project_id,
        confidence = 0.94,
      } = body;

      let targetProjectId = project_id;
      if (!targetProjectId) {
        const { data: firstProj } = await admin.from('projects').select('id').limit(1).maybeSingle();
        targetProjectId = firstProj?.id || '00000000-0000-0000-0000-000000000000';
      }

      const { data: inserted, error: insErr } = await admin
        .from('misinformation_alerts')
        .insert({
          project_id: targetProjectId,
          engine,
          quote,
          claimed_value,
          expected_value,
          fact_type: 'pricing_features',
          confidence: Number(confidence),
          reviewed: false,
        })
        .select()
        .single();

      if (insErr) throw insErr;

      return NextResponse.json({
        success: true,
        message: 'Simulated misinformation alert ingested into Truth Radar',
        alert: inserted,
      });
    }

    // Action 4: Resolve Fix Brief
    if (action === 'resolve_brief') {
      const { briefId } = body;
      if (!briefId) return NextResponse.json({ error: 'briefId is required' }, { status: 400 });

      const { data: updated, error: updErr } = await admin
        .from('fix_briefs')
        .update({ status: 'resolved' })
        .eq('id', briefId)
        .select()
        .single();

      if (updErr) throw updErr;

      return NextResponse.json({
        success: true,
        message: 'Fix brief marked as resolved',
        brief: updated,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
