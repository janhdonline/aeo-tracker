export function normalizeDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

export function extractDomainsFromText(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s)]+/g;
  const urls = text.match(urlRegex) || [];
  const domains = new Set<string>();
  
  for (const url of urls) {
    const domain = normalizeDomain(url);
    if (domain) {
      domains.add(domain);
    }
  }
  
  return Array.from(domains);
}

export function extractCitationsFromAnswer(answer: string): { domain: string; url: string; title: string }[] {
  const citations: { domain: string; url: string; title: string }[] = [];
  const domains = extractDomainsFromText(answer);
  
  for (const domain of domains) {
    // Try to find the full URL for this domain in the answer
    const urlRegex = new RegExp(`https?://[^\\s)]*${domain.replace('.', '\\.')}[^\\s)]*`, 'g');
    const match = answer.match(urlRegex);
    const url = match?.[0] || `https://${domain}`;
    
    citations.push({
      domain,
      url,
      title: domain,
    });
  }
  
  return citations;
}