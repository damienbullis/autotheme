# AutoTheme

### One color in. Entire design system out.

```bash
npx autotheme --color "#6439FF" --harmony triadic
```

<!-- ASSET: hero-output-screenshot.png
     A single, wide screenshot showing the terminal output of the command above
     alongside the generated HTML preview — the palette swatches, the CSS variables,
     and a small themed UI component. Should feel like "one command did all of this." -->
<img src="docs/assets/hero-output-screenshot.png" width="720" />

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![CI](https://github.com/damienbullis/autotheme/actions/workflows/ci.yml/badge.svg)](https://github.com/damienbullis/autotheme/actions/workflows/ci.yml)
![WCAG AAA](https://img.shields.io/badge/WCAG-AAA_%E2%9C%93-228B22)

## Install

```bash
npm install autotheme
```

Or download a [standalone binary](https://github.com/damienbullis/autotheme/releases).

## What you get

From a single color, AutoTheme generates:

- **50–950 color scales** for every harmony color in OKLCH
- **Accessible text colors** — WCAG AAA (7:1) by default
- **Light & dark mode** with system preference detection
- **Tailwind v4** and **Shadcn UI** variables, ready to use
- Typography, spacing, gradients, and noise textures

```css
@import "./autotheme.css";
```

That's it. Your app is themed.

<details>
<summary><strong>Harmonies</strong> — 10 color theory presets</summary>

| Harmony                 | Colors | Vibe                              |
| ----------------------- | ------ | --------------------------------- |
| **Analogous**           | 3      | Harmonious, serene                |
| **Complementary**       | 2      | High contrast, vibrant            |
| **Triadic**             | 3      | Balanced, vibrant                 |
| **Split-Complementary** | 3      | Contrast without tension          |
| **Tetradic**            | 4      | Dynamic, intriguing               |
| **Square**              | 4      | Bold, dynamic                     |
| **Rectangle**           | 4      | Versatile, balanced               |
| **Aurelian**            | 3      | Golden angle — naturally pleasing |
| **Bi-Polar**            | 2      | Strong, focused                   |
| **Retrograde**          | 3      | Reverse triadic — unique          |

> All examples below use `#6439FF`.

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

<details>
<summary><strong>CSS output</strong> — what gets generated</summary>

### Color scale

Each harmony color (primary, secondary, tertiary, quaternary) produces:

```css
--color-primary-50          /* Lightest tint */
--color-primary-100
--color-primary-200
--color-primary-300
--color-primary-400
--color-primary-500         /* Base color */
--color-primary-600
--color-primary-700
--color-primary-800
--color-primary-900
--color-primary-950         /* Darkest shade */
--color-primary-foreground  /* Accessible text */
--color-primary-contrast    /* High contrast text */
--color-primary-tone-1..4   /* Desaturated variations */
```

### Palette structure

<img src="docs/assets/harmony-details.png" width="600" />

### Shadcn UI variables

Full semantic set: `--background`, `--foreground`, `--primary`, `--card`, `--destructive`, `--muted`, `--accent`, and more — all in OKLCH. Disable with `--no-shadcn`.

### Extras

```css
--text-xs..4xl           /* Typography scale */
--spacing-1..10          /* Spacing scale */
--gradient-direction     /* Gradient direction */
--gradient-linear-*      /* Linear gradients */
--background-image-noise /* Noise texture */
```

<img src="docs/assets/noise.png" width="600" />

Toggle individually: `--no-spacing`, `--no-gradients`, `--no-noise`, `--no-utilities`.

</details>

<details>
<summary><strong>Dark mode</strong></summary>

Both light and dark schemes are generated. Dark mode activates with `.dark` on the root.

Use `--dark-mode-script` to generate a script handling system preference detection, localStorage persistence, FOUC prevention, and a global `toggleDarkMode()` function.

```html
<script src="/darkmode.js"></script>
```

</details>

<details>
<summary><strong>Configuration</strong></summary>

### CLI

```bash
autotheme --color "#FF6B35" --harmony split-complementary --tailwind --preview
autotheme init  # Interactive setup
```

### Config file

AutoTheme reads `autotheme.json`, `.autothemerc.json`, or `.autothemerc`. Priority: CLI flags > config file > defaults.

```json
{
  "$schema": "./node_modules/autotheme/schema.json",
  "color": "#6439FF",
  "harmony": "triadic"
}
```

| Option           | Type      | Default                 | Description                                |
| ---------------- | --------- | ----------------------- | ------------------------------------------ |
| `color`          | `string`  | random                  | Primary color (hex, rgb, hsl)              |
| `harmony`        | `string`  | `"analogous"`           | Color harmony type                         |
| `output`         | `string`  | `"./src/autotheme.css"` | Output file path                           |
| `prefix`         | `string`  | `"color"`               | CSS variable prefix                        |
| `fontSize`       | `number`  | `1`                     | Base font size in rem                      |
| `preview`        | `boolean` | `false`                 | Generate HTML preview                      |
| `tailwind`       | `boolean` | `false`                 | Generate Tailwind v4 CSS                   |
| `darkModeScript` | `boolean` | `false`                 | Generate dark mode script                  |
| `scalar`         | `number`  | `1.618`                 | Golden ratio multiplier                    |
| `contrastTarget` | `number`  | `7`                     | Target contrast ratio (3–21)               |
| `radius`         | `string`  | `"0.625rem"`            | Shadcn border radius                       |
| `gradients`      | `boolean` | `true`                  | Gradient variables                         |
| `spacing`        | `boolean` | `true`                  | Spacing scale                              |
| `noise`          | `boolean` | `true`                  | Noise texture                              |
| `shadcn`         | `boolean` | `true`                  | Shadcn UI variables                        |
| `utilities`      | `boolean` | `true`                  | Utility classes                            |

</details>

<details>
<summary><strong>Module API</strong></summary>

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

Individual generators: `generateTailwindCSS()`, `generatePreview()`, `generateDarkModeScript()`.

</details>

<details>
<summary><strong>Development</strong></summary>

```bash
git clone https://github.com/damienbullis/autotheme.git && cd autotheme && bun install
```

```bash
bun run dev           # Watch mode
bun run dev:web       # Web app dev server
bun run test          # Tests (watch)
bun run check         # All checks
```

</details>

## License

[MIT](./LICENSE)
