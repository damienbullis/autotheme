# Nuxt Integration

## Prerequisites

- Nuxt 3+
- Node.js 18+

## Quick Start

**1. Install and generate config:**

```bash
npm install -D autotheme
npx autotheme init
# Select "Nuxt" when prompted
npx autotheme
```

**2. Add to `nuxt.config.ts`:**

```ts
export default defineNuxtConfig({
  css: ["~/assets/css/autotheme.css"],
});
```

**3. Use the tokens:**

```vue
<style scoped>
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

Select "Nuxt" to get framework-specific defaults:

```json
{
  "$schema": "./node_modules/autotheme/schema.json",
  "color": "#6439FF",
  "harmony": "analogous",
  "mode": "both",
  "output": {
    "path": "./assets/css/autotheme.css",
    "tailwind": true
  }
}
```

### CSS Import via `nuxt.config.ts`

Register AutoTheme CSS globally:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ["~/assets/css/autotheme.css"],
});
```

This ensures the tokens are available in all components and pages.

### Using Semantic Tokens

Tokens work in scoped styles, global styles, and Tailwind utilities:

```vue
<template>
  <div class="page">
    <header class="header">Navigation</header>
    <main class="content">
      <div class="card">Card content</div>
    </main>
  </div>
</template>

<style scoped>
.page {
  background: var(--surface);
  color: var(--text-1);
}

.header {
  background: var(--surface-sunken);
  border-bottom: 1px solid var(--border);
}

.card {
  background: var(--surface-raised);
  border: 1px solid var(--border-subtle);
}
</style>
```

## Dark Mode

### With `@nuxtjs/color-mode` (Recommended)

```bash
npm install -D @nuxtjs/color-mode
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@nuxtjs/color-mode"],
  css: ["~/assets/css/autotheme.css"],
  colorMode: {
    classSuffix: "",
  },
});
```

Then set `color-scheme` per class:

```css
/* assets/css/app.css */
:root {
  color-scheme: light;
}
.dark {
  color-scheme: dark;
}
```

AutoTheme's `light-dark()` output responds to the `color-scheme` property automatically.

```vue
<template>
  <button @click="$colorMode.preference = $colorMode.value === 'dark' ? 'light' : 'dark'">
    Toggle theme
  </button>
</template>
```

### CSS-Only with `light-dark()`

For no-JS dark mode that follows system preference:

```css
:root {
  color-scheme: light dark;
}
```

## Tailwind v4

Nuxt uses Vite natively, so Tailwind v4's `@import` works out of the box.

Enable palette generation:

```json
{
  "palette": true,
  "output": { "tailwind": true }
}
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  css: ["~/assets/css/autotheme.css"],
  modules: ["@nuxtjs/tailwindcss"],
});
```

Use Tailwind utilities with AutoTheme's color scale:

```vue
<template>
  <div class="bg-primary-500 text-primary-contrast p-4 rounded-lg">Styled with Tailwind</div>
</template>
```

## Troubleshooting

### OKLCH Browser Support

OKLCH is supported in Chrome 111+, Firefox 113+, Safari 15.4+. For older browsers, set `format: "hsl"` in your config.

### `@import` Ordering

When using `@import` inside Nuxt's CSS files, ensure AutoTheme is imported first. The `css` array in `nuxt.config.ts` preserves order.

### Scoped Styles

CSS custom properties defined globally are accessible in all `<style scoped>` blocks. No special configuration needed.

### HMR and Token Updates

After regenerating tokens with `npx autotheme`, Nuxt's Vite HMR picks up changes automatically during development.
