import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'de.spielfinder.app',
  appName: 'sravel',
  webDir: 'dist',
  ios: {
    contentInset: 'always',
    backgroundColor: '#F9FAFB',
    scrollEnabled: false,
  },
  android: {
    backgroundColor: '#F9FAFB',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#2563EB',
      iosSpinnerStyle: 'small',
      spinnerColor: '#ffffff',
      showSpinner: false,
    },
    StatusBar: {
      style: 'Dark',
      backgroundColor: '#ffffff',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
}

export default config
