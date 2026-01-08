import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'midnight' | 'dim' | 'forest' | 'sunset';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { value: Theme; label: string; description: string }[];
}

const themes: { value: Theme; label: string; description: string }[] = [
  { value: 'light', label: 'Light', description: 'Clean and bright' },
  { value: 'dark', label: 'Dark', description: 'Easy on the eyes' },
  { value: 'midnight', label: 'Midnight', description: 'Deep black AMOLED' },
  { value: 'dim', label: 'Dim', description: 'Soft muted dark' },
  { value: 'forest', label: 'Forest', description: 'Nature-inspired green' },
  { value: 'sunset', label: 'Sunset', description: 'Warm orange tones' },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem('app-theme') as Theme;
    return stored || 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'midnight', 'dim', 'forest', 'sunset');
    // Add current theme class
    root.classList.add(theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
