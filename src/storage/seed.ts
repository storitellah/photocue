/**
 * Anonymous installation seed.
 *
 * Generated once per install using secure randomness, stored locally, and never
 * transmitted. It seeds the prompt engine so two installations receive
 * different prompt sequences. It is deliberately excluded from any *shared*
 * backup so a shared file cannot fingerprint the exporting device.
 */

import { secureEntropy } from '../util/rng';

const KEY = 'pc-installation-seed';

export function getInstallationSeed(): string {
  let seed: string | null = null;
  try {
    seed = localStorage.getItem(KEY);
  } catch {
    /* ignore */
  }
  if (!seed) {
    const parts = Array.from({ length: 4 }, () => secureEntropy().toString(36));
    seed = parts.join('-');
    try {
      localStorage.setItem(KEY, seed);
    } catch {
      /* ephemeral seed for this session only */
    }
  }
  return seed;
}

export function resetInstallationSeed(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
