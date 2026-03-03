# Milestone 05 — Perceptual Semantics Mode

Status: **Design exploration** — not yet implemented.

## Problem

The current semantics pipeline operates in HSL space and derives text colors via WCAG contrast checks. This works for accessibility-first design but fails for **perceptual-first design**, where the designer specifies exact OKLCH lightness/chroma values and needs the system to produce them faithfully.

| | Accessibility-first (current) | Perceptual-first (proposed) |
|---|---|---|
| **Starting point** | Surface color + contrast target | Explicit L/C anchor values |
| **Constraint** | "Every level must pass WCAG AA/AAA" | "I want this exact visual hierarchy" |
| **Color space** | HSL (converted to OKLCH on output) | OKLCH native (no HSL round-trip) |
| **Typical user** | App/web designers, design systems | Presentations, creative tools, games |
| **Text-1 behavior** | Near-white (L≈98 HSL) to maximize contrast | Designer-chosen (e.g., L=0.88 OKLCH) |
| **Dim text** | Stops at midpoint to stay above 4.5:1 | Extends to L=0.40+ for decorative/muted |

The `Color` class already stores OKLCH internally, but the semantics pipeline feeds it HSL inputs — the perceptual mode removes this indirection.

## Proposed API

### Config Shape

```jsonc
{
  "semantics": {
    "enabled": true,
    "mode": "perceptual",          // "contrast" (current) | "perceptual" (new)

    // --- Shared (both modes) ---
    "mapping": { "accent": "primary", "accentSecondary": "secondary" },
    "overrides": { ... },

    // --- Contrast mode (existing, unchanged) ---
    "surfaceDepth": 4,
    "textLevels": 3,
    "temperature": 0,
    "states": { ... },
    "elevation": { ... },
    "accessibility": { ... },

    // --- Perceptual mode (new) ---
    "surfaces": {
      "anchor": 0.10,              // --surface L value
      "elevatedDelta": 0.02,       // --surface-elevated = anchor + delta
      "sunkenDelta": -0.02,        // --surface-sunken = anchor + delta
      "chroma": 0.010,             // C value for all surfaces
      "hueSource": "primary"       // "primary" | "fixed" | number
    },
    "borders": {
      "offsets": [0.08, 0.13, 0.22],  // L deltas from surface → subtle, normal, strong
      "chroma": 0.010,
      "hueSource": "primary"
    },
    "text": {
      "anchor": 0.88,              // text-1 L (brightest)
      "floor": 0.40,               // text-N L (dimmest)
      "levels": 5,
      "curve": "linear",           // "linear" | "ease-out" | [x1, y1]
      "chromaAnchor": 0.035,       // C at text-1
      "chromaFloor": 0.010,        // C at text-N
      "hueSource": "primary"
    }
  }
}
```

### Mode Resolution

```
if semantics.mode === "perceptual":
    use surfaces/borders/text config blocks
    generate in OKLCH directly via Color.fromOklch()
    skip contrast checks
else:  // "contrast" or undefined
    use surfaceDepth/textLevels/temperature
    generate in HSL with contrast validation
    existing behavior exactly
```

Both modes emit the same CSS variable names and the same `SemanticTokenSet` type, so downstream CSS generation is unaffected.

### Perceptual Mode Behavior

**Surfaces** — three tokens from explicit OKLCH coordinates:
```
--surface:          oklch({anchor}          {chroma} {hue})
--surface-elevated: oklch({anchor + eDelta} {chroma} {hue})
--surface-sunken:   oklch({anchor + sDelta} {chroma} {hue})
--surface-overlay:  oklch(0 0 0 / 60%)
```

**Borders** — three tokens as L offsets from surface anchor:
```
--border-subtle: oklch({anchor + offsets[0]} {chroma} {hue})
--border:        oklch({anchor + offsets[1]} {chroma} {hue})
--border-strong: oklch({anchor + offsets[2]} {chroma} {hue})
```

**Text hierarchy** — N levels distributed between anchor and floor:
```
For i in 1..levels:
  t = (i - 1) / (levels - 1)
  t_curved = applyCurve(t, curve)
  L = anchor - (anchor - floor) * t_curved
  C = chromaAnchor - (chromaAnchor - chromaFloor) * t_curved
  → --text-{i}: oklch({L} {C} {hue})
```

No contrast checks — the designer explicitly chose the range.

**Chroma tapering** models natural behavior: bright text carries more hue tint, dim text becomes nearly achromatic.

**Accents** — unchanged from current behavior. `mapping.accent` and `mapping.accentSecondary` resolve to palette entries identically in both modes.

### `hueSource` Resolution

Resolved once at the top of `generateSemanticTokens`, passed down:
- `"primary"` → primary palette base OKLCH hue (adapts per-theme)
- `"fixed"` → primary hue from root config (doesn't adapt)
- `number` → literal hue value

This is critical for systems that generate multiple themes from different base colors — changing the primary color shifts the entire semantic hierarchy's hue automatically.

### Default Values (Dark Theme)

```jsonc
{
  "surfaces": { "anchor": 0.13, "elevatedDelta": 0.03, "sunkenDelta": -0.02, "chroma": 0.010, "hueSource": "primary" },
  "borders":  { "offsets": [0.08, 0.15, 0.25], "chroma": 0.012, "hueSource": "primary" },
  "text":     { "anchor": 0.90, "floor": 0.45, "levels": 3, "curve": "linear", "chromaAnchor": 0.025, "chromaFloor": 0.010, "hueSource": "primary" }
}
```

## Light Mode

All parameters are OKLCH L values. For light themes, invert the ranges:

```jsonc
{ "surfaces": { "anchor": 0.98, "elevatedDelta": 0.01, "sunkenDelta": -0.02 },
  "text": { "anchor": 0.25, "floor": 0.65 } }
```

The math is identical — `anchor > floor` = dark mode, `anchor < floor` = light mode. No separate codepath.

When `config.mode: "both"`, accept optional light-mode overrides or auto-mirror via `1 - value`:

```jsonc
{ "text": {
    "anchor": 0.88, "floor": 0.40,                // dark mode
    "lightAnchor": 0.20, "lightFloor": 0.65        // light mode (optional)
  }
}
```

If `lightAnchor`/`lightFloor` omitted, mirror by reflecting around 0.5.

## Open Design Questions

### 1. Config typing: flat union vs. nested

**Option A — Flat with optional blocks (spec as written):**
All contrast-mode and perceptual-mode fields live on `SemanticsConfig`. Perceptual fields ignored in contrast mode and vice versa.

**Option B — Discriminated union on `mode`:**
```typescript
type SemanticsConfig =
  | { enabled: true; mode: "contrast"; surfaceDepth: number; textLevels: number; ... }
  | { enabled: true; mode: "perceptual"; surfaces: PerceptualSurfacesConfig; ... }
  | { enabled: false };
```
TypeScript enforces that you can't access `surfaceDepth` in perceptual mode. Cleaner types, but harder to merge with defaults and validate in JSON schema.

**Leaning:** Option A is more pragmatic for JSON config + deep merging. Use runtime checks.

### 2. States & elevation in perceptual mode

Current `generateStateTokens` and `generateElevationTokens` apply HSL-based shifts. In perceptual mode this re-introduces HSL artifacts.

**Option A — Perceptual state/elevation configs:**
Add `states.hoverDelta: 0.03` (OKLCH) alongside the existing HSL-based `hoverShift`. More config surface area.

**Option B — Disable in perceptual mode:**
Consumers handle interaction states themselves. The target consumer (decks) doesn't use states/elevation.

**Option C — Auto-convert to OKLCH shifts:**
Rewrite state/elevation generators to work in OKLCH when perceptual mode is active. Reuse the existing config params but interpret them as OKLCH deltas.

**Leaning:** Option B for now. Option A as future extension if demand exists.

### 3. Text `curve` parameter complexity

Spec proposes: `"linear"` | `"ease-out"` | `[x1, y1]` (quadratic bezier).

**Alternative:** `"linear"` | `"ease-out"` | `number` (exponent).
- `curve: 1` = linear
- `curve: 0.5` = ease-out (square root)
- `curve: 2` = ease-in (quadratic)

Implementation: `t_curved = Math.pow(t, exponent)`. Trivial, covers the same range, easier to reason about.

**Leaning:** Exponent model is simpler and sufficient. The bezier adds complexity without clear benefit for 3-5 level hierarchies.

### 4. Light mode mirroring accuracy

`1 - value` is approximate — OKLCH lightness isn't perceptually symmetric around 0.5. A surface at L=0.10 doesn't mirror perfectly to L=0.90.

**Decision:** Accept the approximation as a convenience default. Designers can always specify explicit `lightAnchor`/`lightFloor` for precision. Document the limitation.

### 5. Per-block `chroma` and `hueSource` — keep or DRY up?

The spec gives each sub-block its own `chroma` and `hueSource`. In practice, `hueSource` will almost always be `"primary"` everywhere, and chroma values are similar.

**Decision:** Keep per-block granularity. It's correct — borders often want slightly different chroma than surfaces. A top-level default + per-block override pattern could reduce config verbosity but adds merging complexity. Not worth it for 3 blocks.

## Files That Would Change

| File | Change |
|---|---|
| `src/config/types.ts` | Add `PerceptualSurfacesConfig`, `PerceptualBordersConfig`, `PerceptualTextConfig`. Extend `SemanticsConfig` with `mode` and optional perceptual blocks. |
| `src/config/schema.ts` | JSON schema additions for new fields. |
| `src/config/merge.ts` | Default merging for perceptual fields. |
| `src/generators/semantic.ts` | Mode dispatch in `generateSemanticTokens`. New `generatePerceptualSurfaces`, `generatePerceptualBorders`, `generatePerceptualTextHierarchy`. All use `Color.fromOklch()`. |
| `src/generators/css.ts` | **No changes** — same `SemanticTokenSet` output. |
| Tests | New tests for perceptual pipeline; existing contrast tests untouched. |

## Example: Decks Config

```jsonc
{
  "color": "#7aa2f7",
  "harmony": "square",
  "mode": "dark",
  "palette": { "prefix": "color", "alphaVariants": true, "alphaSteps": { "bg": 7, "border": 22, "glow": 4, "hover": 8 } },
  "semantics": {
    "enabled": true,
    "mode": "perceptual",
    "surfaces": { "anchor": 0.10, "elevatedDelta": 0.02, "sunkenDelta": -0.02, "chroma": 0.010 },
    "borders": { "offsets": [0.08, 0.13, 0.22], "chroma": 0.010 },
    "text": { "anchor": 0.88, "floor": 0.42, "levels": 5, "chromaAnchor": 0.035, "chromaFloor": 0.010 },
    "mapping": { "accent": "primary", "accentSecondary": "secondary" }
  },
  "shadcn": { "enabled": false },
  "typography": { "enabled": false },
  "spacing": { "enabled": false },
  "gradients": false, "noise": false, "utilities": false,
  "output": { "layers": false, "comments": true }
}
```

With this config, the decks bridge layer (`gen-theme.ts`) would need **zero** custom layers for surfaces/text/borders — only structural alpha vars and the diagram color mapper.

## Source

Original spec: `/Users/dbullis/Desktop/personal/decks/plans/AUTOTHEME-SEMANTIC-SPEC.md`
