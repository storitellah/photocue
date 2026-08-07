# Accessibility

PhotoCue targets **WCAG 2.2 AA**.

## What is implemented

- **Keyboard:** every control is reachable and operable by keyboard. The spinner
  works as a normal button; the spacebar spins when focus is not in a field.
  Spinning gestures are never the only way to generate a prompt.
- **Visible focus:** a high-contrast focus ring (`:focus-visible`) on all
  interactive elements.
- **Screen-reader labels:** the dial, location control, icon buttons, and status
  pills carry text alternatives. Decorative SVG is `aria-hidden`.
- **Live announcements:** a polite `aria-live` region announces each new prompt
  (title + assignment) so screen-reader users hear it without moving focus.
- **Reduced motion:** honours `prefers-reduced-motion` and an explicit Motion
  setting; the dial then uses a quick fade instead of rotation.
- **High-contrast mode:** a setting that strengthens borders and separation.
- **Adjustable text size:** Default / Large / Extra large, scaling the whole UI.
- **Colour-independent status:** difficulty and prompt status use words and
  shapes, not colour alone.
- **Accessible forms:** every field has an associated `<label>`.
- **Logical reading order:** DOM order matches visual order; a skip link jumps to
  main content.
- **Targets:** interactive controls are at least 44×44 px.
- **Orientation:** portrait and landscape both supported; a prompt is not lost on
  rotation (layout is CSS-driven, state is preserved).

## Testing

- `tests/ui-smoke.test.ts` exercises the render/interaction path in jsdom.
- Manual checks: keyboard-only traversal, VoiceOver/TalkBack spot checks, and
  layout at 320 px, common iPhone/Android widths, tablet portrait/landscape, and
  desktop.
