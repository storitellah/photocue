import { describe, expect, it } from 'vitest';
import { generatePrompt, componentDistance } from '../src/engine';
import type { Prompt } from '../src/types';

/**
 * Freshness and collision behaviour. These simulate many installations and long
 * sessions to assert the engine does not repeat itself and that different
 * installations diverge.
 */

describe('prompt freshness — within one installation', () => {
  it('never repeats an exact prompt across a long session and stays 3+ components apart', () => {
    const recent: Prompt[] = [];
    let exactRepeats = 0;
    let tooSimilar = 0;
    const seen = new Set<string>();

    for (let i = 1; i <= 300; i++) {
      const p = generatePrompt({
        seed: 'installation-freshness',
        mode: 'General Prompt',
        spin: i,
        recent: recent.slice(-100),
      });
      if (seen.has(p.fingerprint)) exactRepeats++;
      seen.add(p.fingerprint);

      // Compare against the recent 100 for near-duplicates.
      for (const r of recent.slice(-100)) {
        if (componentDistance(p.components, r.components) < 3) {
          tooSimilar++;
          break;
        }
      }
      recent.push(p);
    }

    expect(exactRepeats).toBe(0);
    // Allow a tiny tail of relaxed fallbacks, but the vast majority must be fresh.
    expect(tooSimilar).toBeLessThan(5);
  });

  it('a change of one component alone is not considered a new prompt', () => {
    const a = { template: 't', mode: 'Detail', subject: '1', detail: '2', reflection: '3' };
    const b = { ...a, subject: '2' };
    expect(componentDistance(a, b)).toBeLessThan(3);
  });
});

describe('prompt freshness — across 10,000 installations', () => {
  it('yields diverse first prompts with a low collision rate', () => {
    const N = 10_000;
    const firstFingerprints = new Set<string>();
    let collisions = 0;

    for (let i = 0; i < N; i++) {
      const p = generatePrompt({
        seed: `install-${i}`,
        mode: 'General Prompt',
        spin: 1,
        entropy: 0, // deterministic per installation for measurement
      });
      if (firstFingerprints.has(p.fingerprint)) collisions++;
      firstFingerprints.add(p.fingerprint);
    }

    const uniqueRatio = firstFingerprints.size / N;
    // With hundreds of thousands of combinations, first-prompt uniqueness should
    // be very high across 10k installations.
    expect(uniqueRatio).toBeGreaterThan(0.9);
    expect(collisions).toBeLessThan(N * 0.1);
  });

  it('different installations produce different sequences over several spins', () => {
    const seqOf = (seed: string): string =>
      Array.from({ length: 8 }, (_, s) =>
        generatePrompt({ seed, mode: 'Story Starter', spin: s + 1, entropy: 0 }).fingerprint,
      ).join('~');

    const a = seqOf('device-A');
    const b = seqOf('device-B');
    const c = seqOf('device-C');
    expect(a).not.toBe(b);
    expect(b).not.toBe(c);
    expect(a).not.toBe(c);
  });
});
