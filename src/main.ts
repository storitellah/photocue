/**
 * PhotoCue bootstrap.
 *
 * Wires together the storage layer, i18n, PWA lifecycle, and the app
 * controller. Everything the first screen needs is synchronous; heavier work
 * (demo seeding, service worker) runs after the UI is interactive so the
 * spinner is usable immediately.
 */

import './style.css';
import { App } from './ui/app';
import { getPreferences } from './storage/preferences';
import { setLocale } from './i18n';
import { getStories, putStory, getMeta, setMeta } from './storage/db';
import { createDemoStory } from './data/demo';
import { getInstallationSeed } from './storage/seed';
import { initPwa } from './pwa/register';

async function seedDemoOnce(): Promise<void> {
  try {
    const seeded = await getMeta<boolean>('demoSeeded');
    if (seeded) return;
    const existing = await getStories();
    if (existing.length === 0) {
      await putStory(createDemoStory());
    }
    await setMeta('demoSeeded', true);
  } catch {
    /* demo is a nicety, never block startup on it */
  }
}

function bootstrap(): void {
  const root = document.getElementById('app');
  if (!root) return;

  const prefs = getPreferences();
  setLocale(prefs.language);

  // Ensure an installation seed exists (used by the engine and, optionally, backups).
  getInstallationSeed();

  const app = new App(root);
  app.applyPrefsToDocument();

  initPwa({
    onUpdate: () => app.notifyUpdate(),
    onInstallable: () => app.refreshInstallButton(),
  });

  // Non-blocking startup work.
  void seedDemoOnce();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
