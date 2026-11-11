export interface AIEngineReferral {
  engine: string;
  domain: string;
  displayName: string;
  iconType: 'chatgpt' | 'perplexity' | 'claude' | 'gemini' | 'copilot';
  visits: number;
  signups: number;
  conversionRate: number;
  avgDuration: string;
  bounceRate: string;
  marketShare: number;
}

export interface AILandingPageStat {
  path: string;
  title: string;
  visits: number;
  signups: number;
  topSource: string;
  conversionRate: number;
}

export interface AITrafficDailyPoint {
  date: string;
  displayDate: string;
  totalVisits: number;
  chatgpt: number;
  perplexity: number;
  claude: number;
  gemini: number;
  signups: number;
}

export interface AITrafficSummary {
  totalAIVisits: number;
  totalSignups: number;
  conversionRate: number;
  estimatedPipelineValue: number;
  topReferringEngine: string;
  growthRateMom: string;
  engineBreakdowns: AIEngineReferral[];
  topLandingPages: AILandingPageStat[];
  dailyTrend: AITrafficDailyPoint[];
  ga4Connected: boolean;
  ga4MeasurementId?: string;
}

/**
 * Matches a referrer URL or User-Agent against known frontier AI search engines
 */
export function identifyAIReferrer(referrer: string): { isAI: boolean; engine?: string } {
  if (!referrer) return { isAI: false };
  const r = referrer.toLowerCase();

  if (r.includes('chatgpt.com') || r.includes('chat.openai.com') || r.includes('openai.chatgpt')) {
    return { isAI: true, engine: 'ChatGPT' };
  }
  if (r.includes('perplexity.ai') || r.includes('pplx.ai')) {
    return { isAI: true, engine: 'Perplexity Pro' };
  }
  if (r.includes('claude.ai') || r.includes('anthropic.com')) {
    return { isAI: true, engine: 'Claude 3.5' };
  }
  if (r.includes('gemini.google.com') || r.includes('google.com/search?q=') && r.includes('overview')) {
    return { isAI: true, engine: 'Google Gemini' };
  }
  if (r.includes('copilot.microsoft.com') || r.includes('bing.com/chat')) {
    return { isAI: true, engine: 'Microsoft Copilot' };
  }
  return { isAI: false };
}

/**
 * Generates realistic deterministic AI traffic telemetry data for a project domain
 */
export function getAITrafficTelemetry(domain: string, periodDays: number = 30): AITrafficSummary {
  const d = (domain || 'example.com').toLowerCase();
  
  // Base scale modifier depending on domain prominence
  let multiplier = 1;
  if (d.includes('stripe')) multiplier = 1.35;
  if (d.includes('notion')) multiplier = 1.25;
  if (d.includes('linear')) multiplier = 0.95;

  const baseTotal = Math.round(1840 * (periodDays / 30) * multiplier);
  const baseSignups = Math.round(baseTotal * 0.078);
  const convRate = parseFloat(((baseSignups / baseTotal) * 100).toFixed(1));
  const estimatedArr = Math.round(baseSignups * 120); // Average $120 ARR per assisted conversion

  const engines: AIEngineReferral[] = [
    {
      engine: 'Perplexity Pro',
      domain: 'perplexity.ai',
      displayName: 'Perplexity Pro',
      iconType: 'perplexity',
      visits: Math.round(baseTotal * 0.52),
      signups: Math.round(baseSignups * 0.54),
      conversionRate: 8.1,
      avgDuration: '3m 42s',
      bounceRate: '28.4%',
      marketShare: 52,
    },
    {
      engine: 'ChatGPT (SearchGPT)',
      domain: 'chatgpt.com',
      displayName: 'ChatGPT-4o Search',
      iconType: 'chatgpt',
      visits: Math.round(baseTotal * 0.31),
      signups: Math.round(baseSignups * 0.28),
      conversionRate: 7.2,
      avgDuration: '2m 58s',
      bounceRate: '34.2%',
      marketShare: 31,
    },
    {
      engine: 'Claude 3.5 Sonnet',
      domain: 'claude.ai',
      displayName: 'Claude 3.5 Sonnet',
      iconType: 'claude',
      visits: Math.round(baseTotal * 0.11),
      signups: Math.round(baseSignups * 0.12),
      conversionRate: 8.5,
      avgDuration: '4m 10s',
      bounceRate: '24.1%',
      marketShare: 11,
    },
    {
      engine: 'Google Gemini',
      domain: 'gemini.google.com',
      displayName: 'Gemini 2.0 AI Overview',
      iconType: 'gemini',
      visits: Math.round(baseTotal * 0.06),
      signups: Math.round(baseSignups * 0.06),
      conversionRate: 7.0,
      avgDuration: '2m 15s',
      bounceRate: '38.5%',
      marketShare: 6,
    },
  ];

  const landingPages: AILandingPageStat[] = [
    {
      path: '/pricing',
      title: 'Pricing & Enterprise Plans',
      visits: Math.round(baseTotal * 0.42),
      signups: Math.round(baseSignups * 0.58),
      topSource: 'Perplexity Pro',
      conversionRate: 10.8,
    },
    {
      path: '/product',
      title: 'Product Overview & Features',
      visits: Math.round(baseTotal * 0.28),
      signups: Math.round(baseSignups * 0.22),
      topSource: 'ChatGPT-4o',
      conversionRate: 6.2,
    },
    {
      path: '/docs',
      title: 'Developer Documentation & API',
      visits: Math.round(baseTotal * 0.18),
      signups: Math.round(baseSignups * 0.14),
      topSource: 'Claude 3.5',
      conversionRate: 5.9,
    },
    {
      path: '/compare',
      title: 'Alternative & Competitor Comparison',
      visits: Math.round(baseTotal * 0.12),
      signups: Math.round(baseSignups * 0.06),
      topSource: 'Perplexity Pro',
      conversionRate: 4.1,
    },
  ];

  // Daily trend generation
  const dailyTrend: AITrafficDailyPoint[] = [];
  const daysCount = Math.min(periodDays, 14); // 14 points for clean rendering
  const now = new Date('2026-11-11T12:00:00Z');

  for (let i = daysCount - 1; i >= 0; i--) {
    const dDate = new Date(now.getTime() - i * 86400000 * (periodDays / daysCount));
    const displayDate = dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayVisits = Math.round((baseTotal / daysCount) * (0.8 + Math.sin(i * 0.8) * 0.35));
    const daySignups = Math.round(dayVisits * 0.078);

    dailyTrend.push({
      date: dDate.toISOString().split('T')[0],
      displayDate,
      totalVisits: dayVisits,
      perplexity: Math.round(dayVisits * 0.52),
      chatgpt: Math.round(dayVisits * 0.31),
      claude: Math.round(dayVisits * 0.11),
      gemini: Math.round(dayVisits * 0.06),
      signups: daySignups,
    });
  }

  return {
    totalAIVisits: baseTotal,
    totalSignups: baseSignups,
    conversionRate: convRate,
    estimatedPipelineValue: estimatedArr,
    topReferringEngine: 'Perplexity Pro (52% share)',
    growthRateMom: '+24.8%',
    engineBreakdowns: engines,
    topLandingPages: landingPages,
    dailyTrend,
    ga4Connected: false,
    ga4MeasurementId: undefined,
  };
}
