import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { LightColors, DarkColors } from '../constants/Colores';

const ThemeContext = createContext({
  theme: 'system' as 'light' | 'dark' | 'system',
  setTheme: (t: 'light' | 'dark' | 'system') => {},
  colors: LightColors,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const effectiveScheme = theme === 'system' ? systemScheme : theme;
  const colors = effectiveScheme === 'dark' ? DarkColors : LightColors;
  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
