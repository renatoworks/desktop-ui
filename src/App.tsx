/**
 * desktop-ui Demo
 *
 * A macOS-style desktop environment for React.
 */

import React from 'react';
import { Desktop, useTheme } from './';
import type { DesktopConfig } from './';

/* ==========================================================================
   DEMO COMPONENTS
   ========================================================================== */

function TerminalDemo() {
  return (
    <div className="h-full bg-black text-green-400 font-mono p-4 overflow-auto">
      <div className="mb-4">
        <span className="text-zinc-500">Last login: {new Date().toLocaleString()}</span>
      </div>
      <div className="space-y-2">
        <div className="flex">
          <span className="text-blue-400">demo</span>
          <span className="text-white">@</span>
          <span className="text-purple-400">desktop-ui</span>
          <span className="text-white">:~$</span>
          <span className="ml-2">echo "Hello from desktop-ui!"</span>
        </div>
        <div>Hello from desktop-ui!</div>
        <div className="flex">
          <span className="text-blue-400">demo</span>
          <span className="text-white">@</span>
          <span className="text-purple-400">desktop-ui</span>
          <span className="text-white">:~$</span>
          <span className="ml-2 animate-pulse">▋</span>
        </div>
      </div>
    </div>
  );
}

function NotesDemo() {
  return (
    <div className="h-full bg-amber-50 p-4">
      <h2 className="text-lg font-bold text-amber-800 mb-3">Quick Notes</h2>
      <textarea
        className="w-full h-[calc(100%-3rem)] bg-transparent resize-none focus:outline-none text-amber-900 placeholder:text-amber-400"
        placeholder="Start typing your notes..."
        defaultValue={`Welcome to desktop-ui!\n\nThis is a macOS-style desktop for React.\n\nFeatures:\n- Draggable windows\n- Resizable from edges\n- Snap to edges\n- App & Browser modes\n- Dark/Light theming`}
      />
    </div>
  );
}

function SettingsDemo() {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <div
      className="h-full p-6 overflow-auto transition-colors duration-200"
      style={{
        backgroundColor: colors.overlayBg,
        color: colors.textPrimary,
      }}
    >
      <h2 className="text-xl font-bold mb-6">Settings</h2>

      <div className="space-y-6">
        <div
          className="rounded-lg p-4 transition-colors duration-200"
          style={{
            backgroundColor: colors.titleBarBg,
          }}
        >
          <h3 className="font-medium mb-3">Appearance</h3>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-between w-full text-left"
          >
            <span style={{ color: colors.textSecondary }}>Dark Mode</span>
            <div
              className="w-12 h-6 rounded-full relative transition-colors duration-200"
              style={{
                backgroundColor: isDark ? '#3b82f6' : colors.border,
              }}
            >
              <div
                className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200"
                style={{
                  left: isDark ? 'calc(100% - 1.25rem)' : '0.25rem',
                }}
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   ICONS
   ========================================================================== */

const TerminalIcon = () => (
  <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-700 shadow-lg">
    <svg className="w-8 h-8 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  </div>
);

const GlobeIcon = () => (
  <div className="w-14 h-14 bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-700 shadow-lg">
    <svg className="w-8 h-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  </div>
);

const NotesIcon = () => (
  <div className="w-14 h-14 bg-amber-400 rounded-xl flex items-center justify-center shadow-lg">
    <svg className="w-8 h-8 text-amber-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  </div>
);

const SettingsIcon = () => (
  <div className="w-14 h-14 bg-zinc-700 rounded-xl flex items-center justify-center border border-zinc-600 shadow-lg">
    <svg className="w-8 h-8 text-zinc-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  </div>
);

/* ==========================================================================
   TITLE BAR ICONS
   ========================================================================== */

const TerminalTitleIcon = () => (
  <svg className="w-4 h-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const GlobeTitleIcon = () => (
  <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const NotesTitleIcon = () => (
  <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const SettingsTitleIcon = () => (
  <svg className="w-4 h-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

/* ==========================================================================
   CONFIG
   ========================================================================== */

const demoConfig: DesktopConfig = {
  windows: [
    {
      id: 'terminal',
      type: 'app',
      title: 'Terminal',
      icon: <TerminalTitleIcon />,
      component: TerminalDemo,
      dimensions: {
        responsive: false,
        width: '650px',
        height: '450px',
        initialX: 80,
        initialY: 60,
      },
    },
    {
      id: 'browser',
      type: 'browser',
      title: 'https://renato.works',
      icon: <GlobeTitleIcon />,
      url: 'https://renato.works/web',
      showReloadButton: true,
      openMaximized: true,
    },
    {
      id: 'notes',
      type: 'app',
      title: 'Notes',
      icon: <NotesTitleIcon />,
      component: NotesDemo,
      dimensions: {
        responsive: false,
        width: '380px',
        height: '480px',
        initialX: 900,
        initialY: 60,
      },
    },
    {
      id: 'settings',
      type: 'app',
      title: 'Settings',
      icon: <SettingsTitleIcon />,
      component: SettingsDemo,
      dimensions: {
        responsive: false,
        width: '450px',
        height: '400px',
        initialX: 350,
        initialY: 150,
      },
    },
  ],
  icons: [
    { id: 'terminal-icon', windowId: 'terminal', icon: <TerminalIcon />, label: 'Terminal' },
    { id: 'browser-icon', windowId: 'browser', icon: <GlobeIcon />, label: 'Browser' },
    { id: 'notes-icon', windowId: 'notes', icon: <NotesIcon />, label: 'Notes' },
    { id: 'settings-icon', windowId: 'settings', icon: <SettingsIcon />, label: 'Settings' },
  ],
  darkBackground: {
    type: 'image',
    url: 'https://images.pexels.com/photos/34720596/pexels-photo-34720596.jpeg?auto=compress&cs=tinysrgb&w=1920',
    size: 'cover',
    position: 'center',
  },
  lightBackground: {
    type: 'image',
    url: 'https://images.pexels.com/photos/691668/pexels-photo-691668.jpeg?auto=compress&cs=tinysrgb&w=1920',
    size: 'cover',
    position: 'center',
  },
  iconLayout: {
    startPosition: 'top-left',
    direction: 'vertical',
    gap: 8,
    padding: 16,
  },
  autoOpenWindow: 'notes',
};

/* ==========================================================================
   APP
   ========================================================================== */

export default function App() {
  return <Desktop config={demoConfig} />;
}
