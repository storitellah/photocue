import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/photocue/' : '/',
  plugins: [VitePWA({ registerType:'prompt', includeAssets:['favicon.svg','apple-touch-icon.svg'], manifest:{name:'PhotoCue',short_name:'PhotoCue',description:'One-tap, location-aware photo prompts for documentary photographers and visual storytellers.',theme_color:'#121212',background_color:'#F4F0E7',display:'standalone',start_url:'.',icons:[{src:'icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]}, workbox:{navigateFallback:'index.html'} })]
}));
