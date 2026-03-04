# Philosophy

> I don't want to pick colors. I want colors that are already picked.

## Why

I'm lazy. The productive kind — where if math can figure out which colors go together, I shouldn't have to.

Pick a color, pick a harmony, get a theme. No tweaking, no second-guessing, no "does this blue clash with that green." Color theory already answered that. AutoTheme just applies it.

## Color theory does the work

Color harmonies are geometric relationships on the color wheel. Rotate the hue by the right degrees and the resulting colors are guaranteed to work together. Triadic = three balanced colors. Complementary = two that pop. Analogous = three that feel calm.

No taste required. Just geometry.

## Semantic first

Most projects don't need 68 raw palette variables. They need `--surface`, `--text-primary`, `--accent`, and `--border`. AutoTheme defaults to semantic tokens — meaningful names derived from a single depth parameter and your primary hue. The full palette scale is opt-in for when you need it.

This means the default output is small (~25 tokens), intentional, and immediately usable.

## Depth, not manual theming

Surfaces, text hierarchy, and borders are all derived from a single concept: **depth**. One number controls how much the primary hue tints your neutral surfaces, how much contrast your text levels have, and how visible your borders are. Light and dark mode are just depth inversion — the same config produces both.

## Accessible by default

Every color gets a text color that meets WCAG AAA (7:1 contrast ratio). Not opt-in. Not a lint rule. Baked into generation. Every background gets a foreground. Done.

Beyond foreground colors, AutoTheme can check your entire palette's contrast compliance and simulate how it appears under color vision deficiencies. Accessibility is a first-class concern, not an afterthought.

## OKLCH because it looks right

OKLCH is perceptually uniform — a light-to-dark scale actually _looks_ even regardless of hue. HSL can't do that. I don't want to hand-tune shades. The color space handles it.

All internal representation uses OKLCH. Hue rotation, lightness shifts, chroma reduction — everything happens in a space designed for these operations.

<!-- ASSET: oklch-vs-hsl-comparison.png
     Side-by-side comparison: the same 50-950 scale for two different hues
     (e.g., blue and yellow) in HSL vs. OKLCH. In HSL, the steps look uneven
     and inconsistent between hues. In OKLCH, they look smooth and consistent.
     Label: "HSL" on left, "OKLCH" on right. -->
<img src="docs/assets/oklch-vs-hsl-comparison.png" width="600" />

## Works with my tools

Tailwind v4 and Shadcn UI variables out of the box. `bg-primary-500` just works. `--background` and `--foreground` are already there. Light and dark mode both generated. No adapters, no glue code.

## Effects come from the theme

Visual effects — glass, patterns, filters, blobs, blend modes — are not arbitrary. Their colors come from the harmony palette. A glassmorphism panel tinted with your primary. A grain overlay at a calibrated opacity. Pattern stripes in your secondary color. Everything is derived, nothing is hand-picked.

## One color in, everything out

A single color and a harmony type give you:

- Semantic design tokens (surfaces, text, borders, accents)
- 50–950 color scales for every harmony color (opt-in)
- Accessible foreground colors for every shade
- Interactive states (hover, active, focus, disabled)
- Elevation system (surfaces + tinted shadows)
- Light and dark mode
- Visual effects (filters, glass, blobs, patterns)
- Tailwind v4 and Shadcn UI variables
- Typography, spacing, shadows, radius, motion tokens, gradients, and noise textures

A complete design system from one hex code.

<!-- ASSET: manifesto-palette-overview.png
     A clean, wide image showing the complete output of a triadic harmony for #6439FF.
     Three horizontal strips (primary, secondary, tertiary), each showing
     the 50-950 scale as a gradient. Below each strip: the foreground swatch
     and tone swatches. Minimal labels. Should feel like a "this is what you get." -->
<img src="docs/assets/manifesto-palette-overview.png" width="720" />

## The 12 harmonies

Each one is a different shape on the color wheel.

| Harmony                        | Colors | Feel                             |
| ------------------------------ | ------ | -------------------------------- |
| **Analogous**                  | 3      | Calm, cohesive, hard to mess up  |
| **Complementary**              | 2      | High energy, maximum contrast    |
| **Triadic**                    | 3      | Balanced and vibrant             |
| **Split-Complementary**        | 3      | Contrast without the clash       |
| **Drift**                      | 4      | Dynamic, progressive spiral      |
| **Square**                     | 4      | Bold, no single color dominates  |
| **Rectangle**                  | 4      | Versatile, natural pairings      |
| **Aurelian**                   | 3      | Golden angle — nature's favorite |
| **Bi-Polar**                   | 2      | Two strong anchors               |
| **Retrograde**                 | 3      | Triadic from a different angle   |
| **Monochromatic**              | 3      | Subtle, single-hue cohesion      |
| **Double-Split-Complementary** | 5      | Rich, versatile 5-color palette  |
