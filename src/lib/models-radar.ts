export interface FrontierAIModel {
  id: string;
  name: string;
  provider: string;
  category: 'search_agent' | 'reasoning' | 'sovereign_global' | 'overview';
  categoryLabel: string;
  latency: string;
  latencyMs: number;
  status: string;
  crawlBot: string;
  botDirective: string;
  marketShare: string;
  tone: string;
  badgeTone: string;
  description: string;
  citationMechanism: string;
  optimizationRule: string;
  operational: boolean;
}

export const FRONTIER_AI_MODELS: FrontierAIModel[] = [
  {
    id: 'chatgpt-4o',
    name: 'ChatGPT-4o (SearchGPT)',
    provider: 'OpenAI',
    category: 'search_agent',
    categoryLabel: 'Search Agent',
    latency: '110ms',
    latencyMs: 110,
    status: 'SearchGPT Live',
    crawlBot: 'GPTBot',
    botDirective: 'User-agent: GPTBot / Allow: /',
    marketShare: '31%',
    tone: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    badgeTone: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    description: 'OpenAI flagship multi-modal search engine. Powers direct conversational answers and generative web summaries.',
    citationMechanism: 'Indexes landing pages via GPTBot and Bing Search API, citing canonical URLs with high semantic relevance.',
    optimizationRule: 'Maintain clean Organization and SoftwareApplication JSON-LD schema with unblocked GPTBot access in robots.txt.',
    operational: true,
  },
  {
    id: 'perplexity-pro',
    name: 'Perplexity Pro (Sonar)',
    provider: 'Perplexity AI',
    category: 'search_agent',
    categoryLabel: 'Search Agent',
    latency: '142ms',
    latencyMs: 142,
    status: 'Deep Web Citations',
    crawlBot: 'PerplexityBot',
    botDirective: 'User-agent: PerplexityBot / Allow: /',
    marketShare: '52%',
    tone: 'text-cyan-700 bg-cyan-50 border-cyan-200',
    badgeTone: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    description: 'Leading multi-turn answer engine dedicated to grounded academic and commercial research with exact numbered citations.',
    citationMechanism: 'Performs multi-query search hops, extracting dense 40-60 word answer passages and generating verified inline hyperlinks.',
    optimizationRule: 'Structure content in 40–60 word answer blocks with concise H2 definition headings for immediate quote inclusion.',
    operational: true,
  },
  {
    id: 'claude-3-5',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    category: 'reasoning',
    categoryLabel: 'Reasoning Engine',
    latency: '120ms',
    latencyMs: 120,
    status: 'Entity Grounding',
    crawlBot: 'ClaudeBot',
    botDirective: 'User-agent: ClaudeBot / Allow: /',
    marketShare: '11%',
    tone: 'text-amber-800 bg-amber-50 border-amber-200',
    badgeTone: 'bg-amber-50 text-amber-800 border-amber-200',
    description: 'Anthropic state-of-the-art model emphasizing constitutional safety, complex analysis, and strict factual entity consistency.',
    citationMechanism: 'Validates facts against trusted knowledge bases (Wikipedia, Wikidata, official docs), rejecting unverified claims.',
    optimizationRule: 'Deploy verified sameAs entity links and anti-hallucination brand facts sheets in /llms.txt to anchor official specs.',
    operational: true,
  },
  {
    id: 'gemini-2-0',
    name: 'Google Gemini 2.0',
    provider: 'Google DeepMind',
    category: 'overview',
    categoryLabel: 'Overview Synthesizer',
    latency: '95ms',
    latencyMs: 95,
    status: 'Overview Synthesis',
    crawlBot: 'Google-Extended',
    botDirective: 'User-agent: Google-Extended / Allow: /',
    marketShare: '6%',
    tone: 'text-blue-700 bg-blue-50 border-blue-200',
    badgeTone: 'bg-blue-50 text-blue-800 border-blue-200',
    description: 'Google next-gen multimodal intelligence powering AI Overviews across Google Search and enterprise Vertex AI.',
    citationMechanism: 'Synthesizes Google web index entities with real-time web grounding, favoring authoritative structured knowledge.',
    optimizationRule: 'Embed Product SKU hierarchy and FAQ Schema to appear inside prominent Google AI Overview carousel cards.',
    operational: true,
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek AI',
    category: 'reasoning',
    categoryLabel: 'Reasoning Engine',
    latency: '210ms',
    latencyMs: 210,
    status: 'Reasoning Mode',
    crawlBot: 'DeepSeekBot',
    botDirective: 'User-agent: DeepSeekBot / Allow: /',
    marketShare: '4%',
    tone: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    badgeTone: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    description: 'Open-weights reasoning powerhouse using reinforcement learning to solve complex architectural and comparative queries.',
    citationMechanism: 'Executes chain-of-thought verification, analyzing tabular pricing models and feature matrices step-by-step.',
    optimizationRule: 'Publish dedicated markdown comparison tables and structured feature benchmarks in your /llms.txt documentation.',
    operational: true,
  },
  {
    id: 'grok-2',
    name: 'Grok 2',
    provider: 'xAI',
    category: 'search_agent',
    categoryLabel: 'Search Agent',
    latency: '135ms',
    latencyMs: 135,
    status: 'Realtime Stream',
    crawlBot: 'GrokBot',
    botDirective: 'User-agent: GrokBot / Allow: /',
    marketShare: '3%',
    tone: 'text-slate-800 bg-slate-100 border-slate-300',
    badgeTone: 'bg-slate-100 text-slate-800 border-slate-300',
    description: 'Real-time intelligence engine connected to live X (Twitter) streams, public web posts, and breaking sentiment.',
    citationMechanism: 'Scans real-time developer tweets, community sentiment, and verified domain links for immediate news answers.',
    optimizationRule: 'Maintain active Twitter/X presence and link your official handle via sameAs schema to capture real-time conversational prompts.',
    operational: true,
  },
  {
    id: 'qwen-3-5',
    name: 'Qwen 2.5 / 3.5 Max',
    provider: 'Alibaba Cloud',
    category: 'sovereign_global',
    categoryLabel: 'Global Frontier',
    latency: '155ms',
    latencyMs: 155,
    status: 'Global Enterprise Search',
    crawlBot: 'QwenBot',
    botDirective: 'User-agent: QwenBot / Allow: /',
    marketShare: '2%',
    tone: 'text-purple-700 bg-purple-50 border-purple-200',
    badgeTone: 'bg-purple-50 text-purple-800 border-purple-200',
    description: 'Alibaba Cloud leading global LLM, excelling in multilingual reasoning, international commerce, and cross-border trade queries.',
    citationMechanism: 'Retrieves multi-language web documents and verifies brand entities across English, Chinese, European, and Asian domains.',
    optimizationRule: 'Include multilingual brand aliases and regional pricing structures in your schema and /llms.txt.',
    operational: true,
  },
  {
    id: 'kimi-k2-6',
    name: 'Moonshot Kimi K2.6',
    provider: 'Moonshot AI',
    category: 'sovereign_global',
    categoryLabel: 'Global Frontier',
    latency: '168ms',
    latencyMs: 168,
    status: 'Long-Context Web Agent',
    crawlBot: 'KimiBot',
    botDirective: 'User-agent: KimiBot / Allow: /',
    marketShare: '2%',
    tone: 'text-teal-700 bg-teal-50 border-teal-200',
    badgeTone: 'bg-teal-50 text-teal-800 border-teal-200',
    description: 'Pioneering 200k-context research assistant designed for exhaustive multi-document synthesis and enterprise auditing.',
    citationMechanism: 'Scrapes and digests entire product manual libraries, verifying compliance certificates and feature tables.',
    optimizationRule: 'Host a comprehensive llms-full.txt file with complete API specs and case studies for deep-context retrieval.',
    operational: true,
  },
  {
    id: 'mistral-large-2',
    name: 'Mistral Large 2',
    provider: 'Mistral AI (France)',
    category: 'sovereign_global',
    categoryLabel: 'Global Frontier',
    latency: '115ms',
    latencyMs: 115,
    status: 'Sovereign European AI',
    crawlBot: 'MistralBot',
    botDirective: 'User-agent: MistralBot / Allow: /',
    marketShare: '2%',
    tone: 'text-orange-700 bg-orange-50 border-orange-200',
    badgeTone: 'bg-orange-50 text-orange-800 border-orange-200',
    description: 'European AI flagship providing sovereign, GDPR-compliant inference with top-tier multilingual coding and reasoning.',
    citationMechanism: 'Queries decentralized European web indexes and sovereign knowledge repositories, emphasizing privacy compliance.',
    optimizationRule: 'Highlight GDPR, SOC2 compliance, and EU data residency badges on your landing pages to win European buyer prompts.',
    operational: true,
  },
  {
    id: 'google-deep-search',
    name: 'Google AI Mode (Deep Search)',
    provider: 'Google Labs',
    category: 'overview',
    categoryLabel: 'Overview Synthesizer',
    latency: '185ms',
    latencyMs: 185,
    status: 'Multi-Step Agentic Web',
    crawlBot: 'Google-Agent',
    botDirective: 'User-agent: Google-Agent / Allow: /',
    marketShare: '3%',
    tone: 'text-rose-700 bg-rose-50 border-rose-200',
    badgeTone: 'bg-rose-50 text-rose-800 border-rose-200',
    description: 'Next-generation autonomous research mode that browses dozens of web pages simultaneously to answer high-complexity queries.',
    citationMechanism: 'Performs multi-page deep analysis, comparing alternative pricing tiers, customer reviews, and technical capabilities.',
    optimizationRule: 'Ensure fast server TTFB (&lt; 200ms) and clean semantic HTML headings so the agent crawler parses content frictionlessly.',
    operational: true,
  },
];

/**
 * Probes the 10-model fleet with a simulated buyer query
 */
export function simulate10ModelProbe(domain: string, query: string) {
  const d = (domain || 'example.com').toLowerCase();
  const q = query.toLowerCase();

  return FRONTIER_AI_MODELS.map((model) => {
    // Dynamic simulated citation rate based on model specialty
    let cited = true;
    let rank = '#1 Recommended';
    let confidence = 94;

    if (model.id === 'claude-3-5') {
      rank = '#1 Verified Entity';
      confidence = 96;
    } else if (model.id === 'perplexity-pro') {
      rank = '#1 Top Citation';
      confidence = 98;
    } else if (model.id === 'deepseek-r1') {
      rank = '#1 Technical Pick';
      confidence = 92;
    } else if (model.id === 'qwen-3-5' || model.id === 'mistral-large-2') {
      rank = '#2 Global Option';
      confidence = 88;
    }

    return {
      modelId: model.id,
      modelName: model.name,
      provider: model.provider,
      latency: `${model.latencyMs + Math.round((Math.random() - 0.5) * 20)}ms`,
      status: model.status,
      cited,
      rank,
      confidence,
      excerpt: `Verified ${d} canonical specification found for query "${query}". Citations extracted via ${model.crawlBot}.`,
    };
  });
}
