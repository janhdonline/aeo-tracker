import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/admin-guard';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { errorResponse } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const admin = createAdminClient();
    const { data, error, count } = await admin
      .from('public_reports_cache')
      .select('domain, brand_name, visibility_score, share_of_voice_pct, updated_at', { count: 'exact' })
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      totalCached: count || 0,
      items: data || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const purgeAll = searchParams.get('purgeAll') === 'true';

    const admin = createAdminClient();

    if (purgeAll) {
      const { error } = await admin.from('public_reports_cache').delete().neq('domain', '');
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'purge_all_public_reports_cache',
        target_type: 'public_reports_cache',
      });

      return NextResponse.json({ success: true, message: 'All public report caches purged' });
    }

    if (domain) {
      const cleanDomain = domain.toLowerCase().trim();
      const { error } = await admin
        .from('public_reports_cache')
        .delete()
        .eq('domain', cleanDomain);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      await admin.from('audit_logs').insert({
        admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
        action: 'purge_domain_cache',
        target_type: 'public_reports_cache',
        target_id: cleanDomain,
      });

      return NextResponse.json({ success: true, message: `Cache purged for ${cleanDomain}` });
    }

    return NextResponse.json({ error: 'domain or purgeAll=true is required' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { errorResponse, adminUser } = await requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { domains } = body;

    const defaultTopDomains = [
      'stripe.com',
      'notion.so',
      'whoop.com',
      'figma.com',
      'linear.app',
      'github.com',
      'canva.com',
      'airtable.com',
      'hubspot.com',
      'slack.com',
    ];

    const targetDomains = Array.isArray(domains) && domains.length > 0 ? domains : defaultTopDomains;

    const admin = createAdminClient();
    const prewarmed: string[] = [];

    for (const rawDomain of targetDomains.slice(0, 20)) {
      const cleanDomain = String(rawDomain)
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0];

      if (!cleanDomain) continue;

      const baseName = cleanDomain.split('.')[0] || cleanDomain;
      const brandName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
      const score = 75 + (cleanDomain.length % 15);

      const payload = {
        domain: cleanDomain,
        brand_name: brandName,
        visibility_score: score,
        share_of_voice_pct: 0.15,
        summary_metrics: {
          domain: cleanDomain,
          brandName,
          score,
          prewarmed: true,
          generatedAt: new Date().toISOString(),
          sources: ['Gemini', 'Perplexity', 'ChatGPT', 'Grok'],
        },
        model_analyses: [
          { engine: 'gemini', score, mentions: 4, sentiment: 'positive' },
          { engine: 'openai', score: score - 2, mentions: 3, sentiment: 'positive' },
          { engine: 'perplexity', score: score + 3, mentions: 5, sentiment: 'positive' },
        ],
        updated_at: new Date().toISOString(),
      };

      await admin
        .from('public_reports_cache')
        .upsert(payload, { onConflict: 'domain' });

      prewarmed.push(cleanDomain);
    }

    await admin.from('audit_logs').insert({
      admin_user_id: adminUser?.id === 'master-admin' ? null : adminUser?.id,
      action: 'prewarm_public_cache',
      target_type: 'public_reports_cache',
      new_value: { count: prewarmed.length, domains: prewarmed },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully pre-warmed ${prewarmed.length} domain(s)`,
      prewarmed,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
