# Milestone 04 — Accessibility

Status: **Not started.** Partially depends on M01 (output config), but checking/fixing APIs can be built independently.

Reference: [`docs/v2-design-direction.md`](../v2-design-direction.md) §9

## Overview

Accessibility is a **checking and fixing layer**, not a generation mode. The v2 pipeline generates perceptually correct themes in OKLCH. This milestone adds tools to verify those themes meet contrast standards and adjust them when they don't — plus simulation, pattern utilities, and media query support.

## What's Included

- **Contrast checking** — Report which token pairs fail WCAG AA or AAA
- **Contrast fixing** — Automatically nudge L values to meet a target standard
- **Accessibility media queries** — `prefers-contrast`, `prefers-reduced-transparency`, `forced-colors` as output config
- **Color vision deficiency simulation** — CVD transforms for the web preview
- **Accessibility pattern utilities** — SVG pattern fills for data visualization

## Current State

- WCAG contrast calculation exists in `src/core/contrast.ts` — luminance, contrast ratio, accessible foreground selection
- Every palette color gets `foreground` (AAA 7:1) and `contrast` colors
- No checking/fixing API for semantic tokens
- No media query output support
- No CVD simulation code
- No pattern utilities

## Impact

- **Moderate complexity, strong positioning.** Most theme generators ignore accessibility beyond contrast ratios. Offering checking, fixing, and simulation positions AutoTheme as accessibility-conscious.
- The checking/fixing API is the highest-value piece — it lets users generate a perceptually beautiful theme and then verify/adjust it for standards compliance without giving up creative control.
- CVD simulation is most valuable in the web preview — it's a design-time concern, not runtime.

## Design Decisions

### Checking & fixing — separate from generation

The v2 design explicitly separates accessibility from the generation pipeline. Generation produces perceptually correct output. Checking validates it. Fixing adjusts it.

**CLI:**

```bash
autotheme "#7aa2f7" --check-contrast         # report issues
autotheme "#7aa2f7" --fix-contrast aa        # adjust tokens to meet AA
autotheme "#7aa2f7" --fix-contrast aaa       # adjust tokens to meet AAA
```

**JS API:**

```typescript
const theme = createTheme("#7aa2f7");
const issues = checkContrast(theme, "aa"); // report: which pairs fail
const fixed = fixContrast(theme, "aaa"); // clone with adjusted L values
```

**How `fixContrast` works:**

1. Walk the semantic token pairs (text-N against surface, accent against accent-foreground, etc.)
2. For each pair that fails the target ratio, nudge the foreground's L value minimally
3. Preserve chroma and hue — only lightness changes
4. Return a new theme object (immutable — original unchanged)

The nudging should be minimal — find the closest L value that meets the ratio, not jump to maximum contrast. This preserves the designer's perceptual intent.

### Accessibility media queries — output config

These are CSS output features, not generation parameters:

```jsonc
{
  "output": {
    "contrastMedia": true,
    "reducedTransparency": true,
    "forcedColors": true,
  },
}
```

**`contrastMedia: true`** — Generates `@media (prefers-contrast: more)` block that increases border contrast and text weight.

**`reducedTransparency: true`** — Generates `@media (prefers-reduced-transparency)` block that replaces semi-transparent values with opaque equivalents.

**`forcedColors: true`** — Generates `@media (forced-colors: active)` block mapping semantic tokens to system colors (`Canvas`, `CanvasText`, `Highlight`, etc.). Maps semantic tokens only — the full palette scale isn't relevant in forced-colors mode.

### CVD simulation — preview-only

Color blindness simulation runs in the web preview as a design-time tool. No CLI output, no extra CSS.

**Algorithm:** Brettel et al. (1997) — gold standard, well-validated. Supports deuteranopia, protanopia, tritanopia, achromatopsia.

**Pipeline:** OKLCH → Linear RGB → Apply CVD matrix → Linear RGB → OKLCH (for display)

Requires adding linearization/delinearization to the conversion pipeline — current conversions go through sRGB (gamma-encoded).

**Scope:** Toggle in the web previewer that applies CVD transforms to the displayed palette. Lets designers verify their harmony choices remain distinguishable under various types of color vision deficiency.

### Pattern utilities — SVG data URLs

SVG patterns as data URL CSS variables, following the established noise texture pattern. Theme-colored using palette OKLCH values.

**Minimum viable set:**

- Stripes (diagonal, horizontal, vertical)
- Dots (regular grid)
- Crosshatch

Config:

```jsonc
{ "patterns": true }
// or
{ "patterns": { "types": ["stripes", "dots"], "density": "md" } }
```

Patterns are OFF by default (opt-in). Density options: `"sm"`, `"md"`, `"lg"`.

## Open Questions

1. **Token pair discovery** — How does `checkContrast` know which tokens are foreground/background pairs? The semantic system defines the relationships (text-N against surface, accent-foreground against accent), but this mapping needs to be formalized.
2. **Fix strategy for tinted surfaces** — When `--surface-primary-foreground` fails contrast against `--surface-primary`, should fixing adjust the foreground or the surface? Likely foreground (surface chroma is intentional).
3. **Severity parameter** — Should CVD simulation support severity levels (mild/moderate/severe) via Machado's parameterized model? Or is binary (full dichromacy via Brettel) sufficient for a preview tool?
4. **Pattern interaction with dark mode** — Should pattern colors invert? Or are they always derived from the current mode's palette?
5. **Accessibility score** — Is there value in a summary metric ("your palette scores 92/100 for accessibility") beyond pass/fail per pair?

## Dependencies

- Contrast checking/fixing uses existing `src/core/contrast.ts` infrastructure — can be built independently of M01.
- Media query output depends on M01's output config shape.
- CVD simulation needs linear RGB conversion additions to `src/core/conversions.ts`.
- Pattern utilities follow the SVG data URL pattern from `src/generators/noise.ts`.
