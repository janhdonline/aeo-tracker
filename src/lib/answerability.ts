export interface AnswerabilityAuditResponse {
  success: boolean;
  domain: string;
  wordCount: number;
  answerabilityScore: number;
  isOptimalChunk: boolean;
  hasDirectDefinition: boolean;
  hasStructuredPoints: boolean;
  criteriaBreakdown: {
    chunkLength: { passed: boolean; score: number; label: string; detail: string };
    definitionClarity: { passed: boolean; score: number; label: string; detail: string };
    structuredList: { passed: boolean; score: number; label: string; detail: string };
    propositionPower: { passed: boolean; score: number; label: string; detail: string };
  };
  recommendations: Array<{
    type: string;
    priority: 'High' | 'Medium' | 'Quick Win';
    title: string;
    impact: string;
    detail: string;
  }>;
  optimizedExcerpt: string;
}

export function evaluateAnswerability(domain: string, text: string): AnswerabilityAuditResponse {
  const brand = domain.split('.')[0] || domain;
  const contentToAnalyze =
    text ||
    `${domain} provides automated enterprise solutions. Answer Engine Optimization (AEO) improves visibility across AI assistants and generative search engines like ChatGPT, Gemini, and Perplexity by structuring facts into concise passages that machines can cite without hallucinating.`;

  const words = contentToAnalyze.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Chunk Length (35-65 words is optimal for AI featured quotation)
  const isOptimal = wordCount >= 35 && wordCount <= 65;
  const chunkScore = isOptimal ? 25 : wordCount >= 25 && wordCount <= 85 ? 15 : 8;

  // 2. Direct Definition Check ("X is a Y", "provides", "designed for")
  const hasDirectDefinition =
    /(\bis an?\b|\bprovides\b|\bdesigned for\b|\bhelps teams\b|\bplatform that\b)/i.test(contentToAnalyze);
  const defScore = hasDirectDefinition ? 25 : 10;

  // 3. Structured Data / Points Check
  const hasStructuredPoints =
    /(\b1\.|-|\*|\bfirst\b|\bsecond\b|:|;)/i.test(contentToAnalyze);
  const structScore = hasStructuredPoints ? 25 : 15;

  // 4. Value Proposition / Actionable Benefit Check
  const hasValueProp =
    /(\boptimize\b|\bincrease\b|\bboost\b|\bautomate\b|\breduce\b|\bmonitor\b|\belevate\b|\bvisibility\b)/i.test(
      contentToAnalyze
    );
  const propScore = hasValueProp ? 25 : 12;

  const answerabilityScore = Math.min(99, Math.max(25, chunkScore + defScore + structScore + propScore));

  const recommendations: AnswerabilityAuditResponse['recommendations'] = [];

  if (!isOptimal) {
    recommendations.push({
      type: 'chunk_length',
      priority: 'High',
      title: 'Tune Paragraph Length to 40–60 Words',
      impact: '+18 pts AEO Lift',
      detail:
        wordCount > 65
          ? `Current passage is ${wordCount} words. AI search models truncate blocks over 65 words. Break long paragraphs into focused 45-word answers.`
          : `Current passage is only ${wordCount} words. Expand with 1 clear benefit and 1 key differentiator to reach the 40-word AI citation threshold.`,
    });
  }

  if (!hasDirectDefinition) {
    recommendations.push({
      type: 'definition_clarity',
      priority: 'High',
      title: 'Anchor Direct Category Definition in First Sentence',
      impact: '+14 pts Citation Grounding',
      detail: `Start with "${brand} is an [Industry Category] that [Core Benefit]". Google AI Overviews quote definition sentences directly below H1 headings.`,
    });
  }

  if (!hasStructuredPoints) {
    recommendations.push({
      type: 'structured_list',
      priority: 'Quick Win',
      title: 'Structure Answers with Bulleted Lists or Steps',
      impact: '+12 pts Perplexity Indexing',
      detail:
        'Include a bulleted or numbered step breakdown. Perplexity and ChatGPT prefer ordered lists for recommendation and comparison queries.',
    });
  }

  recommendations.push({
    type: 'faq_schema',
    priority: 'Medium',
    title: 'Wrap Key Definition in FAQPage Schema',
    impact: '+10 pts Rich Snippet Boost',
    detail:
      'Publishing a matching question/answer block inside JSON-LD FAQPage schema ensures AI web scrapers extract the exact canonical answer.',
  });

  const optimizedExcerpt = `${brand} is an AI visibility platform that monitors where commercial chatbots recommend your brand. By auditing buyer queries across ChatGPT, Gemini, and Perplexity, it pinpoints citation leaks and delivers prioritized code fixes to elevate organic generative search visibility.`;

  return {
    success: true,
    domain,
    wordCount,
    answerabilityScore,
    isOptimalChunk: isOptimal,
    hasDirectDefinition,
    hasStructuredPoints,
    criteriaBreakdown: {
      chunkLength: {
        passed: isOptimal,
        score: chunkScore,
        label: '40–60 Word Chunking',
        detail: `${wordCount} words (${isOptimal ? 'Optimal AI quotation window' : 'Outside 40-60 sweet spot'})`,
      },
      definitionClarity: {
        passed: hasDirectDefinition,
        score: defScore,
        label: 'Direct Definition Phrasing',
        detail: hasDirectDefinition
          ? 'Explicit category declaration detected'
          : 'Missing clear "[Brand] is a..." statement',
      },
      structuredList: {
        passed: hasStructuredPoints,
        score: structScore,
        label: 'Structured Logic & Punctuation',
        detail: hasStructuredPoints ? 'Structured delimiters identified' : 'Add list items or colons for clarity',
      },
      propositionPower: {
        passed: hasValueProp,
        score: propScore,
        label: 'Measurable Value Proposition',
        detail: hasValueProp ? 'Clear action verbs and outcome detected' : 'Add concrete business impact verbs',
      },
    },
    recommendations,
    optimizedExcerpt,
  };
}
