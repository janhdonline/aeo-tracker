export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: project, error } = await supabase
      .from('projects')
      .select('id, domain, brand_name, brand_aliases, competitor_domains, industry, active, created_at')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error('Settings GET error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { brand_name, brand_aliases, competitor_domains, industry } = body;

    const updates: Record<string, any> = {};

    if (typeof brand_name === 'string' && brand_name.trim().length > 0) {
      updates.brand_name = brand_name.trim();
    }

    if (Array.isArray(brand_aliases)) {
      updates.brand_aliases = brand_aliases
        .map((a: any) => String(a).trim())
        .filter((a: string) => a.length > 0);
    }

    if (Array.isArray(competitor_domains)) {
      updates.competitor_domains = competitor_domains
        .map((c: any) =>
          String(c)
            .trim()
            .toLowerCase()
            .replace(/^https?:\/\//, '')
            .replace(/\/.*$/, '')
        )
        .filter((c: string) => c.length > 0);
    }

    if (typeof industry === 'string') {
      updates.industry = industry.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields provided to update' }, { status: 400 });
    }

    const adminClient = createAdminClient();
    const { data: updatedProject, error: updateError } = await adminClient
      .from('projects')
      .update(updates)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'Project settings updated successfully',
      project: updatedProject,
    });
  } catch (error: any) {
    console.error('Settings PATCH error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const { data: project } = await supabase
      .from('projects')
      .select('id, domain')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    const adminClient = createAdminClient();
    const { error: deleteError } = await adminClient
      .from('projects')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: `Project ${project.domain} permanently deleted`,
    });
  } catch (error: any) {
    console.error('Settings DELETE error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete project' },
      { status: 500 }
    );
  }
}
