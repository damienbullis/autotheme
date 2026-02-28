# AutoTheme

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![CI](https://github.com/damienbullis/autotheme/actions/workflows/ci.yml/badge.svg)](https://github.com/damienbullis/autotheme/actions/workflows/ci.yml)
![WCAG AAA](https://img.shields.io/badge/WCAG-AAA_%E2%9C%93-228B22)

> Accessible CSS themes from color theory — traced from input to output.

```bash
npm install autotheme
```

Let's follow a single color through AutoTheme's entire pipeline.

---

## Step 1: A color

We start with a hex code:

```
#6439FF
```

<!-- ASSET: anatomy-step1-swatch.svg (or .png)
     A single large color swatch of #6439FF (a vivid blue-violet).
     Clean, centered, maybe 120x120px with rounded corners.
     The hex value printed below in a monospace font. -->
<img src="docs/assets/anatomy-step1-swatch.svg" width="120" />

AutoTheme parses this into HSL for manipulation — hue rotation is cleanest in HSL:

```
#6439FF → hsl(249°, 100%, 61%)
```

| Component      | Value | Meaning                        |
| -------------- | ----- | ------------------------------ |
| **Hue**        | 249°  | Position on the color wheel    |
| **Saturation** | 100%  | Full intensity                 |
| **Lightness**  | 61%   | Medium-bright                  |

---

## Step 2: A harmony

We choose **triadic** — three colors equally spaced on the wheel.

The math: take the hue (249°) and add 120° and 240°:

```
Primary:   249°           → #6439FF (blue-violet)
Secondary: 249° + 120° = 9°   → #FF3964 (red-pink)
Tertiary:  249° + 240° = 129° → #39FF64 (green)
```

<!-- ASSET: anatomy-step2-wheel.svg
     A color wheel showing three dots at 249°, 9°, and 129°, connected by
     an equilateral triangle. Each dot is colored with the actual color.
     Labels: "Primary 249°", "Secondary 9°", "Tertiary 129°".
     The triangle should be drawn with thin white/gray lines. -->
<img src="docs/assets/anatomy-step2-wheel.svg" width="360" />

Three colors. Geometrically balanced. Guaranteed to work together.

Each harmony uses different geometry:

| Harmony                 | Rotation                         |
| ----------------------- | -------------------------------- |
| Analogous               | -30°, 0°, +30°                   |
| Complementary           | 0°, 180°                         |
| Triadic                 | 0°, 120°, 240°                   |
| Split-Complementary     | 0°, 150°, 210°                   |
| Square                  | 0°, 90°, 180°, 270°              |
| Rectangle               | 0°, 60°, 180°, 240°              |
| Aurelian                | 0°, 137.5°, 275°                 |
| Tetradic                | 0°, π×57.3°, 2π×57.3°, 3π×57.3° |
| Bi-Polar                | 0°, 90°                          |
| Retrograde              | 0°, -120°, -240°                 |

---

## Step 3: Tints, shades, and tones

Each of the 3 colors now expands into a full scale. Let's trace the primary (`#6439FF`):

**Tints** — mix with white (increase lightness):

```
50:  hsl(249°, 100%, 95%)  ██  Almost white with a violet hint
100: hsl(249°, 100%, 90%)  ██
200: hsl(249°, 100%, 82%)  ██
300: hsl(249°, 100%, 74%)  ██
400: hsl(249°, 100%, 66%)  ██  Noticeably lighter than base
```

**Base:**

```
500: hsl(249°, 100%, 61%)  ██  The original color
```

**Shades** — mix with black (decrease lightness):

```
600: hsl(249°, 100%, 50%)  ██
700: hsl(249°, 100%, 42%)  ██
800: hsl(249°, 100%, 34%)  ██
900: hsl(249°, 100%, 22%)  ██
950: hsl(249°, 100%, 14%)  ██  Near black with violet identity
```

**Tones** — desaturate (reduce saturation):

```
tone-1: hsl(249°, 80%, 61%)  ██
tone-2: hsl(249°, 60%, 61%)  ██
tone-3: hsl(249°, 40%, 61%)  ██
tone-4: hsl(249°, 20%, 61%)  ██  Almost gray, barely violet
```

<!-- ASSET: anatomy-step3-scale.png
     The complete 50-950 scale + tones for #6439FF laid out horizontally.
     Each swatch labeled with its step number. Tints on the left (light),
     base in the middle, shades on the right (dark). Tones in a second row below.
     Should clearly show the gradual progression. -->
<img src="docs/assets/anatomy-step3-scale.png" width="720" />

That's **16 variants** from one color. Across all 3 triadic colors: **48 color variables**.

---

## Step 4: Accessible text colors

For each of those 48 colors, AutoTheme finds a text color that meets **WCAG AAA** (7:1 contrast ratio).

The algorithm for `--color-primary-500` (`#6439FF`):

```
1. Calculate luminance of #6439FF → 0.107

2. Test white (#FFFFFF, luminance 1.0):
   Contrast = (1.0 + 0.05) / (0.107 + 0.05) = 6.69:1
   ✗ Below 7:1 target

3. Test black (#000000, luminance 0.0):
   Contrast = (0.107 + 0.05) / (0.0 + 0.05) = 3.14:1
   ✗ Below 7:1 target

4. Search intermediate values...
   Test #F5F5F5 (luminance 0.913):
   Contrast = (0.913 + 0.05) / (0.107 + 0.05) = 6.13:1
   ✗ Still below

5. Test #FFFFFF wins with best ratio (6.69:1 closest to target)
   → foreground: #FFFFFF
```

<!-- ASSET: anatomy-step4-contrast.svg (or .png)
     Shows the primary-500 swatch (#6439FF) with white text on top reading
     "Aa" in large type. Next to it, a small badge showing "6.69:1 ✓".
     Maybe show 2-3 other scale values too (e.g., primary-200 with dark text,
     primary-800 with light text) to show how foreground adapts. -->
<img src="docs/assets/anatomy-step4-contrast.svg" width="480" />

This runs for every single color in the palette. The result: you never need to think about text contrast.

---

## Step 5: Convert to OKLCH

HSL was useful for hue rotation, but the final output uses **OKLCH** — a perceptually uniform color space where equal numeric changes produce equal visual changes.

```
Primary HSL:  hsl(249°, 100%, 61%)
Primary OKLCH: oklch(0.49 0.31 270)
```

| OKLCH Component | Value | Meaning                                    |
| --------------- | ----- | ------------------------------------------ |
| **L** (Lightness) | 0.49 | Perceptual lightness (0 = black, 1 = white) |
| **C** (Chroma)    | 0.31 | Color intensity (0 = gray)                  |
| **H** (Hue)       | 270  | Hue angle on OKLCH wheel                    |

Why OKLCH? In HSL, 50% lightness for yellow looks bright while 50% lightness for blue looks dark. OKLCH corrects this — `L=0.5` looks equally bright for any hue.

<!-- ASSET: anatomy-step5-oklch.png
     Side by side: HSL vs OKLCH scales for two different hues (e.g., the
     blue-violet primary and a yellow). In HSL, the visual "middle" of the two
     scales appears at different positions. In OKLCH, both scales have their
     visual midpoint in the same position. -->
<img src="docs/assets/anatomy-step5-oklch.png" width="600" />

---

## Step 6: CSS output

Everything comes together as CSS custom properties:

```css
:root {
  /* Primary — #6439FF (blue-violet) */
  --color-primary-50: oklch(0.95 0.03 270);
  --color-primary-100: oklch(0.91 0.06 270);
  --color-primary-200: oklch(0.83 0.12 270);
  --color-primary-300: oklch(0.75 0.18 270);
  --color-primary-400: oklch(0.67 0.24 270);
  --color-primary-500: oklch(0.49 0.31 270);   /* Base */
  --color-primary-600: oklch(0.42 0.28 270);
  --color-primary-700: oklch(0.35 0.24 270);
  --color-primary-800: oklch(0.28 0.19 270);
  --color-primary-900: oklch(0.20 0.13 270);
  --color-primary-950: oklch(0.14 0.08 270);
  --color-primary-foreground: oklch(1 0 0);     /* White text */
  --color-primary-contrast: oklch(1 0 0);
  --color-primary-tone-1: oklch(0.49 0.25 270);
  --color-primary-tone-2: oklch(0.49 0.19 270);
  --color-primary-tone-3: oklch(0.49 0.12 270);
  --color-primary-tone-4: oklch(0.49 0.06 270);

  /* Secondary — #FF3964 (red-pink) */
  --color-secondary-50: oklch(0.95 0.03 9);
  /* ... full scale ... */

  /* Tertiary — #39FF64 (green) */
  --color-tertiary-50: oklch(0.95 0.03 149);
  /* ... full scale ... */

  /* Shadcn UI semantic tokens */
  --background: oklch(0.99 0.001 270);
  --foreground: oklch(0.14 0.02 270);
  --primary: oklch(0.49 0.31 270);
  --primary-foreground: oklch(1 0 0);
  /* --card, --muted, --accent, --destructive, etc. */

  /* Typography */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  /* ... through --text-4xl */

  /* Spacing (golden ratio: 1.618) */
  --spacing-1: 0.25rem;
  --spacing-2: 0.405rem;
  /* ... through --spacing-10 */

  /* Gradients */
  --gradient-linear-primary: linear-gradient(
    var(--gradient-direction),
    oklch(0.49 0.31 270),
    oklch(0.49 0.31 9)
  );

  /* Noise texture */
  --background-image-noise: url("data:image/svg+xml,...");
}
```

Dark mode generates a second set under `.dark`:

```css
.dark {
  --color-primary-50: oklch(0.17 0.08 270);  /* Inverted: dark tints */
  --color-primary-950: oklch(0.93 0.03 270); /* Inverted: light shades */
  /* ... */
}
```

---

## Step 7: Use it

```css
@import "./autotheme.css";
```

```html
<body>
  <header style="background: var(--color-primary-500); color: var(--color-primary-foreground);">
    Accessible by default.
  </header>

  <main style="background: var(--color-primary-50);">
    <p style="color: var(--color-primary-900);">
      Tints and shades from color theory.
    </p>
  </main>
</body>
```

With Tailwind:

```html
<div class="bg-primary-500 text-primary-foreground">
  Same thing, utility classes.
</div>
```

<!-- ASSET: anatomy-step7-themed-ui.png
     A small, clean UI component (card or dashboard section) themed with the
     triadic palette from #6439FF. Shows primary, secondary, and tertiary
     colors in use. Light mode on the left, dark mode on the right.
     Should feel like the "payoff" — all that math became this. -->
<img src="docs/assets/anatomy-step7-themed-ui.png" width="720" />

---

## The full picture

```
#6439FF
  │
  ├─ Parse → hsl(249°, 100%, 61%)
  │
  ├─ Harmony (triadic) → 3 colors at 249°, 9°, 129°
  │
  ├─ Expand each → 11 scale steps + 4 tones + foreground + contrast
  │                = 17 variables × 3 colors = 51 variables
  │
  ├─ Accessibility → WCAG AAA foreground for every color
  │
  ├─ Convert → HSL to OKLCH (perceptual uniformity)
  │
  ├─ Generate → CSS variables, Shadcn tokens, typography, spacing
  │
  └─ Output → autotheme.css (light + dark mode)
```

One color in. Complete design system out.

---

## Reference

### CLI

```bash
autotheme --color "#6439FF" --harmony triadic
autotheme --color "#FF6B35" --harmony split-complementary --tailwind --preview
autotheme init
```

### Config

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

### Module API

```typescript
import { Color, generateFullPalette, generateCSS } from "autotheme";

const primary = new Color("#6439FF");
const palette = generateFullPalette(primary, "triadic");
const css = generateCSS({
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
});
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
