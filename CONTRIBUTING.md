# Contributing to PhotoCue

Thank you for helping. Photographers, storytellers, educators, designers,
translators, and developers are all welcome — you do not need to write code to
contribute.

## Ways to contribute

- **Prompt vocabulary & templates** — expand the modular banks (see below).
- **Translations** — add a language dictionary under `src/i18n/`.
- **Place types & context tags** — extend `src/data/`.
- **Ethical guidance** — improve the reminders.
- **Design, accessibility, and docs** — always appreciated.
- **Bug reports & ideas** — open an issue using the templates.

## Ground rules

- Preserve **neutral, observational** documentary language.
- Prompt content must **not** assume anything about a place or its people —
  identity, wealth, danger, politics, urban/rural, or informality.
- Keep the interface calm and focused: no ads, no manipulative engagement
  mechanics, no dashboards.

## Prompt contributions

The engine is **compositional** — variety comes from combining parts, not from
long lists of complete sentences.

- Add entries to a bank in `src/engine/vocabulary.ts`, or add a new bank plus a
  template in `src/engine/templates.ts` that uses it.
- Keep templates grammatically compatible with their slots and the optional
  location opener.
- **Do not** add repetitive, complete pre-written prompts.

See [docs/PROMPT_ENGINE.md](docs/PROMPT_ENGINE.md) for details.

## Development workflow

1. Fork and create a focused branch.
2. `npm install`
3. Make your change.
4. `npm test` and `npm run build` must pass. Add or update tests.
5. Consider **accessibility** and **offline** implications; note them in your PR.
6. Open a pull request using the template.

## Licensing of contributions

By contributing **code** you agree it is licensed under the MIT License. By
contributing **prompt content** (vocabulary, templates, guidance) you agree it is
licensed under CC BY 4.0. See `LICENSE` and `LICENSE-CONTENT`.

Please also follow our [Code of Conduct](CODE_OF_CONDUCT.md).
