import { Color } from "../core/color";
import type { GeneratedTheme, GeneratorOutput } from "./types";
import { generateNoiseSVG } from "./noise";
import { generateDarkModeCSS } from "./dark-mode";
import { generateUtilityClasses } from "./utilities";
import { generateShadcnCSS } from "./shadcn";
import { generateSemanticCSS } from "./semantic";
import { generateAlphaVariants } from "./alpha";

/**
 * Semantic names for harmony colors by index
 */
const HARMONY_NAMES = ["primary", "secondary", "tertiary", "quaternary"] as const;

/**
 * Get the semantic name for a harmony color by index
 */
export function getHarmonyName(index: number): string {
  return HARMONY_NAMES[index] || `color-${index + 1}`;
}

/**
 * Default Tailwind scale points for tints and shades
 */
const DEFAULT_TINT_SCALE_POINTS = [50, 100, 200, 300, 400];
const DEFAULT_SHADE_SCALE_POINTS = [600, 700, 800, 900, 950];

/**
 * Build a mapping from 1-based variation index to scale number.
 * When count matches the predefined length, uses exact mapping.
 * When count differs, evenly distributes across the predefined range.
 * Index is 1-based from lightest/darkest end (tints reversed, shades forward).
 */
export function buildScaleMapping(count: number, scalePoints: number[]): Record<number, number> {
  const mapping: Record<number, number> = {};
  if (count === 0) return mapping;
  if (count === 1) {
    // Single variation gets the middle scale point
    mapping[1] = scalePoints[Math.floor(scalePoints.length / 2)]!;
    return mapping;
  }
  if (count === scalePoints.length) {
    // Exact match: direct mapping
    for (let i = 0; i < count; i++) {
      mapping[i + 1] = scalePoints[i]!;
    }
    return mapping;
  }
  // Distribute evenly across the range
  const min = scalePoints[0]!;
  const max = scalePoints[scalePoints.length - 1]!;
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    mapping[i + 1] = Math.round(min + t * (max - min));
  }
  return mapping;
}

/**
 * Generate the main CSS output with all variables
 * Uses OKLCH color format and Tailwind v4 namespaces
 */
export function generateCSS(theme: GeneratedTheme): GeneratorOutput {
  const { palette, config } = theme;
  const prefix = config.palette.prefix;
  const lines: string[] = [];

  // AutoTheme extended variables with Tailwind namespaces
  lines.push("/* ========================================");
  lines.push("   AutoTheme Color Scales (Tailwind v4 compatible)");
  lines.push("   Uses OKLCH color format and 50-950 scale");
  lines.push("   ======================================== */");
  lines.push("");
  lines.push(":root {");

  // Build dynamic scale mappings
  const tintCount = palette.palettes[0]?.tints.length ?? 5;
  const shadeCount = palette.palettes[0]?.shades.length ?? 5;
  const tintScaleMap = buildScaleMapping(tintCount, DEFAULT_TINT_SCALE_POINTS);
  const shadeScaleMap = buildScaleMapping(shadeCount, DEFAULT_SHADE_SCALE_POINTS);

  // Palette colors with Tailwind naming
  palette.palettes.forEach((p, i) => {
    const name = getHarmonyName(i);
    lines.push("");
    lines.push(`    /* ${name.charAt(0).toUpperCase() + name.slice(1)} Color Scale */`);

    // Tints (lighter): reversed so lightest (highest index) gets smallest scale number
    for (let j = p.tints.length; j >= 1; j--) {
      const tint = p.tints[j - 1];
      if (tint) {
        const scale = tintScaleMap[p.tints.length - j + 1];
        lines.push(`    --${prefix}-${name}-${scale}: ${tint.toOKLCH()};`);
      }
    }

    // Base color (500)
    lines.push(`    --${prefix}-${name}-500: ${p.base.toOKLCH()};`);

    // Shades (darker)
    for (let j = 1; j <= p.shades.length; j++) {
      const shade = p.shades[j - 1];
      if (shade) {
        const scale = shadeScaleMap[j];
        lines.push(`    --${prefix}-${name}-${scale}: ${shade.toOKLCH()};`);
      }
    }

    // Foreground (accessible text color)
    const textColor = palette.textColors.get(`c${i}-base`);
    if (textColor) {
      lines.push(`    --${prefix}-${name}-foreground: ${textColor.toOKLCH()};`);
    }

    // Contrast color
    const contrastColor = findContrastColor(p.base);
    lines.push(`    --${prefix}-${name}-contrast: ${contrastColor.toOKLCH()};`);

    // Tones (desaturated): tone-1 through tone-4
    p.tones.forEach((tone, j) => {
      lines.push(`    --${prefix}-${name}-tone-${j + 1}: ${tone.toOKLCH()};`);
    });

    // Alpha variants (transparent overlays)
    if (config.palette.alphaVariants) {
      const av = generateAlphaVariants(p.base, config.palette.alphaSteps);
      lines.push(`    --${prefix}-${name}-bg: ${av.bg.toOKLCH()};`);
      lines.push(`    --${prefix}-${name}-border: ${av.border.toOKLCH()};`);
      lines.push(`    --${prefix}-${name}-glow: ${av.glow.toOKLCH()};`);
      lines.push(`    --${prefix}-${name}-hover: ${av.hover.toOKLCH()};`);
    }
  });

  // Typography scale (Tailwind namespace)
  if (config.typography.enabled) {
    lines.push("");
    lines.push("    /* Typography Scale */");
    const typoValues = config.typography.values
      ? config.typography.values
      : generateCenteredScale(
          config.typography.base,
          config.typography.ratio,
          config.typography.steps,
        );
    const typoNames = config.typography.names ?? generateTypographyNames(typoValues.length);
    typoValues.forEach((size, i) => {
      const name = typoNames[i] ?? `size-${i + 1}`;
      lines.push(`    --text-${name}: ${size.toFixed(3)}rem;`);
    });
  }

  // Spacing scale (Tailwind namespace)
  if (config.spacing.enabled) {
    lines.push("");
    lines.push("    /* Spacing Scale */");
    const spacings = config.spacing.values
      ? config.spacing.values
      : generateScaledValues(config.spacing.base, config.spacing.ratio, config.spacing.steps);
    spacings.forEach((space, i) => {
      lines.push(`    --spacing-${i + 1}: ${space.toFixed(3)}rem;`);
    });
  }

  // Noise background
  if (config.noise) {
    lines.push("");
    lines.push("    /* Background Images */");
    lines.push(`    --background-image-noise: ${generateNoiseSVG()};`);
  }

  // Gradients
  if (config.gradients) {
    lines.push("");
    lines.push("    /* Gradients */");
    lines.push("    --gradient-direction: to right;");
    palette.palettes.forEach((_, i) => {
      if (i === 0) return;
      const targetName = getHarmonyName(i);
      lines.push(`    --gradient-linear-${targetName}: linear-gradient(`);
      lines.push("        var(--gradient-direction),");
      lines.push(`        var(--${prefix}-primary-500),`);
      lines.push(`        var(--${prefix}-${targetName}-500)`);
      lines.push("    );");
    });

    // Rainbow gradient
    lines.push("    --gradient-linear-rainbow: linear-gradient(");
    lines.push("        var(--gradient-direction),");
    lines.push("        oklch(0.628 0.258 29.234),");
    lines.push("        oklch(0.792 0.176 70.067),");
    lines.push("        oklch(0.968 0.211 109.769),");
    lines.push("        oklch(0.866 0.295 142.495),");
    lines.push("        oklch(0.452 0.313 264.052),");
    lines.push("        oklch(0.318 0.175 303.108),");
    lines.push("        oklch(0.491 0.319 303.108)");
    lines.push("    );");
  }

  lines.push("}");

  // Semantic tokens
  if (config.semantics.enabled) {
    lines.push("");
    lines.push("/* ========================================");
    lines.push("   AutoTheme Semantic Tokens");
    lines.push("   ======================================== */");
    lines.push("");
    lines.push(generateSemanticCSS(theme));
  }

  // Shadcn UI variables (after semantics, since shadcn references semantic tokens)
  if (config.shadcn.enabled) {
    lines.push("");
    lines.push("/* ========================================");
    lines.push("   Shadcn UI Compatible Theme Variables");
    lines.push("   ======================================== */");
    lines.push("");
    lines.push(generateShadcnCSS(theme, config.shadcn.radius));
  }

  // Dark mode
  if (config.mode === "both" || config.mode === "dark") {
    lines.push("");
    lines.push(generateDarkModeCSS(theme));
  }

  // Utility classes
  if (config.utilities) {
    lines.push("");
    lines.push(generateUtilityClasses(prefix));
  }

  return {
    filename: config.output.path,
    content: lines.join("\n"),
  };
}

/**
 * Generate a centered scale around a base value.
 * Produces steps below and above the base using the ratio.
 */
export function generateCenteredScale(base: number, ratio: number, steps: number): number[] {
  const stepsBelow = Math.floor(steps / 2);
  const stepsAbove = steps - 1 - stepsBelow;
  const values: number[] = [];

  // Steps below base (smallest first)
  for (let i = stepsBelow; i >= 1; i--) {
    values.push(base / Math.pow(ratio, i));
  }

  // Base
  values.push(base);

  // Steps above base
  for (let i = 1; i <= stepsAbove; i++) {
    values.push(base * Math.pow(ratio, i));
  }

  return values;
}

/**
 * Generate default typography names based on step count.
 * Centered around "base", with smaller sizes below and larger above.
 */
export function generateTypographyNames(count: number): string[] {
  const below = Math.floor(count / 2);
  const above = count - 1 - below;
  const names: string[] = [];

  const smallNames = ["4xs", "3xs", "2xs", "xs", "sm"];
  const largeNames = ["md", "lg", "xl", "2xl", "3xl", "4xl"];

  // Pick from the end of smallNames
  for (let i = 0; i < below; i++) {
    const idx = smallNames.length - below + i;
    names.push(smallNames[idx] ?? `size-${i + 1}`);
  }

  names.push("base");

  for (let i = 0; i < above; i++) {
    names.push(largeNames[i] ?? `size-${below + 2 + i}`);
  }

  return names;
}

/**
 * Generate a series of values scaled by a multiplier
 */
export function generateScaledValues(base: number, scalar: number, count: number): number[] {
  const values: number[] = [];
  let current = base;
  for (let i = 0; i < count; i++) {
    values.push(current);
    current *= scalar;
  }
  return values;
}

/**
 * Find a contrasting text color based on luminance
 */
export function findContrastColor(bg: Color): Color {
  return bg.luminance > 0.5
    ? new Color({ h: bg.hsl.h, s: 100, l: 5, a: 1 })
    : new Color({ h: bg.hsl.h, s: 20, l: 95, a: 1 });
}
