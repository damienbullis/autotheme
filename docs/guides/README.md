# Framework Integration Guides

AutoTheme generates OKLCH-based CSS tokens that work with any framework. These guides cover the recommended setup for each.

## Quick Comparison

| Feature     | Next.js                     | Vanilla                           | Astro                            | Nuxt                  | SvelteKit             |
| ----------- | --------------------------- | --------------------------------- | -------------------------------- | --------------------- | --------------------- |
| CSS Import  | `@import` in `globals.css`  | `<link>` tag                      | Layout `<style>`                 | `nuxt.config.ts` css  | `app.css`             |
| Dark Mode   | `next-themes`               | AutoTheme script / `light-dark()` | `prefers-color-scheme` / islands | `@nuxtjs/color-mode`  | Store-based toggle    |
| Tailwind v4 | `@import` + `palette: true` | N/A                               | `@astrojs/tailwind`              | Vite-native `@import` | Vite-native `@import` |
| Shadcn UI   | `shadcn: true`              | N/A                               | Community port                   | N/A                   | Community port        |
| Build Tool  | Next.js (Turbopack/webpack) | None                              | Vite                             | Vite                  | Vite                  |

## Default Output

By default, AutoTheme generates **~25 semantic tokens** (surfaces, text, borders, accents) — not the full 50-950 color scale. This keeps your CSS minimal.

To get the full Tailwind-compatible palette, set `palette: true` in your config:

```json
{
  "color": "#6439FF",
  "harmony": "analogous",
  "palette": true
}
```

## Color Format

All values use the OKLCH color space for perceptual uniformity:

```css
--surface: oklch(0.97 0.01 280);
--text-1: oklch(0.15 0.02 280);
--accent: oklch(0.55 0.18 280);
```

OKLCH is supported in all modern browsers (Chrome 111+, Firefox 113+, Safari 15.4+).

## CSS Layers

AutoTheme wraps output in `@layer` declarations for clean cascade control:

```css
@layer autotheme.palette, autotheme.semantics, autotheme.utilities;
```

## Guides

- [Next.js](./nextjs.md) — App Router, `next-themes`, Shadcn UI
- [Vanilla / No Framework](./vanilla.md) — Direct `<link>`, no build step
- [Astro](./astro.md) — Layout import, island-architecture dark mode
- [Nuxt](./nuxt.md) — `nuxt.config.ts`, `@nuxtjs/color-mode`
- [SvelteKit](./sveltekit.md) — `app.css`, store-based toggle
