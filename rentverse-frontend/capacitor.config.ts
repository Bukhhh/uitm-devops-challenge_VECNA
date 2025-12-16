import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rentverseVECNA.app',
  appName: 'Rentverse-VECNA',
  webDir: 'out',
  server: {
    // For development, use your local server
    // url: 'http://YOUR_IP:3001',
    // cleartext: true,

    // For production, leave commented (uses bundled assets)
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
