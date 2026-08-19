import { afterEach, describe, expect, it, vi } from 'vitest';
import { generatePrompt } from '../src/engine';
import { generatePromptAI, aiAvailable } from '../src/engine/ai';

/**
 * Covers the two additions to generation: the stylistic lean applied by the
 * offline engine, and the defensive AI client that must always fall back to the
 * engine rather than throw.
 */

describe('prompt style bias (offline engine)', () => {
  it('cinematic style selects film-grammar templates', () => {
    // Across several spins, cinematic style should reliably land on a template
    // that uses a film-grammar slot (id prefixed g-cine-).
    let sawCine = false;
    for (let spin = 1; spin <= 12; spin++) {
      const p = generatePrompt({ seed: 'style', mode: 'General Prompt', spin, style: 'cinematic', entropy: spin });
      if (String(p.components.template).startsWith('g-cine')) sawCine = true;
    }
    expect(sawCine).toBe(true);
  });

  it('default (observational) style still produces valid prompts', () => {
    const p = generatePrompt({ seed: 'style', mode: 'Detail', spin: 1, entropy: 1 });
    expect(p.assignment.length).toBeGreaterThan(20);
  });
});

describe('AI client — defensive fallback', () => {
  const online = () => vi.stubGlobal('navigator', { onLine: true });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('reports unavailable and returns null when offline', async () => {
    vi.stubGlobal('navigator', { onLine: false });
    expect(aiAvailable()).toBe(false);
    const result = await generatePromptAI({ mode: 'General Prompt' });
    expect(result).toBeNull();
  });

  it('returns a well-formed AI prompt on a valid response', async () => {
    online();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          title: 'A Quiet Threshold',
          assignment: 'Find a doorway where people pause before entering, and photograph the hesitation in available light.',
          why: 'A threshold reveals how a place is entered and left.',
          variation: 'Return an hour later and photograph the same doorway.',
          reflection: 'What lies just outside the frame?',
        }),
      })),
    );
    const result = await generatePromptAI({ mode: 'Location Prompt', location: 'A market', style: 'cinematic' });
    expect(result).not.toBeNull();
    expect(result!.source).toBe('ai');
    expect(result!.assignment).toContain('doorway');
    expect(result!.location).toBe('A market');
  });

  it('falls back to null on a non-ok response', async () => {
    online();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, json: async () => ({}) })));
    const result = await generatePromptAI({ mode: 'General Prompt' });
    expect(result).toBeNull();
  });

  it('falls back to null when the response has no usable assignment', async () => {
    online();
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ title: 'x', assignment: 'too short' }) })));
    const result = await generatePromptAI({ mode: 'General Prompt' });
    expect(result).toBeNull();
  });

  it('falls back to null when fetch throws', async () => {
    online();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('network');
      }),
    );
    const result = await generatePromptAI({ mode: 'General Prompt' });
    expect(result).toBeNull();
  });
});
