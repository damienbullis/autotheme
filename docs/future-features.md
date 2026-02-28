# Future Features

Planned enhancements for AutoTheme, ordered by priority.

---

## CLI Theme Generation

The CLI currently stubs out the actual generation step (`src/cli/cli.ts:30`). Wiring `generateTheme()` and `writeOutputs()` is the critical path to making the tool functional.

**What's needed:**
- Import `Color`, `generateFullPalette`, `generateCSS` into the CLI run loop
- Call `writeOutputs(theme, config)` to write all enabled outputs
- Handle random color generation when no `--color` is provided
- Print summary of generated files on completion

**Status:** All generators exist and are tested. This is pure plumbing.

---

## Advanced Visual Features

A suite of CSS-native visual effects that go beyond colors. These turn AutoTheme from a palette generator into a full visual design system.

### Blobs

Generate organic, animated blob shapes as SVG data URLs or CSS `clip-path` values.

```css
--blob-1: path("M45.3,-51.2C58.1,...");
--blob-2: path("M39.8,-47.6C52.4,...");
--blob-animate-duration: 8s;
```

**Potential output:**
- Static blob `clip-path` values for containers and hero sections
- Animated blob SVGs (morphing between shapes) as background images
- Configurable complexity (number of points, randomness)

**Implementation:** Generate random smooth closed curves using cubic bezier control points with configurable seed for reproducibility.

### SVG Filters

Extend the noise texture concept with a library of SVG filter effects.

```css
--filter-grain: url("data:image/svg+xml,...");     /* Film grain */
--filter-glow: url("data:image/svg+xml,...");      /* Soft glow */
--filter-duotone: url("data:image/svg+xml,...");   /* Duotone using palette colors */
--filter-halftone: url("data:image/svg+xml,...");  /* Halftone dot pattern */
--filter-displacement: url("data:image/svg+xml,..."); /* Wavy distortion */
```

Each filter is theme-aware — duotone maps to primary/secondary, glow uses the accent color, grain intensity ties to the noise frequency config.

**Config:** `filters: boolean` (default: `true`)

### Blend Modes

Pre-composed background blend utilities that combine palette colors.

```css
.blend-multiply {
    background-blend-mode: multiply;
}
.blend-overlay {
    background-blend-mode: overlay;
}
.blend-screen-accent {
    background-color: var(--accent);
    background-blend-mode: screen;
}
.blend-color-primary {
    background-color: var(--primary);
    background-blend-mode: color;
}
```

Useful on their own, but designed to be composed with the stack/layer system below.

### Filter / Backdrop-Filter Utilities

CSS `filter` and `backdrop-filter` utilities derived from the theme.

```css
/* Tinted glass effects using palette colors */
.glass-primary {
    backdrop-filter: blur(12px) saturate(1.5);
    background: oklch(from var(--primary) l c h / 0.15);
}
.glass-surface {
    backdrop-filter: blur(8px) saturate(1.2);
    background: oklch(from var(--surface) l c h / 0.6);
}

/* Filter presets */
.filter-tint-primary {
    filter: sepia(1) hue-rotate(var(--primary-hue-offset)) saturate(2);
}
.filter-frosted {
    backdrop-filter: blur(16px) brightness(1.1);
}
```

**Config:** `filters: boolean` — shared toggle with SVG filters.

### Stack / Layer Compositing

The key feature that ties everything together. A system for composing backgrounds by stacking multiple visual layers — noise, gradients, blobs, blend modes, and filters — into a single element.

```css
/* Each layer is a separate background-image, composed via background-blend-mode */
.stack {
    /* Base setup for layer compositing */
    background-repeat: no-repeat;
    background-size: cover;
}

/* Compose layers by combining classes */
.stack-noise {
    /* Adds noise as a background layer */
    background-image: var(--background-image-noise);
}
.stack-gradient-primary {
    /* Adds primary gradient layer */
    background-image: linear-gradient(
        var(--gradient-direction, 135deg),
        var(--primary-container),
        var(--accent-container)
    );
}
.stack-blob {
    /* Adds blob shape layer */
    background-image: var(--blob-1);
}
.stack-blend-overlay {
    background-blend-mode: overlay;
}
```

**Composition example:**

```html
<!-- Gradient + noise + overlay blend = textured hero -->
<section class="stack stack-gradient-primary stack-noise stack-blend-overlay">
  ...
</section>

<!-- Surface + blob + soft-light = organic card -->
<div class="stack surface stack-blob stack-blend-soft-light">
  ...
</div>
```

**Implementation approach:** CSS multiple backgrounds naturally stack. Each `.stack-*` class appends to `background-image` via CSS custom properties that get combined. The blend mode applies across all layers. This is pure CSS composition — no JS runtime.

**Config:** `stack: boolean` (default: `true` when any visual feature is enabled)

---

## Export Formats

### CSS to stdout

Output generated CSS to stdout instead of writing files, for piping into other tools:

```bash
autotheme --color "#6439FF" --stdout | pbcopy
autotheme --color "#6439FF" --stdout > my-theme.css
```

### CSS file output

The default — write to the configured output path. Already implemented in generators.

---

## Theme Presets

Named color + harmony combinations for common use cases.

```bash
autotheme --preset ocean       # #0077B6, analogous
autotheme --preset sunset      # #FF6B35, split-complementary
autotheme --preset forest      # #2D6A4F, triadic
autotheme --preset midnight    # #1B1464, complementary
autotheme --preset coral       # #FF6B6B, aurelian
autotheme --preset lavender    # #7C6FE3, analogous
```

**Implementation:** A `Record<string, { color: string; harmony: HarmonyType }>` map shipped with the CLI. Presets set `color` and `harmony` — all other config options still apply on top. No new architecture needed.

```bash
# Preset + overrides
autotheme --preset ocean --no-shadcn --tailwind
```

---

## Additional Harmony Types

### Custom Angle Harmony

User-defined hue offsets:

```bash
autotheme --harmony custom --angles "0,45,210"
```

The `generateCustomHarmony()` function already exists in `src/core/harmonies.ts` — this just needs a CLI/config surface.

### Monochromatic

Single hue with lightness and saturation variations only. Common for minimal, editorial designs. Produces a 1-color palette where the semantic secondary/tertiary/accent are all derived from tint/shade/tone variations of the primary.

### Double Split-Complementary

5 colors: base + two splits on each side of the complement. Useful for data-heavy UIs needing many distinct colors.

---

## Color Blindness Simulation & Utilities

### Simulation Mode

A `--simulate` flag or web app toggle to preview themes under color vision deficiencies.

**Types:**
- Deuteranopia (red-green, ~6% of males)
- Protanopia (red-green, ~2% of males)
- Tritanopia (blue-yellow, rare)
- Achromatopsia (total color blindness)

**Implementation:** Apply Brettel 3x3 color matrices to each RGB value. Output as a separate CSS file or preview-only overlay.

### Accessibility Utilities

CSS utility classes that help with color-blind-safe design:

```css
/* Pattern fills for charts (don't rely on color alone) */
.pattern-stripe { ... }
.pattern-dot { ... }
.pattern-cross { ... }

/* High contrast mode overrides */
@media (forced-colors: active) {
    .surface { background: Canvas; color: CanvasText; }
    .primary-surface { background: Highlight; color: HighlightText; }
}
```

---

## Framework Integration Guides

Step-by-step docs for common setups:

- **Next.js** — `app/globals.css` import, `next-themes` integration for dark mode
- **Vue / Nuxt** — Scoped vs global theming, Nuxt color-mode module
- **Svelte / SvelteKit** — `app.css` import, media query dark mode
- **Astro** — Integration with `@astrojs/tailwind`, island architecture
- **Vanilla / CDN** — Direct `<link>` import, `darkmode.js` script placement

Each guide covers: installation, importing the CSS, dark mode setup, and using semantic tokens / Tailwind utilities.

---

## P3 Wide Gamut + Fallback

OKLCH already supports colors outside sRGB. A `--gamut wide` flag would unlock the full Display P3 gamut for more vivid, saturated colors on supported displays.

```css
/* sRGB fallback */
:root {
    --primary: oklch(0.49 0.27 285);
}

/* P3 enhanced — more saturated where the display supports it */
@media (color-gamut: p3) {
    :root {
        --primary: oklch(0.49 0.34 285);
    }
}
```

**Implementation:**
- Detect which palette colors can benefit from wider gamut (high chroma values that get clamped in sRGB)
- Generate `@media (color-gamut: p3)` blocks with unclamped OKLCH values
- Add gamut-aware clamping to `conversions.ts` so the sRGB fallback is correct
- The Color class already handles OKLCH — this is mainly conversion/output work
