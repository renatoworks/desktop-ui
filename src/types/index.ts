/**
 * ============================================================================
 * DESKTOP UI - TYPE DEFINITIONS
 * ============================================================================
 *
 * This file contains all TypeScript interfaces and types for the Desktop UI
 * component library. These types define the configuration schema that users
 * will use to declaratively create their desktop environments.
 *
 * @packageDocumentation
 */

import { ReactNode, ReactElement, ComponentType, RefObject } from 'react';

/* ==========================================================================
   WINDOW TYPES
   ========================================================================== */

/**
 * The type of window determines its behavior and appearance.
 *
 * @remarks
 * - `app`: Renders a React component inside the window. Best for custom UIs.
 * - `browser`: Renders an iframe with browser-style chrome (URL bar, reload).
 */
export type WindowType = 'app' | 'browser';

/* ==========================================================================
   DIMENSIONS - With Discriminant for Runtime Safety
   ========================================================================== */

/**
 * Fixed dimensions for a window (non-responsive).
 *
 * @example
 * ```ts
 * const dimensions: FixedDimensions = {
 *   responsive: false,
 *   width: '800px',
 *   height: '600px',
 *   minWidth: 400,
 *   minHeight: 300,
 * }
 * ```
 */
export interface FixedDimensions {
  /** Discriminant: false = fixed dimensions */
  responsive: false;
  /** Width of the window. Accepts px, vw, vh, or % */
  width: string;
  /** Height of the window. Accepts px, vw, vh, or % */
  height: string;
  /** Minimum width in pixels */
  minWidth?: number;
  /** Minimum height in pixels */
  minHeight?: number;
  /** Initial X position from left edge */
  initialX?: number;
  /** Initial Y position from top edge */
  initialY?: number;
}

/**
 * Dimension values for a specific breakpoint.
 */
export interface BreakpointDimensions {
  /** Width of the window. Accepts px, vw, vh, or % */
  width: string;
  /** Height of the window. Accepts px, vw, vh, or % */
  height: string;
  /** Minimum width in pixels */
  minWidth?: number;
  /** Minimum height in pixels */
  minHeight?: number;
  /** Initial X position from left edge */
  initialX?: number;
  /** Initial Y position from top edge */
  initialY?: number;
}

/**
 * Responsive dimension configuration for different screen sizes.
 *
 * @example
 * ```ts
 * const dimensions: ResponsiveDimensions = {
 *   responsive: true,
 *   mobile: { width: '100vw', height: '100vh' },
 *   tablet: { width: '80vw', height: '80vh' },
 *   desktop: { width: '800px', height: '600px' },
 * }
 * ```
 */
export interface ResponsiveDimensions {
  /** Discriminant: true = responsive dimensions */
  responsive: true;
  /** Dimensions for mobile devices (< 768px) */
  mobile?: BreakpointDimensions;
  /** Dimensions for tablets (768px - 1024px) */
  tablet?: BreakpointDimensions;
  /** Dimensions for desktop (> 1024px) */
  desktop?: BreakpointDimensions;
}

/**
 * Window dimensions - either fixed or responsive.
 * Use the `responsive` discriminant to determine which type at runtime.
 */
export type WindowDimensions = FixedDimensions | ResponsiveDimensions;

/**
 * Type guard to check if dimensions are responsive.
 */
export function isResponsiveDimensions(
  dims: WindowDimensions
): dims is ResponsiveDimensions {
  return dims.responsive === true;
}

/**
 * Type guard to check if dimensions are fixed.
 */
export function isFixedDimensions(
  dims: WindowDimensions
): dims is FixedDimensions {
  return dims.responsive === false;
}

/* ==========================================================================
   WINDOW CONFIGURATION
   ========================================================================== */

/**
 * Base configuration shared by all window types.
 */
interface WindowConfigBase {
  /** Unique identifier for the window */
  id: string;
  /** Title displayed in the window's title bar */
  title: string;
  /** Icon displayed in the title bar (ReactElement) */
  icon?: ReactElement;
  /** Window dimensions (fixed or responsive) */
  dimensions?: WindowDimensions;
  /** Whether the window can be minimized (default: true) */
  canMinimize?: boolean;
  /** Whether the window can be maximized (default: true on desktop) */
  canMaximize?: boolean;
  /** Whether the window can be resized (default: true on desktop) */
  canResize?: boolean;
  /** Hide the title bar completely */
  hideTitleBar?: boolean;
  /** Open the window maximized (default: false) */
  openMaximized?: boolean;
}

/**
 * Configuration for an "app" type window that renders a React component.
 *
 * @example
 * ```ts
 * const terminalWindow: AppWindowConfig = {
 *   id: 'terminal',
 *   type: 'app',
 *   title: 'Terminal',
 *   icon: <Terminal className="w-4 h-4" />,
 *   component: TerminalComponent,
 *   componentProps: { theme: 'dark' },
 * }
 * ```
 */
export interface AppWindowConfig extends WindowConfigBase {
  type: 'app';
  /** The React component to render inside the window */
  component: ComponentType<Record<string, unknown>>;
  /** Props to pass to the component */
  componentProps?: Record<string, unknown>;
}

/**
 * Configuration for a "browser" type window that renders an iframe.
 *
 * @example
 * ```ts
 * const webWindow: BrowserWindowConfig = {
 *   id: 'browser',
 *   type: 'browser',
 *   title: 'https://example.com',
 *   icon: <Globe className="w-4 h-4" />,
 *   url: 'https://example.com',
 *   showReloadButton: true,
 * }
 * ```
 */
export interface BrowserWindowConfig extends WindowConfigBase {
  type: 'browser';
  /** URL to load in the iframe */
  url: string;
  /** Show a reload button in the title bar (default: true) */
  showReloadButton?: boolean;
  /** Iframe sandbox attributes */
  sandbox?: string;
  /** Iframe allow attributes (for permissions) */
  allow?: string;
  /** Iframe referrer policy */
  referrerPolicy?: ReferrerPolicy;
}

/**
 * Union type for all window configurations.
 */
export type WindowConfig = AppWindowConfig | BrowserWindowConfig;

/**
 * Type guard to check if a window config is an app window.
 */
export function isAppWindow(config: WindowConfig): config is AppWindowConfig {
  return config.type === 'app';
}

/**
 * Type guard to check if a window config is a browser window.
 */
export function isBrowserWindow(
  config: WindowConfig
): config is BrowserWindowConfig {
  return config.type === 'browser';
}

/* ==========================================================================
   DESKTOP ICON CONFIGURATION
   ========================================================================== */

/**
 * Configuration for a desktop icon.
 *
 * @remarks
 * Each icon is linked to a window by its `windowId`. When the icon is
 * clicked, the corresponding window is opened.
 *
 * @example
 * ```ts
 * const terminalIcon: DesktopIconConfig = {
 *   id: 'terminal-icon',
 *   windowId: 'terminal',
 *   icon: <Terminal className="w-8 h-8 text-green-400" />,
 *   label: 'Terminal',
 * }
 * ```
 */
export interface DesktopIconConfig {
  /** Unique identifier for the icon */
  id: string;
  /** ID of the window to open when clicked */
  windowId: string;
  /**
   * The icon to display.
   * Can be a ReactElement (recommended) or an emoji string.
   *
   * @example
   * ```tsx
   * // Using a Lucide icon
   * icon: <Terminal className="w-8 h-8 text-green-400" />
   *
   * // Using an emoji
   * icon: "📁"
   * ```
   */
  icon: ReactElement | string;
  /** Label displayed below the icon */
  label: string;
  /** Initial X position (optional, auto-arranged if not set) */
  initialX?: number;
  /** Initial Y position (optional, auto-arranged if not set) */
  initialY?: number;
}

/* ==========================================================================
   BACKGROUND CONFIGURATION - Discriminated Union
   ========================================================================== */

/**
 * Solid color background.
 */
export interface ColorBackground {
  type: 'color';
  /** CSS color value (hex, rgb, hsl, named color) */
  color: string;
  /** Optional overlay for better icon visibility */
  overlay?: string;
}

/**
 * Image background.
 */
export interface ImageBackground {
  type: 'image';
  /** URL of the background image */
  url: string;
  /** CSS background-size value (default: 'cover') */
  size?: 'cover' | 'contain' | 'auto' | string;
  /** CSS background-position value (default: 'center') */
  position?: string;
  /** Optional overlay for better icon visibility */
  overlay?: string;
}

/**
 * Gradient background.
 */
export interface GradientBackground {
  type: 'gradient';
  /** CSS gradient value (e.g., 'linear-gradient(to bottom, #1a1a2e, #16213e)') */
  gradient: string;
  /** Optional overlay for better icon visibility */
  overlay?: string;
}

/**
 * Background configuration - discriminated union ensures type/value correspondence.
 *
 * @example
 * ```ts
 * // Color background
 * const bg1: BackgroundConfig = { type: 'color', color: '#1a1a2e' };
 *
 * // Image background
 * const bg2: BackgroundConfig = { type: 'image', url: '/wallpaper.jpg' };
 *
 * // Gradient background
 * const bg3: BackgroundConfig = {
 *   type: 'gradient',
 *   gradient: 'linear-gradient(to bottom, #1a1a2e, #16213e)',
 * };
 * ```
 */
export type BackgroundConfig =
  | ColorBackground
  | ImageBackground
  | GradientBackground;

/* ==========================================================================
   ICON LAYOUT CONFIGURATION
   ========================================================================== */

/**
 * Layout configuration for desktop icons.
 */
export interface IconLayoutConfig {
  /** Starting position for icons */
  startPosition: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Direction to arrange icons */
  direction: 'vertical' | 'horizontal';
  /** Gap between icons in pixels */
  gap: number;
  /** Padding from the edge of the screen */
  padding: number;
}

/* ==========================================================================
   DESKTOP CONFIGURATION
   ========================================================================== */

/**
 * Complete desktop configuration.
 *
 * @remarks
 * This is the main configuration object that users pass to the Desktop
 * component. It defines all windows, icons, and desktop settings.
 *
 * @example
 * ```tsx
 * const config: DesktopConfig = {
 *   windows: [
 *     { id: 'terminal', type: 'app', title: 'Terminal', component: Terminal },
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
 * }
 *
 * <Desktop config={config} />
 * ```
 */
export interface DesktopConfig {
  /** Array of window configurations */
  windows: WindowConfig[];
  /** Array of desktop icon configurations */
  icons: DesktopIconConfig[];
  /**
   * Background configuration (optional).
   * Used when darkBackground/lightBackground are not provided.
   */
  background?: BackgroundConfig;
  /**
   * Background for dark theme (optional).
   * Takes precedence over `background` when in dark mode.
   */
  darkBackground?: BackgroundConfig;
  /**
   * Background for light theme (optional).
   * Takes precedence over `background` when in light mode.
   */
  lightBackground?: BackgroundConfig;
  /** Icon layout configuration (optional) */
  iconLayout?: IconLayoutConfig;
  /** Auto-open a window on mount (by window ID) */
  autoOpenWindow?: string;
  /** Callback when desktop is ready */
  onReady?: () => void;
}

/* ==========================================================================
   WINDOW STATE - State Machine Approach (Illegal States Unrepresentable)
   ========================================================================== */

/**
 * Window is closed - not visible, not interactive.
 */
export interface ClosedWindowState {
  status: 'closed';
}

/**
 * Window is open and visible.
 */
export interface OpenWindowState {
  status: 'open';
  /** Whether this is the active/focused window */
  isActive: boolean;
  /** Whether the window is maximized to full screen */
  isMaximized: boolean;
  /** Z-index for stacking order */
  zIndex: number;
}

/**
 * Window is minimized (hidden but not closed).
 */
export interface MinimizedWindowState {
  status: 'minimized';
  /** Z-index for when it's restored */
  zIndex: number;
}

/**
 * Window state - discriminated union prevents illegal state combinations.
 *
 * @remarks
 * Using a state machine approach ensures that:
 * - A closed window cannot be active or maximized
 * - A minimized window cannot be active or maximized
 * - Only open windows can be active or maximized
 *
 * @example
 * ```ts
 * // Check window status
 * if (state.status === 'open') {
 *   console.log('Active:', state.isActive);
 *   console.log('Maximized:', state.isMaximized);
 * } else if (state.status === 'minimized') {
 *   console.log('Window is minimized');
 * } else {
 *   console.log('Window is closed');
 * }
 * ```
 */
export type WindowState =
  | ClosedWindowState
  | OpenWindowState
  | MinimizedWindowState;

/**
 * Type guard: Check if window is closed.
 */
export function isWindowClosed(
  state: WindowState
): state is ClosedWindowState {
  return state.status === 'closed';
}

/**
 * Type guard: Check if window is open.
 */
export function isWindowOpen(state: WindowState): state is OpenWindowState {
  return state.status === 'open';
}

/**
 * Type guard: Check if window is minimized.
 */
export function isWindowMinimized(
  state: WindowState
): state is MinimizedWindowState {
  return state.status === 'minimized';
}

/**
 * Helper to create initial closed state.
 */
export function createClosedState(): ClosedWindowState {
  return { status: 'closed' };
}

/**
 * Helper to create open state.
 */
export function createOpenState(
  isActive: boolean = false,
  isMaximized: boolean = false,
  zIndex: number = 1
): OpenWindowState {
  return { status: 'open', isActive, isMaximized, zIndex };
}

/**
 * Helper to create minimized state.
 */
export function createMinimizedState(zIndex: number = 1): MinimizedWindowState {
  return { status: 'minimized', zIndex };
}

/* ==========================================================================
   WINDOW ACTIONS
   ========================================================================== */

/**
 * Actions available for controlling a window.
 */
export interface WindowActions {
  /** Open the window */
  open: () => void;
  /** Close the window */
  close: () => void;
  /** Minimize the window */
  minimize: () => void;
  /** Restore from minimized state */
  restore: () => void;
  /** Maximize the window to full screen */
  maximize: () => void;
  /** Restore from maximized state */
  unmaximize: () => void;
  /** Toggle maximized state */
  toggleMaximize: () => void;
  /** Bring window to front and focus */
  focus: () => void;
}

/**
 * Combined state and actions for a window.
 */
export interface WindowInstance {
  /** Configuration for this window */
  config: WindowConfig;
  /** Current runtime state */
  state: WindowState;
  /** Actions to control the window */
  actions: WindowActions;
}

/* ==========================================================================
   SHARED WINDOW MANAGER INTERFACE
   ========================================================================== */

/**
 * Core window manager functionality shared between context and hook.
 */
export interface WindowManagerCore {
  /** Map of window ID to window instance */
  windows: Map<string, WindowInstance>;
  /** Open a window by ID */
  openWindow: (id: string) => void;
  /** Close a window by ID */
  closeWindow: (id: string) => void;
  /** Minimize a window by ID */
  minimizeWindow: (id: string) => void;
  /** Restore a window by ID */
  restoreWindow: (id: string) => void;
  /** Focus/activate a window by ID */
  focusWindow: (id: string) => void;
  /** Deactivate all windows (click on desktop background) */
  deactivateAll: () => void;
}

/* ==========================================================================
   CONTEXT TYPES
   ========================================================================== */

/**
 * Desktop context value provided to all child components.
 */
export interface DesktopContextValue extends WindowManagerCore {
  /** Get the icon ref for a specific icon ID */
  getIconRef: (iconId: string) => RefObject<HTMLDivElement> | null;
  /** Register an icon ref */
  registerIconRef: (iconId: string, ref: RefObject<HTMLDivElement>) => void;
  /** Whether the current device is mobile */
  isMobile: boolean;
  /** Get the next cascade index for window positioning */
  getNextCascadeIndex: () => number;
}

/* ==========================================================================
   HOOK RETURN TYPES
   ========================================================================== */

/**
 * Return type for the useWindowManager hook.
 */
export type UseWindowManagerReturn = WindowManagerCore;

/* ==========================================================================
   COMPONENT PROPS
   ========================================================================== */

/**
 * Props for the main Desktop component.
 */
export interface DesktopProps {
  /** Desktop configuration */
  config: DesktopConfig;
  /** Children to render (for custom content on desktop) */
  children?: ReactNode;
  /** Custom class name for the desktop container */
  className?: string;
}

/**
 * Props for the Window component.
 */
export interface WindowComponentProps {
  /** Window configuration */
  config: WindowConfig;
  /** Current window state */
  state: WindowState;
  /** Window control actions */
  actions: WindowActions;
  /** Icon position for minimize animation */
  iconPosition?: { x: number; y: number };
  /** Get current icon position (for animation) */
  getIconPosition?: () => { x: number; y: number };
  /** Whether the device is mobile */
  isMobile?: boolean;
}

/**
 * Props for the DesktopIcon component.
 */
export interface DesktopIconComponentProps {
  /** Icon configuration */
  config: DesktopIconConfig;
  /** Click handler (opens the linked window) */
  onClick: () => void;
}

/* ==========================================================================
   VALIDATION
   ========================================================================== */

/**
 * Result of configuration validation.
 */
export interface ValidationResult {
  /** Whether the configuration is valid */
  valid: boolean;
  /** Array of error messages (empty if valid) */
  errors: string[];
  /** Array of warning messages (non-fatal issues) */
  warnings: string[];
}

/**
 * Validates a desktop configuration and returns detailed error information.
 *
 * @remarks
 * This function checks for:
 * - Duplicate window IDs
 * - Duplicate icon IDs
 * - Icons referencing non-existent windows
 * - Invalid autoOpenWindow references
 * - Missing required fields
 *
 * @example
 * ```ts
 * const result = validateDesktopConfig(config);
 * if (!result.valid) {
 *   console.error('Config errors:', result.errors);
 * }
 * if (result.warnings.length > 0) {
 *   console.warn('Config warnings:', result.warnings);
 * }
 * ```
 */
export function validateDesktopConfig(config: DesktopConfig): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const windowIds = new Set<string>();
  const iconIds = new Set<string>();

  // Validate windows array exists
  if (!config.windows || !Array.isArray(config.windows)) {
    errors.push('Config must have a "windows" array');
    return { valid: false, errors, warnings };
  }

  // Validate icons array exists
  if (!config.icons || !Array.isArray(config.icons)) {
    errors.push('Config must have an "icons" array');
    return { valid: false, errors, warnings };
  }

  // Check for duplicate window IDs and validate window configs
  for (const window of config.windows) {
    if (!window.id) {
      errors.push('Window is missing required "id" field');
      continue;
    }

    if (windowIds.has(window.id)) {
      errors.push(`Duplicate window ID: "${window.id}"`);
    }
    windowIds.add(window.id);

    if (!window.title) {
      warnings.push(`Window "${window.id}" is missing a title`);
    }

    if (!window.type) {
      errors.push(`Window "${window.id}" is missing required "type" field`);
    } else if (window.type === 'app') {
      if (!window.component) {
        errors.push(
          `App window "${window.id}" is missing required "component" field`
        );
      }
    } else if (window.type === 'browser') {
      if (!window.url) {
        errors.push(
          `Browser window "${window.id}" is missing required "url" field`
        );
      }
    } else {
      errors.push(
        `Window "${window.id}" has invalid type: "${(window as WindowConfig).type}"`
      );
    }
  }

  // Check for duplicate icon IDs and validate references
  for (const icon of config.icons) {
    if (!icon.id) {
      errors.push('Icon is missing required "id" field');
      continue;
    }

    if (iconIds.has(icon.id)) {
      errors.push(`Duplicate icon ID: "${icon.id}"`);
    }
    iconIds.add(icon.id);

    if (!icon.windowId) {
      errors.push(`Icon "${icon.id}" is missing required "windowId" field`);
    } else if (!windowIds.has(icon.windowId)) {
      errors.push(
        `Icon "${icon.id}" references non-existent window "${icon.windowId}"`
      );
    }

    if (!icon.label) {
      warnings.push(`Icon "${icon.id}" is missing a label`);
    }

    if (!icon.icon) {
      errors.push(`Icon "${icon.id}" is missing required "icon" field`);
    }
  }

  // Validate autoOpenWindow reference
  if (config.autoOpenWindow && !windowIds.has(config.autoOpenWindow)) {
    errors.push(
      `autoOpenWindow references non-existent window "${config.autoOpenWindow}"`
    );
  }

  // Check for windows without icons (warning only)
  for (const windowId of windowIds) {
    const hasIcon = config.icons.some((icon) => icon.windowId === windowId);
    if (!hasIcon) {
      warnings.push(
        `Window "${windowId}" has no icon - it can only be opened programmatically`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Throws an error if the configuration is invalid.
 * Useful for failing fast during development.
 *
 * @example
 * ```ts
 * // Will throw if config is invalid
 * assertValidConfig(config);
 * ```
 */
export function assertValidConfig(config: DesktopConfig): void {
  const result = validateDesktopConfig(config);
  if (!result.valid) {
    throw new Error(
      `Invalid DesktopConfig:\n${result.errors.map((e) => `  - ${e}`).join('\n')}`
    );
  }
}
