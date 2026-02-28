# AutoTheme

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![CI](https://github.com/damienbullis/autotheme/actions/workflows/ci.yml/badge.svg)](https://github.com/damienbullis/autotheme/actions/workflows/ci.yml)
![WCAG AAA](https://img.shields.io/badge/WCAG-AAA_%E2%9C%93-228B22)

> Accessible CSS themes from color theory. Zero config. Zero dependencies.

<!-- ASSET: hero-color-wheel.svg (or .png)
     A large, clean color wheel diagram with the 12 primary hue positions marked.
     Overlaid: geometric lines showing 3-4 different harmony types simultaneously
     (e.g., triadic triangle, complementary diameter, square).
     The wheel should use the OKLCH perceptual color space for accuracy.
     Style: modern, minimal, dark background with vibrant colors. ~720px wide. -->
<p align="center">
  <img src="docs/assets/hero-color-wheel.svg" width="480" />
</p>

<p align="center">
  <em>Pick a color. Choose a harmony. Get a complete design system.</em>
</p>

## Install

```bash
npm install autotheme
```

## How it works

AutoTheme places your color on the **color wheel** and uses geometric relationships — **harmonies** — to select colors that naturally work together.

Each harmony defines a shape on the wheel. The shape determines which hues pair with yours.

## The harmonies

<!-- ASSET: harmony-wheel-analogous.svg
     Color wheel with three adjacent dots connected by a small arc (~30° either side).
     Dots should be colored with the actual hue values for #6439FF analogous.
     Label: "Analogous — 3 adjacent colors" -->
### Analogous — adjacent colors

<img src="docs/assets/harmony-wheel-analogous.svg" width="280" align="right" />

Three colors sitting side by side on the wheel. Serene, low contrast, effortlessly cohesive.

**Angle:** ±30° from base

<img src="docs/assets/analogous2.png" width="480" />

<br clear="right" />

---

<!-- ASSET: harmony-wheel-complementary.svg
     Color wheel with two dots connected by a diameter line (180° apart).
     Dots colored with #6439FF and its complement. -->
### Complementary — opposites attract

<img src="docs/assets/harmony-wheel-complementary.svg" width="280" align="right" />

Two colors on opposite ends of the wheel. Maximum contrast, maximum energy.

**Angle:** 180° from base

<img src="docs/assets/complementary.png" width="480" />

<br clear="right" />

---

<!-- ASSET: harmony-wheel-triadic.svg
     Color wheel with three dots forming an equilateral triangle (120° apart).
     Dots colored with #6439FF triadic values. -->
### Triadic — the triangle

<img src="docs/assets/harmony-wheel-triadic.svg" width="280" align="right" />

Three colors equally spaced around the wheel. Balanced vibrancy with room to breathe.

**Angle:** 120° apart

<img src="docs/assets/triadic.png" width="480" />

<br clear="right" />

---

<!-- ASSET: harmony-wheel-split-complementary.svg
     Color wheel with three dots: base, then two dots flanking the complement (~150°, ~210°).
     Forms a narrow isoceles triangle. -->
### Split-Complementary — tension without clash

<img src="docs/assets/harmony-wheel-split-complementary.svg" width="280" align="right" />

The complement's two neighbors instead of the complement itself. High contrast with less risk.

**Angle:** ±150° from base

<img src="docs/assets/split-complementary.png" width="480" />

<br clear="right" />

---

<!-- ASSET: harmony-wheel-tetradic.svg
     Color wheel with four dots at pi-based angular offsets.
     Connected by lines forming an irregular quadrilateral. -->
### Tetradic — pi-driven geometry

<img src="docs/assets/harmony-wheel-tetradic.svg" width="280" align="right" />

Four colors spaced by pi-derived angles. Mathematically intriguing, visually dynamic.

**Angle:** pi-based offsets

<img src="docs/assets/tetradic.png" width="480" />

<br clear="right" />

---

<!-- ASSET: harmony-wheel-square.svg
     Color wheel with four dots forming a perfect square (90° apart). -->
### Square — four corners

<img src="docs/assets/harmony-wheel-square.svg" width="280" align="right" />

Four colors at 90° intervals. Bold, balanced, no single color dominates.

**Angle:** 90° apart

<img src="docs/assets/square.png" width="480" />

<br clear="right" />

---

<!-- ASSET: harmony-wheel-rectangle.svg
     Color wheel with four dots forming a rectangle (two complementary pairs). -->
### Rectangle — two pairs

<img src="docs/assets/harmony-wheel-rectangle.svg" width="280" align="right" />

Two complementary pairs arranged as a rectangle. Rich variety, natural groupings.

**Angles:** complementary pairs offset

<img src="docs/assets/rectangle.png" width="480" />

<br clear="right" />

---

<!-- ASSET: harmony-wheel-aurelian.svg
     Color wheel with three dots spaced by the golden angle (137.5°).
     Optionally: a subtle golden spiral overlay. -->
### Aurelian — the golden angle

<img src="docs/assets/harmony-wheel-aurelian.svg" width="280" align="right" />

Colors spaced by 137.5° — the golden angle found in sunflowers and galaxies. Naturally harmonious.

**Angle:** 137.5° (golden angle)

<img src="docs/assets/aurelian.png" width="480" />

<br clear="right" />

---

<!-- ASSET: harmony-wheel-bi-polar.svg
     Color wheel with two dots at 90° apart, connected by an arc. -->
### Bi-Polar — two anchors

<img src="docs/assets/harmony-wheel-bi-polar.svg" width="280" align="right" />

Two dominant colors at a right angle. Strong, focused, decisive.

**Angle:** 90° from base

<img src="docs/assets/bi-polar.png" width="480" />

<br clear="right" />

---

<!-- ASSET: harmony-wheel-retrograde.svg
     Color wheel with three dots in reverse triadic arrangement. -->
### Retrograde — the reverse

<img src="docs/assets/harmony-wheel-retrograde.svg" width="280" align="right" />

Triadic in reverse. Same geometry, different starting perspective.

**Angle:** reverse 120° spacing

<img src="docs/assets/retrograde.png" width="480" />

<br clear="right" />

---

> All examples use `#6439FF` as the base color.

## From wheel to palette

Each color on the wheel expands into a full scale:

<!-- ASSET: palette-expansion.svg (or .png)
     Visual showing a single color dot on the wheel expanding rightward into:
     - A gradient strip of tints (50-400, getting lighter)
     - The base (500)
     - A gradient strip of shades (600-950, getting darker)
     - A small row of 4 desaturated tone swatches
     - A "foreground" swatch showing the accessible text color on top of the base
     Should feel like an "explosion" or "expansion" from one dot to many. -->
<img src="docs/assets/palette-expansion.svg" width="720" />

| Variation      | Count | What it does                           |
| -------------- | ----- | -------------------------------------- |
| **Tints**      | 5     | Lighter versions (50, 100, 200, 300, 400) |
| **Base**       | 1     | Your color (500)                       |
| **Shades**     | 5     | Darker versions (600, 700, 800, 900, 950) |
| **Tones**      | 4     | Desaturated versions                   |
| **Foreground** | 1     | Accessible text color (WCAG AAA)       |
| **Contrast**   | 1     | High contrast text color               |

That's **17 CSS variables per color**, output in **OKLCH** for perceptual uniformity:

```css
--color-primary-50: oklch(0.95 0.03 270);   /* Lightest tint */
--color-primary-500: oklch(0.49 0.31 270);  /* Base */
--color-primary-950: oklch(0.17 0.10 270);  /* Darkest shade */
--color-primary-foreground: oklch(1 0 0);   /* Accessible text */
```

## Output

### Tailwind v4 variables

Color scales slot directly into Tailwind v4. Use `bg-primary-500`, `text-secondary-200`, etc.

```bash
autotheme --color "#6439FF" --harmony triadic --tailwind
```

### Shadcn UI tokens

Full Shadcn semantic set included: `--background`, `--foreground`, `--primary`, `--card`, `--destructive`, `--muted`, `--accent`, and more.

### Dark mode

Light and dark schemes generated. Add `--dark-mode-script` for automatic system detection + toggle.

### Typography, spacing, gradients, noise

```css
--text-xs..4xl           /* Type scale */
--spacing-1..10          /* Spacing */
--gradient-linear-*      /* Gradients */
--background-image-noise /* Noise texture */
```

<img src="docs/assets/noise.png" width="480" />

## Quick start

```bash
# Defaults (random color, analogous)
autotheme

# Full stack
autotheme --color "#FF6B35" --harmony split-complementary --tailwind --preview

# Interactive setup
autotheme init
```

```css
@import "./autotheme.css";
```

## Configuration

Config files: `autotheme.json`, `.autothemerc.json`, or `.autothemerc`. Priority: CLI > config > defaults.

```json
{
  "$schema": "./node_modules/autotheme/schema.json",
  "color": "#6439FF",
  "harmony": "triadic"
}
```

<details>
<summary>All options</summary>

| Option           | Type      | Default                 | Description                    |
| ---------------- | --------- | ----------------------- | ------------------------------ |
| `color`          | `string`  | random                  | Primary color (hex, rgb, hsl)  |
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

## Module API

```typescript
import { Color, generateFullPalette, generateCSS } from "autotheme";

const primary = new Color("#6439FF");
const palette = generateFullPalette(primary, "triadic");
const css = generateCSS({ palette, config: { color: "#6439FF", harmony: "triadic", /* ... */ } });
```

## Development

```bash
git clone https://github.com/damienbullis/autotheme.git && cd autotheme && bun install
bun run dev       # Watch mode
bun run test      # Tests
bun run check     # All checks
```

## License

[MIT](./LICENSE)
