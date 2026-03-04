# Milestone 03 — Extended Harmonies

Status: **Not started.** Core harmony math is independent, but CLI surface and semantic integration depend on M01.

## Overview

Expand the core color palette engine with new harmony types and expose custom harmonies to the CLI. These are foundational additions — the harmony system produces the colors that everything else builds on.

## What's Included

- **Custom Angle Harmony (CLI surface)** — Expose `generateCustomHarmony()` via `--angles` flag
- **Monochromatic Harmony** — Single-hue palette derived from lightness/saturation variations
- **Double Split-Complementary Harmony** — 5-color palette for complex UIs and data visualization

## Current State

- Custom harmony function exists in `src/core/harmonies.ts` (`generateCustomHarmony`, `createHarmonyFromOffsets`) — usable via JSON config's `harmonies` block but has no CLI flag
- 10 built-in harmonies exist (complementary, analogous, triadic, split-complementary, drift, square, rectangle, aurelian, bi-polar, retrograde)

## Impact

- **Low complexity, high value.** Incremental additions to a well-tested system.
- Monochromatic fills a major gap — one of the most common palette strategies for minimal/editorial design.
- Custom angles via CLI removes friction for power users who currently must write JSON config.
- Double split-complementary unlocks 5-color palettes for dashboards and data visualization.

## Design Decisions

### Monochromatic: What constitutes the palette?

With only one hue, the traditional harmony model (rotate hue) doesn't apply.

**v2 context changes this question significantly.** With the v2 palette refactor (M01), the default output is base harmony colors only. A monochromatic harmony would emit just `--color-primary` — a single token. The semantic system (surfaces, borders, text, accents) already derives from primary hue, so the full theme still generates correctly.

When `palette: true`, the 50-950 scale provides the lightness range that makes monochromatic useful — it IS the palette.

**Remaining question:** Should monochromatic emit secondary/tertiary tokens at all?

**Options:**

1. **No secondary/tertiary** — Only `--color-primary`. Semantic accents (`--accent-secondary`, etc.) map to the same color at different lightness/chroma offsets. Clean but reduces the accent system's value.
2. **Saturation variants** — Primary is full chroma, secondary is reduced chroma, tertiary is near-neutral. Each is a distinct `--color-{name}` token. Gives tinted surfaces meaningful differentiation.
3. **Lightness variants** — Primary is the input color, secondary and tertiary are shifted lighter/darker. Gives accent pairs visual distinction.

**Leaning:** Option 2. Saturation variants preserve the semantic system's usefulness — `--surface-secondary` looks meaningfully different from `--surface-primary` because they differ in chroma, not just lightness. And `--accent-secondary` is clearly distinguishable as a desaturated variant of the primary.

### Custom Angles: CLI ergonomics

**Options:**

1. **`--angles "0,45,210"`** — Simple, matches the roadmap. Harmony auto-named "custom".
2. **`--harmony custom --angles "0,45,210"`** — More explicit. `--angles` only valid when `--harmony custom`.
3. **`--offsets "45,210"`** — Implicit 0 base. Fewer numbers.

**Leaning:** Option 2. Explicit is better. Using `--harmony custom` makes it clear this is a harmony selection, and `--angles` is the parameter. Validate that values are 0-360.

### Double Split-Complementary: 5th color naming

Current naming: primary → secondary → tertiary → quaternary. A 5th needs a name.

**Options:**

1. **`quinary`** — Latin convention. Obscure but consistent.
2. **Numbered fallback** — `harmony-5`. Less elegant but unambiguous.

**Decided:** `quinary`. Consistency with the existing Latin naming pattern matters more than familiarity. Nobody knows `quaternary` either, but it works fine.

## Open Questions

1. How should monochromatic interact with the mapping config? If there's no "secondary" harmony color, what does `mapping.secondary` resolve to?
2. Should custom angles via CLI also support naming the harmony? (`--harmony custom --angles "45,210" --name "my-theme"`)
3. Is there a maximum number of harmony colors we should support? Custom angles could have arbitrary count. What happens when there are 8 colors?
4. How do 5+ color harmonies affect the semantic naming? After primary/secondary/tertiary/quaternary/quinary, do we stop or continue?

## Dependencies

- Core harmony math (`src/core/harmonies.ts`) is independent — new harmonies can be added without M01.
- CLI surface (flags, config parsing) depends on M01's config shape changes.
- Semantic system integration (how monochromatic maps to accents/tinted surfaces) depends on M01.
