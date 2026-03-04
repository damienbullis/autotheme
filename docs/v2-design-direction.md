# AutoTheme v2 — API Design Direction

Status: **Design direction established.** Not yet implemented. Use this document as the source of truth when updating milestone plans and implementation specs.

## Core Philosophy

AutoTheme's value proposition is **one color → complete design system**. The API should make this feel inevitable, not configurable. The defaults ARE the product. Configuration exists for escape hatches, not as the primary interface.

**Primary use case is CLI.** Users run `autotheme "#7aa2f7"`, get a static CSS file, check it into their repo. No runtime dependency. The JS API is a secondary use case for programmatic consumers.

**Three levels of engagement:**

```bash
# Level 1: One color → CSS (80% of users)
autotheme "#7aa2f7"

# Level 2: Customize the design choices (15%)
autotheme "#7aa2f7" --harmony triadic --mode dark --spacing

# Level 3: Full parametric control via config file (5%)
autotheme --config autotheme.json
```

Each level is complete. No level requires understanding the level above it.

## Key Design Decisions

### 1. `boolean | Config` pattern everywhere

Replace all `{ enabled: boolean, ...params }` with `boolean | ConfigObject`.

```jsonc
// OFF
{ "spacing": false }        // or just omit it

// ON with defaults
{ "spacing": true }

// ON with customization
{ "spacing": { "base": 0.5, "steps": 12 } }
```

No more `enabled` flags. This matches Tailwind, Vite, ESLint conventions.

### 2. Semantics ON by default

Semantic tokens (surfaces, borders, text hierarchy, accents) are the core value. They generate by default — no opt-in required. `semantics: false` is the escape hatch for library authors who only want the raw palette.

### 3. Single generation pipeline — perceptual OKLCH

Drop the HSL contrast-mode pipeline entirely. The perceptual OKLCH pipeline is the only generation mode. No `mode: "contrast" | "perceptual"` switch.

- Generation is OKLCH-native via `Color.fromOklch()`
- No HSL round-trips in the semantic generator
- Accessibility checking is a separate validation/fixing layer (see section below), not a generation driver

### 4. Depth as the primary semantic abstraction

`depth` is the OKLCH lightness value for the base surface. Everything else (surfaces, borders, text, tinted surfaces, elevation) derives from it.

**Depth is optional.** When omitted, derived from mode:

- `mode: "dark"` → depth ≈ 0.13
- `mode: "light"` → depth ≈ 0.97
- `mode: "both"` → both values derived

Most users never set depth. The ones who do are choosing "how dark is my dark theme" — a single meaningful knob.

The full derivation chain:

```
color (hue/chroma) ─┐
                    ├──→ depth ──→ --surface (L = depth)
mode ───────────────┘              --surface-sunken (L = depth - sunkenDelta)
                                   │
                                   ├──→ borders (L = depth + offsets)
                                   ├──→ tinted surfaces (depth + delta, harmony hues)
                                   └──→ elevation surfaces (depth + N*elevationDelta)

                                   text hierarchy: independent L range (anchor → floor)
                                   accents: direct refs to palette colors
                                   states: pure deltas, no dependency on depth
```

### 5. Harmony colors fully integrated into semantics

**Problem identified:** The current semantic system barely uses the harmony. Surfaces, borders, and text all derive from primary hue only. Secondary/tertiary/quaternary colors get 1 token (`--accent-secondary`) or nothing.

**Solution — three layers of harmony integration:**

**Accent system (expanded):** Every harmony color gets a token pair (base + foreground). The number of pairs scales with the harmony — analogous (3) gets 3 pairs, square (4) gets 4. Values are direct OKLCH (not var references — the 50-950 scale doesn't exist by default).

```css
--accent: oklch(0.65 0.15 250);
--accent-foreground: oklch(0.98 0.01 250);
--accent-secondary: oklch(0.65 0.12 220);
--accent-secondary-foreground: oklch(0.98 0.01 220);
--accent-tertiary: oklch(0.65 0.1 280);
--accent-tertiary-foreground: oklch(0.98 0.01 280);
```

**Tinted surfaces (new concept):** Each harmony color produces a low-chroma surface variant — a tinted background for cards, sections, callouts. This bridges palette → semantics in a meaningful way.

```css
--surface-primary: oklch(0.16 0.025 250);
--surface-primary-foreground: oklch(0.85 0.04 250);
--surface-secondary: oklch(0.16 0.025 130);
--surface-secondary-foreground: oklch(0.85 0.04 130);
--surface-tertiary: oklch(0.16 0.025 10);
--surface-tertiary-foreground: oklch(0.85 0.04 10);
```

These use:

- **L:** depth + elevatedDelta (same lightness as a raised surface)
- **C:** tint chroma — derived from primary chroma scaled down (~15% of full), or configurable
- **H:** each harmony color's actual hue

This is Material Design 3's "container" concept without the jargon. Lets you make selected items, info cards, feature highlights using harmony colors at a surface-appropriate intensity.

**Neutral system (unchanged):** Surfaces, borders, text still use primary hue at near-zero chroma. This is correct — neutrals should be neutral.

### 6. States design — modifier tokens

States are relative modifications, not new colors. They produce universal deltas that apply to any color token.

```css
--state-hover: 0.04; /* L delta */
--state-active: -0.02; /* L delta */
--state-disabled-opacity: 0.4;
--focus-ring-color: var(--accent);
--focus-ring-width: 2px;
--focus-ring-offset: 2px;
```

Applied via relative color syntax at consumption time:

```css
.btn:hover {
  background: oklch(from var(--accent) calc(l + var(--state-hover)) c h);
}
```

**Why modifiers, not resolved variants:** Avoids token explosion (every color × every state). Constant token count regardless of palette size. Composes with any color including user-defined ones.

**Hover delta sign flips automatically** between light/dark mode — lighten on hover in dark mode, darken in light mode.

Config:

```jsonc
{ "states": true }
// or
{ "states": { "hover": 0.04, "active": -0.02 } }
```

States are OFF by default (opt-in).

### 7. Elevation design — extends depth upward

Elevation unifies with the surface system. Drop `--surface-elevated` as a standalone concept — the "raised" direction becomes the elevation scale.

**Dark mode elevation (decided):**

Surface lightness does the heavy lifting (shadows are less visible against dark backgrounds). Each level adds an L delta from depth:

```css
/* Base (from depth) */
--surface: oklch(0.13 0.01 250);
--surface-sunken: oklch(0.11 0.01 250);

/* Elevation scale (raised direction) */
--elevation-1: oklch(0.16 0.01 250);
--elevation-1-shadow: 0 1px 3px oklch(0.13 0.005 250 / 0.12), ...;
--elevation-2: oklch(0.19 0.01 250);
--elevation-2-shadow: 0 3px 6px oklch(0.13 0.005 250 / 0.16), ...;
--elevation-3: oklch(0.22 0.01 250);
--elevation-3-shadow: 0 10px 20px oklch(0.13 0.005 250 / 0.2), ...;
```

**Light mode elevation (explore — pick one):**

In light mode, surfaces are already bright. Elevation needs a different strategy.

**Option A: Shadow-only.** All elevation surfaces stay the same color (near-white). Only shadows differentiate levels. This is how most minimal light designs work — cards are all white, shadows show depth.

```css
--elevation-1: var(--surface); /* same surface color */
--elevation-1-shadow: 0 1px 3px oklch(0.5 0.005 250 / 0.08), ...;
--elevation-2: var(--surface);
--elevation-2-shadow: 0 3px 6px oklch(0.5 0.005 250 / 0.12), ...;
```

**Option B: Background vs. card model.** elevation-0 = the page (slightly off-white, tinted). elevation-1+ = pure/near-white. The jump from page to card IS the visual cue. Shadows add progressive depth on top. This is how Shadcn works: `--background` is off-white, `--card` is white.

```css
--surface: oklch(0.96 0.01 250); /* page — slightly tinted */
--elevation-1: oklch(0.99 0.005 250); /* card — near white */
--elevation-1-shadow: 0 1px 3px oklch(0.5 0.005 250 / 0.08), ...;
--elevation-2: oklch(0.99 0.005 250); /* same as 1 */
--elevation-2-shadow: 0 3px 6px oklch(0.5 0.005 250 / 0.12), ...;
```

**Option C: Subtle temperature shift.** Higher elevation surfaces shift very slightly warmer or cooler — not just lighter. A floating panel has a barely perceptible different temperature than the page. Apple does this with their floating panels.

```css
--elevation-1: oklch(0.99 0.005 250); /* neutral */
--elevation-2: oklch(0.99 0.006 245); /* slightly warmer */
--elevation-3: oklch(0.99 0.007 240); /* warmer still */
```

**Leaning:** Option B is the most practical and matches real-world patterns. The page/card distinction is universally understood. Options A and C could be offered as configuration variants.

**Tinted surfaces + elevation (explore — pick one):**

Question: does `--surface-primary` get elevation variants?

**Option A: No interaction — compose manually.** Tinted surfaces and elevation are independent. You pick one for the background, grab the shadow separately. No extra tokens.

```css
/* Regular elevated card */
.card {
  background: var(--elevation-1);
  box-shadow: var(--elevation-1-shadow);
}

/* Tinted card (with elevation shadow) */
.feature {
  background: var(--surface-primary);
  box-shadow: var(--elevation-2-shadow);
}
```

The shadow from elevation works with any background. Composable without extra tokens.

**Option B: Elevation variants per tinted surface.** Generate `--surface-primary-elevated`, etc. Produces correct lightness but causes token explosion (3 harmony × 4 levels = 12 extra tokens).

**Option C: CSS relative color syntax composition.** No extra tokens — consumer composes at use time:

```css
.feature:hover {
  background: oklch(from var(--surface-primary) calc(l + 0.03) c h);
}
```

Requires relative color syntax browser support.

**Leaning:** Option A. Elevation provides shadow + neutral surface. Tinted surfaces provide hue. Picking one for background and composing with elevation shadows manually is clean and avoids token explosion. This is the "you get building blocks, compose them" philosophy.

**Shared elevation details:**

- **Shadows are hue-tinted** — shadow color picks up primary hue at very low chroma (the polish detail that separates generated from hand-crafted)
- **Paired tokens:** `--elevation-N` (surface color) + `--elevation-N-shadow` (box-shadow value)

Config:

```jsonc
{ "elevation": true }
// or
{ "elevation": { "levels": 4, "delta": 0.03, "tintShadows": true } }
```

Elevation is OFF by default (opt-in). Derives from depth when enabled.

### 8. Palette output — semantic by default, scale opt-in

**The 50-950 scale is a Tailwind integration feature, not a default output.**

The current design generates 50-950 × every harmony color + foreground + contrast + tones. For analogous (3 colors) that's ~50+ CSS custom properties before semantics even starts. Most consumers never reference `--color-secondary-300` directly — they use semantic tokens.

If the semantic layer gives you surfaces, borders, text, accents, and tinted surfaces — the 50-950 scale adds raw material for **Tailwind utility classes** (`bg-primary-500`, `text-primary-200`). That's its primary consumer.

**Default palette output — harmony base colors only:**

```css
--color-primary: oklch(0.65 0.15 250);
--color-secondary: oklch(0.65 0.12 220);
--color-tertiary: oklch(0.65 0.1 280);
```

No scale numbers. No tints/shades/tones/alpha variants. Just the atoms — the actual colors the harmony produced. ~3-4 tokens depending on harmony type. These exist so consumers can reference the raw harmony colors for decorative use, custom gradients, brand elements — things that don't fit a semantic role.

Semantic tokens carry direct OKLCH values (not `var(--color-primary-500)` references) since the scale doesn't exist by default.

**Full scale — opt-in:**

Generated when `palette: true` (explicit) or `output.tailwind: true` (Tailwind needs the scale). Produces:

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
/* ... per harmony color */
```

When the full scale is active, accent tokens MAY become var references (`var(--color-primary-500)`) for Tailwind integration, or remain direct values. Implementation detail — either works.

**What `palette: true` controls:**

- 50-950 scale per harmony color
- Foreground + contrast per color
- Tones (desaturated variants)
- Alpha variants (if alphaVariants is also set)

**What `palette: false` / omitted gives you:**

- `--color-{name}` per harmony (just the base)
- Everything else comes from the semantic system

This keeps the zero-config output to ~25-30 tokens instead of 80+.

### 9. Accessibility as a checking/fixing layer

Accessibility is not a generation mode — it's a post-generation concern.

**CLI:**

```bash
autotheme "#7aa2f7" --check-contrast       # report issues
autotheme "#7aa2f7" --fix-contrast aa       # adjust tokens to meet AA
autotheme "#7aa2f7" --fix-contrast aaa      # adjust tokens to meet AAA
```

**JS API:**

```ts
const theme = createTheme("#7aa2f7");
const issues = checkContrast(theme, "aa"); // report
const fixed = fixContrast(theme, "aaa"); // clone with adjusted tokens
```

`fixContrast` walks the text hierarchy and nudges L values minimally to meet the target. Preserves perceptual intent as much as possible.

**Accessibility media queries** (`prefers-contrast`, `prefers-reduced-transparency`, `forced-colors`) move to output config — they're CSS output features, not generation parameters:

```jsonc
{
  "output": {
    "contrastMedia": true,
    "reducedTransparency": true,
    "forcedColors": true,
  },
}
```

### 10. Color format — keep as escape hatch in output

OKLCH is the default and the opinion. But the format escape hatch costs nothing to maintain (the code already supports all four formats) and removes a real adoption barrier.

```jsonc
{ "output": { "format": "oklch" } }  // default, usually omit
{ "output": { "format": "hsl" } }    // legacy escape hatch
```

CLI: `autotheme "#7aa2f7" --format hsl`

### 11. Typography — opt-in

Typography, spacing, shadows, radius, motion are all opt-in (`true` to enable). Keeps the zero-config output focused on palette + semantics.

### 12. `hueSource` removed from per-block config

The old spec gave surfaces, borders, and text each their own `hueSource` parameter. In practice it's always `"primary"`. The system uses primary hue everywhere. Overrides handle edge cases.

### 13. Text curve as exponent

`curve` is a number (exponent), not a string or bezier:

- `curve: 1` = linear (default)
- `curve: 0.5` = ease-out (levels cluster near bright end)
- `curve: 2` = ease-in (levels cluster near dim end)

Implementation: `t_curved = Math.pow(t, exponent)`. Trivial, covers every real use case.

### 14. Light mode mirroring

When `mode: "both"`, light mode values derived by reflecting OKLCH L around 0.5 (`1 - value`). This is approximate but sufficient as a default. Explicit light-mode overrides available for precision.

### 15. Breaking change — no migration path

This is a clean v2 break. No backwards compatibility shims, no deprecation warnings for v1 config keys, no automatic migration. The config shape, default output, and generation pipeline all change. Users on v1 re-run the CLI and get v2 output.

## Config Shape

The resolved TypeScript interface (internal, after merging defaults):

```typescript
interface AutoThemeConfig {
  // ── Required ──
  color: string;

  // ── Core options (all have sensible defaults) ──
  harmony?: HarmonyType | string; // "analogous"
  mode?: "light" | "dark" | "both"; // "both"

  // ── Palette scale (OFF by default — just base colors) ──
  // When false/omitted: emits --color-{name} per harmony (base only)
  // When true: emits full 50-950 scale + foreground + contrast + tones
  // Also activated by output.tailwind: true
  palette?:
    | boolean
    | {
        prefix?: string; // "color"
        tints?: number; // 5
        shades?: number; // 5
        tones?: number; // 4
        alphaVariants?: boolean | AlphaSteps;
        swing?: number; // 1
        swingStrategy?: SwingStrategy; // "linear"
        chromaBalance?: boolean; // true
      };

  // ── Semantic tokens (ON by default — the core value) ──
  semantics?:
    | boolean
    | {
        depth?: number; // derived from mode
        text?: {
          levels?: number; // 3
          anchor?: number; // derived from mode
          floor?: number; // derived from mode
          curve?: number; // 1 (exponent)
          chroma?: [number, number]; // [anchor, floor] e.g. [0.025, 0.010]
        };
        surfaces?: {
          chroma?: number; // 0.010
          sunkenDelta?: number; // -0.02
        };
        borders?: {
          offsets?: [number, number, number]; // [0.08, 0.15, 0.25]
          chroma?: number; // 0.012
        };
        mapping?: {
          accent?: string; // "primary"
          secondary?: string; // "secondary"
          tertiary?: string; // "tertiary"
        };
      };

  // ── Feature toggles (all OFF by default) ──
  states?:
    | boolean
    | {
        hover?: number; // 0.04
        active?: number; // -0.02
        focus?: { color?: string; width?: string; offset?: string };
        disabled?: { opacity?: number };
      };

  elevation?:
    | boolean
    | {
        levels?: number; // 4
        delta?: number; // 0.03
        tintShadows?: boolean; // true
      };

  typography?: boolean | TypographyConfig;
  spacing?: boolean | SpacingConfig;
  shadows?: boolean | ShadowConfig;
  radius?: boolean | RadiusConfig;
  motion?: boolean | MotionConfig;

  gradients?: boolean;
  noise?: boolean;

  // ── Framework bindings ──
  shadcn?: boolean | { radius?: string };

  // ── Output control ──
  output?: {
    path?: string; // "./autotheme.css"
    format?: "oklch" | "hsl" | "rgb" | "hex"; // "oklch"
    tailwind?: boolean; // also activates full palette scale
    preview?: boolean;
    comments?: boolean; // true
    layers?: boolean; // true
    lightDark?: boolean; // true when mode="both"
    contrastMedia?: boolean;
    reducedTransparency?: boolean;
    forcedColors?: boolean;
  };

  // ── Custom harmonies ──
  harmonies?: Record<string, { offsets: number[] }>;
}
```

## Default Output

`autotheme "#7aa2f7"` with zero config generates:

```
HARMONY BASE COLORS (~3-4 tokens)
  --color-primary:    oklch(0.65 0.15 250)
  --color-secondary:  oklch(0.65 0.12 220)
  --color-tertiary:   oklch(0.65 0.10 280)

NEUTRAL SYSTEM (~8 tokens, light-dark pairs)
  --surface
  --surface-sunken
  --border-subtle, --border, --border-strong
  --text-1, --text-2, --text-3

ACCENT SYSTEM (~6 tokens, per harmony color)
  --accent, --accent-foreground
  --accent-secondary, --accent-secondary-foreground
  --accent-tertiary, --accent-tertiary-foreground

TINTED SURFACES (~6 tokens, light-dark pairs)
  --surface-primary, --surface-primary-foreground
  --surface-secondary, --surface-secondary-foreground
  --surface-tertiary, --surface-tertiary-foreground
```

Total: ~25 tokens. All using `light-dark()` for both modes, OKLCH format, CSS layers, with comments.

**With `palette: true` or `output.tailwind: true`, additionally generates:**

```
FULL PALETTE SCALE (~50+ tokens for analogous)
  --color-primary-50 through --color-primary-950
  --color-primary-foreground, --color-primary-contrast
  --color-primary-tone-1 through --color-primary-tone-4
  (repeated per harmony color)
```

## What This Supersedes

This design direction replaces:

- **Milestone 05** (perceptual semantics) — the dual-mode approach is replaced by perceptual-only
- **The current `SemanticsConfig`** — `surfaceDepth`, `textLevels`, `temperature`, HSL contrast pipeline all go away
- **The `enabled` pattern** — replaced by `boolean | Config` everywhere
- **The current accent generation** — expanded from 3 tokens to full harmony integration + tinted surfaces
- **The default palette output** — 50-950 scale moves to opt-in; base colors only by default

The existing core color math (harmonies, variations, tints/shades/tones, Color class) is unchanged — it's already correct. The variation generators still exist and are used when `palette: true`.

This is a **breaking change** — no migration path, no backwards compatibility. Clean v2.

## What Remains to Be Designed

- **Exact default values** for depth, border offsets, text anchors — need visual validation with specific colors
- **Tinted surface chroma derivation** — the formula for how primary chroma maps to tint chroma (proposed: ~15% of primary, needs testing)
- **Elevation shadow values** — the specific offset/blur/opacity progression at each level
- **Light mode elevation** — explored options above (shadow-only / bg-vs-card / temperature shift), needs final decision
- **Tinted surfaces + elevation interaction** — explored options above (compose manually / generate variants / CSS relative color), needs final decision
- **Mapping config UX** — how custom harmony names interact with the mapping system

### Resolved: Palette base color naming

Always `--color-{name}` (using the existing `palette.prefix`, default `"color"`). The prefix prevents namespace collisions: `--color-primary` (raw harmony atom), `--accent` (our semantic role), `--primary` (Shadcn's semantic role) are three distinct tokens. When Tailwind is enabled, `--color-primary` naturally extends to `--color-primary-{50-950}`. No conditional behavior needed.
