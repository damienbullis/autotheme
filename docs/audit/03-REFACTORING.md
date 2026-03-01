# Refactoring Needed

Architecture and code structure improvements. These aren't bugs but design decisions that limit flexibility and should be reworked.

---

## REFACTOR-1: Decouple semantic tokens from MD3

**Location:** `src/generators/semantic.ts`

**Problem:** The semantic token system is a direct implementation of Material Design 3's color system (surface, surface-container, surface-container-high, etc.). AutoTheme is not a Material library. These tokens should be replaced with autotheme's own semantic system that maps palette swatches to roles using configurable design rules.

**Current:** MD3 tokens hardcoded with fixed lightness/saturation values
**Proposed:** Semantic layer that selects from the generated palette based on configurable rules (which swatch for surfaces, which for borders, which for text)

**Breaking change:** Yes. MD3 token names will change or be removed.

---

## REFACTOR-2: Separate palette generation from CSS generation

**Location:** `src/generators/css.ts`, `src/generators/semantic.ts`

**Problem:** CSS generation mixes palette output with semantic token generation. These should be two distinct phases:

1. **Palette phase** (pure data): Generate color scales, text colors, variations
2. **Semantic phase** (mapping): Map palette entries to semantic roles
3. **Output phase** (formatting): Convert to CSS, Tailwind, etc.

Currently `css.ts` calls into `semantic.ts` which recalculates colors from scratch instead of using the palette that was already generated. This means the semantic tokens may not exactly match the palette scales.

---

## REFACTOR-3: Make all generators truly optional

**Location:** `src/generators/css.ts`

**Problem:** Several sections always emit regardless of config:

- Semantic tokens (no toggle)
- Color scales (no toggle)
- Typography scale (no toggle)
- Dark mode `.dark` block (no toggle)

**Proposed toggles:**

```typescript
{
  colorScales: boolean,     // 50-950 scales per harmony color
  semantics: boolean,       // Semantic token layer
  typography: boolean,      // --text-* scale
  darkMode: boolean | "only" | "both",  // Dark mode control
}
```

---

## REFACTOR-4: Independent scale configurations

**Location:** `src/generators/css.ts`, `src/config/types.ts`

**Problem:** Typography and spacing share the same `scalar` (1.618). These are fundamentally different concerns:

- Typography: Major second (1.125) to perfect fourth (1.333) ratios are common
- Spacing: Golden ratio (1.618) or powers of 2 are common

**Current config:**

```typescript
scalar: 1.618; // Used for BOTH typography and spacing
fontSize: 1; // Typography base only
// spacing base: hardcoded 0.155rem
```

**Proposed config:**

```typescript
typography: {
  base: 1,          // rem
  ratio: 1.125,     // Scale ratio
  steps: 7,         // Number of steps
  values?: number[] // Manual override per step
}
spacing: {
  base: 0.25,       // rem
  ratio: 2,         // Scale ratio
  steps: 10,        // Number of steps
  values?: number[] // Manual override per step
}
```

---

## REFACTOR-5: Remove MD3 as the semantic foundation

**Location:** `src/generators/semantic.ts`, `src/generators/shadcn.ts`

**Problem:** The current dependency chain is:

```
Palette -> MD3 Semantic Tokens -> Shadcn Tokens
```

Shadcn tokens depend on MD3 tokens existing. But if a consumer wants Shadcn without MD3 (which is the common case), they still get all the MD3 baggage.

**Proposed:**

```
Palette -> AutoTheme Semantic Tokens
              |
              +-> Shadcn Binding (maps AT semantics to Shadcn names)
```

AutoTheme's own semantic system replaces MD3 entirely. Shadcn binding maps directly from autotheme semantics, not from MD3.

---

## REFACTOR-6: Variation generation should use configurable parameters

**Location:** `src/core/variations.ts`

**Problem:** Tints, shades, and tones have hardcoded counts and increments:

```typescript
generateTints(color, (steps = 5)); // +10% lightness per step
generateShades(color, (steps = 5)); // -10% lightness per step
generateTones(color, (steps = 4)); // -20% saturation per step
```

The 10%/10%/20% increments are baked in. The mapping to scale numbers (50-950) is baked into `css.ts`. Neither is configurable.

**Proposed:** Accept increment as parameter. Allow the scale mapping (which index = which CSS number) to be configurable or at least well-documented.

---

## REFACTOR-7: Clean up the Tailwind generator

**Location:** `src/generators/tailwind.ts`

**Problem:** The Tailwind generator:

1. Embeds the entire CSS output at the top (duplicating all variables)
2. Then wraps semantic tokens in `@theme { }`
3. Has prefix-remapping logic that's redundant when prefix is "color"
4. Includes all Shadcn mappings even when Shadcn is disabled

The generator should be thinner: just the `@theme` directive wrapping whatever CSS was already generated.

---

## REFACTOR-8: Consolidate dark mode handling

**Location:** `src/generators/dark-mode.ts`, `src/generators/semantic.ts`, `src/generators/shadcn.ts`, `src/generators/css.ts`

**Problem:** Dark mode logic is scattered across 4 files:

- `dark-mode.ts`: Generates `.dark` overrides for foreground/contrast only
- `semantic.ts`: Has its own `generateDarkSemanticColors()` with independent logic
- `shadcn.ts`: Has dark-specific Shadcn mappings
- `css.ts`: Orchestrates all of the above

Each file makes independent decisions about dark mode values. There's no single source of truth for "what does dark mode look like."

**Proposed:** Single dark mode configuration that controls all dark values from one place.

---

## REFACTOR-9: Accessible text color generation is too conservative

**Location:** `src/core/contrast.ts`

**Problem:** `findAccessibleTextColor()` targets 7:1 (AAA) by default and only searches grayscale. This almost always returns pure white or pure black, which is technically accessible but visually boring. Many design systems use chromatic text (slight tint from the theme color) at AA (4.5:1) for a more cohesive feel.

**Proposed:**

- Default to AA (4.5:1) for general text, AAA (7:1) for small text
- Search chromatic alternatives (same hue, adjusted lightness/saturation)
- Make the target configurable (already exists as `contrastTarget` but only used in one place)

---

## REFACTOR-10: Config schema should reflect the new layer architecture

**Location:** `src/config/types.ts`, `src/config/schema.ts`

**Problem:** Current config is a flat namespace of boolean toggles and numeric values. As we add features (typography config, spacing config, semantic mapping config), it will become unwieldy.

**Proposed:** Group related config into nested objects:

```typescript
interface AutoThemeConfig {
  color: string;
  harmony: HarmonyType | string;
  mode: "light" | "dark" | "both";

  palette: {
    tints: number; // count
    shades: number; // count
    tones: number; // count
    alphaVariants: boolean;
  };

  semantics: {
    enabled: boolean;
    preset: "default" | "shadcn" | "custom";
    darkness: number; // anchor darkest surface (0-1)
    textLevels: number; // text hierarchy depth
  };

  typography: {
    enabled: boolean;
    base: number;
    ratio: number;
    steps: number;
    values?: number[];
  };

  spacing: {
    enabled: boolean;
    base: number;
    ratio: number;
    steps: number;
    values?: number[];
  };

  output: {
    path: string;
    format: "css" | "tailwind";
    preview: boolean;
    darkModeScript: boolean;
  };
}
```
