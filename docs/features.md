# AutoTheme Features

AutoTheme generates a complete CSS design system from a single color. This document covers every feature in detail.

## Architecture: Three Layers

AutoTheme outputs CSS in three layers. Each builds on the one below it.

```
Layer 1: Raw Palette (always emitted)
  --color-primary-50 through -950, tones, foreground, contrast
  Per-harmony-color scales in Tailwind v4 naming convention

Layer 2: Semantic Tokens (always emitted)
  --surface, --primary-container, --accent, --outline, etc.
  Design-intent tokens derived from the raw palette

Layer 3: Shadcn UI Extras (when shadcn: true)
  --card, --popover, --sidebar-*, --chart-*, --ring, --input, --border, --radius
  Thin alias layer consuming Layer 2 values
```

---

## Color Palette (Layer 1)

Every color in the harmony gets a full scale. For a triadic harmony (3 colors), that's `primary`, `secondary`, and `tertiary`.

### Per-Color Variables

| Variable | Description |
|---|---|
| `--color-{name}-50` | Lightest tint |
| `--color-{name}-100` | |
| `--color-{name}-200` | |
| `--color-{name}-300` | |
| `--color-{name}-400` | |
| `--color-{name}-500` | Base color |
| `--color-{name}-600` | |
| `--color-{name}-700` | |
| `--color-{name}-800` | |
| `--color-{name}-900` | |
| `--color-{name}-950` | Darkest shade |
| `--color-{name}-foreground` | Accessible text color (WCAG AAA target) |
| `--color-{name}-contrast` | High contrast text (pure light/dark) |
| `--color-{name}-tone-1..4` | Progressively desaturated variations |

That's **17 variables per harmony color**. A 4-color harmony produces 68 palette variables.

### How Scales Are Built

- **Tints** (50-400): Lightness increased in 10% steps from base
- **Shades** (600-950): Lightness decreased in 10% steps from base
- **Tones** (tone-1..4): Saturation decreased in 20% steps from base
- **Foreground**: Best-effort WCAG AAA (7:1) text color via `findAccessibleTextColor()`
- **Contrast**: Light or dark color preserving the base hue

### Custom Prefix

The variable prefix defaults to `color` (`--color-primary-500`). Change it with `--prefix`:

```bash
autotheme --prefix "at"
# produces --at-primary-500, --at-secondary-200, etc.
```

When using Tailwind output with a custom prefix, `--color-*` aliases are auto-generated so Tailwind utilities like `bg-primary-500` still work.

---

## Semantic Tokens (Layer 2)

Semantic tokens give meaning to colors. Instead of guessing which of 68 palette variables to use, you use tokens like `--surface`, `--primary-container`, or `--accent`.

**Always emitted** regardless of the `shadcn` config flag.

### Surface System

| Variable | Light Mode | Dark Mode |
|---|---|---|
| `--surface` | Primary tint[4] (lightest) | Fixed low lightness (L=10) |
| `--surface-foreground` | Accessible text on surface | Accessible text on surface |
| `--surface-dim` | Primary tint[3] | Very dark (L=6) |
| `--surface-bright` | Near-white, low saturation | Slightly elevated (L=22) |
| `--surface-container` | Tint[4] slightly desaturated | Dark neutral (L=14) |
| `--surface-container-foreground` | Accessible text | Accessible text |
| `--surface-container-high` | Tint[3] desaturated | Elevated dark (L=18) |
| `--surface-container-low` | Tint[4] more desaturated | Recessed dark (L=8) |

### Color Roles

Each role follows the same pattern: base color, foreground text, container (soft background), and container foreground.

| Variable Pattern | Source |
|---|---|
| `--primary` / `--primary-foreground` | harmony[0] base color |
| `--primary-container` / `--primary-container-foreground` | Lightened, desaturated tint of primary |
| `--secondary` / `--secondary-*` | **Real harmony[1] color** (not a lightened primary) |
| `--tertiary` / `--tertiary-*` | harmony[2], or primary rotated 120deg for 2-color harmonies |
| `--accent` / `--accent-*` | Most hue-distant harmony color from primary |

### Harmony-to-Semantic Mapping

| Harmony Colors | `--primary` | `--secondary` | `--tertiary` | `--accent` |
|---|---|---|---|---|
| 2 (e.g. complementary) | harmony[0] | harmony[1] | primary.rotate(120deg) | harmony[1] |
| 3 (e.g. triadic) | harmony[0] | harmony[1] | harmony[2] | most hue-distant |
| 4 (e.g. square) | harmony[0] | harmony[1] | harmony[2] | harmony[3] |

### Other Semantic Tokens

| Variable | Description |
|---|---|
| `--muted` | Primary tone-2 (desaturated) |
| `--muted-foreground` | Accessible text on muted |
| `--muted-container` | Primary tone-3 (more desaturated) |
| `--error` | Independent red/danger color |
| `--error-foreground` | Accessible text on error |
| `--error-container` | Soft red background |
| `--error-container-foreground` | Accessible text on error container |
| `--outline` | Default border color |
| `--outline-variant` | Subtle border color |
| `--inverse-surface` | Dark surface for tooltips/snackbars |
| `--inverse-surface-foreground` | Text on inverse surface |
| `--inverse-primary` | Primary variant for inverse contexts |

### Dark Mode Strategy

Systematic inversion from the same palette:

- Light surfaces (tints) become dark surfaces (fixed low lightness)
- Base colors lightened +10% for visibility on dark backgrounds
- Containers use deep shades (D4) with heavy desaturation for AAA contrast
- All `-foreground` colors recalculated via `findAccessibleTextColor()`
- Outline colors shifted to lower lightness range

---

## Shadcn UI Integration (Layer 3)

**Config:** `shadcn: boolean` (default: `true`)

When enabled, emits Shadcn UI compatible variables that alias semantic tokens. This means Shadcn components work with real harmony colors instead of generic grays.

### Variable Mapping

| Shadcn Variable | Derived From |
|---|---|
| `--background` | `semantic.surface` |
| `--foreground` | `semantic.surfaceForeground` |
| `--primary` | `semantic.primary` |
| `--primary-foreground` | `semantic.primaryForeground` |
| `--secondary` | `semantic.secondaryContainer` (soft bg for shadcn convention) |
| `--secondary-foreground` | `semantic.secondaryContainerForeground` |
| `--muted` | `semantic.mutedContainer` |
| `--muted-foreground` | `semantic.mutedForeground` |
| `--accent` | `semantic.accentContainer` |
| `--accent-foreground` | `semantic.accentContainerForeground` |
| `--destructive` | `semantic.error` |
| `--destructive-foreground` | `semantic.errorForeground` |
| `--border` | `semantic.outlineVariant` |
| `--input` | `semantic.outline` |
| `--ring` | `semantic.primary` |
| `--card` | `semantic.surfaceContainer` |
| `--card-foreground` | Accessible text on card |
| `--popover` | `semantic.surfaceContainer` |
| `--popover-foreground` | Accessible text on popover |
| `--radius` | Config value (default `0.625rem`) |

### Chart Colors

Derived directly from harmony colors (not from semantic layer):

| Variable | Source |
|---|---|
| `--chart-1` | harmony[0] (primary) |
| `--chart-2` | harmony[1] or primary.rotate(60deg) |
| `--chart-3` | harmony[2] or primary.rotate(120deg) |
| `--chart-4` | harmony[3] or primary.rotate(180deg) |
| `--chart-5` | harmony[4] or primary.rotate(240deg) |

In dark mode, chart colors are lightened by 5% for visibility.

### Sidebar Colors

| Variable | Source |
|---|---|
| `--sidebar` | `semantic.surfaceContainerLow` (light) / `semantic.surface` (dark) |
| `--sidebar-foreground` | Accessible text on sidebar |
| `--sidebar-primary` | `semantic.primary` |
| `--sidebar-primary-foreground` | `semantic.primaryForeground` |
| `--sidebar-accent` | `semantic.accentContainer` |
| `--sidebar-accent-foreground` | `semantic.accentContainerForeground` |
| `--sidebar-border` | `semantic.outlineVariant` |
| `--sidebar-ring` | `semantic.primary` |

---

## Gradients

**Config:** `gradients: boolean` (default: `true`)

### CSS Variables

| Variable | Value |
|---|---|
| `--gradient-direction` | `to right` (default) |
| `--gradient-linear-secondary` | Linear gradient from primary-500 to secondary-500 |
| `--gradient-linear-tertiary` | Linear gradient from primary-500 to tertiary-500 |
| `--gradient-linear-quaternary` | (4-color harmonies only) |
| `--gradient-linear-rainbow` | 7-stop OKLCH rainbow gradient |

Gradient variables use `var()` references to palette colors, so they update automatically in dark mode.

### Usage

```css
/* Direct use */
background: var(--gradient-linear-secondary);

/* Override direction */
.my-element {
    --gradient-direction: to bottom;
    background: var(--gradient-linear-secondary);
}
```

---

## Noise Texture

**Config:** `noise: boolean` (default: `true`)

### What It Is

An inline SVG using `<feTurbulence type="fractalNoise">` with:
- Base frequency: 0.7
- Octaves: 3
- Stitch tiles: enabled (seamless tiling)

Encoded as a data URL for zero network requests.

### CSS Variable

```css
--background-image-noise: url("data:image/svg+xml,...");
```

### Usage

```css
/* Direct */
background-image: var(--background-image-noise);

/* Blended with a surface color */
background-color: var(--surface);
background-image: var(--background-image-noise);
background-blend-mode: soft-light;
```

---

## Typography Scale

**Config:** `fontSize: number` (default: `1`), `scalar: number` (default: `1.618`)

### CSS Variables

8 sizes generated using exponential scaling with the golden ratio:

| Variable | Default Value | Description |
|---|---|---|
| `--text-xs` | `1.000rem` | Base size |
| `--text-sm` | `1.618rem` | Base x scalar |
| `--text-md` | `2.618rem` | Base x scalar^2 |
| `--text-lg` | `4.236rem` | Base x scalar^3 |
| `--text-xl` | `6.854rem` | Base x scalar^4 |
| `--text-2xl` | `11.090rem` | Base x scalar^5 |
| `--text-3xl` | `17.944rem` | Base x scalar^6 |
| `--text-4xl` | `29.034rem` | Base x scalar^7 |

### Customization

```bash
# Smaller base, tighter scale
autotheme --font-size 0.875 --scalar 1.25
```

---

## Spacing Scale

**Config:** `spacing: boolean` (default: `true`), `scalar: number` (default: `1.618`)

### CSS Variables

10 spacing values using the same golden ratio scaling:

| Variable | Default Value |
|---|---|
| `--spacing-1` | `0.155rem` (~2.5px) |
| `--spacing-2` | `0.251rem` (~4px) |
| `--spacing-3` | `0.406rem` (~6.5px) |
| `--spacing-4` | `0.657rem` (~10.5px) |
| `--spacing-5` | `1.062rem` (~17px) |
| `--spacing-6` | `1.720rem` (~27.5px) |
| `--spacing-7` | `2.782rem` (~44.5px) |
| `--spacing-8` | `4.502rem` (~72px) |
| `--spacing-9` | `7.284rem` (~116px) |
| `--spacing-10` | `11.786rem` (~188px) |

---

## Utility Classes

**Config:** `utilities: boolean` (default: `true`)

### Gradient Utilities

```css
.gradient-linear {
    background-image: linear-gradient(
        var(--gradient-direction, to right),
        var(--gradient-stops)
    );
}

.gradient-radial {
    background-image: radial-gradient(
        var(--gradient-scale, 100% 100%) at var(--gradient-position, 50% 50%),
        var(--gradient-stops)
    );
}
```

Customizable via `--gradient-from`, `--gradient-to`, `--gradient-from-position`, `--gradient-to-position`, `--gradient-scale`, `--gradient-position`.

### Noise Utilities

```css
.bg-noise {
    background-image: var(--background-image-noise);
}

.bg-noise-overlay {
    position: relative;
}
.bg-noise-overlay::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: var(--background-image-noise);
    opacity: 0.1;
    pointer-events: none;
}
```

### Semantic Surface Utilities

```css
.surface {
    background-color: var(--surface);
    color: var(--surface-foreground);
}

.surface-container {
    background-color: var(--surface-container);
    color: var(--surface-container-foreground);
}

.primary-surface {
    background-color: var(--primary-container);
    color: var(--primary-container-foreground);
}

.accent-surface {
    background-color: var(--accent-container);
    color: var(--accent-container-foreground);
}

.gradient-surface {
    background: linear-gradient(
        var(--gradient-direction, to bottom),
        var(--surface), var(--surface-dim)
    );
    color: var(--surface-foreground);
}

.gradient-accent-surface {
    background: linear-gradient(
        135deg,
        var(--primary-container), var(--accent-container)
    );
    color: var(--primary-container-foreground);
}

.surface-noise {
    background-color: var(--surface);
    background-image: var(--background-image-noise);
    background-blend-mode: soft-light;
    color: var(--surface-foreground);
}
```

---

## Dark Mode

### How It Works

Dark mode activates with the `.dark` class on the root `<html>` element. Three layers of dark overrides are emitted:

1. **Raw palette** (`.dark`): Overrides `--color-{name}-foreground` and `--color-{name}-contrast` for each harmony color
2. **Semantic tokens** (`.dark`): Full set of inverted semantic variables (surfaces, containers, outlines, etc.)
3. **Shadcn variables** (`.dark`): Shadcn-specific dark overrides derived from semantic dark tokens

### Dark Mode Script

**Config:** `darkModeScript: boolean` (default: `false`)

Generates a `darkmode.js` file that should be placed in `<head>` to prevent FOUC:

```html
<script src="/darkmode.js"></script>
```

**Features:**
- Reads `localStorage.getItem("darkMode")` on load
- Falls back to `window.matchMedia("(prefers-color-scheme: dark)")`
- Listens for OS preference changes
- Exposes `window.toggleDarkMode()` that toggles, persists, and returns state

---

## Tailwind v4 Integration

**Config:** `tailwind: boolean` (default: `false`)

Generates a `.tailwind.css` file containing:

### 1. All CSS Variables

The full output from `generateCSS()` (all three layers + palette + typography + spacing + gradients + noise).

### 2. `@theme` Directive

Maps all tokens to Tailwind's token system so utility classes work:

```css
@theme {
    /* Semantic tokens */
    --color-surface: var(--surface);
    --color-surface-foreground: var(--surface-foreground);
    --color-primary-container: var(--primary-container);
    --color-error: var(--error);
    --color-outline: var(--outline);
    --color-inverse-surface: var(--inverse-surface);
    /* ...all semantic tokens */

    /* Shadcn (when enabled) */
    --color-background: var(--background);
    --color-card: var(--card);
    --color-destructive: var(--destructive);
    /* ...all shadcn tokens */

    /* Radius */
    --radius-sm: calc(var(--radius) - 4px);
    --radius-md: calc(var(--radius) - 2px);
    --radius-lg: var(--radius);
    --radius-xl: calc(var(--radius) + 4px);

    /* Typography + Spacing */
    --text-xs: ...;
    --spacing-1: ...;
}
```

This enables classes like:

```html
<div class="bg-surface text-surface-foreground">
<div class="bg-primary-container text-primary-container-foreground">
<div class="bg-error text-error-foreground">
<div class="border-outline-variant">
```

### 3. Custom `@utility` Directives

```css
@utility radial-position-* { --gradient-position: *; }
@utility radial-scale-*    { --gradient-scale: *; }
@utility gradient-from-*   { --gradient-from: *; }
@utility gradient-to-*     { --gradient-to: *; }
```

---

## HTML Preview

**Config:** `preview: boolean` (default: `false`)

Generates a `.preview.html` file — a self-contained page that visualizes the entire theme.

### Sections

1. **Semantic Tokens** — Grid of color boxes for surfaces, primary/secondary/tertiary/accent (base + container), muted, error, outline, and inverse
2. **Color Palette** — Full swatches per harmony color: base (500), tints (50-400), shades (600-950), tones (T1-T4), with foreground text
3. **Gradients** — Linear gradients to each harmony color, rainbow, and radial example
4. **Noise** — Visual preview of the noise texture
5. **Typography Scale** — All 8 sizes rendered with sample text

Includes a dark mode toggle button (top-right) that toggles the `.dark` class in real time.

---

## Accessibility

AutoTheme targets **WCAG AAA** (7:1 contrast ratio) for all foreground colors by default.

- `findAccessibleTextColor()` tests achromatic colors (black through white) to find the best contrast
- Surfaces and containers are designed at lightness extremes to guarantee AAA compliance
- Base colors (primary, secondary, etc.) achieve best-effort contrast — typically AA (4.5:1) or better, depending on the color's inherent lightness
- The `contrastTarget` option (default: `7`) controls the target ratio. Set to `4.5` for AA, `3` for large text

---

## Configuration Reference

| Option | Type | Default | CLI Flag | Description |
|---|---|---|---|---|
| `color` | `string` | random | `--color`, `-c` | Primary color (hex, rgb, hsl) |
| `harmony` | `string` | `"analogous"` | `--harmony`, `-a` | Color harmony type |
| `output` | `string` | `"./src/autotheme.css"` | `--output`, `-o` | Output file path |
| `prefix` | `string` | `"color"` | `--prefix` | CSS variable prefix |
| `fontSize` | `number` | `1` | `--font-size` | Base font size in rem |
| `scalar` | `number` | `1.618` | | Golden ratio multiplier |
| `contrastTarget` | `number` | `7` | | WCAG contrast ratio target (3-21) |
| `radius` | `string` | `"0.625rem"` | | Shadcn border radius |
| `preview` | `boolean` | `false` | `--preview` | Generate HTML preview |
| `tailwind` | `boolean` | `false` | `--tailwind` | Generate Tailwind v4 CSS |
| `darkModeScript` | `boolean` | `false` | `--dark-mode-script` | Generate dark mode script |
| `gradients` | `boolean` | `true` | `--no-gradients` | Gradient variables |
| `spacing` | `boolean` | `true` | `--no-spacing` | Spacing scale |
| `noise` | `boolean` | `true` | `--no-noise` | Noise texture |
| `shadcn` | `boolean` | `true` | `--no-shadcn` | Shadcn UI variables |
| `utilities` | `boolean` | `true` | `--no-utilities` | CSS utility classes |

Priority: CLI flags > config file > defaults.
