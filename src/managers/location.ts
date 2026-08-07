/**
 * Location context manager.
 *
 * PhotoCue only ever needs an *approximate* sense of place, and it asks the
 * browser for coordinates solely to convert them into a coarse label. It never
 * stores exact coordinates, and it never requests permission until the user
 * activates the feature. No map libraries are loaded on the main screen.
 */

export interface ApproxLocationResult {
  ok: boolean;
  label?: string;
  reason?: string;
}

/**
 * Request the device's approximate location once, after explicit user action.
 * Coordinates are rounded to ~1km and immediately discarded; only a neutral
 * label is returned. The caller is responsible for showing the consent copy
 * before calling this.
 */
export function requestApproxLocation(): Promise<ApproxLocationResult> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ ok: false, reason: 'Location is not available on this device.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        // We intentionally ignore the precise coordinates. The value of the
        // feature is that the user did not have to type a place — not that we
        // know exactly where they are.
        resolve({ ok: true, label: 'My approximate location' });
      },
      (err) => {
        resolve({
          ok: false,
          reason:
            err && err.code === err.PERMISSION_DENIED
              ? 'Location permission was declined. Enter a place instead.'
              : 'Location is unavailable right now. Enter a place instead.',
        });
      },
      { enableHighAccuracy: false, maximumAge: 3_600_000, timeout: 10_000 },
    );
  });
}

/** Consent copy shown before the permission prompt. */
export const LOCATION_CONSENT =
  'PhotoCue will ask your device for an approximate location to tailor prompts. ' +
  'Exact coordinates are never stored or shared. Continue?';
