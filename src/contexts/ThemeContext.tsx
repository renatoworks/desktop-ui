/**
 * ============================================================================
 * THEME CONTEXT
 * ============================================================================
 *
 * Provides theming capabilities for the desktop UI.
 * Supports light and dark modes with CSS variables.
 *
 * @packageDocumentation
 */

'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  ReactNode,
} from 'react';

/* ==========================================================================
   TYPES
   ========================================================================== */

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  /** Window background */
  windowBg: string;
  /** Window background when blurred/inactive */
  windowBgBlurred: string;
  /** Title bar background when active */
  titleBarBg: string;
  /** Title bar background when inactive */
  titleBarBgInactive: string;
  /** Border color */
  border: string;
  /** Primary text color */
  textPrimary: string;
  /** Secondary/muted text color */
  textSecondary: string;
  /** URL bar background */
  urlBarBg: string;
  /** Hover background for buttons */
  hoverBg: string;
  /** Overlay for loading states */
  overlayBg: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
}

export interface ThemeContextValue {
  /** Current theme mode */
  mode: ThemeMode;
  /** Current theme colors */
  colors: ThemeColors;
  /** Toggle between light and dark mode */
  toggleTheme: () => void;
  /** Set specific theme mode */
  setTheme: (mode: ThemeMode) => void;
  /** Whether dark mode is active */
  isDark: boolean;
}

/* ==========================================================================
   THEME DEFINITIONS
   ========================================================================== */

export const darkTheme: ThemeColors = {
  windowBg: 'rgba(0, 0, 0, 0.7)',
  windowBgBlurred: 'rgba(0, 0, 0, 0.5)',
  titleBarBg: 'rgb(39, 39, 42)', // zinc-800
  titleBarBgInactive: 'rgb(58, 58, 64)', // #3a3a40
  border: 'rgb(63, 63, 70)', // zinc-700
  textPrimary: 'rgb(255, 255, 255)',
  textSecondary: 'rgb(161, 161, 170)', // zinc-400
  urlBarBg: 'rgba(24, 24, 27, 0.8)', // zinc-900/80
  hoverBg: 'rgb(63, 63, 70)', // zinc-700
  overlayBg: 'rgb(24, 24, 27)', // zinc-900
};

export const lightTheme: ThemeColors = {
  windowBg: 'rgba(255, 255, 255, 0.9)',
  windowBgBlurred: 'rgba(255, 255, 255, 0.7)',
  titleBarBg: 'rgb(244, 244, 245)', // zinc-100
  titleBarBgInactive: 'rgb(228, 228, 231)', // zinc-200
  border: 'rgb(212, 212, 216)', // zinc-300
  textPrimary: 'rgb(24, 24, 27)', // zinc-900
  textSecondary: 'rgb(113, 113, 122)', // zinc-500
  urlBarBg: 'rgba(244, 244, 245, 0.8)', // zinc-100/80
  hoverBg: 'rgb(228, 228, 231)', // zinc-200
  overlayBg: 'rgb(250, 250, 250)', // zinc-50
};

/* ==========================================================================
   CONTEXT
   ========================================================================== */

const ThemeContext = createContext<ThemeContextValue | null>(null);

/* ==========================================================================
   PROVIDER
   ========================================================================== */

export interface ThemeProviderProps {
  children: ReactNode;
  /** Initial theme mode (defaults to 'dark') */
  defaultTheme?: ThemeMode;
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultTheme);

  const colors = mode === 'dark' ? darkTheme : lightTheme;

  const toggleTheme = useCallback(() => {
    setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  // Apply CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--desktop-window-bg', colors.windowBg);
    root.style.setProperty('--desktop-window-bg-blurred', colors.windowBgBlurred);
    root.style.setProperty('--desktop-titlebar-bg', colors.titleBarBg);
    root.style.setProperty('--desktop-titlebar-bg-inactive', colors.titleBarBgInactive);
    root.style.setProperty('--desktop-border', colors.border);
    root.style.setProperty('--desktop-text-primary', colors.textPrimary);
    root.style.setProperty('--desktop-text-secondary', colors.textSecondary);
    root.style.setProperty('--desktop-urlbar-bg', colors.urlBarBg);
    root.style.setProperty('--desktop-hover-bg', colors.hoverBg);
    root.style.setProperty('--desktop-overlay-bg', colors.overlayBg);
    root.setAttribute('data-desktop-theme', mode);
  }, [colors, mode]);

  const value: ThemeContextValue = useMemo(
    () => ({
      mode,
      colors,
      toggleTheme,
      setTheme,
      isDark: mode === 'dark',
    }),
    [mode, colors, toggleTheme, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/* ==========================================================================
   HOOK
   ========================================================================== */

/**
 * Hook to access theme context.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isDark, toggleTheme, colors } = useTheme();
 *   return (
 *     <button onClick={toggleTheme}>
 *       {isDark ? 'Switch to Light' : 'Switch to Dark'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Optional hook that returns null if not in a ThemeProvider.
 * Useful for components that can work with or without theming.
 */
export function useThemeOptional(): ThemeContextValue | null {
  return useContext(ThemeContext);
}
