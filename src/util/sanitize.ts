/**
 * Text safety utilities.
 *
 * PhotoCue renders user-entered text (locations, notes, story titles) and
 * imported backup content. Every value that reaches the DOM goes through
 * `escapeHtml`; every value stored goes through `sanitizeText` first so we
 * never persist control characters or oversized strings.
 */

/** Max length for a short single-line field such as a location. */
export const SHORT_FIELD_MAX = 120;
/** Max length for a multi-line field such as a field note. */
export const LONG_FIELD_MAX = 4000;

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '`': '&#96;',
};

// Control characters excluding common whitespace we handle separately.
// (NUL-BS, VT, FF, SO-US, DEL; newline \x0A and tab \x09 are preserved.)
const CONTROL = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/**
 * Escape a string for safe insertion into HTML text or attribute context.
 * This is the single choke point used by the interface; nothing builds
 * markup from raw user input without passing through here.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"'`]/g, (c) => HTML_ENTITIES[c]);
}

/**
 * Normalise and bound a short single-line value. Strips angle brackets and
 * control characters, collapses whitespace, and trims to a safe length.
 */
export function sanitizeText(value: unknown, max = SHORT_FIELD_MAX): string {
  return String(value ?? '')
    .replace(CONTROL, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/**
 * Normalise a multi-line value (field notes). Preserves line breaks but still
 * removes angle brackets and other control characters.
 */
export function sanitizeMultiline(value: unknown, max = LONG_FIELD_MAX): string {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(CONTROL, '')
    .replace(/[<>]/g, '')
    .slice(0, max)
    .trim();
}

/** Validate and normalise a user-supplied tag. Returns '' if invalid. */
export function sanitizeTag(value: unknown): string {
  return sanitizeText(value, 32).toLowerCase().replace(/[^a-z0-9\- ]/g, '');
}
