/**
 * Reusable presentational components. Each returns an HTML string with every
 * dynamic value escaped. Controllers (ui/app.ts) compose these and bind events.
 */

import type { Mode, PlaceType, Prompt, Story } from '../types';
import { escapeHtml } from '../util/sanitize';
import { MODES, MODE_DESCRIPTION } from '../data/modes';
import { PLACE_TYPES } from '../data/place-types';
import { CONTEXT_TAGS } from '../data/context-tags';
import { progress } from '../managers/story';
import { t } from '../i18n';
import { LOGO_ICON } from './logo';

/** App header with brand lockup and install affordance. */
export function header(): string {
  const s = t();
  return `
  <header class="app-header">
    <a class="brand" href="#/spin" aria-label="${escapeHtml(s.brand.name)} home">
      ${LOGO_ICON}
      <span class="brand-text"><b>${escapeHtml(s.brand.name)}</b><small>${escapeHtml(s.brand.attribution)}</small></span>
    </a>
    <button class="install-button" id="install-button" hidden>${escapeHtml(s.install.button)}</button>
  </header>`;
}

/** Bottom (mobile) / side (desktop) navigation. */
export function nav(active: string): string {
  const s = t();
  const item = (view: string, label: string, glyph: string) => `
    <button class="nav-item ${active === view ? 'active' : ''}" data-view="${view}"
      ${active === view ? 'aria-current="page"' : ''}>
      <span class="nav-glyph" aria-hidden="true">${glyph}</span>
      <span class="nav-label">${escapeHtml(label)}</span>
    </button>`;
  return `
  <nav class="app-nav" aria-label="Primary">
    ${item('spin', s.nav.spin, '◎')}
    ${item('stories', s.nav.stories, '▤')}
    ${item('saved', s.nav.saved, '♡')}
    ${item('settings', s.nav.settings, '⚙')}
  </nav>`;
}

/** The central command-dial spinner. */
export function dial(): string {
  const s = t();
  const ticks = ['DETAIL', 'STORY', 'LIGHT', 'PLACE', 'ACTION', 'CHANGE'];
  return `
  <div class="dial-wrap">
    <button class="dial" id="dial" aria-label="${escapeHtml(s.spin.dialLabel)}">
      <span class="dial-pointer" aria-hidden="true"></span>
      <span class="dial-ring" aria-hidden="true">
        ${ticks.map((tk, i) => `<i style="--i:${i};--n:${ticks.length}">${tk}</i>`).join('')}
      </span>
      <span class="dial-centre">
        <b>${escapeHtml(s.spin.dialCentre)}</b>
        <small>${escapeHtml(s.spin.dialSub)}</small>
      </span>
    </button>
    <button class="primary spin-button" id="spin-button">
      ${escapeHtml(s.spin.spinButton)} <span aria-hidden="true">→</span>
    </button>
    <p class="hint">${escapeHtml(s.spin.hint)}</p>
  </div>`;
}

/** The mode selector as a native select (accessible, keyboard-friendly). */
export function modeSelect(current: Mode): string {
  const s = t();
  return `
  <label class="field-label" for="mode">${escapeHtml(s.spin.mode)}</label>
  <select id="mode" class="field-select">
    ${MODES.map(
      (m) => `<option value="${escapeHtml(m)}" ${m === current ? 'selected' : ''}>${escapeHtml(m)}</option>`,
    ).join('')}
  </select>
  <p class="field-help" id="mode-help">${escapeHtml(MODE_DESCRIPTION[current])}</p>`;
}

/** Place-type selector. */
export function placeTypeSelect(current: PlaceType | ''): string {
  const s = t();
  return `
  <label class="field-label" for="place-type">${escapeHtml(s.spin.placeType)}</label>
  <select id="place-type" class="field-select">
    <option value="">${escapeHtml(s.spin.placeTypeNone)}</option>
    ${PLACE_TYPES.map(
      (p) => `<option value="${escapeHtml(p)}" ${p === current ? 'selected' : ''}>${escapeHtml(p)}</option>`,
    ).join('')}
  </select>`;
}

/** Context-tag chips. */
export function contextTags(selected: string[]): string {
  const s = t();
  return `
  <fieldset class="tags">
    <legend class="field-label">${escapeHtml(s.spin.themeTags)}</legend>
    ${CONTEXT_TAGS.map(
      (tag) => `
      <label class="tag-chip">
        <input type="checkbox" name="tag" value="${escapeHtml(tag)}" ${selected.includes(tag) ? 'checked' : ''}>
        <span>${escapeHtml(tag)}</span>
      </label>`,
    ).join('')}
  </fieldset>`;
}

/** A generated prompt card. `saved` toggles the save button state. */
export function promptCard(p: Prompt, opts: { saved?: boolean; showEthics?: boolean } = {}): string {
  const s = t();
  const ethics =
    opts.showEthics && p.ethics
      ? `<p class="ethics"><span aria-hidden="true">◇</span> ${escapeHtml(p.ethics)}</p>`
      : '';
  return `
  <article class="prompt-card" tabindex="-1" aria-label="Generated prompt">
    <div class="card-top">
      <span class="mode-label">${escapeHtml(p.mode)}${
        p.source === 'ai'
          ? ` <span class="ai-badge" title="${escapeHtml(s.card.byAiTitle)}">✦ ${escapeHtml(s.card.byAi)}</span>`
          : ''
      }</span>
      <span class="meta" data-difficulty="${escapeHtml(p.difficulty)}">${escapeHtml(p.difficulty)} · ${escapeHtml(p.time)}</span>
    </div>
    <h2 class="prompt-title">${escapeHtml(p.title)}</h2>
    <p class="assignment">${escapeHtml(p.assignment)}</p>
    <p class="role"><span>${escapeHtml(s.card.storyRole)}</span> <b>${escapeHtml(p.role)}</b></p>
    <details class="disclosure"><summary>${escapeHtml(s.card.why)}</summary><p>${escapeHtml(p.why)}</p></details>
    <details class="disclosure"><summary>${escapeHtml(s.card.variation)}</summary><p>${escapeHtml(p.variation)}</p></details>
    <details class="disclosure"><summary>${escapeHtml(s.card.reflection)}</summary><p>${escapeHtml(p.reflection)}</p></details>
    ${ethics}
    <div class="card-actions">
      <button class="btn-save ${opts.saved ? 'is-saved' : ''}" id="card-save" aria-pressed="${opts.saved ? 'true' : 'false'}">
        <span aria-hidden="true">${opts.saved ? '✓' : '♡'}</span> ${escapeHtml(opts.saved ? s.card.saved : s.card.save)}
      </button>
      <button class="btn-ghost" id="card-copy">${escapeHtml(s.card.copy)}</button>
      <button class="btn-ghost" id="card-share">${escapeHtml(s.card.share)}</button>
      <button class="btn-secondary" id="card-again">${escapeHtml(s.card.another)} <span aria-hidden="true">→</span></button>
    </div>
  </article>`;
}

/** Compact horizontal story-path indicator. */
export function storyPath(story: Story): string {
  const ratio = Math.round(progress(story) * 100);
  return `
  <div class="story-path" role="img"
    aria-label="Story progress: ${story.stage} of ${story.stages.length} stages">
    <div class="path-track"><div class="path-fill" style="width:${ratio}%"></div></div>
    <ol class="path-stages">
      ${story.stages
        .map(
          (stage, i) => `
        <li class="${i < story.stage ? 'done' : ''} ${i === story.stage ? 'current' : ''}">
          <span class="dot" aria-hidden="true">${i < story.stage ? '✓' : i + 1}</span>
          <span class="stage-name">${escapeHtml(stage)}</span>
        </li>`,
        )
        .join('')}
    </ol>
  </div>`;
}

/** Empty-state block. */
export function emptyState(title: string, actionLabel?: string, actionView?: string): string {
  return `
  <div class="empty-state">
    <div class="empty-mark" aria-hidden="true">${LOGO_ICON}</div>
    <p>${escapeHtml(title)}</p>
    ${actionLabel && actionView ? `<button class="primary" data-view="${escapeHtml(actionView)}">${escapeHtml(actionLabel)} <span aria-hidden="true">→</span></button>` : ''}
  </div>`;
}
