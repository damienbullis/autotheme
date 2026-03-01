# New Features Needed

Capabilities that don't exist today and are required for autotheme to serve real consumers.

---

## FEAT-1: Mode control (`mode: "dark" | "light" | "both"`)

**Priority:** Critical

**Problem:** AutoTheme always generates both light (`:root`) and dark (`.dark`) blocks. Consumers that are permanently dark (Decks) or permanently light waste half the output and can't use the dark values directly under `:root`.

**Specification:**
- `mode: "light"` - Only `:root` block, light values
- `mode: "dark"` - Only `:root` block, dark values (no `.dark` selector)
- `mode: "both"` (default) - Current behavior: `:root` for light, `.dark` for dark

**Implementation:** Conditional in CSS generator. When `mode: "dark"`, the dark semantic values are emitted under `:root` instead of `.dark`.

---

## FEAT-2: Surface depth control (`darkness` parameter)

**Priority:** Critical

**Problem:** Dark mode surfaces are hardcoded at fixed lightness values (L=0.165-0.289). Dark UIs need much darker surfaces (L=0.08-0.12). There's no way to shift the surface hierarchy.

**Specification:**
```typescript
semantics: {
  darkness: 0.10  // Anchor the darkest surface at this OKLCH lightness
}
```

The surface hierarchy spaces upward from the anchor:
```
surface-dim:            darkness                    (0.10)
surface:                darkness + 0.02             (0.12)
surface-container-low:  darkness + 0.04             (0.14)
surface-container:      darkness + 0.06             (0.16)
surface-container-high: darkness + 0.08             (0.18)
surface-bright:         darkness + 0.12             (0.22)
```

The spacing between levels should also be configurable or follow a ratio.

---

## FEAT-3: Text hierarchy with configurable depth

**Priority:** Critical

**Problem:** Dark mode has 2 text levels (foreground + muted-foreground, both pure white). Real UIs need 3-5 levels for proper visual hierarchy.

**Specification:**
```typescript
semantics: {
  textLevels: 5  // Generate 5 text hierarchy levels
}
```

Output:
```css
--text-1: oklch(0.93 0.01 250);   /* Primary text - not pure white, slightly warm */
--text-2: oklch(0.85 0.015 250);  /* Emphasis text */
--text-3: oklch(0.72 0.01 250);   /* Body copy */
--text-4: oklch(0.55 0.008 250);  /* Secondary info */
--text-5: oklch(0.42 0.005 250);  /* Muted labels */
```

Text colors should:
- Be tinted with the primary hue (not pure gray)
- Be spaced evenly across the legible range for the given surface darkness
- All meet minimum contrast requirements against the darkest surface
- Decrease in chroma as they get dimmer (more neutral at low lightness)

---

## FEAT-4: Alpha/opacity variants

**Priority:** High

**Problem:** AutoTheme generates solid color swatches (50-950). Dark UIs frequently need alpha overlays where the background shows through, creating depth:

```css
--primary-bg:     oklch(0.695 0.152 293 / 7%);     /* Subtle background tint */
--primary-border: oklch(0.695 0.152 293 / 22%);    /* Border with depth */
--primary-glow:   oklch(0.695 0.152 293 / 4%);     /* Subtle glow/shadow */
```

**Specification:**
```typescript
palette: {
  alphaVariants: true  // Generate alpha variants per harmony color
  alphaSteps?: { bg: 0.07, border: 0.22, glow: 0.04 }  // Configurable
}
```

Output per harmony color:
```css
--color-primary-bg:     oklch(L C H / 7%);
--color-primary-border: oklch(L C H / 22%);
--color-primary-glow:   oklch(L C H / 4%);
--color-primary-hover:  oklch(L C H / 12%);
```

---

## FEAT-5: Independent typography scale configuration

**Priority:** High

**Problem:** Typography uses the same `scalar` as spacing (1.618 golden ratio). This is way too aggressive for type - step 3 is already 4.2rem. Real type scales use ratios like 1.067 (minor second) to 1.333 (perfect fourth).

**Specification:**
```typescript
typography: {
  enabled: true,
  base: 1,          // Base size in rem
  ratio: 1.125,     // Major second (common web ratio)
  steps: 7,         // Number of steps
  names?: ["2xs", "xs", "sm", "base", "md", "lg", "xl"],  // Custom names
  values?: [0.55, 0.62, 0.70, 0.80, 0.90, 1.05, 1.60],   // Full manual override
}
```

When `values` is provided, it takes precedence over `base`/`ratio`/`steps`.

The scale should center around `base` with steps going both smaller and larger:
```
steps below base: floor(steps / 2)
steps above base: ceil(steps / 2)
```

---

## FEAT-6: Independent spacing scale configuration

**Priority:** High

**Problem:** Spacing base is hardcoded (0.155rem) and uses the same ratio as typography.

**Specification:**
```typescript
spacing: {
  enabled: true,
  base: 0.25,       // Base spacing in rem (Tailwind default)
  ratio: 2,         // Double each step
  steps: 10,
  values?: [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 6],  // Manual override
}
```

Same override behavior as typography: `values` takes full precedence.

---

## FEAT-7: Granular section toggles

**Priority:** High

**Problem:** Several sections always emit with no way to disable them: semantic tokens, color scales, typography, dark mode CSS.

**Specification:** Every section becomes independently toggleable:

```typescript
{
  // Already exist
  gradients: boolean,
  spacing: boolean,     // Now part of spacing.enabled
  noise: boolean,
  utilities: boolean,

  // New toggles
  colorScales: boolean,   // 50-950 scales (default: true)
  semantics: boolean,     // Semantic token layer (default: false)
  typography: boolean,    // Now part of typography.enabled
  shadcn: boolean,        // Shadcn bindings (default: false)
}
```

**Key change:** `semantics` and `shadcn` default to **false**. Users opt in.

---

## FEAT-8: Semantic token palette mapping rules

**Priority:** Medium

**Problem:** Semantic tokens should intelligently select from the generated palette, not compute independent colors. For example, `--surface` should reference a specific shade from the primary palette, not a separately calculated color.

**Specification:** The semantic layer should follow design principles:

**60/30/10 Rule:**
- 60% of the UI uses the primary neutral surface
- 30% uses the secondary color (subtle accents)
- 10% uses the accent/tertiary (calls to action, highlights)

**Swatch Selection Rules (configurable):**
```typescript
semantics: {
  mapping: {
    surface: "primary-950",       // Darkest shade for dark mode bg
    surfaceElevated: "primary-900",
    border: "primary-800",
    borderSubtle: "primary-700",
    textPrimary: "primary-100",
    textSecondary: "primary-300",
    textMuted: "primary-400",
    accent: "secondary-500",      // Base secondary as accent
    accentSubtle: "secondary-800",
  }
}
```

This makes the semantic layer a transparent mapping from palette to role, not a black box of color computation.

---

## FEAT-9: Shadow scale

**Priority:** Medium

**Problem:** Shadows are a key part of visual depth systems (especially in light mode). AutoTheme doesn't generate any shadow variables. Consumers create their own, often inconsistently.

**Specification:**
```typescript
shadows: {
  enabled: boolean,
  base: "0 1px 2px",           // Smallest shadow
  ratio: 1.5,                  // Growth factor
  steps: 5,
  color: "primary",            // Use primary hue for shadow tint
  values?: string[],           // Manual override
}
```

Output:
```css
--shadow-1: 0 1px 2px oklch(0.1 0.01 250 / 8%);
--shadow-2: 0 2px 4px oklch(0.1 0.01 250 / 10%);
--shadow-3: 0 4px 8px oklch(0.1 0.01 250 / 12%);
--shadow-4: 0 8px 16px oklch(0.1 0.01 250 / 14%);
--shadow-5: 0 16px 32px oklch(0.1 0.01 250 / 16%);
```

---

## FEAT-10: Border radius scale

**Priority:** Low

**Problem:** Only a single `--radius` value exists (for Shadcn). Design systems typically have a radius scale.

**Specification:**
```typescript
radii: {
  enabled: boolean,
  base: 0.5,           // rem
  ratio: 1.5,
  steps: 5,
  values?: number[],   // Manual override
}
```

Output:
```css
--radius-1: 0.125rem;
--radius-2: 0.25rem;
--radius-3: 0.5rem;
--radius-4: 0.75rem;
--radius-5: 1rem;
```

---

## FEAT-11: Color format option

**Priority:** Low

**Problem:** All output is OKLCH. Some consumers may want HSL or RGB for compatibility with older browsers or specific tooling.

**Specification:**
```typescript
output: {
  colorFormat: "oklch" | "hsl" | "rgb" | "hex"  // Default: "oklch"
}
```

---

## FEAT-12: Dry run / preview mode

**Priority:** Low

**Problem:** No way to see what autotheme will generate without writing files.

**Specification:** `--dry-run` flag that outputs to stdout what would be written. Already partially exists via `--stdout` but only for CSS, not for all outputs.
