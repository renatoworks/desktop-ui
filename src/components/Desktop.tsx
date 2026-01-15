/**
 * ============================================================================
 * DESKTOP COMPONENT
 * ============================================================================
 *
 * The main orchestration component for the desktop environment.
 * Takes a configuration object and renders a complete desktop with
 * icons, windows, and background.
 *
 * @packageDocumentation
 */

'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  RefObject,
} from 'react';
import type {
  DesktopConfig,
  DesktopContextValue,
  DesktopIconConfig,
} from '../types';
import { validateDesktopConfig, isWindowOpen, isWindowMinimized } from '../types';
import { DesktopProvider } from '../contexts/DesktopContext';
import { ThemeProvider, ThemeMode, useThemeOptional } from '../contexts/ThemeContext';
import { useWindowManager } from '../hooks/useWindowManager';
import { DesktopIcon, DesktopIconRef } from './DesktopIcon';
import { Window } from './Window';

/* ==========================================================================
   TYPES
   ========================================================================== */

export interface DesktopProps {
  /** Desktop configuration */
  config: DesktopConfig;
  /** Children to render (for custom content on desktop) */
  children?: React.ReactNode;
  /** Custom class name for the desktop container */
  className?: string;
  /** Initial theme mode (defaults to 'dark') */
  defaultTheme?: ThemeMode;
}

/* ==========================================================================
   COMPONENT
   ========================================================================== */

/**
 * The main Desktop component - renders a complete desktop environment.
 *
 * @remarks
 * This component:
 * - Validates the configuration on mount
 * - Manages all window state via useWindowManager
 * - Renders desktop icons from config
 * - Renders windows for each window config
 * - Handles background rendering
 * - Provides context to all children
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
 *   autoOpenWindow: 'terminal',
 * };
 *
 * function App() {
 *   return <Desktop config={config} />;
 * }
 * ```
 */
export function Desktop({ config, children, className = '', defaultTheme = 'dark' }: DesktopProps) {
  return (
    <ThemeProvider defaultTheme={defaultTheme}>
      <DesktopInner config={config} className={className}>
        {children}
      </DesktopInner>
    </ThemeProvider>
  );
}

/**
 * Inner component that has access to theme context.
 */
function DesktopInner({ config, children, className = '' }: Omit<DesktopProps, 'defaultTheme'>) {
  /* ========================================================================
     THEME
     ======================================================================== */

  const theme = useThemeOptional();
  const isDark = theme?.isDark ?? true;

  /* ========================================================================
     VALIDATION
     ======================================================================== */

  useEffect(() => {
    const result = validateDesktopConfig(config);
    if (!result.valid) {
      console.error('Desktop: Invalid configuration', result.errors);
    }
    if (result.warnings.length > 0) {
      console.warn('Desktop: Configuration warnings', result.warnings);
    }
  }, [config]);

  /* ========================================================================
     STATE
     ======================================================================== */

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });
  const [showIcons, setShowIcons] = useState(false);

  // Track icon refs for minimize animations
  const iconRefs = useRef<Map<string, RefObject<DesktopIconRef>>>(new Map());

  // Cascade counter for window positioning (resets when Desktop remounts)
  const cascadeCounter = useRef(0);

  // Window manager hook
  const windowManager = useWindowManager(config.windows);

  /* ========================================================================
     DEVICE DETECTION
     ======================================================================== */

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* ========================================================================
     ICON REGISTRATION
     ======================================================================== */

  const getIconRef = useCallback((iconId: string) => {
    return iconRefs.current.get(iconId) ?? null;
  }, []);

  const registerIconRef = useCallback(
    (iconId: string, ref: RefObject<DesktopIconRef>) => {
      iconRefs.current.set(iconId, ref as RefObject<DesktopIconRef>);
    },
    []
  );

  /* ========================================================================
     CASCADE POSITIONING
     ======================================================================== */

  const getNextCascadeIndex = useCallback(() => {
    return cascadeCounter.current++;
  }, []);

  /* ========================================================================
     ICON CLICK HANDLERS
     ======================================================================== */

  const handleIconClick = useCallback(
    (windowId: string) => {
      const instance = windowManager.windows.get(windowId);
      if (!instance) return;

      const state = instance.state;

      if (isWindowOpen(state)) {
        // Already open - just focus it
        windowManager.focusWindow(windowId);
      } else if (isWindowMinimized(state)) {
        // Minimized - restore it
        windowManager.restoreWindow(windowId);
      } else {
        // Closed - open it
        windowManager.openWindow(windowId);
      }
    },
    [windowManager]
  );

  /* ========================================================================
     AUTO-OPEN WINDOW
     ======================================================================== */

  const hasAutoOpened = useRef(false);

  useEffect(() => {
    if (config.autoOpenWindow && !hasAutoOpened.current) {
      hasAutoOpened.current = true;
      // Delay to allow icons to render and get their positions
      const timer = setTimeout(() => {
        windowManager.openWindow(config.autoOpenWindow!);
      }, 100);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  /* ========================================================================
     SHOW ICONS AFTER MOUNT
     ======================================================================== */

  useEffect(() => {
    const timer = setTimeout(() => setShowIcons(true), 100);
    return () => clearTimeout(timer);
  }, []);

  /* ========================================================================
     BACKGROUND CLICK
     ======================================================================== */

  const handleBackgroundClick = useCallback(() => {
    windowManager.deactivateAll();
  }, [windowManager]);

  /* ========================================================================
     CONTEXT VALUE
     ======================================================================== */

  const contextValue: DesktopContextValue = useMemo(
    () => ({
      ...windowManager,
      getIconRef: getIconRef as (iconId: string) => RefObject<HTMLDivElement> | null,
      registerIconRef: registerIconRef as (iconId: string, ref: RefObject<HTMLDivElement>) => void,
      isMobile,
      getNextCascadeIndex,
    }),
    [windowManager, getIconRef, registerIconRef, isMobile, getNextCascadeIndex]
  );

  /* ========================================================================
     ICON LAYOUT
     ======================================================================== */

  const iconLayout = config.iconLayout ?? {
    startPosition: 'top-left',
    direction: 'vertical',
    gap: 16,
    padding: 16,
  };

  const getIconContainerStyle = () => {
    const style: React.CSSProperties = {
      position: 'absolute',
      display: 'flex',
      gap: `${iconLayout.gap}px`,
      padding: `${iconLayout.padding}px`,
      zIndex: 10,
      transition: 'transform 0.5s ease-out',
      transform: showIcons ? 'translateX(0)' : 'translateX(-300px)',
    };

    // Position based on startPosition
    switch (iconLayout.startPosition) {
      case 'top-left':
        style.top = 40;
        style.left = 0;
        break;
      case 'top-right':
        style.top = 40;
        style.right = 0;
        break;
      case 'bottom-left':
        style.bottom = 40;
        style.left = 0;
        break;
      case 'bottom-right':
        style.bottom = 40;
        style.right = 0;
        break;
    }

    // Direction
    style.flexDirection = iconLayout.direction === 'vertical' ? 'column' : 'row';

    return style;
  };

  /* ========================================================================
     BACKGROUND RENDERING
     ======================================================================== */

  const getBackgroundStyle = (bg: typeof config.background) => {
    if (!bg) return {};

    const style: React.CSSProperties = {};

    switch (bg.type) {
      case 'color':
        style.backgroundColor = bg.color;
        break;
      case 'image':
        style.backgroundImage = `url(${bg.url})`;
        style.backgroundSize = bg.size ?? 'cover';
        style.backgroundPosition = bg.position ?? 'center';
        break;
      case 'gradient':
        style.background = bg.gradient;
        break;
    }

    return style;
  };

  const renderBackground = () => {
    const darkBg = config.darkBackground ?? config.background;
    const lightBg = config.lightBackground ?? config.background;

    // Default backgrounds if none provided
    const defaultDarkStyle = { background: 'linear-gradient(to bottom, #18181b, #27272a)' };
    const defaultLightStyle = { background: 'linear-gradient(to bottom, #f4f4f5, #e4e4e7)' };

    const darkStyle = darkBg ? getBackgroundStyle(darkBg) : defaultDarkStyle;
    const lightStyle = lightBg ? getBackgroundStyle(lightBg) : defaultLightStyle;

    return (
      <>
        {/* Light background - always behind */}
        <div className="absolute inset-0" style={lightStyle} />
        {lightBg?.overlay && (
          <div className="absolute inset-0" style={{ background: lightBg.overlay }} />
        )}

        {/* Dark background - fades on top */}
        <div
          className="absolute inset-0 transition-opacity duration-500 ease-in-out"
          style={{
            ...darkStyle,
            opacity: isDark ? 1 : 0,
          }}
        />
        {darkBg?.overlay && (
          <div
            className="absolute inset-0 transition-opacity duration-500 ease-in-out"
            style={{
              background: darkBg.overlay,
              opacity: isDark ? 1 : 0,
            }}
          />
        )}
      </>
    );
  };

  /* ========================================================================
     RENDER
     ======================================================================== */

  return (
    <DesktopProvider value={contextValue}>
      <div className={`fixed inset-0 overflow-hidden ${className}`}>
        {/* Background */}
        {renderBackground()}

        {/* Clickable background to deactivate windows */}
        <div
          className="absolute inset-0 z-0"
          onClick={handleBackgroundClick}
        />

        {/* Desktop Icons */}
        <div style={getIconContainerStyle()}>
          {config.icons.map((iconConfig) => (
            <DesktopIconWrapper
              key={iconConfig.id}
              config={iconConfig}
              onClick={() => handleIconClick(iconConfig.windowId)}
              onRegisterRef={registerIconRef}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* Windows */}
        {Array.from(windowManager.windows.values()).map((instance) => {
          // Find the icon for this window (for animations)
          const iconConfig = config.icons.find(
            (i) => i.windowId === instance.config.id
          );
          const iconRef = iconConfig
            ? iconRefs.current.get(iconConfig.id)
            : undefined;

          const getIconPosition = iconRef?.current
            ? () => iconRef.current!.getPosition()
            : undefined;

          return (
            <Window
              key={instance.config.id}
              config={instance.config}
              state={instance.state}
              actions={instance.actions}
              isMobile={isMobile}
              getIconPosition={getIconPosition}
            />
          );
        })}

        {/* Custom children */}
        {children}
      </div>
    </DesktopProvider>
  );
}

/* ==========================================================================
   HELPER COMPONENTS
   ========================================================================== */

interface DesktopIconWrapperProps {
  config: DesktopIconConfig;
  onClick: () => void;
  onRegisterRef: (iconId: string, ref: RefObject<DesktopIconRef>) => void;
  isMobile: boolean;
}

/**
 * Wrapper component that registers the icon ref on mount.
 */
function DesktopIconWrapper({
  config,
  onClick,
  onRegisterRef,
}: DesktopIconWrapperProps) {
  const ref = useRef<DesktopIconRef>(null);

  useEffect(() => {
    onRegisterRef(config.id, ref);
  }, [config.id, onRegisterRef]);

  return <DesktopIcon ref={ref} config={config} onClick={onClick} />;
}
