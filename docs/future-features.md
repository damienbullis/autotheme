# Future Features

Ideas and planned enhancements for AutoTheme, roughly ordered by priority.

---

## CLI Theme Generation (Blocking)

The CLI currently stubs out the actual generation step (`src/cli/cli.ts:30`). Wiring `generateTheme()` and `writeOutputs()` is the critical path to making the CLI functional.

**What's needed:**
- Import `Color`, `generateFullPalette`, `generateCSS` into the CLI run loop
- Call `writeOutputs(theme, config)` to write all enabled outputs
- Handle random color generation when no `--color` is provided
- Print summary of generated files on completion

**Status:** All generators exist and are tested. This is pure plumbing.

---

## Export Formats

Currently outputs CSS only. Other formats would make AutoTheme useful in more contexts.

### JSON / JS Module Export

Emit the full palette and semantic tokens as a JSON file or ES module for use in JS/TS code, design tools, or non-CSS pipelines.

```json
{
  "primary": { "500": "oklch(0.49 0.27 285)", "foreground": "oklch(1 0 0)", ... },
  "semantic": { "surface": "oklch(0.97 0.01 285)", ... }
}
```

### SCSS Variables

For projects not on Tailwind v4 or native CSS custom properties:

```scss
$color-primary-500: oklch(0.49 0.27 285);
$surface: oklch(0.97 0.01 285);
```

### Figma / Design Token Format

Export in [W3C Design Token](https://design-tokens.github.io/community-group/format/) format for handoff to design tools.

---

## Color Blindness Simulation

Add a `--simulate` flag or web app toggle to preview how the theme looks under different color vision deficiencies.

**Types to support:**
- Deuteranopia (red-green, ~6% of males)
- Protanopia (red-green, ~2% of males)
- Tritanopia (blue-yellow, rare)
- Achromatopsia (total color blindness)

**Implementation:** Apply a 3x3 color matrix to each RGB value before output. Matrices are well-documented (Brettel et al.). Could emit as an additional CSS file or a preview-only feature.

---

## Theme Presets

Pre-configured color + harmony combinations for common use cases.

```bash
autotheme --preset ocean     # #0077B6, analogous
autotheme --preset sunset    # #FF6B35, split-complementary
autotheme --preset forest    # #2D6A4F, triadic
autotheme --preset midnight  # #1B1464, complementary
```

**Implementation:** A simple `Record<string, { color: string; harmony: HarmonyType }>` map shipped with the CLI. No new architecture needed.

---

## Theme Inspection Command

A CLI command to inspect a generated theme without writing files.

```bash
autotheme inspect --color "#6439FF" --harmony triadic

# Output:
# Harmony: triadic (3 colors)
# Primary:   #6439FF (H:256 S:100 L:61)
# Secondary: #39FF64 (H:136 S:100 L:61)
# Tertiary:  #FF6439 (H:16  S:100 L:61)
# Accent:    #39FF64 (hue distance: 120°)
# Variables: 51 palette + 37 semantic + 27 shadcn = 115 total
# Files:     autotheme.css (shadcn + semantic + palette + dark mode + utilities)
```

Useful for debugging and understanding what a harmony produces before committing.

---

## Additional Harmony Types

### Custom Angle Harmony

Let users define arbitrary hue offsets:

```bash
autotheme --harmony custom --angles "0,45,210"
```

The `generateCustomHarmony()` function already exists in `src/core/harmonies.ts` — this just needs a CLI/config surface.

### Monochromatic

Single hue with lightness/saturation variations only. Common request for minimal designs.

### Double Split-Complementary

5 colors: base + two splits on each side of the complement. More complex but useful for data-heavy UIs.

---

## Framework Integration Guides

Step-by-step docs for common setups:

- **Next.js** — `app/globals.css` import, `next-themes` integration for dark mode
- **Vue / Nuxt** — Scoped vs global theming, Nuxt color-mode module
- **Svelte / SvelteKit** — `app.css` import, media query dark mode
- **Astro** — Integration with `@astrojs/tailwind`, island architecture considerations
- **Vanilla / CDN** — Direct `<link>` import, darkmode.js script placement

---

## Web App Enhancements

The web previewer (`src/web/`) already has interactive color picking and live preview. Potential additions:

### Export Buttons

Download generated CSS, Tailwind CSS, or JSON directly from the web UI instead of using the CLI.

### Shareable URLs

Already partially implemented via query params (`?color=6439FF&harmony=triadic`). Could add:
- Copy-to-clipboard button for the share URL
- Social preview (Open Graph) meta tags for shared links
- QR code for mobile preview

### Side-by-Side Comparison

Compare two harmonies or two colors in split view to help users decide.

### Accessibility Audit Panel

Real-time contrast ratio display for all semantic token pairs. Flag any pairs that fall below AA or AAA thresholds. The `checkWCAG()` function already exists in `src/core/contrast.ts`.

---

## Animation Tokens

Extend the design system with motion primitives:

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
```

Low effort (static values), but completes the design system story alongside typography and spacing.

---

## Multi-Color Input

Currently AutoTheme takes a single primary color and generates everything from it. A multi-color mode would let users lock specific harmony colors:

```bash
autotheme --color "#6439FF" --secondary "#FF6B35" --harmony triadic
```

The locked color overrides the computed harmony position. Useful when brand guidelines specify exact secondary/accent colors.

---

## CSS Layers

Wrap output in CSS `@layer` directives for better cascade control:

```css
@layer autotheme.palette {
  :root { --color-primary-500: ...; }
}

@layer autotheme.semantic {
  :root { --surface: ...; }
}

@layer autotheme.shadcn {
  :root { --background: ...; }
}
```

Opt-in via `--layers` flag. Prevents specificity conflicts when users override individual tokens.

---

## P3 Wide Gamut Support

OKLCH already supports colors outside sRGB. A `--gamut wide` flag could:

- Use the full P3 gamut for more vivid colors
- Add `@media (color-gamut: p3)` blocks with enhanced values
- Fall back gracefully to sRGB-clamped values

The Color class already handles OKLCH output — this mainly needs gamut-aware clamping in `conversions.ts`.

---

## Config Cascade / Extends

Let config files extend other configs:

```json
{
  "$schema": "./node_modules/autotheme/schema.json",
  "extends": "./base-theme.json",
  "color": "#6439FF"
}
```

Useful for maintaining brand-consistent themes across multiple projects or light/dark variants.
