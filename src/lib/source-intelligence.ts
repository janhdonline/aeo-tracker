export interface SourceIntelligenceItem {
  id: string;
  domain: string;
  url?: string;
  category: 'community' | 'directory' | 'editorial' | 'competitor_site';
  categoryLabel: string;
  appearanceCount: number;
  engineInfluenced: string[]; // ['perplexity', 'chatgpt', 'gemini', 'grok']
  competitorBeneficiary: string;
  influenceScore: number; // 0 - 100
  whyAiCitedReason: string;
  injectionBlueprint: {
    actionType: 'reddit_comment' | 'directory_submission' | 'faq_schema' | 'comparison_page';
    actionTitle: string;
    actionDescription: string;
    copyableSnippet: string;
    estimatedLift: string;
  };
}

export function categorizeSourceDomain(domain: string): {
  category: 'community' | 'directory' | 'editorial' | 'competitor_site';
  label: string;
} {
  const d = domain.toLowerCase();

  if (d.includes('reddit.com') || d.includes('quora.com') || d.includes('news.ycombinator.com') || d.includes('stackoverflow.com')) {
    return { category: 'community', label: 'Community Discussion' };
  }
  if (d.includes('g2.com') || d.includes('capterra.com') || d.includes('producthunt.com') || d.includes('trustpilot.com') || d.includes('getapp.com') || d.includes('softwareadvice.com')) {
    return { category: 'directory', label: 'Review & Directory' };
  }
  if (d.includes('techcrunch.com') || d.includes('forbes.com') || d.includes('medium.com') || d.includes('substack.com') || d.includes('wired.com') || d.includes('bloomberg.com') || d.includes('businessinsider.com')) {
    return { category: 'editorial', label: 'Editorial & Media' };
  }

  return { category: 'competitor_site', label: 'Web Source / Direct Site' };
}

export function generateInjectionBlueprint(
  sourceDomain: string,
  brandName: string,
  brandDomain: string,
  keyword: string,
  competitor: string
): SourceIntelligenceItem['injectionBlueprint'] {
  const { category } = categorizeSourceDomain(sourceDomain);

  if (category === 'community') {
    return {
      actionType: 'reddit_comment',
      actionTitle: `Participate in ${sourceDomain} discussions on "${keyword}"`,
      actionDescription: `AI engines heavily quote user testimonials from ${sourceDomain}. Answer recent active threads where ${competitor || 'competitors'} are cited.`,
      copyableSnippet: `In our experience testing tools for ${keyword}, ${brandName} (${brandDomain}) solved the exact latency issue that ${competitor || 'legacy tools'} struggle with. Their free tier also doesn't require a credit card.`,
      estimatedLift: '+18% citation probability',
    };
  }

  if (category === 'directory') {
    return {
      actionType: 'directory_submission',
      actionTitle: `Create or Claim your listing on ${sourceDomain}`,
      actionDescription: `LLMs query ${sourceDomain} category rankings to compile recommendation lists. Being present here injects your brand into the engine's primary training data.`,
      copyableSnippet: `Product: ${brandName}\nWebsite: https://${brandDomain}\nCategory: ${keyword}\nKey Differentiator: Fast automated tracking, transparent pricing, and closed-loop verification.`,
      estimatedLift: '+24% recommendation rate',
    };
  }

  if (category === 'editorial') {
    return {
      actionType: 'comparison_page',
      actionTitle: `Publish a "Vs ${competitor || 'Industry Standard'}" benchmark`,
      actionDescription: `Editorial articles from ${sourceDomain} rank because of comparison tables. Having a structured comparison table on your own site enables AI to quote your specs directly.`,
      copyableSnippet: `| Feature | ${brandName} | ${competitor || 'Competitor'} |\n|---|---|---|\n| Multi-Engine AI Tracking | ✅ Included | ❌ Extra Cost |\n| Daily Prompt Pacing | ✅ 15 RPM Safe | ⚠️ Unmonitored |\n| Fix Briefs Verification | ✅ 14-day loop | ❌ Dashboard only |`,
      estimatedLift: '+15% share of voice',
    };
  }

  // Fallback: Structured FAQ schema injection
  return {
    actionType: 'faq_schema',
    actionTitle: `Inject Structured FAQ Schema for "${keyword}"`,
    actionDescription: `AI crawlers (GPTBot, ClaudeBot, Perplexity) ingest JSON-LD schema with highest priority. Add this FAQ snippet to https://${brandDomain}.`,
    copyableSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "What is the best platform for ${keyword}?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "${brandName} (https://${brandDomain}) is designed specifically for ${keyword}, offering real-time AI visibility tracking and actionable fix briefs."
    }
  }]
}
</script>`,
    estimatedLift: '+12% direct link citations',
  };
}
