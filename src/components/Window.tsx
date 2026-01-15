/**
 * ============================================================================
 * WINDOW COMPONENT
 * ============================================================================
 *
 * A macOS-style window component with full drag, resize, and snap support.
 * Supports two modes:
 * - "app": Renders a React component inside the window
 * - "browser": Renders an iframe with browser-style chrome
 *
 * @packageDocumentation
 */

'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  ComponentType,
} from 'react';
import type {
  WindowConfig,
  WindowState,
  WindowActions,
  AppWindowConfig,
  BrowserWindowConfig,
} from '../types';
import {
  isWindowOpen,
  isWindowMinimized,
  isAppWindow,
  isBrowserWindow,
} from '../types';
import { useThemeOptional, darkTheme } from '../contexts/ThemeContext';
import { useDesktopContext } from '../contexts/DesktopContext';

/* ==========================================================================
   TYPES
   ========================================================================== */

export interface WindowProps {
  /** Window configuration */
  config: WindowConfig;
  /** Current window state */
  state: WindowState;
  /** Window control actions */
  actions: WindowActions;
  /** Starting position for open animation (usually icon position) */
  iconPosition?: { x: number; y: number };
  /** Get current icon position for minimize animation */
  getIconPosition?: () => { x: number; y: number };
  /** Whether the device is mobile */
  isMobile?: boolean;
  /** Initial X position (overrides config) */
  initialX?: number;
  /** Initial Y position (overrides config) */
  initialY?: number;
  /** Initial width (overrides config) */
  width?: string;
  /** Initial height (overrides config) */
  height?: string;
}

type ResizeDirection =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | null;

/* ==========================================================================
   HELPERS
   ========================================================================== */

/**
 * Parse a CSS size value (px, vw, vh) to pixels.
 */
function parseSize(size: string): number {
  if (typeof window === 'undefined') return parseFloat(size);
  if (size.endsWith('vw')) {
    return (parseFloat(size) / 100) * window.innerWidth;
  } else if (size.endsWith('vh')) {
    return (parseFloat(size) / 100) * window.innerHeight;
  }
  return parseFloat(size);
}

/**
 * Default dimensions for app windows.
 */
const DEFAULT_APP_DIMENSIONS = {
  width: '650px',
  height: '500px',
  minWidth: 400,
  minHeight: 300,
};

/**
 * Default dimensions for browser windows.
 */
const DEFAULT_BROWSER_DIMENSIONS = {
  width: '1000px',
  height: '700px',
  minWidth: 500,
  minHeight: 400,
};

/**
 * Cascade offset for each new window.
 */
const CASCADE_OFFSET = 30;

/* ==========================================================================
   COMPONENT
   ========================================================================== */

/**
 * A fully-featured macOS-style window component.
 *
 * @remarks
 * Features:
 * - Drag from title bar
 * - Resize from edges and corners
 * - Window snap zones (top = maximize, sides = split)
 * - Minimize/maximize animations
 * - Touch support for mobile
 * - Two rendering modes: app (component) and browser (iframe)
 *
 * @example
 * ```tsx
 * <Window
 *   config={windowConfig}
 *   state={windowState}
 *   actions={windowActions}
 *   isMobile={false}
 * />
 * ```
 */
export function Window({
  config,
  state,
  actions,
  iconPosition,
  getIconPosition,
  isMobile = false,
  initialX,
  initialY,
  width,
  height,
}: WindowProps) {
  // Get cascade index from context (resets when Desktop remounts)
  const { getNextCascadeIndex } = useDesktopContext();

  // Pick defaults based on window type
  const isBrowserType = isBrowserWindow(config);
  const defaults = isBrowserType ? DEFAULT_BROWSER_DIMENSIONS : DEFAULT_APP_DIMENSIONS;

  // Get cascade index once on mount
  const cascadeIndex = useRef<number | null>(null);
  if (cascadeIndex.current === null) {
    cascadeIndex.current = getNextCascadeIndex();
  }
  const cascadeOffset = cascadeIndex.current * CASCADE_OFFSET;

  // Center window by default, then apply cascade offset
  const getCenteredX = () => {
    if (typeof window === 'undefined') return 100 + cascadeOffset;
    const windowWidth = parseSize(width ?? defaults.width);
    return Math.max(50, (window.innerWidth - windowWidth) / 2 + cascadeOffset);
  };

  const getCenteredY = () => {
    if (typeof window === 'undefined') return 50 + cascadeOffset;
    const windowHeight = parseSize(height ?? defaults.height);
    return Math.max(30, (window.innerHeight - windowHeight) / 2 - 50 + cascadeOffset);
  };

  // Extract values from config with defaults
  const defaultX = initialX ?? getCenteredX();
  const defaultY = initialY ?? getCenteredY();
  const defaultWidth = width ?? defaults.width;
  const defaultHeight = height ?? defaults.height;
  const minWidth = defaults.minWidth;
  const minHeight = defaults.minHeight;

  const canMinimize = config.canMinimize !== false;
  const canMaximize = config.canMaximize !== false && !isMobile;
  const canResize = config.canResize !== false && !isMobile;
  const hideTitleBar = config.hideTitleBar === true;

  // Check if we have icon position for animations
  const hasIconAnimation = iconPosition !== undefined;

  // On mobile/small screens, always open maximized
  // On desktop, respect the openMaximized config
  const shouldOpenMaximized = isMobile || config.openMaximized === true;

  /* ========================================================================
     STATE
     ======================================================================== */

  const [position, setPosition] = useState(() => {
    if (hasIconAnimation) return { x: iconPosition.x, y: iconPosition.y };
    if (shouldOpenMaximized) return { x: 0, y: 0 };
    return { x: defaultX, y: defaultY };
  });

  const [size, setSize] = useState(() => {
    if (hasIconAnimation) return { width: 60, height: 60 };
    if (shouldOpenMaximized && typeof window !== 'undefined') {
      return { width: window.innerWidth, height: window.innerHeight };
    }
    return { width: parseSize(defaultWidth), height: parseSize(defaultHeight) };
  });

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeDirection>(null);
  const [isMaximized, setIsMaximized] = useState(shouldOpenMaximized);
  const [isSnapped, setIsSnapped] = useState<'left' | 'right' | null>(null);
  const [snapZone, setSnapZone] = useState<'top' | 'left' | 'right' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isOpening, setIsOpening] = useState(hasIconAnimation);
  const [isClosing, setIsClosing] = useState(false);
  const [opacity, setOpacity] = useState(hasIconAnimation ? 0 : 1);

  // Browser window states
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState<string | null>(null);

  /* ========================================================================
     REFS
     ======================================================================== */

  const isAnimating = useRef(false);
  const savedPosition = useRef({ x: defaultX, y: defaultY });
  const savedSize = useRef({
    width: parseSize(defaultWidth),
    height: parseSize(defaultHeight),
  });
  const previousStateRef = useRef({
    x: defaultX,
    y: defaultY,
    width: parseSize(defaultWidth),
    height: parseSize(defaultHeight),
  });
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    needsRestore: false,
    initialClientX: 0,
    initialClientY: 0,
  });
  const resizeRef = useRef({
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    startPosX: 0,
    startPosY: 0,
  });
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /* ========================================================================
     DERIVED STATE
     ======================================================================== */

  const isOpen = isWindowOpen(state);
  const isMinimized = isWindowMinimized(state);
  const isActive = isOpen && state.isActive;
  const zIndex = isOpen ? state.zIndex : isMinimized ? state.zIndex : 0;

  // Theme support (falls back to dark theme if no provider)
  const themeContext = useThemeOptional();
  const colors = themeContext?.colors ?? darkTheme;
  const isDark = themeContext?.isDark ?? true;

  /* ========================================================================
     WINDOW ACTIONS
     ======================================================================== */

  const handleClose = useCallback(() => {
    actions.close();
  }, [actions]);

  const handleMinimize = useCallback(() => {
    if (isAnimating.current || !canMinimize) return;

    const currentIconPos = getIconPosition?.() ?? iconPosition;

    if (currentIconPos) {
      isAnimating.current = true;
      savedPosition.current = { x: position.x, y: position.y };
      savedSize.current = { width: size.width, height: size.height };

      setIsClosing(true);
      setIsTransitioning(true);
      setPosition(currentIconPos);
      setSize({ width: 60, height: 60 });
      setOpacity(0);

      setTimeout(() => {
        isAnimating.current = false;
        actions.minimize();
      }, 300);
    } else {
      actions.minimize();
    }
  }, [actions, canMinimize, getIconPosition, iconPosition, position, size]);

  const handleMaximize = useCallback(() => {
    if (!canMaximize) return;

    setIsTransitioning(true);

    if (isMaximized) {
      setPosition({
        x: previousStateRef.current.x,
        y: previousStateRef.current.y,
      });
      setSize({
        width: previousStateRef.current.width,
        height: previousStateRef.current.height,
      });
      setIsMaximized(false);
    } else {
      previousStateRef.current = {
        x: position.x,
        y: position.y,
        width: size.width,
        height: size.height,
      };
      setPosition({ x: 0, y: 0 });
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      setIsMaximized(true);
    }

    setTimeout(() => setIsTransitioning(false), 200);
    actions.toggleMaximize();
  }, [actions, canMaximize, isMaximized, position, size]);

  const handleReload = useCallback(() => {
    if (isBrowserWindow(config)) {
      setIframeLoading(true);
      setIframeError(null);
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.location.reload();
      }
    }
  }, [config]);

  const handleIframeLoad = useCallback(() => {
    setIframeLoading(false);
    setIframeError(null);
  }, []);

  const handleIframeError = useCallback(() => {
    setIframeLoading(false);
    setIframeError('Failed to load content. The site may block embedding.');
  }, []);

  /* ========================================================================
     OPENING ANIMATION
     ======================================================================== */

  useEffect(() => {
    if (isOpening && hasIconAnimation) {
      setIsTransitioning(true);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const newPos = { x: defaultX, y: defaultY };
          const newSize = {
            width: parseSize(defaultWidth),
            height: parseSize(defaultHeight),
          };
          setPosition(newPos);
          setSize(newSize);
          setOpacity(1);

          setTimeout(() => {
            setIsTransitioning(false);
            setIsOpening(false);
            savedPosition.current = newPos;
            savedSize.current = newSize;
          }, 300);
        });
      });
    }
  }, [isOpening, hasIconAnimation, defaultX, defaultY, defaultWidth, defaultHeight]);

  /* ========================================================================
     RESTORE FROM MINIMIZE
     ======================================================================== */

  useEffect(() => {
    if (!isMinimized && isClosing && !isAnimating.current) {
      isAnimating.current = true;
      setIsTransitioning(true);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPosition(savedPosition.current);
          setSize(savedSize.current);
          setOpacity(1);

          setTimeout(() => {
            setIsTransitioning(false);
            setIsClosing(false);
            isAnimating.current = false;
          }, 300);
        });
      });
    }
  }, [isMinimized, isClosing]);

  /* ========================================================================
     DRAG HANDLERS
     ======================================================================== */

  const handleDragMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isActive) {
        actions.focus();
      }

      e.preventDefault();
      dragRef.current = {
        startX: e.clientX - position.x,
        startY: e.clientY - position.y,
        needsRestore: isMaximized || isSnapped !== null,
        initialClientX: e.clientX,
        initialClientY: e.clientY,
      };
      setIsDragging(true);
    },
    [actions, isActive, isMaximized, isSnapped, position]
  );

  const handleTitleBarDoubleClick = useCallback(() => {
    if (!isMobile && canMaximize) {
      handleMaximize();
    }
  }, [isMobile, canMaximize, handleMaximize]);

  /* ========================================================================
     DRAG EFFECT
     ======================================================================== */

  useEffect(() => {
    if (!isDragging) return;

    const SNAP_THRESHOLD = 10;
    const DRAG_THRESHOLD = 1;

    const handleMouseMove = (e: MouseEvent) => {
      // Handle restore from maximized/snapped
      if (dragRef.current.needsRestore) {
        const deltaX = Math.abs(e.clientX - dragRef.current.initialClientX);
        const deltaY = Math.abs(e.clientY - dragRef.current.initialClientY);

        if (deltaX > DRAG_THRESHOLD || deltaY > DRAG_THRESHOLD) {
          const prevWidth = previousStateRef.current.width;
          const prevHeight = previousStateRef.current.height;
          const cursorRatioX = e.clientX / window.innerWidth;
          const newX = e.clientX - prevWidth * cursorRatioX;
          const newY = e.clientY - 24;

          setIsTransitioning(true);
          setPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
          setSize({ width: prevWidth, height: prevHeight });
          setIsMaximized(false);
          setIsSnapped(null);
          setTimeout(() => setIsTransitioning(false), 150);

          dragRef.current = {
            startX: e.clientX - Math.max(0, newX),
            startY: e.clientY - Math.max(0, newY),
            needsRestore: false,
            initialClientX: e.clientX,
            initialClientY: e.clientY,
          };
          return;
        }
        return;
      }

      const newX = e.clientX - dragRef.current.startX;
      const newY = Math.max(0, e.clientY - dragRef.current.startY);
      setPosition({ x: newX, y: newY });

      // Detect snap zones
      if (e.clientY <= SNAP_THRESHOLD) {
        setSnapZone('top');
      } else if (e.clientX <= SNAP_THRESHOLD) {
        setSnapZone('left');
      } else if (e.clientX >= window.innerWidth - SNAP_THRESHOLD) {
        setSnapZone('right');
      } else {
        setSnapZone(null);
      }
    };

    const handleMouseUp = () => {
      dragRef.current.needsRestore = false;

      if (snapZone) {
        setIsTransitioning(true);

        if (!isMaximized && !isSnapped) {
          previousStateRef.current = {
            x: savedPosition.current.x,
            y: savedPosition.current.y,
            width: savedSize.current.width,
            height: savedSize.current.height,
          };
        }

        if (snapZone === 'top') {
          setPosition({ x: 0, y: 0 });
          setSize({ width: window.innerWidth, height: window.innerHeight });
          setIsMaximized(true);
          setIsSnapped(null);
        } else if (snapZone === 'left') {
          setPosition({ x: 0, y: 0 });
          setSize({ width: window.innerWidth / 2, height: window.innerHeight });
          setIsSnapped('left');
          setIsMaximized(false);
        } else if (snapZone === 'right') {
          setPosition({ x: window.innerWidth / 2, y: 0 });
          setSize({ width: window.innerWidth / 2, height: window.innerHeight });
          setIsSnapped('right');
          setIsMaximized(false);
        }

        setTimeout(() => setIsTransitioning(false), 200);
        setSnapZone(null);
      } else if (!isMaximized && !isSnapped) {
        savedPosition.current = { x: position.x, y: position.y };
        savedSize.current = { width: size.width, height: size.height };
      }

      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, position, size, snapZone, isMaximized, isSnapped]);

  /* ========================================================================
     RESIZE HANDLERS
     ======================================================================== */

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, direction: ResizeDirection) => {
      if (!canResize) return;

      if (!isActive) {
        actions.focus();
      }

      e.preventDefault();
      e.stopPropagation();
      setIsResizing(direction);
      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: size.width,
        startHeight: size.height,
        startPosX: position.x,
        startPosY: position.y,
      };
    },
    [actions, canResize, isActive, position, size]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeRef.current.startX;
      const deltaY = e.clientY - resizeRef.current.startY;

      let newWidth = resizeRef.current.startWidth;
      let newHeight = resizeRef.current.startHeight;
      let newX = resizeRef.current.startPosX;
      let newY = resizeRef.current.startPosY;

      if (isResizing.includes('right')) {
        newWidth = Math.max(minWidth, resizeRef.current.startWidth + deltaX);
      }
      if (isResizing.includes('left')) {
        const potentialWidth = resizeRef.current.startWidth - deltaX;
        if (potentialWidth >= minWidth) {
          newWidth = potentialWidth;
          newX = resizeRef.current.startPosX + deltaX;
        }
      }
      if (isResizing.includes('bottom')) {
        newHeight = Math.max(minHeight, resizeRef.current.startHeight + deltaY);
      }
      if (isResizing.includes('top')) {
        const potentialHeight = resizeRef.current.startHeight - deltaY;
        const potentialY = resizeRef.current.startPosY + deltaY;
        if (potentialHeight >= minHeight && potentialY >= 0) {
          newHeight = potentialHeight;
          newY = potentialY;
        }
      }

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      savedPosition.current = { x: position.x, y: position.y };
      savedSize.current = { width: size.width, height: size.height };
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, minHeight, position, size]);

  /* ========================================================================
     WINDOW ACTIVATION
     ======================================================================== */

  const handleWindowMouseDown = useCallback(() => {
    if (!isActive) {
      actions.focus();
    }
  }, [actions, isActive]);

  /* ========================================================================
     SNAP ZONE PREVIEW
     ======================================================================== */

  const snapPreviewStyle = snapZone
    ? {
        top: snapZone === 'top' ? 8 : 8,
        left: snapZone === 'right' ? window.innerWidth / 2 + 4 : 8,
        width:
          snapZone === 'top'
            ? window.innerWidth - 16
            : window.innerWidth / 2 - 12,
        height: window.innerHeight - 16,
      }
    : null;

  /* ========================================================================
     RENDER
     ======================================================================== */

  // Don't render if window is closed
  if (!isOpen && !isMinimized) {
    return null;
  }

  // Don't render if minimized and animation is complete
  if (isMinimized && !isClosing) {
    return null;
  }

  const isBrowser = isBrowserWindow(config);
  const isApp = isAppWindow(config);

  return (
    <>
      {/* Snap Zone Preview */}
      {snapZone && snapPreviewStyle && (
        <div
          className="fixed rounded-xl border-2 border-white/40 bg-white/10 backdrop-blur-sm pointer-events-none z-[100] transition-all duration-150"
          style={{
            top: snapPreviewStyle.top,
            left: snapPreviewStyle.left,
            width: snapPreviewStyle.width,
            height: snapPreviewStyle.height,
          }}
        />
      )}

      {/* Window Container */}
      <div
        className={`absolute ${
          isTransitioning
            ? isOpening || isClosing
              ? 'transition-all duration-300 ease-out'
              : 'transition-all duration-200'
            : ''
        } ${!isMaximized && !isMobile ? 'rounded-2xl' : ''}`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          opacity: opacity,
          zIndex: isActive ? 50 + zIndex : 40 + zIndex,
          boxShadow:
            '0 25px 80px -12px rgba(0, 0, 0, 0.8), 0 12px 40px -8px rgba(0, 0, 0, 0.6)',
          pointerEvents: isMinimized ? 'none' : 'auto',
        }}
        onMouseDown={handleWindowMouseDown}
      >
        {/* Inner Container */}
        <div
          className={`relative w-full h-full backdrop-blur-xl overflow-hidden ${
            !isMaximized && !isMobile ? 'rounded-2xl' : ''
          }`}
          style={{
            backgroundColor: colors.windowBg,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: colors.border,
          }}
        >
          {/* Title Bar */}
          {!hideTitleBar && (
            <div
              className={`h-12 flex items-center px-4 select-none transition-colors ${
                isMobile ? 'cursor-default' : 'cursor-move'
              } ${!isMaximized && !isMobile ? 'rounded-t-2xl' : ''}`}
              style={{
                backgroundColor: isActive ? colors.titleBarBg : colors.titleBarBgInactive,
                borderBottomWidth: '1px',
                borderBottomStyle: 'solid',
                borderBottomColor: colors.border,
              }}
              onMouseDown={handleDragMouseDown}
              onDoubleClick={handleTitleBarDoubleClick}
            >
              {/* Stoplight Buttons */}
              <div
                className="flex items-center gap-2"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <button
                  onClick={handleClose}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-zinc-600'
                  }`}
                  aria-label="Close"
                />
                <button
                  onClick={canMinimize ? handleMinimize : undefined}
                  disabled={!canMinimize}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    !canMinimize
                      ? 'bg-zinc-600 cursor-not-allowed'
                      : isActive
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-zinc-600'
                  }`}
                  aria-label="Minimize"
                />
                <button
                  onClick={canMaximize ? handleMaximize : undefined}
                  disabled={!canMaximize}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    !canMaximize
                      ? 'bg-zinc-600 cursor-not-allowed'
                      : isActive
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-zinc-600'
                  }`}
                  aria-label="Maximize"
                />
              </div>

              {/* Title / URL Bar */}
              {isBrowser ? (
                <div className="flex-1 flex items-center gap-2 ml-3">
                  {(config as BrowserWindowConfig).showReloadButton !== false && (
                    <button
                      onClick={handleReload}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-md transition-colors"
                      style={{
                        color: colors.textSecondary,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = colors.hoverBg;
                        e.currentTarget.style.color = colors.textPrimary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = colors.textSecondary;
                      }}
                      aria-label="Reload"
                    >
                      <ReloadIcon />
                    </button>
                  )}
                  <div
                    className="flex-1 flex items-center gap-2 rounded-md px-3 py-1.5 text-sm"
                    style={{
                      backgroundColor: colors.urlBarBg,
                      color: colors.textSecondary,
                    }}
                  >
                    <span
                      className={`transition-all ${
                        isActive ? '' : 'grayscale opacity-50'
                      }`}
                    >
                      {config.icon}
                    </span>
                    <span className="truncate">{config.title}</span>
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 ml-3 text-sm font-medium"
                  style={{ color: colors.textPrimary }}
                >
                  <span
                    className={`transition-all ${
                      isActive ? '' : 'grayscale opacity-50'
                    }`}
                  >
                    {config.icon}
                  </span>
                  <span>{config.title}</span>
                </div>
              )}
            </div>
          )}

          {/* Content Area */}
          <div
            className={`relative ${
              hideTitleBar ? 'h-full' : 'h-[calc(100%-3rem)]'
            } overflow-auto`}
          >
            {/* App Content */}
            {isApp && (
              <AppContent config={config as AppWindowConfig} />
            )}

            {/* Browser Content */}
            {isBrowser && (
              <BrowserContent
                config={config as BrowserWindowConfig}
                iframeRef={iframeRef}
                isLoading={iframeLoading}
                error={iframeError}
                onLoad={handleIframeLoad}
                onError={handleIframeError}
                onRetry={handleReload}
                colors={colors}
              />
            )}

            {/* Click overlay when inactive */}
            {!isActive && (
              <div
                className="absolute inset-0 z-10"
                onMouseDown={handleWindowMouseDown}
              />
            )}
          </div>
        </div>

        {/* Resize Handles */}
        {canResize && !isMaximized && (
          <>
            {/* Corners */}
            <div
              className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}
            />
            <div
              className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}
            />
            <div
              className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}
            />
            <div
              className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
            />

            {/* Edges */}
            <div
              className="absolute top-0 left-3 right-3 h-1 cursor-ns-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'top')}
            />
            <div
              className="absolute bottom-0 left-3 right-3 h-1 cursor-ns-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}
            />
            <div
              className="absolute left-0 top-3 bottom-3 w-1 cursor-ew-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
            />
            <div
              className="absolute right-0 top-3 bottom-3 w-1 cursor-ew-resize"
              onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
            />
          </>
        )}
      </div>
    </>
  );
}

/* ==========================================================================
   SUB-COMPONENTS
   ========================================================================== */

/**
 * Renders the component for an app window.
 */
function AppContent({ config }: { config: AppWindowConfig }) {
  const Component = config.component as ComponentType<Record<string, unknown>>;
  const props = config.componentProps ?? {};

  return <Component {...props} />;
}

/**
 * Simple reload icon (inline SVG to avoid external dependencies).
 */
function ReloadIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  );
}

/**
 * Browser content with loading and error states.
 */
function BrowserContent({
  config,
  iframeRef,
  isLoading,
  error,
  onLoad,
  onError,
  onRetry,
  colors,
}: {
  config: BrowserWindowConfig;
  iframeRef: React.RefObject<HTMLIFrameElement>;
  isLoading: boolean;
  error: string | null;
  onLoad: () => void;
  onError: () => void;
  onRetry: () => void;
  colors: {
    overlayBg: string;
    textSecondary: string;
    textPrimary: string;
    border: string;
    hoverBg: string;
  };
}) {
  return (
    <div
      className="relative w-full h-full"
      style={{ backgroundColor: colors.overlayBg }}
    >
      {/* Loading Spinner */}
      {isLoading && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ backgroundColor: colors.overlayBg }}
        >
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-8 h-8 border-2 border-t-blue-500 rounded-full animate-spin"
              style={{ borderColor: colors.border, borderTopColor: '#3b82f6' }}
            />
            <span className="text-sm" style={{ color: colors.textSecondary }}>
              Loading...
            </span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10"
          style={{ backgroundColor: colors.overlayBg }}
        >
          <div className="flex flex-col items-center gap-4 max-w-sm text-center px-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h3 className="font-medium mb-1" style={{ color: colors.textPrimary }}>
                Unable to load
              </h3>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                {error}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                Try Again
              </button>
              <a
                href={config.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm rounded-lg transition-colors"
                style={{
                  backgroundColor: colors.hoverBg,
                  color: colors.textPrimary,
                }}
              >
                Open Externally
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={config.url}
        className={`w-full h-full border-0 transition-opacity duration-300 ${
          isLoading || error ? 'opacity-0' : 'opacity-100'
        }`}
        title={config.title}
        sandbox={config.sandbox}
        allow={config.allow}
        referrerPolicy={config.referrerPolicy}
        onLoad={onLoad}
        onError={onError}
      />
    </div>
  );
}
