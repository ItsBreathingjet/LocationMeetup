
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.meetinthemiddle.app',
  appName: 'Meet In The Middle',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
