/**
 * ============================================================================
 * DESKTOP CONTEXT
 * ============================================================================
 *
 * Provides centralized state management for the desktop environment.
 * All windows and icons communicate through this context.
 *
 * @packageDocumentation
 */

'use client';

import {
  createContext,
  useContext,
  ReactNode,
  RefObject,
} from 'react';
import type {
  DesktopContextValue,
  WindowInstance,
} from '../types';

/* ==========================================================================
   CONTEXT CREATION
   ========================================================================== */

/**
 * The Desktop context - provides window management and icon refs to all children.
 * @internal
 */
const DesktopContext = createContext<DesktopContextValue | null>(null);

/* ==========================================================================
   PROVIDER COMPONENT
   ========================================================================== */

interface DesktopProviderProps {
  children: ReactNode;
  value: DesktopContextValue;
}

/**
 * Provider component for the Desktop context.
 *
 * @remarks
 * This is used internally by the Desktop component. You typically don't
 * need to use this directly.
 *
 * @example
 * ```tsx
 * // Internal usage in Desktop component
 * <DesktopProvider value={contextValue}>
 *   {children}
 * </DesktopProvider>
 * ```
 */
export function DesktopProvider({ children, value }: DesktopProviderProps) {
  return (
    <DesktopContext.Provider value={value}>
      {children}
    </DesktopContext.Provider>
  );
}

/* ==========================================================================
   CONTEXT HOOK
   ========================================================================== */

/**
 * Hook to access the desktop context.
 *
 * @remarks
 * Must be used within a Desktop component. Returns safe defaults when
 * used outside the provider (useful for testing or isolated components).
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { openWindow, windows } = useDesktopContext();
 *
 *   return (
 *     <button onClick={() => openWindow('settings')}>
 *       Open Settings
 *     </button>
 *   );
 * }
 * ```
 */
export function useDesktopContext(): DesktopContextValue {
  const context = useContext(DesktopContext);

  if (!context) {
    // Return safe defaults when used outside provider
    // This allows components to be tested in isolation
    return {
      windows: new Map<string, WindowInstance>(),
      openWindow: () => {
        console.warn('useDesktopContext: openWindow called outside Desktop provider');
      },
      closeWindow: () => {
        console.warn('useDesktopContext: closeWindow called outside Desktop provider');
      },
      minimizeWindow: () => {
        console.warn('useDesktopContext: minimizeWindow called outside Desktop provider');
      },
      restoreWindow: () => {
        console.warn('useDesktopContext: restoreWindow called outside Desktop provider');
      },
      focusWindow: () => {
        console.warn('useDesktopContext: focusWindow called outside Desktop provider');
      },
      deactivateAll: () => {
        console.warn('useDesktopContext: deactivateAll called outside Desktop provider');
      },
      getIconRef: () => null,
      registerIconRef: () => {
        console.warn('useDesktopContext: registerIconRef called outside Desktop provider');
      },
      isMobile: false,
      getNextCascadeIndex: () => 0,
    };
  }

  return context;
}

/* ==========================================================================
   WINDOW-SPECIFIC HOOK
   ========================================================================== */

/**
 * Hook to get a specific window's instance by ID.
 *
 * @param windowId - The ID of the window to get
 * @returns The window instance or undefined if not found
 *
 * @example
 * ```tsx
 * function TerminalControls() {
 *   const terminal = useWindow('terminal');
 *
 *   if (!terminal) return null;
 *
 *   return (
 *     <div>
 *       {terminal.state.status === 'open' && (
 *         <button onClick={terminal.actions.minimize}>
 *           Minimize
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWindow(windowId: string): WindowInstance | undefined {
  const { windows } = useDesktopContext();
  return windows.get(windowId);
}

/* ==========================================================================
   EXPORTS
   ========================================================================== */

export { DesktopContext };
