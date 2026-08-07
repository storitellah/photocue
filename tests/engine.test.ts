import { describe, expect, it } from 'vitest';
import {
  generatePrompt,
  componentDistance,
  combinationEstimate,
} from '../src/engine';
import { MODES } from '../src/data/modes';

describe('prompt engine — structure', () => {
  it('produces a fully-formed prompt with every required field', () => {
    const p = generatePrompt({ seed: 'seed-a', mode: 'General Prompt', spin: 1, entropy: 1 });
    expect(p.id).toBeTruthy();
    expect(p.fingerprint).toBeTruthy();
    expect(p.title.length).toBeGreaterThan(3);
    expect(p.assignment.length).toBeGreaterThan(20);
    expect(p.why).toBeTruthy();
    expect(p.variation).toBeTruthy();
    expect(p.reflection).toMatch(/\?$/);
    expect(p.role).toBeTruthy();
    expect(['Gentle', 'Focused', 'Challenging']).toContain(p.difficulty);
    expect(p.time).toBeTruthy();
    expect(Object.keys(p.components).length).toBeGreaterThanOrEqual(4);
  });

  it('uses the location naturally in a location prompt but omits it for general prompts', () => {
    const loc = generatePrompt({ seed: 's', mode: 'Location Prompt', spin: 1, location: 'Kibera', entropy: 2 });
    expect(loc.assignment).toMatch(/Kibera/);
    const gen = generatePrompt({ seed: 's', mode: 'General Prompt', spin: 1, location: 'Kibera', entropy: 2 });
    expect(gen.assignment).not.toMatch(/Kibera/);
  });

  it('does not force the location into a general prompt and never invents facts', () => {
    const p = generatePrompt({ seed: 's', mode: 'Location Prompt', spin: 3, location: 'A fishing community', entropy: 7 });
    // Neutral, observational language: no loaded adjectives about the place.
    expect(p.assignment.toLowerCase()).not.toMatch(/poor|dangerous|wealthy|slum|primitive/);
  });

  it('folds in a place-type orientation when a place type is chosen', () => {
    const p = generatePrompt({
      seed: 's', mode: 'Location Prompt', spin: 1, location: 'The station', placeType: 'Transport hub', entropy: 3,
    });
    expect(p.placeType).toBe('Transport hub');
    expect(p.components.placeType).toBe('Transport hub');
  });

  it('produces a prompt for every mode', () => {
    for (const mode of MODES) {
      const p = generatePrompt({ seed: 'm', mode, spin: 1, entropy: 5 });
      expect(p.mode).toBe(mode);
      expect(p.assignment.length).toBeGreaterThan(15);
    }
  });

  it('estimates a very large combination space per mode', () => {
    for (const mode of MODES) {
      expect(combinationEstimate(mode)).toBeGreaterThan(100_000);
    }
  });
});

describe('prompt engine — determinism and independence', () => {
  it('is deterministic for identical inputs (with fixed entropy)', () => {
    const a = generatePrompt({ seed: 'x', mode: 'Detail', spin: 4, entropy: 42 });
    const b = generatePrompt({ seed: 'x', mode: 'Detail', spin: 4, entropy: 42 });
    expect(a.fingerprint).toBe(b.fingerprint);
    expect(a.assignment).toBe(b.assignment);
  });

  it('different installations receive different first prompts', () => {
    const a = generatePrompt({ seed: 'install-1', mode: 'General Prompt', spin: 1, entropy: 0 });
    const b = generatePrompt({ seed: 'install-2', mode: 'General Prompt', spin: 1, entropy: 0 });
    expect(a.fingerprint).not.toBe(b.fingerprint);
  });

  it('componentDistance counts differing meaningful components', () => {
    const a = { template: 't1', mode: 'Detail', subject: '1', detail: '2' };
    const b = { template: 't1', mode: 'Detail', subject: '9', detail: '2' };
    expect(componentDistance(a, b)).toBe(1);
    const c = { template: 't2', mode: 'Action', subject: '9', detail: '5' };
    expect(componentDistance(a, c)).toBeGreaterThanOrEqual(3);
  });
});
