# AutoTheme Features

AutoTheme generates a complete CSS design system from a single color. This document covers every feature in detail.

## Architecture: Semantic-First

AutoTheme defaults to semantic tokens — meaningful design tokens derived from your color, not raw palette scales. The full 50–950 palette is available via `palette: true` but most projects only need semantics.

```
Default output (~25 tokens):
  Surfaces, text hierarchy, borders, accents, error
  Typography, spacing, gradients, noise

Full output (opt-in features):
  + Palette scales (50-950 per harmony color)
  + States (hover, active, focus, disabled)
  + Elevation (surfaces + multi-layer shadows)
  + Shadows, radius, motion scales
  + Shadcn UI variables
  + Visual effects (filters, glass, blobs, patterns, blend modes)
```

---

## Color Palette

**Config:** `palette: boolean | PaletteConfig` (default: `false`)

When enabled, every harmony color gets a full scale. For a triadic harmony (3 colors), that's `primary`, `secondary`, and `tertiary`.

### Per-Color Variables

| Variable                    | Description                             |
| --------------------------- | --------------------------------------- |
| `--color-{name}-50`         | Lightest tint                           |
| `--color-{name}-100`        |                                         |
| `--color-{name}-200`        |                                         |
| `--color-{name}-300`        |                                         |
| `--color-{name}-400`        |                                         |
| `--color-{name}-500`        | Base color                              |
| `--color-{name}-600`        |                                         |
| `--color-{name}-700`        |                                         |
| `--color-{name}-800`        |                                         |
| `--color-{name}-900`        |                                         |
| `--color-{name}-950`        | Darkest shade                           |
| `--color-{name}-foreground` | Accessible text color (WCAG AAA target) |
| `--color-{name}-contrast`   | High contrast text (pure light/dark)    |
| `--color-{name}-tone-1..4`  | Progressively desaturated variations    |

That's **17 variables per harmony color**. A 4-color harmony produces 68 palette variables.

### How Scales Are Built

All scale generation uses OKLCH lightness for perceptual uniformity:

- **Tints** (50–400): Lightness increased in configurable steps from base
- **Shades** (600–950): Lightness decreased in configurable steps from base
- **Tones** (tone-1..4): Chroma decreased in configurable steps from base
- **Foreground**: Best-effort WCAG AAA (7:1) text color via `findAccessibleTextColor()`
- **Contrast**: Light or dark color preserving the base hue

### Custom Prefix

The variable prefix defaults to `color` (`--color-primary-500`). Change it with `--prefix`:

```bash
autotheme --prefix "at"
# produces --at-primary-500, --at-secondary-200, etc.
```

---

## Semantic Tokens

**Config:** `semantics: boolean | SemanticsConfig` (default: `true`)

Semantic tokens give meaning to colors. Instead of raw palette values, you use tokens like `--surface`, `--text-primary`, or `--accent`.

### Depth Abstraction

The core concept is **depth** — a single parameter (default `0.13`) that controls how tinted the surface layer is. From depth and the primary hue, AutoTheme derives:

- Surface lightness (higher depth = more contrast between surface and background)
- Text hierarchy (primary → secondary → tertiary with decreasing contrast)
- Border weights (subtle → default → strong)

In dark mode, depth is inverted (`1 - depth`) so the same config produces appropriate dark surfaces.

### Surfaces

| Variable               | Description                               |
| ---------------------- | ----------------------------------------- |
| `--surface`            | Page background — tinted neutral at depth |
| `--surface-foreground` | Accessible text on surface                |
| `--surface-sunken`     | Recessed area (depth − sunkenDelta)       |
| `--surface-raised`     | Elevated area (depth + sunkenDelta)       |

All surfaces carry the primary hue at very low chroma (configurable), giving a warm/cool tint.

### Text Hierarchy

| Variable           | Description                    |
| ------------------ | ------------------------------ |
| `--text-primary`   | Highest contrast text (anchor) |
| `--text-secondary` | Medium contrast text           |
| `--text-tertiary`  | Subtle/muted text              |

Text levels use a configurable curve from anchor (default 0.95) to floor (default 0.55) lightness, with low chroma from the primary hue.

### Borders

| Variable          | Description                        |
| ----------------- | ---------------------------------- |
| `--border`        | Default border                     |
| `--border-subtle` | Lighter border for dividers        |
| `--border-strong` | Stronger border for focus/emphasis |

### Accent Roles

| Variable                 | Source                                       |
| ------------------------ | -------------------------------------------- |
| `--accent`               | Mapped from harmony color (default: primary) |
| `--accent-foreground`    | Accessible text on accent                    |
| `--secondary`            | Second harmony color                         |
| `--secondary-foreground` | Accessible text on secondary                 |
| `--tertiary`             | Third harmony color                          |
| `--tertiary-foreground`  | Accessible text on tertiary                  |

The mapping is configurable via `semantics.mapping`:

```json
{ "accent": "primary", "secondary": "secondary", "tertiary": "tertiary" }
```

### Tinted Surfaces

Each accent color also gets a tinted surface variant for soft backgrounds:

```
--primary-surface / --primary-surface-foreground
--secondary-surface / --secondary-surface-foreground
--tertiary-surface / --tertiary-surface-foreground
--error-surface / --error-surface-foreground
```

### Dark Mode

Systematic inversion from the same configuration:

- Depth is inverted (`1 - depth`), so light surfaces become dark surfaces
- Text hierarchy lightness is flipped
- All foreground colors recalculated for contrast on dark backgrounds
- Same chroma values maintain color temperature

---

## States

**Config:** `states: boolean | StatesConfig` (default: `false`)

Universal modifier tokens for interactive states. Instead of per-component state colors, you get composable deltas:

| Variable                   | Description                        |
| -------------------------- | ---------------------------------- |
| `--state-hover`            | Lightness delta for hover          |
| `--state-active`           | Lightness delta for active/pressed |
| `--state-disabled-opacity` | Opacity for disabled elements      |
| `--focus-ring-color`       | Focus ring color (default: accent) |
| `--focus-ring-width`       | Focus ring width                   |
| `--focus-ring-offset`      | Focus ring offset                  |

### Usage with OKLCH

States compose with any color using relative color syntax:

```css
.button:hover {
  background: oklch(from var(--accent) calc(l + var(--state-hover)) c h);
}

.button:active {
  background: oklch(from var(--accent) calc(l + var(--state-active)) c h);
}

.button:disabled {
  opacity: var(--state-disabled-opacity);
}
```

In dark mode, hover delta direction is inverted (lightens instead of darkens).

---

## Elevation

**Config:** `elevation: boolean | ElevationConfig` (default: `false`)

Each elevation level (1–N, default 4 levels) produces two tokens:

| Variable                 | Description                        |
| ------------------------ | ---------------------------------- |
| `--elevation-{N}`        | Surface color at elevation level N |
| `--elevation-{N}-shadow` | Multi-layer box shadow at level N  |

### How It Works

- **Light mode (card model)**: Surfaces are near-white; shadows create the depth perception
- **Dark mode**: Surfaces get progressively lighter with each level; shadows are subtle
- Shadow layers scale with level (1 layer at level 1, up to 3 at higher levels)
- When `tintShadows` is enabled (default), shadow colors carry the primary hue at low chroma

### Usage

```css
.card {
  background: var(--elevation-1);
  box-shadow: var(--elevation-1-shadow);
}

.modal {
  background: var(--elevation-3);
  box-shadow: var(--elevation-3-shadow);
}
```

---

## Shadow Scale

**Config:** `shadows: boolean | ShadowConfig` (default: `false`)

Exponential shadow scale independent of the elevation system:

| Variable     | Description     |
| ------------ | --------------- |
| `--shadow-1` | Smallest shadow |
| `--shadow-2` | Small shadow    |
| `--shadow-3` | Medium shadow   |
| `--shadow-4` | Large shadow    |
| `--shadow-5` | Largest shadow  |

Each level doubles blur and offset from the base. Shadow colors can be tinted with the primary hue.

---

## Border Radius Scale

**Config:** `radius: boolean | RadiusConfig` (default: `false`)

Exponential radius scale:

| Variable     | Description     |
| ------------ | --------------- |
| `--radius-1` | Smallest radius |
| `--radius-2` | ...             |
| `--radius-N` | Largest radius  |

---

## Motion Tokens

**Config:** `motion: boolean | MotionConfig` (default: `false`)

### Duration Scale

Exponential duration steps from a base value:

| Variable       | Description    |
| -------------- | -------------- |
| `--duration-1` | Fastest (base) |
| `--duration-N` | Slowest        |

### Spring Physics

Spring easing tokens derived from stiffness, damping, and mass parameters:

```css
--spring-ease: linear(...); /* CSS linear() approximation of spring curve */
```

### Reduced Motion

When `reducedMotion` is enabled (default), outputs a `prefers-reduced-motion` media query that sets all durations to near-zero.

---

## Visual Effects

**Config:** `effects: boolean | EffectsConfig` (default: `false`)

All visual effects are theme-derived — colors come from the harmony palette, not arbitrary values.

### Filters

```
--filter-grain     # SVG feTurbulence noise overlay
--filter-glow      # Blur + brightness glow effect
--filter-duotone   # feColorMatrix duotone mapping
```

Individual filters can be disabled: `effects: { filters: { grain: false } }`.

### Glass (Glassmorphism)

```css
.glass {
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturation));
  background: oklch(from var(--glass-color) l c h / var(--glass-opacity));
}
```

Colors default to primary and secondary harmony colors.

### Blobs

Organic SVG shapes using seeded PRNG and bezier curves. Generates `--blob-1` through `--blob-N` as SVG data URLs.

### Patterns

SVG background patterns:

| Pattern Type         | Description          |
| -------------------- | -------------------- |
| `stripes-diagonal`   | 45° diagonal stripes |
| `stripes-horizontal` | Horizontal stripes   |
| `stripes-vertical`   | Vertical stripes     |
| `dots`               | Dot grid             |
| `crosshatch`         | Crosshatch pattern   |

Density: `sm`, `md`, `lg`. All pattern colors come from the harmony palette.

### Blend Modes

CSS variables and utility classes for compositing:

```css
.blend-multiply {
  mix-blend-mode: multiply;
}
.blend-screen {
  mix-blend-mode: screen;
}
.blend-overlay {
  mix-blend-mode: overlay;
}
```

Default modes: multiply, screen, overlay, soft-light.

### Stack

Layer stacking variables for z-index and compositing management.

---

## Accessibility

### Accessible Foreground Colors

Every color AutoTheme generates comes with a `foreground` variable — a text color that meets **WCAG AAA** (7:1 contrast ratio) against that background. The default target is 7:1. Configure via `palette.contrastTarget`.

### Contrast Checking

```bash
autotheme --color "#6439FF" --check-contrast aaa
```

Programmatically: `checkContrast()` validates token pairs against WCAG levels and returns a report.

### Contrast Fixing

`fixContrast()` adjusts colors that fail contrast requirements by modifying OKLCH lightness while preserving hue and chroma.

### CVD Simulation

```typescript
import { simulateCVD } from "autotheme";

simulateCVD(color, "protanopia"); // No red cones
simulateCVD(color, "deuteranopia"); // No green cones
simulateCVD(color, "tritanopia"); // No blue cones
simulateCVD(color, "achromatopsia"); // No color vision
```

### P3 Wide Gamut

OKLCH colors are gamut-mapped to sRGB by default. On wide-gamut displays (Display P3), the full chroma range is available.

---

## Shadcn UI Integration

**Config:** `shadcn: boolean | ShadcnConfig` (default: `false`)

Generates Shadcn UI compatible variables derived from semantic tokens:

| Shadcn Variable            | Source                            |
| -------------------------- | --------------------------------- |
| `--background`             | Surface                           |
| `--foreground`             | Surface foreground                |
| `--primary`                | Accent                            |
| `--primary-foreground`     | Accent foreground                 |
| `--secondary`              | Secondary surface (soft bg)       |
| `--secondary-foreground`   | Secondary surface foreground      |
| `--muted`                  | Low-chroma surface                |
| `--muted-foreground`       | Muted text                        |
| `--accent`                 | Accent surface                    |
| `--accent-foreground`      | Accent surface foreground         |
| `--destructive`            | Error color                       |
| `--destructive-foreground` | Error foreground                  |
| `--border`                 | Border subtle                     |
| `--input`                  | Border                            |
| `--ring`                   | Accent                            |
| `--card`                   | Elevated surface                  |
| `--card-foreground`        | Card text                         |
| `--popover`                | Elevated surface                  |
| `--popover-foreground`     | Popover text                      |
| `--radius`                 | Config value (default `0.625rem`) |

Also generates chart colors (1–5) and sidebar colors derived from the palette.

---

## Gradients

**Config:** `gradients: boolean` (default: `true`)

| Variable                       | Value                                             |
| ------------------------------ | ------------------------------------------------- |
| `--gradient-direction`         | `to right` (default)                              |
| `--gradient-linear-secondary`  | Linear gradient from primary-500 to secondary-500 |
| `--gradient-linear-tertiary`   | Linear gradient from primary-500 to tertiary-500  |
| `--gradient-linear-quaternary` | (4+ color harmonies only)                         |
| `--gradient-linear-rainbow`    | 7-stop OKLCH rainbow gradient                     |

Gradient variables use `var()` references to palette colors, so they update automatically in dark mode.

---

## Noise Texture

**Config:** `noise: boolean` (default: `true`)

Inline SVG using `<feTurbulence type="fractalNoise">`. Encoded as a data URL for zero network requests.

```css
--background-image-noise: url("data:image/svg+xml,...");
```

---

## Typography Scale

**Config:** `typography: boolean | TypographyConfig` (default: `true`)

Exponential scale from a base size using a ratio (default: 1.25):

| Variable     | Description |
| ------------ | ----------- |
| `--text-xs`  | Smallest    |
| `--text-sm`  | Small       |
| `--text-md`  | Base        |
| `--text-lg`  | Large       |
| `--text-xl`  | Extra large |
| `--text-2xl` | 2x large    |
| `--text-3xl` | 3x large    |

Supports fluid scaling via CSS `clamp()` when `typography.fluid: true`.

---

## Spacing Scale

**Config:** `spacing: boolean | SpacingConfig` (default: `true`)

10 spacing values using exponential scaling (default base: 0.25rem, ratio: 2):

| Variable       | Description |
| -------------- | ----------- |
| `--spacing-1`  | Smallest    |
| `--spacing-10` | Largest     |

Supports fluid scaling via CSS `clamp()` when `spacing.fluid: true`.

---

## Dark Mode

Dark mode activates with the `.dark` class on the root `<html>` element. AutoTheme generates overrides for all enabled features:

1. **Semantic tokens**: Depth inverted, surfaces darkened, text lightened
2. **Palette** (when enabled): Foreground and contrast colors recalculated
3. **Elevation**: Surfaces lighten per level, shadows soften
4. **Shadcn** (when enabled): All Shadcn variables re-derived from dark semantics
5. **States**: Hover delta direction inverted

The dark mode script (`darkmode.js`) handles system preference detection, localStorage persistence, and FOUC prevention.

---

## Tailwind v4 Integration

**Config:** `output.tailwind: boolean` (default: `false`)

Generates Tailwind v4 CSS with `@theme` directives that map all tokens to Tailwind's utility system:

```css
@theme {
  --color-surface: var(--surface);
  --color-accent: var(--accent);
  --color-primary-500: var(--color-primary-500);
  /* ...all enabled tokens */
}
```

This enables classes like `bg-surface`, `text-accent-foreground`, `bg-primary-500`, etc.

---

## HTML Preview

**Config:** `output.preview: boolean` (default: `false`)

Generates a self-contained HTML file visualizing the entire theme — semantic tokens, palette scales, gradients, noise, and typography. Includes a dark mode toggle.

---

## Configuration Reference

| Option       | Type                | Default       | Description                           |
| ------------ | ------------------- | ------------- | ------------------------------------- |
| `color`      | `string`            | random        | Primary color (hex, rgb, hsl, oklch)  |
| `harmony`    | `string`            | `"analogous"` | Harmony type (12 built-in + custom)   |
| `mode`       | `string`            | `"both"`      | `"light"`, `"dark"`, or `"both"`      |
| `palette`    | `boolean \| object` | `false`       | Full 50-950 palette scale             |
| `semantics`  | `boolean \| object` | `true`        | Semantic tokens                       |
| `states`     | `boolean \| object` | `false`       | Interactive state tokens              |
| `elevation`  | `boolean \| object` | `false`       | Elevation system                      |
| `typography` | `boolean \| object` | `true`        | Typography scale                      |
| `spacing`    | `boolean \| object` | `true`        | Spacing scale                         |
| `shadows`    | `boolean \| object` | `false`       | Shadow scale                          |
| `radius`     | `boolean \| object` | `false`       | Border radius scale                   |
| `motion`     | `boolean \| object` | `false`       | Motion tokens (spring, durations)     |
| `gradients`  | `boolean`           | `true`        | Gradient variables                    |
| `noise`      | `boolean`           | `true`        | Noise texture                         |
| `utilities`  | `boolean`           | `true`        | CSS utility classes                   |
| `patterns`   | `boolean \| object` | `false`       | SVG pattern utilities                 |
| `effects`    | `boolean \| object` | `false`       | Visual effects (filters, glass, etc.) |
| `shadcn`     | `boolean \| object` | `false`       | Shadcn UI variables                   |

All `boolean | object` options follow the same pattern: `true` enables with defaults, `false` disables, and an object enables with customization.

Priority: CLI flags > config file > presets > defaults.
