import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-checker.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/login', '/api/', '/admin', '/auth/'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'OAI-SearchBot',
          'ClaudeBot',
          'Claude-User',
          'Claude-SearchBot',
          'anthropic-ai',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
          'Gemini-Deep-Research',
          'Applebot-Extended',
          'cohere-ai',
          'DuckAssistBot',
          'YouBot',
          'Bytespider',
          'CCBot',
          'Meta-ExternalAgent',
        ],
        allow: [
          '/',
          '/report',
          '/report/',
          '/tools/',
          '/blog',
          '/blog/',
          '/compare',
          '/industries',
          '/industries/',
          '/pricing',
          '/about',
          '/resources',
          '/llms.txt',
          '/llms-full.txt',
        ],
        disallow: ['/dashboard', '/login', '/api/', '/admin', '/auth/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
