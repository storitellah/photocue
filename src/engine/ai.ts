/**
 * Optional AI prompt generation.
 *
 * This is a thin, defensive client for the same-origin `/api/generate`
 * Cloudflare Pages Function (see `functions/api/generate.ts`). It is *never*
 * required: the app ships with the fully offline compositional engine as the
 * default and the guaranteed fallback. AI is opt-in (Settings) and every
 * failure mode — offline, missing binding, timeout, malformed response — is
 * caught here so the caller can fall back to the local engine silently.
 *
 * Privacy: only the fields needed to compose a prompt are sent (mode, optional
 * place text, place type, themes, style). No identifiers, no history, no
 * account. The request is same-origin, so the app's strict CSP
 * (`connect-src 'self'`) already permits it with no relaxation.
 */

import type { Mode, PlaceType, Prompt, PromptStyle } from '../types';
import { MODE_ROLE } from '../data/modes';
import { sanitizeText } from '../util/sanitize';
import { uuid } from '../util/rng';
import { fingerprint } from './prompt-engine';

/** Endpoint served by the Cloudflare Pages Function. Same origin. */
const ENDPOINT = '/api/generate';

/** Hard ceiling so a slow model never blocks the field workflow. */
const TIMEOUT_MS = 9000;

export interface AiRequest {
  mode: Mode;
  location?: string;
  placeType?: PlaceType;
  contextTags?: string[];
  style?: PromptStyle;
}

/** The minimal JSON contract we accept back from the service. */
interface AiPayload {
  title?: unknown;
  assignment?: unknown;
  why?: unknown;
  variation?: unknown;
  reflection?: unknown;
}

function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? sanitizeText(value) : fallback;
}

/**
 * Whether it is even worth attempting an AI call right now. Cheap synchronous
 * checks only; the network call itself still guards every failure.
 */
export function aiAvailable(): boolean {
  return (
    typeof fetch === 'function' &&
    typeof navigator !== 'undefined' &&
    navigator.onLine !== false
  );
}

/**
 * Ask the AI service for a prompt. Resolves to a fully-formed {@link Prompt} on
 * success, or `null` on any failure so the caller falls back to the engine.
 */
export async function generatePromptAI(req: AiRequest): Promise<Prompt | null> {
  if (!aiAvailable()) return null;

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), TIMEOUT_MS) : null;

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        mode: req.mode,
        location: req.location ? sanitizeText(req.location) : undefined,
        placeType: req.placeType,
        contextTags: req.contextTags,
        style: req.style ?? 'observational',
      }),
      signal: controller?.signal,
    });
    if (!res.ok) return null;

    const data = (await res.json()) as AiPayload;
    const assignment = str(data.assignment);
    // A usable prompt must at least have a real assignment.
    if (assignment.length < 20) return null;

    const usesLocation = Boolean(req.location) && req.mode !== 'General Prompt';
    const components = { template: 'ai', mode: req.mode, ai: uuid() };

    return {
      id: uuid(),
      fingerprint: fingerprint(components),
      components,
      mode: req.mode,
      title: str(data.title, 'A Frame to Find'),
      assignment,
      why: str(data.why, 'A considered frame here can move the story forward.'),
      variation: str(data.variation, 'Try the same subject from another distance.'),
      reflection: str(data.reflection, 'What stays just outside the frame?'),
      role: MODE_ROLE[req.mode],
      difficulty: 'Focused',
      time: '20–30 min',
      location: usesLocation ? sanitizeText(req.location!) : undefined,
      placeType: req.placeType,
      createdAt: new Date().toISOString(),
      source: 'ai',
    };
  } catch {
    // Network error, abort/timeout, or malformed JSON — fall back silently.
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
