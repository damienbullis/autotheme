# AutoTheme Audit: Unified Overview

## Executive Summary

AutoTheme generates CSS color palettes from color theory. After integrating it into Decks, we discovered fundamental architectural issues: the tool outputs ~258 CSS variables, of which a real consumer used **19**. The remaining ~239 were either wrong (surfaces too bright, text too flat), irrelevant (MD3 tokens in a non-Material app), or unconfigurable (fixed scales, no alpha variants).

This audit breaks down every issue into actionable categories and proposes a path from "generates a lot of CSS" to "generates exactly the right CSS for your design system."

## Core Philosophy (First Principles)

AutoTheme should be:

1. **Atomic** - Each output (palette, semantics, scales) is independent and opt-in
2. **Composable** - Outputs layer cleanly: palette vars -> semantic tokens -> framework bindings
3. **Opinionated with escape hatches** - Good defaults, but every value is overridable
4. **One-time generation** - Output is meant to be edited; don't over-engineer runtime flexibility
5. **Framework-agnostic first** - Works without Tailwind or Shadcn; those are optional layers

## Current Architecture

```
Input: color + harmony type + config flags
  |
  v
Core: Color -> Harmonies -> Variations (tints/shades/tones) -> Palette
  |
  v
Generators: CSS vars + MD3 semantic tokens + Shadcn tokens + scales + utilities
  |
  v
Output: Single CSS file with everything interleaved
```

### Problems with this flow

1. **No layer separation** - Palette generation and semantic mapping are entangled
2. **MD3 is embedded as "universal"** - `semantic.ts` generates Material Design 3 tokens and treats them as the canonical semantic layer, but autotheme is not a Material library
3. **Shadcn layers on MD3** - `shadcn.ts` maps Shadcn tokens to MD3 tokens, creating a dependency chain: palette -> MD3 -> Shadcn. If you want Shadcn without MD3, you can't have it
4. **Everything or nothing** - Many sections always emit (semantic tokens, color scales, dark mode). Toggles only exist for gradients, spacing, noise, shadcn, utilities
5. **Shared scalar** - Typography and spacing use the same `scalar` (1.618), but these need independent control
6. **Hardcoded counts** - 5 tints, 5 shades, 4 tones, fixed increments (10% lightness, 20% saturation)

## Proposed Architecture

```
Input: color + harmony + config
  |
  v
Layer 1 - Palette: Color scales (50-950) per harmony color
  |         Independently toggleable. Configurable counts/increments.
  |         Optional alpha variants (-bg, -border, -glow).
  v
Layer 2 - Semantics: Surface hierarchy, text hierarchy, border tokens
  |         Maps palette swatches to semantic roles.
  |         Configurable depth (darkness), text levels, design rules.
  |         Framework-agnostic. Off by default.
  v
Layer 3 - Framework Bindings: Shadcn, Tailwind
  |         Maps semantic tokens to framework-specific names.
  |         Only emitted when explicitly enabled.
  v
Layer 4 - System Scales: Typography, spacing, (shadows, radii)
  |         Each independently configurable: base, ratio, steps, manual overrides.
  v
Output: Clean CSS with only requested sections
```

## Document Index

| Document                                         | Description                                          |
| ------------------------------------------------ | ---------------------------------------------------- |
| [02-BUGS.md](./02-BUGS.md)                       | Bugs and incorrect behavior that need fixing         |
| [03-REFACTORING.md](./03-REFACTORING.md)         | Architecture and code quality improvements           |
| [04-FEATURES.md](./04-FEATURES.md)               | New features needed                                  |
| [05-GAPS.md](./05-GAPS.md)                       | Design gaps and missing capabilities                 |
| [06-RECOMMENDATIONS.md](./06-RECOMMENDATIONS.md) | Recommendations, tradeoffs, and design decisions     |
| [07-ROADMAP.md](./07-ROADMAP.md)                 | Phased implementation plan                           |
| [08-INNOVATION.md](./08-INNOVATION.md)           | Cutting-edge CSS features and creative possibilities |

## Scope of Changes

**Breaking changes are expected and welcome.** We are in active development. No backwards compatibility concerns. Old code paths should be removed, not shimmed.

Key breaking changes anticipated:

- MD3 semantic tokens removed as default (replaced with autotheme's own semantic system)
- Shadcn off by default
- Config shape changes (new options, renamed options, removed options)
- CSS variable naming may change for semantic tokens
- Default output will be much slimmer (palette only by default)
