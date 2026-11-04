import { NextRequest, NextResponse } from 'next/server';
import { GeminiAdapter } from '@/lib/engines/gemini';
import { detectMentions } from '@/lib/parser';
import { calculateVisibilityScore } from '@/lib/scoring';
import { generatePrompts } from '@/lib/prompts';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const adminClient = createAdminClient();
    
    // Rate limiting via Postgres (no external paid service)
    const today = new Date().toISOString().split('T')[0];
    const { data: existing } = await adminClient
      .from('rate_limits')
      .select('request_count')
      .eq('ip_address', ip)
      .eq('endpoint', 'free-check')
      .gte('window_start', `${today}T00:00:00Z`)
      .single();
    
    if (existing && existing.request_count >= 3) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again tomorrow.' },
        { status: 429 }
      );
    }
    
    // Upsert rate limit
    if (existing) {
      await adminClient
        .from('rate_limits')
        .update({ request_count: existing.request_count + 1 })
        .eq('ip_address', ip)
        .eq('endpoint', 'free-check')
        .gte('window_start', `${today}T00:00:00Z`);
    } else {
      await adminClient.from('rate_limits').insert({
        ip_address: ip,
        endpoint: 'free-check',
        request_count: 1,
        window_start: new Date().toISOString(),
      });
    }
    
    const body = await request.json();
    const { domain } = body;
    
    if (!domain) {
      return NextResponse.json({ error: 'domain is required' }, { status: 400 });
    }
    
    const adapter = new GeminiAdapter();
    const keyword = `best ${domain} alternatives`;
    const prompts = generatePrompts(keyword).slice(0, 5);
    
    let totalMentions = 0;
    let totalQueries = 0;
    const results = [];
    
    for (const prompt of prompts) {
      try {
        const response = await adapter.run({
          prompt,
          keyword,
          intent: 'commercial',
        });
        
        const mentions = detectMentions(
          response.answerText,
          response.citations,
          domain,
          [],
          domain
        );
        
        results.push({
          prompt,
          answer: response.answerText.slice(0, 500),
          citations: response.citations,
          mentions: mentions.length,
        });
        
        totalMentions += mentions.length;
        totalQueries++;
      } catch (error) {
        console.error('Free check query failed:', error);
      }
    }
    
    const visibilityScore = calculateVisibilityScore({
      totalQueries,
      mentionedQueries: results.filter(r => r.mentions > 0).length,
      mentions: [],
      yourMentions: totalMentions,
      competitorMentions: 0,
      keywordsWithMentions: results.filter(r => r.mentions > 0).length > 0 ? 1 : 0,
      activeKeywords: 1,
    });
    
    return NextResponse.json({
      domain,
      visibilityScore,
      totalQueries,
      totalMentions,
      results,
    });
  } catch (error) {
    console.error('Free check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Free check failed' },
      { status: 500 }
    );
  }
}