# PhotoCue architecture

PhotoCue is a static-first, offline TypeScript PWA with no runtime framework.
The initial JavaScript bundle is kept small; heavy dependencies (jsPDF, native
bridges) are loaded on demand via dynamic `import()`.

## Module map

```
src/
  main.ts                 Bootstrap: prefs, i18n, seed, demo, PWA, mount App
  types.ts                Shared data shapes
  version.ts              App + backup format versions

  engine/                 Prompt engine (pure, offline, framework-free)
    vocabulary.ts         Modular vocabulary banks (one array per dimension)
    templates.ts          Sentence skeletons with {slots}
    prompt-engine.ts      Composition, fingerprinting, freshness rules
    index.ts              Public engine surface

  data/                   Static content & metadata
    modes.ts  place-types.ts  context-tags.ts  story-stages.ts  demo.ts

  storage/                Persistence
    db.ts                 IndexedDB with versioned migrations
    preferences.ts        Small localStorage settings
    seed.ts               Anonymous installation seed

  managers/               Domain logic between UI and storage
    story.ts  location.ts  backup.ts

  export/                 pdf.ts  text.ts  image.ts

  ui/                     Interface (string-rendered components + controller)
    app.ts                Router + event wiring (the controller)
    components.ts         Reusable pure render functions
    settings-view.ts  workshop-view.ts
    logo.ts  dom.ts

  i18n/                   en.ts + manager (RTL-aware)
  pwa/                    register.ts (service worker, install, update)
  util/                   sanitize.ts  rng.ts  download.ts
```

## Data flow

1. **UI** (`ui/app.ts`) reads inputs and calls the **engine** with the
   installation seed, mode, location, place type, tags, session, spin count, and
   the recent-100 prompt history.
2. The **engine** composes a prompt and returns it. It never touches storage.
3. The controller persists the prompt to **history** (`storage/db.ts`) and,
   when saved, into a **story** via `managers/story.ts`.
4. Views render through **components** with every dynamic value escaped.

The engine, storage, and UI never import each other's internals — only their
public surfaces — so each can be tested in isolation.

## Offline & PWA

`vite-plugin-pwa` (Workbox) precaches the built assets and provides a navigation
fallback. All core features (prompts, stories, notes, exports, settings) work
with no network. Optional online behaviour (native share, install prompt) fails
gracefully and never blocks the spinner.

## Security posture

- Strict CSP (`default-src 'self'`), no inline scripts, no external hosts.
- All user text is sanitised on store and escaped on render (single choke points
  in `util/sanitize.ts`).
- Imported backups are size-limited, structurally validated, and sanitised; no
  imported content is ever executed or rendered as HTML.
- No secrets in the repository; dependencies are pinned and audited.
