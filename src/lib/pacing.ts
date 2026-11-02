export const GEMINI_DELAY_MS = 4000;

export async function paceGeminiRequests<T>(
  requests: (() => Promise<T>)[],
  delayMs: number = GEMINI_DELAY_MS
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < requests.length; i++) {
    const result = await requests[i]();
    results.push(result);
    if (i < requests.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  return results;
}