# Milestone 1: Extended Harmonies & Color Capabilities

## Overview

Expand the core color palette engine with new harmony types and complete the P3 wide gamut support. These are foundational — every other feature (visual effects, accessibility simulation, framework guides) builds on the palette the harmonies produce.

## What's Included

- **Custom Angle Harmony (CLI surface)** — Expose `generateCustomHarmony()` to the CLI via `--angles` flag
- **Monochromatic Harmony** — Single-hue palette derived entirely from lightness/saturation variations
- **Double Split-Complementary Harmony** — 5-color palette for data-heavy and complex UIs
- **P3 Wide Gamut Completion** — Finish the partial `--p3` implementation

## Current State

- Custom harmony function exists in `src/core/harmonies.ts` (`generateCustomHarmony`, `createHarmonyFromOffsets`) and is usable via JSON config's `harmonies` block — but has no CLI flag
- 10 built-in harmonies exist (complementary, analogous, triadic, split-complementary, drift, square, rectangle, aurelian, bi-polar, retrograde)
- P3 gamut support exists via `--p3` flag using `@supports (color: color(display-p3 1 0 0))` but the roadmap envisioned `@media (color-gamut: p3)` and a `--gamut wide` flag

## Impact

- **Low complexity, high value.** These are incremental additions to a well-tested system.
- Monochromatic fills a major gap — it's one of the most common palette strategies for minimal/editorial design and we don't offer it.
- Custom angles via CLI removes friction for power users who currently must write JSON config.
- Double split-complementary unlocks 5-color palettes, useful for dashboards and data visualization.

## Design Decisions

### Monochromatic: What constitutes the palette?

With only one hue, the traditional harmony model (rotate hue on the wheel) doesn't apply. The palette needs to come from somewhere else.

**Options:**
1. **Reuse tints/shades/tones as the full scale** — The primary's 50-950 scale already covers lightness. Secondary/tertiary/accent become aliases or subsets of the same scale at different lightness anchors.
2. **Vary saturation as the differentiator** — Primary is full saturation, secondary is desaturated, tertiary is near-neutral. Each gets its own 50-950 scale. This produces a richer system but the colors may feel too similar.
3. **Single color, no secondary/tertiary** — Only emit `--color-primary-*` and skip the other harmony slots entirely. Simpler but breaks assumptions downstream (Shadcn mapping, semantic tokens).

The choice affects how semantic tokens map. If secondary is just primary at different saturation, does `--secondary` feel meaningfully different from `--primary-tone-2`?

### Custom Angles: CLI ergonomics

The existing config approach uses a `harmonies` block with named custom harmonies. The CLI needs something lighter.

**Options:**
1. **`--angles "0,45,210"`** — Simple, matches the roadmap. But what's the harmony name? Auto-generate as "custom"?
2. **`--harmony custom --angles "0,45,210"`** — More explicit. `--angles` only valid when `--harmony custom`.
3. **`--offsets "45,210"`** — Implicit 0 base. Fewer numbers to type. But "offsets" vs "angles" naming could confuse.

Also: should `--angles` accept degree symbols? Should it validate that values are 0-360?

### Double Split-Complementary: Naming the 5th color

Current naming goes primary → secondary → tertiary → quaternary. A 5th color needs a name.

**Options:**
1. **`quinary`** — Follows Latin convention. Obscure but consistent.
2. **`accent`** — More intuitive. But "accent" already has semantic meaning in Shadcn/design systems.
3. **Numbered fallback** — `harmony-5`. Less elegant but unambiguous.

### P3 Gamut: `@supports` vs `@media`

Current implementation uses `@supports (color: color(display-p3 ...))`. The roadmap suggested `@media (color-gamut: p3)`.

**Key difference:**
- `@supports` tests if the browser can *parse* P3 colors — doesn't guarantee the display can show them
- `@media (color-gamut: p3)` tests if the display actually has a wide gamut

Both have broad browser support. `@media` is more correct semantically. Could also nest both for maximum safety. Is the added complexity worth it, or is `@supports` good enough in practice?

### P3: Should `--gamut wide` replace `--p3`?

The `--p3` flag is already shipped. Introducing `--gamut wide` as a more general API could:
- Deprecate `--p3` gracefully (alias it)
- Leave room for future gamut options (`--gamut srgb`, `--gamut rec2020`)
- Or it could be over-engineering for a flag most users won't touch

## Open Questions

1. Should monochromatic produce fewer CSS variables (no secondary/tertiary) or map them to saturation variants?
2. How should custom angles interact with presets? Can a preset define custom angles?
3. Is there a maximum number of harmony colors we should support? Double split-comp has 5, but custom angles could have arbitrary count.
4. For P3, should we also generate fallback `color()` function syntax alongside OKLCH?

## Dependencies

- None. This milestone has no external dependencies and doesn't block on other milestones.
- Other milestones benefit from more harmonies being available but don't require them.
