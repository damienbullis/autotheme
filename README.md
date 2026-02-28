# AutoTheme

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![CI](https://github.com/damienbullis/autotheme/actions/workflows/ci.yml/badge.svg)](https://github.com/damienbullis/autotheme/actions/workflows/ci.yml)
![WCAG AAA](https://img.shields.io/badge/WCAG-AAA_%E2%9C%93-228B22)

> A zero-config, zero-dependency tool for generating accessible CSS themes using color theory.

AutoTheme generates color palettes from color harmonies and outputs CSS variables in OKLCH format, compatible with Tailwind v4 and Shadcn UI.

## Install

### npm / bun

```bash
npm install autotheme
# or
bun add autotheme
```

### Standalone Binary

Download from the [releases page](https://github.com/damienbullis/autotheme/releases), or use the install script:

```bash
curl -fsSL https://raw.githubusercontent.com/damienbullis/autotheme/main/install.sh | bash
```

## Usage

### CLI

```bash
# Generate with defaults (random color, analogous harmony)
autotheme

# Specify color and harmony
autotheme --color "#6439FF" --harmony triadic

# Generate with preview and Tailwind output
autotheme -c "#FF6B35" -a split-complementary --preview --tailwind

# Generate dark mode script
autotheme --dark-mode-script

# Interactive config setup
autotheme init
```

### Module API

```typescript
import { generateTheme } from "autotheme";

const result = generateTheme({
  color: "#6439FF",
  harmony: "triadic",
});

// result.css - CSS variables
// result.tailwind - Tailwind v4 CSS (if enabled)
// result.preview - HTML preview (if enabled)
```

### Including Your Theme

**HTML:**

```html
<link rel="stylesheet" href="./src/autotheme.css" />
```

**CSS:**

```css
@import "./autotheme.css";
```

**Framework (React, Vue, etc.):**

```js
import "./src/autotheme.css";
```

## Configuration

AutoTheme can be configured with CLI flags, a config file, or both. CLI flags take priority.

### CLI Flags

| Flag                 | Short | Type      | Description                                       |
| -------------------- | ----- | --------- | ------------------------------------------------- |
| `--color`            | `-c`  | `string`  | Primary color (hex, rgb, hsl)                     |
| `--harmony`          | `-a`  | `string`  | Color harmony type                                |
| `--output`           | `-o`  | `string`  | Output file path (default: `./src/autotheme.css`) |
| `--config`           |       | `string`  | Path to config file                               |
| `--prefix`           |       | `string`  | CSS variable prefix (default: `color`)            |
| `--font-size`        |       | `number`  | Base font size in rem (default: `1`)              |
| `--preview`          |       | `boolean` | Generate HTML preview                             |
| `--tailwind`         |       | `boolean` | Generate Tailwind v4 CSS                          |
| `--dark-mode-script` |       | `boolean` | Generate dark mode script                         |
| `--no-gradients`     |       | `boolean` | Disable gradient variable generation              |
| `--no-spacing`       |       | `boolean` | Disable spacing scale generation                  |
| `--no-noise`         |       | `boolean` | Disable noise texture generation                  |
| `--no-shadcn`        |       | `boolean` | Disable Shadcn UI variable generation             |
| `--no-utilities`     |       | `boolean` | Disable utility class generation                  |
| `--silent`           | `-s`  | `boolean` | Suppress output                                   |
| `--version`          | `-v`  | `boolean` | Display version                                   |
| `--help`             | `-h`  | `boolean` | Display help                                      |

### Config File

AutoTheme looks for `autotheme.json`, `.autothemerc.json`, or `.autothemerc` in the current directory.

```json
{
  "color": "#6439FF",
  "harmony": "analogous",
  "output": "./src/autotheme.css",
  "prefix": "color",
  "fontSize": 1,
  "preview": false,
  "tailwind": false,
  "darkModeScript": false,
  "scalar": 1.618,
  "contrastTarget": 7,
  "radius": "0.625rem",
  "gradients": true,
  "spacing": true,
  "noise": true,
  "shadcn": true,
  "utilities": true
}
```

| Option           | Type      | Default                 | Description                                    |
| ---------------- | --------- | ----------------------- | ---------------------------------------------- |
| `color`          | `string`  | random                  | Primary color (hex, rgb, hsl)                  |
| `harmony`        | `string`  | `"analogous"`           | Color harmony type                             |
| `output`         | `string`  | `"./src/autotheme.css"` | Output file path                               |
| `prefix`         | `string`  | `"color"`               | CSS variable prefix (`--{prefix}-primary-500`) |
| `fontSize`       | `number`  | `1`                     | Base font size in rem for typography scale     |
| `preview`        | `boolean` | `false`                 | Generate HTML preview                          |
| `tailwind`       | `boolean` | `false`                 | Generate Tailwind v4 CSS                       |
| `darkModeScript` | `boolean` | `false`                 | Generate dark mode init script                 |
| `scalar`         | `number`  | `1.618`                 | Golden ratio multiplier for spacing/sizing     |
| `contrastTarget` | `number`  | `7`                     | Target contrast ratio for text colors          |
| `radius`         | `string`  | `"0.625rem"`            | Border radius for Shadcn components            |
| `gradients`      | `boolean` | `true`                  | Generate gradient CSS variables                |
| `spacing`        | `boolean` | `true`                  | Generate spacing scale                         |
| `noise`          | `boolean` | `true`                  | Generate noise texture variable                |
| `shadcn`         | `boolean` | `true`                  | Generate Shadcn UI compatible variables        |
| `utilities`      | `boolean` | `true`                  | Generate CSS utility classes                   |

Use `autotheme init` to interactively create a config file.

## CSS Output

AutoTheme outputs CSS variables in **OKLCH** color format for perceptual uniformity, using **Tailwind v4** variable namespaces. The variable prefix defaults to `color` but can be changed with `--prefix`.

### Color Scale

Each harmony color gets a full scale (shown with default `color` prefix):

```css
--color-primary-50       /* Lightest tint */
--color-primary-100
--color-primary-200
--color-primary-300
--color-primary-400
--color-primary-500      /* Base color */
--color-primary-600
--color-primary-700
--color-primary-800
--color-primary-900
--color-primary-950      /* Darkest shade */
--color-primary-foreground  /* Accessible text color */
--color-primary-contrast    /* High contrast text */
--color-primary-tone-1..4   /* Desaturated variations */
```

With `--prefix at`, variables become `--at-primary-500`, `--at-secondary-500`, etc. When using Tailwind output, `--color-*` aliases are automatically generated so `bg-primary-500` still works.

### Semantic Names

Colors are named by their role in the harmony:

```
--color-primary-*        /* First harmony color */
--color-secondary-*      /* Second harmony color */
--color-tertiary-*       /* Third harmony color */
--color-quaternary-*     /* Fourth harmony color (if applicable) */
```

### Shadcn UI Variables

Full Shadcn UI semantic variables are included (`--background`, `--foreground`, `--primary`, `--card`, `--destructive`, etc.) in OKLCH format. Disable with `--no-shadcn`.

### Other Variables

```css
--text-xs..4xl           /* Typography scale (base size configurable via fontSize) */
--spacing-1..10          /* Spacing scale (disable with --no-spacing) */
--gradient-direction     /* Gradient direction (disable with --no-gradients) */
--gradient-linear-*      /* Linear gradients */
--background-image-noise /* Noise texture SVG (disable with --no-noise) */
```

## Accessible Colors

AutoTheme aims for **WCAG AAA** compliance by default with a **7:1 contrast ratio** for text colors.

Each color in the palette gets a `foreground` color that meets the target contrast ratio against it. The target can be adjusted with the `contrastTarget` config option.

## Harmonies

A harmony is a set of colors related by their position on the color wheel. Set your harmony with `--harmony` or the `harmony` config option.

### Analogous

<img src="docs/assets/analogous2.png" width="600" />

<details>
<summary>See All Harmonies</summary>

#### Split-Complementary

<img src="docs/assets/split-complementary.png" width="600" />

#### Complementary

<img src="docs/assets/complementary.png" width="600" />

#### Triadic

<img src="docs/assets/triadic.png" width="600" />

#### Piroku

<img src="docs/assets/piroku.png" width="600" />

#### Square

<img src="docs/assets/square.png" width="600" />

#### Rectangle

<img src="docs/assets/rectangle.png" width="600" />

#### Aurelian

<img src="docs/assets/aurelian.png" width="600" />

#### Bi-Polar

<img src="docs/assets/bi-polar.png" width="600" />

#### Retrograde

<img src="docs/assets/retrograde.png" width="600" />

> All examples use `#6439FF` to illustrate differences between harmonies.

</details>

### Full Color Palette

<details>
<summary>Palette Structure</summary>

<img src="docs/assets/harmony-details.png" width="600" />

Each color in the harmony consists of:

- **1 base** color (500)
- **5 tints** (50, 100, 200, 300, 400)
- **5 shades** (600, 700, 800, 900, 950)
- **4 tones** (tone-1, tone-2, tone-3, tone-4)
- **1 foreground** color (accessible text)
- **1 contrast** color (high contrast text)

</details>

## Features

### Gradients

AutoTheme generates CSS gradient variables for each harmony color.

```css
--gradient-linear-primary   /* Linear gradient from primary */
--gradient-linear-secondary /* Linear gradient from secondary */
--gradient-direction        /* Configurable gradient direction */
```

### Noise

Use the noise texture variable for adding grain to backgrounds:

```css
.element {
  background-image: var(--background-image-noise);
}
```

<img src="docs/assets/noise.png" width="600" />

### Dark Mode

AutoTheme generates both light and dark mode color schemes. Dark mode activates with the `.dark` class on the root element.

Use the `--dark-mode-script` flag to generate a script that handles:

- System preference detection (`prefers-color-scheme: dark`)
- LocalStorage persistence
- FOUC prevention (include in `<head>`)
- Global `toggleDarkMode()` function

```html
<script src="/darkmode.js"></script>
```

## Development

```bash
git clone https://github.com/damienbullis/autotheme.git
cd autotheme
bun install
```

```bash
bun run dev           # Watch mode
bun run test          # Tests in watch mode
bun run test:run      # Tests once
bun run check         # All checks (typecheck + lint + format + test)
```

## License

[MIT](./LICENSE)
