/**
 * The compositional prompt engine.
 *
 * A prompt is assembled, not selected. The engine:
 *  1. Builds a deterministic RNG from the installation seed plus the current
 *     location, story, mode, session, spin count, and (in production) secure
 *     entropy — so different installations get different sequences.
 *  2. Picks a template and fills each slot from the vocabulary banks.
 *  3. Records a component vector used for two freshness guarantees:
 *       - never repeat an exact fingerprint, and
 *       - stay at least three meaningful components away from the recent 100.
 *
 * Everything here is pure and offline: no network, no globals beyond crypto for
 * entropy (which degrades gracefully).
 */

import type { ComponentVector, Difficulty, Mode, PlaceType, Prompt, PromptStyle } from '../types';
import { MODE_ROLE } from '../data/modes';
import { PLACE_ORIENTATION } from '../data/place-types';
import { TAG_LENS } from '../data/context-tags';
import {
  rngFromString,
  secureEntropy,
  uuid,
  type Rng,
} from '../util/rng';
import { sanitizeText } from '../util/sanitize';
import { templatesFor, type Template } from './templates';
import {
  activities,
  approaches,
  atmospheres,
  constraints,
  contrasts,
  details,
  difficulties,
  distances,
  ethics as ethicsBank,
  filmGrammar,
  lenses,
  lightQualities,
  lighting,
  moments,
  movements,
  perspectives,
  purposes,
  reflections,
  relationships,
  storySpines,
  subjects,
  times,
  timeframes,
  titleClosers,
  titleOpeners,
} from './vocabulary';

/** Vocabulary banks keyed by slot/dimension name. */
const BANKS: Record<string, readonly string[]> = {
  subject: subjects,
  activity: activities,
  approach: approaches,
  purpose: purposes,
  detail: details,
  distance: distances,
  perspective: perspectives,
  lighting,
  relationship: relationships,
  atmosphere: atmospheres,
  movement: movements,
  timeframe: timeframes,
  contrast: contrasts,
  constraint: constraints,
  lens: lenses,
  lightQuality: lightQualities,
  filmGrammar: filmGrammar,
  moment: moments,
  storySpine: storySpines,
};

/** Modes for which an ethics reminder is (almost) always relevant. */
const PEOPLE_MODES = new Set<Mode>([
  'Character',
  'Portrait',
  'Relationship',
  'Tension',
  'Story Starter',
  'Location Prompt',
]);

/** Number of freshness retries before we relax and accept the best candidate. */
const MAX_ATTEMPTS = 60;

export interface GenerateInput {
  /** Anonymous per-installation seed. */
  seed: string;
  /** Prompt mode selected on the dial. */
  mode: Mode;
  /** Session ordinal (increments once per app session). */
  session?: number;
  /** Total spins so far on this installation. */
  spin: number;
  location?: string;
  placeType?: PlaceType;
  storyId?: string;
  storyStage?: string;
  contextTags?: string[];
  /**
   * Optional stylistic lean. `cinematic` favours film-grammar templates;
   * `poetic` favours atmosphere-led ones; `observational` (default) uses the
   * full pool. Never passed in tests, so default behaviour is unchanged.
   */
  style?: PromptStyle;
  /** Recent prompts to stay fresh against (most recent last). */
  recent?: Pick<Prompt, 'fingerprint' | 'components'>[];
  /**
   * Optional fixed entropy. Omit in production (secure random is folded in);
   * pass a constant in tests for deterministic, reproducible sequences.
   */
  entropy?: number;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Choose an index into a bank of the given length. */
function chooseIndex(length: number, rng: Rng): number {
  return Math.floor(rng() * length);
}

/**
 * Count meaningful components that differ between two vectors. Keys present in
 * only one vector count as a difference. Used for the "three components" rule.
 */
export function componentDistance(a: ComponentVector, b: ComponentVector): number {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let d = 0;
  for (const k of keys) if (a[k] !== b[k]) d++;
  return d;
}

/** Build a stable identity string from a component vector. */
export function fingerprint(components: ComponentVector): string {
  return Object.keys(components)
    .sort()
    .map((k) => `${k}:${components[k]}`)
    .join('|');
}

/** Slots that mark a template as cinematic / film-grammar led. */
const CINEMATIC_SLOTS = new Set(['filmGrammar', 'lens', 'lightQuality', 'moment', 'storySpine']);

/**
 * Narrow a template pool to match a requested style. Falls back to the full
 * pool when the style has no matching templates, so generation never fails.
 */
function biasPool(pool: Template[], style?: PromptStyle): Template[] {
  if (!style || style === 'observational') return pool;
  const wants = (t: Template): boolean =>
    style === 'cinematic'
      ? t.slots.some((s) => CINEMATIC_SLOTS.has(s))
      : /* poetic */ t.slots.includes('atmosphere') || t.slots.includes('storySpine') || /close|ref|trace/.test(t.id);
  const subset = pool.filter(wants);
  return subset.length ? subset : pool;
}

/** Assemble a single candidate prompt from a chosen template. */
function compose(
  template: Template,
  input: GenerateInput,
  rng: Rng,
): Prompt {
  const location = sanitizeText(input.location ?? '');
  const usesLocation = location.length > 0 && input.mode !== 'General Prompt';

  // Resolve every slot the template needs, plus always-present meaningful dims.
  const components: ComponentVector = { template: template.id, mode: input.mode };
  const values: Record<string, string> = {};
  const dims = new Set([...template.slots, 'reflection', 'titleOpener', 'titleCloser']);

  for (const dim of dims) {
    if (dim === 'reflection') {
      const i = chooseIndex(reflections.length, rng);
      components.reflection = String(i);
      values.reflection = reflections[i];
      continue;
    }
    if (dim === 'titleOpener') {
      const i = chooseIndex(titleOpeners.length, rng);
      components.titleOpener = String(i);
      values.titleOpener = titleOpeners[i];
      continue;
    }
    if (dim === 'titleCloser') {
      const i = chooseIndex(titleClosers.length, rng);
      components.titleCloser = String(i);
      values.titleCloser = titleClosers[i];
      continue;
    }
    const bank = BANKS[dim];
    if (!bank) continue;
    const i = chooseIndex(bank.length, rng);
    components[dim] = String(i);
    values[dim] = bank[i];
  }

  if (input.placeType) components.placeType = input.placeType;
  if (input.storyStage) components.stage = input.storyStage;

  // Fill placeholders, including capitalized variants used at sentence start.
  const fill = (text: string): string =>
    text.replace(/\{(\w+)\}/g, (_m, token: string) => {
      if (token === 'lead') {
        return usesLocation ? `${rng() < 0.5 ? 'At' : 'In'} ${location}, ` : '';
      }
      if (token.endsWith('Cap')) {
        const base = token.slice(0, -3);
        return capitalize(values[base] ?? '');
      }
      return values[token] ?? '';
    });

  let assignment = fill(template.assignment);
  // Capitalize the first letter when there is no location lead.
  if (!usesLocation) assignment = capitalize(assignment.replace(/^\s+/, ''));

  // Fold in optional place-type orientation as gentle guidance.
  if (input.placeType && PLACE_ORIENTATION[input.placeType]) {
    const orient = PLACE_ORIENTATION[input.placeType];
    assignment += ` If it helps, ${orient[chooseIndex(orient.length, rng)]}.`;
  }

  // Fold in an optional context-tag lens when the user opted into a theme.
  const tags = input.contextTags?.filter((t) => TAG_LENS[t]) ?? [];
  let why = fill(template.why);
  if (tags.length) {
    const tag = tags[chooseIndex(tags.length, rng)];
    why += ` With your theme in mind, watch for ${TAG_LENS[tag]}.`;
  }

  const title = `${values.titleOpener} ${values.titleCloser}`.trim();
  const difficulty = difficulties[chooseIndex(difficulties.length, rng)] as Difficulty;
  const time = times[chooseIndex(times.length, rng)];
  const includeEthics = PEOPLE_MODES.has(input.mode) || rng() < 0.4;
  const ethicsLine = includeEthics
    ? ethicsBank[chooseIndex(ethicsBank.length, rng)]
    : undefined;

  return {
    id: uuid(),
    fingerprint: fingerprint(components),
    components,
    mode: input.mode,
    title,
    assignment,
    why,
    variation: fill(template.variation),
    reflection: values.reflection,
    role: input.storyStage ?? MODE_ROLE[input.mode],
    difficulty,
    time,
    ethics: ethicsLine,
    location: usesLocation ? location : undefined,
    placeType: input.placeType,
    storyStage: input.storyStage,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Generate a fresh prompt.
 *
 * The RNG seed folds together every required source of variation. A new secure
 * entropy value is drawn per call in production so the field sequence is
 * unpredictable; tests pass a fixed `entropy` to keep sequences reproducible.
 */
export function generatePrompt(input: GenerateInput): Prompt {
  const entropy = input.entropy ?? secureEntropy();
  const recent = input.recent ?? [];
  const recentFingerprints = new Set(recent.map((r) => r.fingerprint));

  let best: Prompt | undefined;
  let bestDistance = -1;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const seedString = [
      input.seed,
      input.mode,
      input.location ?? '',
      input.placeType ?? '',
      input.storyId ?? '',
      input.storyStage ?? '',
      input.session ?? 0,
      input.spin,
      entropy,
      attempt,
    ].join('|');
    const rng = rngFromString(seedString);
    const pool = biasPool(templatesFor(input.mode), input.style);
    const template = pool[Math.floor(rng() * pool.length)];
    const candidate = compose(template, input, rng);

    // Reject exact repeats outright.
    if (recentFingerprints.has(candidate.fingerprint)) continue;

    // Measure the minimum component distance to the recent 100.
    let minDistance = Infinity;
    for (const r of recent) {
      const d = componentDistance(candidate.components, r.components);
      if (d < minDistance) minDistance = d;
      if (minDistance < 3) break;
    }

    if (minDistance >= 3) return candidate;

    // Track the freshest candidate in case every attempt is crowded out.
    if (minDistance > bestDistance) {
      bestDistance = minDistance;
      best = candidate;
    }
  }

  // Relaxed fallback: combinations are nearly exhausted; return the best we saw.
  return best ?? compose(templatesFor(input.mode)[0], input, rngFromString(input.seed));
}

/**
 * Rough count of the distinct assignment-level combinations the engine can
 * produce for a mode, summed across its templates. Used in documentation and
 * tests to assert the space is large.
 */
export function combinationEstimate(mode: Mode): number {
  return templatesFor(mode).reduce((total, t) => {
    const product = t.slots.reduce((p, slot) => p * (BANKS[slot]?.length ?? 1), 1);
    // Multiply by reflection and title variation always folded in.
    return total + product * reflections.length * titleOpeners.length * titleClosers.length;
  }, 0);
}
