# Architecture

> Internal code structure for contributors and maintainers.

## Overview

AutoTheme is a TypeScript project that runs on Bun. It functions as both a CLI tool and an importable module. The core color math has zero external dependencies — only the CLI layer uses `cac` for argument parsing and `prompts` for interactive mode.

## Directory structure

```
src/
├── core/           # Pure color logic — no side effects, no I/O
├── generators/     # Output producers — CSS, Tailwind, preview, dark mode
├── config/         # Configuration loading, validation, JSON schema
├── cli/            # CLI entry point, argument parsing, interactive prompts
├── web/            # Documentation website & interactive previewer
└── index.ts        # Public module API exports
```

## Core (`src/core/`)

The foundation. All pure functions, no dependencies, fully testable in isolation.

### `color.ts`

The `Color` class. Internal representation is HSL (hue rotation is cleanest in HSL). Provides conversion methods to/from hex, RGB, HSL, and OKLCH.

### `conversions.ts`

Low-level color space conversions: hex to RGB, RGB to HSL, HSL to OKLCH, etc. Used internally by the `Color` class.

### `contrast.ts`

WCAG luminance and contrast ratio calculations. Given two colors, computes their contrast ratio. Given one color and a target ratio, finds the best foreground color (testing black, white, and intermediates).

### `harmonies.ts`

Defines the 10 harmony types. Each harmony is a `{ count, offset }` pair:
- `count` — how many colors the harmony produces
- `offset(index)` — the hue rotation in degrees for each color

```
Analogous:          3 colors, offsets: -30°, 0°, +30°
Triadic:            3 colors, offsets: 0°, 120°, 240°
Complementary:      2 colors, offsets: 0°, 180°
Split-Complementary: 3 colors, offsets: 0°, 150°, 210°
Square:             4 colors, offsets: 0°, 90°, 180°, 270°
Rectangle:          4 colors, offsets: 0°, 60°, 180°, 240°
Aurelian:           3 colors, offsets: 0°, 137.5°, 275°
Tetradic:           4 colors, offsets: 0°, π×57.3°, 2π×57.3°, 3π×57.3°
Bi-Polar:           2 colors, offsets: 0°, 90°
Retrograde:         3 colors, offsets: 0°, -120°, -240°
```

### `harmony-meta.ts`

Metadata for each harmony — display name, description, and color count. Used by the CLI for help text and the web previewer.

### `variations.ts`

Generates tints (lighter), shades (darker), and tones (desaturated) from a base color:
- **Tints**: 5 steps (50, 100, 200, 300, 400) — increase lightness
- **Shades**: 5 steps (600, 700, 800, 900, 950) — decrease lightness
- **Tones**: 4 steps (tone-1 through tone-4) — reduce saturation

### `palette.ts`

Orchestrates full palette generation. Takes a base color and harmony type, produces every color with its full scale, accessible foreground, and contrast color.

### `types.ts`

Shared TypeScript types used across the core module.

## Generators (`src/generators/`)

Each generator takes a palette + config and produces output. All are independent — you can use any combination.

### `css.ts`

The main CSS generator. Produces CSS custom properties in OKLCH format using Tailwind v4 variable namespaces (`--color-primary-50` through `--color-primary-950`). Handles both light mode (`:root`) and dark mode (`.dark`).

### `tailwind.ts`

Generates Tailwind v4 CSS with `@theme` directives so colors work as utilities (`bg-primary-500`, etc.). Wraps the base CSS output with Tailwind-specific integration.

### `shadcn.ts`

Generates Shadcn UI semantic variables (`--background`, `--foreground`, `--primary`, `--card`, `--destructive`, `--muted`, `--accent`, etc.). Derives these from the harmony palette — automatically selects the most hue-distant color as accent, creates container variants for surfaces.

### `semantic.ts`

Design token semantics layer. Maps raw palette colors to semantic roles (surface, container, elevated, etc.) following Material Design 3 color system concepts adapted for CSS variables.

### `preview.ts`

Generates a self-contained HTML file showing the palette visually — color swatches, scale numbers, text contrast validation, semantic color usage, and live CSS variable references.

### `utilities.ts`

Generates additional CSS utilities: typography scale, spacing scale (golden ratio), gradient variables, and noise texture SVG.

## Config (`src/config/`)

### `schema.ts`

Defines the configuration shape and defaults. Generates the JSON schema (`schema.json`) used for editor autocompletion in config files.

### `validator.ts`

Validates and normalizes configuration. Merges CLI flags with config file values with defaults (priority: CLI > config file > defaults). Validates color formats, harmony names, and numeric ranges.

## CLI (`src/cli/`)

### `main.ts`

The executable entry point (`#!/usr/bin/env bun`). Calls `run()` with process arguments.

### `cli.ts`

The `run()` function. Orchestrates the full flow: parse args, load config, validate, generate palette, write output files.

### `parser.ts`

Defines CLI flags and options using `cac`. Maps flag names to config keys (e.g., `--dark-mode-script` to `darkModeScript`).

### `init.ts`

Interactive configuration setup using `prompts`. Walks the user through color, harmony, and output options, then writes a config file.

### `logger.ts`

Simple logging utilities with colored output (info, success, warning, error, dim).

## Data flow

```
CLI args / config file
        │
        ▼
   Config validation & merge
        │
        ▼
   Color parsing (hex/rgb/hsl → Color)
        │
        ▼
   Harmony generation (hue rotations → Color[])
        │
        ▼
   Palette expansion (tints, shades, tones, foregrounds)
        │
        ▼
   Generator pipeline:
   ├─ CSS generator      → autotheme.css
   ├─ Tailwind generator → autotheme.tailwind.css
   ├─ Shadcn generator   → (included in CSS)
   ├─ Preview generator  → autotheme.preview.html
   └─ Dark mode script   → darkmode.js
```

## Testing

Tests use Vitest and mirror the `src/` structure:

```
tests/
├── core/
│   ├── harmonies.test.ts
│   ├── harmony-meta.test.ts
│   └── palette.test.ts
├── config/
│   ├── schema.test.ts
│   └── validator.test.ts
└── ...
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

| Command              | Output                              | Purpose              |
| -------------------- | ----------------------------------- | -------------------- |
| `bun run build`      | `dist/index.js`, `dist/index.d.ts`  | NPM module           |
| `bun run build:cli`  | `autotheme` binary                  | Standalone CLI       |
| `bun run build:web`  | `dist/web/`                         | Documentation site   |
