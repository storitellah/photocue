// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../src/ui/app';

/**
 * End-to-end smoke test of the rendering + interaction path in jsdom. This
 * exercises the components, escaping, routing, and the spin → prompt-card flow
 * without a real browser.
 */

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = '<div id="app"></div>';
  location.hash = '#/spin';
});

// Let any trailing async work started by a spin (history writes, dynamic
// imports) settle before the environment is torn down, so nothing runs after.
afterEach(async () => {
  await new Promise((resolve) => setTimeout(resolve, 20));
});

function mount(): App {
  const root = document.getElementById('app')!;
  return new App(root);
}

describe('UI smoke — spin flow', () => {
  it('renders the shell, dial, and navigation', () => {
    mount();
    expect(document.querySelector('.app-header')).toBeTruthy();
    expect(document.querySelector('.dial')).toBeTruthy();
    expect(document.querySelectorAll('.nav-item').length).toBe(4);
    expect(document.querySelector('#spin-button')).toBeTruthy();
  });

  it('generates a prompt card when the spin button is pressed', async () => {
    mount();
    (document.querySelector('#spin-button') as HTMLButtonElement).click();
    // Allow the async spin() to resolve (history read + render).
    await vi.waitFor(() => {
      expect(document.querySelector('.prompt-card')).toBeTruthy();
    });
    const card = document.querySelector('.prompt-card')!;
    expect(card.querySelector('.prompt-title')!.textContent!.length).toBeGreaterThan(2);
    expect(card.querySelector('.assignment')!.textContent!.length).toBeGreaterThan(10);
    // The live region announces the new prompt.
    expect(document.getElementById('announce')).toBeTruthy();
  });

  it('escapes a malicious location so it cannot inject markup', async () => {
    mount();
    const input = document.querySelector('#location') as HTMLInputElement;
    input.value = '<img src=x onerror=alert(1)>';
    input.dispatchEvent(new Event('change'));
    (document.querySelector('#dial') as HTMLElement).click();
    await vi.waitFor(() => expect(document.querySelector('.prompt-card')).toBeTruthy());
    // No <img> element should have been created from the location text.
    expect(document.querySelector('.prompt-card img')).toBeNull();
  });

  it('navigates to settings and renders local-data controls', () => {
    const app = mount();
    location.hash = '#/settings';
    // hashchange listener drives the render.
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    expect(document.querySelector('.settings')).toBeTruthy();
    expect(document.querySelector('#set-delete')).toBeTruthy();
    expect(document.querySelector('#set-export')).toBeTruthy();
    void app;
  });
});
