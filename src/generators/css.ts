import { Color } from "../core/color";
import type { GeneratedTheme, GeneratorOutput } from "./types";
import { generateNoiseSVG } from "./noise";
import { generateDarkModeCSS } from "./dark-mode";
import { generateUtilityClasses } from "./utilities";
import { generateShadcnCSS } from "./shadcn";
import { generateSemanticCSS } from "./semantic";

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
 * Mapping from tint/shade index to Tailwind scale values
 * Tints: L5=50, L4=100, L3=200, L2=300, L1=400
 * Base: 500
 * Shades: D1=600, D2=700, D3=800, D4=900, D5=950
 */
const TINT_TO_SCALE: Record<number, number> = {
  5: 50,
  4: 100,
  3: 200,
  2: 300,
  1: 400,
};

const SHADE_TO_SCALE: Record<number, number> = {
  1: 600,
  2: 700,
  3: 800,
  4: 900,
  5: 950,
};

/**
 * Generate the main CSS output with all variables
 * Includes Shadcn-compatible variables by default
 * Uses OKLCH color format and Tailwind v4 namespaces
 */
export function generateCSS(theme: GeneratedTheme): GeneratorOutput {
  const { palette, config } = theme;
  const prefix = config.prefix;
  const lines: string[] = [];

  // Generate Shadcn-compatible CSS first (if enabled)
  if (config.shadcn) {
    lines.push("/* ========================================");
    lines.push("   Shadcn UI Compatible Theme Variables");
    lines.push("   ======================================== */");
    lines.push("");
    lines.push(generateShadcnCSS(theme, config.radius));
    lines.push("");
    lines.push("");
  }

  // Semantic design tokens (always emitted)
  lines.push(generateSemanticCSS(theme));
  lines.push("");
  lines.push("");

  // AutoTheme extended variables with Tailwind namespaces
  lines.push("/* ========================================");
  lines.push("   AutoTheme Color Scales (Tailwind v4 compatible)");
  lines.push("   Uses OKLCH color format and 50-950 scale");
  lines.push("   ======================================== */");
  lines.push("");
  lines.push(":root {");

  // Palette colors with Tailwind naming
  palette.palettes.forEach((p, i) => {
    const name = getHarmonyName(i);
    lines.push("");
    lines.push(`    /* ${name.charAt(0).toUpperCase() + name.slice(1)} Color Scale */`);

    // Tints (lighter): L5=50, L4=100, L3=200, L2=300, L1=400
    for (let j = 5; j >= 1; j--) {
      const tint = p.tints[j - 1];
      if (tint) {
        const scale = TINT_TO_SCALE[j];
        lines.push(`    --${prefix}-${name}-${scale}: ${tint.toOKLCH()};`);
      }
    }

    // Base color (500)
    lines.push(`    --${prefix}-${name}-500: ${p.base.toOKLCH()};`);

    // Shades (darker): D1=600, D2=700, D3=800, D4=900, D5=950
    for (let j = 1; j <= 5; j++) {
      const shade = p.shades[j - 1];
      if (shade) {
        const scale = SHADE_TO_SCALE[j];
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
  });

  // Typography scale (Tailwind namespace)
  lines.push("");
  lines.push("    /* Typography Scale */");
  const scalar = config.scalar;
  const textSizes = generateScaledValues(config.fontSize, scalar, 8);
  const sizeNames = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"];
  textSizes.forEach((size, i) => {
    lines.push(`    --text-${sizeNames[i]}: ${size.toFixed(3)}rem;`);
  });

  // Spacing scale (Tailwind namespace)
  if (config.spacing) {
    lines.push("");
    lines.push("    /* Spacing Scale */");
    const spacings = generateScaledValues(0.155, scalar, 10);
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

  // Dark mode
  lines.push("");
  lines.push(generateDarkModeCSS(theme));

  // Utility classes
  if (config.utilities) {
    lines.push("");
    lines.push(generateUtilityClasses(prefix));
  }

  return {
    filename: config.output,
    content: lines.join("\n"),
  };
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
  // Return near-black or near-white based on luminance
  return bg.luminance > 0.5
    ? new Color({ h: bg.hsl.h, s: 100, l: 5, a: 1 })
    : new Color({ h: bg.hsl.h, s: 20, l: 95, a: 1 });
}
