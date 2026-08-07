/**
 * Settings view: display preferences, local-data controls, ethics section,
 * privacy statement, workshop launcher, and language. All settings are local
 * and take effect immediately.
 */

import { escapeHtml } from '../util/sanitize';
import { getPreferences, savePreferences } from '../storage/preferences';
import { on, qs } from './dom';
import { t } from '../i18n';
import { AVAILABLE_LOCALES, setLocale } from '../i18n';
import { APP_VERSION } from '../version';

export interface SettingsHandlers {
  exportBackup: () => void;
  importBackup: (file: File) => void;
  deleteAll: () => void;
  clearLocation: () => void;
  openWorkshop: () => void;
  onChange: () => void;
}

const ETHICS_POINTS = [
  'Ask for consent when appropriate.',
  'Do not pressure someone to participate.',
  'Do not ask people to repeat sensitive actions.',
  'Avoid revealing private information.',
  'Consider how the image may affect the person photographed.',
  'Do not expose the location of vulnerable people.',
  'Distinguish observation from staging.',
  'Explain how the image may be used.',
  'Give people room to decline.',
  'Do not use stereotypes as shortcuts.',
];

export function renderSettings(): string {
  const s = t();
  const prefs = getPreferences();
  const toggle = (id: string, label: string, help: string, checked: boolean) => `
    <label class="setting-row">
      <span class="setting-text"><span class="setting-label">${escapeHtml(label)}</span><small>${escapeHtml(help)}</small></span>
      <input type="checkbox" id="${id}" class="switch" ${checked ? 'checked' : ''}>
    </label>`;

  return `
  <section class="page settings">
    <p class="eyebrow">${escapeHtml(s.settings.eyebrow)}</p>
    <h1>${escapeHtml(s.settings.title)}</h1>

    <div class="settings-group">
      ${toggle('set-ethics', s.settings.ethics, s.settings.ethicsHelp, prefs.ethicsReminders)}
      ${toggle('set-contrast', s.settings.contrast, s.settings.contrastHelp, prefs.highContrast)}
      <label class="setting-row">
        <span class="setting-text"><span class="setting-label">${escapeHtml(s.settings.textSize)}</span></span>
        <select id="set-text-size" class="field-select">
          <option value="default" ${prefs.textSize === 'default' ? 'selected' : ''}>Default</option>
          <option value="large" ${prefs.textSize === 'large' ? 'selected' : ''}>Large</option>
          <option value="x-large" ${prefs.textSize === 'x-large' ? 'selected' : ''}>Extra large</option>
        </select>
      </label>
      <label class="setting-row">
        <span class="setting-text"><span class="setting-label">${escapeHtml(s.settings.motion)}</span></span>
        <select id="set-motion" class="field-select">
          <option value="system" ${prefs.reducedMotion === 'system' ? 'selected' : ''}>${escapeHtml(s.settings.motionSystem)}</option>
          <option value="on" ${prefs.reducedMotion === 'on' ? 'selected' : ''}>${escapeHtml(s.settings.motionOn)}</option>
          <option value="off" ${prefs.reducedMotion === 'off' ? 'selected' : ''}>${escapeHtml(s.settings.motionOff)}</option>
        </select>
      </label>
      <label class="setting-row">
        <span class="setting-text"><span class="setting-label">${escapeHtml(s.settings.language)}</span></span>
        <select id="set-language" class="field-select">
          ${AVAILABLE_LOCALES.map((l) => `<option value="${l.code}" ${prefs.language === l.code ? 'selected' : ''}>${escapeHtml(l.name)}${l.code === 'en' ? '' : ' (soon)'}</option>`).join('')}
        </select>
      </label>
    </div>

    <div class="settings-group">
      <h2>${escapeHtml(s.settings.dataHeading)}</h2>
      <p class="muted">${escapeHtml(s.settings.dataBlurb)}</p>
      ${toggle('set-loc-history', s.settings.locationHistory, 'Keep your last place between sessions.', prefs.locationHistory)}
      ${toggle('set-analytics', s.settings.analytics, s.settings.analyticsHelp, prefs.analytics)}
      <div class="button-row">
        <button class="btn-secondary" id="set-export">${escapeHtml(s.settings.exportBackup)}</button>
        <label class="btn-secondary file-button">${escapeHtml(s.settings.importBackup)}<input type="file" id="set-import" accept="application/json" hidden></label>
        <button class="btn-secondary" id="set-clear-location">${escapeHtml(s.settings.clearLocation)}</button>
        <button class="btn-danger" id="set-delete">${escapeHtml(s.settings.deleteAll)}</button>
      </div>
    </div>

    <div class="settings-group">
      <h2>${escapeHtml(s.settings.workshop)}</h2>
      <p class="muted">Generate a different assignment for each participant around a shared theme — for photography educators and facilitators.</p>
      <button class="btn-secondary" id="set-workshop">Open Workshop mode →</button>
    </div>

    <div class="settings-group">
      <h2>${escapeHtml(s.settings.ethicsSection)}</h2>
      <ul class="ethics-list">
        ${ETHICS_POINTS.map((p) => `<li>${escapeHtml(p)}</li>`).join('')}
      </ul>
      <p class="muted">Essential safety reminders stay active even when ethics reminders are hidden on cards.</p>
    </div>

    <div class="settings-group about">
      <h2>${escapeHtml(s.settings.about)}</h2>
      <p class="muted">PhotoCue ${escapeHtml(APP_VERSION)} — by Storitellah. One tap. One place. One story.</p>
      <p class="muted">No account. No advertising. No trackers. Open source.</p>
      <p><a href="https://github.com/storitellah/photocue" rel="noopener">Source &amp; contributions on GitHub</a></p>
    </div>
  </section>`;
}

export function bindSettings(h: SettingsHandlers): void {
  const change = () => h.onChange();
  on(qs<HTMLInputElement>('#set-ethics'), 'change', (e) => {
    savePreferences({ ethicsReminders: (e.target as HTMLInputElement).checked });
    change();
  });
  on(qs<HTMLInputElement>('#set-contrast'), 'change', (e) => {
    savePreferences({ highContrast: (e.target as HTMLInputElement).checked });
    change();
  });
  on(qs<HTMLSelectElement>('#set-text-size'), 'change', (e) => {
    savePreferences({ textSize: (e.target as HTMLSelectElement).value as 'default' | 'large' | 'x-large' });
    change();
  });
  on(qs<HTMLSelectElement>('#set-motion'), 'change', (e) => {
    savePreferences({ reducedMotion: (e.target as HTMLSelectElement).value as 'system' | 'on' | 'off' });
    change();
  });
  on(qs<HTMLSelectElement>('#set-language'), 'change', (e) => {
    const code = (e.target as HTMLSelectElement).value;
    savePreferences({ language: code });
    setLocale(code);
    change();
  });
  on(qs<HTMLInputElement>('#set-loc-history'), 'change', (e) => {
    const on2 = (e.target as HTMLInputElement).checked;
    savePreferences({ locationHistory: on2 });
    if (!on2) h.clearLocation();
  });
  on(qs<HTMLInputElement>('#set-analytics'), 'change', (e) =>
    savePreferences({ analytics: (e.target as HTMLInputElement).checked }),
  );
  on(qs('#set-export'), 'click', () => h.exportBackup());
  on(qs<HTMLInputElement>('#set-import'), 'change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) h.importBackup(file);
  });
  on(qs('#set-clear-location'), 'click', () => h.clearLocation());
  on(qs('#set-delete'), 'click', () => h.deleteAll());
  on(qs('#set-workshop'), 'click', () => h.openWorkshop());
}
