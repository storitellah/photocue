/**
 * Deterministic, seedable pseudo-random number generation.
 *
 * The prompt engine must be reproducible for tests (so we can simulate tens of
 * thousands of installations) yet unpredictable in the field. This module
 * gives us both: a fast seeded generator plus a helper to fold cryptographic
 * entropy into a seed when the platform supports it.
 */

/** A function returning a float in [0, 1). */
export type Rng = () => number;

/**
 * FNV-1a 32-bit string hash. Stable across platforms; used to turn a composite
 * seed string into a numeric seed.
 */
export function hashString(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * mulberry32 — a compact, well-distributed 32-bit PRNG. Deterministic for a
 * given numeric seed.
 */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Build a seeded RNG from an arbitrary composite seed string. */
export function rngFromString(seed: string): Rng {
  return mulberry32(hashString(seed));
}

/** Pick a random element from a non-empty array using the given RNG. */
export function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)];
}

/** Pick a random index from an array using the given RNG. */
export function pickIndex(length: number, rng: Rng): number {
  return Math.floor(rng() * length);
}

/**
 * Return a cryptographically strong 32-bit entropy value where the Web Crypto
 * API is available, falling back to `Math.random` on the rare platform that
 * lacks it. Used only to add unpredictability in production; tests omit it so
 * sequences stay deterministic.
 */
export function secureEntropy(): number {
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (c && typeof c.getRandomValues === 'function') {
    const buf = new Uint32Array(1);
    c.getRandomValues(buf);
    return buf[0] >>> 0;
  }
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}

/** Generate a UUID, falling back to a seeded-ish id if crypto is unavailable. */
export function uuid(): string {
  const c = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  const rnd = secureEntropy().toString(16).padStart(8, '0');
  return `${rnd}-${Date.now().toString(16)}-${secureEntropy().toString(16)}`;
}
