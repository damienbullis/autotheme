# Milestone 2: Visual Effects System

## Overview

A suite of CSS-native visual effects — SVG filters, blend modes, backdrop-filter utilities, generative blob shapes, and a compositing layer system — that turns AutoTheme from a color palette generator into a full visual design system.

These features are tightly coupled: blobs, filters, and blend modes are individual primitives, but the stack/layer system is what makes them composable. Designing them together ensures a coherent API.

## What's Included

- **SVG Filters** — Theme-aware filter effects (grain, glow, duotone, halftone, displacement) as data URL CSS variables
- **Blend Mode Utilities** — Pre-composed CSS classes for background-blend-mode
- **Backdrop-Filter / Glass Utilities** — Tinted glass effects and filter presets derived from palette colors
- **Blob Shapes** — Generative organic shapes as SVG paths or clip-path values
- **Stack / Layer Compositing** — A system for composing multiple visual layers (noise, gradients, blobs, filters) on a single element

## Current State

- A basic noise texture generator exists (`src/generators/noise.ts`) using `feTurbulence` — this is the only visual effect currently shipped
- Gradient CSS variables exist (`--gradient-linear-*`, `--gradient-direction`)
- No blend mode, backdrop-filter, blob, or compositing code exists

## Impact

- **High complexity, high differentiation.** This is the feature set that separates AutoTheme from every other palette generator.
- The stack/layer system is the flagship — the ability to compose `noise + gradient + blend mode` in pure CSS without writing any custom code is a compelling pitch.
- SVG filters (especially duotone) are immediately useful for hero sections, image treatments, and branded photography.
- Glass/frosted effects are trendy and tedious to write by hand — generating them from palette colors is high-value.

## Design Decisions

### SVG Filters: Inline data URLs vs external references

SVG filters can be embedded as data URLs in CSS or referenced from a separate SVG sprite.

**Options:**
1. **Inline data URLs** — Self-contained, no extra files. But data URLs can be large and duplicated if the same filter is used on multiple elements. Consistent with how noise texture already works.
2. **External SVG file** — Smaller CSS, reusable `<filter>` definitions. But requires an extra file and `url()` reference that depends on the file path.
3. **Inline `<svg>` block in HTML preview only** — Filters live in the HTML output's `<defs>`, CSS references them by ID. Clean but only works in the HTML preview, not standalone CSS.

Data URLs are the pragmatic choice for a CSS-first tool. The noise texture already uses this pattern.

### SVG Filters: Which filters to ship?

The roadmap lists 5 (grain, glow, duotone, halftone, displacement). Each has different complexity:

- **Grain** — Simple. `feTurbulence` + `feColorMatrix`. Almost identical to existing noise.
- **Glow** — Moderate. `feGaussianBlur` + `feComposite` + color from palette.
- **Duotone** — Moderate. `feColorMatrix` mapping to two palette colors. Very useful for photography.
- **Halftone** — Complex. Requires `feTurbulence` + `feComponentTransfer` + `feComposite` chain. Niche use case.
- **Displacement** — Complex. `feTurbulence` + `feDisplacementMap`. Cool but potentially jarring.

Should we ship all 5 at once or start with the highest-value subset (grain, glow, duotone)?

### Blend Modes: Utility classes vs CSS variables

**Options:**
1. **Utility classes** (`.blend-multiply`, `.blend-overlay`) — Familiar Tailwind-like pattern. But AutoTheme's primary output is CSS variables, not utility classes. This would be the first utility class output.
2. **CSS variables** (`--blend-primary-multiply: multiply`) — Consistent with the variable-first approach, but blend modes aren't really "values" you'd reference — they're applied directly.
3. **Both** — Variables for the stack system, classes for direct use.

This decision affects the entire visual effects system. If we introduce utility classes here, the glass effects, filters, and stack system should follow the same pattern.

### Blobs: Generation approach

**Options:**
1. **Random bezier curves** — Generate N control points on a circle, offset randomly, connect with cubic beziers. Configurable complexity (point count, randomness factor). Reproducible via seed.
2. **Superformula / Gielis curves** — Mathematical approach that produces more "designed" organic shapes. More parameters but more predictable results.
3. **Pre-computed set** — Ship 10-20 curated blob shapes, select randomly (or by seed). No generation algorithm needed. Less flexible but guaranteed to look good.

The generation approach also determines whether blobs can animate (morphing requires compatible path structures — same number of points).

### Stack System: CSS architecture

The stack system needs to compose multiple `background-image` layers. CSS multiple backgrounds naturally stack, but the interaction with utility classes is tricky.

**Options:**
1. **Custom property composition** — Each `.stack-*` class sets a `--stack-layer-N` variable. A base `.stack` class combines them into `background-image`. Requires knowing the max layer count upfront.
2. **CSS `@layer` + cascade** — Use CSS cascade layers to control stacking order. Modern but complex.
3. **Space-separated list approach** — Use CSS custom property fallback chains: `background-image: var(--stack-layer-3, ) var(--stack-layer-2, ) var(--stack-layer-1, )`. Each class "turns on" its layer by setting its variable.

The space-separated approach is the most CSS-native, but browser support for custom property list composition has edge cases.

### Configuration: Granular toggles vs single flag

**Options:**
1. **Single `effects: boolean`** — All or nothing. Simple.
2. **Per-feature flags** — `filters: boolean`, `blobs: boolean`, `blendModes: boolean`, `stack: boolean`. Maximum control.
3. **Feature group** — `effects: { filters: true, blobs: false, stack: true }`. Middle ground.

The stack system logically depends on at least one other visual feature being enabled. Should it auto-enable when any primitive is on?

## Open Questions

1. Should visual effects be a separate CSS file (e.g., `theme-effects.css`) or part of the main theme output?
2. How do visual effects interact with dark mode? Should blend modes and filter intensities change between light/dark?
3. Should the blob generator be deterministic (seed-based) by default, or random with an optional seed?
4. The stack system implies composability — how do we document/preview all the possible combinations without overwhelming users?
5. Performance: should we warn users about paint-heavy effects (blur, blend-mode) on mobile? Or just generate and let them decide?

## Dependencies

- Benefits from Milestone 1 (more harmonies = more colors for duotone, blend variations) but doesn't strictly require it.
- The noise texture generator (`src/generators/noise.ts`) provides a proven pattern for SVG-as-data-URL generation.
- The existing gradient system provides variables the stack system would reference.

## Internal Ordering

If this milestone is broken into phases:

1. **SVG Filters + Blend Modes** — Individual primitives, no composition needed yet
2. **Backdrop-Filter / Glass Utilities** — Builds on palette colors, standalone use
3. **Blob Generation** — Independent from filters, can be developed in parallel
4. **Stack / Layer System** — Ties everything together, should come last
