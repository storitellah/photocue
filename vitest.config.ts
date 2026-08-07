import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      // The PWA virtual module only exists under Vite; stub it for tests.
      'virtual:pwa-register': fileURLToPath(new URL('./tests/stubs/pwa-register.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // fake-indexeddb/auto and jsdom are enabled per-file where needed.
  },
});
