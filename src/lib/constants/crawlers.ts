export interface AICrawlerDefinition {
  name: string;
  company: string;
  role: string;
  userAgent: string;
}

export const AI_CRAWLERS: AICrawlerDefinition[] = [
  { name: 'GPTBot', company: 'OpenAI', role: 'AI Training & ChatGPT', userAgent: 'Mozilla/5.0 (compatible; GPTBot/0.1; +https://openai.com/gptbot)' },
  { name: 'ChatGPT-User', company: 'OpenAI', role: 'ChatGPT Browsing', userAgent: 'Mozilla/5.0 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)' },
  { name: 'OAI-SearchBot', company: 'OpenAI', role: 'ChatGPT Search & SearchGPT', userAgent: 'Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)' },
  { name: 'ClaudeBot', company: 'Anthropic', role: 'Claude AI Training', userAgent: 'Mozilla/5.0 (compatible; ClaudeBot/0.1; +https://claude.ai/claudebot)' },
  { name: 'Claude-User', company: 'Anthropic', role: 'Claude Web Access', userAgent: 'Mozilla/5.0 (compatible; Claude-User/1.0; +https://claude.ai)' },
  { name: 'Claude-SearchBot', company: 'Anthropic', role: 'Claude Search', userAgent: 'Mozilla/5.0 (compatible; Claude-SearchBot/1.0)' },
  { name: 'anthropic-ai', company: 'Anthropic', role: 'Claude Training Legacy', userAgent: 'Mozilla/5.0 (compatible; anthropic-ai)' },
  { name: 'Google-Extended', company: 'Google', role: 'Gemini AI Training', userAgent: 'Mozilla/5.0 (compatible; Google-Extended/0.1)' },
  { name: 'Gemini-Deep-Research', company: 'Google', role: 'Gemini Deep Research', userAgent: 'Mozilla/5.0 (compatible; Gemini-Deep-Research/1.0)' },
  { name: 'PerplexityBot', company: 'Perplexity', role: 'Perplexity Search', userAgent: 'Mozilla/5.0 (compatible; PerplexityBot/0.1)' },
  { name: 'Perplexity-User', company: 'Perplexity', role: 'Perplexity Browsing', userAgent: 'Mozilla/5.0 (compatible; Perplexity-User/1.0)' },
  { name: 'Bytespider', company: 'ByteDance', role: 'TikTok / Doubao AI', userAgent: 'Mozilla/5.0 (compatible; Bytespider)' },
  { name: 'CCBot', company: 'Common Crawl', role: 'Open Training Data', userAgent: 'CCBot/2.0 (https://commoncrawl.org/faq)' },
  { name: 'Meta-ExternalAgent', company: 'Meta', role: 'Llama AI Training', userAgent: 'Mozilla/5.0 (compatible; Meta-ExternalAgent/1.0)' },
  { name: 'FacebookBot', company: 'Meta', role: 'Link Previews & AI', userAgent: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' },
  { name: 'Amazonbot', company: 'Amazon', role: 'Alexa & Rufus AI', userAgent: 'Mozilla/5.0 (compatible; Amazonbot/0.1)' },
  { name: 'Applebot-Extended', company: 'Apple', role: 'Apple Intelligence', userAgent: 'Mozilla/5.0 (compatible; Applebot-Extended/0.1)' },
  { name: 'cohere-ai', company: 'Cohere', role: 'Cohere AI Training', userAgent: 'Mozilla/5.0 (compatible; cohere-ai)' },
  { name: 'DuckAssistBot', company: 'DuckDuckGo', role: 'DuckAssist AI Answers', userAgent: 'Mozilla/5.0 (compatible; DuckAssistBot/1.0)' },
  { name: 'GrokBot', company: 'xAI', role: 'Grok AI Training', userAgent: 'Mozilla/5.0 (compatible; GrokBot/1.0)' },
  { name: 'Ai2Bot', company: 'Allen AI', role: 'Academic AI Research', userAgent: 'Mozilla/5.0 (compatible; Ai2Bot/1.0)' },
  { name: 'YouBot', company: 'You.com', role: 'You.com AI Search', userAgent: 'Mozilla/5.0 (compatible; YouBot/1.0)' },
  { name: 'PetalBot', company: 'Huawei', role: 'Petal Search & AI', userAgent: 'Mozilla/5.0 (compatible; PetalBot)' },
];
