export const PROMPT_VERSION = 'v1';

export const PROMPT_TEMPLATES = [
  (keyword: string) => `${keyword}?`,
  (keyword: string) => `I'm evaluating options. ${keyword} — what do you recommend and why?`,
  (keyword: string) => `Compare the top 5 options for "${keyword}" with pros and cons.`,
];

export function generatePrompts(keyword: string): string[] {
  return PROMPT_TEMPLATES.map(template => template(keyword));
}

export function getPromptVersion(): string {
  return PROMPT_VERSION;
}