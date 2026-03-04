# Next.js Integration

## Prerequisites

- Next.js 14+ with App Router
- Node.js 18+

## Quick Start

**1. Install and generate config:**

```bash
npm install autotheme
npx autotheme init
# Select "Next.js" when prompted
```

**2. Generate your theme:**

```bash
npx autotheme
```

**3. Import in your root layout:**

```css
/* src/app/globals.css */
@import "./autotheme.css";

/* Your other styles below */
```

That's it. Your semantic tokens (`--surface`, `--text-1`, `--accent`, etc.) are now available globally.

## Full Setup

### Install & Generate Config

```bash
npm install -D autotheme
npx autotheme init
```

Select "Next.js" to get framework-specific defaults:

```json
{
  "$schema": "./node_modules/autotheme/schema.json",
  "color": "#6439FF",
  "harmony": "analogous",
  "mode": "both",
  "shadcn": true,
  "output": {
    "path": "./src/app/autotheme.css",
    "tailwind": true
  }
}
```

### CSS Import & @layer Ordering

Import AutoTheme **before** your custom styles to respect layer ordering:

```css
/* src/app/globals.css */
@import "./autotheme.css";

/* Your custom styles — these override AutoTheme tokens */
body {
  background: var(--surface);
  color: var(--text-1);
}
```

### Using Semantic Tokens

AutoTheme generates ~25 semantic tokens by default:

```css
.card {
  background: var(--surface-raised);
  border: 1px solid var(--border);
  color: var(--text-1);
}

.button-primary {
  background: var(--accent);
  color: var(--accent-contrast);
}

.sidebar {
  background: var(--surface-sunken);
  border-right: 1px solid var(--border-subtle);
}
```

## Dark Mode

### With `next-themes` (Recommended)

AutoTheme's `mode: "both"` generates CSS using the `light-dark()` function. Pair with `next-themes` for toggle control:

```bash
npm install next-themes
```

```tsx
// src/app/layout.tsx
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

AutoTheme's `light-dark()` output responds to the `color-scheme` property. Add this to your globals:

```css
/* src/app/globals.css */
@import "./autotheme.css";

:root {
  color-scheme: light;
}
.dark {
  color-scheme: dark;
}
```

### CSS-Only (`light-dark()`)

If you don't need a JS toggle, AutoTheme's `mode: "both"` uses `light-dark()` which follows `prefers-color-scheme` automatically:

```css
/* No JS needed — follows system preference */
:root {
  color-scheme: light dark;
}
```

## Tailwind v4

Enable `palette: true` for the full 50-950 color scale compatible with Tailwind utilities:

```json
{
  "palette": true,
  "output": { "tailwind": true }
}
```

This generates `--color-primary-50` through `--color-primary-950` for each harmony color. Use them in Tailwind classes:

```html
<div class="bg-primary-500 text-primary-contrast">
  Tailwind v4 picks up the CSS variables automatically.
</div>
```

### PostCSS `@import`

Next.js handles `@import` in CSS files natively via PostCSS. No additional configuration needed.

## Shadcn UI

Enable with `shadcn: true` (default in Next.js init):

```json
{
  "shadcn": true
}
```

This maps AutoTheme semantic tokens to Shadcn's expected variable names:

| Shadcn Variable | AutoTheme Source   |
| --------------- | ------------------ |
| `--background`  | Surface token      |
| `--foreground`  | Text-1 token       |
| `--primary`     | Accent token       |
| `--secondary`   | Secondary accent   |
| `--muted`       | Sunken surface     |
| `--accent`      | Subtle accent      |
| `--border`      | Border token       |
| `--ring`        | Focus ring color   |
| `--radius`      | Border radius base |

All values are in OKLCH format. Shadcn components work without modification.

## Troubleshooting

### OKLCH Browser Support

OKLCH is supported in Chrome 111+, Firefox 113+, Safari 15.4+. For older browsers, set `format: "hsl"` in your config.

### `@import` Must Come First

CSS `@import` rules must appear before any other rules. If you see import errors, ensure `@import "./autotheme.css"` is the first line in `globals.css`.

### Turbopack CSS Ordering

If using Turbopack (`next dev --turbo`), CSS import order is preserved. No special configuration needed.

### Hydration Mismatch with Dark Mode

Add `suppressHydrationWarning` to `<html>` when using `next-themes` to prevent hydration warnings from the class attribute change.
