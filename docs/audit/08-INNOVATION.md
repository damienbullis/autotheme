# AutoTheme: Innovation & Cutting-Edge Features

A creative exploration of modern CSS/HTML capabilities and advanced color science that could make AutoTheme genuinely special. These aren't incremental improvements -- they're paradigm shifts in what a theme generator can be.

---

## The Big Ideas

| #   | Idea                                                        | Impact         | Feasibility    |
| --- | ----------------------------------------------------------- | -------------- | -------------- |
| 1   | CSS-native reactive palettes via relative color syntax      | Transformative | Ship now       |
| 2   | OKLCH-native color engine (not HSL with OKLCH output)       | Transformative | Ship now       |
| 3   | `light-dark()` single-declaration dual-mode themes          | High           | Ship now       |
| 4   | `@property` registered tokens with animated transitions     | High           | Ship now       |
| 5   | Cascade layers for predictable theme architecture           | High           | Ship now       |
| 6   | Chroma-balanced harmonies                                   | High           | Ship now       |
| 7   | Color temperature as a theming axis                         | Medium-High    | Ship now       |
| 8   | Fluid tokens via `clamp()`                                  | High           | Ship now       |
| 9   | CSS math-powered scales (`pow()`, `round()`)                | Medium         | Ship now       |
| 10  | Procedural texture library (noise, grain, patterns)         | Medium         | Ship now       |
| 11  | Motion token system (easing, springs, durations)            | Medium         | Ship now       |
| 12  | Style queries for variant-based theming                     | Medium         | Ship now       |
| 13  | Gamut-aware output (sRGB + Display P3)                      | Medium         | Ship now       |
| 14  | View transitions for animated theme switching               | Medium         | Progressive    |
| 15  | Accessibility-adaptive themes (contrast, transparency, CVD) | Medium         | Ship now       |
| 16  | Circadian / time-of-day theming                             | Low-Medium     | Progressive    |
| 17  | Variable font axes as theme tokens                          | Low-Medium     | Ship now       |
| 18  | Houdini paint worklets for procedural backgrounds           | Low            | Progressive    |
| 19  | DTCG token format export                                    | Low            | Ship later     |
| 20  | CSS `if()` conditional tokens                               | Future         | Not yet spec'd |

---

## 1. CSS-Native Reactive Palettes

**The breakthrough:** Relative color syntax + `color-mix()` means an entire palette can be derived from a single CSS custom property. No build step needed for color computation.

### What this enables

Instead of emitting 76+ hardcoded OKLCH values for color scales, emit **one base color** and derive everything in CSS:

```css
:root {
  /* The only "real" color -- everything else is derived */
  --base: oklch(0.55 0.2 250);

  /* Harmony colors via hue rotation */
  --secondary: oklch(from var(--base) l c calc(h + 120));
  --tertiary: oklch(from var(--base) l c calc(h + 240));

  /* Tint scale -- lighten + reduce chroma for natural falloff */
  --primary-50: oklch(from var(--base) 0.97 calc(c * 0.15) h);
  --primary-100: oklch(from var(--base) 0.93 calc(c * 0.25) h);
  --primary-200: oklch(from var(--base) 0.87 calc(c * 0.4) h);
  --primary-300: oklch(from var(--base) 0.8 calc(c * 0.6) h);
  --primary-400: oklch(from var(--base) 0.7 calc(c * 0.8) h);
  --primary-500: var(--base);
  --primary-600: oklch(from var(--base) calc(l - 0.06) calc(c * 0.95) h);
  --primary-700: oklch(from var(--base) calc(l - 0.13) calc(c * 0.88) h);
  --primary-800: oklch(from var(--base) calc(l - 0.2) calc(c * 0.8) h);
  --primary-900: oklch(from var(--base) calc(l - 0.27) calc(c * 0.7) h);
  --primary-950: oklch(from var(--base) calc(l - 0.33) calc(c * 0.55) h);

  /* Alpha variants from the same base */
  --primary-bg: oklch(from var(--base) l c h / 7%);
  --primary-border: oklch(from var(--base) l c h / 22%);
  --primary-glow: oklch(from var(--base) l c h / 4%);
  --primary-hover: oklch(from var(--base) l c h / 12%);

  /* Tones via chroma reduction */
  --primary-tone-1: oklch(from var(--base) l calc(c * 0.2) h);
  --primary-tone-2: oklch(from var(--base) l calc(c * 0.4) h);
  --primary-tone-3: oklch(from var(--base) l calc(c * 0.6) h);
  --primary-tone-4: oklch(from var(--base) l calc(c * 0.8) h);
}
```

**Why this matters:** Change `--base` at runtime and the _entire_ theme updates instantly. No JavaScript palette computation. No theme switching delay. A color picker directly connected to `--base` gives you a live theme editor for free.

**Browser support:** Relative color syntax is Baseline 2024 (Chrome 119+, Firefox 128+, Safari 16.4+). `color-mix()` is Baseline 2023. These are ship-ready.

### AutoTheme's role shifts

AutoTheme wouldn't need to compute every color -- it would compute the _relationships_. The tint curve, the chroma falloff, the harmony angles. Then emit those as CSS expressions. The browser does the math.

For consumers that need pre-computed values (email templates, server-rendered HTML), AutoTheme still generates literal OKLCH values as it does today. The reactive mode is an opt-in output format.

```typescript
// Config option
output: {
  reactive: true; // Emit relative color syntax instead of literal values
}
```

### Combining with `color-mix()` for simpler cases

```css
/* Simpler tint/shade generation */
--primary-100: color-mix(in oklch, var(--base) 15%, white);
--primary-200: color-mix(in oklch, var(--base) 30%, white);
--primary-300: color-mix(in oklch, var(--base) 50%, white);
--primary-700: color-mix(in oklch, var(--base) 70%, black);
--primary-800: color-mix(in oklch, var(--base) 50%, black);
--primary-900: color-mix(in oklch, var(--base) 30%, black);

/* Semi-transparent variants */
--primary-ghost: color-mix(in oklch, var(--base) 8%, transparent);
```

`color-mix()` is simpler to read but less precise than relative color syntax. AutoTheme could use `color-mix()` for tints/shades and relative syntax for harmonies and alpha variants.

---

## 2. OKLCH-Native Color Engine

**The insight:** AutoTheme stores colors as HSL internally and converts to OKLCH only at output. This means all color manipulation (tints, shades, harmonies) happens in a perceptually non-uniform space. Two colors at HSL L=50% can look dramatically different to the human eye (compare yellow vs blue).

### Making OKLCH the internal representation

The `Color` class should store OKLCH internally. All operations happen in OKLCH space:

```typescript
// Current: HSL-native, OKLCH at output
color.lighten(10); // Adds 10 to HSL L. Not perceptually uniform.

// Proposed: OKLCH-native
color.lighten(0.05); // Adds 0.05 to OKLCH L. Perceptually uniform step.
```

### Perceptually calibrated tint/shade curves

Linear lightness steps produce visually uneven palettes. An eased curve produces naturally spaced steps:

```typescript
function generateOklchTints(base: OKLCHColor, steps: number): OKLCHColor[] {
  const maxL = 0.97;
  const lRange = maxL - base.l;

  return Array.from({ length: steps }, (_, i) => {
    const t = (i + 1) / steps;
    // Ease-out: more steps near the base, fewer near white
    const easedT = 1 - Math.pow(1 - t, 1.5);
    const newL = base.l + lRange * easedT;
    // Chroma naturally decreases as lightness increases (like real paint tinting)
    const chromaFalloff = 1 - easedT * 0.7;
    return { l: newL, c: base.c * chromaFalloff, h: base.h, a: base.a };
  });
}
```

### Chroma-balanced harmonies

When rotating hue in OKLCH, chroma gamut varies dramatically by hue angle. Yellow can be extremely chromatic; blue much less so. Naive hue rotation produces harmony colors with unequal visual weight.

```typescript
function chromaBalancedRotate(base: OKLCHColor, degrees: number): OKLCHColor {
  const newHue = normalizeHue(base.h + degrees);
  const baseMaxChroma = maxChromaAtHueAndLightness(base.h, base.l);
  const newMaxChroma = maxChromaAtHueAndLightness(newHue, base.l);
  const relativeChroma = base.c / baseMaxChroma;
  return {
    l: base.l,
    c: relativeChroma * newMaxChroma, // Maintain relative visual weight
    h: newHue,
    a: base.a,
  };
}
```

This produces harmony colors that _feel_ equally bold, even when their absolute chroma differs.

---

## 3. `light-dark()` Single-Declaration Dual-Mode

**The feature:** `light-dark()` returns one value for light mode, another for dark. Eliminates separate `@media` or `.dark` blocks.

**Browser support:** Baseline 2024 (Chrome 123+, Firefox 120+, Safari 17.5+). Ship-ready.

### What this looks like for AutoTheme output

```css
:root {
  color-scheme: light dark;

  /* One declaration handles both modes */
  --surface: light-dark(
    oklch(0.97 0.005 250),
    /* Light mode */ oklch(0.12 0.008 250) /* Dark mode */
  );

  --surface-elevated: light-dark(oklch(1 0 0), oklch(0.16 0.01 250));

  --text-1: light-dark(oklch(0.15 0.01 250), oklch(0.93 0.01 250));

  --border: light-dark(oklch(0.85 0.015 250), oklch(0.22 0.015 250));

  /* Combines with relative color syntax */
  --primary: light-dark(
    var(--base),
    oklch(from var(--base) calc(l + 0.1) c h) /* Lightened for dark mode */
  );
}
```

### Impact

- **50% less CSS** for dual-mode themes (no separate `.dark` block)
- **No JavaScript** needed for theme switching (just change `color-scheme`)
- **System preference respected** automatically
- Composes with `color-mix()` and relative color syntax

### When `mode: "both"` is selected, AutoTheme should default to this format.

---

## 4. `@property` Registered Tokens

**The feature:** `@property` declares custom properties with types, defaults, and inheritance. Crucially, registered properties can be **animated**.

**Browser support:** Baseline 2024 (Chrome 85+, Firefox 128+, Safari 16.4+). Ship-ready.

### Animated theme transitions

Without `@property`, changing `--primary: oklch(0.55 0.20 250)` to `--primary: oklch(0.55 0.20 30)` is an instant jump. With `@property`:

```css
@property --theme-hue {
  syntax: "<number>";
  inherits: true;
  initial-value: 250;
}

@property --theme-lightness {
  syntax: "<number>";
  inherits: true;
  initial-value: 0.55;
}

@property --theme-chroma {
  syntax: "<number>";
  inherits: true;
  initial-value: 0.2;
}

:root {
  --theme-hue: 250;
  transition:
    --theme-hue 0.6s ease,
    --theme-lightness 0.4s ease;
}

/* Change the theme -- it animates! */
:root[data-theme="warm"] {
  --theme-hue: 30;
}

/* Derived colors animate too because they reference the registered properties */
:root {
  --primary: oklch(var(--theme-lightness) var(--theme-chroma) var(--theme-hue));
}
```

The entire palette smoothly transitions between themes. Every surface, border, text color -- everything animates in sync because they all derive from the registered base properties.

### Self-documenting tokens

```css
@property --spacing-base {
  syntax: "<length>";
  inherits: true;
  initial-value: 0.25rem;
}

@property --type-ratio {
  syntax: "<number>";
  inherits: true;
  initial-value: 1.125;
}
```

Invalid values are rejected by the browser. The initial-value serves as documentation and fallback.

### AutoTheme output

AutoTheme could emit a `@property` declaration block at the top of the CSS:

```css
/* === Registered Theme Properties === */
@property --at-hue {
  syntax: "<number>";
  inherits: true;
  initial-value: 250;
}
@property --at-chroma {
  syntax: "<number>";
  inherits: true;
  initial-value: 0.2;
}
@property --at-lightness {
  syntax: "<number>";
  inherits: true;
  initial-value: 0.55;
}
@property --at-darkness {
  syntax: "<number>";
  inherits: true;
  initial-value: 0.12;
}
@property --at-text-levels {
  syntax: "<integer>";
  inherits: true;
  initial-value: 5;
}
```

Toggle: `registered: true` in config.

---

## 5. Cascade Layers for Theme Architecture

**The feature:** `@layer` controls cascade precedence. Later layers override earlier layers regardless of specificity.

**Browser support:** Baseline 2022. Ship-ready.

### Layered theme output

```css
/* Declare layer order: first layer has lowest priority */
@layer autotheme.reset, autotheme.palette, autotheme.semantics, autotheme.scales, autotheme.utilities;

@layer autotheme.palette {
  :root {
    --color-primary-500: oklch(0.55 0.2 250);
    --color-primary-400: oklch(0.7 0.16 250);
    /* ... all palette vars ... */
  }
}

@layer autotheme.semantics {
  :root {
    --surface: var(--color-primary-950);
    --text-1: var(--color-primary-50);
    /* ... semantic mappings ... */
  }
}

@layer autotheme.scales {
  :root {
    --text-sm: 0.875rem;
    --spacing-4: 1rem;
    /* ... scales ... */
  }
}

@layer autotheme.utilities {
  /* Utility classes in the lowest-impact layer */
}
```

### Why this matters

Users can override any autotheme value in **unlayered CSS** (which always wins) without fighting specificity:

```css
/* User's custom overrides -- always win over any @layer */
:root {
  --surface: oklch(0.08 0.005 250); /* Darker than autotheme default */
}
```

Or in a higher layer:

```css
@layer overrides {
  :root {
    --surface: oklch(0.08 0.005 250);
  }
}
```

This makes theme customization predictable and debuggable.

---

## 6. Color Temperature as a Theming Axis

**The concept:** Warm/cool is orthogonal to light/dark. It's a second dimension of theme control that no current generator exposes.

```typescript
// Config
{
  color: "#1E6091",
  temperature: 0.3   // -1 (cool/blue) to +1 (warm/amber)
}
```

### How it works

Temperature biases all neutral surfaces and text colors toward warm or cool hue ranges:

```css
/* Warm theme (temperature: +0.5) */
:root {
  --surface: oklch(0.97 0.008 75); /* Warm cream, not pure white */
  --surface-dim: oklch(0.93 0.012 70); /* Warmer as it gets darker */
  --text-1: oklch(0.15 0.005 65); /* Not pure black -- warm charcoal */
}

/* Cool theme (temperature: -0.5) */
:root {
  --surface: oklch(0.97 0.006 250); /* Cool blue-white */
  --surface-dim: oklch(0.93 0.009 245);
  --text-1: oklch(0.15 0.004 260); /* Cool charcoal */
}

/* Neutral (temperature: 0) */
:root {
  --surface: oklch(0.97 0 0); /* True achromatic */
  --text-1: oklch(0.15 0 0);
}
```

### Implementation

In OKLCH, temperature is a hue bias applied to nominally "neutral" colors. Neutral surfaces get a small amount of chroma pushed toward the warm axis (hue ~50-70) or cool axis (hue ~240-260):

```typescript
function applyTemperature(neutralL: number, temperature: number): OKLCHColor {
  const warmHue = 60; // Orange-yellow
  const coolHue = 250; // Blue
  const targetHue = temperature > 0 ? warmHue : coolHue;
  const chromaAmount = Math.abs(temperature) * 0.015; // Subtle
  return { l: neutralL, c: chromaAmount, h: targetHue, a: 1 };
}
```

---

## 7. Fluid Tokens via `clamp()`

**The insight:** Fixed design tokens produce rigid layouts. Modern CSS has `clamp()` which enables tokens that fluidly scale between viewport sizes.

**Browser support:** `clamp()` is universally supported. `pow()` is Baseline 2023.

### Fluid typography

Instead of:

```css
--text-lg: 1.25rem;
```

Generate:

```css
--text-lg: clamp(1.125rem, 0.95rem + 0.5vw, 1.375rem);
```

The value smoothly scales between 1.125rem (at 320px viewport) and 1.375rem (at 1440px viewport).

### Fluid spacing

```css
--spacing-6: clamp(1.5rem, 1rem + 1.25vw, 2.5rem);
```

### How AutoTheme generates this

```typescript
interface FluidConfig {
  minViewport: number; // 320
  maxViewport: number; // 1440
}

function fluidValue(min: number, max: number, config: FluidConfig): string {
  const slope = (max - min) / (config.maxViewport - config.minViewport);
  const intercept = min - slope * config.minViewport;
  const vw = slope * 100;
  return `clamp(${min}rem, ${intercept.toFixed(4)}rem + ${vw.toFixed(4)}vw, ${max}rem)`;
}
```

Config:

```typescript
typography: {
  fluid: true,  // Enable fluid output
  fluidRange: [320, 1440],  // Viewport range
  base: [0.875, 1.125],     // [min base, max base]
  ratio: [1.125, 1.25],     // [min ratio, max ratio]
}
```

Two scales are computed (one for each viewport extreme), then `clamp()` interpolates between them.

---

## 8. CSS Math-Powered Scales

**The features:** `pow()`, `sqrt()`, `round()`, `mod()`, trigonometric functions -- all stable and widely supported since 2023.

### Pure-CSS modular scales

Instead of pre-computing a type scale, emit a formula:

```css
:root {
  --type-base: 1rem;
  --type-ratio: 1.25;

  --text-xs: calc(var(--type-base) * pow(var(--type-ratio), -2));
  --text-sm: calc(var(--type-base) * pow(var(--type-ratio), -1));
  --text-md: var(--type-base);
  --text-lg: calc(var(--type-base) * pow(var(--type-ratio), 1));
  --text-xl: calc(var(--type-base) * pow(var(--type-ratio), 2));
  --text-2xl: calc(var(--type-base) * pow(var(--type-ratio), 3));
  --text-3xl: calc(var(--type-base) * pow(var(--type-ratio), 4));
}
```

Now the user changes `--type-ratio` from 1.25 to 1.125 and the entire scale recalculates. Same for spacing:

```css
:root {
  --space-base: 0.25rem;
  --space-ratio: 2;

  --spacing-1: var(--space-base);
  --spacing-2: calc(var(--space-base) * pow(var(--space-ratio), 1));
  --spacing-3: calc(var(--space-base) * pow(var(--space-ratio), 2));
  --spacing-4: calc(var(--space-base) * pow(var(--space-ratio), 3));
}
```

### Grid-snapped values

```css
/* Snap any computed value to an 8px grid */
--snapped-spacing: round(nearest, var(--raw-spacing), 0.5rem);
```

### Circular layout for preview

Using `sin()` and `cos()` for color wheel visualization:

```css
.swatch {
  --radius: 120px;
  position: absolute;
  left: calc(50% + cos(var(--angle)) * var(--radius));
  top: calc(50% + sin(var(--angle)) * var(--radius));
}
```

---

## 9. Procedural Texture Library

Beyond the current single noise SVG, generate a library of themed textures.

### Noise variants

```css
:root {
  /* Fine film grain */
  --texture-grain: url("data:image/svg+xml,...");

  /* Soft cloud-like */
  --texture-cloud: url("data:image/svg+xml,...");

  /* Paper texture */
  --texture-paper: url("data:image/svg+xml,...");

  /* Fabric weave */
  --texture-fabric: url("data:image/svg+xml,...");
}
```

Each generated from the palette's primary hue with configurable frequency and opacity:

```typescript
interface TextureConfig {
  type: "grain" | "cloud" | "paper" | "fabric";
  frequency: number; // SVG turbulence frequency
  octaves: number; // Detail level
  opacity: number; // Blend strength
  tint: boolean; // Color with primary hue
}
```

### Geometric patterns

SVG-based patterns that scale with the spacing system:

```css
:root {
  /* Dot grid aligned to spacing */
  --pattern-dots: url("data:image/svg+xml,...");

  /* Diagonal lines */
  --pattern-diagonal: url("data:image/svg+xml,...");

  /* Subtle cross-hatch */
  --pattern-crosshatch: url("data:image/svg+xml,...");
}
```

### Eased gradients

Standard CSS gradients interpolate linearly, causing perceptual banding. AutoTheme can generate multi-stop eased gradients:

```css
/* Pre-computed smooth gradient (no banding) */
--gradient-primary-to-secondary: linear-gradient(
  to right,
  oklch(0.55 0.2 250) 0%,
  oklch(0.58 0.19 242) 12%,
  oklch(0.61 0.18 230) 25%,
  oklch(0.64 0.16 215) 37%,
  oklch(0.67 0.15 195) 50%,
  oklch(0.7 0.14 175) 62%,
  oklch(0.72 0.15 155) 75%,
  oklch(0.74 0.16 140) 87%,
  oklch(0.75 0.18 130) 100%
);
```

Generated by interpolating in OKLCH space with a smoothstep easing function applied to the parameter.

---

## 10. Motion Token System

### Easing curves as design tokens

```css
:root {
  /* Physics-based easings */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Spring easing via linear() -- CSS native spring physics */
  --ease-spring: linear(
    0,
    0.006,
    0.025,
    0.054,
    0.095,
    0.146,
    0.206,
    0.272,
    0.343,
    0.418,
    0.494,
    0.569,
    0.642,
    0.71,
    0.773,
    0.83,
    0.879,
    0.921,
    0.955,
    0.981,
    1,
    1.012,
    1.019,
    1.021,
    1.019,
    1.014,
    1.008,
    1.003,
    1
  );

  /* Semantic aliases */
  --ease-enter: var(--ease-out);
  --ease-exit: var(--ease-in);
  --ease-move: var(--ease-default);
  --ease-color: var(--ease-default);
}
```

### Spring physics generation

AutoTheme can compute spring curves from physical parameters:

```typescript
interface SpringConfig {
  stiffness: number; // 100-500
  damping: number; // 5-30
  mass: number; // 0.5-3
}

function springToLinearEasing(spring: SpringConfig, steps = 30): string {
  const omega = Math.sqrt(spring.stiffness / spring.mass);
  const zeta = spring.damping / (2 * Math.sqrt(spring.stiffness * spring.mass));
  const points: number[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 1.5;
    let value: number;
    if (zeta < 1) {
      const omegaD = omega * Math.sqrt(1 - zeta * zeta);
      value =
        1 -
        Math.exp(-zeta * omega * t) *
          (Math.cos(omegaD * t) + ((zeta * omega) / omegaD) * Math.sin(omegaD * t));
    } else {
      value = 1 - Math.exp(-omega * t) * (1 + omega * t);
    }
    points.push(Math.round(value * 1000) / 1000);
  }

  return `linear(${points.join(", ")})`;
}
```

Config:

```typescript
motion: {
  enabled: true,
  spring: { stiffness: 200, damping: 15, mass: 1 },
  durations: { base: 200, ratio: 1.5, steps: 6 },
  reducedMotion: true,  // Generate @media (prefers-reduced-motion) overrides
}
```

### Duration scale

```css
:root {
  --duration-1: 100ms;
  --duration-2: 150ms;
  --duration-3: 200ms;
  --duration-4: 300ms;
  --duration-5: 450ms;
  --duration-6: 675ms;

  /* Semantic aliases */
  --duration-tooltip: var(--duration-1);
  --duration-fade: var(--duration-3);
  --duration-slide: var(--duration-4);
  --duration-expand: var(--duration-5);
}

/* Reduced motion -- zero out all durations */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-1: 0ms;
    --duration-2: 0ms;
    --duration-3: 0ms;
    --duration-4: 0ms;
    --duration-5: 0ms;
    --duration-6: 0ms;
  }
}
```

### Composite transition tokens

```css
:root {
  --transition-colors:
    color var(--duration-3) var(--ease-color), background-color var(--duration-3) var(--ease-color),
    border-color var(--duration-3) var(--ease-color);
  --transition-opacity: opacity var(--duration-2) var(--ease-default);
  --transition-transform: transform var(--duration-4) var(--ease-move);
  --transition-shadow: box-shadow var(--duration-3) var(--ease-default);
}
```

---

## 11. Style Queries for Variant Theming

**The feature:** `@container style(--prop: value)` applies styles based on ancestor custom property values. No `container-type` needed -- all elements are style containers.

**Browser support:** Chrome 111+, Firefox 128+, Safari 18+. Ship-ready.

### What this enables

AutoTheme can generate variant-aware component styles that respond to theme tokens:

```css
/* Set density on any container */
.compact-region {
  --density: compact;
}
.comfortable-region {
  --density: comfortable;
}

/* Components adapt automatically */
@container style(--density: compact) {
  .card {
    padding: var(--spacing-2);
  }
  .button {
    padding: var(--spacing-1) var(--spacing-3);
    font-size: var(--text-sm);
  }
}

@container style(--density: comfortable) {
  .card {
    padding: var(--spacing-6);
  }
  .button {
    padding: var(--spacing-3) var(--spacing-6);
    font-size: var(--text-md);
  }
}
```

### Theme islands

Different sections of a page using different themes:

```css
[data-theme-variant="vibrant"] {
  --theme-variant: vibrant;
}
[data-theme-variant="muted"] {
  --theme-variant: muted;
}

@container style(--theme-variant: vibrant) {
  .card {
    background: var(--primary-100);
    border: 2px solid var(--primary-500);
  }
}

@container style(--theme-variant: muted) {
  .card {
    background: var(--primary-tone-1);
    border: 1px solid var(--border-subtle);
  }
}
```

---

## 12. Gamut-Aware Output

**The insight:** OKLCH can express colors outside the sRGB gamut. On Display P3 screens (most modern Apple devices, many Android phones), these extra colors are visible. On sRGB screens, the browser clamps unpredictably.

### Progressive enhancement

```css
:root {
  /* sRGB-safe values */
  --color-primary-500: oklch(0.55 0.2 250);
}

/* P3-enhanced values for wider gamut */
@supports (color: color(display-p3 1 0 0)) {
  :root {
    --color-primary-500: oklch(0.55 0.28 250); /* Higher chroma possible in P3 */
  }
}
```

### Implementation

AutoTheme computes the maximum in-gamut chroma for each color at its lightness and hue:

```typescript
function maxChromaForGamut(l: number, h: number, gamut: "srgb" | "display-p3"): number {
  let low = 0,
    high = 0.4;
  while (high - low > 0.001) {
    const mid = (low + high) / 2;
    if (isInGamut({ l, c: mid, h, a: 1 }, gamut)) low = mid;
    else high = mid;
  }
  return low;
}
```

For each palette color, emit the sRGB-clamped value as default and the P3-enhanced value in the `@supports` block.

---

## 13. View Transitions for Theme Switching

**The feature:** `document.startViewTransition()` creates smooth animated transitions between DOM states.

**Browser support:** Baseline 2024 for same-document transitions.

### Circular reveal theme switch

```javascript
// AutoTheme-generated script included with darkModeScript
function switchTheme(newMode, event) {
  if (!document.startViewTransition) {
    applyTheme(newMode);
    return;
  }

  const transition = document.startViewTransition(() => applyTheme(newMode));

  transition.ready.then(() => {
    const { clientX: x, clientY: y } = event;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    document.documentElement.animate(
      { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 500, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" },
    );
  });
}
```

The CSS to support this:

```css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s;
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation-duration: 0.01s;
  }
}
```

AutoTheme would include this in its generated dark mode script when `viewTransitions: true`.

---

## 14. Accessibility-Adaptive Themes

### `prefers-contrast` variants

**Browser support:** Baseline 2022. Ship-ready.

```css
/* High contrast: stronger borders, purer backgrounds, bolder text */
@media (prefers-contrast: more) {
  :root {
    --border: oklch(0.35 0.03 var(--theme-hue));
    --border-width: 2px;
    --surface: oklch(0.99 0 0);
    --text-1: oklch(0.05 0 0);
    --focus-ring-width: 3px;
  }
}

/* Low contrast: softer everything */
@media (prefers-contrast: less) {
  :root {
    --border: oklch(0.75 0.01 var(--theme-hue));
    --text-1: oklch(0.3 0.008 var(--theme-hue));
  }
}
```

### `prefers-reduced-transparency`

```css
/* Replace alpha variants with opaque equivalents */
@media (prefers-reduced-transparency) {
  :root {
    --primary-bg: oklch(0.95 0.02 var(--theme-hue)); /* Was 7% alpha */
    --primary-border: oklch(0.85 0.05 var(--theme-hue)); /* Was 22% alpha */
    --surface-overlay: oklch(0.2 0.005 var(--theme-hue)); /* Was scrim */
  }
}
```

### `forced-colors` graceful degradation

```css
@media (forced-colors: active) {
  :root {
    --surface: Canvas;
    --text-1: CanvasText;
    --primary: LinkText;
    --border: ButtonBorder;
    --accent: Highlight;
  }
}
```

### APCA contrast (WCAG 3.0)

The current WCAG 2.x contrast ratio treats light-on-dark and dark-on-light identically. APCA is polarity-sensitive and more perceptually accurate. AutoTheme should implement both:

```typescript
function apcaContrast(text: Color, bg: Color): number {
  const Ybg = apcaLuminance(bg.rgb);
  const Ytxt = apcaLuminance(text.rgb);

  if (Ybg >= Ytxt) {
    return (Math.pow(Ybg, 0.56) - Math.pow(Ytxt, 0.57)) * 1.14;
  } else {
    return (Math.pow(Ybg, 0.65) - Math.pow(Ytxt, 0.62)) * 1.14;
  }
}
```

### Colorblind simulation

Automatically verify palette distinguishability under protanopia, deuteranopia, and tritanopia using Brettel/Vienot simulation matrices. Warn or auto-adjust when harmony colors become indistinguishable.

---

## 15. Variable Font Axes as Theme Tokens

### Grade compensation for dark mode

White text on dark backgrounds appears heavier due to halation. The `GRAD` (grade) axis adjusts stroke weight without changing character metrics:

```css
:root {
  --font-grade: 0;
}

.dark {
  --font-grade: -25; /* Thinner strokes in dark mode */
}

body {
  font-variation-settings: "GRAD" var(--font-grade);
}
```

### Optical sizing tied to type scale

```css
:root {
  --font-opsz-xs: 8;
  --font-opsz-sm: 11;
  --font-opsz-md: 16;
  --font-opsz-lg: 24;
  --font-opsz-xl: 36;
  --font-opsz-2xl: 48;
}
```

### Leading and tracking paired with size

```css
:root {
  /* Line height decreases as size increases */
  --leading-xs: 1.65;
  --leading-sm: 1.55;
  --leading-md: 1.5;
  --leading-lg: 1.35;
  --leading-xl: 1.2;
  --leading-2xl: 1.15;

  /* Letter spacing: increase for small, decrease for large */
  --tracking-xs: 0.04em;
  --tracking-sm: 0.02em;
  --tracking-md: 0em;
  --tracking-lg: -0.01em;
  --tracking-xl: -0.02em;
  --tracking-2xl: -0.03em;
}
```

---

## 16. Scoped Themes via `@scope`

**The feature:** `@scope` creates CSS scoping boundaries with optional lower bounds ("donut scoping"). Proximity-based resolution when scopes overlap.

**Browser support:** Baseline 2024. Ship-ready.

```css
/* Each theme region is self-contained */
@scope ([data-theme="ocean"]) {
  :scope {
    --primary: oklch(0.55 0.15 220);
    --surface: oklch(0.97 0.005 220);
  }
}

@scope ([data-theme="ember"]) {
  :scope {
    --primary: oklch(0.55 0.20 25);
    --surface: oklch(0.97 0.008 25);
  }
}

/* Nested themes: inner scope wins by proximity */
<div data-theme="ocean">
  <div data-theme="ember">
    <!-- Uses ember theme, not ocean -->
  </div>
</div>
```

### Donut scoping for theme boundaries

```css
/* Apply theme to region but stop at nested theme boundaries */
@scope ([data-theme]) to ([data-theme]) {
  .card {
    background: var(--surface);
  }
  .text {
    color: var(--text-1);
  }
}
```

---

## 17. Circadian Theming

**The concept:** Theme color temperature shifts throughout the day -- warm in morning/evening, neutral midday, cool at night. Like f.lux for your design system.

```css
:root {
  /* Circadian control properties */
  --circadian-temperature: 0; /* Updated by JS */
  --circadian-brightness: 0;
}
```

Generated companion script:

```javascript
(function () {
  function update() {
    const h = new Date().getHours() + new Date().getMinutes() / 60;
    // Warm peak at 7am and 7pm, cool trough at 2am
    const temp = Math.sin(((h - 1) * Math.PI) / 12) * 0.3;
    // Brightness peaks at noon
    const bright = Math.cos(((h - 12) * Math.PI) / 12) * 0.15;

    document.documentElement.style.setProperty("--circadian-temperature", temp);
    document.documentElement.style.setProperty("--circadian-brightness", bright);
  }
  update();
  setInterval(update, 60000);
})();
```

Surfaces and text colors incorporate the circadian shift:

```css
:root {
  /* Surface hue shifts warm/cool based on time */
  --surface-hue: calc(var(--theme-hue) + var(--circadian-temperature) * 30);
  --surface-chroma: calc(0.005 + abs(var(--circadian-temperature)) * 0.01);
}
```

---

## 18. Shadow Scale with Tinted Shadows

Shadows tinted with the primary hue feel more cohesive than neutral black shadows:

```css
:root {
  --shadow-color: oklch(0.1 0.02 var(--theme-hue));

  --shadow-1: 0 1px 2px oklch(from var(--shadow-color) l c h / 8%);
  --shadow-2:
    0 2px 4px oklch(from var(--shadow-color) l c h / 10%),
    0 1px 2px oklch(from var(--shadow-color) l c h / 6%);
  --shadow-3:
    0 4px 8px oklch(from var(--shadow-color) l c h / 12%),
    0 2px 4px oklch(from var(--shadow-color) l c h / 8%);
  --shadow-4:
    0 8px 16px oklch(from var(--shadow-color) l c h / 14%),
    0 4px 8px oklch(from var(--shadow-color) l c h / 10%);
  --shadow-5:
    0 16px 32px oklch(from var(--shadow-color) l c h / 16%),
    0 8px 16px oklch(from var(--shadow-color) l c h / 12%);
}
```

Each level doubles the blur radius and adds a secondary tighter shadow for realism. All tinted with the theme's primary hue.

---

## Composition: How These Pieces Fit Together

The most powerful aspect is how these features compose. Here's what a maximally innovative AutoTheme output looks like:

```css
/* 1. Registered properties for animation */
@property --at-hue {
  syntax: "<number>";
  inherits: true;
  initial-value: 250;
}
@property --at-chroma {
  syntax: "<number>";
  inherits: true;
  initial-value: 0.2;
}

/* 2. Cascade layers for predictable overrides */
@layer autotheme.palette, autotheme.semantics, autotheme.motion;

/* 3. Reactive palette from a single base */
@layer autotheme.palette {
  :root {
    color-scheme: light dark;
    --at-hue: 250;
    --base: oklch(0.55 var(--at-chroma) var(--at-hue));

    /* Harmony via hue rotation */
    --secondary: oklch(from var(--base) l c calc(h + 120));

    /* Tints via relative color syntax */
    --primary-100: oklch(from var(--base) 0.93 calc(c * 0.25) h);
    --primary-500: var(--base);
    --primary-900: oklch(from var(--base) calc(l - 0.27) calc(c * 0.7) h);

    /* Alpha variants */
    --primary-bg: oklch(from var(--base) l c h / 7%);

    /* Dual-mode with light-dark() */
    --surface: light-dark(
      oklch(from var(--base) 0.97 calc(c * 0.05) h),
      oklch(from var(--base) 0.12 calc(c * 0.08) h)
    );

    /* Animated transitions */
    transition: --at-hue 0.6s var(--ease-spring);
  }
}

/* 4. Accessibility adaptation */
@media (prefers-contrast: more) {
  :root {
    --at-chroma: 0.28;
  }
}
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-1: 0ms;
    --duration-2: 0ms;
  }
}

/* 5. Scoped sub-themes */
@scope ([data-theme]) to ([data-theme]) {
  .card {
    background: var(--surface);
    color: var(--text-1);
  }
}
```

Change `--at-hue` to `30` and the entire theme -- every surface, every border, every shadow, every text color -- smoothly animates to a warm palette. In dark mode. With accessibility adaptations. Using CSS alone.

That's the vision.
