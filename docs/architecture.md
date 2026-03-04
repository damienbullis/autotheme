# Architecture

> Internal code structure for contributors and maintainers.

## Overview

AutoTheme is a TypeScript project that runs on Bun. It functions as both a CLI tool and an importable module. The core color math has zero external dependencies — only the CLI layer uses `cac` for argument parsing and `prompts` for interactive mode.

## Directory structure

```
src/
├── core/           # Pure color logic — no side effects, no I/O
│   ├── color.ts          # Immutable Color class (OKLCH internal representation)
│   ├── conversions.ts    # Hex/RGB/HSL/OKLCH conversions
│   ├── contrast.ts       # WCAG luminance and contrast calculations
│   ├── harmonies.ts      # 12 harmony types with offset functions
│   ├── harmony-meta.ts   # Display names and descriptions per harmony
│   ├── variations.ts     # Tints, shades, tones generation
│   ├── palette.ts        # Full palette with scales and foregrounds
│   ├── theme.ts          # Theme generation from resolved config
│   ├── accessibility.ts  # Contrast checking and fixing (AA/AAA)
│   ├── cvd.ts            # Color Vision Deficiency simulation
│   ├── gamut.ts          # sRGB gamut mapping and clamping
│   ├── luminance.ts      # WCAG 2.x relative luminance
│   ├── parse.ts          # Color string parsing (hex, rgb, hsl, oklch)
│   ├── background.ts     # Light/dark background derivation
│   ├── types.ts          # Shared types (HSL, RGB, OKLCH, HarmonyType)
│   └── index.ts          # Core module exports
│
├── generators/     # Output producers — CSS, tokens, effects
│   ├── css.ts            # Main CSS variables (palette scales)
│   ├── semantic.ts       # Depth-based semantic tokens
│   ├── elevation.ts      # Elevation system (surface + multi-layer shadows)
│   ├── states.ts         # Interactive state modifiers (hover, active, etc.)
│   ├── shadow.ts         # Shadow scale with hue tinting
│   ├── motion.ts         # Spring physics easing and duration scales
│   ├── alpha.ts          # Alpha-transparent color variants
│   ├── fluid.ts          # CSS clamp() fluid scaling
│   ├── property.ts       # @property declarations for animations
│   ├── reactive.ts       # Reactive palette (relative color syntax)
│   ├── effects.ts        # Visual effects orchestrator
│   ├── filters.ts        # SVG filters (grain, glow, duotone)
│   ├── glass.ts          # Glassmorphism utilities
│   ├── blobs.ts          # Organic blob shapes (seeded PRNG)
│   ├── patterns.ts       # SVG patterns (stripes, dots, crosshatch)
│   ├── blendmodes.ts     # Blend mode variables and utilities
│   ├── stack.ts          # Layer stacking and compositing
│   ├── shadcn.ts         # Shadcn UI semantic variables
│   ├── tailwind.ts       # Tailwind v4 CSS (@theme directives)
│   ├── dark-mode.ts      # Dark mode CSS overrides
│   ├── preview.ts        # HTML preview page
│   ├── script.ts         # Dark mode init script (FOUC prevention)
│   ├── noise.ts          # Inline SVG noise texture
│   ├── utilities.ts      # Gradient and noise utility classes
│   ├── types.ts          # GeneratedTheme, GeneratorOutput interfaces
│   └── index.ts          # Generator exports and writeOutputs
│
├── config/         # Configuration loading, validation, merging
│   ├── types.ts          # AutoThemeConfig, ResolvedConfig, all defaults
│   ├── loader.ts         # Config file loading (disk or URL)
│   ├── schema.ts         # JSON Schema generation
│   ├── validator.ts      # Validation with boolean|Config pattern
│   ├── merge.ts          # CLI > config > presets > defaults merging
│   ├── presets.ts        # Built-in presets (ocean, sunset, forest, etc.)
│   └── index.ts          # Config module exports
│
├── cli/            # CLI entry point and argument parsing
│   ├── main.ts           # Executable entry (#!/usr/bin/env bun)
│   ├── cli.ts            # run() orchestrator (parse, validate, generate, write)
│   ├── parser.ts         # CLI flags via cac
│   ├── init.ts           # Interactive setup via prompts
│   ├── logger.ts         # Colored terminal output
│   └── index.ts          # CLI exports
│
├── web/            # Documentation website & interactive previewer
│
└── index.ts        # Public module API exports
```

## Core (`src/core/`)

The foundation. All pure functions, no dependencies, fully testable in isolation.

### `color.ts`

The `Color` class. Immutable, with OKLCH as the internal representation. Provides conversion methods to/from hex, RGB, HSL, and OKLCH.

### `conversions.ts`

Low-level color space conversions: hex to RGB, RGB to HSL, HSL to OKLCH, etc. Used internally by the `Color` class.

### `contrast.ts`

WCAG luminance and contrast ratio calculations. Given two colors, computes their contrast ratio. Given one color and a target ratio, finds the best foreground color (testing black, white, and intermediates).

### `harmonies.ts`

Defines the 12 harmony types. Each harmony is a `{ count, offset }` pair:

- `count` — how many colors the harmony produces
- `offset(index)` — the hue rotation in degrees for each index

```
Complementary:              2 colors, offsets: 0°, 180°
Analogous:                  3 colors, offsets: -30°, 0°, +30°
Triadic:                    3 colors, offsets: 0°, 120°, 240°
Split-Complementary:        3 colors, offsets: 0°, 150°, 210°
Drift:                      4 colors, offsets: progressive spiral
Square:                     4 colors, offsets: 0°, 90°, 180°, 270°
Rectangle:                  4 colors, offsets: 0°, 60°, 180°, 240°
Aurelian:                   3 colors, offsets: 0°, 137.5°, 275°
Bi-Polar:                   2 colors, offsets: 0°, 90°
Retrograde:                 3 colors, offsets: 0°, -120°, +120°
Monochromatic:              3 colors, same hue with chroma variation
Double-Split-Complementary: 5 colors, offsets: 0°, 150°, 210°, 30°, 330°
```

Also supports custom harmonies via explicit angle arrays.

### `harmony-meta.ts`

Metadata for each harmony — display name, description, and color count. Used by the CLI for help text and the web previewer.

### `variations.ts`

Generates tints (lighter), shades (darker), and tones (desaturated) from a base color using OKLCH lightness:

- **Tints**: 5 steps (50, 100, 200, 300, 400) — increase lightness
- **Shades**: 5 steps (600, 700, 800, 900, 950) — decrease lightness
- **Tones**: 4 steps (tone-1 through tone-4) — reduce chroma

### `palette.ts`

Orchestrates full palette generation. Takes a base color and harmony type, produces every color with its full scale, accessible foreground, and contrast color.

### `theme.ts`

Main theme generation function. Takes a `ResolvedConfig` and produces a complete theme by running palette generation and passing results to the appropriate generators.

### `accessibility.ts`

Advanced accessibility features:

- Check contrast of token pairs against WCAG levels (AA/AAA)
- Fix colors that fail contrast requirements by adjusting lightness
- Generate contrast reports for the entire palette

### `cvd.ts`

Color Vision Deficiency simulation. Transforms colors to approximate how they appear under:

- Protanopia (no red cones)
- Deuteranopia (no green cones)
- Tritanopia (no blue cones)
- Achromatopsia (no color vision)

### `gamut.ts`

Gamut mapping for OKLCH colors. Ensures colors are displayable in sRGB by clamping chroma while preserving hue and lightness. Also provides max-chroma lookup for wide-gamut (P3) output.

### `parse.ts`

Parses color strings in any supported format (hex, rgb(), hsl(), oklch()) into `Color` instances.

### `background.ts`

Generates light and dark mode background colors derived from the primary color's hue, with minimal chroma for a tinted-neutral feel.

### `types.ts`

Shared TypeScript types: `HSL`, `RGB`, `OKLCH`, `HarmonyType` (12 types + `custom`), `HarmonyResult`, `PaletteVariations`, `FullPalette`, etc.

## Generators (`src/generators/`)

Each generator takes palette/config data and produces CSS output. All are independent — you can use any combination.

### `css.ts`

The main CSS generator. Produces CSS custom properties in OKLCH format using Tailwind v4 variable namespaces (`--color-primary-50` through `--color-primary-950`). Handles both light mode (`:root`) and dark mode (`.dark`).

### `semantic.ts`

Depth-based semantic token generation. From the primary hue and a `depth` parameter, generates:

- **Surfaces**: background, sunken, raised — tinted neutrals at different lightness levels
- **Text hierarchy**: primary (high contrast), secondary (medium), tertiary (subtle)
- **Borders**: default, subtle, strong — with configurable offsets and chroma
- **Accent roles**: maps harmony colors to semantic roles via configurable mapping

### `elevation.ts`

Elevation system. Each level (1–N) gets:

- A surface color slightly lighter than the base surface
- Multi-layer box shadows with increasing blur, offset, and opacity
- Shadow colors tinted with the primary hue when `tintShadows` is enabled

### `states.ts`

Universal state modifier tokens. Instead of per-component state colors, generates:

- `--state-hover`: lightness delta for hover states
- `--state-active`: lightness delta for active/pressed
- Focus ring styles (color, width, offset)
- Disabled opacity

These compose with any color using OKLCH relative color functions.

### `shadow.ts`

Shadow scale (1–N) using exponential sizing. Each level increases blur, spread, and offset. Shadow colors can be tinted with the primary hue.

### `motion.ts`

Motion token generation:

- Duration scale (exponential steps from a base)
- Spring physics easing (stiffness, damping, mass → CSS `linear()` approximation)
- `prefers-reduced-motion` media query support

### `effects.ts`

Orchestrator that combines all visual effect generators (filters, glass, blobs, patterns, blend modes, stack) into a single output.

### `filters.ts`, `glass.ts`, `blobs.ts`, `patterns.ts`, `blendmodes.ts`, `stack.ts`

Visual effects generators. Each produces theme-derived CSS — colors come from the harmony palette, not arbitrary values:

- **Filters**: Grain (feTurbulence), glow (blur + brightness), duotone (feColorMatrix)
- **Glass**: Glassmorphism with backdrop-blur, opacity, and saturation
- **Blobs**: Organic SVG shapes using seeded PRNG and bezier curves
- **Patterns**: Repeating SVG patterns (stripes, dots, crosshatch)
- **Blend modes**: CSS variables and utility classes for compositing
- **Stack**: Layer stacking variables for z-index management

### `shadcn.ts`

Generates Shadcn UI semantic variables (`--background`, `--foreground`, `--primary`, `--card`, `--destructive`, `--muted`, `--accent`, etc.) derived from semantic tokens.

### `tailwind.ts`

Generates Tailwind v4 CSS with `@theme` directives so colors work as utilities (`bg-primary-500`, etc.). Wraps the base CSS output with Tailwind-specific integration.

## Config (`src/config/`)

### `types.ts`

Defines `AutoThemeConfig` (user-facing, uses `boolean | Config` pattern) and `ResolvedConfig` (internal, all booleans resolved to `false | FullConfig`). Contains all default values.

### `validator.ts`

Validates configuration values. Handles the `boolean | Config` pattern — `true` expands to full defaults, `false` disables the feature, and objects are merged with defaults.

### `merge.ts`

Merges configuration sources in priority order: CLI flags > config file > preset > defaults.

### `presets.ts`

Built-in presets (ocean, sunset, forest, etc.) — each a partial `AutoThemeConfig` with curated colors, harmonies, and feature settings.

## CLI (`src/cli/`)

### `main.ts`

The executable entry point (`#!/usr/bin/env bun`). Calls `run()` with process arguments.

### `cli.ts`

The `run()` function. Orchestrates the full flow: parse args → load config → merge & validate → generate theme → write output files. Also handles `init`, `schema`, and `presets` subcommands.

### `parser.ts`

Defines CLI flags and options using `cac`. Maps flag names to config keys.

### `init.ts`

Interactive configuration setup using `prompts`. Walks the user through color, harmony, framework, and feature options, then writes a config file.

## Data flow

```
CLI args / config file / preset
        │
        ▼
   Config merge & validation
   (CLI > config > preset > defaults)
        │
        ▼
   Color parsing (hex/rgb/hsl/oklch → Color)
        │
        ▼
   Harmony generation (hue rotations → Color[])
        │
        ▼
   Palette expansion (tints, shades, tones, foregrounds)
        │
        ▼
   Generator pipeline (each runs if its feature is enabled):
   ├─ CSS generator        → palette scale variables
   ├─ Semantic generator   → depth-based design tokens
   ├─ States generator     → hover/active/focus/disabled
   ├─ Elevation generator  → surfaces + multi-layer shadows
   ├─ Shadow generator     → shadow scale
   ├─ Motion generator     → durations + spring easing
   ├─ Effects generator    → filters, glass, blobs, patterns, blends
   ├─ Shadcn generator     → Shadcn UI variables
   ├─ Tailwind generator   → @theme wrapper
   ├─ Dark mode generator  → .dark overrides
   ├─ Preview generator    → HTML visualization
   └─ Script generator     → darkmode.js
        │
        ▼
   Output → autotheme.css (combined)
```

## Testing

Tests use Vitest and mirror the `src/` structure:

```
tests/
├── core/
│   ├── harmonies.test.ts
│   ├── harmony-meta.test.ts
│   ├── accessibility.test.ts
│   ├── cvd.test.ts
│   ├── theme.test.ts
│   └── ...
├── generators/
│   ├── css.test.ts
│   ├── effects.test.ts
│   ├── filters.test.ts
│   ├── patterns.test.ts
│   ├── blobs.test.ts
│   └── ...
├── cli/
│   ├── parser.test.ts
│   ├── init.test.ts
│   └── ...
└── helpers/
    └── test-theme.ts
```

Run tests:

```bash
bun run test          # Watch mode
bun run test:run      # Once
bun run test:coverage # With coverage
```

## Code quality

- **TypeScript**: Strict mode, checked with `tsc --noEmit`
- **Linting**: oxlint (Rust-based, fast)
- **Formatting**: oxfmt (Rust-based, fast)
- **All checks**: `bun run check` (typecheck + lint + format + test)

## Build targets

| Command             | Output                             | Purpose            |
| ------------------- | ---------------------------------- | ------------------ |
| `bun run build`     | `dist/index.js`, `dist/index.d.ts` | NPM module         |
| `bun run build:cli` | `autotheme` binary                 | Standalone CLI     |
| `bun run build:web` | `dist/web/`                        | Documentation site |
