import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rentverse.app',
  appName: 'RentVerse',
  webDir: 'out',
  server: {
    // Will be updated after Vercel deployment
    // url: 'https://your-app.vercel.app',
    // cleartext: false,
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1a1a2e',
    },
  },
};

export default config;
