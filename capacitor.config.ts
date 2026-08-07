import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor configuration for native Android and iOS packaging.
 *
 * The browser build does not depend on any of this — native packaging is
 * optional. `webDir` points at the Vite production output.
 */
const config: CapacitorConfig = {
  appId: 'com.storitellah.photocue',
  appName: 'PhotoCue',
  webDir: 'dist',
  backgroundColor: '#F4F0E7',
  android: {
    backgroundColor: '#F4F0E7',
  },
  ios: {
    backgroundColor: '#F4F0E7',
    contentInset: 'always',
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#F4F0E7',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      backgroundColor: '#F4F0E7',
      style: 'LIGHT',
      overlaysWebView: false,
    },
    Haptics: {},
  },
};

export default config;
