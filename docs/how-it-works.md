# How It Works

> Follow a single color through AutoTheme's entire pipeline.

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

AutoTheme parses this into OKLCH — a perceptually uniform color space where equal numeric changes produce equal visual changes:

```
#6439FF → oklch(0.49 0.31 270)
```

| Component       | Value | Meaning                                      |
| --------------- | ----- | -------------------------------------------- |
| **L** Lightness | 0.49  | Perceptual brightness (0 = black, 1 = white) |
| **C** Chroma    | 0.31  | Color intensity (0 = gray)                   |
| **H** Hue       | 270   | Position on the color wheel                  |

All subsequent manipulation — hue rotation, tint/shade generation, accessible text calculation — happens in OKLCH.

---

## Step 2: A harmony

We choose **triadic** — three colors equally spaced on the wheel.

The math: take the hue (270°) and add 120° and 240°:

```
Primary:   270°                    → #6439FF (blue-violet)
Secondary: 270° + 120° = 30°      → warm orange
Tertiary:  270° + 240° = 150°     → teal-green
```

<!-- ASSET: anatomy-step2-wheel.svg
     A color wheel showing three dots at 270°, 30°, and 150°, connected by
     an equilateral triangle. Each dot is colored with the actual color.
     Labels: "Primary 270°", "Secondary 30°", "Tertiary 150°".
     The triangle should be drawn with thin white/gray lines. -->
<img src="docs/assets/anatomy-step2-wheel.svg" width="360" />

Three colors. Geometrically balanced. Guaranteed to work together.

AutoTheme has 12 built-in harmonies, each using different geometry:

| Harmony                    | Rotation                        | Colors |
| -------------------------- | ------------------------------- | ------ |
| Complementary              | 0°, 180°                        | 2      |
| Analogous                  | -30°, 0°, +30°                  | 3      |
| Triadic                    | 0°, 120°, 240°                  | 3      |
| Split-Complementary        | 0°, 150°, 210°                  | 3      |
| Drift                      | Progressive spiral              | 4      |
| Square                     | 0°, 90°, 180°, 270°             | 4      |
| Rectangle                  | 0°, 60°, 180°, 240°             | 4      |
| Aurelian                   | 0°, 137.5°, 275° (golden angle) | 3      |
| Bi-Polar                   | 0°, 90°                         | 2      |
| Retrograde                 | 0°, -120°, +120°                | 3      |
| Monochromatic              | Same hue, varying chroma        | 3      |
| Double-Split-Complementary | 0°, 150°, 210°, 30°, 330°       | 5      |

You can also define custom harmonies with arbitrary angles: `--angles "0,72,144"`.

---

## Step 3: Tints, shades, and tones

Each of the 3 colors expands into a full scale. Let's trace the primary:

**Tints** — increase OKLCH lightness:

```
50:  oklch(0.95 ...)  Almost white with a violet hint
100: oklch(0.90 ...)
200: oklch(0.82 ...)
300: oklch(0.74 ...)
400: oklch(0.66 ...)  Noticeably lighter than base
```

**Base:**

```
500: oklch(0.49 ...)  The original color
```

**Shades** — decrease OKLCH lightness:

```
600: oklch(0.42 ...)
700: oklch(0.35 ...)
800: oklch(0.28 ...)
900: oklch(0.20 ...)
950: oklch(0.14 ...)  Near black with violet identity
```

**Tones** — decrease chroma (desaturate):

```
tone-1: oklch(0.49 0.25 270)
tone-2: oklch(0.49 0.19 270)
tone-3: oklch(0.49 0.12 270)
tone-4: oklch(0.49 0.06 270)  Almost gray, barely violet
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

For each color, AutoTheme finds a text color that meets **WCAG AAA** (7:1 contrast ratio).

The algorithm for the primary (`#6439FF`):

```
1. Calculate luminance → 0.107

2. Test white (luminance 1.0):
   Contrast = (1.0 + 0.05) / (0.107 + 0.05) = 6.69:1
   ✗ Below 7:1 target

3. Test black (luminance 0.0):
   Contrast = (0.107 + 0.05) / (0.0 + 0.05) = 3.14:1
   ✗ Below 7:1 target

4. Search intermediate values...
   Best achievable: 6.69:1 with white
   → foreground: white
```

<!-- ASSET: anatomy-step4-contrast.svg (or .png)
     Shows the primary-500 swatch (#6439FF) with white text on top reading
     "Aa" in large type. Next to it, a small badge showing "6.69:1 ✓".
     Maybe show 2-3 other scale values too (e.g., primary-200 with dark text,
     primary-800 with light text) to show how foreground adapts. -->
<img src="docs/assets/anatomy-step4-contrast.svg" width="480" />

This runs for every single color in the palette. You never need to think about text contrast.

---

## Step 5: Semantic tokens

With the palette generated, AutoTheme derives semantic design tokens from the primary hue. Using the **depth** parameter, it creates:

**Surfaces** — tinted neutrals at the primary hue with very low chroma:

```css
--surface: oklch(0.99 0.01 270); /* Page background */
--surface-sunken: oklch(0.97 0.01 270); /* Recessed areas */
--surface-raised: oklch(1 0.01 270); /* Elevated areas */
```

**Text hierarchy** — decreasing contrast from primary to tertiary:

```css
--text-primary: oklch(0.05 0.025 270); /* Headings */
--text-secondary: oklch(0.3 0.018 270); /* Body text */
--text-tertiary: oklch(0.55 0.01 270); /* Captions */
```

**Borders** — subtle to strong:

```css
--border: oklch(0.85 0.012 270);
--border-subtle: oklch(0.92 0.012 270);
--border-strong: oklch(0.75 0.012 270);
```

These are the default output — no `palette: true` needed.

---

## Step 6: CSS output

Everything comes together as CSS custom properties:

```css
:root {
  /* Semantic tokens (default output) */
  --surface: oklch(0.99 0.01 270);
  --surface-foreground: oklch(0.05 0.025 270);
  --text-primary: oklch(0.05 0.025 270);
  --text-secondary: oklch(0.3 0.018 270);
  --border: oklch(0.85 0.012 270);
  --accent: oklch(0.49 0.31 270);
  --accent-foreground: oklch(1 0 0);

  /* Typography */
  --text-xs: 0.512rem;
  --text-sm: 0.64rem;
  /* ... through --text-3xl */

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  /* ... through --spacing-10 */
}

.dark {
  --surface: oklch(0.13 0.01 270);
  --surface-foreground: oklch(0.95 0.025 270);
  --text-primary: oklch(0.95 0.025 270);
  /* ... inverted tokens */
}
```

With `palette: true`, you also get the full scales:

```css
:root {
  --color-primary-50: oklch(0.95 0.03 270);
  --color-primary-500: oklch(0.49 0.31 270);
  --color-primary-950: oklch(0.14 0.08 270);
  --color-primary-foreground: oklch(1 0 0);
  /* ... all harmony colors */
}
```

---

## Step 7: Use it

```css
@import "./autotheme.css";
```

```html
<body style="background: var(--surface); color: var(--surface-foreground);">
  <header style="background: var(--accent); color: var(--accent-foreground);">
    Accessible by default.
  </header>

  <main>
    <h1 style="color: var(--text-primary);">Heading</h1>
    <p style="color: var(--text-secondary);">Body text with clear hierarchy.</p>
  </main>
</body>
```

With Tailwind:

```html
<div class="bg-accent text-accent-foreground">Same thing, utility classes.</div>
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
  ├─ Parse → oklch(0.49 0.31 270)
  │
  ├─ Harmony (triadic) → 3 colors at 270°, 30°, 150°
  │
  ├─ Expand each → 11 scale steps + 4 tones + foreground + contrast
  │                = 17 variables × 3 colors = 51 palette variables
  │
  ├─ Accessibility → WCAG AAA foreground for every color
  │
  ├─ Semantic tokens → surfaces, text, borders, accents (~25 tokens)
  │
  ├─ Optional layers:
  │   ├─ States → hover, active, focus, disabled
  │   ├─ Elevation → surfaces + multi-layer shadows
  │   ├─ Effects → filters, glass, blobs, patterns
  │   └─ Shadcn → Shadcn UI variable aliases
  │
  └─ Output → autotheme.css (light + dark mode)
```

One color in. Complete design system out.
