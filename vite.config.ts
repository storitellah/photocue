import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * PhotoCue build configuration.
 *
 * Static-first and host-agnostic. The public base path is driven by the
 * `BASE_PATH` env var and defaults to `/` — correct for root-served hosts such
 * as Cloudflare Pages, Netlify, and local dev. GitHub Pages serves from the
 * `/photocue/` sub-path, so its workflow sets `BASE_PATH=/photocue/`. The PWA
 * plugin generates the service worker (offline caching + navigation fallback)
 * and the web manifest with the full icon set.
 */
export default defineConfig(() => {
  const base = process.env.BASE_PATH ?? '/';
  return {
    base,
    build: {
      target: 'es2020',
      sourcemap: false,
      rollupOptions: {
        output: {
          // Keep the initial chunk small; jsPDF is split out automatically via
          // dynamic import, so it never enters the main bundle.
          manualChunks: undefined,
        },
      },
    },
    plugins: [
      VitePWA({
        registerType: 'prompt',
        includeAssets: [
          'favicon.svg',
          'apple-touch-icon.svg',
          'maskable-icon.svg',
          'icons/adaptive-foreground.svg',
          'icons/adaptive-background.svg',
        ],
        manifest: {
          name: 'PhotoCue',
          short_name: 'PhotoCue',
          description:
            'One-tap, location-aware photo prompts for documentary photographers and visual storytellers.',
          categories: ['photography', 'productivity', 'education'],
          lang: 'en',
          dir: 'ltr',
          theme_color: '#F4F0E7',
          background_color: '#F4F0E7',
          display: 'standalone',
          orientation: 'any',
          start_url: '.',
          scope: '.',
          icons: [
            { src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
            { src: 'maskable-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
            { src: 'apple-touch-icon.svg', sizes: '180x180', type: 'image/svg+xml', purpose: 'any' },
          ],
          shortcuts: [
            { name: 'Spin a Prompt', url: './#/spin' },
            { name: 'Your stories', url: './#/stories' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api/],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
  };
});
