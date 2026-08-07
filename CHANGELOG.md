# Changelog

All notable changes to PhotoCue are documented here. This project adheres to
[Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-08-07

### Added

- **Compositional prompt engine** with 18 modes, modular vocabulary banks, and
  per-mode templates producing hundreds of thousands of combinations offline.
- **Freshness system**: exact-repeat prevention, a "three meaningful components
  changed" rule against the recent 100, and per-installation seeding so
  different devices get different sequences.
- **One-tap spinner** (photographic command dial): tap, swipe, button, or
  spacebar; reduced-motion fade alternative.
- **Story Path mode** with default stages, next-stage suggestions, and
  skip/reorder/remove/repeat editing.
- **Story workspace**: saved prompts, status tracking, field notes, drag-to-
  reorder, and progress indicators.
- **Exports**: A4/US-Letter PDF, plain text, Markdown, JSON backup, and shareable
  image.
- **Versioned, validated backup/restore** with sanitisation and size limits.
- **IndexedDB storage** with forward-only migrations that preserve stories.
- **Installable PWA**: manifest, offline service worker, install prompt, update
  notification, maskable/adaptive icons, Apple touch icon, offline fallback.
- **Capacitor** configuration for Android and iOS, including APK/AAB scripts.
- **Editable SVG logo system** and icon set generated from a script.
- **Workshop mode** for facilitators with per-participant assignments and PDF
  export.
- **Accessibility**: keyboard support, visible focus, screen-reader labels, live
  announcements, high-contrast mode, adjustable text size, reduced motion.
- **Privacy controls**: export, import, clear location, delete all data; no
  account, no trackers.
- **Internationalisation** scaffolding (English default, RTL-ready).
- **Test suite**: engine, freshness (10,000 installations), sanitisation, story
  progression, database migration, backup validation, exports, and a UI smoke
  test.
- **Documentation**: README, architecture, prompt-engine, accessibility,
  privacy, security, and contribution guides; GitHub Actions for tests, Pages
  deployment, and Android builds.

[1.0.0]: https://github.com/storitellah/photocue/releases/tag/v1.0.0
