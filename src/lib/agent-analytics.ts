// Agent Traffic Analytics (spec section 15.5)
//
// Lightweight version of Profound's enterprise feature.
// Bot traffic overtook human traffic in June 2026 (Cloudflare).
// But naive UA-based logging is exploitable (spoofed crawlers).
// Differentiate real bots from spoofed ones.

export interface BotPattern {
  name: string;
  pattern: RegExp;
  officialDomains: string[];
}

export const KNOWN_BOTS: BotPattern[] = [
  {
    name: 'gptbot',
    pattern: /GPTBot/i,
    officialDomains: ['openai.com'],
  },
  {
    name: 'claude',
    pattern: /ClaudeBot/i,
    officialDomains: ['anthropic.com', 'claude.ai'],
  },
  {
    name: 'perplexity',
    pattern: /PerplexityBot/i,
    officialDomains: ['perplexity.ai'],
  },
  {
    name: 'google',
    pattern: /Google-Extended/i,
    officialDomains: ['google.com'],
  },
  {
    name: 'ccbot',
    pattern: /CCBot/i,
    officialDomains: ['commoncrawl.org'],
  },
  {
    name: 'bing',
    pattern: /bingbot/i,
    officialDomains: ['bing.com'],
  },
];

/**
 * Identify which bot a User-Agent belongs to.
 * Returns null if not a recognized AI crawler.
 */
export function identifyBot(userAgent: string): string | null {
  for (const bot of KNOWN_BOTS) {
    if (bot.pattern.test(userAgent)) {
      return bot.name;
    }
  }
  return null;
}

/**
 * Verify if a bot UA is likely genuine.
 * Checks against known official domains and patterns.
 * This is a heuristic — sophisticated spoofing can still occur.
 */
export function verifyBot(userAgent: string, referer?: string): {
  bot: string | null;
  isVerified: boolean;
  confidence: number;
} {
  const bot = identifyBot(userAgent);
  if (!bot) return { bot: null, isVerified: false, confidence: 0 };

  // Check referer for additional verification
  let confidence = 0.7; // base confidence for known pattern match
  
  const botConfig = KNOWN_BOTS.find(b => b.name === bot);
  if (botConfig && referer) {
    for (const domain of botConfig.officialDomains) {
      if (referer.includes(domain)) {
        confidence = 0.95;
        break;
      }
    }
  }

  // Additional heuristics could be added:
  // - Check IP ranges (Cloudflare publishes bot IP lists)
  // - Check for consistent behavior patterns
  // - Rate limiting analysis

  return {
    bot,
    isVerified: confidence >= 0.9,
    confidence,
  };
}

/**
 * Calculate correlation between bot visits and citations.
 * Returns correlation coefficient (-1 to 1) and trend data.
 */
export interface CorrelationData {
  date: string;
  path: string;
  engine: string;
  botVisits: number;
  citations: number;
}

export function computeCorrelation(data: CorrelationData[]): {
  correlation: number;
  trend: 'positive' | 'negative' | 'neutral';
  insight: string;
} {
  if (data.length < 3) {
    return { correlation: 0, trend: 'neutral', insight: 'Need more data (minimum 3 days)' };
  }

  const visits = data.map(d => d.botVisits);
  const citations = data.map(d => d.citations);

  const meanVisits = visits.reduce((a, b) => a + b, 0) / visits.length;
  const meanCitations = citations.reduce((a, b) => a + b, 0) / citations.length;

  let numerator = 0;
  let denomVisits = 0;
  let denomCitations = 0;

  for (let i = 0; i < data.length; i++) {
    const vDiff = visits[i] - meanVisits;
    const cDiff = citations[i] - meanCitations;
    numerator += vDiff * cDiff;
    denomVisits += vDiff * vDiff;
    denomCitations += cDiff * cDiff;
  }

  const denominator = Math.sqrt(denomVisits * denomCitations);
  const correlation = denominator === 0 ? 0 : numerator / denominator;

  const trend = correlation > 0.3 ? 'positive' : correlation < -0.3 ? 'negative' : 'neutral';

  let insight = 'No clear pattern';
  if (trend === 'positive') {
    insight = 'Bot visits correlate with citations — crawlers may be indexing your content effectively';
  } else if (trend === 'negative') {
    insight = 'High bot visits but low citations — possible content gap or indexing issue';
  }

  return { correlation, trend, insight };
}

/**
 * Format analytics for dashboard display.
 */
export function formatAgentAnalytics(data: CorrelationData[]): Array<{
  date: string;
  path: string;
  engine: string;
  botVisits: number;
  citations: number;
  gap: number; // visits - citations
}> {
  return data.map(d => ({
    ...d,
    gap: d.botVisits - d.citations,
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
