// Statistical Sampling Engine (spec section 15.1)
//
// LLM answers are highly non-deterministic. A single AI answer carries
// almost no brand-discriminating signal (reliability ≈ 0.01). The
// industry-standard fix is a polling model: 250-500 high-intent queries,
// sampled over time, to get statistically stable estimates.
//
// Every displayed score must carry uncertainty: show `estimate ± interval`
// (Wilson score interval for mention rate). Display `effective_n` (number
// of samples behind the estimate). Suppress trend arrows until
// `effective_n >= 10` per keyword; show "collecting data" state instead.

export interface SampleData {
  sampleIndex: number;
  mentioned: boolean;
}

export interface ConfidenceInterval {
  low: number;
  high: number;
  pointEstimate: number;
  effectiveN: number;
  isReady: boolean; // true when effective_n >= 10
}

/**
 * Wilson score interval for a binomial proportion.
 *
 * Wilson's interval is preferred over the normal approximation because it
 * handles edge cases (0% or 100% mention rate) correctly — the normal
 * approximation would give a degenerate interval in those cases.
 *
 * @param successes  Number of samples where the brand was mentioned
 * @param n         Total number of samples
 * @param z         Z-score for confidence level (1.96 for 95% CI)
 */
export function wilsonInterval(
  successes: number,
  n: number,
  z: number = 1.96
): { low: number; high: number; center: number } {
  if (n === 0) {
    return { low: 0, high: 0, center: 0 };
  }

  const phat = successes / n;
  const denom = 1 + z * z / n;
  const center = (phat + z * z / (2 * n)) / denom;
  const margin =
    (z * Math.sqrt((phat * (1 - phat) + z * z / (4 * n)) / n)) / denom;

  return {
    low: Math.max(0, center - margin),
    high: Math.min(1, center + margin),
    center,
  };
}

/**
 * Compute confidence interval for a set of samples.
 *
 * @param samples  Array of { sampleIndex, mentioned } records
 * @param minSamples  Minimum effective_n before the estimate is "ready"
 * @returns ConfidenceInterval with low, high, pointEstimate, effectiveN, isReady
 */
export function computeConfidenceInterval(
  samples: SampleData[],
  minSamples: number = 10
): ConfidenceInterval {
  const n = samples.length;
  const successes = samples.filter((s) => s.mentioned).length;

  if (n === 0) {
    return {
      low: 0,
      high: 0,
      pointEstimate: 0,
      effectiveN: 0,
      isReady: false,
    };
  }

  const interval = wilsonInterval(successes, n);
  const pointEstimate = interval.center;
  const effectiveN = n;
  const isReady = effectiveN >= minSamples;

  return {
    low: Math.round(pointEstimate * 100),
    high: Math.round(pointEstimate * 100),
    pointEstimate: Math.round(pointEstimate * 100),
    effectiveN,
    isReady,
  };
}

/**
 * Compute a rolling estimate across multiple scan runs.
 *
 * Each scan run is one sample. After 4+ runs, we have enough data
 * to compute a statistically stable estimate.
 *
 * @param runs  Array of runs, each with { sampleIndex, mentionedCount, totalCount }
 * @param minSamples  Minimum number of samples before estimate is "ready"
 */
export function computeRollingEstimate(
  runs: Array<{ sampleIndex: number; mentionedCount: number; totalCount: number }>,
  minSamples: number = 10
): ConfidenceInterval {
  const samples: SampleData[] = [];
  for (const run of runs) {
    for (let i = 0; i < run.totalCount; i++) {
      samples.push({
        sampleIndex: run.sampleIndex,
        mentioned: i < run.mentionedCount,
      });
    }
  }
  return computeConfidenceInterval(samples, minSamples);
}

/**
 * Format a confidence interval for display.
 *
 * Example: "65% ± 12%" or "Collecting data (3/10 samples)"
 */
export function formatConfidence(ci: ConfidenceInterval): string {
  if (!ci.isReady) {
    return `Collecting data (${ci.effectiveN}/10 samples)`;
  }
  const margin = Math.round((ci.high - ci.low) / 2);
  return `${ci.pointEstimate}% ± ${margin}%`;
}

/**
 * Check if a trend should be displayed.
 *
 * Suppress trend arrows until effective_n >= 10 per keyword.
 * Show "collecting data" state instead.
 */
export function shouldShowTrend(effectiveN: number, minSamples: number = 10): boolean {
  return effectiveN >= minSamples;
}

/**
 * Compute effective sample size for a keyword across engines.
 *
 * Each engine contributes samples independently. The effective_n is
 * the total number of samples across all engines for a keyword.
 */
export function computeEffectiveN(
  samplesByEngine: Record<string, SampleData[]>
): number {
  return Object.values(samplesByEngine).reduce(
    (sum, samples) => sum + samples.length,
    0
  );
}
