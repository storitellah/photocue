/**
 * Inline PhotoCue mark for use inside the interface (header, empty states).
 *
 * This is the same geometry produced by scripts/generate-logo.mjs — kept inline
 * so it needs no network request and inherits crisp rendering at any size. It is
 * decorative here (labels are provided by surrounding elements), hence
 * aria-hidden on the wrapper where used.
 */
export const LOGO_ICON = `<svg class="logo-mark" viewBox="0 0 512 512" width="40" height="40" aria-hidden="true" focusable="false">
  <circle cx="256" cy="256" r="210" fill="#121212"/>
  <polygon fill="#F35B35" points="256,92 223.64,187.23 288.36,187.23"/>
  <polygon fill="#F4F0E7" points="340.66,122.6 413.86,249.38 322,256 289,198.84"/>
  <polygon fill="#F4F0E7" points="413.86,262.62 340.66,389.4 289,313.16 322,256"/>
  <polygon fill="#F4F0E7" points="329.2,396.02 182.8,396.02 223,313.16 289,313.16"/>
  <polygon fill="#F4F0E7" points="171.34,389.4 98.14,262.62 190,256 223,313.16"/>
  <polygon fill="#F4F0E7" points="98.14,249.38 171.34,122.6 223,198.84 190,256"/>
  <circle cx="256" cy="256" r="66" fill="#121212"/>
  <path fill="#F4F0E7" fill-rule="evenodd" d="M 256 298 C 230 274 230 224 256 222 C 282 224 282 274 256 298 Z M 245 244 a 11 11 0 1 0 22 0 a 11 11 0 1 0 -22 0 Z"/>
</svg>`;
