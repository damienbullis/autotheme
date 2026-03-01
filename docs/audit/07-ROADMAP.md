# Implementation Roadmap

Phased plan for evolving autotheme from current state to the target architecture. Each phase is independently shippable. Breaking changes happen in Phase 1; subsequent phases are additive.

---

## Phase 0: Preparation (Foundation)

**Goal:** Clean up, remove dead weight, prepare for restructuring.

### 0.1 - Remove MD3 semantic system
- Delete `src/generators/semantic.ts` (Material Design 3 tokens)
- Remove all MD3 token generation from `css.ts`
- Remove MD3 -> Shadcn dependency chain
- **Impact:** All MD3 tokens (`--surface`, `--surface-container-*`, `--outline`, etc.) stop generating

### 0.2 - Make Shadcn default to false
- Change `DEFAULT_CONFIG.shadcn` from `true` to `false`
- Change `DEFAULT_CONFIG.utilities` from `true` to `false`
- Change `DEFAULT_CONFIG.gradients` from `true` to `false`
- Change `DEFAULT_CONFIG.noise` from `true` to `false`
- **Principle:** Default output should be minimal (just palette)

### 0.3 - Restructure config types
- Implement nested config structure (REFACTOR-10)
- Add `version: 2` to config schema
- Update CLI args to map to nested config
- Update config loader/validator/merger

### 0.4 - Update tests
- Remove tests for deleted MD3 system
- Update config tests for new defaults
- Ensure all existing passing tests still pass (with updated expectations)

**Deliverable:** AutoTheme generates only palette variables by default. Clean, minimal output.

---

## Phase 1: Core Improvements

**Goal:** Fix bugs and improve the palette generation foundation.

### 1.1 - Mode control (FEAT-1)
- Add `mode: "light" | "dark" | "both"` to config
- When `mode: "dark"`, emit dark values under `:root`
- When `mode: "light"`, emit light values under `:root`
- When `mode: "both"`, emit both (current behavior)
- Update dark mode script generation to respect mode

### 1.2 - Fix variation generation (REFACTOR-6)
- Make tint/shade/tone counts configurable: `palette.tints`, `palette.shades`, `palette.tones`
- Make increment configurable or derive from count
- Add perceptual uniformity option (OKLCH-based lightness steps)
- Fix scale mapping to be dynamic based on step count

### 1.3 - Independent typography scale (FEAT-5)
- New `typography` config object: `{ base, ratio, steps, names?, values? }`
- Generate `--text-{name}: {value}rem` for each step
- Support manual override per step
- Center scale around base (steps go both smaller and larger)

### 1.4 - Independent spacing scale (FEAT-6)
- New `spacing` config object: `{ base, ratio, steps, values? }`
- Remove hardcoded 0.155rem base
- Generate `--spacing-{n}: {value}rem` for each step
- Support manual override per step

### 1.5 - Fix bugs
- BUG-4: Document or fix drift harmony formula
- BUG-5: Skip swing for primary (index 0)
- BUG-9: Add modern CSS color syntax parsing
- BUG-10: Fix error color hue distance from primary

**Deliverable:** Configurable palette with proper mode control and independent scales.

---

## Phase 2: Semantic Layer

**Goal:** Build autotheme's own semantic token system from scratch.

### 2.1 - Design the semantic vocabulary
Define autotheme's semantic tokens (not MD3, not Shadcn - autotheme's own):

**Surfaces:**
```
--surface            (main background)
--surface-elevated   (cards, modals)
--surface-sunken     (inset areas, wells)
--surface-overlay     (overlays, scrims)
```

**Borders:**
```
--border             (default border)
--border-subtle      (dividers, separators)
--border-strong      (emphasis borders)
```

**Text:**
```
--text-1 through --text-N   (configurable depth)
```

**Accents:**
```
--accent             (primary call to action)
--accent-subtle      (subtle primary tint)
--accent-secondary   (secondary action)
```

### 2.2 - Surface depth control (FEAT-2)
- Add `semantics.darkness` parameter
- Surface hierarchy spaces from darkness anchor
- Surfaces use palette shades with configurable selection

### 2.3 - Text hierarchy (FEAT-3)
- Add `semantics.textLevels` parameter
- Generate text colors spaced across legible range
- Tint with primary hue, decrease chroma at lower levels
- All meet contrast requirements against configured surfaces

### 2.4 - Semantic mapping rules (FEAT-8)
- Configurable mapping from palette to semantic roles
- Default mapping follows 60/30/10 rule
- Allow overrides per-token

### 2.5 - Semantic tokens as var() references (REC-1)
- Where possible, semantic tokens reference palette vars
- Document which tokens are references vs computed

**Deliverable:** Complete semantic layer that correctly maps palette to roles.

---

## Phase 3: Alpha & State Variants

**Goal:** Add alpha overlays and interactive state tokens.

### 3.1 - Alpha variants (FEAT-4)
- Add `palette.alphaVariants` toggle
- Generate `-bg`, `-border`, `-glow`, `-hover` per harmony color
- Configurable alpha percentages
- Alpha variants work alongside solid swatches (not replacement)

### 3.2 - Interactive state tokens (GAP-6)
- Generate hover/active/focus/disabled variants for semantic colors
- Hover: +/- lightness shift
- Active: further shift
- Disabled: desaturate + reduce alpha
- Follow mode-appropriate direction (lighter in dark mode, darker in light mode)

### 3.3 - Elevation system (GAP-5)
- Define 3-5 elevation levels
- Each level coordinates: surface lightness + shadow depth + border treatment
- Integrates with surface tokens from Phase 2

**Deliverable:** Rich interaction and depth system.

---

## Phase 4: Framework Bindings

**Goal:** Clean Shadcn integration, Tailwind v4 optimization.

### 4.1 - Rebuild Shadcn binding
- Map from autotheme semantic tokens (not MD3)
- `--background` -> `var(--surface)`
- `--foreground` -> `var(--text-1)`
- `--card` -> `var(--surface-elevated)`
- `--border` -> `var(--border)`
- etc.
- Only emit when `shadcn: true`

### 4.2 - Clean Tailwind generator
- Just the `@theme` directive wrapping palette + semantic vars
- Remove duplicated CSS embedding
- Remove redundant prefix remapping
- Add `@theme inline` support for Tailwind v4

### 4.3 - Expanded presets (REC-10)
- Update existing presets with full config shape
- Add new presets: "dashboard-dark", "marketing-light", "docs-minimal"
- Presets can set mode, semantics, scales

**Deliverable:** Clean framework integration without framework coupling.

---

## Phase 5: Polish & Advanced Features

**Goal:** Quality of life improvements.

### 5.1 - Output documentation (GAP-7, GAP-9)
- Metadata comment header (color, harmony, mode, date)
- Optional inline comments explaining each section
- `comments: true/false` config

### 5.2 - Shadow scale (FEAT-9)
- Configurable shadow system
- Tinted with primary hue
- Coordinates with elevation system

### 5.3 - Border radius scale (FEAT-10)
- Configurable radius system
- Base + ratio + steps + manual override

### 5.4 - Color format option (FEAT-11)
- Support OKLCH (default), HSL, RGB output formats

### 5.5 - Update web preview
- Reflect new layer architecture
- Show palette, semantics, framework bindings as separate panels
- Interactive toggle for each layer

**Deliverable:** Polished, well-documented output with advanced design tokens.

---

## Estimated Effort

| Phase | Scope | Files Touched |
|-------|-------|---------------|
| Phase 0 | Remove MD3, restructure config | ~12 files (config, generators, tests) |
| Phase 1 | Mode control, fix scales, fix bugs | ~10 files (core, generators, config) |
| Phase 2 | New semantic system | ~5 new files + config updates |
| Phase 3 | Alpha variants, states, elevation | ~4 files (palette, generators) |
| Phase 4 | Shadcn/Tailwind rebuild | ~3 files (generators) |
| Phase 5 | Polish, shadows, radii, docs | ~8 files |

---

## Migration Path

Since breaking changes are fine, the migration path is:

1. **Config files:** Version 2 config is incompatible with version 1. Users regenerate from `autotheme init`.
2. **CSS output:** Variable names change for semantic tokens. Palette variables (`--color-primary-500`) stay stable.
3. **API consumers:** `generateTheme()` return type changes to include layer information. `generateCSS()` signature may change.

No shims, no deprecation warnings. Clean break.

---

## Parallel Work Opportunities

These can be developed independently:

| Track | Phases | Dependencies |
|-------|--------|--------------|
| **Config restructure** | 0.3, 0.4 | None |
| **Mode control** | 1.1 | Config restructure |
| **Scale systems** | 1.3, 1.4 | Config restructure |
| **Palette improvements** | 1.2, 3.1 | Config restructure |
| **Semantic layer** | 2.1-2.5 | Mode control + palette improvements |
| **Framework bindings** | 4.1-4.3 | Semantic layer |
| **Polish** | 5.1-5.5 | All prior phases |
