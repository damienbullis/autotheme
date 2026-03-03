# Milestone 3: Accessibility & Color Vision Simulation

## Overview

Add color blindness simulation, accessibility pattern utilities, and forced-colors media query support. This milestone makes AutoTheme a tool that doesn't just generate beautiful themes but helps designers verify those themes work for everyone.

## What's Included

- **Color Vision Deficiency Simulation** — Transform palette colors through CVD matrices (deuteranopia, protanopia, tritanopia, achromatopsia) for preview/testing
- **Accessibility Pattern Utilities** — SVG pattern fills (stripes, dots, crosses) for data visualization that doesn't rely on color alone
- **Forced-Colors / High Contrast Support** — `@media (forced-colors: active)` overrides mapping semantic tokens to system colors

## Current State

- WCAG contrast calculation exists (`src/core/contrast.ts`) — luminance, contrast ratio, and accessible foreground color selection are already implemented
- Every palette color gets a `foreground` (AAA 7:1) and `contrast` color
- No color blindness simulation code exists
- No pattern utilities exist
- No `forced-colors` support exists

## Impact

- **Moderate complexity, strong positioning.** Most theme generators ignore accessibility beyond contrast ratios. Offering simulation and pattern utilities positions AutoTheme as accessibility-conscious.
- Color blindness simulation is most valuable in the web preview / interactive tool rather than as CSS output — it's a design-time concern, not a runtime one.
- Pattern utilities have immediate practical value for anyone building charts or data-heavy UIs.
- Forced-colors support is low effort and fills a real gap — it's rarely included in generated themes but important for Windows High Contrast Mode users.

## Design Decisions

### Simulation: Build-time vs runtime vs preview-only

Color blindness simulation can serve different purposes depending on where it runs.

**Options:**
1. **Preview-only (web app)** — A toggle in the interactive previewer that applies CVD transforms to the displayed palette. No CLI output, no extra CSS. This is where simulation is most useful — designers check their palette during selection, not in production CSS.
2. **CLI `--simulate` flag** — Outputs a simulated palette as a separate CSS file. Useful for generating screenshots or static comparisons, but the simulated CSS isn't meant for production.
3. **CSS filter approach** — Generate SVG filters that approximate CVD and ship them as `filter` values. Lets users apply simulation in their own apps. But CSS filters can't perfectly replicate CVD matrices, and shipping inaccurate simulation could be worse than none.

These aren't mutually exclusive but the effort scales significantly. Preview-only gives 80% of the value at 20% of the cost.

### Simulation: Algorithm choice

**Options:**
1. **Brettel et al. (1997)** — The gold standard. Uses 3x3 matrices per deficiency type with two half-planes. Most accurate, well-documented, widely used in accessibility tools.
2. **Viénot et al. (1999)** — Simplified single-matrix approach. Less accurate for extreme cases but simpler to implement. Good enough for preview purposes.
3. **Machado et al. (2009)** — Parameterized by severity (0-100%). More nuanced — lets you show mild vs severe deuteranomaly. More complex but more informative.

For a preview tool, Machado's severity parameter could be valuable — most color vision deficiency exists on a spectrum, not as total dichromacy. But Brettel is more commonly implemented and validated.

### Simulation: Color space

CVD matrices are traditionally defined in linear RGB. AutoTheme works in OKLCH internally.

**Pipeline:** OKLCH → Linear RGB → Apply CVD matrix → Linear RGB → OKLCH (for display)

The conversion pipeline already exists (`conversions.ts` handles RGB/HSL, and OKLCH is handled in the Color class). The gap is linear RGB — current conversions go through sRGB (gamma-encoded). Need to add linearization/delinearization.

### Pattern Utilities: SVG patterns vs CSS patterns

**Options:**
1. **SVG data URL patterns** — Consistent with the filter approach. Full control over pattern design. Can use palette colors in the pattern.
2. **CSS-only patterns** — Using `repeating-linear-gradient`, `radial-gradient`, etc. No SVG needed, smaller output, but limited pattern vocabulary.
3. **Both** — CSS for simple patterns (stripes), SVG for complex ones (crosses, dots with specific sizing).

SVG patterns can be theme-colored — a stripe pattern using `var(--primary)` alongside a dot pattern using `var(--secondary)` makes patterns that match the palette. CSS gradient patterns are harder to theme-color.

### Pattern Utilities: Scope

The roadmap lists three patterns (stripe, dot, cross). Should we offer more?

**Minimum viable set:**
- Stripes (diagonal, horizontal, vertical)
- Dots (regular grid, offset)
- Crosshatch

**Extended set:**
- Chevron / zigzag
- Waves
- Diamonds
- Dashes

More patterns = more utility classes to generate. Should pattern density/size be configurable? Fixed set of sizes (sm, md, lg) vs CSS custom property for scale?

### Forced-Colors: Mapping strategy

`forced-colors: active` strips custom colors and maps everything to system color keywords (`Canvas`, `CanvasText`, `Highlight`, etc.).

**Options:**
1. **Map semantic tokens only** — `--background` → `Canvas`, `--foreground` → `CanvasText`, `--primary` → `Highlight`. Simple, correct for most layouts.
2. **Map the full scale** — Every `--color-primary-*` variable gets a forced-colors override. More thorough but potentially noisy.
3. **Utility classes only** — Generate `.surface`, `.primary-surface` classes with forced-color overrides. Don't touch the variables.

Option 1 is the pragmatic choice. The whole point of `forced-colors` is that the OS takes control — trying to preserve the full palette granularity defeats the purpose.

## Open Questions

1. Where does simulation output live? Separate CSS file? Only in the web preview? Both?
2. Should simulation affect the palette generation itself (e.g., "generate a palette that looks good under deuteranopia") or only preview existing palettes?
3. Should pattern utilities be part of the main CSS output or a separate opt-in file?
4. How do patterns interact with dark mode? Should stripe colors invert?
5. Is there value in a "accessibility score" for a generated palette — rating how distinguishable the harmony colors remain under various CVD types?

## Dependencies

- Benefits from the existing contrast calculation infrastructure in `src/core/contrast.ts`.
- Simulation needs linear RGB conversion — may require additions to `src/core/conversions.ts`.
- Pattern utilities would follow the same SVG data URL pattern established by noise textures and potentially by Milestone 2's SVG filters.
- If Milestone 2 ships SVG filters, CVD simulation could reuse the same filter generation infrastructure.
