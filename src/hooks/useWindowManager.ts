/**
 * ============================================================================
 * USE WINDOW MANAGER HOOK
 * ============================================================================
 *
 * Core state management hook for the desktop window system.
 * Manages all window states, z-index ordering, and window actions.
 *
 * @packageDocumentation
 */

'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import type {
  WindowConfig,
  WindowState,
  WindowActions,
  WindowInstance,
  UseWindowManagerReturn,
} from '../types';
import {
  createClosedState,
  createOpenState,
  createMinimizedState,
  isWindowOpen,
  isWindowMinimized,
} from '../types';

/* ==========================================================================
   HOOK IMPLEMENTATION
   ========================================================================== */

/**
 * Hook that manages all window state for a desktop environment.
 *
 * @param windowConfigs - Array of window configurations
 * @returns Window manager with state and actions for all windows
 *
 * @example
 * ```tsx
 * const windowConfigs = [
 *   { id: 'terminal', type: 'app', ... },
 *   { id: 'browser', type: 'browser', ... },
 * ];
 *
 * function Desktop() {
 *   const manager = useWindowManager(windowConfigs);
 *
 *   return (
 *     <>
 *       <button onClick={() => manager.openWindow('terminal')}>
 *         Open Terminal
 *       </button>
 *       {Array.from(manager.windows.values()).map(window => (
 *         <Window key={window.config.id} {...window} />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */
export function useWindowManager(
  windowConfigs: WindowConfig[]
): UseWindowManagerReturn {
  // Track the next z-index to assign (using ref to avoid stale closures)
  const nextZIndexRef = useRef(1);

  // State for all windows - keyed by window ID
  const [windowStates, setWindowStates] = useState<Map<string, WindowState>>(
    () => {
      const initial = new Map<string, WindowState>();
      for (const config of windowConfigs) {
        initial.set(config.id, createClosedState());
      }
      return initial;
    }
  );

  /* ========================================================================
     WINDOW ACTIONS
     ======================================================================== */

  /**
   * Open a window by ID.
   */
  const openWindow = useCallback((id: string) => {
    setWindowStates((prev) => {
      const current = prev.get(id);
      if (!current) {
        console.warn(`useWindowManager: Window "${id}" not found`);
        return prev;
      }

      // Already open? Just focus it
      if (isWindowOpen(current)) {
        return prev;
      }

      const next = new Map(prev);

      // Deactivate all other windows
      for (const [windowId, state] of next) {
        if (isWindowOpen(state) && state.isActive) {
          next.set(windowId, { ...state, isActive: false });
        }
      }

      // Open this window with highest z-index
      const zIndex = nextZIndexRef.current++;
      next.set(id, createOpenState(true, false, zIndex));

      return next;
    });
  }, []);

  /**
   * Close a window by ID.
   */
  const closeWindow = useCallback((id: string) => {
    setWindowStates((prev) => {
      const current = prev.get(id);
      if (!current) {
        console.warn(`useWindowManager: Window "${id}" not found`);
        return prev;
      }

      const next = new Map(prev);
      next.set(id, createClosedState());
      return next;
    });
  }, []);

  /**
   * Minimize a window by ID.
   */
  const minimizeWindow = useCallback((id: string) => {
    setWindowStates((prev) => {
      const current = prev.get(id);
      if (!current || !isWindowOpen(current)) {
        return prev;
      }

      const next = new Map(prev);
      next.set(id, createMinimizedState(current.zIndex));
      return next;
    });
  }, []);

  /**
   * Restore a minimized window by ID.
   */
  const restoreWindow = useCallback((id: string) => {
    setWindowStates((prev) => {
      const current = prev.get(id);
      if (!current || !isWindowMinimized(current)) {
        return prev;
      }

      const next = new Map(prev);

      // Deactivate all other windows
      for (const [windowId, state] of next) {
        if (isWindowOpen(state) && state.isActive) {
          next.set(windowId, { ...state, isActive: false });
        }
      }

      // Restore with new highest z-index
      const zIndex = nextZIndexRef.current++;
      next.set(id, createOpenState(true, false, zIndex));

      return next;
    });
  }, []);

  /**
   * Focus/activate a window by ID (bring to front).
   */
  const focusWindow = useCallback((id: string) => {
    setWindowStates((prev) => {
      const current = prev.get(id);
      if (!current || !isWindowOpen(current)) {
        return prev;
      }

      // Already active and at top? No change needed
      if (current.isActive) {
        return prev;
      }

      const next = new Map(prev);

      // Deactivate all other windows
      for (const [windowId, state] of next) {
        if (isWindowOpen(state) && state.isActive) {
          next.set(windowId, { ...state, isActive: false });
        }
      }

      // Activate this window with highest z-index
      const zIndex = nextZIndexRef.current++;
      next.set(id, {
        ...current,
        isActive: true,
        zIndex,
      });

      return next;
    });
  }, []);

  /**
   * Deactivate all windows (e.g., when clicking desktop background).
   */
  const deactivateAll = useCallback(() => {
    setWindowStates((prev) => {
      let hasActive = false;
      for (const state of prev.values()) {
        if (isWindowOpen(state) && state.isActive) {
          hasActive = true;
          break;
        }
      }

      if (!hasActive) return prev;

      const next = new Map(prev);
      for (const [windowId, state] of next) {
        if (isWindowOpen(state) && state.isActive) {
          next.set(windowId, { ...state, isActive: false });
        }
      }
      return next;
    });
  }, []);

  /* ========================================================================
     BUILD WINDOW INSTANCES
     ======================================================================== */

  /**
   * Create actions object for a specific window.
   */
  const createActions = useCallback(
    (windowId: string): WindowActions => ({
      open: () => openWindow(windowId),
      close: () => closeWindow(windowId),
      minimize: () => minimizeWindow(windowId),
      restore: () => restoreWindow(windowId),
      maximize: () => {
        setWindowStates((prev) => {
          const current = prev.get(windowId);
          if (!current || !isWindowOpen(current)) return prev;
          const next = new Map(prev);
          next.set(windowId, { ...current, isMaximized: true });
          return next;
        });
      },
      unmaximize: () => {
        setWindowStates((prev) => {
          const current = prev.get(windowId);
          if (!current || !isWindowOpen(current)) return prev;
          const next = new Map(prev);
          next.set(windowId, { ...current, isMaximized: false });
          return next;
        });
      },
      toggleMaximize: () => {
        setWindowStates((prev) => {
          const current = prev.get(windowId);
          if (!current || !isWindowOpen(current)) return prev;
          const next = new Map(prev);
          next.set(windowId, { ...current, isMaximized: !current.isMaximized });
          return next;
        });
      },
      focus: () => focusWindow(windowId),
    }),
    [openWindow, closeWindow, minimizeWindow, restoreWindow, focusWindow]
  );

  /**
   * Build the complete windows Map with config, state, and actions.
   */
  const windows = useMemo(() => {
    const result = new Map<string, WindowInstance>();

    for (const config of windowConfigs) {
      const state = windowStates.get(config.id) || createClosedState();
      const actions = createActions(config.id);

      result.set(config.id, {
        config,
        state,
        actions,
      });
    }

    return result;
  }, [windowConfigs, windowStates, createActions]);

  /* ========================================================================
     RETURN VALUE
     ======================================================================== */

  return {
    windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    focusWindow,
    deactivateAll,
  };
}
