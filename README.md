<p align="center"><img src="assets/logo-horizontal.svg" width="420" alt="PhotoCue by Storitellah"></p>

# PhotoCue
## One tap. One place. One story.

**One-tap, location-aware photo prompts for documentary photographers and visual storytellers.**

PhotoCue helps photographers move from isolated images to structured visual stories with general and location-aware prompts, sequences, field notes, and a guided Story Path. It is offline-first, account-free, and stores personal work locally.

## Features

- One-tap, installation-specific prompt spinner with offline generation and history
- 18 modes, neutral location tailoring, Story Path, saved stories, field notes, and ethical reminders
- PDF and plain-text export, versioned JSON backup, installable PWA
- Android and iOS packaging through Capacitor; no account, ads, or analytics

## Screenshots

| Mobile spinner | Location prompt | Story Path | Saved story | High contrast |
|---|---|---|---|---|
| `docs/screenshots/mobile-spinner.png` | `docs/screenshots/location-prompt.png` | `docs/screenshots/story-path.png` | `docs/screenshots/saved-story.png` | `docs/screenshots/high-contrast.png` |

## Install PhotoCue

In Chrome or Edge choose **Install app**. In Safari on iOS choose **Share → Add to Home Screen**. After the first visit, the application and prompt library work offline.

## Development

```bash
npm ci
npm run dev
npm test
npm run build
npm run preview
npx cap add android && npm run native:sync
cd android && ./gradlew assembleDebug
npx cap add ios && npm run native:sync
```

The production base path is `/photocue/`; change `base` in `vite.config.ts` for another Pages repository. Pushes to `main` deploy through GitHub Actions.

## Privacy

Stories, notes, entered locations, settings, and history remain on the device by default. PhotoCue has no account, advertising, trackers, or remote prompt dependency. See [PRIVACY.md](PRIVACY.md).

## Contributing and prompt contributions

Photographers, storytellers, educators, designers, translators, and developers are welcome. Add modular variables, compatible templates, translations, ethical guidance, or place types rather than repetitive complete prompts. Read [CONTRIBUTING.md](CONTRIBUTING.md) and the [engine guide](docs/PROMPT_ENGINE.md).

## Roadmap

Additional languages · Workshop mode · Facilitator collections · Collaborative planning · Optional encrypted sync · Custom prompt packs · Photography assignment exports

## License and credits

Software is MIT licensed. Original prompt-library content is CC BY 4.0. Created by **Storitellah**.

Designed for documentary photographers and visual storytellers.
