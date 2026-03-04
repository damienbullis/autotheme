# Milestone 02 — States & Elevation

Status: **Not started.** Depends on M01 (Core v2 Refactor).

Reference: [`docs/v2-design-direction.md`](../v2-design-direction.md) §6–7

## Overview

Two opt-in feature systems that build on the core v2 depth abstraction. States produce universal modifier tokens (L deltas) that apply to any color. Elevation extends depth upward with paired surface + shadow tokens. Both are OFF by default.

## What's Included

- **State modifier tokens** — Hover, active, disabled, focus as relative deltas
- **Elevation scale** — N levels of raised surfaces with paired shadow tokens
- **Dark mode elevation** — Surface lightness shifts per level
- **Light mode elevation** — Background-vs-card model
- **Hue-tinted shadows** — Shadow color picks up primary hue at very low chroma

## Current State

- State tokens exist in `src/generators/semantic.ts` with HSL-based shifts (`hoverShift`, `activeShift`)
- Elevation exists as a standalone `--surface-elevated` concept
- Both use the old `{ enabled: boolean }` config pattern (replaced by M01)
- Separate shadow scale exists in `src/generators/shadows.ts`

## Impact

- **Moderate complexity.** Well-defined systems — implementation is straightforward once M01's depth system exists.
- States as modifier tokens is a differentiating design: constant token count regardless of palette size, composable with any color including user-defined ones.
- Elevation with hue-tinted shadows is the polish detail that separates generated themes from hand-crafted ones.

## Design Decisions (Resolved)

### States — modifier tokens, not resolved variants

States produce universal L deltas, not new color tokens per color × state. This avoids token explosion and composes with any color.

```css
--state-hover: 0.04;
--state-active: -0.02;
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

**Hover delta sign flips automatically** between light/dark mode — lighten on hover in dark mode, darken in light mode. This is handled during generation: the `--state-hover` value is positive in dark mode, negative in light mode (or vice versa depending on convention). When `mode: "both"`, both values are emitted via `light-dark()`.

Config:

```jsonc
{ "states": true }
// or
{ "states": { "hover": 0.04, "active": -0.02 } }
```

### Dark mode elevation

Surface lightness does the heavy lifting — shadows are less visible against dark backgrounds. Each level adds an L delta from depth:

```css
--surface:            oklch(0.13 0.01 250);
--surface-sunken:     oklch(0.11 0.01 250);

--elevation-1:        oklch(0.16 0.01 250);
--elevation-1-shadow: 0 1px 3px oklch(0.13 0.005 250 / 0.12), ...;
--elevation-2:        oklch(0.19 0.01 250);
--elevation-2-shadow: 0 3px 6px oklch(0.13 0.005 250 / 0.16), ...;
--elevation-3:        oklch(0.22 0.01 250);
--elevation-3-shadow: 0 10px 20px oklch(0.13 0.005 250 / 0.20), ...;
```

### Light mode elevation — background-vs-card model (decided)

The page/card distinction is universally understood. This is how Shadcn works: `--background` is off-white, `--card` is white.

```css
--surface:            oklch(0.96 0.01 250);    /* page — slightly tinted */
--elevation-1:        oklch(0.99 0.005 250);   /* card — near white */
--elevation-1-shadow: 0 1px 3px oklch(0.50 0.005 250 / 0.08), ...;
--elevation-2:        oklch(0.99 0.005 250);   /* same surface as elevation-1 */
--elevation-2-shadow: 0 3px 6px oklch(0.50 0.005 250 / 0.12), ...;
```

The jump from page to card IS the visual cue. Shadows add progressive depth on top.

### Tinted surfaces + elevation — compose manually (decided)

No interaction between tinted surfaces and elevation. They're independent building blocks:

```css
/* Regular elevated card */
.card { background: var(--elevation-1); box-shadow: var(--elevation-1-shadow); }

/* Tinted card with elevation shadow */
.feature { background: var(--surface-primary); box-shadow: var(--elevation-2-shadow); }
```

The shadow from elevation works with any background. No `--surface-primary-elevated` tokens. No token explosion.

### Shadow details

- **Hue-tinted:** Shadow color uses primary hue at very low chroma — the polish detail that separates generated from hand-crafted
- **Paired tokens:** `--elevation-N` (surface color) + `--elevation-N-shadow` (box-shadow value) — always used together conceptually, but can be mixed

Config:

```jsonc
{ "elevation": true }
// or
{ "elevation": { "levels": 4, "delta": 0.03, "tintShadows": true } }
```

## Output Tokens

When `states: true` (~6 tokens):

```css
--state-hover: 0.04;
--state-active: -0.02;
--state-disabled-opacity: 0.4;
--focus-ring-color: var(--accent);
--focus-ring-width: 2px;
--focus-ring-offset: 2px;
```

When `elevation: true` (2 tokens per level, default 4 levels = 8 tokens):

```css
--elevation-1:        oklch(...);
--elevation-1-shadow: 0 1px 3px oklch(...), ...;
--elevation-2:        oklch(...);
--elevation-2-shadow: 0 3px 6px oklch(...), ...;
--elevation-3:        oklch(...);
--elevation-3-shadow: 0 10px 20px oklch(...), ...;
--elevation-4:        oklch(...);
--elevation-4-shadow: 0 14px 28px oklch(...), ...;
```

## Files That Change

| File | Change |
|---|---|
| `src/generators/semantic.ts` | State + elevation generators rewritten for OKLCH, depth-based |
| `src/generators/css.ts` | Emit state/elevation tokens when enabled |
| Tests | New tests for state modifiers, elevation scale, shadow generation |

## Open Questions

1. **Shadow value progression** — exact offset/blur/spread/opacity at each elevation level needs visual tuning with real UI components
2. **Max elevation levels** — 4 is the default, but should there be a hard cap in validation?
3. **Focus ring implementation** — should `--focus-ring-color` default to `var(--accent)` or be a separate OKLCH value?

## Dependencies

- **Requires M01** (Core v2 Refactor) — depth system, `boolean | Config` pattern, and OKLCH pipeline must exist
- Independent of M03–M06
