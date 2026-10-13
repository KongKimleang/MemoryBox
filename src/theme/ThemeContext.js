import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from './colors';

const ThemeContext = createContext();
const THEME_KEY = 'memorybox-theme';

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'light' or 'dark' from the phone
  const [mode, setMode] = useState('system'); // 'system', 'light' or 'dark'

  // Load the saved choice when the app starts
  useEffect(() => {
    async function loadMode() {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved === 'system' || saved === 'light' || saved === 'dark') {
          setMode(saved);
        }
      } catch (error) {
        console.log('Could not load theme', error);
      }
    }
    loadMode();
  }, []);

  function changeMode(newMode) {
    setMode(newMode);
    AsyncStorage.setItem(THEME_KEY, newMode).catch((error) =>
      console.log('Could not save theme', error)
    );
  }

  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  const value = { mode, changeMode, isDark, colors };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Shortcut: const { colors } = useTheme();
export function useTheme() {
  return useContext(ThemeContext);
}