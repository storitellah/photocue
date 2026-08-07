/**
 * Minimal i18n manager.
 *
 * English is bundled; other languages register lazily. The app reads strings
 * through `t()` and sets document direction from the active locale so RTL
 * languages (Arabic) lay out correctly. Prompt text is generated separately by
 * the engine, so no interface text is ever embedded inside images.
 */

import { en, type Strings } from './en';

export const AVAILABLE_LOCALES: { code: string; name: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', name: 'English', dir: 'ltr' },
  // Prepared for future translations — each ships as its own dictionary.
  { code: 'sw', name: 'Kiswahili', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'pt', name: 'Português', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'am', name: 'አማርኛ', dir: 'ltr' },
];

const dictionaries: Record<string, Strings> = { en };
let active: string = 'en';

export function setLocale(code: string): void {
  active = dictionaries[code] ? code : 'en';
  const meta = AVAILABLE_LOCALES.find((l) => l.code === active);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = active;
    document.documentElement.dir = meta?.dir ?? 'ltr';
  }
}

export function getLocale(): string {
  return active;
}

/** The active string dictionary. Falls back to English for missing locales. */
export function t(): Strings {
  return dictionaries[active] ?? en;
}
