# Philosophy

> I don't want to pick colors. I want colors that are already picked.

## Why

I'm lazy. The productive kind — where if math can figure out which colors go together, I shouldn't have to.

Pick a color, pick a harmony, get a theme. No tweaking, no second-guessing, no "does this blue clash with that green." Color theory already answered that. AutoTheme just applies it.

## Color theory does the work

Color harmonies are geometric relationships on the color wheel. Rotate the hue by the right degrees and the resulting colors are guaranteed to work together. Triadic = three balanced colors. Complementary = two that pop. Analogous = three that feel calm.

No taste required. Just geometry.

## Works with my tools

Tailwind v4 and Shadcn UI variables out of the box. `bg-primary-500` just works. `--background` and `--foreground` are already there. Light and dark mode both generated. No adapters, no glue code.

## Accessible by default

Every color gets a text color that meets WCAG AAA (7:1 contrast ratio). Not opt-in. Not a lint rule. Baked into generation. Every background gets a foreground. Done.

## OKLCH because it looks right

OKLCH is perceptually uniform — a light-to-dark scale actually *looks* even regardless of hue. HSL can't do that. I don't want to hand-tune shades. The color space handles it.

<!-- ASSET: oklch-vs-hsl-comparison.png
     Side-by-side comparison: the same 50-950 scale for two different hues
     (e.g., blue and yellow) in HSL vs. OKLCH. In HSL, the steps look uneven
     and inconsistent between hues. In OKLCH, they look smooth and consistent.
     Label: "HSL" on left, "OKLCH" on right. -->
<img src="docs/assets/oklch-vs-hsl-comparison.png" width="600" />

## One color in, everything out

A single color and a harmony type give you:

- 50–950 color scales for every harmony color
- Accessible foreground colors for every shade
- Light and dark mode
- Tailwind v4 variables
- Shadcn UI tokens
- Typography, spacing, gradients, and noise textures

A complete design system from one hex code.

<!-- ASSET: manifesto-palette-overview.png
     A clean, wide image showing the complete output of a triadic harmony for #6439FF.
     Three horizontal strips (primary, secondary, tertiary), each showing
     the 50-950 scale as a gradient. Below each strip: the foreground swatch
     and tone swatches. Minimal labels. Should feel like a "this is what you get." -->
<img src="docs/assets/manifesto-palette-overview.png" width="720" />

## The 10 harmonies

Each one is a different shape on the color wheel.

| Harmony                 | Colors | Feel                                 |
| ----------------------- | ------ | ------------------------------------ |
| **Analogous**           | 3      | Calm, cohesive, hard to mess up      |
| **Complementary**       | 2      | High energy, maximum contrast        |
| **Triadic**             | 3      | Balanced and vibrant                 |
| **Split-Complementary** | 3      | Contrast without the clash           |
| **Tetradic**            | 4      | Complex, mathematical                |
| **Square**              | 4      | Bold, no single color dominates      |
| **Rectangle**           | 4      | Versatile, natural pairings          |
| **Aurelian**            | 3      | Golden angle — nature's favorite     |
| **Bi-Polar**            | 2      | Two strong anchors                   |
| **Retrograde**          | 3      | Triadic from a different angle       |
