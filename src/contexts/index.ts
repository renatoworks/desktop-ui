/**
 * ============================================================================
 * CONTEXTS - PUBLIC EXPORTS
 * ============================================================================
 */

export {
  DesktopProvider,
  useDesktopContext,
  useWindow,
  DesktopContext,
} from './DesktopContext';

export {
  ThemeProvider,
  useTheme,
  useThemeOptional,
  darkTheme,
  lightTheme,
} from './ThemeContext';

export type {
  ThemeMode,
  ThemeColors,
  Theme,
  ThemeContextValue,
  ThemeProviderProps,
} from './ThemeContext';
