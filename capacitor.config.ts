
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.meetinthemiddle.app',
  appName: 'Meet In The Middle',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  android: {
    path: 'android'
  }
};

export default config;
