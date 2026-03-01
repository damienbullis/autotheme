# Bugs & Incorrect Behavior

Issues where the current code produces wrong or misleading output.

---

## BUG-1: Dark mode `--muted-foreground` is pure white (same as `--foreground`)

**Location:** `src/generators/semantic.ts` (dark mode generation)

**Problem:** Both `--foreground` and `--muted-foreground` resolve to L=1.000 in dark mode. "Muted" foreground should be visually subordinate to primary foreground, but they're identical. This defeats the purpose of having a muted variant.

**Expected:** `--muted-foreground` should be noticeably dimmer (e.g., L=0.65-0.75).

**Impact:** Any consumer relying on `--muted-foreground` for secondary text gets the same visual weight as primary text.

---

## BUG-2: Dark mode surfaces are too bright for dark UIs

**Location:** `src/generators/semantic.ts` (dark mode surface generation)

**Problem:** The darkest surface (`--surface-dim`) has L=0.165. For dark-first UIs (Decks, code editors, dashboards), backgrounds need L=0.08-0.12. The entire surface hierarchy is shifted ~0.08L too bright.

```
Current dark surfaces:
  --surface:                L=0.208
  --surface-dim:            L=0.165  <- "darkest" is brighter than most app borders
  --surface-container:      L=0.251
  --surface-container-high: L=0.289

What dark UIs need:
  background:    L=0.08-0.12
  elevated:      L=0.12-0.16
  borders:       L=0.18-0.22
```

**Impact:** Dark mode is unusable without hand-computing replacement values.

---

## BUG-3: Shadcn `--secondary` and `--accent` map to containers, not base colors

**Location:** `src/generators/shadcn.ts`

**Problem:**
```typescript
secondary: semantic.secondaryContainer  // Should be semantic.secondary
accent: semantic.accentContainer        // Should be semantic.accent
```

The Shadcn `--secondary` token maps to `secondaryContainer` (a desaturated tint), not the actual secondary color. This means `bg-secondary` in Shadcn gives you a washed-out container color instead of the harmony secondary. Same issue with `--accent`.

**Expected:** `--secondary` should be the secondary harmony color. Container variants should be separate tokens.

---

## BUG-4: Drift harmony uses mathematically questionable formula

**Location:** `src/core/harmonies.ts`

**Problem:** The drift harmony calculates offsets as `((i * Math.PI / 6) * 90)` degrees. This mixes radians (PI/6) with degrees (90), producing offsets of [0, 47.1, 94.2, 141.4]. While it produces an interesting spread, the formula appears accidental rather than intentional. If the intent is an exponential spiral, the formula should be documented or corrected.

---

## BUG-5: Swing modifies primary color (index 0)

**Location:** `src/core/harmonies.ts` - `applySwing()`

**Problem:** Swing is applied to all harmony colors including the primary (index 0). Since primary's offset is 0, `0 * swing = 0` so it's harmless for linear strategy, but for alternating strategy `0 / swing` is still 0. However, the conceptual issue remains: swing should only modify non-primary offsets. This could cause unexpected behavior with custom harmonies where index 0 has a non-zero offset.

---

## BUG-6: Typography scale starts at base, not at smallest size

**Location:** `src/generators/css.ts`

**Problem:** The typography scale applies the scalar starting from `fontSize` upward:
```
--text-xs:  fontSize * scalar^0 = base
--text-sm:  fontSize * scalar^1
--text-md:  fontSize * scalar^2
...
```

With defaults (`fontSize: 1`, `scalar: 1.618`), `--text-xs` = 1.0rem and `--text-sm` = 1.618rem. There's no way to generate sizes smaller than `fontSize`. For dense UIs needing 0.55-0.8rem sizes, the scale is unusable.

**Expected:** Scale should center around `fontSize` or allow descending steps.

---

## BUG-7: Spacing base is hardcoded

**Location:** `src/generators/css.ts`

**Problem:** Spacing base is hardcoded to `0.155rem` regardless of config. The config has no `spacingBase` option. The `scalar` applies but the starting point can't be changed.

```typescript
// Hardcoded in css.ts
const spacingBase = 0.155;
```

**Impact:** Consumers needing micro-spacing (0.1rem) or larger base spacing can't adjust without editing generated output.

---

## BUG-8: `formatOklch` precision may cause rounding issues

**Location:** `src/core/conversions.ts`

**Problem:** OKLCH values are formatted to 3 decimal places. While browsers handle this fine, values like `oklch(0.695 0.152 293)` can round differently across engines. Not a critical bug, but worth noting for consistency.

---

## BUG-9: Color parser doesn't support modern CSS color syntax

**Location:** `src/core/parse.ts`

**Problem:** Parser supports `rgb(255, 128, 64)` but not `rgb(255 128 64)` (space-separated, modern CSS). Same for HSL. Since autotheme outputs OKLCH (a modern format), input parsing should also accept modern syntax.

---

## BUG-10: Error color hue logic is fragile

**Location:** `src/generators/semantic.ts`

**Problem:** Error hue is determined by a simple conditional:
```typescript
if (primaryHue < 40 || primaryHue > 340) errorHue = 0;
else errorHue = 15;
```

This means if your primary color IS red (hue ~0-15), the error color is also red, making errors indistinguishable from the primary theme color. Error should always have sufficient hue distance from the primary.
