#!/usr/bin/env node
/**
 * Generates brand-accurate SVG mockups of key PhotoCue screens for the README
 * and docs. SVG keeps them sharp on any display. These are illustrative
 * mockups of the real UI, not marketing renders.
 *
 * Run: node scripts/generate-screenshots.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const C = {
  ink: '#121212', paper: '#F4F0E7', orange: '#F35B35', orangeInk: '#B8340F',
  moss: '#65705B', mossDeep: '#4F5847', grey: '#74736F', white: '#FFFFFF',
  line: '#D9D2C4', surface2: '#EFE9DD',
};

const W = 390;
const H = 844;

function markSmall(x, y, s) {
  const t = `translate(${x},${y}) scale(${s / 512})`;
  return `<g transform="${t}">
    <circle cx="256" cy="256" r="210" fill="${C.ink}"/>
    <polygon fill="${C.orange}" points="256,92 223.64,187.23 288.36,187.23"/>
    <polygon fill="${C.paper}" points="340.66,122.6 413.86,249.38 322,256 289,198.84"/>
    <polygon fill="${C.paper}" points="413.86,262.62 340.66,389.4 289,313.16 322,256"/>
    <polygon fill="${C.paper}" points="329.2,396.02 182.8,396.02 223,313.16 289,313.16"/>
    <polygon fill="${C.paper}" points="171.34,389.4 98.14,262.62 190,256 223,313.16"/>
    <polygon fill="${C.paper}" points="98.14,249.38 171.34,122.6 223,198.84 190,256"/>
    <circle cx="256" cy="256" r="66" fill="${C.ink}"/>
    <path fill="${C.paper}" fill-rule="evenodd" d="M 256 298 C 230 274 230 224 256 222 C 282 224 282 274 256 298 Z M 245 244 a 11 11 0 1 0 22 0 a 11 11 0 1 0 -22 0 Z"/>
  </g>`;
}

function frame(bg, content, dark = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="'Space Grotesk',system-ui,sans-serif">
  <rect width="${W}" height="${H}" rx="46" fill="${dark ? '#17150f' : C.ink}"/>
  <rect x="6" y="6" width="${W - 12}" height="${H - 12}" rx="40" fill="${bg}"/>
  <rect x="${W / 2 - 55}" y="20" width="110" height="26" rx="13" fill="${C.ink}" opacity="${dark ? 1 : 0.85}"/>
  ${content}
  <rect x="${W / 2 - 70}" y="${H - 26}" width="140" height="5" rx="2.5" fill="${dark ? '#5a564a' : C.grey}"/>
</svg>`;
}

function header(dark) {
  const text = dark ? C.paper : C.ink;
  return `${markSmall(28, 66, 34)}
  <text x="70" y="82" font-size="19" font-weight="700" fill="${text}">PhotoCue</text>
  <text x="70" y="97" font-size="8" letter-spacing="2" fill="${C.mossDeep}">BY STORITELLAH</text>
  <rect x="286" y="64" width="76" height="34" rx="17" fill="${C.orange}"/>
  <text x="324" y="86" font-size="12" font-weight="600" fill="${C.white}" text-anchor="middle">Install</text>`;
}

function bottomNav(active, dark) {
  const items = ['Spin', 'Stories', 'Saved', 'Settings'];
  const glyphs = ['◎', '▤', '♡', '⚙'];
  const w = W / 4;
  const y = H - 92;
  return `<rect x="6" y="${y}" width="${W - 12}" height="70" fill="${dark ? '#201d16' : C.white}"/>
  <line x1="6" y1="${y}" x2="${W - 6}" y2="${y}" stroke="${dark ? '#3a362b' : C.line}"/>
  ${items
    .map((it, i) => {
      const cx = w * i + w / 2;
      const on = it === active;
      const col = on ? C.orangeInk : dark ? '#cfc7b5' : C.grey;
      return `<text x="${cx}" y="${y + 34}" font-size="18" fill="${col}" text-anchor="middle">${glyphs[i]}</text>
      <text x="${cx}" y="${y + 52}" font-size="10" font-weight="${on ? 700 : 400}" fill="${col}" text-anchor="middle">${it}</text>`;
    })
    .join('')}`;
}

function dialSvg(cx, cy, r, dark) {
  const face = dark ? '#201d16' : C.white;
  const rim = dark ? '#cfc7b5' : C.ink;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${dark ? '#2a271e' : C.surface2}" stroke="${rim}" stroke-width="3"/>
  <circle cx="${cx}" cy="${cy}" r="${r - 14}" fill="${face}"/>
  <polygon points="${cx - 11},${cy - r} ${cx + 11},${cy - r} ${cx},${cy - r + 20}" fill="${C.orange}"/>
  <text x="${cx}" y="${cy - 2}" font-size="30" font-weight="700" fill="${dark ? C.paper : C.ink}" text-anchor="middle">SPIN</text>
  <text x="${cx}" y="${cy + 18}" font-size="9" letter-spacing="2" fill="${C.mossDeep}" text-anchor="middle">NEW PROMPT</text>`;
}

function promptCard(x, y, w, dark, title, body, mode) {
  const surf = dark ? '#201d16' : C.white;
  const text = dark ? C.paper : C.ink;
  const muted = dark ? '#cfc7b5' : C.mossDeep;
  return `<rect x="${x}" y="${y}" width="${w}" height="230" rx="20" fill="${surf}" stroke="${dark ? '#3a362b' : C.line}" stroke-width="1.5"/>
  <rect x="${x + 20}" y="${y + 20}" width="${mode.length * 7 + 20}" height="22" rx="11" fill="${C.moss}"/>
  <text x="${x + 30}" y="${y + 35}" font-size="10" font-weight="700" fill="${C.white}">${mode}</text>
  <text x="${x + w - 20}" y="${y + 35}" font-size="10" fill="${muted}" text-anchor="end">Focused · 20–30 min</text>
  <text x="${x + 20}" y="${y + 72}" font-size="22" font-weight="700" font-family="Georgia,serif" fill="${text}">${title}</text>
  ${body.map((ln, i) => `<text x="${x + 20}" y="${y + 100 + i * 22}" font-size="14" font-family="Georgia,serif" fill="${dark ? '#cfc7b5' : '#55534e'}">${ln}</text>`).join('')}
  <rect x="${x + 20}" y="${y + 176}" width="120" height="36" rx="18" fill="${C.moss}"/>
  <text x="${x + 80}" y="${y + 199}" font-size="12" font-weight="600" fill="${C.white}" text-anchor="middle">♡ Save to Story</text>
  <rect x="${x + 150}" y="${y + 176}" width="110" height="36" rx="18" fill="${C.ink}"/>
  <text x="${x + 205}" y="${y + 199}" font-size="12" font-weight="600" fill="${C.white}" text-anchor="middle">Try Another →</text>`;
}

// 1. Mobile spinner
const spinner = frame(
  C.paper,
  `${header(false)}
  <text x="28" y="150" font-size="10" letter-spacing="2" font-weight="600" fill="${C.mossDeep}">FIELD PROMPT · OFFLINE READY</text>
  <text x="28" y="182" font-size="30" font-weight="700" fill="${C.ink}">One tap. One place.</text>
  <text x="28" y="216" font-size="30" font-weight="700" fill="${C.orangeInk}" font-style="italic">One story.</text>
  <rect x="28" y="238" width="334" height="44" rx="12" fill="${C.white}" stroke="${C.line}" stroke-width="1.5"/>
  <text x="44" y="265" font-size="13" fill="${C.grey}">A neighbourhood market</text>
  ${dialSvg(W / 2, 470, 120, false)}
  <rect x="${W / 2 - 90}" y="610" width="180" height="46" rx="23" fill="${C.orange}"/>
  <text x="${W / 2}" y="639" font-size="15" font-weight="700" fill="${C.white}" text-anchor="middle">Spin a Prompt →</text>
  ${bottomNav('Spin', false)}`,
);

// 2. Location prompt card
const locationPrompt = frame(
  C.paper,
  `${header(false)}
  <text x="28" y="150" font-size="10" letter-spacing="2" font-weight="600" fill="${C.mossDeep}">LOCATION PROMPT · KIBERA</text>
  ${promptCard(28, 170, 334, false, 'The First to Arrive', ['At Kibera, identify someone whose', 'work begins before most people', 'arrive. Photograph the space, the', 'person, and one telling detail.'], 'Location Prompt')}
  ${dialSvg(W / 2, 560, 70, false)}
  ${bottomNav('Spin', false)}`,
);

// 3. Story path
const storyPath = frame(
  C.paper,
  `${header(false)}
  <text x="28" y="150" font-size="10" letter-spacing="2" font-weight="600" fill="${C.mossDeep}">STORY WORKSPACE</text>
  <text x="28" y="182" font-size="26" font-weight="700" fill="${C.ink}">Morning at the Market</text>
  <text x="28" y="208" font-size="14" font-family="Georgia,serif" fill="#55534e">How does the market move from</text>
  <text x="28" y="228" font-size="14" font-family="Georgia,serif" fill="#55534e">preparation to full activity?</text>
  <rect x="28" y="250" width="334" height="8" rx="4" fill="${C.surface2}" stroke="${C.line}"/>
  <rect x="28" y="250" width="140" height="8" rx="4" fill="${C.moss}"/>
  ${[0, 1, 2, 3].map((i) => {
    const cx = 60 + i * 84;
    const done = i < 2;
    const cur = i === 2;
    return `<circle cx="${cx}" cy="300" r="16" fill="${done ? C.moss : C.white}" stroke="${cur ? C.orange : C.line}" stroke-width="2"/>
    <text x="${cx}" y="305" font-size="11" font-weight="700" fill="${done ? C.white : C.mossDeep}" text-anchor="middle">${done ? '✓' : i + 1}</text>
    <text x="${cx}" y="332" font-size="8" fill="#55534e" text-anchor="middle">Stage ${i + 1}</text>`;
  }).join('')}
  ${['First person to arrive — Photographed', 'Opening routines — Observed', 'Tools and objects — Not started'].map((row, i) => `
  <rect x="28" y="${360 + i * 60}" width="334" height="48" rx="12" fill="${C.white}" stroke="${C.line}"/>
  <text x="44" y="${389 + i * 60}" font-size="13" font-weight="600" fill="${C.ink}">${row.split(' — ')[0]}</text>
  <rect x="${362 - (row.split(' — ')[1].length * 6 + 16)}" y="${374 + i * 60}" width="${row.split(' — ')[1].length * 6 + 8}" height="20" rx="10" fill="none" stroke="${C.moss}"/>
  <text x="${358}" y="${388 + i * 60}" font-size="9" fill="${C.mossDeep}" text-anchor="end">${row.split(' — ')[1]}</text>`).join('')}
  ${bottomNav('Stories', false)}`,
);

// 4. Saved story list
const saved = frame(
  C.paper,
  `${header(false)}
  <text x="28" y="150" font-size="10" letter-spacing="2" font-weight="600" fill="${C.mossDeep}">FIELD COLLECTION</text>
  <text x="28" y="182" font-size="26" font-weight="700" fill="${C.ink}">Saved prompts</text>
  ${['A place where people pause', 'An object passed between hands', 'A boundary people negotiate', 'Evidence of someone absent'].map((tl, i) => `
  <rect x="28" y="${210 + i * 120}" width="334" height="104" rx="16" fill="${C.white}" stroke="${C.line}"/>
  <rect x="44" y="${226 + i * 120}" width="90" height="20" rx="10" fill="${C.moss}"/>
  <text x="52" y="${240 + i * 120}" font-size="9" font-weight="700" fill="${C.white}">GENERAL PROMPT</text>
  <text x="44" y="${272 + i * 120}" font-size="16" font-weight="700" font-family="Georgia,serif" fill="${C.ink}">${tl}</text>
  <text x="44" y="${296 + i * 120}" font-size="11" fill="${C.mossDeep}">In "Morning at the Market" · Observed</text>`).join('')}
  ${bottomNav('Saved', false)}`,
);

// 5. Dark / high-contrast mode
const dark = frame(
  '#17150f',
  `${header(true)}
  <text x="28" y="150" font-size="10" letter-spacing="2" font-weight="600" fill="${C.moss}">DARK MODE · OFFLINE READY</text>
  ${promptCard(28, 170, 334, true, 'A Quiet Order', ['Find a corner where different', 'routines overlap. Make a wide', 'frame of the shared space, then', 'one detail from each routine.'], 'Relationship')}
  ${dialSvg(W / 2, 560, 70, true)}
  ${bottomNav('Spin', true)}`,
  true,
);

const files = {
  'screenshots/01-spinner.svg': spinner,
  'screenshots/02-location-prompt.svg': locationPrompt,
  'screenshots/03-story-path.svg': storyPath,
  'screenshots/04-saved-story.svg': saved,
  'screenshots/05-dark-mode.svg': dark,
};
for (const [rel, content] of Object.entries(files)) {
  const abs = join(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  console.log('wrote', rel);
}
console.log('Screenshots generated.');
