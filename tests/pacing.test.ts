import { describe, it, expect, vi } from 'vitest';
import { paceGeminiRequests, GEMINI_DELAY_MS } from '../src/lib/pacing';

describe('Gemini Pacing', () => {
  it('N requests take >= (N-1) * 4s', async () => {
    vi.useFakeTimers();
    
    const callTimes: number[] = [];
    const requests = [1, 2, 3].map((n) => async () => {
      callTimes.push(Date.now());
      return n;
    });
    
    const promise = paceGeminiRequests(requests, GEMINI_DELAY_MS);
    
    // Advance timers to let all requests complete
    await vi.runAllTimersAsync();
    
    const results = await promise;
    
    expect(results).toEqual([1, 2, 3]);
    expect(callTimes.length).toBe(3);
    
    // Each subsequent request should be at least 4s after the previous
    for (let i = 1; i < callTimes.length; i++) {
      expect(callTimes[i] - callTimes[i - 1]).toBeGreaterThanOrEqual(GEMINI_DELAY_MS);
    }
    
    vi.useRealTimers();
  });

  it('single request has no delay', async () => {
    vi.useFakeTimers();
    
    const requests = [() => Promise.resolve(42)];
    const promise = paceGeminiRequests(requests, GEMINI_DELAY_MS);
    await vi.runAllTimersAsync();
    const results = await promise;
    
    expect(results).toEqual([42]);
    vi.useRealTimers();
  });
});