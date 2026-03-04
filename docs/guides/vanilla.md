# Vanilla / No Framework Integration

## Prerequisites

- Any modern browser (Chrome 111+, Firefox 113+, Safari 15.4+ for OKLCH)
- Node.js 18+ (for CLI generation only)

## Quick Start

**1. Generate your theme:**

```bash
npx autotheme init
# Select "Vanilla / Other" when prompted
npx autotheme
```

**2. Link the CSS:**

```html
<link rel="stylesheet" href="./autotheme.css" />
```

**3. Use the tokens:**

```css
body {
  background: var(--surface);
  color: var(--text-1);
}
```

## Full Setup

### Install & Generate Config

```bash
npx autotheme init
```

Select "Vanilla / Other" for minimal defaults:

```json
{
  "$schema": "./node_modules/autotheme/schema.json",
  "color": "#6439FF",
  "harmony": "analogous",
  "mode": "both",
  "output": {
    "path": "./autotheme.css"
  }
}
```

### CSS Import

For a no-build-step setup, use a `<link>` tag:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <link rel="stylesheet" href="./autotheme.css" />
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <!-- Your content -->
  </body>
</html>
```

Or use `@import` in your main stylesheet:

```css
/* styles.css */
@import "./autotheme.css";

/* Your custom styles */
```

### Using Semantic Tokens

AutoTheme generates ~25 semantic tokens by default:

```css
.card {
  background: var(--surface-raised);
  border: 1px solid var(--border);
  color: var(--text-1);
}

.button {
  background: var(--accent);
  color: var(--accent-contrast);
}

.nav {
  background: var(--surface-sunken);
  border-bottom: 1px solid var(--border-subtle);
}

.muted-text {
  color: var(--text-3);
}
```

## Dark Mode

### CSS-Only with `light-dark()` (Recommended)

With `mode: "both"`, AutoTheme generates values using the CSS `light-dark()` function. It follows the user's system preference automatically:

```css
:root {
  color-scheme: light dark;
}
```

No JavaScript required. The browser handles the toggle based on `prefers-color-scheme`.

### Manual Toggle with `color-scheme`

To add a manual dark mode toggle:

```html
<button id="theme-toggle">Toggle Theme</button>

<script>
  const toggle = document.getElementById("theme-toggle");
  toggle.addEventListener("click", () => {
    const current = document.documentElement.style.colorScheme;
    document.documentElement.style.colorScheme = current === "dark" ? "light" : "dark";
  });
</script>
```

### Separate Light/Dark Files

Alternatively, generate separate files with `mode: "light"` and `mode: "dark"`:

```html
<link rel="stylesheet" href="./autotheme-light.css" />
<link rel="stylesheet" href="./autotheme-dark.css" media="(prefers-color-scheme: dark)" />
```

## Tailwind v4

Vanilla setups typically don't use Tailwind, but if you do:

```json
{
  "palette": true,
  "output": { "tailwind": true }
}
```

## Troubleshooting

### OKLCH Browser Support

OKLCH is supported in all modern browsers. For legacy support, set `format: "hsl"` in your config:

```json
{
  "output": { "format": "hsl" }
}
```

### @import Ordering

When using `@import`, it must appear before any other CSS rules in the file. Place `@import "./autotheme.css"` as the first line.

### CDN Usage

AutoTheme doesn't provide a CDN. Generate the CSS file and host it alongside your other assets.
