# Milestone 05 — Visual Effects System

Status: **Not started.** Independent of M01 for core effect generation, but config shape follows M01's `boolean | Config` pattern.

## Overview

A suite of CSS-native visual effects — SVG filters, blend modes, backdrop-filter utilities, generative blob shapes, and a compositing layer system. These turn AutoTheme from a color palette generator into a full visual design system.

The features are tightly coupled: blobs, filters, and blend modes are individual primitives, but the stack/layer system makes them composable. Designing them together ensures a coherent API.

## What's Included

- **SVG Filters** — Theme-aware filter effects (grain, glow, duotone) as data URL CSS variables
- **Blend Mode Utilities** — Pre-composed CSS classes for background-blend-mode
- **Backdrop-Filter / Glass Utilities** — Tinted glass effects derived from palette colors
- **Blob Shapes** — Generative organic shapes as SVG paths or clip-path values
- **Stack / Layer Compositing** — Compose multiple visual layers (noise, gradients, blobs, filters) on a single element

## Current State

- A basic noise texture generator exists (`src/generators/noise.ts`) using `feTurbulence` — the only visual effect currently shipped
- Gradient CSS variables exist (`--gradient-linear-*`, `--gradient-direction`)
- No blend mode, backdrop-filter, blob, or compositing code exists

## Impact

- **High complexity, high differentiation.** This is the feature set that separates AutoTheme from every other palette generator.
- The stack/layer system is the flagship — composing `noise + gradient + blend mode` in pure CSS without custom code.
- SVG filters (especially duotone) are immediately useful for hero sections and branded photography.
- Glass/frosted effects are trendy and tedious to hand-write — generating them from palette colors is high-value.

## Design Decisions

### SVG Filters: Inline data URLs

SVG filters are embedded as data URLs in CSS, consistent with the existing noise texture pattern. Self-contained, no extra files.

**Filters to ship (phased):**

Phase 1 (highest value):
- **Grain** — `feTurbulence` + `feColorMatrix`. Nearly identical to existing noise.
- **Glow** — `feGaussianBlur` + `feComposite` + color from palette.
- **Duotone** — `feColorMatrix` mapping to two palette colors. Very useful for photography.

Phase 2 (niche):
- **Halftone** — `feTurbulence` + `feComponentTransfer` + `feComposite` chain.
- **Displacement** — `feTurbulence` + `feDisplacementMap`.

### Blend Modes: CSS variables for the stack, utility classes for direct use

Both variables and classes. Variables feed the stack system's composability. Utility classes provide the familiar `.blend-multiply` pattern for direct use. This sets the precedent for all visual effects.

### Blobs: Random bezier curves with seed

Generate N control points on a circle, offset randomly, connect with cubic beziers. Configurable complexity (point count, randomness factor). Reproducible via seed for deterministic output.

### Stack System: Space-separated list composition

Each `.stack-*` class sets a `--stack-layer-N` variable. A base `.stack` class combines them into `background-image`:

```css
background-image: var(--stack-layer-3, ) var(--stack-layer-2, ) var(--stack-layer-1, );
```

Each class "turns on" its layer by setting its variable. Most CSS-native approach.

### Configuration

Follows M01's `boolean | Config` pattern:

```jsonc
{
  "effects": true
}
// or
{
  "effects": {
    "filters": true,
    "blobs": false,
    "blendModes": true,
    "glass": true,
    "stack": true
  }
}
```

Effects are OFF by default (opt-in). The stack system auto-enables when any primitive is on.

## Open Questions

1. Should visual effects be a separate CSS file (e.g., `theme-effects.css`) or part of the main theme output?
2. How do visual effects interact with dark mode? Should filter intensities change between light/dark?
3. Should the blob generator be deterministic (seed-based) by default, or random with optional seed?
4. Performance: should we warn about paint-heavy effects (blur, blend-mode) on mobile?
5. How do effects reference palette colors? With v2's default output being base colors only, effects would use `--color-primary` (or direct OKLCH values). When palette is enabled, should effects use the full scale?

## Internal Ordering

If broken into phases:

1. **SVG Filters + Blend Modes** — Individual primitives, no composition needed
2. **Backdrop-Filter / Glass Utilities** — Builds on palette colors, standalone
3. **Blob Generation** — Independent, can parallel with phase 2
4. **Stack / Layer System** — Ties everything together, comes last

## Dependencies

- Config shape follows M01's `boolean | Config` pattern.
- The noise texture generator (`src/generators/noise.ts`) provides a proven SVG-as-data-URL pattern.
- The existing gradient system provides variables the stack system references.
- Duotone filters benefit from more harmonies (M03) but don't require them.
