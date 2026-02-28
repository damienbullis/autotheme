# AutoTheme

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![CI](https://github.com/damienbullis/autotheme/actions/workflows/ci.yml/badge.svg)](https://github.com/damienbullis/autotheme/actions/workflows/ci.yml)
![WCAG AAA](https://img.shields.io/badge/WCAG-AAA_%E2%9C%93-228B22)

## The problem with CSS theming

You've been here before. You need a color palette for your app. So you open a color picker, eyeball some hex values, paste them into your CSS, and hope they look good together. Maybe you grab a palette from a generator and adjust until things feel right. For dark mode, you darken everything by some arbitrary amount and call it done.

Then someone asks if your text colors are accessible. You check. They're not.

This is how most theming works: **manual, arbitrary, and retroactively accessible** (if at all).

## A better approach

Color theory solved this centuries ago. Colors that are geometrically related on the color wheel — **harmonies** — look good together. Not because someone decided they do, but because of how human perception works.

AutoTheme takes this seriously:

**Start with math, not taste.** Your color goes on the wheel. A harmony — triadic, complementary, split-complementary, or any of 10 options — determines which other colors pair with it. The geometry guarantees they work.

**Accessibility is not a feature, it's a constraint.** Every color gets a text color that meets WCAG AAA (7:1 contrast ratio). Not as an opt-in. Not as a lint rule you can ignore. As a mathematical guarantee baked into generation.

**OKLCH, not RGB.** RGB is for screens. OKLCH is for humans. It's perceptually uniform — a lightness of 0.5 *looks* like 50% lightness, unlike HSL where it varies wildly by hue. AutoTheme outputs OKLCH because your palette should look as consistent as the math behind it.

**One input, complete output.** A single color and a harmony type produce: 50–950 color scales, accessible foregrounds, light and dark modes, Tailwind v4 variables, Shadcn UI tokens, typography, spacing, gradients, and noise textures. A complete design system, not a starting point for one.

## What AutoTheme generates

```bash
npm install autotheme
autotheme --color "#6439FF" --harmony triadic
```

From that, you get:

### A full color palette

<!-- ASSET: manifesto-palette-overview.png
     A clean, wide image showing the complete output of a triadic harmony for #6439FF.
     Three horizontal strips (primary, secondary, tertiary), each showing
     the 50-950 scale as a gradient. Below each strip: the foreground swatch
     and tone swatches. Minimal labels. Should feel like a "this is what you get." -->
<img src="docs/assets/manifesto-palette-overview.png" width="720" />

Each harmony color produces 17 CSS variables:

```css
--color-primary-50 through 950   /* 11-step scale */
--color-primary-foreground       /* WCAG AAA text */
--color-primary-contrast         /* High contrast text */
--color-primary-tone-1 through 4 /* Desaturated variations */
```

Multiply by 2–4 colors per harmony. That's 34–68 color variables from a single hex code.

### Accessible text — guaranteed

Every shade, every tint, every tone gets a foreground color. The algorithm tests black, white, and a range of intermediates to find the highest-contrast option that meets the target ratio.

The default is 7:1 (WCAG AAA). Set it to 4.5:1 (AA) if you prefer, or push it to 21:1 if you're building for maximum readability. The guarantee holds either way.

### Light and dark mode

Both schemes are generated from the same harmony. Dark mode activates with `.dark` on the root element. Add `--dark-mode-script` for system preference detection, localStorage persistence, and FOUC prevention.

### Tailwind v4 integration

```bash
autotheme --tailwind
```

Generates a CSS file with `@theme` directives. Use `bg-primary-500`, `text-secondary-foreground`, etc. immediately.

### Shadcn UI tokens

Every Shadcn semantic variable — `--background`, `--foreground`, `--primary`, `--card`, `--destructive`, `--muted`, `--accent`, `--ring`, `--border`, and more — derived from your harmony, not hand-picked.

### Typography, spacing, and texture

```css
--text-xs through 4xl        /* Type scale from configurable base */
--spacing-1 through 10       /* Golden ratio (1.618) spacing */
--gradient-linear-*          /* Gradients between harmony colors */
--background-image-noise     /* Procedural noise texture */
```

<img src="docs/assets/noise.png" width="480" />

## The 10 harmonies

Every harmony is a geometric shape on the color wheel. The shape determines the feel.

| Harmony                 | Shape                    | Colors | Character                        |
| ----------------------- | ------------------------ | ------ | -------------------------------- |
| **Analogous**           | Arc                      | 3      | Serene, cohesive                 |
| **Complementary**       | Line (diameter)          | 2      | High contrast, vibrant           |
| **Triadic**             | Equilateral triangle     | 3      | Balanced, vibrant                |
| **Split-Complementary** | Isosceles triangle       | 3      | Contrast without tension         |
| **Tetradic**            | Pi-derived quadrilateral | 4      | Mathematical, dynamic            |
| **Square**              | Square                   | 4      | Bold, no color dominates         |
| **Rectangle**           | Rectangle                | 4      | Versatile, natural groupings     |
| **Aurelian**            | Golden angle (137.5°)    | 3      | Organically harmonious           |
| **Bi-Polar**            | Right angle              | 2      | Focused, decisive                |
| **Retrograde**          | Reverse triangle         | 3      | Familiar geometry, fresh perspective |

<details>
<summary>Visualize all harmonies</summary>

> All examples use `#6439FF`.

<img src="docs/assets/analogous2.png" width="600" />
<img src="docs/assets/complementary.png" width="600" />
<img src="docs/assets/triadic.png" width="600" />
<img src="docs/assets/split-complementary.png" width="600" />
<img src="docs/assets/tetradic.png" width="600" />
<img src="docs/assets/square.png" width="600" />
<img src="docs/assets/rectangle.png" width="600" />
<img src="docs/assets/aurelian.png" width="600" />
<img src="docs/assets/bi-polar.png" width="600" />
<img src="docs/assets/retrograde.png" width="600" />

</details>

## Usage

### CLI

```bash
# Defaults (random color, analogous harmony)
autotheme

# Specify everything
autotheme --color "#FF6B35" --harmony split-complementary --tailwind --preview --dark-mode-script

# Interactive config setup
autotheme init
```

### Config file

`autotheme.json`, `.autothemerc.json`, or `.autothemerc`:

```json
{
  "$schema": "./node_modules/autotheme/schema.json",
  "color": "#6439FF",
  "harmony": "triadic",
  "tailwind": true,
  "contrastTarget": 7
}
```

<details>
<summary>All options</summary>

| Option           | Type      | Default                 | Description                    |
| ---------------- | --------- | ----------------------- | ------------------------------ |
| `color`          | `string`  | random                  | Primary color                  |
| `harmony`        | `string`  | `"analogous"`           | Harmony type                   |
| `output`         | `string`  | `"./src/autotheme.css"` | Output path                    |
| `prefix`         | `string`  | `"color"`               | CSS variable prefix            |
| `fontSize`       | `number`  | `1`                     | Base font size (rem)           |
| `preview`        | `boolean` | `false`                 | HTML preview                   |
| `tailwind`       | `boolean` | `false`                 | Tailwind v4 CSS                |
| `darkModeScript` | `boolean` | `false`                 | Dark mode script               |
| `scalar`         | `number`  | `1.618`                 | Golden ratio multiplier        |
| `contrastTarget` | `number`  | `7`                     | Contrast ratio (3–21)          |
| `radius`         | `string`  | `"0.625rem"`            | Shadcn border radius           |
| `gradients`      | `boolean` | `true`                  | Gradient variables             |
| `spacing`        | `boolean` | `true`                  | Spacing scale                  |
| `noise`          | `boolean` | `true`                  | Noise texture                  |
| `shadcn`         | `boolean` | `true`                  | Shadcn UI variables            |
| `utilities`      | `boolean` | `true`                  | Utility classes                |

</details>

### Module API

```typescript
import { Color, generateFullPalette, generateCSS } from "autotheme";

const primary = new Color("#6439FF");
const palette = generateFullPalette(primary, "triadic");

const theme = {
  palette,
  config: {
    color: "#6439FF",
    harmony: "triadic",
    output: "./autotheme.css",
    preview: false,
    tailwind: false,
    darkModeScript: false,
    scalar: 1.618,
    contrastTarget: 7,
    radius: "0.625rem",
    prefix: "color",
    fontSize: 1,
    gradients: true,
    spacing: true,
    noise: true,
    shadcn: true,
    utilities: true,
  },
};

const css = generateCSS(theme);
```

## Why OKLCH

RGB was designed for cathode ray tubes. HSL tried to be human-friendly but failed — "50% lightness" in HSL looks completely different for yellow vs. blue. OKLCH (Oklab Lightness, Chroma, Hue) is perceptually uniform: equal numeric differences produce equal visual differences. When AutoTheme generates a 50–950 scale, the perceptual steps between each shade are even, regardless of hue.

<!-- ASSET: oklch-vs-hsl-comparison.png
     Side-by-side comparison: the same 50-950 scale for two different hues
     (e.g., blue and yellow) in HSL vs. OKLCH. In HSL, the steps look uneven
     and inconsistent between hues. In OKLCH, they look smooth and consistent.
     Label: "HSL" on left, "OKLCH" on right. -->
<img src="docs/assets/oklch-vs-hsl-comparison.png" width="600" />

## Development

```bash
git clone https://github.com/damienbullis/autotheme.git && cd autotheme && bun install
bun run dev       # Watch mode
bun run test      # Tests
bun run check     # All checks
```

## License

[MIT](./LICENSE)
