import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = { appId:'com.storitellah.photocue', appName:'PhotoCue', webDir:'dist', backgroundColor:'#F4F0E7', plugins:{SplashScreen:{backgroundColor:'#F4F0E7',showSpinner:false},StatusBar:{backgroundColor:'#121212',style:'DARK'}}};
export default config;
