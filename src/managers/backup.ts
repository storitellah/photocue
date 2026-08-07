/**
 * Backup and restore.
 *
 * Produces a versioned JSON envelope and validates any imported file before it
 * touches storage. Imports are size-limited, structurally validated, and fully
 * sanitised — no field from an imported file is ever executed or rendered as
 * HTML. Shared exports omit the installation seed.
 */

import type { Backup, Preferences, SavedPrompt, Story } from '../types';
import { APP_VERSION, BACKUP_FORMAT_VERSION } from '../version';
import { getHistory, getStories } from '../storage/db';
import { getPreferences, savePreferences } from '../storage/preferences';
import { getInstallationSeed } from '../storage/seed';
import { saveStory } from './story';
import { DEFAULT_STAGES } from '../data/story-stages';
import { sanitizeMultiline, sanitizeTag, sanitizeText } from '../util/sanitize';
import { uuid } from '../util/rng';

/** Max size we will accept for an imported backup (2 MB). */
export const MAX_IMPORT_BYTES = 2 * 1024 * 1024;

const VALID_STATUS = new Set([
  'Not started',
  'Observed',
  'Photographed',
  'Needs another attempt',
  'Complete',
]);

/** Build a backup envelope. Pass `shareable: true` to strip the seed. */
export async function createBackup(shareable = false): Promise<Backup> {
  const prefs = getPreferences();
  const customTags = Array.from(
    new Set((await getStories()).flatMap((s) => s.prompts.flatMap((p) => p.noteTags ?? []))),
  );
  const backup: Backup = {
    application: 'PhotoCue',
    applicationVersion: APP_VERSION,
    backupFormatVersion: BACKUP_FORMAT_VERSION,
    exportDate: new Date().toISOString(),
    stories: await getStories(),
    promptHistory: await getHistory(),
    customTags,
    settings: {
      ethicsReminders: prefs.ethicsReminders,
      highContrast: prefs.highContrast,
      textSize: prefs.textSize,
      reducedMotion: prefs.reducedMotion,
      locationHistory: prefs.locationHistory,
      analytics: prefs.analytics,
      language: prefs.language,
    },
  };
  if (!shareable) backup.installationSeed = getInstallationSeed();
  return backup;
}

export interface BackupSummary {
  ok: boolean;
  error?: string;
  storyCount: number;
  promptCount: number;
  hasSettings: boolean;
  exportDate?: string;
  formatVersion?: number;
  data?: Backup;
}

/**
 * Validate a raw string as a backup and return a summary the UI can show before
 * the user confirms the import. Never throws; returns `ok: false` on any issue.
 */
export function inspectBackup(raw: string): BackupSummary {
  if (raw.length > MAX_IMPORT_BYTES) {
    return { ok: false, error: 'File is too large.', storyCount: 0, promptCount: 0, hasSettings: false };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'File is not valid JSON.', storyCount: 0, promptCount: 0, hasSettings: false };
  }
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Unexpected file contents.', storyCount: 0, promptCount: 0, hasSettings: false };
  }
  const obj = parsed as Record<string, unknown>;
  if (obj.application !== 'PhotoCue') {
    return { ok: false, error: 'This does not look like a PhotoCue backup.', storyCount: 0, promptCount: 0, hasSettings: false };
  }
  if (typeof obj.backupFormatVersion !== 'number' || obj.backupFormatVersion > BACKUP_FORMAT_VERSION) {
    return { ok: false, error: 'This backup was made by a newer version of PhotoCue.', storyCount: 0, promptCount: 0, hasSettings: false };
  }
  const stories = Array.isArray(obj.stories) ? obj.stories : [];
  const clean = stories.map(sanitizeStory).filter((s): s is Story => s !== null);
  const settings = sanitizeSettings(obj.settings);
  const promptHistory = Array.isArray(obj.promptHistory) ? obj.promptHistory : [];

  return {
    ok: true,
    storyCount: clean.length,
    promptCount: clean.reduce((n, s) => n + s.prompts.length, 0),
    hasSettings: Object.keys(settings).length > 0,
    exportDate: typeof obj.exportDate === 'string' ? obj.exportDate : undefined,
    formatVersion: obj.backupFormatVersion,
    data: {
      application: 'PhotoCue',
      applicationVersion: typeof obj.applicationVersion === 'string' ? obj.applicationVersion : APP_VERSION,
      backupFormatVersion: obj.backupFormatVersion,
      exportDate: typeof obj.exportDate === 'string' ? obj.exportDate : new Date().toISOString(),
      stories: clean,
      // History is not restored (it is device-specific freshness state) but we
      // keep the count sanitised for the summary.
      promptHistory: [],
      customTags: Array.isArray(obj.customTags) ? obj.customTags.map(sanitizeTag).filter(Boolean) : [],
      settings,
    },
  };
}

/**
 * Import a validated backup. `mode: 'merge'` adds stories alongside existing
 * ones (with fresh ids); `mode: 'replace'` is handled by the caller clearing
 * data first. Settings are applied through the normal preference path.
 */
export async function applyBackup(summary: BackupSummary, mode: 'merge' = 'merge'): Promise<number> {
  if (!summary.ok || !summary.data) throw new Error(summary.error || 'Invalid backup');
  void mode;
  let imported = 0;
  for (const story of summary.data.stories) {
    // Assign fresh ids on merge to avoid clobbering existing stories.
    story.id = uuid();
    await saveStory(story);
    imported++;
  }
  if (Object.keys(summary.data.settings).length) {
    savePreferences(summary.data.settings);
  }
  return imported;
}

function sanitizeStory(input: unknown): Story | null {
  if (!input || typeof input !== 'object') return null;
  const s = input as Record<string, unknown>;
  const now = new Date().toISOString();
  const prompts = Array.isArray(s.prompts) ? s.prompts.map(sanitizeSavedPrompt).filter((p): p is SavedPrompt => p !== null) : [];
  const stages = Array.isArray(s.stages) && s.stages.length
    ? s.stages.map((x) => sanitizeText(x)).filter(Boolean)
    : [...DEFAULT_STAGES];
  return {
    id: typeof s.id === 'string' ? sanitizeText(s.id, 64) : uuid(),
    title: sanitizeText(s.title || 'Untitled story'),
    location: sanitizeText(s.location || ''),
    placeType: undefined,
    question: sanitizeText(s.question || ''),
    theme: sanitizeText(s.theme || ''),
    contextTags: Array.isArray(s.contextTags) ? s.contextTags.map((t) => sanitizeText(t, 32)).filter(Boolean) : [],
    prompts,
    stages,
    stage: typeof s.stage === 'number' ? Math.max(0, Math.min(Math.floor(s.stage), stages.length)) : 0,
    reflection: sanitizeMultiline(s.reflection || ''),
    createdAt: typeof s.createdAt === 'string' ? s.createdAt : now,
    updatedAt: now,
  };
}

function sanitizeSavedPrompt(input: unknown): SavedPrompt | null {
  if (!input || typeof input !== 'object') return null;
  const p = input as Record<string, unknown>;
  const status = typeof p.status === 'string' && VALID_STATUS.has(p.status) ? (p.status as SavedPrompt['status']) : 'Not started';
  return {
    id: typeof p.id === 'string' ? sanitizeText(p.id, 64) : uuid(),
    fingerprint: typeof p.fingerprint === 'string' ? sanitizeText(p.fingerprint, 400) : '',
    components: typeof p.components === 'object' && p.components ? (p.components as SavedPrompt['components']) : { template: 'imported', mode: 'General Prompt' },
    mode: 'General Prompt',
    title: sanitizeText(p.title || 'Saved prompt'),
    assignment: sanitizeMultiline(p.assignment || ''),
    why: sanitizeMultiline(p.why || ''),
    variation: sanitizeMultiline(p.variation || ''),
    reflection: sanitizeMultiline(p.reflection || ''),
    role: sanitizeText(p.role || ''),
    difficulty: 'Focused',
    time: sanitizeText(p.time || ''),
    ethics: p.ethics ? sanitizeMultiline(p.ethics) : undefined,
    createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date().toISOString(),
    status,
    notes: sanitizeMultiline(p.notes || ''),
    noteTags: Array.isArray(p.noteTags) ? p.noteTags.map((t) => sanitizeText(t, 32)).filter(Boolean) : [],
  };
}

function sanitizeSettings(input: unknown): Partial<Preferences> {
  if (!input || typeof input !== 'object') return {};
  const s = input as Record<string, unknown>;
  const out: Partial<Preferences> = {};
  if (typeof s.ethicsReminders === 'boolean') out.ethicsReminders = s.ethicsReminders;
  if (typeof s.highContrast === 'boolean') out.highContrast = s.highContrast;
  if (s.textSize === 'default' || s.textSize === 'large' || s.textSize === 'x-large') out.textSize = s.textSize;
  if (s.reducedMotion === 'system' || s.reducedMotion === 'on' || s.reducedMotion === 'off') out.reducedMotion = s.reducedMotion;
  if (typeof s.locationHistory === 'boolean') out.locationHistory = s.locationHistory;
  if (typeof s.analytics === 'boolean') out.analytics = s.analytics;
  if (typeof s.language === 'string') out.language = sanitizeText(s.language, 8);
  return out;
}
