# Recommendations & Tradeoffs

Design decisions that require deliberate choice. Each section presents options with pros/cons.

---

## REC-1: Should semantics reference palette variables or be standalone values?

### Option A: Semantic tokens as `var()` references (Recommended)

```css
--surface: var(--color-primary-950);
--border: var(--color-primary-700);
--accent: var(--color-secondary-500);
```

**Pros:**
- Single source of truth - change the palette, semantics update
- Transparent - you can see exactly which swatch maps to which role
- Composable - users can remap by changing one reference
- Smaller output - no duplicate color values

**Cons:**
- Requires palette to always be present (semantic layer can't work standalone)
- Slightly more complex CSS (nested var references)
- Not all semantic values map cleanly to a single palette swatch (e.g., surfaces need lightness adjustment)

### Option B: Standalone computed values

```css
--surface: oklch(0.12 0.01 250);
--border: oklch(0.22 0.03 250);
```

**Pros:**
- Self-contained - works without palette layer
- Simpler CSS
- Each value is independently tunable

**Cons:**
- Palette and semantics can disagree
- Harder to understand the relationship between layers
- More CSS output (duplicated values)

### Recommendation: **Option A** for palette-derived tokens, **Option B** for computed tokens

Use `var()` references where the semantic token directly maps to a palette swatch. Use computed values where the semantic token requires transformation (e.g., alpha modification, lightness interpolation between swatches). Document which is which.

---

## REC-2: Should alpha variants be part of the palette or the semantic layer?

### Option A: Part of palette (per harmony color)

```css
--color-primary-bg:     oklch(0.695 0.152 293 / 7%);
--color-primary-border: oklch(0.695 0.152 293 / 22%);
```

**Pros:**
- Available for all harmony colors automatically
- Consistent naming with palette convention
- Useful even without semantic layer

### Option B: Part of semantic layer

```css
--surface-primary: oklch(0.695 0.152 293 / 7%);
--border-primary: oklch(0.695 0.152 293 / 22%);
```

**Pros:**
- More meaningful names tied to usage
- Only generated for roles that need them

### Recommendation: **Option A** - Part of palette

Alpha variants are a property of the color, not its semantic role. A primary color's 7% alpha variant is useful regardless of whether it's used for a surface or a highlight. Keep it in the palette layer, let the semantic layer reference it.

---

## REC-3: How should the semantic layer handle light vs dark mode?

### Option A: Separate semantic mappings for light and dark

```typescript
semantics: {
  light: { surface: "primary-50", text: "primary-900" },
  dark: { surface: "primary-950", text: "primary-100" },
}
```

**Pros:**
- Maximum control
- Clear what each mode does
- No magic inversion logic

**Cons:**
- Double the config
- Users must maintain both

### Option B: Single mapping with automatic inversion

```typescript
semantics: {
  surface: "primary-950",  // In dark mode
  // Light mode automatically inverts: primary-950 -> primary-50
}
```

**Pros:**
- Simpler config
- Less to maintain

**Cons:**
- Inversion isn't always symmetric (dark mode isn't just "flip the scale")
- Less control

### Option C: Mode-aware defaults with overrides (Recommended)

```typescript
mode: "dark",
semantics: {
  surface: "primary-950",     // Used as-is since mode is "dark"
  text: "primary-100",
  // If mode were "both", autotheme generates sensible defaults for both modes
  // Users can override specific tokens per mode
}
```

**Recommendation:** **Option C**. Since `mode` is already a proposed feature, the semantic config should be mode-aware. When `mode: "both"`, generate both sets with sensible defaults. When `mode: "dark"` or `"light"`, generate only that set. Allow per-mode overrides for consumers who need fine-grained control.

---

## REC-4: Should autotheme generate utility classes?

### Current state

AutoTheme generates `.gradient-linear`, `.bg-noise`, `.surface`, `.primary-surface`, etc. These are CSS utility classes baked into the output.

### Recommendation: Remove utility classes from default output

**Reasoning:**
- Tailwind users don't need them (Tailwind generates its own utilities)
- Non-Tailwind users may have different class naming conventions
- They add output size with minimal value (most are 2-3 property definitions)
- They couple autotheme to specific CSS patterns

**Keep as:** Optional template/example file, not part of main CSS output. Or keep behind the `utilities: true` toggle (currently exists) but default to `false`.

---

## REC-5: How deep should scale configurability go?

### Option A: Base + ratio + steps (simple)

```typescript
typography: { base: 1, ratio: 1.125, steps: 7 }
```

**Pros:** Simple, most users only need this
**Cons:** Can't express non-geometric scales

### Option B: Full manual override (maximum)

```typescript
typography: { values: [0.55, 0.62, 0.70, 0.80, 0.90, 1.05, 1.60] }
```

**Pros:** Total control
**Cons:** Must specify every value, no mathematical relationship

### Option C: Both with fallback (Recommended)

```typescript
typography: {
  base: 1,
  ratio: 1.125,
  steps: 7,
  values: [null, null, null, null, null, null, 1.60]  // Override only step 7
}
```

**Pros:** Geometric by default, override specific steps
**Cons:** Slightly more complex

### Recommendation: **Option C** (both, with `values` taking precedence per-step)

Most users set `base`/`ratio`/`steps`. Power users override individual steps. `values` is sparse - `null` entries use the computed value.

---

## REC-6: Should the semantic preset system match specific frameworks?

### Option A: Generic semantic tokens only

Autotheme defines its own semantic vocabulary:
```
--at-surface, --at-surface-elevated, --at-border, --at-text-primary, etc.
```

Consumers manually map to their framework.

### Option B: Framework-specific presets

```typescript
semantics: { preset: "shadcn" }  // Generates Shadcn-compatible names
semantics: { preset: "default" } // Generates autotheme's own names
```

### Recommendation: **Option B** with autotheme's vocab as the default

The `default` preset uses autotheme's own semantic naming. `shadcn` preset maps the same underlying values to Shadcn-specific names (`--background`, `--foreground`, `--card`, `--popover`, etc.). This is a thin mapping layer, not a different color computation.

---

## REC-7: Perceptual uniformity - HSL vs OKLCH for variation generation

### Current: HSL-based variations

Tints/shades generated by linear HSL lightness changes. Fast, simple, but visually uneven.

### Alternative: OKLCH-based variations

Generate variations by adjusting OKLCH lightness. Perceptually uniform - each step looks like the same amount of change.

### Tradeoff

| Aspect | HSL | OKLCH |
|--------|-----|-------|
| Perceptual uniformity | Poor | Excellent |
| Implementation complexity | Simple | Moderate (need OKLCH -> HSL roundtrip) |
| Existing behavior | Current | New |
| Hue shift | None | Can cause slight hue drift |
| Gamut | Always in sRGB | May go out of gamut |

### Recommendation: Default to OKLCH, offer HSL as fallback

Since autotheme already outputs OKLCH values, it makes sense to do the internal math in OKLCH too. Clamp to sRGB gamut after computation. Offer a `perceptual: false` option for consumers who prefer the current HSL behavior.

---

## REC-8: Config file format and migration

### Current: Flat config with `additionalProperties: false`

Adding new options requires schema changes. Existing config files will fail validation if they don't match the new schema.

### Recommendation: Schema versioning

Add a `version` field to config:
```json
{
  "$schema": "./node_modules/autotheme/schema.json",
  "version": 2,
  "color": "#6439FF",
  "harmony": "triadic"
}
```

Version 1 = current flat config. Version 2 = new nested config. The loader can detect version and apply appropriate defaults/validation. Since breaking changes are fine, version 1 support can be a simple error message: "Please update your config to version 2 format."

---

## REC-9: Noise texture - keep, improve, or remove?

### Current state

Generates an inline SVG fractal noise texture as a CSS `url()` value. Frequency hardcoded at 0.7.

### Options

1. **Keep as-is** - It works, it's optional
2. **Make configurable** - Frequency, octaves, type, opacity
3. **Remove** - Not core to a color theme generator

### Recommendation: Keep, make frequency configurable

Noise is useful for dark UIs (adds texture). Keep it behind `noise: true`, add `noiseFrequency` option. Don't over-engineer with octaves/type - one knob is enough.

---

## REC-10: What to do with presets

### Current: 10 presets (ocean, sunset, forest, etc.)

Presets only set `color` + `harmony`. With the new config shape, presets could be much more powerful.

### Recommendation: Expand presets to cover full config

A preset like "dashboard-dark" could set:
```json
{
  "color": "#1E6091",
  "harmony": "analogous",
  "mode": "dark",
  "semantics": { "enabled": true, "darkness": 0.10, "textLevels": 5 },
  "typography": { "base": 0.875, "ratio": 1.125 },
  "spacing": { "base": 0.25 }
}
```

This makes presets genuinely useful starting points rather than just color pickers. The existing presets would be preserved with updated config shapes.
