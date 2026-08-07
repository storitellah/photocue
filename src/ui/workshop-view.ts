/**
 * Workshop mode for photography educators.
 *
 * The facilitator sets a shared theme, location, and constraints; the engine
 * generates a *different* assignment per participant (different subjects,
 * visual approaches, narrative roles, and constraints), which can be exported
 * as a printable PDF. No participant accounts are required.
 */

import type { Mode } from '../types';
import { generatePrompt } from '../engine';
import { MODES } from '../data/modes';
import { CONTEXT_TAGS } from '../data/context-tags';
import { getInstallationSeed } from '../storage/seed';
import { exportAssignmentsPdf } from '../export/pdf';
import { escapeHtml, sanitizeText } from '../util/sanitize';
import { on, qs, qsa } from './dom';

interface Assignment {
  participant: string;
  title: string;
  assignment: string;
  role: string;
  constraint?: string;
}

let lastAssignments: Assignment[] = [];
let lastTitle = 'PhotoCue Workshop';

// A themed rotation of modes so each participant gets a distinct narrative role.
const ROLE_ROTATION: Mode[] = [
  'Opening Frame',
  'Character',
  'Context',
  'Detail',
  'Relationship',
  'Action',
  'Tension',
  'Sequence',
  'Constraint Challenge',
  'Closing Frame',
];

export function renderWorkshop(): string {
  return `
  <section class="page workshop">
    <p class="eyebrow">FOR FACILITATORS</p>
    <h1>Workshop mode</h1>
    <p class="muted">One shared theme, a different assignment for every participant.</p>

    <form id="workshop-form" class="workshop-form">
      <div class="control-grid">
        <label class="stacked"><span class="field-label">Participants</span>
          <input class="field-input" id="w-count" type="number" min="1" max="40" value="6" inputmode="numeric"></label>
        <label class="stacked"><span class="field-label">Working time</span>
          <select class="field-select" id="w-time"><option>30 min</option><option selected>60 min</option><option>90 min</option><option>Half day</option></select></label>
      </div>
      <label class="stacked"><span class="field-label">Theme</span>
        <select class="field-select" id="w-theme">${CONTEXT_TAGS.map((c) => `<option>${escapeHtml(c)}</option>`).join('')}</select></label>
      <label class="stacked"><span class="field-label">Location (optional)</span>
        <input class="field-input" id="w-location" type="text" maxlength="120" placeholder="e.g. A neighbourhood market"></label>
      <div class="control-grid">
        <label class="stacked"><span class="field-label">Experience level</span>
          <select class="field-select" id="w-level"><option>Beginner</option><option selected>Intermediate</option><option>Advanced</option></select></label>
        <label class="stacked"><span class="field-label">Activity</span>
          <select class="field-select" id="w-group"><option selected>Individual</option><option>Small groups</option></select></label>
      </div>
      <div class="control-grid">
        <label class="stacked"><span class="field-label">Story length</span>
          <select class="field-select" id="w-length"><option>Single image</option><option selected>Short sequence</option><option>Full story</option></select></label>
        <label class="setting-row inline"><span class="setting-label">Emphasise ethics</span>
          <input type="checkbox" id="w-ethics" class="switch" checked></label>
      </div>
      <div class="button-row">
        <button type="submit" class="primary">Generate assignments</button>
        <button type="button" class="btn-secondary" id="w-export" disabled>Export printable PDF</button>
      </div>
    </form>

    <div id="workshop-output" class="workshop-output"></div>
  </section>`;
}

export function bindWorkshop(): void {
  on(qs('#workshop-form'), 'submit', (e) => {
    e.preventDefault();
    generate();
  });
  on(qs('#w-export'), 'click', () => {
    if (lastAssignments.length) exportAssignmentsPdf(lastTitle, lastAssignments, 'a4');
  });
}

function generate(): void {
  const count = Math.max(1, Math.min(40, Number((qs<HTMLInputElement>('#w-count')?.value) || 6)));
  const theme = sanitizeText(qs<HTMLSelectElement>('#w-theme')?.value || 'Work');
  const location = sanitizeText(qs<HTMLInputElement>('#w-location')?.value || '');
  const level = qs<HTMLSelectElement>('#w-level')?.value || 'Intermediate';
  const length = qs<HTMLSelectElement>('#w-length')?.value || 'Short sequence';
  const ethics = qs<HTMLInputElement>('#w-ethics')?.checked ?? true;
  lastTitle = `Workshop — ${theme}`;

  const seed = getInstallationSeed();
  const assignments: Assignment[] = [];
  for (let i = 0; i < count; i++) {
    const mode = length === 'Single image' ? MODES[3] : ROLE_ROTATION[i % ROLE_ROTATION.length];
    const prompt = generatePrompt({
      seed: `${seed}|workshop|${theme}|${i}`,
      mode,
      spin: i + 1,
      session: 1,
      location: location || undefined,
      contextTags: [theme].filter((x) => CONTEXT_TAGS.includes(x as (typeof CONTEXT_TAGS)[number])),
      entropy: (i + 1) * 2654435761, // deterministic per participant, unique per run
    });
    assignments.push({
      participant: `Participant ${i + 1}`,
      title: prompt.title,
      assignment: prompt.assignment + (ethics && prompt.ethics ? ` (Ethics: ${prompt.ethics})` : ''),
      role: prompt.role,
      constraint: mode === 'Constraint Challenge' ? prompt.variation : undefined,
    });
  }
  lastAssignments = assignments;

  const out = qs('#workshop-output');
  if (out) {
    out.innerHTML = `
      <p class="muted">${count} assignments · Theme: ${escapeHtml(theme)} · ${escapeHtml(level)} · ${escapeHtml(length)}</p>
      <ol class="assignment-list">
        ${assignments
          .map(
            (a) => `<li><b>${escapeHtml(a.participant)}</b> — <span class="mode-label">${escapeHtml(a.role)}</span><p>${escapeHtml(a.assignment)}</p></li>`,
          )
          .join('')}
      </ol>`;
  }
  const exportBtn = qs<HTMLButtonElement>('#w-export');
  if (exportBtn) exportBtn.disabled = false;
}
