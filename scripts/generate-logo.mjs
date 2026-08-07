#!/usr/bin/env node
/**
 * Generates the full PhotoCue logo and icon system as editable SVG.
 *
 * The mark: a circular camera command dial (outer ring) enclosing six
 * simplified aperture blades. One blade is replaced by a Signal Orange
 * directional pointer, and the centre uses negative space to suggest a
 * location pin (a rounded lozenge with a hollow core) without drawing a
 * complete pin outline. The mark is bold (no thin lines), single-colour
 * capable, and legible at app-icon sizes.
 *
 * Run: node scripts/generate-logo.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const C = {
  ink: '#121212',
  paper: '#F4F0E7',
  orange: '#F35B35',
  moss: '#65705B',
  white: '#FFFFFF',
};

const CX = 256;
const CY = 256;
const RING_OUTER = 210;
const RING_INNER = 176; // ring thickness = 34 (bold)
const BLADE_OUTER = 158;
const BLADE_INNER = 66; // aperture opening radius
const N = 6;

const rad = (deg) => (deg * Math.PI) / 180;
const P = (r, a) => [CX + r * Math.cos(rad(a)), CY + r * Math.sin(rad(a))];
const fmt = (n) => Number(n.toFixed(2));
const pt = ([x, y]) => `${fmt(x)},${fmt(y)}`;

/**
 * Build the six aperture blades as filled quadrilaterals arranged like an iris.
 * Each blade spans one sector; blades are offset so they read as overlapping
 * leaves around a hexagonal opening. `pointerIndex` is rendered as a triangle
 * pointing outward instead of a blade.
 */
function blades(bladeColor, pointerColor) {
  const step = 360 / N;
  const start = -90; // first sector points up
  const parts = [];
  for (let i = 0; i < N; i++) {
    const a = start + i * step;
    const aNext = a + step;
    if (i === 0) {
      // Directional pointer: a bold triangle reaching toward the ring.
      const tip = P(BLADE_OUTER + 6, a);
      const b1 = P(BLADE_INNER + 10, a - step * 0.42);
      const b2 = P(BLADE_INNER + 10, a + step * 0.42);
      parts.push(
        `<polygon fill="${pointerColor}" points="${pt(tip)} ${pt(b1)} ${pt(b2)}"/>`,
      );
    } else {
      const o1 = P(BLADE_OUTER, a - step * 0.46);
      const o2 = P(BLADE_OUTER, a + step * 0.46);
      const inMid = P(BLADE_INNER, a + step * 0.5);
      const inMid2 = P(BLADE_INNER, a - step * 0.5);
      parts.push(
        `<polygon fill="${bladeColor}" points="${pt(o1)} ${pt(o2)} ${pt(inMid)} ${pt(inMid2)}"/>`,
      );
      void aNext;
    }
  }
  return parts.join('\n    ');
}

/**
 * The location pin at the centre, built from negative space: a rounded teardrop
 * body in the aperture colour with a hollow core cut through it (even-odd) so
 * the ink disk beneath reads as the pin's hole. It suggests a pin without ever
 * drawing a full pin outline.
 */
function pinNegativeSpace(bodyFill) {
  const top = CY - 34;
  const bottom = CY + 42;
  const rx = 26;
  const body = [
    `M ${CX} ${fmt(bottom)}`,
    `C ${fmt(CX - rx)} ${fmt(bottom - 24)} ${fmt(CX - rx)} ${fmt(top + 2)} ${CX} ${fmt(top)}`,
    `C ${fmt(CX + rx)} ${fmt(top + 2)} ${fmt(CX + rx)} ${fmt(bottom - 24)} ${CX} ${fmt(bottom)}`,
    'Z',
  ].join(' ');
  // Reverse-wound core so even-odd leaves a hole showing the disk beneath.
  const coreR = 11;
  const coreCy = CY - 12;
  const core = `M ${fmt(CX - coreR)} ${fmt(coreCy)} a ${coreR} ${coreR} 0 1 0 ${coreR * 2} 0 a ${coreR} ${coreR} 0 1 0 ${-coreR * 2} 0 Z`;
  return `<path fill="${bodyFill}" fill-rule="evenodd" d="${body} ${core}"/>`;
}

/**
 * Compose the core mark as a single ink dial disk with contrasting aperture
 * blades, an orange pointer, and a negative-space pin.
 *   disk    — the dial face + rim (one solid disk; the band outside the blades
 *             reads as the command-dial rim)
 *   blade   — aperture leaf colour (contrasts with the disk)
 *   pointer — the directional cue
 *   pin     — the central pin body colour (its hole reveals the disk)
 */
function mark({ disk, blade, pointer, pin }) {
  return `
    <circle cx="${CX}" cy="${CY}" r="${RING_OUTER}" fill="${disk}"/>
    ${blades(blade, pointer)}
    <circle cx="${CX}" cy="${CY}" r="${BLADE_INNER}" fill="${disk}"/>
    ${pinNegativeSpace(pin)}`;
}

function svg(inner, { size = 512, bg = 'none', rounded = 0 } = {}) {
  const bgRect =
    bg === 'none'
      ? ''
      : `<rect width="512" height="512" ${rounded ? `rx="${rounded}"` : ''} fill="${bg}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="${size}" height="${size}" role="img" aria-label="PhotoCue">
  ${bgRect}
  <g>${inner}</g>
</svg>
`;
}

// ---- Primary mark: Field Ink disk, Paper aperture, Signal Orange pointer ----
const primaryMark = mark({ disk: C.ink, blade: C.paper, pointer: C.orange, pin: C.paper });

// Icon-only, transparent background (for inline use on Paper surfaces).
const iconOnly = svg(primaryMark, { bg: 'none' });

// App icon: ink background, full-bleed safe.
const appIcon = svg(primaryMark, { bg: C.paper });

// Maskable icon: same mark, but on an ink field with generous safe padding.
const maskableInner = `<g transform="translate(256,256) scale(0.78) translate(-256,-256)">${primaryMark}</g>`;
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512" role="img" aria-label="PhotoCue">
  <rect width="512" height="512" fill="${C.paper}"/>
  ${maskableInner}
</svg>
`;

// Monochrome variants (single colour, transparent gaps). The ring is an
// annulus, blades are solid in the one colour with transparent sectors between
// them, and the pin's hole is a transparent cut — so it reads in one ink.
const monoMark = (fill) => {
  const annulus = `<path fill="${fill}" fill-rule="evenodd" d="M ${CX - RING_OUTER} ${CY} a ${RING_OUTER} ${RING_OUTER} 0 1 0 ${RING_OUTER * 2} 0 a ${RING_OUTER} ${RING_OUTER} 0 1 0 ${-RING_OUTER * 2} 0 Z M ${CX - (RING_OUTER - 30)} ${CY} a ${RING_OUTER - 30} ${RING_OUTER - 30} 0 1 0 ${(RING_OUTER - 30) * 2} 0 a ${RING_OUTER - 30} ${RING_OUTER - 30} 0 1 0 ${-(RING_OUTER - 30) * 2} 0 Z"/>`;
  const pinBody = `<path fill="${fill}" fill-rule="evenodd" d="M ${CX} ${CY + 42} C ${CX - 26} ${CY + 18} ${CX - 26} ${CY - 32} ${CX} ${CY - 34} C ${CX + 26} ${CY - 32} ${CX + 26} ${CY + 18} ${CX} ${CY + 42} Z M ${CX - 11} ${CY - 12} a 11 11 0 1 0 22 0 a 11 11 0 1 0 -22 0 Z"/>`;
  return `${annulus}\n    ${blades(fill, fill)}\n    ${pinBody}`;
};
const monoBlack = svg(monoMark(C.ink), { bg: 'none' });
const monoWhite = svg(monoMark(C.white), { bg: C.ink });

// Android adaptive foreground (mark only, padded to 66% safe zone) & background.
const adaptiveForeground = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <g transform="translate(256,256) scale(0.62) translate(-256,-256)">${primaryMark}</g>
</svg>
`;
const adaptiveBackground = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" fill="${C.paper}"/>
</svg>
`;

// Favicon (compact, high-contrast).
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="64" height="64" role="img" aria-label="PhotoCue">
  <rect width="512" height="512" rx="96" fill="${C.ink}"/>
  <g transform="translate(256,256) scale(0.82) translate(-256,-256)">${mark({ disk: C.paper, blade: C.ink, pointer: C.orange, pin: C.ink })}</g>
</svg>
`;

// Apple touch icon (no transparency, rounded handled by iOS).
const appleTouch = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="180" height="180" role="img" aria-label="PhotoCue">
  <rect width="512" height="512" fill="${C.paper}"/>
  <g transform="translate(256,256) scale(0.84) translate(-256,-256)">${primaryMark}</g>
</svg>
`;

// Wordmark lockups.
const wordmark = (stacked) => {
  const markScale = stacked ? 0.9 : 1;
  const markSize = 96 * markScale;
  const inner = primaryMark;
  if (stacked) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 260" width="360" height="260" role="img" aria-label="PhotoCue by Storitellah">
  <g transform="translate(132,10) scale(${markSize / 512})">${inner}</g>
  <text x="180" y="210" text-anchor="middle" font-family="'Space Grotesk',system-ui,sans-serif" font-size="52" font-weight="700" fill="${C.ink}">PhotoCue</text>
  <text x="180" y="240" text-anchor="middle" font-family="'Space Grotesk',system-ui,sans-serif" font-size="18" letter-spacing="3" fill="${C.moss}">BY STORITELLAH</text>
</svg>
`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 140" width="520" height="140" role="img" aria-label="PhotoCue by Storitellah">
  <g transform="translate(10,10) scale(${120 / 512})">${inner}</g>
  <text x="150" y="72" font-family="'Space Grotesk',system-ui,sans-serif" font-size="54" font-weight="700" fill="${C.ink}">PhotoCue</text>
  <text x="152" y="104" font-family="'Space Grotesk',system-ui,sans-serif" font-size="18" letter-spacing="3" fill="${C.moss}">BY STORITELLAH · ONE TAP. ONE PLACE. ONE STORY.</text>
</svg>
`;
};

const files = {
  'assets/logo/icon.svg': iconOnly,
  'assets/logo/logo-horizontal.svg': wordmark(false),
  'assets/logo/logo-stacked.svg': wordmark(true),
  'assets/logo/logo-mono-black.svg': monoBlack,
  'assets/logo/logo-mono-white.svg': monoWhite,
  'assets/logo/app-icon.svg': appIcon,
  'assets/logo/maskable.svg': maskable,
  'assets/logo/adaptive-foreground.svg': adaptiveForeground,
  'assets/logo/adaptive-background.svg': adaptiveBackground,
  'assets/logo/favicon.svg': favicon,
  // Public copies used at runtime by the manifest and HTML.
  'public/icon.svg': appIcon,
  'public/favicon.svg': favicon,
  'public/apple-touch-icon.svg': appleTouch,
  'public/maskable-icon.svg': maskable,
  'public/icons/adaptive-foreground.svg': adaptiveForeground,
  'public/icons/adaptive-background.svg': adaptiveBackground,
  'public/icons/logo-horizontal.svg': wordmark(false),
};

for (const [rel, content] of Object.entries(files)) {
  const abs = join(root, rel);
  mkdirSync(dirname(abs), { recursive: true });
  writeFileSync(abs, content);
  console.log('wrote', rel);
}
console.log('Logo system generated.');
