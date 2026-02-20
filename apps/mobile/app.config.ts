import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Coto',
  slug: 'coto',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'coto',
  newArchEnabled: true,
  ios: {
    bundleIdentifier: 'com.coto.app',
    supportsTablet: false,
  },
  android: {
    package: 'com.coto.app',
    adaptiveIcon: {
      backgroundColor: '#ffffff',
    },
  },
  plugins: [
    'expo-secure-store',
  ],
  extra: {
    apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:8000',
    environment: process.env.APP_ENV ?? 'development',
  },
});
