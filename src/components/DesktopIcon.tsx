/**
 * ============================================================================
 * DESKTOP ICON COMPONENT
 * ============================================================================
 *
 * A draggable desktop icon that opens an associated window when clicked.
 * Supports both React elements and emoji strings as icons.
 *
 * @packageDocumentation
 */

'use client';

import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  isValidElement,
} from 'react';
import type { DesktopIconConfig } from '../types';

/* ==========================================================================
   TYPES
   ========================================================================== */

export interface DesktopIconRef {
  /** Get the current position of the icon (for window animations) */
  getPosition: () => { x: number; y: number };
}

export interface DesktopIconProps {
  /** Icon configuration */
  config: DesktopIconConfig;
  /** Click handler (opens the linked window) */
  onClick: () => void;
  /** Custom class name */
  className?: string;
}

/* ==========================================================================
   COMPONENT
   ========================================================================== */

/**
 * A draggable desktop icon component.
 *
 * @remarks
 * - Supports drag-and-drop repositioning
 * - Distinguishes between clicks and drags (5px threshold)
 * - Exposes position via ref for window minimize animations
 *
 * @example
 * ```tsx
 * <DesktopIcon
 *   ref={iconRef}
 *   config={{
 *     id: 'terminal-icon',
 *     windowId: 'terminal',
 *     icon: <Terminal className="w-8 h-8 text-green-400" />,
 *     label: 'Terminal',
 *   }}
 *   onClick={() => openWindow('terminal')}
 * />
 * ```
 */
export const DesktopIcon = forwardRef<DesktopIconRef, DesktopIconProps>(
  function DesktopIcon({ config, onClick, className = '' }, ref) {
    const { icon, label, initialX = 0, initialY = 0 } = config;

    // Position state for drag-and-drop
    const [position, setPosition] = useState({ x: initialX, y: initialY });
    const [isDragging, setIsDragging] = useState(false);

    // Refs for tracking drag state
    const dragRef = useRef({
      startX: 0,
      startY: 0,
      hasMoved: false,
    });
    const iconRef = useRef<HTMLDivElement>(null);

    /* ======================================================================
       REF IMPERATIVE HANDLE
       ====================================================================== */

    useImperativeHandle(ref, () => ({
      getPosition: () => {
        if (iconRef.current) {
          const rect = iconRef.current.getBoundingClientRect();
          return { x: rect.left, y: rect.top };
        }
        return { x: position.x, y: position.y };
      },
    }));

    /* ======================================================================
       DRAG HANDLERS
       ====================================================================== */

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      dragRef.current = {
        startX: e.clientX - position.x,
        startY: e.clientY - position.y,
        hasMoved: false,
      };
    };

    useEffect(() => {
      if (!isDragging) return;

      const handleMouseMove = (e: MouseEvent) => {
        const newX = e.clientX - dragRef.current.startX;
        const newY = e.clientY - dragRef.current.startY;

        // Check if moved more than 5px to distinguish from click
        if (
          Math.abs(newX - position.x) > 5 ||
          Math.abs(newY - position.y) > 5
        ) {
          dragRef.current.hasMoved = true;
        }

        setPosition({ x: newX, y: newY });
      };

      const handleMouseUp = () => {
        setIsDragging(false);

        // Handle click (not a drag)
        if (!dragRef.current.hasMoved) {
          onClick();
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }, [isDragging, position.x, position.y, onClick]);

    /* ======================================================================
       RENDER
       ====================================================================== */

    const isStringIcon = typeof icon === 'string';
    const isElementIcon = isValidElement(icon);

    return (
      <div
        ref={iconRef}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'auto',
        }}
        className={`
          group flex flex-col items-center gap-1.5 p-2 rounded-lg
          hover:bg-white/10 transition-colors w-28 select-none
          ${className}
        `}
      >
        {/* Icon */}
        <div
          className={`
            pointer-events-none
            ${isStringIcon ? 'text-5xl' : 'w-14 h-14 flex items-center justify-center'}
          `}
        >
          {isStringIcon && icon}
          {isElementIcon && icon}
        </div>

        {/* Label */}
        <span
          className="
            text-xs text-white text-center font-bold leading-tight
            drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] pointer-events-none
          "
        >
          {label}
        </span>
      </div>
    );
  }
);
