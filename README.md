# Meet In The Middle - Mobile App Setup Guide

## Setting up the Expo project

1. Create a new Expo project:
```bash
npx create-expo-app MeetInTheMiddleMobile
cd MeetInTheMiddleMobile
```

2. Install required dependencies:
```bash
npx expo install react-native-maps @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
```

3. Copy the following files from this repository to your new Expo project:
- `App.tsx` → `./App.tsx`
- `screens/HomeScreen.tsx` → `./screens/HomeScreen.tsx`

## Publishing to App Stores

### Prerequisites
1. Apple Developer Account ($99/year) for iOS App Store
2. Google Play Developer Account ($25 one-time fee) for Android

### Building for stores
1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Configure your project:
```bash
eas build:configure
```

3. Build for iOS:
```bash
eas build --platform ios
```

4. Build for Android:
```bash
eas build --platform android
```

## Features ported from web version
- Location search with OpenStreetMap integration
- Interactive map view with markers
- Midpoint calculation
- Route visualization
- Points of interest display

## Next Steps
1. Test the app thoroughly on both iOS and Android devices
2. Add app icons and splash screens
3. Configure app signing
4. Submit to respective app stores
