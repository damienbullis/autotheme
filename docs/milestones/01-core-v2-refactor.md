# Milestone 01 — Core v2 Refactor

Status: **Not started.**

Reference: [`docs/v2-design-direction.md`](../v2-design-direction.md)

## Overview

The foundational v2 breaking change. Restructures the config shape, drops the HSL pipeline in favor of OKLCH-only generation, redesigns the semantic token system around a depth abstraction, expands harmony integration into semantics, and makes the full palette scale opt-in.

This milestone implements the core philosophy: **one color → complete design system**. The defaults are the product. Configuration exists for escape hatches, not as the primary interface.

## What Changes

| Area                  | v1 (current)                                | v2 (this milestone)                                   |
| --------------------- | ------------------------------------------- | ----------------------------------------------------- |
| Config pattern        | `{ enabled: boolean, ...params }`           | `boolean \| ConfigObject`                             |
| Generation pipeline   | HSL + OKLCH on output                       | OKLCH-only, native                                    |
| Semantic abstraction  | `surfaceDepth`, `textLevels`, `temperature` | `depth` (single OKLCH L value)                        |
| Semantic tokens       | Off by default (opt-in)                     | On by default (core value)                            |
| Accent system         | 3 tokens (accent, foreground, secondary)    | Per-harmony pairs (scales with harmony type)          |
| Tinted surfaces       | Not supported                               | Generated per harmony color                           |
| Default palette       | Full 50-950 scale per harmony               | Base colors only (~3-4 tokens)                        |
| Full scale            | Always generated                            | Opt-in via `palette: true` or `output.tailwind: true` |
| Text curve            | String (`"linear"`, `"ease-out"`) or bezier | Number (exponent: 1 = linear, 0.5 = ease-out)         |
| Light/dark mode       | Separate codepaths                          | `1 - L` reflection with explicit overrides            |
| `hueSource` per block | Per-block config                            | Removed — always primary hue                          |

## Current State

- Config uses `{ enabled: boolean, ...params }` throughout (`semantics`, `states`, `elevation`, `typography`, `spacing`, etc.)
- Semantic pipeline in `src/generators/semantic.ts` operates in HSL, converts to OKLCH on output
- `SemanticsConfig` has `surfaceDepth`, `textLevels`, `temperature`, per-block `hueSource`
- Accent system produces 3 tokens: `--accent`, `--accent-foreground`, `--accent-secondary`
- Palette always generates full 50-950 scale × every harmony color + foreground + contrast + tones
- `Color` class already stores OKLCH internally and supports `Color.fromOklch()`
- No tinted surfaces, no depth abstraction, no per-harmony accent scaling
- Perceptual mode was planned (old M05) but never implemented

## Impact

- **High complexity, highest value.** This is the v2 breaking change. Every downstream milestone builds on it.
- Reduces default CSS output from 80+ tokens to ~25, making the tool immediately usable without configuration.
- Tinted surfaces and expanded accents give harmony colors a real role in the design system, not just a palette curiosity.
- Breaking change — no migration path, no backwards compatibility.

## Phases

### Phase A: Config Shape & Pipeline

**Config refactor:**

- Replace all `{ enabled: boolean, ...params }` with `boolean | ConfigObject`
- Implement the new `AutoThemeConfig` interface (see v2 design doc §Config Shape)
- Update JSON schema to validate the new shape
- Update config merging/defaults — `true` resolves to the full default config, `false`/omitted disables

**Pipeline refactor:**

- Drop HSL contrast mode entirely from `generateSemanticTokens`
- Remove `semantics.mode` ("contrast" | "perceptual") — there's only one pipeline now
- All generation uses `Color.fromOklch()` natively
- No HSL round-trips in the semantic generator
- Accessibility checking becomes a separate layer (see M04), not a generation driver

### Phase B: Depth & Semantic System

**Depth abstraction:**

- `depth` = OKLCH L value for the base surface
- Optional — derived from mode when omitted:
  - `mode: "dark"` → depth ≈ 0.13
  - `mode: "light"` → depth ≈ 0.97
- Single meaningful knob: "how dark is my dark theme"

**Surface generation:**

```
--surface:        oklch(depth       chroma hue)
--surface-sunken: oklch(depth+Δsunk chroma hue)
```

Config: `semantics.surfaces.chroma` (default 0.010), `semantics.surfaces.sunkenDelta` (default -0.02).

**Border generation — L offsets from depth:**

```
--border-subtle: oklch(depth+offsets[0] chroma hue)
--border:        oklch(depth+offsets[1] chroma hue)
--border-strong: oklch(depth+offsets[2] chroma hue)
```

Config: `semantics.borders.offsets` (default [0.08, 0.15, 0.25]), `semantics.borders.chroma` (default 0.012).

**Text hierarchy — N levels between anchor and floor:**

```
for i in 1..levels:
  t = (i - 1) / (levels - 1)
  t_curved = Math.pow(t, curve)          // curve is exponent (number)
  L = anchor - (anchor - floor) * t_curved
  C = chromaAnchor - (chromaAnchor - chromaFloor) * t_curved
  → --text-{i}: oklch(L C hue)
```

Chroma taper: bright text carries more hue tint, dim text becomes nearly achromatic.

Config: `semantics.text.levels` (3), `.anchor`/`.floor` (derived from mode), `.curve` (1), `.chroma` ([anchor, floor]).

**Removals:**

- `surfaceDepth`, `textLevels`, `temperature` — replaced by depth + explicit config
- Per-block `hueSource` — always uses primary hue (v2 design §12)

### Phase C: Harmony Integration

**Expanded accent system:**

Every harmony color gets a token pair. The count scales with the harmony type:

```css
--accent: oklch(0.65 0.15 250);
--accent-foreground: oklch(0.98 0.01 250);
--accent-secondary: oklch(0.65 0.12 220);
--accent-secondary-foreground: oklch(0.98 0.01 220);
--accent-tertiary: oklch(0.65 0.1 280);
--accent-tertiary-foreground: oklch(0.98 0.01 280);
```

Values are direct OKLCH — the 50-950 scale doesn't exist by default.

**Tinted surfaces:**

Each harmony color produces a low-chroma surface variant — tinted backgrounds for cards, sections, callouts:

```css
--surface-primary: oklch(0.16 0.025 250);
--surface-primary-foreground: oklch(0.85 0.04 250);
--surface-secondary: oklch(0.16 0.025 130);
--surface-secondary-foreground: oklch(0.85 0.04 130);
```

Derivation:

- **L:** depth + elevatedDelta (same lightness as a raised surface)
- **C:** tint chroma — derived from primary chroma scaled down (~15% of full), or configurable
- **H:** each harmony color's actual hue

This bridges palette → semantics in a meaningful way. Material Design 3's "container" concept without the jargon.

**Mapping config:**

```jsonc
"mapping": {
  "accent": "primary",
  "secondary": "secondary",
  "tertiary": "tertiary"
}
```

Controls which harmony color maps to which semantic role.

### Phase C.5: Existing Feature Config Migration

Several existing features need their config updated to the `boolean | Config` pattern but require no design changes:

- **`shadcn`** — Already generates Shadcn-compatible tokens. Config changes from `{ enabled: boolean, ... }` to `boolean | { radius?: string }`. Token output unchanged.
- **`gradients`** — Already generates gradient CSS variables. Config changes to `gradients?: boolean`. Output unchanged.
- **`noise`** — Already generates noise texture. Config changes to `noise?: boolean`. Output unchanged.
- **`typography`**, **`spacing`**, **`shadows`**, **`radius`** — All opt-in (`true` to enable), config pattern updated.
- **`motion`** — Listed in the v2 config interface but undesigned. Deferred — leave as `motion?: boolean | MotionConfig` placeholder in the type, don't implement yet.

### Phase D: Palette Output Refactor

**Default output — base harmony colors only:**

```css
--color-primary: oklch(0.65 0.15 250);
--color-secondary: oklch(0.65 0.12 220);
--color-tertiary: oklch(0.65 0.1 280);
```

~3-4 tokens depending on harmony type. These exist for decorative use, custom gradients, brand elements — things that don't fit a semantic role.

**Full scale — opt-in:**

Activated by `palette: true` or `output.tailwind: true`. Generates:

```css
--color-primary-50: oklch(...);
--color-primary-100: oklch(...);
/* ... */
--color-primary-500: oklch(...); /* same value as --color-primary */
/* ... */
--color-primary-950: oklch(...);
--color-primary-foreground: oklch(...);
--color-primary-contrast: oklch(...);
--color-primary-tone-1: oklch(...);
/* ... repeated per harmony color */
```

What `palette: true` controls: 50-950 scale, foreground + contrast, tones, alpha variants (if configured).

**Palette tuning params** (only relevant when palette is enabled):

- `tints`/`shades`/`tones` — count of each variation type
- `swing`/`swingStrategy` — hue rotation across the scale
- `chromaBalance` — perceptual chroma normalization across harmony colors
- `alphaVariants` — semi-transparent variants per scale step

**Naming:** Always `--color-{name}` using `palette.prefix` (default `"color"`). Three distinct namespaces: `--color-primary` (raw atom), `--accent` (our semantic), `--primary` (Shadcn semantic).

### Phase E: Light/Dark Mode

- `mode: "both"` (default) generates `light-dark()` CSS function pairs
- `mode: "dark"` or `mode: "light"` generates single-mode output
- Light mode derived by reflecting OKLCH L around 0.5: `L_light = 1 - L_dark`
  - Approximate but sufficient as default — OKLCH L isn't perfectly symmetric around 0.5
  - Explicit overrides available for precision
- Depth auto-derives from mode when omitted

## Default Output

`autotheme "#7aa2f7"` with zero config generates ~25 tokens:

```
HARMONY BASE COLORS (~3-4)
  --color-primary, --color-secondary, --color-tertiary

NEUTRAL SYSTEM (~8, light-dark pairs)
  --surface, --surface-sunken
  --border-subtle, --border, --border-strong
  --text-1, --text-2, --text-3

ACCENT SYSTEM (~6, per harmony color)
  --accent, --accent-foreground
  --accent-secondary, --accent-secondary-foreground
  --accent-tertiary, --accent-tertiary-foreground

TINTED SURFACES (~6, light-dark pairs)
  --surface-primary, --surface-primary-foreground
  --surface-secondary, --surface-secondary-foreground
  --surface-tertiary, --surface-tertiary-foreground
```

All OKLCH format, CSS layers, with comments.

## Config Shape

See the full TypeScript interface in [`docs/v2-design-direction.md`](../v2-design-direction.md) §Config Shape. Key fields for this milestone:

```typescript
interface AutoThemeConfig {
  color: string;
  harmony?: HarmonyType | string; // "analogous"
  mode?: "light" | "dark" | "both"; // "both"

  palette?: boolean | PaletteConfig; // OFF by default
  semantics?: boolean | SemanticsConfig; // ON by default

  output?: {
    path?: string; // "./autotheme.css"
    format?: "oklch" | "hsl" | "rgb" | "hex";
    tailwind?: boolean; // activates full palette
    preview?: boolean;
    comments?: boolean; // true
    layers?: boolean; // true
    lightDark?: boolean; // true when mode="both"
  };
}
```

## Files That Change

| File                         | Change                                                                   |
| ---------------------------- | ------------------------------------------------------------------------ |
| `src/config/types.ts`        | New `AutoThemeConfig` interface, remove old config types                 |
| `src/config/schema.ts`       | Updated JSON schema for new shape                                        |
| `src/config/merge.ts`        | Default merging for `boolean \| Config` pattern                          |
| `src/generators/semantic.ts` | Full rewrite: OKLCH-only, depth-based, expanded accents, tinted surfaces |
| `src/generators/css.ts`      | Updated token output, conditional palette                                |
| `src/generators/tailwind.ts` | Palette scale activation via config                                      |
| `src/generators/palette.ts`  | Conditional generation (base-only vs full scale)                         |
| `src/cli/`                   | Updated flag parsing for new config shape                                |
| Tests                        | New test suite for entire pipeline                                       |

## Open Questions

1. **Exact default values** — depth, border offsets, text anchors need visual validation with specific colors before hardcoding
2. **Tinted surface chroma derivation** — the formula for how primary chroma maps to tint chroma (proposed ~15% of primary) needs testing across different hues and chromas
3. **Mapping config UX** — how custom harmony names interact with the mapping system when using non-standard harmony types

## Dependencies

- None. This is the foundational milestone. All other milestones depend on it.
