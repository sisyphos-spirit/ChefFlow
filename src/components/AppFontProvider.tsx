import React from 'react';
import AppLoading from 'expo-app-loading';
import { useFonts } from 'expo-font';

export function AppFontProvider({ children }: { children: React.ReactNode }) {
  const [fontsLoaded] = useFonts({
    'Nunito-Regular': require('../assets/fonts/Nunito-Regular.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
  });
  if (!fontsLoaded) return <AppLoading />;
  return <>{children}</>;
}
