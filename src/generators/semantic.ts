import { Color } from "../core/color";
import { findAccessibleTextColor } from "../core/contrast";
import { normalizeHue } from "../core/harmonies";
import type { GeneratedTheme } from "./types";
import type { FullPalette, PaletteVariations } from "../core/types";

/**
 * Semantic color tokens for a single mode (light or dark)
 */
export interface SemanticColors {
  // Surface system
  surface: Color;
  surfaceForeground: Color;
  surfaceDim: Color;
  surfaceBright: Color;
  surfaceContainer: Color;
  surfaceContainerForeground: Color;
  surfaceContainerHigh: Color;
  surfaceContainerLow: Color;

  // Primary (harmony[0])
  primary: Color;
  primaryForeground: Color;
  primaryContainer: Color;
  primaryContainerForeground: Color;

  // Secondary (harmony[1])
  secondary: Color;
  secondaryForeground: Color;
  secondaryContainer: Color;
  secondaryContainerForeground: Color;

  // Tertiary (harmony[2] or rotated fallback)
  tertiary: Color;
  tertiaryForeground: Color;
  tertiaryContainer: Color;
  tertiaryContainerForeground: Color;

  // Accent (most hue-distant harmony color)
  accent: Color;
  accentForeground: Color;
  accentContainer: Color;
  accentContainerForeground: Color;

  // Muted
  muted: Color;
  mutedForeground: Color;
  mutedContainer: Color;

  // Error/Destructive
  error: Color;
  errorForeground: Color;
  errorContainer: Color;
  errorContainerForeground: Color;

  // Outline
  outline: Color;
  outlineVariant: Color;

  // Inverse (for tooltips, snackbars)
  inverseSurface: Color;
  inverseSurfaceForeground: Color;
  inversePrimary: Color;
}

/**
 * Calculate the hue distance between two hues (0-180)
 */
function hueDistance(h1: number, h2: number): number {
  const diff = Math.abs(normalizeHue(h1) - normalizeHue(h2));
  return Math.min(diff, 360 - diff);
}

/**
 * Select the most hue-distant harmony color from primary
 */
export function selectAccentColor(palette: FullPalette): {
  color: Color;
  palette: PaletteVariations;
} {
  const primaryHue = palette.palettes[0]!.base.hsl.h;
  let maxDist = -1;
  let accentIdx = 1;

  for (let i = 1; i < palette.palettes.length; i++) {
    const dist = hueDistance(primaryHue, palette.palettes[i]!.base.hsl.h);
    if (dist > maxDist) {
      maxDist = dist;
      accentIdx = i;
    }
  }

  return {
    color: palette.palettes[accentIdx]!.base,
    palette: palette.palettes[accentIdx]!,
  };
}

/**
 * Generate a container color: a soft, tinted background version of a base color
 */
function generateContainer(
  base: PaletteVariations,
  tintIndex: number,
  desatAmount: number = 10,
): Color {
  const tint = base.tints[tintIndex];
  if (tint) {
    return tint.desaturate(desatAmount);
  }
  return base.base.lighten(30).desaturate(desatAmount);
}

/**
 * Generate a destructive/error color independent of the palette
 */
function generateErrorColor(primaryHue: number): Color {
  const isNearRed = primaryHue < 40 || primaryHue > 340;
  const errorHue = isNearRed ? 0 : 15;
  return new Color({ h: errorHue, s: 85, l: 45, a: 1 });
}

/**
 * Generate light error container (soft red background)
 */
function generateErrorContainer(error: Color, mode: "light" | "dark"): Color {
  if (mode === "light") {
    return error.lighten(40).desaturate(40);
  }
  return error.darken(25).desaturate(30);
}

/**
 * Get the tertiary color: harmony[2] if available, otherwise primary rotated 120 degrees
 */
function getTertiaryPalette(palette: FullPalette): { color: Color; variations: PaletteVariations } {
  if (palette.palettes.length >= 3) {
    return {
      color: palette.palettes[2]!.base,
      variations: palette.palettes[2]!,
    };
  }
  // Fallback: rotate primary 120 degrees and create a pseudo-palette
  const rotated = palette.palettes[0]!.base.rotate(120);
  return {
    color: rotated,
    variations: {
      base: rotated,
      tints: [
        rotated.lighten(10),
        rotated.lighten(20),
        rotated.lighten(30),
        rotated.lighten(40),
        rotated.lighten(45),
      ],
      shades: [
        rotated.darken(10),
        rotated.darken(20),
        rotated.darken(30),
        rotated.darken(40),
        rotated.darken(45),
      ],
      tones: [
        rotated.desaturate(20),
        rotated.desaturate(40),
        rotated.desaturate(60),
        rotated.desaturate(80),
      ],
    },
  };
}

/**
 * Generate semantic colors for light mode
 */
function generateLightSemanticColors(palette: FullPalette): SemanticColors {
  const primaryPalette = palette.palettes[0]!;
  const primary = primaryPalette.base;
  const primaryHsl = primary.hsl;

  // Secondary: real harmony[1] color
  const secondaryPalette = palette.palettes[1] || primaryPalette;
  const secondary = secondaryPalette.base;

  // Tertiary
  const tertiaryData = getTertiaryPalette(palette);
  const tertiary = tertiaryData.color;
  const tertiaryVariations = tertiaryData.variations;

  // Accent: most hue-distant
  const accentData = selectAccentColor(palette);
  const accentBase = accentData.color;
  const accentPalette = accentData.palette;

  // Error
  const error = generateErrorColor(primaryHsl.h);
  const errorContainer = generateErrorContainer(error, "light");

  // Surface system (derived from primary tints)
  const surface = primaryPalette.tints[4] || primary.lighten(45);
  const surfaceDim = primaryPalette.tints[3] || primary.lighten(35);
  const surfaceBright = new Color({ h: primaryHsl.h, s: Math.min(primaryHsl.s, 10), l: 99, a: 1 });
  const surfaceContainer = (primaryPalette.tints[4] || primary.lighten(45)).desaturate(15);
  const surfaceContainerHigh = (primaryPalette.tints[3] || primary.lighten(35)).desaturate(10);
  const surfaceContainerLow = (primaryPalette.tints[4] || primary.lighten(45)).desaturate(25);

  // Muted (desaturated primary)
  const muted = primaryPalette.tones[1] || primary.desaturate(40);
  const mutedContainer = primaryPalette.tones[2] || primary.desaturate(60);

  // Outline
  const outline = new Color({ h: primaryHsl.h, s: 10, l: 55, a: 1 });
  const outlineVariant = new Color({ h: primaryHsl.h, s: 8, l: 80, a: 1 });

  // Inverse
  const inverseSurface = primaryPalette.shades[3] || primary.darken(40);
  const inversePrimary = primaryPalette.tints[1] || primary.lighten(20);

  // Containers
  const primaryContainer = generateContainer(primaryPalette, 2);
  const secondaryContainer = generateContainer(secondaryPalette, 2);
  const tertiaryContainer = generateContainer(tertiaryVariations, 2);
  const accentContainer = generateContainer(accentPalette, 2);

  return {
    surface,
    surfaceForeground: findAccessibleTextColor(surface),
    surfaceDim,
    surfaceBright,
    surfaceContainer,
    surfaceContainerForeground: findAccessibleTextColor(surfaceContainer),
    surfaceContainerHigh,
    surfaceContainerLow,

    primary,
    primaryForeground: findAccessibleTextColor(primary),
    primaryContainer,
    primaryContainerForeground: findAccessibleTextColor(primaryContainer),

    secondary,
    secondaryForeground: findAccessibleTextColor(secondary),
    secondaryContainer,
    secondaryContainerForeground: findAccessibleTextColor(secondaryContainer),

    tertiary,
    tertiaryForeground: findAccessibleTextColor(tertiary),
    tertiaryContainer,
    tertiaryContainerForeground: findAccessibleTextColor(tertiaryContainer),

    accent: accentBase,
    accentForeground: findAccessibleTextColor(accentBase),
    accentContainer,
    accentContainerForeground: findAccessibleTextColor(accentContainer),

    muted,
    mutedForeground: findAccessibleTextColor(muted),
    mutedContainer,

    error,
    errorForeground: findAccessibleTextColor(error),
    errorContainer,
    errorContainerForeground: findAccessibleTextColor(errorContainer),

    outline,
    outlineVariant,

    inverseSurface,
    inverseSurfaceForeground: findAccessibleTextColor(inverseSurface),
    inversePrimary,
  };
}

/**
 * Generate semantic colors for dark mode
 */
function generateDarkSemanticColors(palette: FullPalette): SemanticColors {
  const primaryPalette = palette.palettes[0]!;
  const primary = primaryPalette.base;
  const primaryHsl = primary.hsl;

  // Secondary: real harmony[1] color
  const secondaryPalette = palette.palettes[1] || primaryPalette;
  const secondary = secondaryPalette.base.lighten(10);

  // Tertiary
  const tertiaryData = getTertiaryPalette(palette);
  const tertiary = tertiaryData.color.lighten(10);
  const tertiaryVariations = tertiaryData.variations;

  // Accent: most hue-distant
  const accentData = selectAccentColor(palette);
  const accentBase = accentData.color.lighten(10);
  const accentPalette = accentData.palette;

  // Error
  const error = generateErrorColor(primaryHsl.h).lighten(10).saturate(10);
  const errorContainer = generateErrorContainer(error, "dark");

  // Surface system (inverted: dark surfaces at fixed low lightness for consistency)
  const surface = new Color({ h: primaryHsl.h, s: Math.min(20, primaryHsl.s * 0.3), l: 10, a: 1 });
  const surfaceDim = new Color({
    h: primaryHsl.h,
    s: Math.min(15, primaryHsl.s * 0.2),
    l: 6,
    a: 1,
  });
  const surfaceBright = new Color({
    h: primaryHsl.h,
    s: Math.min(20, primaryHsl.s * 0.3),
    l: 22,
    a: 1,
  });
  const surfaceContainer = new Color({
    h: primaryHsl.h,
    s: Math.min(15, primaryHsl.s * 0.25),
    l: 14,
    a: 1,
  });
  const surfaceContainerHigh = new Color({
    h: primaryHsl.h,
    s: Math.min(15, primaryHsl.s * 0.25),
    l: 18,
    a: 1,
  });
  const surfaceContainerLow = new Color({
    h: primaryHsl.h,
    s: Math.min(10, primaryHsl.s * 0.15),
    l: 8,
    a: 1,
  });

  // Dark primary is lightened for visibility on dark backgrounds
  const darkPrimary = primary.lighten(10);

  // Muted (desaturated, dark)
  const muted = new Color({ h: primaryHsl.h, s: Math.min(15, primaryHsl.s * 0.3), l: 22, a: 1 });
  const mutedContainer = new Color({
    h: primaryHsl.h,
    s: Math.min(12, primaryHsl.s * 0.2),
    l: 18,
    a: 1,
  });

  // Outline
  const outline = new Color({ h: primaryHsl.h, s: 10, l: 45, a: 1 });
  const outlineVariant = new Color({ h: primaryHsl.h, s: 8, l: 30, a: 1 });

  // Inverse (light on dark → becomes light surface)
  const inverseSurface = primaryPalette.tints[3] || primary.lighten(35);
  const inversePrimary = primaryPalette.shades[1] || primary.darken(20);

  // Containers for dark mode: sufficiently dark for AAA foreground contrast
  const primaryContainer = (primaryPalette.shades[3] || primary.darken(40)).desaturate(30);
  const secondaryContainer = (
    secondaryPalette.shades[3] || secondaryPalette.base.darken(40)
  ).desaturate(30);
  const tertiaryContainer = (
    tertiaryVariations.shades[3] || tertiaryVariations.base.darken(40)
  ).desaturate(30);
  const accentContainer = (accentPalette.shades[3] || accentPalette.base.darken(40)).desaturate(30);

  return {
    surface,
    surfaceForeground: findAccessibleTextColor(surface),
    surfaceDim,
    surfaceBright,
    surfaceContainer,
    surfaceContainerForeground: findAccessibleTextColor(surfaceContainer),
    surfaceContainerHigh,
    surfaceContainerLow,

    primary: darkPrimary,
    primaryForeground: findAccessibleTextColor(darkPrimary),
    primaryContainer,
    primaryContainerForeground: findAccessibleTextColor(primaryContainer),

    secondary,
    secondaryForeground: findAccessibleTextColor(secondary),
    secondaryContainer,
    secondaryContainerForeground: findAccessibleTextColor(secondaryContainer),

    tertiary,
    tertiaryForeground: findAccessibleTextColor(tertiary),
    tertiaryContainer,
    tertiaryContainerForeground: findAccessibleTextColor(tertiaryContainer),

    accent: accentBase,
    accentForeground: findAccessibleTextColor(accentBase),
    accentContainer,
    accentContainerForeground: findAccessibleTextColor(accentContainer),

    muted,
    mutedForeground: findAccessibleTextColor(muted),
    mutedContainer,

    error,
    errorForeground: findAccessibleTextColor(error),
    errorContainer,
    errorContainerForeground: findAccessibleTextColor(errorContainer),

    outline,
    outlineVariant,

    inverseSurface,
    inverseSurfaceForeground: findAccessibleTextColor(inverseSurface),
    inversePrimary,
  };
}

/**
 * Generate semantic colors for both light and dark modes
 */
export function generateSemanticColors(theme: GeneratedTheme): {
  light: SemanticColors;
  dark: SemanticColors;
} {
  return {
    light: generateLightSemanticColors(theme.palette),
    dark: generateDarkSemanticColors(theme.palette),
  };
}

/**
 * Emit a CSS variable line
 */
function cssVar(name: string, color: Color): string {
  return `  --${name}: ${color.toOKLCH()};`;
}

/**
 * Generate semantic CSS block for light mode (:root)
 */
function generateSemanticLightCSS(colors: SemanticColors): string {
  const lines: string[] = [];

  lines.push(":root {");
  lines.push("  /* Surface System */");
  lines.push(cssVar("surface", colors.surface));
  lines.push(cssVar("surface-foreground", colors.surfaceForeground));
  lines.push(cssVar("surface-dim", colors.surfaceDim));
  lines.push(cssVar("surface-bright", colors.surfaceBright));
  lines.push(cssVar("surface-container", colors.surfaceContainer));
  lines.push(cssVar("surface-container-foreground", colors.surfaceContainerForeground));
  lines.push(cssVar("surface-container-high", colors.surfaceContainerHigh));
  lines.push(cssVar("surface-container-low", colors.surfaceContainerLow));
  lines.push("");
  lines.push("  /* Primary */");
  lines.push(cssVar("primary", colors.primary));
  lines.push(cssVar("primary-foreground", colors.primaryForeground));
  lines.push(cssVar("primary-container", colors.primaryContainer));
  lines.push(cssVar("primary-container-foreground", colors.primaryContainerForeground));
  lines.push("");
  lines.push("  /* Secondary */");
  lines.push(cssVar("secondary", colors.secondary));
  lines.push(cssVar("secondary-foreground", colors.secondaryForeground));
  lines.push(cssVar("secondary-container", colors.secondaryContainer));
  lines.push(cssVar("secondary-container-foreground", colors.secondaryContainerForeground));
  lines.push("");
  lines.push("  /* Tertiary */");
  lines.push(cssVar("tertiary", colors.tertiary));
  lines.push(cssVar("tertiary-foreground", colors.tertiaryForeground));
  lines.push(cssVar("tertiary-container", colors.tertiaryContainer));
  lines.push(cssVar("tertiary-container-foreground", colors.tertiaryContainerForeground));
  lines.push("");
  lines.push("  /* Accent */");
  lines.push(cssVar("accent", colors.accent));
  lines.push(cssVar("accent-foreground", colors.accentForeground));
  lines.push(cssVar("accent-container", colors.accentContainer));
  lines.push(cssVar("accent-container-foreground", colors.accentContainerForeground));
  lines.push("");
  lines.push("  /* Muted */");
  lines.push(cssVar("muted", colors.muted));
  lines.push(cssVar("muted-foreground", colors.mutedForeground));
  lines.push(cssVar("muted-container", colors.mutedContainer));
  lines.push("");
  lines.push("  /* Error */");
  lines.push(cssVar("error", colors.error));
  lines.push(cssVar("error-foreground", colors.errorForeground));
  lines.push(cssVar("error-container", colors.errorContainer));
  lines.push(cssVar("error-container-foreground", colors.errorContainerForeground));
  lines.push("");
  lines.push("  /* Outline */");
  lines.push(cssVar("outline", colors.outline));
  lines.push(cssVar("outline-variant", colors.outlineVariant));
  lines.push("");
  lines.push("  /* Inverse */");
  lines.push(cssVar("inverse-surface", colors.inverseSurface));
  lines.push(cssVar("inverse-surface-foreground", colors.inverseSurfaceForeground));
  lines.push(cssVar("inverse-primary", colors.inversePrimary));
  lines.push("}");

  return lines.join("\n");
}

/**
 * Generate semantic CSS block for dark mode (.dark)
 */
function generateSemanticDarkCSS(colors: SemanticColors): string {
  const lines: string[] = [];

  lines.push(".dark {");
  lines.push("  /* Surface System */");
  lines.push(cssVar("surface", colors.surface));
  lines.push(cssVar("surface-foreground", colors.surfaceForeground));
  lines.push(cssVar("surface-dim", colors.surfaceDim));
  lines.push(cssVar("surface-bright", colors.surfaceBright));
  lines.push(cssVar("surface-container", colors.surfaceContainer));
  lines.push(cssVar("surface-container-foreground", colors.surfaceContainerForeground));
  lines.push(cssVar("surface-container-high", colors.surfaceContainerHigh));
  lines.push(cssVar("surface-container-low", colors.surfaceContainerLow));
  lines.push("");
  lines.push("  /* Primary */");
  lines.push(cssVar("primary", colors.primary));
  lines.push(cssVar("primary-foreground", colors.primaryForeground));
  lines.push(cssVar("primary-container", colors.primaryContainer));
  lines.push(cssVar("primary-container-foreground", colors.primaryContainerForeground));
  lines.push("");
  lines.push("  /* Secondary */");
  lines.push(cssVar("secondary", colors.secondary));
  lines.push(cssVar("secondary-foreground", colors.secondaryForeground));
  lines.push(cssVar("secondary-container", colors.secondaryContainer));
  lines.push(cssVar("secondary-container-foreground", colors.secondaryContainerForeground));
  lines.push("");
  lines.push("  /* Tertiary */");
  lines.push(cssVar("tertiary", colors.tertiary));
  lines.push(cssVar("tertiary-foreground", colors.tertiaryForeground));
  lines.push(cssVar("tertiary-container", colors.tertiaryContainer));
  lines.push(cssVar("tertiary-container-foreground", colors.tertiaryContainerForeground));
  lines.push("");
  lines.push("  /* Accent */");
  lines.push(cssVar("accent", colors.accent));
  lines.push(cssVar("accent-foreground", colors.accentForeground));
  lines.push(cssVar("accent-container", colors.accentContainer));
  lines.push(cssVar("accent-container-foreground", colors.accentContainerForeground));
  lines.push("");
  lines.push("  /* Muted */");
  lines.push(cssVar("muted", colors.muted));
  lines.push(cssVar("muted-foreground", colors.mutedForeground));
  lines.push(cssVar("muted-container", colors.mutedContainer));
  lines.push("");
  lines.push("  /* Error */");
  lines.push(cssVar("error", colors.error));
  lines.push(cssVar("error-foreground", colors.errorForeground));
  lines.push(cssVar("error-container", colors.errorContainer));
  lines.push(cssVar("error-container-foreground", colors.errorContainerForeground));
  lines.push("");
  lines.push("  /* Outline */");
  lines.push(cssVar("outline", colors.outline));
  lines.push(cssVar("outline-variant", colors.outlineVariant));
  lines.push("");
  lines.push("  /* Inverse */");
  lines.push(cssVar("inverse-surface", colors.inverseSurface));
  lines.push(cssVar("inverse-surface-foreground", colors.inverseSurfaceForeground));
  lines.push(cssVar("inverse-primary", colors.inversePrimary));
  lines.push("}");

  return lines.join("\n");
}

/**
 * Generate complete semantic CSS (light + dark)
 */
export function generateSemanticCSS(theme: GeneratedTheme): string {
  const colors = generateSemanticColors(theme);

  const lines: string[] = [];
  lines.push("/* ========================================");
  lines.push("   Semantic Design Tokens");
  lines.push("   ======================================== */");
  lines.push("");
  lines.push(generateSemanticLightCSS(colors.light));
  lines.push("");
  lines.push(generateSemanticDarkCSS(colors.dark));

  return lines.join("\n");
}
