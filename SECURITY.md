# Security policy

## Reporting a vulnerability

Please report security issues **privately** through GitHub Security Advisories
(the repository's **Security → Report a vulnerability**). Do not open a public
issue for a vulnerability, and please do not include personal field notes or
backups in a report. We aim to acknowledge reports promptly and fix confirmed
issues on the latest release.

## Supported versions

Security fixes are provided for the latest released major version.

## Security design

PhotoCue is a static, offline, client-only app. Its attack surface is small and
deliberately kept that way:

- **Content Security Policy:** strict `default-src 'self'`; no inline scripts, no
  external script/style/font/connect hosts. Set in `index.html` and reinforced by
  the deploy configuration.
- **No secrets:** there are no API keys or secrets in the repository or in the
  shipped bundle. There is no backend.
- **Input handling:** all user-entered text (locations, notes, titles, tags) is
  sanitised on store and HTML-escaped on render through single choke points in
  `src/util/sanitize.ts`. The app renders text, never user-supplied HTML.
- **Backup imports:** imported files are size-limited (2 MB), structurally
  validated, sanitised, and never executed. Fields are type-checked; unknown or
  unsafe values are dropped. A summary is shown before import.
- **Permissions:** geolocation is requested only when the user activates the
  feature, and only approximate location is used; coordinates are never stored.
- **Dependencies:** pinned in `package-lock.json`, audited in CI
  (`npm audit --omit=dev`), and watched by Dependabot.
- **Headers:** additional security headers are applied where the host supports
  them (see the Pages workflow / docs).

## Handling of user content

Stories, notes, and history live only on the user's device. PhotoCue has no
server component and transmits no personal data.
