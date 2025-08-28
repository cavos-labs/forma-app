'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  colors: {
    background: string;
    foreground: string;
    leftPanelBackground: string;
    leftPanelText: string;
    rightPanelBackground: string;
    rightPanelText: string;
    inputBackground: string;
    inputText: string;
    inputBorder: string;
    buttonBackground: string;
    buttonText: string;
    buttonHover: string;
    accent: string;
    muted: string;
    primary: string;
    card: string;
    border: string;
    text: string;
    mutedText: string;
    cardBackground: string;
  };
  logos: {
    leftLogo: string;
    rightLogo: string;
    rightIcon: string;
  };
}

function getThemeColors(theme: Theme) {
  if (theme === 'dark') {
    return {
      background: '#0a0a0a',
      foreground: '#ededed',
      leftPanelBackground: '#111111',
      leftPanelText: '#ededed',
      rightPanelBackground: '#1a1a1a',
      rightPanelText: '#ededed',
      inputBackground: '#2a2a2a',
      inputText: '#ededed',
      inputBorder: '#404040',
      buttonBackground: '#ededed',
      buttonText: '#111111',
      buttonHover: '#d4d4d4',
      accent: '#ededed',
      muted: '#a1a1aa',
      primary: '#f0f0f0',
      card: '#1f1f1f',
      border: '#404040',
      text: '#ededed',
      mutedText: '#a1a1aa',
      cardBackground: '#1f1f1f',
    };
  }
  
  // Light theme (Forma brand colors)
  return {
    background: '#ffffff',
    foreground: '#373737',
    leftPanelBackground: '#373737',
    leftPanelText: '#F0F0F0',
    rightPanelBackground: '#ffffff',
    rightPanelText: '#373737',
    inputBackground: '#ffffff',
    inputText: '#373737',
    inputBorder: '#d1d5db',
    buttonBackground: '#373737',
    buttonText: '#F0F0F0',
    buttonHover: '#2a2a2a',
    accent: '#373737',
    muted: '#666666',
    primary: '#373737',
    card: '#f9fafb',
    border: '#d1d5db',
    text: '#373737',
    mutedText: '#666666',
    cardBackground: '#f9fafb',
  };
}

function getThemeLogos(theme: Theme) {
  if (theme === 'dark') {
    return {
      leftLogo: '/images/forma-logo-white.png',
      rightLogo: '/images/forma-logo-white.png',
      rightIcon: '/images/forma-icon-white.png',
    };
  }
  
  return {
    leftLogo: '/images/forma-logo-white.png', // Always white on left (dark background)
    rightLogo: '/images/forma-logo-black.png',
    rightIcon: '/images/forma-icon-black.png',
  };
}

function detectSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('forma_theme') as Theme;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      setTheme(savedTheme);
    } else {
      const systemTheme = detectSystemTheme();
      setTheme(systemTheme);
    }
  }, []);

  // Save theme preference and apply to document
  useEffect(() => {
    localStorage.setItem('forma_theme', theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const toggleTheme = () => {
    setTheme(current => current === 'light' ? 'dark' : 'light');
  };

  const colors = getThemeColors(theme);
  const logos = getThemeLogos(theme);

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme: handleSetTheme, 
      toggleTheme,
      colors,
      logos
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}