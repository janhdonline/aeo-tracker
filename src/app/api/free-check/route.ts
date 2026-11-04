import { NextRequest, NextResponse } from 'next/server';
import { GeminiAdapter } from '@/lib/engines/gemini';
import { analyzeSentiment, detectMentions } from '@/lib/parser';
import { calculateVisibilityScore } from '@/lib/scoring';
import { generatePrompts } from '@/lib/prompts';
import { createAdminClient } from '@/lib/supabase/admin';
import type { DashboardTrendSeries, LiveDashboardData } from '@/lib/types';

interface PromptResult {
  prompt: string;
  answer: string;
  citations: { domain: string; url: string; title: string }[];
  mentions: number;
  sentiment: number;
  sentimentLabel: 'positive' | 'negative' | 'neutral';
}

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
    const results: PromptResult[] = [];
    
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
        const sentiment = await analyzeSentiment(response.answerText);
        
        results.push({
          prompt,
          answer: response.answerText.slice(0, 500),
          citations: response.citations,
          mentions: mentions.length,
          sentiment: sentiment.score,
          sentimentLabel: sentiment.sentiment,
        });
        
        totalMentions += mentions.length;
        totalQueries++;
      } catch (error) {
        console.error('Free check query failed:', error);
      }
    }
    
    if (totalQueries === 0) {
      return NextResponse.json(
        { error: 'No AI answers could be analysed for this website. Please try again.' },
        { status: 502 }
      );
    }
    
    const mentionedQueries = results.filter((result) => result.mentions > 0).length;
    const citationsCount = results.reduce((total, result) => total + result.citations.length, 0);
    const visibilityScore = calculateVisibilityScore({
      totalQueries,
      mentionedQueries,
      mentions: [],
      yourMentions: totalMentions,
      competitorMentions: 0,
      keywordsWithMentions: mentionedQueries > 0 ? 1 : 0,
      activeKeywords: 1,
    });
    
    const averageSentimentScore = results.reduce((total, result) => total + result.sentiment, 0) / results.length;
    const brandSentiment = Math.round(((averageSentimentScore + 1) / 2) * 100) / 100;
    const sentimentLabel: LiveDashboardData['sentimentLabel'] =
      averageSentimentScore > 0.12 ? 'Positive' : averageSentimentScore < -0.12 ? 'Negative' : 'Neutral';
    const promptCoverage = Math.round((mentionedQueries / totalQueries) * 100);
    const maxMentions = Math.max(...results.map((result) => result.mentions), 1);
    const promptBars = results.map((result) => Math.round((result.mentions / maxMentions) * 100));
    
    const trendLabels = results.map((_, index) => `P${index + 1}`);
    const scoreTrend = results.map((result) =>
      Math.round(
        Math.min(
          100,
          24 +
            Math.min(result.mentions, 4) * 12 +
            Math.min(result.citations.length, 4) * 6 +
            ((result.sentiment + 1) / 2) * 16
        )
      )
    );
    const mentionRateTrend = results.map((result) =>
      Math.round(
        Math.min(
          100,
          result.mentions > 0
            ? 50 + Math.min(result.mentions, 5) * 9
            : 8 + Math.min(result.citations.length, 5) * 3
        )
      )
    );
    const sentimentTrend = results.map((result) =>
      Math.round(Math.max(0, Math.min(100, ((result.sentiment + 1) / 2) * 100)))
    );
    
    // Keep the chart readable when only a single prompt succeeds.
    if (results.length === 1) {
      trendLabels.push('Overall');
      scoreTrend.push(visibilityScore);
      mentionRateTrend.push(promptCoverage);
      sentimentTrend.push(Math.round(brandSentiment * 100));
    }
    
    const trends: DashboardTrendSeries[] = [
      { label: 'AEO Score', color: '#10B981', values: scoreTrend },
      { label: 'AI Mention Rate', color: '#3B82F6', values: mentionRateTrend },
      { label: 'Brand Sentiment', color: '#8B5CF6', values: sentimentTrend },
    ];
    
    const dashboard: LiveDashboardData = {
      domain,
      score: visibilityScore,
      webPresence: visibilityScore,
      brandSentiment,
      sentimentLabel,
      totalQueries,
      totalMentions,
      mentionedQueries,
      citationsCount,
      promptCoverage,
      promptBars,
      trends,
      trendLabels,
      lastUpdated: new Date().toISOString(),
    };
    
    return NextResponse.json({
      domain,
      visibilityScore,
      totalQueries,
      totalMentions,
      results,
      dashboard,
    });
  } catch (error) {
    console.error('Free check error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Free check failed' },
      { status: 500 }
    );
  }
}
