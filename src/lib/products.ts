export interface ProductSKU {
  id: string;
  project_id: string;
  name: string;
  sku_code: string;
  category: string;
  target_url: string;
  description: string;
  visibility_score: number;
  citations_count: number;
  status: 'active' | 'leak' | 'optimizing';
  created_at?: string;
}

export function getDefaultProductsForDomain(projectId: string, domain: string, brand: string): ProductSKU[] {
  const d = domain.toLowerCase();
  const b = brand || domain.split('.')[0] || 'Brand';

  if (d.includes('stripe')) {
    return [
      {
        id: `${projectId}-prod-1`,
        project_id: projectId,
        name: 'Stripe Payments',
        sku_code: 'PAY-CORE',
        category: 'Payment Processing',
        target_url: `https://${domain}/payments`,
        description: 'Complete online and in-person payments for global businesses.',
        visibility_score: 94,
        citations_count: 88,
        status: 'active',
      },
      {
        id: `${projectId}-prod-2`,
        project_id: projectId,
        name: 'Stripe Connect',
        sku_code: 'CONN-MKT',
        category: 'Marketplace & Payouts',
        target_url: `https://${domain}/connect`,
        description: 'Multi-party payments and global compliance for platforms and marketplaces.',
        visibility_score: 89,
        citations_count: 52,
        status: 'active',
      },
      {
        id: `${projectId}-prod-3`,
        project_id: projectId,
        name: 'Stripe Billing',
        sku_code: 'BILL-REC',
        category: 'Recurring Subscriptions',
        target_url: `https://${domain}/billing`,
        description: 'Automated billing, usage-based invoicing, and subscription management.',
        visibility_score: 79,
        citations_count: 31,
        status: 'leak',
      },
    ];
  }

  if (d.includes('notion')) {
    return [
      {
        id: `${projectId}-prod-1`,
        project_id: projectId,
        name: 'Notion Docs & Wiki',
        sku_code: 'DOC-WIKI',
        category: 'Knowledge Management',
        target_url: `https://${domain}/product`,
        description: 'Connected workspace for modern team documentation and roadmaps.',
        visibility_score: 92,
        citations_count: 76,
        status: 'active',
      },
      {
        id: `${projectId}-prod-2`,
        project_id: projectId,
        name: 'Notion AI Agent',
        sku_code: 'AI-AGENT',
        category: 'AI Assistant',
        target_url: `https://${domain}/product/ai`,
        description: 'Generative writing, question answering, and automated summaries.',
        visibility_score: 85,
        citations_count: 44,
        status: 'active',
      },
      {
        id: `${projectId}-prod-3`,
        project_id: projectId,
        name: 'Notion Projects & Tasks',
        sku_code: 'PROJ-TASK',
        category: 'Project Management',
        target_url: `https://${domain}/product/projects`,
        description: 'Flexible Kanban boards, sprint trackers, and cross-team dependencies.',
        visibility_score: 76,
        citations_count: 28,
        status: 'optimizing',
      },
    ];
  }

  // Generic SaaS fallback
  return [
    {
      id: `${projectId}-prod-1`,
      project_id: projectId,
      name: `${b} Core Platform`,
      sku_code: 'SKU-001',
      category: 'Primary Software Suite',
      target_url: `https://${domain}`,
      description: `Primary solution offered by ${b}.`,
      visibility_score: 84,
      citations_count: 42,
      status: 'active',
    },
    {
      id: `${projectId}-prod-2`,
      project_id: projectId,
      name: `${b} API & Integrations`,
      sku_code: 'SKU-API',
      category: 'Developer Platform',
      target_url: `https://${domain}/developers`,
      description: `Webhooks, REST APIs, and developer SDKs for ${b}.`,
      visibility_score: 72,
      citations_count: 19,
      status: 'leak',
    },
  ];
}
