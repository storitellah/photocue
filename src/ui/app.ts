/**
 * Application controller.
 *
 * Owns view routing and event wiring. Rendering is delegated to the pure
 * component functions; persistence to the managers. The controller never talks
 * to IndexedDB or localStorage directly — it goes through the storage/managers
 * layer so the data rules (sanitisation, migrations, freshness) stay in one
 * place.
 */

import type { Mode, PlaceType, Prompt, PromptStatus, Story } from '../types';
import { generatePrompt } from '../engine';
import { MODES, MODE_DESCRIPTION } from '../data/modes';
import { addHistory, getRecentHistory } from '../storage/db';
import { getPreferences, savePreferences, clearLocationData } from '../storage/preferences';
import { getInstallationSeed } from '../storage/seed';
import { clearAllData } from '../storage/db';
import {
  listStories,
  newStory,
  saveStory,
  savePromptToStory,
  setPromptStatus,
  setPromptNote,
  reorderPrompts,
  removePrompt,
  removeStory,
  modeForStage,
} from '../managers/story';
import { requestApproxLocation, LOCATION_CONSENT } from '../managers/location';
import { createBackup, inspectBackup, applyBackup } from '../managers/backup';
import { storyToText, storyToMarkdown } from '../export/text';
import { exportStoryPdf } from '../export/pdf';
import { promptToImage } from '../export/image';
import { download } from '../util/download';
import { escapeHtml, sanitizeText } from '../util/sanitize';
import { announce, on, prefersReducedMotion, qs, qsa } from './dom';
import {
  header,
  nav,
  dial,
  modeSelect,
  placeTypeSelect,
  contextTags,
  promptCard,
  storyPath,
  emptyState,
} from './components';
import { renderSettings, bindSettings } from './settings-view';
import { renderWorkshop, bindWorkshop } from './workshop-view';
import { canInstall, promptInstall, applyUpdate } from '../pwa/register';
import { t } from '../i18n';

type View = 'spin' | 'stories' | 'saved' | 'settings' | 'workshop';

const LAST_PROMPT_KEY = 'pc-last-prompt';
const SESSION_KEY = 'pc-session';
const SPIN_KEY = 'pc-spins';
const ACTIVE_STORY_KEY = 'pc-active-story';

export class App {
  private root: HTMLElement;
  private view: View = 'spin';
  private current?: Prompt;
  private session = 0;
  private spins = 0;
  private updateReady = false;

  constructor(root: HTMLElement) {
    this.root = root;
    this.session = this.bumpSession();
    this.spins = Number(sessionStorage.getItem(SPIN_KEY) || 0);
    this.restoreLastPrompt();
    window.addEventListener('hashchange', () => this.syncFromHash());
    window.addEventListener('keydown', (e) => this.onGlobalKey(e));
    this.syncFromHash(false);
  }

  // ---- lifecycle ----------------------------------------------------------

  private bumpSession(): number {
    const n = Number(localStorage.getItem(SESSION_KEY) || 0) + 1;
    try {
      localStorage.setItem(SESSION_KEY, String(n));
    } catch {
      /* ignore */
    }
    return n;
  }

  private restoreLastPrompt(): void {
    try {
      const raw = sessionStorage.getItem(LAST_PROMPT_KEY);
      if (raw) this.current = JSON.parse(raw) as Prompt;
    } catch {
      /* ignore */
    }
  }

  private syncFromHash(render = true): void {
    const hash = location.hash.replace(/^#\/?/, '');
    const v = (['spin', 'stories', 'saved', 'settings', 'workshop'].includes(hash) ? hash : 'spin') as View;
    this.view = v;
    if (render) this.render();
    else this.render();
  }

  navigate(view: View): void {
    if (location.hash !== `#/${view}`) {
      location.hash = `#/${view}`;
    } else {
      this.view = view;
      this.render();
    }
  }

  notifyUpdate(): void {
    this.updateReady = true;
    this.render();
  }

  refreshInstallButton(): void {
    const btn = qs<HTMLButtonElement>('#install-button');
    if (btn) btn.hidden = !canInstall();
  }

  // ---- rendering ----------------------------------------------------------

  private shell(content: string): void {
    const s = t();
    this.root.innerHTML = `
      ${this.updateReady ? `<div class="update-banner" role="status"><span>${escapeHtml(s.install.update)}</span><button id="update-apply" class="btn-secondary">${escapeHtml(s.install.updateAction)}</button></div>` : ''}
      ${header()}
      <main id="main" class="view view-${this.view}" tabindex="-1">${content}</main>
      ${nav(this.view)}
      <div class="sr-only" aria-live="polite" id="announce"></div>
      <dialog id="modal" class="modal"></dialog>`;

    qsa<HTMLButtonElement>('[data-view]').forEach((b) =>
      on(b, 'click', () => this.navigate(b.dataset.view as View)),
    );
    on(qs('#install-button'), 'click', async () => {
      await promptInstall();
      this.refreshInstallButton();
    });
    on(qs('#update-apply'), 'click', () => applyUpdate());
    this.refreshInstallButton();
  }

  private render(): void {
    switch (this.view) {
      case 'stories':
        return void this.renderStories(false);
      case 'saved':
        return void this.renderStories(true);
      case 'settings':
        return this.renderSettingsView();
      case 'workshop':
        return this.renderWorkshopView();
      default:
        return this.renderSpin();
    }
  }

  // ---- spin view ----------------------------------------------------------

  private renderSpin(): void {
    const prefs = getPreferences();
    const s = t();
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    this.shell(`
      <section class="intro">
        <p class="eyebrow">${escapeHtml(s.spin.eyebrow)}</p>
        <h1 class="display">${escapeHtml(s.spin.headingA)}<br><em>${escapeHtml(s.spin.headingB)}</em></h1>
        <p class="lede">${escapeHtml(s.spin.intro)}</p>
      </section>
      ${offline ? `<p class="offline-note" role="status">${escapeHtml(s.spin.offline)}</p>` : ''}
      <section class="controls" aria-label="Prompt controls">
        <label class="field-label" for="location">${escapeHtml(s.spin.enterPlace)}</label>
        <div class="location-row">
          <input id="location" class="field-input" type="text" inputmode="text" autocomplete="off"
            value="${escapeHtml(prefs.location)}" placeholder="${escapeHtml(s.spin.placePlaceholder)}" maxlength="120">
          <button id="locate" class="icon-button" aria-label="${escapeHtml(s.spin.useLocation)}" title="${escapeHtml(s.spin.useLocation)}">
            <span aria-hidden="true">⌖</span>
          </button>
        </div>
        <div class="control-grid">
          <div>${modeSelect(prefs.mode)}</div>
          <div>${placeTypeSelect(prefs.placeType)}</div>
        </div>
        <details class="theme-details"><summary>${escapeHtml(s.spin.themeTags)}</summary>${contextTags(prefs.contextTags)}</details>
      </section>
      ${dial()}
      <div id="prompt-slot" aria-live="polite">${this.current ? promptCard(this.current, { showEthics: prefs.ethicsReminders }) : ''}</div>
      <section class="landing">
        <div class="feature-grid">
          <article><span class="feat-num">01</span><h3>Made for the field</h3><p>Fast, focused prompts built for careful observation, fully offline.</p></article>
          <article><span class="feat-num">02</span><h3>Shape a full story</h3><p>A flexible path from opening image to closing frame.</p></article>
          <article><span class="feat-num">03</span><h3>Private by default</h3><p>No account. Your stories and notes stay on this device.</p></article>
        </div>
        <footer class="site-footer">
          <p class="privacy-note">Your stories, notes, locations, and prompt history stay on this device. No account, no advertising, no trackers.</p>
          <p><a href="https://github.com/storitellah/photocue" rel="noopener">Open source on GitHub</a> · <a href="#/settings">Privacy &amp; data controls</a></p>
          <p class="attribution">PhotoCue by Storitellah — designed for documentary photographers and visual storytellers.</p>
        </footer>
      </section>`);

    this.bindSpin();
    if (this.current) this.bindCard();
  }

  private bindSpin(): void {
    on(qs('#spin-button'), 'click', () => this.spin());
    on(qs('#dial'), 'click', () => this.spin());
    // Swipe on the dial also spins.
    const dialEl = qs('#dial');
    if (dialEl) {
      let startX = 0;
      on(dialEl, 'pointerdown', (e) => (startX = (e as PointerEvent).clientX));
      on(dialEl, 'pointerup', (e) => {
        if (Math.abs((e as PointerEvent).clientX - startX) > 24) this.spin();
      });
    }

    const modeEl = qs<HTMLSelectElement>('#mode');
    on(modeEl, 'change', () => {
      const mode = modeEl!.value as Mode;
      savePreferences({ mode });
      const help = qs('#mode-help');
      if (help) help.textContent = MODE_DESCRIPTION[mode];
    });
    on(qs<HTMLSelectElement>('#place-type'), 'change', (e) =>
      savePreferences({ placeType: (e.target as HTMLSelectElement).value as PlaceType | '' }),
    );
    on(qs<HTMLInputElement>('#location'), 'change', (e) =>
      savePreferences({ location: sanitizeText((e.target as HTMLInputElement).value) }),
    );
    qsa<HTMLInputElement>('input[name="tag"]').forEach((cb) =>
      on(cb, 'change', () => {
        const tags = qsa<HTMLInputElement>('input[name="tag"]:checked').map((x) => x.value);
        savePreferences({ contextTags: tags });
      }),
    );
    on(qs('#locate'), 'click', () => this.useLocation());
  }

  private async useLocation(): Promise<void> {
    if (!confirm(LOCATION_CONSENT)) return;
    const result = await requestApproxLocation();
    if (result.ok && result.label) {
      const input = qs<HTMLInputElement>('#location');
      if (input) input.value = result.label;
      savePreferences({ location: result.label });
      announce('Approximate location set.');
    } else {
      announce(result.reason || 'Location unavailable.');
      alert(result.reason || 'Location unavailable.');
    }
  }

  private async spin(): Promise<void> {
    const prefs = getPreferences();
    const location = sanitizeText((qs<HTMLInputElement>('#location')?.value ?? prefs.location) || '');
    const mode = (qs<HTMLSelectElement>('#mode')?.value as Mode) || prefs.mode;
    const placeType = (qs<HTMLSelectElement>('#place-type')?.value as PlaceType | '') || prefs.placeType;
    const tags = qsa<HTMLInputElement>('input[name="tag"]:checked').map((x) => x.value);
    savePreferences({ location, mode, placeType, contextTags: tags });

    this.spins++;
    sessionStorage.setItem(SPIN_KEY, String(this.spins));

    const recent = await getRecentHistory(100);
    const prompt = generatePrompt({
      seed: getInstallationSeed(),
      mode,
      session: this.session,
      spin: this.spins,
      location: location || undefined,
      placeType: placeType || undefined,
      contextTags: tags,
      recent,
    });
    this.current = prompt;
    try {
      sessionStorage.setItem(LAST_PROMPT_KEY, JSON.stringify(prompt));
    } catch {
      /* ignore quota */
    }
    await addHistory(prompt);

    // Guard against the rare case where the document is gone by the time this
    // async continuation resumes (e.g. a torn-down test environment). In a real
    // browser `document` always exists, so this is a no-op in production.
    if (typeof document === 'undefined') return;

    // Render the card immediately — never wait on animation.
    const slot = qs('#prompt-slot');
    if (slot) slot.innerHTML = promptCard(prompt, { showEthics: prefs.ethicsReminders });
    this.bindCard();

    // Motion is decorative and optional.
    const dialEl = qs('.dial');
    if (dialEl && !prefersReducedMotion(prefs.reducedMotion)) {
      dialEl.classList.remove('spinning');
      void (dialEl as HTMLElement).offsetWidth; // reflow to restart animation
      dialEl.classList.add('spinning');
    }
    this.haptic();
    announce(`New prompt: ${prompt.title}. ${prompt.assignment}`);
    const card = qs<HTMLElement>('.prompt-card');
    card?.focus({ preventScroll: true });
    if (typeof card?.scrollIntoView === 'function') {
      card.scrollIntoView({ behavior: prefersReducedMotion(prefs.reducedMotion) ? 'auto' : 'smooth', block: 'nearest' });
    }
  }

  private async haptic(): Promise<void> {
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // Fall back to the Vibration API on supporting browsers.
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(8);
    }
  }

  private bindCard(): void {
    on(qs('#card-again'), 'click', () => this.spin());
    on(qs('#card-save'), 'click', () => this.saveCurrent());
    on(qs('#card-copy'), 'click', () => this.copyCurrent());
    on(qs('#card-share'), 'click', () => this.shareCurrent());
  }

  private async saveCurrent(): Promise<void> {
    if (!this.current) return;
    const prefs = getPreferences();
    let activeId = localStorage.getItem(ACTIVE_STORY_KEY) || '';
    const stories = await listStories();
    let story = stories.find((s) => s.id === activeId);
    if (!story) {
      story = newStory({
        title: prefs.location ? `${prefs.location} story` : 'My photo story',
        location: prefs.location,
        placeType: prefs.placeType || undefined,
        contextTags: prefs.contextTags,
      });
      await saveStory(story);
      activeId = story.id;
      localStorage.setItem(ACTIVE_STORY_KEY, activeId);
    }
    const { nextStage } = await savePromptToStory(story.id, this.current);
    const btn = qs<HTMLButtonElement>('#card-save');
    if (btn) {
      btn.classList.add('is-saved');
      btn.setAttribute('aria-pressed', 'true');
      btn.innerHTML = `<span aria-hidden="true">✓</span> ${escapeHtml(t().card.saved)}`;
    }
    announce(nextStage ? `Saved to ${story.title}. Next stage: ${nextStage}.` : `Saved to ${story.title}.`);
    this.toast(nextStage ? `Saved. Next: ${nextStage}` : 'Saved to your story.', 'stories');
  }

  private async copyCurrent(): Promise<void> {
    if (!this.current) return;
    const text = this.promptText(this.current);
    try {
      await navigator.clipboard.writeText(text);
      announce(t().card.copied);
      const btn = qs('#card-copy');
      if (btn) btn.textContent = t().card.copied;
    } catch {
      this.toast('Copy is unavailable on this device.');
    }
  }

  private async shareCurrent(): Promise<void> {
    if (!this.current) return;
    const text = this.promptText(this.current);
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title: this.current.title, text });
      return;
    } catch {
      /* fall through to Web Share / clipboard */
    }
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: this.current.title, text });
        return;
      } catch {
        /* user cancelled */
        return;
      }
    }
    await this.copyCurrent();
  }

  private promptText(p: Prompt): string {
    return `${p.title}\n\n${p.assignment}\n\nWhy it matters: ${p.why}\n\n— PhotoCue`;
  }

  // ---- stories / saved views ---------------------------------------------

  private async renderStories(savedOnly: boolean): Promise<void> {
    const s = t();
    const prefs = getPreferences();
    const stories = await listStories();
    const anyPrompts = stories.some((st) => st.prompts.length);

    if (savedOnly) {
      const all = stories.flatMap((st) => st.prompts.map((p) => ({ story: st, prompt: p })));
      this.shell(`
        <section class="page">
          <p class="eyebrow">${escapeHtml(s.saved.collection)}</p>
          <h1>${escapeHtml(s.saved.title)}</h1>
          ${
            all.length
              ? `<div class="saved-list">${all
                  .map(
                    ({ story, prompt }) => `
                <article class="saved-item">
                  <span class="mode-label">${escapeHtml(prompt.mode)}</span>
                  <h2>${escapeHtml(prompt.title)}</h2>
                  <p>${escapeHtml(prompt.assignment)}</p>
                  <small>In “${escapeHtml(story.title)}” · ${escapeHtml(prompt.status)}</small>
                </article>`,
                  )
                  .join('')}</div>`
              : emptyState(s.saved.emptyTitle, s.spin.spinButton, 'spin')
          }
        </section>`);
      this.bindShellNav();
      return;
    }

    this.shell(`
      <section class="page">
        <p class="eyebrow">${escapeHtml(s.stories.workspace)}</p>
        <div class="page-head">
          <h1>${escapeHtml(s.stories.title)}</h1>
          <button class="btn-secondary" id="new-story">${escapeHtml(s.stories.newStory)}</button>
        </div>
        ${anyPrompts || stories.length ? stories.map((st) => this.storyBlock(st, prefs.ethicsReminders)).join('') : emptyState(s.stories.emptyTitle, s.spin.spinButton, 'spin')}
      </section>`);

    this.bindShellNav();
    on(qs('#new-story'), 'click', async () => {
      const story = newStory({ location: prefs.location, placeType: prefs.placeType || undefined });
      await saveStory(story);
      localStorage.setItem(ACTIVE_STORY_KEY, story.id);
      this.render();
    });
    this.bindStoryBlocks(stories);
  }

  private storyBlock(story: Story, showEthics: boolean): string {
    const s = t();
    const nextStage = story.stages[story.stage];
    const suggestion = nextStage
      ? `<p class="next-stage">${escapeHtml(s.stories.nextStage)}: <b>${escapeHtml(nextStage)}</b>${
          modeForStage(nextStage) ? ` <button class="btn-link" data-continue="${escapeHtml(story.id)}" data-mode="${escapeHtml(modeForStage(nextStage)!)}">${escapeHtml(s.stories.continue)} →</button>` : ''
        }</p>`
      : `<p class="next-stage">Story path complete.</p>`;
    return `
    <article class="story-card" data-story="${escapeHtml(story.id)}">
      <div class="story-meta">
        <span class="place-tag">${escapeHtml(story.location || 'General')}</span>
        <div class="story-card-actions">
          <button class="btn-icon" data-export-menu="${escapeHtml(story.id)}" aria-label="Export ${escapeHtml(story.title)}">⤓</button>
          <button class="btn-icon danger" data-delete-story="${escapeHtml(story.id)}" aria-label="Delete ${escapeHtml(story.title)}">🗑</button>
        </div>
      </div>
      <h2 contenteditable="false" class="story-title">${escapeHtml(story.title)}</h2>
      <p class="story-question">${escapeHtml(story.question)}</p>
      ${storyPath(story)}
      ${suggestion}
      <div class="story-export" data-export-panel="${escapeHtml(story.id)}" hidden>
        <button data-export="pdf" data-id="${escapeHtml(story.id)}">${escapeHtml(s.stories.exportPdf)}</button>
        <button data-export="text" data-id="${escapeHtml(story.id)}">${escapeHtml(s.stories.exportText)}</button>
        <button data-export="md" data-id="${escapeHtml(story.id)}">${escapeHtml(s.stories.exportMd)}</button>
        <button data-export="json" data-id="${escapeHtml(story.id)}">${escapeHtml(s.stories.exportJson)}</button>
        <button data-export="image" data-id="${escapeHtml(story.id)}">${escapeHtml(s.stories.exportImage)}</button>
      </div>
      <ol class="saved-prompts" data-sortable="${escapeHtml(story.id)}">
        ${story.prompts
          .map(
            (p, i) => `
          <li class="saved-prompt" draggable="true" data-index="${i}" data-prompt="${escapeHtml(p.id)}">
            <div class="drag-handle" aria-hidden="true">⋮⋮</div>
            <details>
              <summary><span class="sp-title">${escapeHtml(p.title)}</span> <span class="status-pill" data-status="${escapeHtml(p.status)}">${escapeHtml(p.status)}</span></summary>
              <p class="assignment">${escapeHtml(p.assignment)}</p>
              ${showEthics && p.ethics ? `<p class="ethics">◇ ${escapeHtml(p.ethics)}</p>` : ''}
              <label class="field-label" for="status-${escapeHtml(p.id)}">${escapeHtml(s.stories.status)}</label>
              <select id="status-${escapeHtml(p.id)}" class="field-select status-select" data-story="${escapeHtml(story.id)}" data-prompt="${escapeHtml(p.id)}">
                ${(['Not started', 'Observed', 'Photographed', 'Needs another attempt', 'Complete'] as PromptStatus[])
                  .map((st) => `<option ${st === p.status ? 'selected' : ''}>${st}</option>`)
                  .join('')}
              </select>
              <label class="field-label" for="note-${escapeHtml(p.id)}">${escapeHtml(s.stories.addNote)}</label>
              <textarea id="note-${escapeHtml(p.id)}" class="field-input note" data-story="${escapeHtml(story.id)}" data-prompt="${escapeHtml(p.id)}" rows="2" maxlength="4000" placeholder="${escapeHtml(s.stories.addNote)}">${escapeHtml(p.notes)}</textarea>
              <button class="btn-link danger" data-remove-prompt="${escapeHtml(story.id)}|${escapeHtml(p.id)}">${escapeHtml(s.stories.remove)}</button>
            </details>
          </li>`,
          )
          .join('')}
      </ol>
    </article>`;
  }

  private bindStoryBlocks(stories: Story[]): void {
    // Export panel toggles.
    qsa<HTMLButtonElement>('[data-export-menu]').forEach((b) =>
      on(b, 'click', () => {
        const panel = qs(`[data-export-panel="${b.dataset.exportMenu}"]`);
        if (panel) (panel as HTMLElement).hidden = !(panel as HTMLElement).hidden;
      }),
    );
    qsa<HTMLButtonElement>('[data-export]').forEach((b) =>
      on(b, 'click', () => {
        const story = stories.find((s) => s.id === b.dataset.id);
        if (story) this.exportStory(story, b.dataset.export as 'pdf' | 'text' | 'md' | 'json' | 'image');
      }),
    );
    qsa<HTMLButtonElement>('[data-delete-story]').forEach((b) =>
      on(b, 'click', async () => {
        if (!confirm('Delete this story and its saved prompts? This cannot be undone.')) return;
        await removeStory(b.dataset.deleteStory!);
        this.render();
      }),
    );
    qsa<HTMLButtonElement>('[data-continue]').forEach((b) =>
      on(b, 'click', () => {
        localStorage.setItem(ACTIVE_STORY_KEY, b.dataset.continue!);
        savePreferences({ mode: b.dataset.mode as Mode });
        this.navigate('spin');
      }),
    );
    qsa<HTMLSelectElement>('.status-select').forEach((sel) =>
      on(sel, 'change', async () => {
        await setPromptStatus(sel.dataset.story!, sel.dataset.prompt!, sel.value as PromptStatus);
        const pill = sel.closest('details')?.querySelector('.status-pill');
        if (pill) {
          pill.textContent = sel.value;
          (pill as HTMLElement).dataset.status = sel.value;
        }
      }),
    );
    qsa<HTMLTextAreaElement>('textarea.note').forEach((ta) =>
      on(ta, 'change', () => setPromptNote(ta.dataset.story!, ta.dataset.prompt!, ta.value)),
    );
    qsa<HTMLButtonElement>('[data-remove-prompt]').forEach((b) =>
      on(b, 'click', async () => {
        const [sid, pid] = b.dataset.removePrompt!.split('|');
        await removePrompt(sid, pid);
        this.render();
      }),
    );
    this.bindDragReorder();
  }

  private bindDragReorder(): void {
    qsa<HTMLElement>('[data-sortable]').forEach((listEl) => {
      const storyId = listEl.dataset.sortable!;
      let dragEl: HTMLElement | null = null;
      qsa<HTMLElement>('.saved-prompt', listEl).forEach((li) => {
        on(li, 'dragstart', () => {
          dragEl = li;
          li.classList.add('dragging');
        });
        on(li, 'dragend', async () => {
          li.classList.remove('dragging');
          const order = qsa<HTMLElement>('.saved-prompt', listEl);
          const from = Number(dragEl?.dataset.index);
          const to = order.indexOf(dragEl!);
          if (!Number.isNaN(from) && to >= 0 && from !== to) {
            await reorderPrompts(storyId, from, to);
            this.render();
          }
          dragEl = null;
        });
        li.addEventListener('dragover', (e) => {
          e.preventDefault();
          const after = this.dragAfter(listEl, (e as DragEvent).clientY);
          if (dragEl && after == null) listEl.appendChild(dragEl);
          else if (dragEl && after) listEl.insertBefore(dragEl, after);
        });
      });
    });
  }

  private dragAfter(container: HTMLElement, y: number): HTMLElement | null {
    const els = qsa<HTMLElement>('.saved-prompt:not(.dragging)', container);
    let closest: { offset: number; el: HTMLElement | null } = { offset: -Infinity, el: null };
    for (const el of els) {
      const box = el.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) closest = { offset, el };
    }
    return closest.el;
  }

  private async exportStory(story: Story, format: 'pdf' | 'text' | 'md' | 'json' | 'image'): Promise<void> {
    const base = story.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'photocue-story';
    switch (format) {
      case 'pdf':
        await exportStoryPdf(story, 'a4');
        break;
      case 'text':
        download(`${base}.txt`, storyToText(story), 'text/plain');
        break;
      case 'md':
        download(`${base}.md`, storyToMarkdown(story), 'text/markdown');
        break;
      case 'json':
        download(`${base}.json`, JSON.stringify(story, null, 2), 'application/json');
        break;
      case 'image': {
        const cover = story.prompts[0];
        if (!cover) {
          this.toast('Save a prompt first to make a shareable image.');
          return;
        }
        const blob = await promptToImage(cover);
        download(`${base}.png`, blob, 'image/png');
        break;
      }
    }
  }

  private bindShellNav(): void {
    qsa<HTMLButtonElement>('[data-view]').forEach((b) => on(b, 'click', () => this.navigate(b.dataset.view as View)));
  }

  // ---- settings & workshop (delegated) -----------------------------------

  private renderSettingsView(): void {
    this.shell(renderSettings());
    this.bindShellNav();
    bindSettings({
      exportBackup: () => this.exportBackup(),
      importBackup: (file) => this.importBackup(file),
      deleteAll: () => this.deleteAll(),
      clearLocation: () => {
        clearLocationData();
        announce('Saved location cleared.');
      },
      openWorkshop: () => this.navigate('workshop'),
      onChange: () => this.applyPrefsToDocument(),
    });
  }

  private renderWorkshopView(): void {
    this.shell(renderWorkshop());
    this.bindShellNav();
    bindWorkshop();
  }

  private async exportBackup(): Promise<void> {
    const shareable = confirm(
      'Include a device-only installation id in this backup?\n\nOK = keep it (personal backup).\nCancel = strip it (safe to share).',
    );
    const backup = await createBackup(!shareable);
    download('photocue-backup.json', JSON.stringify(backup, null, 2), 'application/json');
  }

  private async importBackup(file: File): Promise<void> {
    if (file.size > 2 * 1024 * 1024) {
      alert('That file is too large to be a PhotoCue backup.');
      return;
    }
    const raw = await file.text();
    const summary = inspectBackup(raw);
    if (!summary.ok) {
      alert(summary.error || 'This file could not be imported.');
      return;
    }
    const ok = confirm(
      `This backup contains ${summary.storyCount} story(ies) and ${summary.promptCount} saved prompt(s)` +
        `${summary.hasSettings ? ', plus settings' : ''}.\n\nImport now? Existing stories are kept.`,
    );
    if (!ok) return;
    const n = await applyBackup(summary);
    announce(`Imported ${n} story(ies).`);
    this.navigate('stories');
  }

  private async deleteAll(): Promise<void> {
    if (!confirm('Permanently delete ALL PhotoCue data on this device? This cannot be undone.')) return;
    await clearAllData();
    localStorage.clear();
    sessionStorage.clear();
    location.hash = '#/spin';
    location.reload();
  }

  // ---- shared helpers -----------------------------------------------------

  applyPrefsToDocument(): void {
    const prefs = getPreferences();
    const el = document.documentElement;
    el.classList.toggle('high-contrast', prefs.highContrast);
    el.dataset.textSize = prefs.textSize;
    el.dataset.motion = prefs.reducedMotion;
  }

  private toast(message: string, linkView?: View): void {
    const existing = qs('.toast');
    existing?.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    el.innerHTML = `<span>${escapeHtml(message)}</span>${linkView ? `<button class="btn-link">View</button>` : ''}`;
    document.body.appendChild(el);
    if (linkView) on(el.querySelector('button'), 'click', () => this.navigate(linkView));
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, 4000);
  }

  private onGlobalKey(e: KeyboardEvent): void {
    if (e.code !== 'Space' || this.view !== 'spin') return;
    const tag = (e.target as HTMLElement)?.tagName;
    if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'SUMMARY'].includes(tag)) return;
    e.preventDefault();
    this.spin();
  }
}
