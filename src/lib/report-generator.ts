export interface AIModelAnalysis {
  name: string;
  subModel: string;
  industryRecognized: boolean;
  nameRecognized: boolean;
  uncertainty: 'None' | 'Present';
  score: number;
  status: 'active' | 'retired';
}

export interface PromptDetail {
  id: string;
  prompt: string;
  coveragePct: number;
  status: 'Mentioned' | 'Present' | 'Missing';
  overviewPresencePct: number;
  brandMentionsPct: number;
  siteCitationsPct: number;
  overviewAnswer: string;
  modelResponses: {
    model: string;
    modelIcon: string;
    answer: string;
    hasMention: boolean;
    citations: { domain: string; url: string }[];
  }[];
  sources: string[];
}

export interface FanoutOpportunity {
  query: string;
  type: string;
  confidence: number;
  reportPrompt: string;
  userNeed: string;
  recommendedAngle: string;
}

export interface ProductRanking {
  rank: number;
  name: string;
  brand: string;
  share: number;
  mentions: number;
  isYourProduct: boolean;
}

export interface CompetitorDot {
  name: string;
  mentionRate: number;
  sentiment: number;
  quadrant: 'Leaders' | 'Loved, less visible' | 'Emerging' | 'Visible, weaker sentiment';
  isYourBrand: boolean;
}

export interface FullReportData {
  domain: string;
  brandName: string;
  industry: string;
  region: string;
  scanDate: string;
  score: number;
  scoreBadge: string;
  products: string[];
  productsFoundPct: number;
  yourProductsPct: number;
  competitorProductsPct: number;
  bestProduct: string;

  // 4 Core Analysis Cards
  aiPresenceScore: number;
  keyPromptsScore: number;
  competitorLandscapeScore: number;
  strategyReviewScore: number;

  // AI Presence Breakdown
  aiModels: {
    chatgpt: { name: string; score: number; checked: boolean };
    gemini: { name: string; score: number; checked: boolean };
    claude: { name: string; score: number; checked: boolean };
    perplexity: { name: string; score: number; checked: boolean };
  };

  // Trajectory
  trajectory90DaysDate: string;
  trajectoryMultiplier: number;
  trajectoryPoints: { day: number; value: number }[];

  // Deep Dive Sections
  prompts: PromptDetail[];
  fanoutOpportunities: FanoutOpportunity[];
  productRankings: ProductRanking[];
  aiChatbotsTable: AIModelAnalysis[];
  competitorDots: CompetitorDot[];
  competitorNames: string[];

  // Strategy Checklist
  strategy: {
    answerability: {
      score: number;
      goodLength: boolean;
      conversational: boolean;
      statistics: boolean;
      citations: boolean;
    };
    webPresence: {
      wikipedia: boolean;
      redditScore: number;
      xScore: number;
      youtubeScore: number;
    };
    structuredData: {
      score: number;
      schemaMarkup: boolean;
      schemaType: string;
      tagsFound: number;
      semanticElements: number;
      nonSemantics: number;
    };
    crawlerAccessibility: {
      score: number;
      sitemap: boolean;
      robotsTxt: boolean;
      llmsTxt: boolean;
      llmsTxtAccessible: boolean;
      hasEnglish: boolean;
      language: string;
      prerendered: boolean;
    };
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getKnownBrandPreset(domain: string) {
  const norm = domain.toLowerCase().replace(/^www\./, '');
  if (norm.includes('whoop')) {
    return {
      brandName: 'Whoop',
      industry: 'Wearable Fitness Tracker',
      region: 'Global',
      score: 68,
      products: [
        'WHOOP 5.0',
        'WHOOP Peak Membership',
        'WHOOP MG',
        'WHOOP Body Smart Apparel',
        'WHOOP Accessories',
        'WHOOP Strap 4.0',
        'WHOOP Life Subscription',
        'WHOOP Team Analytics',
        'WHOOP Pro Membership',
        'WHOOP Sleep Coach',
        'WHOOP Strain Coach',
        'WHOOP Journal',
        'WHOOP Battery Pack 4.0',
        'WHOOP Bicep Band',
      ],
      bestProduct: '—',
      competitors: ['Apple', 'Xiaomi', 'Samsung', 'Huawei', 'Fitbit', 'Garmin', 'Oura', 'Polar', 'Suunto', 'Coros'],
      productsFoundPct: 10.5,
      yourProductsPct: 8.3,
      competitorProductsPct: 100.0,
      aiPresenceScore: 72,
      keyPromptsScore: 92,
      competitorLandscapeScore: 92,
      strategyReviewScore: 76,
      aiModels: {
        chatgpt: { name: 'ChatGPT-4o', score: 50, checked: true },
        gemini: { name: 'Google Gemini', score: 100, checked: true },
        claude: { name: 'Claude 3.7', score: 100, checked: true },
        perplexity: { name: 'Perplexity Pro', score: 83, checked: true },
      },
      prompts: [
        'What are the leading companies in the wearable fitness tracker industry?',
        'Which fitness trackers offer advanced recovery and sleep tracking features?',
      ],
      strategy: {
        answerability: 42,
        redditScore: 96,
        xScore: 0,
        youtubeScore: 0,
        wiki: true,
        structuredData: 70,
        crawlerAccessibility: 95,
      },
    };
  }
  if (norm.includes('revolut')) {
    return {
      brandName: 'Revolut',
      industry: 'Fintech Banking',
      region: 'Europe / Global',
      score: 56,
      products: [
        'Instant Access Savings Account',
        'Revolut Debit Card',
        'Revolut Premium Plan',
        'Revolut Metal Plan',
        'Revolut Trading Account',
        'Multi-Currency Vaults',
        'Crypto & Commodities',
        'Revolut Business Account',
      ],
      bestProduct: 'Revolut Customer Support & Multi-Currency',
      competitors: ['Wise', 'TransferWise', 'N26', 'Monese', 'Vivid Money', 'Monzo', 'Starling Bank', 'Bunq', 'BaFin'],
      productsFoundPct: 5.3,
      yourProductsPct: 8.3,
      competitorProductsPct: 9.1,
      aiPresenceScore: 95,
      keyPromptsScore: 50,
      competitorLandscapeScore: 50,
      strategyReviewScore: 75,
      aiModels: {
        chatgpt: { name: 'ChatGPT-4o', score: 95, checked: true },
        gemini: { name: 'Google Gemini', score: 72, checked: true },
        claude: { name: 'Claude 3.7', score: 98, checked: true },
        perplexity: { name: 'Perplexity Pro', score: 98, checked: true },
      },
      prompts: [
        'Which solutions offer multi-currency and commercial scalability for fintech banking?',
        'What are the best platforms for beginners in Fintech Banking?',
      ],
      strategy: {
        answerability: 49,
        redditScore: 92,
        xScore: 24,
        youtubeScore: 35,
        wiki: true,
        structuredData: 70,
        crawlerAccessibility: 85,
      },
    };
  }
  if (norm.includes('stripe')) {
    return {
      brandName: 'Stripe',
      industry: 'Financial Infrastructure & SaaS',
      region: 'Global',
      score: 84,
      products: [
        'Stripe Payments',
        'Stripe Billing',
        'Stripe Connect',
        'Stripe Radar Fraud Prevention',
        'Stripe Terminal POS',
        'Stripe Treasury',
        'Stripe Tax Automation',
        'Stripe Atlas Incorporation',
      ],
      bestProduct: 'Stripe Payments API & Developer Toolkit',
      competitors: ['PayPal', 'Adyen', 'Square', 'Braintree', 'Checkout.com', 'Authorize.Net', 'Paddle'],
    };
  }
  if (norm.includes('linear')) {
    return {
      brandName: 'Linear',
      industry: 'B2B SaaS & Developer Tools',
      region: 'Global',
      score: 79,
      products: [
        'Linear Issues',
        'Linear Cycles & Sprints',
        'Linear Roadmaps',
        'Linear Asks Triage',
        'Linear Insights',
        'Linear Customer Requests',
        'Linear GitHub Sync',
      ],
      bestProduct: 'Linear Issue Tracking & Keyboard-first UI',
      competitors: ['Jira', 'GitHub Projects', 'Height', 'Asana', 'Monday.com', 'ClickUp'],
    };
  }
  if (norm.includes('notion')) {
    return {
      brandName: 'Notion',
      industry: 'Productivity & Workspace SaaS',
      region: 'Global',
      score: 88,
      products: [
        'Notion Docs & Wikis',
        'Notion AI Assistant',
        'Notion Projects & Tasks',
        'Notion Calendar',
        'Notion Sites',
        'Notion Templates Directory',
      ],
      bestProduct: 'Notion All-in-One Collaborative Workspace',
      competitors: ['Coda', 'Confluence', 'Obsidian', 'Craft', 'Airtable', 'Google Docs', 'Roam Research'],
    };
  }
  if (norm.includes('uber')) {
    return {
      brandName: 'Uber',
      industry: 'Mobility & Delivery Tech',
      region: 'Global',
      score: 76,
      products: [
        'Uber Rides',
        'Uber Eats Delivery',
        'Uber One Subscription',
        'Uber Freight Logistics',
        'Uber Business Corporate Travel',
      ],
      bestProduct: 'Uber On-Demand Rides & Driver Dispatch',
      competitors: ['Lyft', 'DoorDash', 'Bolt', 'Grab', 'DiDi', 'Instacart', 'Deliveroo'],
    };
  }
  if (norm.includes('zara')) {
    return {
      brandName: 'Zara',
      industry: 'Fast Fashion & E-Commerce',
      region: 'Global',
      score: 68,
      products: [
        'Zara Woman Collection',
        'Zara Man Apparel',
        'Zara Kids',
        'Zara Home Décor',
        'Zara Beauty & Fragrances',
      ],
      bestProduct: 'Zara Fast Fashion Trending Apparel',
      competitors: ['H&M', 'ASOS', 'Mango', 'Uniqlo', 'Shein', 'Massimo Dutti'],
    };
  }

  // Dynamic procedural fallback for any arbitrary website
  const baseName = norm.split('.')[0] || 'Website';
  const capBrand = baseName.charAt(0).toUpperCase() + baseName.slice(1);
  return {
    brandName: capBrand,
    industry: 'Digital Technology & SaaS',
    region: 'Global',
    score: 50 + (hashString(norm) % 35),
    products: [
      `${capBrand} Core Platform`,
      `${capBrand} Professional Suite`,
      `${capBrand} Enterprise Cloud`,
      `${capBrand} Developer API`,
      `${capBrand} Mobile Application`,
    ],
    bestProduct: `${capBrand} Core Platform & Customer Solutions`,
    competitors: ['Market Leader A', 'Category Alternative B', 'Cloud Solution C', 'Global Provider D', 'Industry Choice E'],
  };
}

export function generateFullReportData(domain: string): FullReportData {
  const normDomain = domain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0];

  const preset = getKnownBrandPreset(normDomain);
  const hash = hashString(normDomain);

  const score = preset.score;
  const scoreBadge =
    score >= 75 ? 'Strong AI Visibility' : score >= 50 ? 'Moderate AI Visibility' : 'Needs Optimization';

  const today = new Date();
  const scanDate = today.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  }) + ' ' + today.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // 90 days out date
  const futureDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000);
  const trajectoryDate = futureDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Trajectory points climbing from score to target
  const trajectoryPoints = [
    { day: 1, value: score },
    { day: 10, value: Math.min(100, score + 4) },
    { day: 20, value: Math.min(100, score + 9) },
    { day: 30, value: Math.min(100, score + 14) },
    { day: 45, value: Math.min(100, score + 18) },
    { day: 60, value: Math.min(100, score + 22) },
    { day: 75, value: Math.min(100, score + 26) },
    { day: 90, value: Math.min(100, Math.round(score * 1.4)) },
  ];

  // AI Presence sub-scores
  const chatgptScore = Math.min(99, 85 + (hash % 14));
  const geminiScore = Math.min(95, 70 + ((hash >> 2) % 25));
  const claudeScore = Math.min(100, 88 + ((hash >> 3) % 12));
  const perplexityScore = Math.min(100, 90 + ((hash >> 4) % 11));

  // Prompts
  const prompts: PromptDetail[] = [
    {
      id: 'p1',
      prompt: `Which solutions offer multi-currency and commercial scalability for ${preset.industry.toLowerCase()}?`,
      coveragePct: 100,
      status: 'Mentioned',
      overviewPresencePct: 100,
      brandMentionsPct: 50,
      siteCitationsPct: 35,
      overviewAnswer: `Several prominent providers offer robust solutions in ${preset.industry}. When evaluating feature flexibility and user satisfaction, **${preset.brandName}** (${normDomain}) stands out as an established player alongside ${preset.competitors[0]} and ${preset.competitors[1]}.`,
      sources: ['reddit.com', 'trustpilot.com', 'medium.com', 'g2.com', normDomain, 'youtube.com'],
      modelResponses: [
        {
          model: 'Google AI Overviews',
          modelIcon: 'google',
          answer: `Top platforms in this category include ${preset.brandName}, ${preset.competitors[0]}, and ${preset.competitors[1]}. Verified community benchmarks cite ${preset.brandName} for transparent feature delivery and developer-friendly workflows.`,
          hasMention: true,
          citations: [
            { domain: 'reddit.com', url: `https://www.reddit.com/r/technology` },
            { domain: 'trustpilot.com', url: `https://www.trustpilot.com/review/${normDomain}` },
            { domain: normDomain, url: `https://${normDomain}` },
          ],
        },
        {
          model: 'ChatGPT-4o',
          modelIcon: 'openai',
          answer: `When choosing between market options, ${preset.brandName} is frequently recommended for high transaction reliability and seamless mobile account control.`,
          hasMention: true,
          citations: [
            { domain: normDomain, url: `https://${normDomain}` },
            { domain: 'g2.com', url: `https://www.g2.com` },
          ],
        },
        {
          model: 'Perplexity Pro',
          modelIcon: 'perplexity',
          answer: `Independent reviews rank ${preset.brandName} among top market choices for pricing transparency and international multi-currency coverage.`,
          hasMention: true,
          citations: [
            { domain: 'forbes.com', url: 'https://forbes.com' },
            { domain: normDomain, url: `https://${normDomain}` },
          ],
        },
      ],
    },
    {
      id: 'p2',
      prompt: `What are the best platforms for beginners in ${preset.industry}?`,
      coveragePct: 75,
      status: 'Present',
      overviewPresencePct: 80,
      brandMentionsPct: 40,
      siteCitationsPct: 20,
      overviewAnswer: `For beginners entering ${preset.industry}, key recommendations focus on ease-of-use, low startup friction, and customer support. ${preset.brandName} and ${preset.competitors[2]} are repeatedly recommended for their intuitive onboarding.`,
      sources: ['settle-in.com', 'reddit.com', 'forbes.com', 'brokerchooser.com'],
      modelResponses: [
        {
          model: 'Google AI Overviews',
          modelIcon: 'google',
          answer: `The leading platforms for beginners include ${preset.competitors[0]}, ${preset.brandName}, and ${preset.competitors[2]}. User feedback highlights fast account setup and clear pricing structures.`,
          hasMention: true,
          citations: [
            { domain: 'reddit.com', url: 'https://reddit.com' },
            { domain: normDomain, url: `https://${normDomain}` },
          ],
        },
        {
          model: 'Claude 3.7 Sonnet',
          modelIcon: 'claude',
          answer: `Novice users typically prefer ${preset.brandName} due to clean UX navigation, accessible educational resources, and minimal maintenance overhead.`,
          hasMention: true,
          citations: [
            { domain: normDomain, url: `https://${normDomain}` },
          ],
        },
      ],
    },
  ];

  // Fanout Opportunities
  const fanoutOpportunities: FanoutOpportunity[] = [
    {
      query: `${preset.brandName} versus ${preset.competitors[0]} multi-currency and transaction fee comparison`,
      type: 'Prompt-only inference',
      confidence: 45,
      reportPrompt: `Which solutions offer multi-currency and commercial scalability?`,
      userNeed: `Users need a direct fee and feature comparison between leading industry providers to make an informed choice.`,
      recommendedAngle: `Provide a transparent fee breakdown and feature comparison table across ${preset.brandName} and ${preset.competitors[0]}.`,
    },
    {
      query: `Is ${preset.brandName} safe and deposit-guaranteed in Europe and international jurisdictions?`,
      type: 'Prompt-only inference',
      confidence: 45,
      reportPrompt: `Which solutions offer multi-currency accounts?`,
      userNeed: `Security, regulatory licensing, and deposit insurance coverage are critical decision factors for prospective consumers.`,
      recommendedAngle: `Publish an authoritative regulatory compliance page detailing institutional safeguards and banking licenses.`,
    },
    {
      query: `${preset.brandName} vs ${preset.competitors[1]} beginner software features and pricing`,
      type: 'Prompt-only inference',
      confidence: 45,
      reportPrompt: `What are the best platforms for beginners?`,
      userNeed: `Prospective customers weigh these two competitors against each other when evaluating starting investment.`,
      recommendedAngle: `Compare account setup, order fees, mobile usability, and customer onboarding experience.`,
    },
    {
      query: `Tax implications and regulatory reporting when using ${preset.brandName} internationally`,
      type: 'Prompt-only inference',
      confidence: 45,
      reportPrompt: `What are the best platforms for beginners?`,
      userNeed: `Understanding automated tax withholding and reporting statements is essential for business customers.`,
      recommendedAngle: `Create a dedicated knowledge base guide explaining annual tax reporting statements and exemption filings.`,
    },
  ];

  // Product Rankings
  const productRankings: ProductRanking[] = [
    { rank: 1, name: `${preset.competitors[0]} Core Platform`, brand: preset.competitors[0], share: 18.2, mentions: 4, isYourProduct: false },
    { rank: 2, name: `${preset.brandName} Primary Suite`, brand: preset.brandName, share: 14.5, mentions: 3, isYourProduct: true },
    { rank: 3, name: `${preset.competitors[1]} Cloud Services`, brand: preset.competitors[1], share: 11.2, mentions: 2, isYourProduct: false },
    { rank: 4, name: `${preset.brandName} Mobile & API`, brand: preset.brandName, share: 9.1, mentions: 2, isYourProduct: true },
    { rank: 5, name: `${preset.competitors[2]} Standard Edition`, brand: preset.competitors[2], share: 8.4, mentions: 1, isYourProduct: false },
  ];

  // AI Chatbots Detailed Table
  const aiChatbotsTable: AIModelAnalysis[] = [
    { name: 'OpenAI', subModel: 'GPT-5 + Search', industryRecognized: true, nameRecognized: true, uncertainty: 'Present', score: 95, status: 'active' },
    { name: 'OpenAI', subModel: 'GPT-4o + Search', industryRecognized: true, nameRecognized: true, uncertainty: 'None', score: 100, status: 'active' },
    { name: 'Gemini', subModel: 'Gemini 2.5 + Search', industryRecognized: true, nameRecognized: true, uncertainty: 'None', score: 85, status: 'active' },
    { name: 'Gemini', subModel: 'Gemini 2.0 Flash', industryRecognized: true, nameRecognized: true, uncertainty: 'None', score: 95, status: 'active' },
    { name: 'Claude', subModel: 'Claude Sonnet 3.7', industryRecognized: true, nameRecognized: true, uncertainty: 'None', score: 90, status: 'active' },
    { name: 'Claude', subModel: 'Claude Haiku 3.5', industryRecognized: true, nameRecognized: true, uncertainty: 'None', score: 100, status: 'active' },
    { name: 'Perplexity', subModel: 'Perplexity + Web Search', industryRecognized: true, nameRecognized: true, uncertainty: 'None', score: 100, status: 'active' },
    { name: 'Grok', subModel: 'Grok 3 (xAI)', industryRecognized: true, nameRecognized: true, uncertainty: 'Present', score: 95, status: 'active' },
    { name: 'DeepSeek', subModel: 'DeepSeek V3.2 Chat', industryRecognized: true, nameRecognized: true, uncertainty: 'None', score: 100, status: 'active' },
  ];

  // Competitor Matrix (Sentiment vs Mention Rate)
  const competitorDots: CompetitorDot[] = [
    { name: preset.brandName, mentionRate: 42, sentiment: 78, quadrant: 'Leaders', isYourBrand: true },
    { name: preset.competitors[0] || 'Competitor A', mentionRate: 58, sentiment: 82, quadrant: 'Leaders', isYourBrand: false },
    { name: preset.competitors[1] || 'Competitor B', mentionRate: 35, sentiment: 68, quadrant: 'Visible, weaker sentiment', isYourBrand: false },
    { name: preset.competitors[2] || 'Competitor C', mentionRate: 18, sentiment: 86, quadrant: 'Loved, less visible', isYourBrand: false },
    { name: preset.competitors[3] || 'Competitor D', mentionRate: 12, sentiment: 45, quadrant: 'Emerging', isYourBrand: false },
  ];

  const aiPresenceScore = (preset as any).aiPresenceScore ?? (80 + (hash % 18));
  const keyPromptsScore = (preset as any).keyPromptsScore ?? (70 + ((hash >> 1) % 25));
  const competitorLandscapeScore = (preset as any).competitorLandscapeScore ?? (65 + ((hash >> 2) % 30));
  const strategyReviewScore = (preset as any).strategyReviewScore ?? (70 + ((hash >> 3) % 20));

  const aiModels = (preset as any).aiModels ?? {
    chatgpt: { name: 'ChatGPT-4o', score: chatgptScore, checked: true },
    gemini: { name: 'Google Gemini', score: geminiScore, checked: true },
    claude: { name: 'Claude 3.7', score: claudeScore, checked: true },
    perplexity: { name: 'Perplexity Pro', score: perplexityScore, checked: true },
  };

  const presetStrategy = (preset as any).strategy;

  return {
    domain: normDomain,
    brandName: preset.brandName,
    industry: preset.industry,
    region: preset.region,
    scanDate,
    score,
    scoreBadge,
    products: preset.products,
    productsFoundPct: (preset as any).productsFoundPct ?? 10.5,
    yourProductsPct: (preset as any).yourProductsPct ?? 8.3,
    competitorProductsPct: (preset as any).competitorProductsPct ?? 100.0,
    bestProduct: preset.bestProduct || '—',

    aiPresenceScore,
    keyPromptsScore,
    competitorLandscapeScore,
    strategyReviewScore,

    aiModels,

    trajectory90DaysDate: trajectoryDate,
    trajectoryMultiplier: 1.4,
    trajectoryPoints,

    prompts,
    fanoutOpportunities,
    productRankings,
    aiChatbotsTable,
    competitorDots,
    competitorNames: preset.competitors,

    strategy: {
      answerability: {
        score: presetStrategy?.answerability ?? 42,
        goodLength: true,
        conversational: true,
        statistics: true,
        citations: true,
      },
      webPresence: {
        wikipedia: presetStrategy?.wiki ?? true,
        redditScore: presetStrategy?.redditScore ?? 96,
        xScore: presetStrategy?.xScore ?? 0,
        youtubeScore: presetStrategy?.youtubeScore ?? 0,
      },
      structuredData: {
        score: presetStrategy?.structuredData ?? 70,
        schemaMarkup: true,
        schemaType: 'Organization, SoftwareApplication, WebSite',
        tagsFound: 26,
        semanticElements: 393,
        nonSemantics: 318,
      },
      crawlerAccessibility: {
        score: presetStrategy?.crawlerAccessibility ?? 95,
        sitemap: true,
        robotsTxt: true,
        llmsTxt: false,
        llmsTxtAccessible: false,
        hasEnglish: true,
        language: 'en',
        prerendered: true,
      },
    },
  };
}
