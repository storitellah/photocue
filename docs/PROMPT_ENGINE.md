# The PhotoCue prompt engine

PhotoCue **composes** prompts from modular parts; it does not pick complete
sentences from a list. This document explains how it works and how to contribute
without adding repetitive fixed prompts.

## Dimensions (variables)

Each prompt draws from independent vocabulary banks — the "dimensions" the
engine varies:

`location name`, `place type`, `time of day`, `weather (when available)`,
`story stage`, `subject type`, `human activity`, `visual approach`,
`narrative purpose`, `shot distance`, `perspective`, `lighting condition`,
`relationship`, `emotion / atmosphere`, `object / detail`, `movement`, `time`,
`contrast`, `creative constraint`, `reflection question`, and
`ethical consideration`.

Banks live in [`src/engine/vocabulary.ts`](../src/engine/vocabulary.ts).

## Templates

A **template** ([`src/engine/templates.ts`](../src/engine/templates.ts)) is a
sentence skeleton with `{slot}` placeholders and a declared list of the slots it
uses. Each mode has its own specialised templates layered on top of a shared
general pool, so every mode has many structures and a large combination space.

Two structural slots are handled by the engine:

- `{lead}` — an optional `"At <location>, "` / `"In <location>, "` opener.
- place-type orientation — a neutral "way of looking" folded in when a place type
  is chosen.

## How a prompt is generated

1. A **seeded RNG** is built by hashing a composite string of:
   the anonymous **installation seed**, the **mode**, **location**, **place
   type**, **story id/stage**, **session number**, **spin count**, a **secure
   random value** (production only), and an **attempt counter**.
2. A template is chosen; each of its slots is filled from the banks.
3. A **component vector** records which entry was chosen per meaningful dimension
   (plus template, mode, reflection, and title).

Determinism is preserved for tests by passing a fixed `entropy` value; in the
field a fresh cryptographic value is folded in each spin, so sequences are
unpredictable and **different installations receive different sequences**.

## Freshness guarantees

- **No exact repeats:** a candidate whose fingerprint matches any recent prompt
  is rejected.
- **Meaningfully different:** a candidate must differ from each of the recent
  **100** prompts in at least **three** meaningful components. A one-word change
  is never treated as a new prompt.
- **Graceful exhaustion:** if combinations are nearly used up, the engine returns
  the freshest candidate it found rather than looping forever.

These are verified in [`tests/freshness.test.ts`](../tests/freshness.test.ts),
which simulates 10,000 installations and long sessions and asserts low collision
and repetition rates.

## Neutral language rules

- The location is **context only**. The engine never adds demographic, economic,
  safety, or political claims about a place.
- Location text is bounded and stripped of control and HTML-delimiter characters.
- Ethics reminders are practical and non-legal, surfaced when the mode or subject
  makes them relevant.

## Contributing

- **Add vocabulary** entries to an existing bank, or add a new bank plus a
  template that uses it.
- **Add templates** — keep them grammatically compatible with the slots and with
  the optional `{lead}` opener.
- **Keep language neutral and observational.**
- **Do not** add complete, repetitive pre-written prompts. Variety must come from
  combination.

Estimate the combination space for a mode with
`combinationEstimate(mode)` from `src/engine`.
