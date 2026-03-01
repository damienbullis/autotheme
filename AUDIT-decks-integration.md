# Autotheme Audit: Decks Integration

An audit of how the `decks` presentation framework uses autotheme, where autotheme falls short, and what changes would close the gaps.

## Current Utilization

Decks uses autotheme to generate `lib/theme.css` and per-deck `theme.css` files. Of the ~258 CSS variables autotheme outputs, decks uses **19** (the custom bridge layer) plus **3 raw palette values** from the JS API.

### What decks actually consumes from autotheme

| Used | How |
|------|-----|
| `palette.palettes[N].base` | Raw harmony colors for `--accent` / `--accent-sub` |
| `palette.palettes[N].base.oklch.h` | Primary hue — tints all hand-computed surfaces/text |
| `palette.palettes[N].tones[1]` | One desaturated tone for gray variants |
| `formatOklch()` | Formatting utility |

### What decks ignores (~239 vars of deadweight per theme file)

| Section | Var count | Why unused |
|---------|-----------|------------|
| Shadcn semantic vars (--primary, --card, --muted, etc.) | ~40 | Light-mode defaults are white; dark-mode doesn't go dark enough |
| Material 3 tokens (--surface, --container, --outline) | ~30 | Surface hierarchy too bright for ultra-dark aesthetic |
| Color scales (--color-primary-50 through -950, x4) | ~76 | Decks needs alpha overlays, not solid swatches |
| Typography scale (--text-xs through --text-4xl) | 8 | Starts at 1.0rem; slides need 0.55-1.6rem range |
| Spacing scale (--spacing-1 through --spacing-10) | 10 | Golden ratio from 0.155rem overshoots; slides define own scale |
| Dark mode overrides (.dark {...}) | ~60 | Decks is always dark; no toggle needed |
| Gradient vars + utility classes | ~15 | Not used |

---

## Gap Analysis

### 1. The "Full Stop Darker" Problem

Autotheme's dark mode surfaces:

```
--surface (dark):          L=0.208
--surface-dim:             L=0.165
--surface-container-low:   L=0.190
--surface-container:       L=0.251
--surface-container-high:  L=0.289
```

What decks needs:

```
--bg:          L=0.100   (darkest surface)
--bg-elevated: L=0.120   (card/elevated)
--border:      L=0.180   (borders)
--border-hover:L=0.230   (interactive borders)
--line:        L=0.320   (structural lines)
```

The entire dark-mode surface hierarchy is shifted ~0.08-0.10L too bright. Decks operates in an ultra-dark range (L=0.10-0.12 for backgrounds) that autotheme's dark mode doesn't reach. The darkest surface autotheme generates is `--surface-dim` at L=0.165, which is brighter than decks' *borders*.

**Fix:** Add a `darkness` or `surfaceLevel` config option that shifts the entire dark-mode surface range. A value like `darkness: 0.10` would anchor the darkest surface at L=0.10 and space the hierarchy from there.

### 2. Binary Text Hierarchy

Autotheme dark mode provides exactly 2 text levels:

```
--foreground:       L=1.000  (pure white)
--muted-foreground: L=1.000  (also pure white!)
```

Decks needs 5 distinct levels:

```
--text:        L=0.88  (main text — not pure white, slightly warm)
--text-bright: L=0.82  (emphasis — subtly chromatic)
--text-body:   L=0.72  (body copy — readable but recessive)
--text-dim:    L=0.52  (secondary info — clearly subordinate)
--text-muted:  L=0.42  (labels, metadata — quiet)
```

Two of these nearly match existing autotheme vars (`--text-dim` ≈ `--outline` at L=0.54, `--text-muted` ≈ `--outline-variant` at L=0.41), but the top 3 levels have no equivalents.

**Fix:** Generate a text hierarchy with configurable depth. Could be as simple as `textLevels: 5` producing `--text-1` through `--text-5` spaced evenly across the legible range for the given surface darkness. Or expose named semantic levels: `--text`, `--text-secondary`, `--text-tertiary`, `--text-quaternary`, `--text-muted`.

### 3. Typography Scale Doesn't Fit Dense Content

Current autotheme typography scale (`fontSize: 1`, `scalar: 1.618`):

```
--text-xs:  1.000rem
--text-sm:  1.618rem
--text-md:  2.618rem
--text-lg:  4.236rem
--text-xl:  6.854rem
...
```

What decks needs (dense slide content, 0.55-1.6rem range):

```
--fs-2xs:  0.55rem
--fs-xs:   0.62rem
--fs-sm:   0.70rem
--fs-base: 0.80rem
--fs-md:   0.90rem
--fs-lg:   1.05rem
--fs-xl:   1.60rem
```

The `fontSize` config exists but it's a simple multiplier on the scale. Setting `fontSize: 0.55` would get the bottom right, but the golden ratio (1.618) blows up too fast — step 3 would already be 1.44rem. Decks uses a ratio closer to 1.13 (major second).

**Fix:** Either:
- (a) Make `scalar` apply separately to spacing vs typography (currently shared), or add a `typeRatio` option
- (b) Add a `typeScale` config: `{ base: 0.55, ratio: 1.13, steps: 7 }` for full control
- (c) At minimum, let `fontSize` set the base AND accept a separate ratio

### 4. Spacing Scale Mismatch

Current autotheme spacing (`scalar: 1.618`, base hardcoded to 0.155rem):

```
--spacing-1:  0.155rem    (decks --sp-1: 0.10rem)
--spacing-2:  0.251rem    (decks --sp-3: 0.25rem — close!)
--spacing-3:  0.406rem    (decks --sp-4: 0.40rem — close!)
--spacing-4:  0.657rem    (decks --sp-5: 0.65rem — close!)
--spacing-5:  1.062rem    (overshoots --sp-7: 1.25rem)
--spacing-6:  1.719rem    (overshoots --sp-8: 2.00rem)
--spacing-7:  2.781rem    (no decks equivalent)
```

The golden ratio spacing actually lines up reasonably well at steps 2-4, but:
- The base (0.155rem) is too large for micro spacing (decks needs 0.10rem)
- There's no "tight" step between 0.155 and 0.251 (decks has --sp-2: 0.15rem)
- It grows too fast after step 4

**Fix:** Allow configuring the spacing base: `spacingBase: 0.10`. Optionally allow a different ratio than the typography scalar.

### 5. Alpha Overlays vs Solid Colors

Decks' diagram color system uses alpha overlays on the base color:

```css
--purple-bg:     oklch(0.695 0.152 293 / 7%);    /* 7% alpha */
--purple-border: oklch(0.695 0.152 293 / 22%);   /* 22% alpha */
--purple-glow:   oklch(0.695 0.152 293 / 4%);    /* 4% alpha */
```

This is fundamentally different from autotheme's approach of generating solid swatches at different lightness levels (50-950 scale). The alpha approach means the dark background shows through, creating depth. Solid swatches don't achieve this effect.

**Fix:** Consider adding a `variants` or `alphaVariants` option that generates `-bg` (7%), `-border` (22%), `-glow` (4%) variants for each harmony color using alpha transparency instead of (or in addition to) the solid scale. This is a common pattern in dark UI systems.

### 6. No "Always Dark" Mode

Autotheme always generates both light (`:root`) and dark (`.dark`) blocks. Decks is permanently dark — the light-mode block and the `.dark` selector are both wasted. The dark-mode values aren't even directly usable (too bright, wrong hierarchy).

**Fix:** Add a `mode: "dark" | "light" | "both"` config option. When `"dark"`, output only the dark variant under `:root` (no `.dark` selector needed). This alone would cut the output roughly in half.

### 7. No Way to Disable Sections Granularly

Current toggles: `shadcn`, `gradients`, `spacing`, `noise`, `utilities`.

Always-emitted (no toggle): semantic tokens, color scales, typography, dark mode CSS.

For a consumer like decks that doesn't use semantic tokens or color scales, there's no way to slim the output. Decks would ideally only emit: color scales (for the diagram layer opt-in) + spacing + the bridge layer it appends.

**Fix:** Add toggles for `semanticTokens` (the MD3-style surface/container/outline system), `colorScales` (the 50-950 Tailwind scales), `typography` (the --text-* scale), and `darkMode` (the .dark block). This lets consumers build minimal outputs.

---

## What Autotheme Could Provide Directly (If Fixed)

If the above gaps were closed, decks' `buildBridgeLayer()` could shrink from 40 lines of hand-computed OKLCH to something like:

```typescript
// Hypothetical — autotheme does the work
const config = {
  color: "#7aa2f7",
  harmony: "square",
  mode: "dark",
  darkness: 0.10,           // anchor darkest surface
  textLevels: 5,            // 5-level text hierarchy
  typeScale: { base: 0.55, ratio: 1.13, steps: 7 },
  spacingBase: 0.10,
  alphaVariants: true,      // generate -bg/-border/-glow
  shadcn: false,
  semanticTokens: false,
  gradients: false,
  utilities: false,
};
```

And the bridge layer would just alias:

```css
--bg: var(--surface);
--accent: var(--primary);
--accent-sub: var(--secondary);
--text: var(--text-1);
--text-bright: var(--text-2);
/* etc. */
```

Instead of computing every single surface/text/structural value from raw hue angles.

---

## Compatibility Note

These changes should be **additive and backwards-compatible**. The defaults stay the same (MD3-style, light+dark, golden ratio, current surface levels). The new options only activate when explicitly set. Existing consumers (Shadcn-based apps) see no change.

---

## Priority Order

1. **`mode: "dark"`** — biggest bang, cuts output in half, trivial to implement
2. **`darkness` / surface level control** — fixes the fundamental mismatch
3. **`textLevels`** — replaces binary foreground/muted with a real hierarchy
4. **Section toggles** (`semanticTokens`, `colorScales`, `darkMode`)  — lets consumers slim output
5. **`alphaVariants`** — generates -bg/-border/-glow from base colors
6. **Typography `typeScale`** — separate base/ratio from spacing
7. **Spacing `spacingBase`** — configurable starting point
