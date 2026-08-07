/**
 * Small preferences kept in localStorage.
 *
 * Only lightweight, non-sensitive settings live here (never stories or notes).
 * Everything is namespaced under `pc-` and read through a typed accessor so the
 * rest of the app never touches localStorage directly.
 */

import type { Preferences } from '../types';
import { sanitizeText } from '../util/sanitize';

const KEY = 'pc-preferences';

export const DEFAULT_PREFERENCES: Preferences = {
  location: '',
  placeType: '',
  contextTags: [],
  mode: 'General Prompt',
  ethicsReminders: true,
  highContrast: false,
  textSize: 'default',
  reducedMotion: 'system',
  locationHistory: true,
  analytics: false,
  language: 'en',
};

let cache: Preferences | undefined;

export function getPreferences(): Preferences {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw
      ? { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<Preferences>) }
      : { ...DEFAULT_PREFERENCES };
  } catch {
    cache = { ...DEFAULT_PREFERENCES };
  }
  return cache;
}

export function savePreferences(patch: Partial<Preferences>): Preferences {
  const next = { ...getPreferences(), ...patch };
  // Guard the free-text field even here.
  next.location = sanitizeText(next.location);
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage may be unavailable in private mode; app still works in-memory */
  }
  return next;
}

export function clearPreferences(): void {
  cache = undefined;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** Remove only saved location data, honouring the privacy control. */
export function clearLocationData(): void {
  savePreferences({ location: '', placeType: '', contextTags: [] });
}
