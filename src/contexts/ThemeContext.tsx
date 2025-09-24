import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ColorTheme {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    muted: string;
    mutedForeground: string;
  };
}

interface ThemeContextType {
  mode: ThemeMode;
  colorTheme: ColorTheme;
  previewTheme: ColorTheme | null;
  setMode: (mode: ThemeMode) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setPreviewTheme: (theme: ColorTheme | null) => void;
  applyPreview: () => void;
  colorThemes: ColorTheme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Predefined color themes
const defaultColorThemes: ColorTheme[] = [
  {
    id: 'default',
    name: 'Default',
    colors: {
      primary: '217 91% 60%',
      primaryForeground: '0 0% 98%',
      secondary: '214 32% 91%',
      secondaryForeground: '222 84% 5%',
      accent: '214 32% 91%',
      accentForeground: '222 84% 5%',
      muted: '214 32% 91%',
      mutedForeground: '215 16% 47%',
    },
  },
  {
    id: 'blue',
    name: 'Blue',
    colors: {
      primary: '221 83% 53%',
      primaryForeground: '0 0% 98%',
      secondary: '214 32% 91%',
      secondaryForeground: '222 84% 5%',
      accent: '221 83% 53%',
      accentForeground: '0 0% 98%',
      muted: '214 32% 91%',
      mutedForeground: '215 16% 47%',
    },
  },
  {
    id: 'green',
    name: 'Green',
    colors: {
      primary: '142 76% 36%',
      primaryForeground: '0 0% 98%',
      secondary: '214 32% 91%',
      secondaryForeground: '222 84% 5%',
      accent: '142 76% 36%',
      accentForeground: '0 0% 98%',
      muted: '214 32% 91%',
      mutedForeground: '215 16% 47%',
    },
  },
  {
    id: 'purple',
    name: 'Purple',
    colors: {
      primary: '262 83% 58%',
      primaryForeground: '0 0% 98%',
      secondary: '214 32% 91%',
      secondaryForeground: '222 84% 5%',
      accent: '262 83% 58%',
      accentForeground: '0 0% 98%',
      muted: '214 32% 91%',
      mutedForeground: '215 16% 47%',
    },
  },
  {
    id: 'red',
    name: 'Red',
    colors: {
      primary: '0 72% 51%',
      primaryForeground: '0 0% 98%',
      secondary: '214 32% 91%',
      secondaryForeground: '222 84% 5%',
      accent: '0 72% 51%',
      accentForeground: '0 0% 98%',
      muted: '214 32% 91%',
      mutedForeground: '215 16% 47%',
    },
  },
  {
    id: 'orange',
    name: 'Orange',
    colors: {
      primary: '25 95% 53%',
      primaryForeground: '0 0% 98%',
      secondary: '214 32% 91%',
      secondaryForeground: '222 84% 5%',
      accent: '25 95% 53%',
      accentForeground: '0 0% 98%',
      muted: '214 32% 91%',
      mutedForeground: '215 16% 47%',
    },
  },
  {
    id: 'pink',
    name: 'Pink',
    colors: {
      primary: '336 75% 40%',
      primaryForeground: '0 0% 98%',
      secondary: '214 32% 91%',
      secondaryForeground: '222 84% 5%',
      accent: '336 75% 40%',
      accentForeground: '0 0% 98%',
      muted: '214 32% 91%',
      mutedForeground: '215 16% 47%',
    },
  },
  {
    id: 'teal',
    name: 'Teal',
    colors: {
      primary: '173 58% 39%',
      primaryForeground: '0 0% 98%',
      secondary: '214 32% 91%',
      secondaryForeground: '222 84% 5%',
      accent: '173 58% 39%',
      accentForeground: '0 0% 98%',
      muted: '214 32% 91%',
      mutedForeground: '215 16% 47%',
    },
  },
];

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(defaultColorThemes[0]);
  const [previewTheme, setPreviewTheme] = useState<ColorTheme | null>(null);

  // Load saved preferences on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('scheduler_theme_mode') as ThemeMode;
    const savedColorTheme = localStorage.getItem('scheduler_color_theme');
    
    if (savedMode) {
      setModeState(savedMode);
    }
    
    if (savedColorTheme) {
      const parsed = JSON.parse(savedColorTheme);
      const theme = defaultColorThemes.find(t => t.id === parsed.id) || defaultColorThemes[0];
      setColorThemeState(theme);
    }
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = previewTheme || colorTheme;
    
    // Apply color theme
    Object.entries(currentTheme.colors).forEach(([key, value]) => {
      const cssVar = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssVar}`, value);
    });
    
    // Apply theme mode
    const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'system') {
        root.classList.toggle('dark', mediaQuery.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode, colorTheme, previewTheme]);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('scheduler_theme_mode', newMode);
  };

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem('scheduler_color_theme', JSON.stringify(theme));
  };

  const applyPreview = () => {
    if (previewTheme) {
      setColorTheme(previewTheme);
      setPreviewTheme(null);
    }
  };

  const value = {
    mode,
    colorTheme,
    previewTheme,
    setMode,
    setColorTheme,
    setPreviewTheme,
    applyPreview,
    colorThemes: defaultColorThemes,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}