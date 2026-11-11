import type { MetadataRoute } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aeo-checker.com';

  const staticPages = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/report`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tools/ai-crawler-audit`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/tools/llms-generator`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/industries`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ];

  // Dynamic Blog Posts
  const blogSlugs = ['what-is-aeo', 'aeo-vs-seo'];
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.85,
  }));

  // Fetch active project domains & cached reports from DB for dynamic report pages
  let reportPages: MetadataRoute.Sitemap = [];
  try {
    const supabase = createAdminClient();
    const domainsMap = new Map<string, Date>();

    // 1. Projects
    const { data: projects } = await supabase
      .from('projects')
      .select('domain, updated_at')
      .eq('active', true)
      .order('updated_at', { ascending: false })
      .limit(500);

    (projects || []).forEach((p: any) => {
      if (p.domain) {
        domainsMap.set(p.domain.toLowerCase(), p.updated_at ? new Date(p.updated_at) : new Date());
      }
    });

    // 2. Public cached reports
    const { data: cachedReports } = await supabase
      .from('public_reports_cache')
      .select('domain, updated_at')
      .order('updated_at', { ascending: false })
      .limit(500);

    (cachedReports || []).forEach((c: any) => {
      if (c.domain && !domainsMap.has(c.domain.toLowerCase())) {
        domainsMap.set(c.domain.toLowerCase(), c.updated_at ? new Date(c.updated_at) : new Date());
      }
    });

    reportPages = Array.from(domainsMap.entries()).map(([domain, date]) => ({
      url: `${baseUrl}/report/${domain}`,
      lastModified: date,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.warn('sitemap: failed to fetch projects, using fallback', error);
    // Fallback to top example domains
    reportPages = ['shopify.com', 'stripe.com', 'notion.so', 'hubspot.com', 'salesforce.com', 'figma.com', 'linear.app', 'slack.com', 'canva.com', 'github.com'].map((domain) => ({
      url: `${baseUrl}/report/${domain}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  }

  // Industry index pages (programmatic SEO) - Fixed URL path to /industries/[industry]
  const industries = ['saas', 'ecommerce', 'healthcare', 'finance', 'legal', 'real-estate', 'education', 'marketing', 'media', 'hospitality'];
  const industryPages: MetadataRoute.Sitemap = industries.map((industry) => ({
    url: `${baseUrl}/industries/${industry}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...blogPages, ...reportPages, ...industryPages];
}
