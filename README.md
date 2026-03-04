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

- **Semantic design tokens** — surfaces, text hierarchy, borders, accents — all depth-derived
- **Accessible text colors** — WCAG AAA (7:1) by default
- **Light & dark mode** with system preference detection
- **States** — hover, active, focus, disabled modifier tokens
- **Elevation** — multi-layer tinted shadows with surface progression
- **Visual effects** — glass, patterns, filters (grain/glow/duotone), blend modes, blobs
- **Accessibility** — contrast checking/fixing, CVD simulation, P3 gamut support
- **Tailwind v4** and **Shadcn UI** variables, ready to use
- Typography, spacing, shadows, radius, motion tokens, gradients, and noise textures

```css
@import "./autotheme.css";
```

That's it. Your app is themed.

---

<details>
<summary><strong>I want a theme for my project</strong></summary>

Run one command. Get a CSS file.

```bash
autotheme --color "#6439FF" --harmony triadic
```

Import it:

```css
@import "./autotheme.css";
```

You get semantic design tokens (surfaces, text, borders, accents), light/dark mode, accessible text colors, typography, spacing, and gradients — all as CSS variables in OKLCH format.

</details>

<details>
<summary><strong>I want Tailwind v4 colors that just work</strong></summary>

```bash
autotheme --color "#FF6B35" --harmony analogous --tailwind
```

This generates Tailwind-compatible CSS with `@theme` directives. Use the colors like any Tailwind color:

```html
<div class="bg-primary-500 text-primary-foreground">Accessible by default.</div>

<div class="bg-secondary-200 dark:bg-secondary-800">Dark mode included.</div>
```

Every color gets a 50–950 scale, foreground, contrast, and tone variants.

</details>

<details>
<summary><strong>I want Shadcn UI colors that actually match</strong></summary>

AutoTheme generates all Shadcn UI semantic variables:

```bash
autotheme --color "#6439FF" --harmony split-complementary --shadcn
```

The output includes `--background`, `--foreground`, `--primary`, `--secondary`, `--accent`, `--muted`, `--card`, `--destructive`, `--ring`, `--border`, and more — all derived from your harmony, all in OKLCH.

No manual color picking. No copy-pasting hex values from a design tool. The colors are mathematically related and visually consistent.

Don't need them? `--no-shadcn`.

</details>

<details>
<summary><strong>I want accessible colors without thinking about it</strong></summary>

Every color AutoTheme generates comes with a `foreground` variable — a text color that meets **WCAG AAA** (7:1 contrast ratio) against that background.

```css
/* These are guaranteed accessible together */
background: var(--color-primary-500);
color: var(--color-primary-foreground);
```

Check your entire palette's contrast compliance:

```bash
autotheme --color "#6439FF" --check-contrast aaa
```

AutoTheme also simulates color vision deficiencies (protanopia, deuteranopia, tritanopia) so you can verify your palette works for everyone.

</details>

<details>
<summary><strong>I want dark mode that just works</strong></summary>

AutoTheme generates both light and dark schemes. Dark mode activates with `.dark` on your root element or via `prefers-color-scheme`.

The included dark mode script prevents FOUC:

```html
<head>
  <script src="/darkmode.js"></script>
</head>
```

This gives you:

- System preference detection (`prefers-color-scheme`)
- LocalStorage persistence across visits
- FOUC prevention (no flash of wrong theme)
- A global `toggleDarkMode()` function

</details>

<details>
<summary><strong>I want preview the palette before committing</strong></summary>

```bash
autotheme --color "#6439FF" --harmony triadic --preview
```

This generates an HTML file showing every color swatch, the full scale, text contrast validation, and semantic color usage.

<img src="docs/assets/harmony-details.png" width="600" />

</details>

<details>
<summary><strong>I want to understand why these colors go together</strong></summary>

AutoTheme uses **color harmonies** — geometric relationships on the color wheel. Pick a harmony based on the feel you want:

| I want something...        | Use                          | Colors |
| -------------------------- | ---------------------------- | ------ |
| Calm and cohesive          | `analogous`                  | 3      |
| Bold and high contrast     | `complementary`              | 2      |
| Vibrant but balanced       | `triadic`                    | 3      |
| Contrasty without clashing | `split-complementary`        | 3      |
| Rich and complex           | `square` or `rectangle`      | 4      |
| Naturally pleasing         | `aurelian`                   | 3      |
| Focused and decisive       | `bi-polar`                   | 2      |
| Subtle and cohesive        | `monochromatic`              | 3      |
| Unique and unexpected      | `retrograde`                 | 3      |
| Dynamic and spiraling      | `drift`                      | 4      |
| Maximum versatility        | `double-split-complementary` | 5      |
| Your own angles            | `custom --angles "0,72,144"` | any    |

> All examples use `#6439FF`.

<img src="docs/assets/analogous2.png" width="600" />
<img src="docs/assets/complementary.png" width="600" />
<img src="docs/assets/triadic.png" width="600" />
<img src="docs/assets/split-complementary.png" width="600" />
<img src="docs/assets/square.png" width="600" />
<img src="docs/assets/rectangle.png" width="600" />
<img src="docs/assets/aurelian.png" width="600" />
<img src="docs/assets/bi-polar.png" width="600" />
<img src="docs/assets/retrograde.png" width="600" />

</details>

<details>
<summary><strong>I want fine-grained control</strong></summary>

### Config file

Create `autotheme.json` (or use `autotheme init`):

```json
{
  "$schema": "./node_modules/autotheme/schema.json",
  "color": "#6439FF",
  "harmony": "triadic",
  "semantics": { "depth": 0.15 },
  "states": true,
  "elevation": { "levels": 5 },
  "effects": true,
  "shadcn": true
}
```

Features use the `boolean | Config` pattern: `true` enables with defaults, `false` disables, or pass an object for customization.

### CLI flags

```bash
autotheme \
  --color "#FF6B35" \
  --harmony split-complementary \
  --output ./styles/theme.css \
  --format oklch \
  --prefix brand \
  --states \
  --elevation \
  --effects \
  --patterns \
  --tailwind \
  --preview \
  --no-noise \
  --no-gradients
```

### Toggle features

| Flag               | Description                  | Default |
| ------------------ | ---------------------------- | ------- |
| `--palette`        | Full 50-950 color scale      | off     |
| `--semantics`      | Semantic design tokens       | on      |
| `--states`         | Hover/active/focus/disabled  | off     |
| `--elevation`      | Elevation surfaces + shadows | off     |
| `--shadows`        | Shadow scale                 | off     |
| `--radius`         | Border radius scale          | off     |
| `--effects`        | Filters, glass, blobs        | off     |
| `--patterns`       | SVG pattern utilities        | off     |
| `--shadcn`         | Shadcn UI variables          | off     |
| `--tailwind`       | Tailwind v4 CSS              | off     |
| `--gradients`      | Gradient variables           | on      |
| `--spacing`        | Spacing scale                | on      |
| `--typography`     | Typography scale             | on      |
| `--noise`          | Noise texture                | on      |
| `--utilities`      | Utility classes              | on      |
| `--check-contrast` | Contrast compliance (aa/aaa) | off     |
| `--stdout`         | Output to stdout             | off     |
| `--preset`         | Use built-in preset          | —       |
| `--format`         | oklch, hsl, rgb, hex         | oklch   |
| `--angles`         | Custom harmony angles        | —       |

Use `--no-<flag>` to disable any feature (e.g., `--no-gradients`).

Priority: CLI flags > config file > presets > defaults.

### All config options

| Option       | Type                | Default                                            | Description                          |
| ------------ | ------------------- | -------------------------------------------------- | ------------------------------------ |
| `color`      | `string`            | random                                             | Primary color (hex, rgb, hsl, oklch) |
| `harmony`    | `string`            | `"analogous"`                                      | Harmony type (12 built-in + custom)  |
| `mode`       | `string`            | `"both"`                                           | `"light"`, `"dark"`, or `"both"`     |
| `palette`    | `boolean \| object` | `false`                                            | Full 50-950 palette scale            |
| `semantics`  | `boolean \| object` | `true`                                             | Semantic tokens (depth, surfaces)    |
| `states`     | `boolean \| object` | `false`                                            | Interactive state tokens             |
| `elevation`  | `boolean \| object` | `false`                                            | Elevation system                     |
| `typography` | `boolean \| object` | `true`                                             | Typography scale                     |
| `spacing`    | `boolean \| object` | `true`                                             | Spacing scale                        |
| `shadows`    | `boolean \| object` | `false`                                            | Shadow scale                         |
| `radius`     | `boolean \| object` | `false`                                            | Border radius scale                  |
| `motion`     | `boolean \| object` | `false`                                            | Motion/spring tokens                 |
| `gradients`  | `boolean`           | `true`                                             | Gradient variables                   |
| `noise`      | `boolean`           | `true`                                             | Noise texture                        |
| `utilities`  | `boolean`           | `true`                                             | Utility classes                      |
| `patterns`   | `boolean \| object` | `false`                                            | SVG patterns                         |
| `effects`    | `boolean \| object` | `false`                                            | Visual effects                       |
| `shadcn`     | `boolean \| object` | `false`                                            | Shadcn UI variables                  |
| `output`     | `object`            | `{ path: "./src/autotheme.css", format: "oklch" }` | Output options                       |

</details>

<details>
<summary><strong>I want to use it programmatically</strong></summary>

```typescript
import { generateTheme, Color } from "autotheme";
import { resolveConfig } from "autotheme";

// Quick: generate a complete theme
const theme = generateTheme({
  color: "#6439FF",
  harmony: "triadic",
  semantics: true,
  states: true,
  elevation: true,
});

// Use individual pieces
import { generateHarmony, generateFullPalette } from "autotheme";
import { checkContrast, simulateCVD } from "autotheme";

const primary = new Color("#6439FF");
const harmony = generateHarmony(primary, "triadic");
const palette = generateFullPalette(primary, "triadic");
```

</details>

---

## Learn more

- [How it works](docs/how-it-works.md) — Follow a color through the entire pipeline
- [Philosophy](docs/philosophy.md) — Why AutoTheme exists and the principles behind it
- [Architecture](docs/architecture.md) — Internal code structure for contributors
- [Features](docs/features.md) — Complete feature catalog

## I want to contribute

```bash
git clone https://github.com/damienbullis/autotheme.git && cd autotheme && bun install
bun run dev       # Watch mode
bun run test      # Tests
bun run check     # All checks (typecheck + lint + format + test)
```

## License

[MIT](./LICENSE)
