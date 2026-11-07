// llms.txt + llms-full.txt generator for AEO Visibility Tracker projects.
// Generates honest, accurate Markdown for AI agents and IDE assistants.
// Does NOT claim to boost AI search rankings (that would be misleading).

export interface LlmGeneratorInput {
  brandName: string;
  domain: string;
  description: string;
  products?: Array<{ name: string; price?: string; description: string; url?: string }>;
  pricing?: Array<{ tier: string; price: string; features: string[] }>;
  contact?: { email?: string; phone?: string; hours?: string };
}

export interface LlmOutput {
  llmsTxt: string;
  llmsFullTxt: string;
  instructions: string;
}

export function generateLlmsTxt(input: LlmGeneratorInput): LlmOutput {
  const { brandName, domain, description, products, pricing, contact } = input;

  // llms.txt: concise version for quick agent reads
  const llmsLines: string[] = [
    `# ${brandName}`,
    '',
    description,
    '',
    `## Base URL`,
    `https://${domain}`,
    '',
  ];

  if (products && products.length > 0) {
    llmsLines.push('## Products');
    for (const product of products) {
      llmsLines.push(`- **${product.name}**${product.price ? ` - ${product.price}` : ''}${product.url ? ` ([link](${product.url}))` : ''}`);
    }
    llmsLines.push('');
  }

  if (pricing && pricing.length > 0) {
    llmsLines.push('## Pricing');
    for (const tier of pricing) {
      llmsLines.push(`- ${tier.tier}: ${tier.price}`);
    }
    llmsLines.push('');
  }

  if (contact) {
    llmsLines.push('## Contact');
    if (contact.email) llmsLines.push(`- Email: ${contact.email}`);
    if (contact.phone) llmsLines.push(`- Phone: ${contact.phone}`);
    if (contact.hours) llmsLines.push(`- Hours: ${contact.hours}`);
    llmsLines.push('');
  }

  // Honest disclaimer - critical for trust
  llmsLines.push('---');
  llmsLines.push('');
  llmsLines.push('> **Note:** This file is for AI agents and IDE assistants (Cursor, Claude Code, etc.). It will NOT directly boost your rankings in ChatGPT, Gemini, or Google AI Overviews. Any vendor claiming otherwise is overselling.');

  const llmsTxt = llmsLines.join('\n');

  // llms-full.txt: extended version with more detail
  const llmsFullLines: string[] = [
    `# ${brandName} — Complete Documentation`,
    '',
    `> This is the full documentation for ${brandName}. AI agents and developers can use this to understand our products, pricing, and how to integrate with us.`,
    '',
    `## About`,
    '',
    description,
    '',
    `## Website`,
    '',
    `- Homepage: https://${domain}`,
    '',
  ];

  if (products && products.length > 0) {
    llmsFullLines.push('## Products');
    llmsFullLines.push('');
    for (const product of products) {
      llmsFullLines.push(`### ${product.name}`);
      llmsFullLines.push('');
      if (product.description) llmsFullLines.push(product.description);
      if (product.price) llmsFullLines.push(`**Price:** ${product.price}`);
      if (product.url) llmsFullLines.push(`[Learn more](${product.url})`);
      llmsFullLines.push('');
    }
  }

  if (pricing && pricing.length > 0) {
    llmsFullLines.push('## Pricing Plans');
    llmsFullLines.push('');
    for (const tier of pricing) {
      llmsFullLines.push(`### ${tier.tier}`);
      llmsFullLines.push('');
      llmsFullLines.push(`**Price:** ${tier.price}`);
      llmsFullLines.push('');
      llmsFullLines.push('**Features:**');
      for (const feature of tier.features) {
        llmsFullLines.push(`- ${feature}`);
      }
      llmsFullLines.push('');
    }
  }

  if (contact) {
    llmsFullLines.push('## Contact Information');
    llmsFullLines.push('');
    if (contact.email) llmsFullLines.push(`- **Email:** ${contact.email}`);
    if (contact.phone) llmsFullLines.push(`- **Phone:** ${contact.phone}`);
    if (contact.hours) llmsFullLines.push(`- **Support Hours:** ${contact.hours}`);
    llmsFullLines.push('');
  }

  // Honest disclaimer in full version too
  llmsFullLines.push('---');
  llmsFullLines.push('');
  llmsFullLines.push('> **Important:** This file makes your site legible to AI agents and IDE assistants. It will NOT directly boost ChatGPT citations or AI search rankings. Google has stated that llms.txt is not a ranking factor. Use this for better agent integration, not SEO.');

  const llmsFullTxt = llmsFullLines.join('\n');

  return {
    llmsTxt,
    llmsFullTxt,
    instructions: `1. Create a file named \`llms.txt\` in your website's root directory with the concise version.\n2. Create a file named \`llms-full.txt\` in your website's root directory with the detailed version.\n3. Update these files whenever your products, pricing, or contact info changes.`,
  };
}
