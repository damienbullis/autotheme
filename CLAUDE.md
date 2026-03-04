# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AutoTheme is a TypeScript CSS design-system generator. From a single color and a harmony type, it produces CSS variables covering color scales, semantic tokens, states, elevation, shadows, typography, spacing, motion, visual effects, and more. The project functions as both a CLI tool and an importable Node/Bun module.

## Tech Stack

- **Runtime:** Bun
- **Language:** TypeScript (strict mode)
- **Testing:** Vitest
- **Linting:** oxlint
- **Formatting:** oxfmt

## Commands

```bash
# Development
bun run dev                 # Watch mode for CLI
bun run dev:web             # Dev server for web app

# Building
bun run build               # Build library + schema
bun run build:cli           # Build CLI for npm
bun run build:binary        # Build standalone binaries (all platforms)
bun run build:web           # Build web app

# Testing
bun run test                # Run tests in watch mode
bun run test:run            # Run tests once
bun run test:coverage       # Run tests with coverage
bun run test:run tests/core/  # Run specific test directory

# Code Quality
bun run lint                # Run oxlint
bun run lint:fix            # Fix linting issues
bun run format              # Format with oxfmt
bun run format:check        # Check formatting
bun run typecheck           # TypeScript type checking
bun run check               # Run all checks (typecheck + lint + format + test)
```

## Architecture

```
src/
├── core/           # Pure color logic — OKLCH color class, harmonies, accessibility, CVD, gamut
├── generators/     # Output generators — CSS, semantic tokens, elevation, states, effects, etc.
├── config/         # Configuration loading, validation, merging, presets, JSON schema
├── cli/            # CLI entry point, argument parsing, interactive prompts
├── web/            # Documentation website & interactive previewer
└── index.ts        # Main export for module usage
```

### Core Module (`src/core/`)

- `color.ts` — Immutable Color class with OKLCH internal representation
- `conversions.ts` — Hex/RGB/HSL/OKLCH color space conversions
- `contrast.ts` — WCAG luminance and contrast ratio calculations
- `harmonies.ts` — 12 harmony types (analogous, triadic, complementary, monochromatic, double-split-complementary, etc.)
- `harmony-meta.ts` — Display names and descriptions for each harmony type
- `variations.ts` — Tints (lighter), shades (darker), tones (desaturated) using OKLCH lightness
- `palette.ts` — Full palette generation with accessible text colors
- `theme.ts` — Theme generation from resolved configuration
- `accessibility.ts` — Contrast checking and fixing against WCAG AA/AAA
- `cvd.ts` — Color Vision Deficiency simulation (protanopia, deuteranopia, tritanopia, achromatopsia)
- `gamut.ts` — sRGB gamut mapping and clamping for OKLCH colors
- `luminance.ts` — WCAG 2.x relative luminance from RGB
- `parse.ts` — Color string parsing (hex, rgb, hsl, oklch)
- `background.ts` — Light/dark background color generation derived from primary
- `types.ts` — TypeScript interfaces for HSL, RGB, OKLCH, harmonies, palettes

### Generators (`src/generators/`)

- `css.ts` — Main CSS variable generation with harmony names and scale mappings
- `semantic.ts` — Depth-based semantic tokens (surfaces, borders, text hierarchy, accent roles)
- `elevation.ts` — Elevation system with multi-layer tinted shadows per level
- `states.ts` — Interactive state modifier tokens (hover, active, focus, disabled)
- `shadow.ts` — Shadow scale with primary-hue tinting
- `motion.ts` — Spring physics easing and duration scales (with reduced-motion)
- `alpha.ts` — Alpha-transparent color variants (bg, border, glow, hover)
- `fluid.ts` — CSS `clamp()` fluid scaling between viewport sizes
- `property.ts` — `@property` declarations for animatable custom properties
- `reactive.ts` — Reactive CSS palette using relative color syntax
- `effects.ts` — Orchestrator for all visual effects
- `filters.ts` — SVG filter effects: grain, glow, duotone
- `glass.ts` — Glassmorphism utility classes
- `blobs.ts` — Organic blob shape generation using seeded PRNG
- `patterns.ts` — SVG pattern utilities (stripes, dots, crosshatch)
- `blendmodes.ts` — Blend mode CSS variables and utility classes
- `stack.ts` — Layer stacking variables and compositing utilities
- `shadcn.ts` — Shadcn UI semantic color variables
- `tailwind.ts` — Tailwind v4 CSS with `@theme` directives
- `dark-mode.ts` — Dark mode CSS overrides
- `preview.ts` — HTML preview page generation
- `script.ts` — Dark mode init script (FOUC prevention)
- `noise.ts` — Inline SVG noise texture generation
- `utilities.ts` — Gradient and noise utility classes

### Config (`src/config/`)

- `types.ts` — `AutoThemeConfig` and `ResolvedConfig` interfaces with all defaults
- `loader.ts` — Config file loading from disk or URL
- `schema.ts` — JSON Schema generation for editor autocompletion
- `validator.ts` — Config validation with `boolean | Config` pattern checking
- `merge.ts` — Config merging (CLI > config file > presets > defaults)
- `presets.ts` — Built-in presets (ocean, sunset, forest, etc.)

### Key Concepts

- **Color Space:** OKLCH throughout — perceptually uniform lightness and chroma
- **Harmonies:** 12 types. Hue rotation on the color wheel (e.g., triadic = 120° apart). Includes monochromatic (chroma variation) and double-split-complementary (5 colors)
- **Tints/Shades/Tones:** 5 tints (50–400), 5 shades (600–950), 4 tones (tone-1 to tone-4) per color
- **Depth Abstraction:** Semantic tokens use a `depth` parameter to create tinted surfaces, text hierarchy, and border variants from the primary hue
- **States:** Universal modifier tokens (`--state-hover`, `--state-active`, etc.) using lightness deltas
- **Elevation:** Multi-layer tinted shadows with surface lightness progression
- **Accessible Text:** Each color gets a foreground meeting WCAG AAA (7:1) by default
- **CVD Simulation:** Simulate how the palette appears under different color vision deficiencies
- **Visual Effects:** Theme-derived filters (grain, glow, duotone), glass, blobs, patterns, blend modes, stacking layers
- **P3 Gamut:** OKLCH colors are gamut-mapped to sRGB; wide-gamut displays get full chroma
- **CSS Output:** OKLCH format by default (`oklch(0.65 0.15 250)`), also supports HSL, RGB, hex

## Configuration

AutoTheme uses JSON configuration: `autotheme.json`, `.autothemerc.json`, `.autothemerc`

Priority: CLI flags > config file > presets > defaults

### The `boolean | Config` pattern

Most features accept `true` (enable with defaults), `false` (disable), or an object for fine-grained control:

```json
{
  "color": "#6439FF",
  "harmony": "triadic",
  "palette": true,
  "semantics": { "depth": 0.15 },
  "states": true,
  "elevation": { "levels": 5 },
  "effects": false
}
```

### Top-level config keys

`color`, `harmony`, `mode`, `palette`, `semantics`, `states`, `elevation`, `typography`, `spacing`, `shadows`, `radius`, `motion`, `gradients`, `noise`, `utilities`, `patterns`, `effects`, `shadcn`, `output`, `harmonies`, `angles`, `preset`

### CLI flags

```
-c, --color <color>         Primary color (hex, rgb, hsl)
-a, --harmony <type>        Harmony type
-m, --mode <mode>           light, dark, or both (default: both)
-o, --output <path>         Output file path
-p, --preset <name>         Built-in preset (ocean, sunset, forest, etc.)
--format <format>           Color format: oklch, hsl, rgb, hex
--prefix <prefix>           CSS variable prefix (default: color)
--palette                   Full 50-950 scale (--no-palette to disable)
--semantics / --no-semantics Semantic tokens (default: on)
--states                    Interactive state tokens
--elevation                 Elevation system tokens
--shadows                   Shadow scale
--radius                    Border radius scale
--patterns                  SVG pattern utilities
--effects                   Visual effects (filters, glass, blobs)
--shadcn                    Shadcn UI variables
--tailwind                  Tailwind v4 CSS
--preview                   HTML preview
--gradients / --no-gradients Gradient variables
--spacing / --no-spacing    Spacing scale
--typography / --no-typography Typography scale
--noise / --no-noise        Noise texture
--utilities / --no-utilities Utility classes
--comments / --no-comments  Metadata header and inline comments
--layers / --no-layers      @layer declarations
--check-contrast [level]    Check contrast compliance (aa or aaa)
--angles <angles>           Custom harmony angles (comma-separated)
--stdout                    Output to stdout instead of file
-s, --silent                Suppress output
```

## CSS Variable Naming (Tailwind v4 Compatible)

Uses Tailwind v4 variable namespaces with OKLCH color format:

### Color Scale (per harmony color)

```
--color-primary-50 through --color-primary-950
--color-primary-foreground   # Accessible text color
--color-primary-contrast     # High contrast text
--color-primary-tone-1..4    # Desaturated variations
```

### Semantic Tokens (depth-based)

```
--surface / --surface-foreground       # Page background
--surface-sunken / --surface-raised    # Depth variants
--text-primary / --text-secondary / --text-tertiary  # Text hierarchy
--border / --border-subtle / --border-strong         # Border variants
--accent / --accent-foreground         # Accent from harmony mapping
```

### States & Elevation

```
--state-hover / --state-active / --state-disabled  # Interaction modifiers
--elevation-1 through --elevation-N                # Surface + shadow per level
--shadow-1 through --shadow-N                      # Shadow scale
--radius-1 through --radius-N                      # Border radius scale
```

### Motion

```
--duration-1 through --duration-N   # Duration scale
--spring-*                          # Spring physics easing
```

### Effects

```
--filter-grain / --filter-glow / --filter-duotone  # SVG filter data URLs
--glass-* / --blob-* / --pattern-* / --blend-*     # Visual effect tokens
```

### Shadcn UI Variables

Full Shadcn UI semantic variables (`--background`, `--foreground`, `--primary`, `--card`, `--destructive`, etc.) in OKLCH format.

### Other Namespaces

```
--text-xs..4xl               # Typography scale
--spacing-1..10              # Spacing scale
--gradient-direction         # Gradient direction
--gradient-linear-*          # Linear gradients to harmony colors
--background-image-noise     # Noise texture SVG
```

## Dependencies

- **Runtime deps:** `cac` (CLI parsing), `prompts` (interactive prompts)
- **Core color math:** Implemented from scratch (zero dependencies)

## Testing

See [TESTING.md](./TESTING.md) for the full testing philosophy. Key rules:

- **Test behavior, not structure.** Don't check string presence in output — verify the output is _correct_.
- **Three tiers:** Integration tests (full pipeline) > Algorithm unit tests (math/logic) > Don't test glue code.
- **Delete tests that restate source code** — checking defaults, exports, or string templates adds no value.
- **Always add regression tests for bug fixes.**
- **Don't test third-party libraries** (cac, prompts) — test our logic around them.
