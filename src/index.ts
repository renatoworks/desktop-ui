/**
 * ============================================================================
 * @renatoworks/desktop-ui
 * ============================================================================
 *
 * A beautiful, declarative macOS-style desktop environment for React.
 * Create draggable windows, desktop icons, and full desktop experiences
 * with a simple configuration object.
 *
 * @example
 * ```tsx
 * import { Desktop, DesktopConfig } from '@renatoworks/desktop-ui';
 *
 * const config: DesktopConfig = {
 *   windows: [
 *     { id: 'terminal', type: 'app', title: 'Terminal', component: MyTerminal },
 *     { id: 'browser', type: 'browser', title: 'Browser', url: '/web' },
 *   ],
 *   icons: [
 *     { id: 'term-icon', windowId: 'terminal', icon: <Terminal />, label: 'Terminal' },
 *     { id: 'web-icon', windowId: 'browser', icon: <Globe />, label: 'Web' },
 *   ],
 *   background: {
 *     type: 'gradient',
 *     gradient: 'linear-gradient(to bottom, #1a1a2e, #16213e)',
 *   },
 * };
 *
 * function App() {
 *   return <Desktop config={config} />;
 * }
 * ```
 *
 * @packageDocumentation
 */

/* ==========================================================================
   COMPONENTS
   ========================================================================== */

export { Desktop, Window, DesktopIcon } from './components';
export type { DesktopProps, WindowProps, DesktopIconRef, DesktopIconProps } from './components';

/* ==========================================================================
   HOOKS
   ========================================================================== */

export { useWindowManager } from './hooks';

/* ==========================================================================
   CONTEXTS
   ========================================================================== */

export {
  DesktopProvider,
  useDesktopContext,
  useWindow,
  // Theme
  ThemeProvider,
  useTheme,
  useThemeOptional,
  darkTheme,
  lightTheme,
} from './contexts';

export type {
  ThemeMode,
  ThemeColors,
  Theme,
  ThemeContextValue,
  ThemeProviderProps,
} from './contexts';

/* ==========================================================================
   TYPES
   ========================================================================== */

// Configuration types
export type {
  DesktopConfig,
  WindowConfig,
  AppWindowConfig,
  BrowserWindowConfig,
  DesktopIconConfig,
  BackgroundConfig,
  ColorBackground,
  ImageBackground,
  GradientBackground,
  IconLayoutConfig,
} from './types';

// Dimension types
export type {
  WindowDimensions,
  FixedDimensions,
  ResponsiveDimensions,
  BreakpointDimensions,
} from './types';

// State types
export type {
  WindowState,
  ClosedWindowState,
  OpenWindowState,
  MinimizedWindowState,
  WindowActions,
  WindowInstance,
} from './types';

// Context and hook types
export type {
  DesktopContextValue,
  WindowManagerCore,
  UseWindowManagerReturn,
} from './types';

// Validation types
export type { ValidationResult } from './types';

/* ==========================================================================
   TYPE GUARDS & HELPERS
   ========================================================================== */

export {
  // Window config type guards
  isAppWindow,
  isBrowserWindow,

  // Window state type guards
  isWindowOpen,
  isWindowClosed,
  isWindowMinimized,

  // Dimension type guards
  isFixedDimensions,
  isResponsiveDimensions,

  // State factory functions
  createClosedState,
  createOpenState,
  createMinimizedState,

  // Validation
  validateDesktopConfig,
  assertValidConfig,
} from './types';

/* ==========================================================================
   RE-EXPORT WINDOW TYPE
   ========================================================================== */

export type { WindowType } from './types';
