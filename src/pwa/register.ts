/**
 * PWA lifecycle: service-worker registration, update notification, and the
 * install prompt. All optional online behaviour degrades gracefully — the app
 * never blocks on any of it.
 */

import { registerSW } from 'virtual:pwa-register';

type UpdateHandler = () => void;

let deferredInstall: BeforeInstallPromptEvent | null = null;
let onUpdateReady: UpdateHandler | null = null;
let refresh: (() => Promise<void>) | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function initPwa(handlers: { onUpdate?: UpdateHandler; onInstallable?: () => void } = {}): void {
  onUpdateReady = handlers.onUpdate ?? null;

  if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstall = e as BeforeInstallPromptEvent;
      handlers.onInstallable?.();
    });
    window.addEventListener('appinstalled', () => {
      deferredInstall = null;
    });
  }

  try {
    refresh = registerSW({
      immediate: true,
      onNeedRefresh() {
        onUpdateReady?.();
      },
      onOfflineReady() {
        /* Cached and ready to work offline. */
      },
    });
  } catch {
    // Service workers unavailable (e.g. during SSR/tests). App still runs.
  }
}

/** Whether the browser has offered a native install prompt. */
export function canInstall(): boolean {
  return deferredInstall !== null;
}

/** Show the native install prompt if available. */
export async function promptInstall(): Promise<boolean> {
  if (!deferredInstall) return false;
  await deferredInstall.prompt();
  const choice = await deferredInstall.userChoice;
  deferredInstall = null;
  return choice.outcome === 'accepted';
}

/** Apply a pending service-worker update and reload. */
export async function applyUpdate(): Promise<void> {
  if (refresh) {
    await refresh();
    if (typeof location !== 'undefined') location.reload();
  }
}

/**
 * Manually ask the browser to check for a newer service worker. If one is
 * found, the registered `onNeedRefresh` handler fires and the update banner
 * appears. Resolves `true` when a check was actually performed.
 */
export async function checkForUpdate(): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return false;
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return false;
    await reg.update();
    return true;
  } catch {
    return false;
  }
}
