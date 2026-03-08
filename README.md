# desktop-ui

![Desktop UI Demo](.github/assets/demo.gif)

A macOS-style desktop environment for React. Draggable windows, desktop icons, dark/light theming, and more.

![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- **Declarative Configuration** - Define your entire desktop with a single config object
- **Two Window Types** - `app` (render components) and `browser` (render iframes)
- **Dark/Light Theming** - Built-in theme support with smooth crossfade wallpaper transitions
- **Draggable Windows** - Full drag-and-drop support with title bar
- **Resizable Windows** - Resize from edges and corners
- **Window Snapping** - Snap to edges, split screen, and maximize
- **Desktop Icons** - Draggable icons linked to windows with minimize animations
- **Mobile Responsive** - Auto-maximize windows on small screens
- **TypeScript** - Full type safety with comprehensive interfaces

## Quick Start

```bash
# Clone the template
git clone https://github.com/renatoworks/desktop-ui.git my-desktop
cd my-desktop

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 to see the demo.

## Project Structure

```
desktop-ui/
├── src/
│   ├── components/       # Desktop, Window, DesktopIcon
│   ├── contexts/         # DesktopContext, ThemeContext
│   ├── hooks/            # useWindowManager
│   ├── types/            # TypeScript interfaces
│   ├── App.tsx           # Demo application
│   ├── main.tsx          # Entry point
│   └── index.ts          # Library exports
├── index.html
├── vite.config.ts
└── tailwind.config.js
```

## Basic Usage

Edit `src/App.tsx` to customize your desktop:

```tsx
import { Desktop, DesktopConfig } from './';

function MyApp() {
  return (
    <div className="h-full bg-black text-white p-4">
      <h1>Hello World!</h1>
    </div>
  );
}

const config: DesktopConfig = {
  windows: [
    {
      id: 'my-app',
      type: 'app',
      title: 'My App',
      component: MyApp,
    },
  ],
  icons: [
    {
      id: 'my-app-icon',
      windowId: 'my-app',
      icon: <MyIcon />,
      label: 'My App',
    },
  ],
  darkBackground: {
    type: 'gradient',
    gradient: 'linear-gradient(to bottom, #1a1a2e, #16213e)',
  },
};

export default function App() {
  return <Desktop config={config} />;
}
```

## Configuration Reference

### DesktopConfig

```typescript
interface DesktopConfig {
  windows: WindowConfig[];           // Array of window configurations
  icons: DesktopIconConfig[];        // Array of desktop icons
  background?: BackgroundConfig;     // Desktop background (fallback)
  darkBackground?: BackgroundConfig; // Background for dark theme
  lightBackground?: BackgroundConfig;// Background for light theme
  iconLayout?: IconLayoutConfig;     // How icons are arranged
  autoOpenWindow?: string;           // Window ID to open on mount
}
```

### Window Types

#### App Window

```typescript
{
  id: 'terminal',
  type: 'app',
  title: 'Terminal',
  icon: <TerminalIcon />,
  component: TerminalApp,
  componentProps: { theme: 'dark' },  // Props passed to component
  dimensions: {
    responsive: false,
    width: '800px',
    height: '600px',
    initialX: 100,
    initialY: 100,
  },
  openMaximized: false,               // Open maximized on desktop
  canMinimize: true,
  canMaximize: true,
  canResize: true,
}
```

#### Browser Window

```typescript
{
  id: 'browser',
  type: 'browser',
  title: 'https://example.com',
  url: 'https://example.com',
  showReloadButton: true,
  openMaximized: true,                // Great for showcasing websites
}
```

### Desktop Icons

```typescript
{
  id: 'terminal-icon',
  windowId: 'terminal',               // Links to window by ID
  icon: <TerminalIcon />,             // React element or string
  label: 'Terminal',
}
```

### Backgrounds

```typescript
// Solid color
{ type: 'color', color: '#1a1a2e' }

// Image
{ type: 'image', url: '/wallpaper.jpg', size: 'cover', position: 'center' }

// Gradient
{ type: 'gradient', gradient: 'linear-gradient(to bottom, #1a1a2e, #16213e)' }
```

## Theming

Use `darkBackground` and `lightBackground` for theme-aware wallpapers with crossfade transitions:

```tsx
const config: DesktopConfig = {
  darkBackground: {
    type: 'image',
    url: '/wallpapers/night.jpg',
    size: 'cover',
  },
  lightBackground: {
    type: 'image',
    url: '/wallpapers/day.jpg',
    size: 'cover',
  },
  // ... windows and icons
};
```

### Using the Theme Hook

Access theme state from any component inside the Desktop:

```tsx
import { useTheme } from './';

function SettingsPanel() {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <div style={{ backgroundColor: colors.overlayBg }}>
      <button onClick={toggleTheme}>
        {isDark ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );
}
```

### Theme Colors

| Token | Description |
|-------|-------------|
| `windowBg` | Window background |
| `titleBarBg` | Active title bar |
| `titleBarBgInactive` | Inactive title bar |
| `border` | Border color |
| `textPrimary` | Primary text |
| `textSecondary` | Muted text |
| `urlBarBg` | Browser URL bar |
| `hoverBg` | Hover state |
| `overlayBg` | Overlay/loading |

## Window Behavior

### Snap Zones
- **Top edge**: Maximize to full screen
- **Left/Right edge**: Snap to half screen

### Mobile
- Windows auto-maximize below 768px width
- Resize handles hidden on touch devices

### Minimize Animation
- Windows animate to/from their icon position

## Hooks

```tsx
import { useDesktopContext, useTheme } from './';

function MyComponent() {
  const { openWindow, closeWindow, windows } = useDesktopContext();
  const { isDark, toggleTheme, colors } = useTheme();

  // ...
}
```

---

## Migrating to Next.js

If you need SSR, API routes, or prefer Next.js, follow these steps:

### 1. Create Next.js project

```bash
npx create-next-app@latest my-desktop --typescript --tailwind --app
cd my-desktop
```

### 2. Copy the desktop components

```bash
# Copy from desktop-ui to your Next.js project
cp -r desktop-ui/src/components ./src/
cp -r desktop-ui/src/contexts ./src/
cp -r desktop-ui/src/hooks ./src/
cp -r desktop-ui/src/types ./src/
cp desktop-ui/src/index.ts ./src/
```

### 3. Create the page

```tsx
// app/page.tsx
'use client';

import { Desktop } from '@/';
import type { DesktopConfig } from '@/';

const config: DesktopConfig = {
  // ... your config
};

export default function Page() {
  return <Desktop config={config} />;
}
```

### 4. Update Tailwind config

```javascript
// tailwind.config.ts
content: [
  './src/**/*.{js,ts,jsx,tsx}',
  './app/**/*.{js,ts,jsx,tsx}',
],
```

### 5. Add global styles

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body {
  height: 100%;
  overflow: hidden;
}
```

### Key Differences

| Vite | Next.js |
|------|---------|
| No `'use client'` needed | Add `'use client'` to pages using Desktop |
| `src/main.tsx` entry | `app/page.tsx` entry |
| `index.html` | Next.js handles HTML |
| Client-side only | Can use SSR for other pages |

---

## License

MIT

## Author

Renato Costa ([renato.works](https://renato.works))

Made in [Blueberry](https://meetblueberry.com) 🫐