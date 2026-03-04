# Astro Integration

## Prerequisites

- Astro 4+
- Node.js 18+

## Quick Start

**1. Install and generate config:**

```bash
npm install -D autotheme
npx autotheme init
# Select "Astro" when prompted
npx autotheme
```

**2. Import in your base layout:**

```astro
---
// src/layouts/Base.astro
---
<html lang="en">
  <head>
    <style is:global>
      @import "../styles/autotheme.css";
    </style>
  </head>
  <body>
    <slot />
  </body>
</html>
```

**3. Use the tokens:**

```astro
<div class="card">
  <h2>Hello</h2>
</div>

<style>
  .card {
    background: var(--surface-raised);
    color: var(--text-1);
  }
</style>
```

## Full Setup

### Install & Generate Config

```bash
npm install -D autotheme
npx autotheme init
```

Select "Astro" to get framework-specific defaults:

```json
{
  "$schema": "./node_modules/autotheme/schema.json",
  "color": "#6439FF",
  "harmony": "analogous",
  "mode": "both",
  "output": {
    "path": "./src/styles/autotheme.css",
    "tailwind": true
  }
}
```

### CSS Import in Layout

Import AutoTheme in your base layout so it's available on every page:

```astro
---
// src/layouts/Base.astro
---
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width" />
    <style is:global>
      @import "../styles/autotheme.css";
    </style>
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Using Semantic Tokens

Tokens work in both scoped `<style>` blocks and global styles:

```astro
<style>
  .hero {
    background: var(--surface);
    color: var(--text-1);
    border-bottom: 1px solid var(--border);
  }

  .cta {
    background: var(--accent);
    color: var(--accent-contrast);
  }
</style>
```

## Dark Mode

### Island-Architecture Considerations

Astro components are server-rendered by default. For dark mode, you have two approaches:

#### CSS-Only with `light-dark()` (Recommended)

With `mode: "both"`, tokens automatically adapt to system preference:

```astro
<!-- src/layouts/Base.astro -->
<html lang="en">
  <head>
    <style is:global>
      @import "../styles/autotheme.css";
      :root { color-scheme: light dark; }
    </style>
  </head>
  <body><slot /></body>
</html>
```

No JavaScript, no hydration — works with Astro's zero-JS philosophy.

#### Interactive Toggle (Client Island)

For a manual toggle, use a client-side island:

```astro
---
// src/components/ThemeToggle.astro
---
<button id="theme-toggle" class="theme-toggle">Toggle theme</button>

<script>
  const btn = document.getElementById("theme-toggle")!;
  btn.addEventListener("click", () => {
    const current = document.documentElement.style.colorScheme;
    document.documentElement.style.colorScheme = current === "dark" ? "light" : "dark";
  });
</script>
```

This script runs on the client without a framework island since it's vanilla JS.

## Tailwind v4

### With `@astrojs/tailwind`

```bash
npx astro add tailwind
```

Enable palette generation for Tailwind utilities:

```json
{
  "palette": true,
  "output": { "tailwind": true }
}
```

Import AutoTheme before Tailwind in your layout:

```astro
<style is:global>
  @import "../styles/autotheme.css";
</style>
```

Tailwind v4 automatically discovers CSS custom properties. Use them directly:

```astro
<div class="bg-primary-500 text-primary-contrast">
  Styled with Tailwind utilities
</div>
```

## Troubleshooting

### OKLCH Browser Support

OKLCH is supported in Chrome 111+, Firefox 113+, Safari 15.4+. For older browsers, set `format: "hsl"` in your config.

### Scoped Styles and CSS Variables

Astro's scoped styles work with CSS custom properties. Variables defined globally (via `is:global`) are accessible in all scoped `<style>` blocks.

### `@import` in `is:global`

Vite handles `@import` in `<style is:global>` blocks. The import path is relative to the component file.

### Content Collections

CSS variables are available in content collection layouts. Import AutoTheme in the layout component that wraps your collection pages.
