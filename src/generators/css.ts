import { Color } from "../core/color";
import type { GeneratedTheme, GeneratorOutput } from "./types";
import { generateNoiseSVG } from "./noise";
import { generateDarkModeCSS } from "./dark-mode";
import { generateUtilityClasses } from "./utilities";
import { generateShadcnCSS } from "./shadcn";
import { generateSemanticCSS, generateLightDarkSemanticCSS } from "./semantic";
import { generateAlphaVariants } from "./alpha";
import { generateShadowScale } from "./shadow";
import { generateReactiveCSS } from "./reactive";
import { generatePropertyDeclarations } from "./property";
import { generateMotionCSS } from "./motion";
import { fluidValue } from "./fluid";
import { maxChromaAtHueAndLightness } from "../core/gamut";

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
  const comments = config.output.comments;
  const lines: string[] = [];

  const colorFormat = config.colorFormat;
  const formatLabel = colorFormat.toUpperCase();
  const layers = config.output.layers;

  // Metadata header
  if (comments) {
    lines.push("/* ========================================");
    lines.push(`   AutoTheme v2 — Generated ${new Date().toISOString().split("T")[0]}`);
    lines.push(`   Color: ${config.color} | Harmony: ${config.harmony}`);
    lines.push(`   Mode: ${config.mode} | Format: ${formatLabel}`);
    lines.push("   ======================================== */");
    lines.push("");
  }

  // Layer order declaration
  if (layers) {
    lines.push(
      "@layer autotheme.palette, autotheme.semantics, autotheme.scales, autotheme.utilities;",
    );
    lines.push("");
  }

  // @property declarations (before :root)
  if (config.output.registered) {
    lines.push(generatePropertyDeclarations(theme));
    lines.push("");
  }

  // AutoTheme extended variables with Tailwind namespaces
  if (comments) {
    lines.push("/* ========================================");
    lines.push("   AutoTheme Color Scales (Tailwind v4 compatible)");
    lines.push(`   Uses ${formatLabel} color format and 50-950 scale`);
    lines.push("   ======================================== */");
  }
  lines.push("");
  if (layers) lines.push("@layer autotheme.palette {");
  lines.push(":root {");

  // color-scheme for light-dark() mode
  if (config.output.lightDark && config.mode === "both") {
    lines.push("    color-scheme: light dark;");
  }

  if (config.output.reactive) {
    // Reactive mode: use relative color syntax for runtime-derivable palettes
    lines.push(generateReactiveCSS(theme));

    // Still emit foreground/contrast colors statically (they need contrast calculation)
    palette.palettes.forEach((p, i) => {
      const name = getHarmonyName(i);
      const textColor = palette.textColors.get(`c${i}-base`);
      if (textColor) {
        lines.push(`    --${prefix}-${name}-foreground: ${textColor.formatAs(colorFormat)};`);
      }
      const contrastColor = findContrastColor(p.base);
      lines.push(`    --${prefix}-${name}-contrast: ${contrastColor.formatAs(colorFormat)};`);
    });
  } else {
    // Static mode: emit literal color values
    // Build dynamic scale mappings
    const tintCount = palette.palettes[0]?.tints.length ?? 5;
    const shadeCount = palette.palettes[0]?.shades.length ?? 5;
    const tintScaleMap = buildScaleMapping(tintCount, DEFAULT_TINT_SCALE_POINTS);
    const shadeScaleMap = buildScaleMapping(shadeCount, DEFAULT_SHADE_SCALE_POINTS);

    // Palette colors with Tailwind naming
    palette.palettes.forEach((p, i) => {
      const name = getHarmonyName(i);
      lines.push("");
      if (comments) {
        lines.push(`    /* ${name.charAt(0).toUpperCase() + name.slice(1)} Color Scale */`);
      }

      // Tints (lighter): reversed so lightest (highest index) gets smallest scale number
      for (let j = p.tints.length; j >= 1; j--) {
        const tint = p.tints[j - 1];
        if (tint) {
          const scale = tintScaleMap[p.tints.length - j + 1];
          lines.push(`    --${prefix}-${name}-${scale}: ${tint.formatAs(colorFormat)};`);
        }
      }

      // Base color (500)
      lines.push(`    --${prefix}-${name}-500: ${p.base.formatAs(colorFormat)};`);

      // Shades (darker)
      for (let j = 1; j <= p.shades.length; j++) {
        const shade = p.shades[j - 1];
        if (shade) {
          const scale = shadeScaleMap[j];
          lines.push(`    --${prefix}-${name}-${scale}: ${shade.formatAs(colorFormat)};`);
        }
      }

      // Foreground (accessible text color)
      const textColor = palette.textColors.get(`c${i}-base`);
      if (textColor) {
        lines.push(`    --${prefix}-${name}-foreground: ${textColor.formatAs(colorFormat)};`);
      }

      // Contrast color
      const contrastColor = findContrastColor(p.base);
      lines.push(`    --${prefix}-${name}-contrast: ${contrastColor.formatAs(colorFormat)};`);

      // Tones (desaturated): tone-1 through tone-4
      p.tones.forEach((tone, j) => {
        lines.push(`    --${prefix}-${name}-tone-${j + 1}: ${tone.formatAs(colorFormat)};`);
      });

      // Alpha variants (transparent overlays)
      if (config.palette.alphaVariants) {
        const av = generateAlphaVariants(p.base, config.palette.alphaSteps);
        lines.push(`    --${prefix}-${name}-bg: ${av.bg.formatAs(colorFormat)};`);
        lines.push(`    --${prefix}-${name}-border: ${av.border.formatAs(colorFormat)};`);
        lines.push(`    --${prefix}-${name}-glow: ${av.glow.formatAs(colorFormat)};`);
        lines.push(`    --${prefix}-${name}-hover: ${av.hover.formatAs(colorFormat)};`);
      }
    });
  }

  // Noise background
  if (config.noise) {
    lines.push("");
    if (comments) lines.push("    /* Background Images */");
    lines.push(`    --background-image-noise: ${generateNoiseSVG()};`);
  }

  // Gradients
  if (config.gradients) {
    lines.push("");
    if (comments) lines.push("    /* Gradients */");
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

    // Rainbow gradient — approximate spectral colors
    const rainbowColors = [
      new Color("#ff3b30"), // red
      new Color("#ff9500"), // orange
      new Color("#ffcc00"), // yellow
      new Color("#34c759"), // green
      new Color("#007aff"), // blue
      new Color("#5856d6"), // indigo
      new Color("#af52de"), // violet
    ];
    lines.push("    --gradient-linear-rainbow: linear-gradient(");
    lines.push("        var(--gradient-direction),");
    rainbowColors.forEach((c, idx) => {
      const comma = idx < rainbowColors.length - 1 ? "," : "";
      lines.push(`        ${c.formatAs(colorFormat)}${comma}`);
    });
    lines.push("    );");
  }

  lines.push("}");
  if (layers) lines.push("}"); // close @layer autotheme.palette

  // Motion tokens (own section, not inside scales)
  if (config.motion?.enabled) {
    lines.push("");
    if (layers) lines.push("@layer autotheme.scales {");
    lines.push(generateMotionCSS(config));
    if (layers) lines.push("}");
  }

  // Scales (typography, spacing, shadows, radius)
  const hasScales =
    config.typography.enabled ||
    config.spacing.enabled ||
    config.shadows.enabled ||
    config.radius.enabled;
  if (hasScales) {
    lines.push("");
    if (layers) lines.push("@layer autotheme.scales {");
    lines.push(":root {");

    // Typography scale (Tailwind namespace)
    if (config.typography.enabled) {
      if (comments) lines.push("    /* Typography Scale */");
      const typoValues = config.typography.values
        ? config.typography.values
        : generateCenteredScale(
            config.typography.base,
            config.typography.ratio,
            config.typography.steps,
          );
      const typoNames = config.typography.names ?? generateTypographyNames(typoValues.length);
      const typoFluid = config.typography.fluid ?? false;
      const [typoVpMin, typoVpMax] = config.typography.fluidRange ?? [320, 1280];
      typoValues.forEach((size, i) => {
        const name = typoNames[i] ?? `size-${i + 1}`;
        if (typoFluid) {
          const min = size * 0.75;
          lines.push(`    --text-${name}: ${fluidValue(min, size, typoVpMin, typoVpMax)};`);
        } else {
          lines.push(`    --text-${name}: ${size.toFixed(3)}rem;`);
        }
      });
    }

    // Spacing scale (Tailwind namespace)
    if (config.spacing.enabled) {
      lines.push("");
      if (comments) lines.push("    /* Spacing Scale */");
      const spacings = config.spacing.values
        ? config.spacing.values
        : generateScaledValues(config.spacing.base, config.spacing.ratio, config.spacing.steps);
      const spacingFluid = config.spacing.fluid ?? false;
      const [spVpMin, spVpMax] = config.spacing.fluidRange ?? [320, 1280];
      spacings.forEach((space, i) => {
        if (spacingFluid) {
          const min = space * 0.75;
          lines.push(`    --spacing-${i + 1}: ${fluidValue(min, space, spVpMin, spVpMax)};`);
        } else {
          lines.push(`    --spacing-${i + 1}: ${space.toFixed(3)}rem;`);
        }
      });
    }

    // Shadow scale
    if (config.shadows.enabled) {
      const primaryHue = palette.palettes[0]!.base.hsl.h;
      lines.push("");
      if (comments) lines.push("    /* Shadow Scale */");
      if (config.shadows.values) {
        config.shadows.values.forEach((val, i) => {
          lines.push(`    --shadow-${i + 1}: ${val};`);
        });
      } else {
        const isDark = config.mode === "dark";
        const shadows = generateShadowScale(
          config.shadows.steps,
          config.shadows.base,
          config.shadows.ratio,
          primaryHue,
          config.shadows.colorTint,
          isDark,
          colorFormat,
        );
        for (const s of shadows) {
          lines.push(`    --${s.name}: ${s.value};`);
        }
      }
    }

    // Border radius scale
    if (config.radius.enabled) {
      lines.push("");
      if (comments) lines.push("    /* Border Radius Scale */");
      const radii = config.radius.values
        ? config.radius.values
        : generateScaledValues(config.radius.base, config.radius.ratio, config.radius.steps);
      radii.forEach((r, i) => {
        lines.push(`    --radius-${i + 1}: ${r.toFixed(3)}rem;`);
      });
    }

    lines.push("}");
    if (layers) lines.push("}"); // close @layer autotheme.scales
  }

  // Semantic tokens
  if (config.semantics.enabled) {
    lines.push("");
    if (comments) {
      lines.push("/* ========================================");
      lines.push("   AutoTheme Semantic Tokens");
      lines.push("   ======================================== */");
      lines.push("");
    }
    if (layers) lines.push("@layer autotheme.semantics {");
    if (config.output.lightDark && config.mode === "both") {
      lines.push(generateLightDarkSemanticCSS(theme));
    } else {
      lines.push(generateSemanticCSS(theme));
    }
    if (layers) lines.push("}");
  }

  // Shadcn UI variables (after semantics, since shadcn references semantic tokens)
  if (config.shadcn.enabled) {
    lines.push("");
    if (comments) {
      lines.push("/* ========================================");
      lines.push("   Shadcn UI Compatible Theme Variables");
      lines.push("   ======================================== */");
      lines.push("");
    }
    if (layers) lines.push("@layer autotheme.semantics {");
    lines.push(generateShadcnCSS(theme, config.shadcn.radius));
    if (layers) lines.push("}");
  }

  // Dark mode (skip when lightDark is enabled — dark values are inlined via light-dark())
  if (
    (config.mode === "both" || config.mode === "dark") &&
    !(config.output.lightDark && config.mode === "both")
  ) {
    lines.push("");
    if (layers) lines.push("@layer autotheme.palette {");
    lines.push(generateDarkModeCSS(theme));
    if (layers) lines.push("}");
  }

  // P3 wide-gamut colors
  if (config.output.p3) {
    lines.push("");
    if (comments) {
      lines.push("/* Wide-Gamut Display P3 Colors */");
    }
    lines.push("@supports (color: color(display-p3 1 0 0)) {");
    if (layers) lines.push("@layer autotheme.palette {");
    lines.push("  :root {");
    palette.palettes.forEach((p, i) => {
      const name = getHarmonyName(i);
      // Re-emit base with unclamped (higher) chroma for P3
      const baseOklch = p.base.oklch;
      const maxSrgbC = maxChromaAtHueAndLightness(baseOklch.h, baseOklch.l);
      // Only emit P3 override if original chroma exceeds sRGB gamut
      if (baseOklch.c > maxSrgbC + 0.005) {
        lines.push(
          `    --${prefix}-${name}-500: oklch(${baseOklch.l.toFixed(4)} ${baseOklch.c.toFixed(4)} ${baseOklch.h.toFixed(2)});`,
        );
      }
    });
    lines.push("  }");
    if (layers) lines.push("}");
    lines.push("}");
  }

  // Utility classes
  if (config.utilities) {
    lines.push("");
    if (layers) lines.push("@layer autotheme.utilities {");
    lines.push(generateUtilityClasses(prefix, comments));
    if (layers) lines.push("}");
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
