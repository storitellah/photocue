/**
 * Tiny DOM helpers. No framework — PhotoCue keeps its initial bundle small by
 * rendering strings and binding events directly. `html` is a passthrough tag
 * used purely for editor highlighting; it does NOT escape — callers must run
 * every dynamic value through `escapeHtml` from util/sanitize.
 */

export function html(strings: TemplateStringsArray, ...values: unknown[]): string {
  return strings.reduce((acc, s, i) => acc + s + (i < values.length ? String(values[i] ?? '') : ''), '');
}

export function qs<T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T | null {
  return root.querySelector<T>(sel);
}

export function qsa<T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(sel));
}

export function on<K extends keyof HTMLElementEventMap>(
  el: Element | null,
  type: K,
  handler: (ev: HTMLElementEventMap[K]) => void,
): void {
  el?.addEventListener(type, handler as EventListener);
}

/** Politely announce a message to assistive technology via the live region. */
export function announce(message: string): void {
  const region = document.getElementById('announce');
  if (region) {
    region.textContent = '';
    // A microtask gap ensures screen readers register the change.
    requestAnimationFrame(() => {
      region.textContent = message;
    });
  }
}

/** True when the user prefers reduced motion (system or forced by settings). */
export function prefersReducedMotion(force: 'system' | 'on' | 'off'): boolean {
  if (force === 'on') return true;
  if (force === 'off') return false;
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}
