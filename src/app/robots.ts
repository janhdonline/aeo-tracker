import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-checker.com';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/login', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}