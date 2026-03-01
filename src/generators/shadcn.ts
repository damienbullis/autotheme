import { Color } from "../core/color";
import { findAccessibleTextColor } from "../core/contrast";
import { normalizeHue } from "../core/harmonies";
import type { GeneratedTheme } from "./types";
import type { FullPalette, PaletteVariations } from "../core/types";

/**
 * Shadcn semantic color variables
 */
export interface ShadcnColors {
  background: Color;
  foreground: Color;
  card: Color;
  cardForeground: Color;
  popover: Color;
  popoverForeground: Color;
  primary: Color;
  primaryForeground: Color;
  secondary: Color;
  secondaryForeground: Color;
  muted: Color;
  mutedForeground: Color;
  accent: Color;
  accentForeground: Color;
  destructive: Color;
  destructiveForeground: Color;
  border: Color;
  input: Color;
  ring: Color;
  chart1: Color;
  chart2: Color;
  chart3: Color;
  chart4: Color;
  chart5: Color;
  sidebar: Color;
  sidebarForeground: Color;
  sidebarPrimary: Color;
  sidebarPrimaryForeground: Color;
  sidebarAccent: Color;
  sidebarAccentForeground: Color;
  sidebarBorder: Color;
  sidebarRing: Color;
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
 * Derive Shadcn colors for light mode directly from palette
 */
function deriveLightShadcnColors(palette: FullPalette, harmonyColors: Color[]): ShadcnColors {
  const primaryPalette = palette.palettes[0]!;
  const primary = primaryPalette.base;
  const primaryHsl = primary.hsl;

  const secondaryPalette = palette.palettes[1] || primaryPalette;
  const accentData = selectAccentColor(palette);
  const accentPalette = accentData.palette;

  // Surface system
  const surface = primaryPalette.tints[4] || primary.lighten(45);
  const surfaceContainer = (primaryPalette.tints[4] || primary.lighten(45)).desaturate(15);
  const surfaceContainerLow = (primaryPalette.tints[4] || primary.lighten(45)).desaturate(25);

  // Containers
  const secondaryContainer = generateContainer(secondaryPalette, 2);
  const accentContainer = generateContainer(accentPalette, 2);

  // Muted
  const muted = primaryPalette.tones[1] || primary.desaturate(40);
  const mutedContainer = primaryPalette.tones[2] || primary.desaturate(60);

  // Error
  const error = generateErrorColor(primaryHsl.h);

  // Outline
  const outline = new Color({ h: primaryHsl.h, s: 10, l: 55, a: 1 });
  const outlineVariant = new Color({ h: primaryHsl.h, s: 8, l: 80, a: 1 });

  // Chart colors
  const chart1 = harmonyColors[0] || primary;
  const chart2 = harmonyColors[1] || primary.rotate(60);
  const chart3 = harmonyColors[2] || primary.rotate(120);
  const chart4 = harmonyColors[3] || primary.rotate(180);
  const chart5 = harmonyColors[4] || primary.rotate(240);

  return {
    background: surface,
    foreground: findAccessibleTextColor(surface),

    card: surfaceContainer,
    cardForeground: findAccessibleTextColor(surfaceContainer),

    popover: surfaceContainer,
    popoverForeground: findAccessibleTextColor(surfaceContainer),

    primary,
    primaryForeground: findAccessibleTextColor(primary),

    secondary: secondaryContainer,
    secondaryForeground: findAccessibleTextColor(secondaryContainer),

    muted: mutedContainer,
    mutedForeground: findAccessibleTextColor(muted),

    accent: accentContainer,
    accentForeground: findAccessibleTextColor(accentContainer),

    destructive: error,
    destructiveForeground: findAccessibleTextColor(error),

    border: outlineVariant,
    input: outline,
    ring: primary,

    chart1,
    chart2,
    chart3,
    chart4,
    chart5,

    sidebar: surfaceContainerLow,
    sidebarForeground: findAccessibleTextColor(surfaceContainerLow),
    sidebarPrimary: primary,
    sidebarPrimaryForeground: findAccessibleTextColor(primary),
    sidebarAccent: accentContainer,
    sidebarAccentForeground: findAccessibleTextColor(accentContainer),
    sidebarBorder: outlineVariant,
    sidebarRing: primary,
  };
}

/**
 * Derive Shadcn colors for dark mode directly from palette
 */
function deriveDarkShadcnColors(palette: FullPalette, harmonyColors: Color[]): ShadcnColors {
  const primaryPalette = palette.palettes[0]!;
  const primary = primaryPalette.base;
  const primaryHsl = primary.hsl;

  const secondaryPalette = palette.palettes[1] || primaryPalette;
  const accentData = selectAccentColor(palette);
  const accentPalette = accentData.palette;

  // Dark primary is lightened for visibility
  const darkPrimary = primary.lighten(10);

  // Surface system (dark)
  const surface = new Color({ h: primaryHsl.h, s: Math.min(20, primaryHsl.s * 0.3), l: 10, a: 1 });
  const surfaceContainerHigh = new Color({
    h: primaryHsl.h,
    s: Math.min(15, primaryHsl.s * 0.25),
    l: 18,
    a: 1,
  });

  // Containers (dark): sufficiently dark for AAA foreground contrast
  const secondaryContainer = (
    secondaryPalette.shades[3] || secondaryPalette.base.darken(40)
  ).desaturate(30);
  const accentContainer = (accentPalette.shades[3] || accentPalette.base.darken(40)).desaturate(30);

  // Muted (dark)
  const muted = new Color({ h: primaryHsl.h, s: Math.min(15, primaryHsl.s * 0.3), l: 22, a: 1 });
  const mutedContainer = new Color({
    h: primaryHsl.h,
    s: Math.min(12, primaryHsl.s * 0.2),
    l: 18,
    a: 1,
  });

  // Error (dark)
  const error = generateErrorColor(primaryHsl.h).lighten(10).saturate(10);

  // Outline (dark)
  const outline = new Color({ h: primaryHsl.h, s: 10, l: 45, a: 1 });
  const outlineVariant = new Color({ h: primaryHsl.h, s: 8, l: 30, a: 1 });

  // Chart colors (lightened for dark mode)
  const chart1 = (harmonyColors[0] || primary).lighten(5);
  const chart2 = (harmonyColors[1] || primary.rotate(60)).lighten(5);
  const chart3 = (harmonyColors[2] || primary.rotate(120)).lighten(5);
  const chart4 = (harmonyColors[3] || primary.rotate(180)).lighten(5);
  const chart5 = (harmonyColors[4] || primary.rotate(240)).lighten(5);

  return {
    background: surface,
    foreground: findAccessibleTextColor(surface),

    card: surfaceContainerHigh,
    cardForeground: findAccessibleTextColor(surfaceContainerHigh),

    popover: surfaceContainerHigh,
    popoverForeground: findAccessibleTextColor(surfaceContainerHigh),

    primary: darkPrimary,
    primaryForeground: findAccessibleTextColor(darkPrimary),

    secondary: secondaryContainer,
    secondaryForeground: findAccessibleTextColor(secondaryContainer),

    muted: mutedContainer,
    mutedForeground: findAccessibleTextColor(muted),

    accent: accentContainer,
    accentForeground: findAccessibleTextColor(accentContainer),

    destructive: error,
    destructiveForeground: findAccessibleTextColor(error),

    border: outlineVariant,
    input: outline,
    ring: darkPrimary,

    chart1,
    chart2,
    chart3,
    chart4,
    chart5,

    sidebar: surface,
    sidebarForeground: findAccessibleTextColor(surface),
    sidebarPrimary: darkPrimary,
    sidebarPrimaryForeground: findAccessibleTextColor(darkPrimary),
    sidebarAccent: accentContainer,
    sidebarAccentForeground: findAccessibleTextColor(accentContainer),
    sidebarBorder: outlineVariant,
    sidebarRing: darkPrimary,
  };
}

/**
 * Generate Shadcn-compatible colors from AutoTheme palette directly
 */
export function generateShadcnColors(theme: GeneratedTheme): {
  light: ShadcnColors;
  dark: ShadcnColors;
} {
  const { palette } = theme;

  if (!palette.palettes[0]) {
    throw new Error("No primary palette found");
  }

  const harmonyColors = palette.palettes.map((p) => p.base);

  return {
    light: deriveLightShadcnColors(palette, harmonyColors),
    dark: deriveDarkShadcnColors(palette, harmonyColors),
  };
}

/**
 * Generate Shadcn CSS variables string for light mode
 */
export function generateShadcnLightCSS(colors: ShadcnColors, radius: string = "0.625rem"): string {
  const lines: string[] = [];

  lines.push(`:root {`);
  lines.push(`  --radius: ${radius};`);
  lines.push(``);
  lines.push(`  /* Shadcn UI Component Variables */`);
  lines.push(`  --background: ${colors.background.toOKLCH()};`);
  lines.push(`  --foreground: ${colors.foreground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --card: ${colors.card.toOKLCH()};`);
  lines.push(`  --card-foreground: ${colors.cardForeground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --popover: ${colors.popover.toOKLCH()};`);
  lines.push(`  --popover-foreground: ${colors.popoverForeground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --primary: ${colors.primary.toOKLCH()};`);
  lines.push(`  --primary-foreground: ${colors.primaryForeground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --secondary: ${colors.secondary.toOKLCH()};`);
  lines.push(`  --secondary-foreground: ${colors.secondaryForeground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --muted: ${colors.muted.toOKLCH()};`);
  lines.push(`  --muted-foreground: ${colors.mutedForeground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --accent: ${colors.accent.toOKLCH()};`);
  lines.push(`  --accent-foreground: ${colors.accentForeground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --destructive: ${colors.destructive.toOKLCH()};`);
  lines.push(`  --destructive-foreground: ${colors.destructiveForeground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --border: ${colors.border.toOKLCH()};`);
  lines.push(`  --input: ${colors.input.toOKLCH()};`);
  lines.push(`  --ring: ${colors.ring.toOKLCH()};`);
  lines.push(``);
  lines.push(`  /* Chart Colors */`);
  lines.push(`  --chart-1: ${colors.chart1.toOKLCH()};`);
  lines.push(`  --chart-2: ${colors.chart2.toOKLCH()};`);
  lines.push(`  --chart-3: ${colors.chart3.toOKLCH()};`);
  lines.push(`  --chart-4: ${colors.chart4.toOKLCH()};`);
  lines.push(`  --chart-5: ${colors.chart5.toOKLCH()};`);
  lines.push(``);
  lines.push(`  /* Sidebar */`);
  lines.push(`  --sidebar: ${colors.sidebar.toOKLCH()};`);
  lines.push(`  --sidebar-foreground: ${colors.sidebarForeground.toOKLCH()};`);
  lines.push(`  --sidebar-primary: ${colors.sidebarPrimary.toOKLCH()};`);
  lines.push(`  --sidebar-primary-foreground: ${colors.sidebarPrimaryForeground.toOKLCH()};`);
  lines.push(`  --sidebar-accent: ${colors.sidebarAccent.toOKLCH()};`);
  lines.push(`  --sidebar-accent-foreground: ${colors.sidebarAccentForeground.toOKLCH()};`);
  lines.push(`  --sidebar-border: ${colors.sidebarBorder.toOKLCH()};`);
  lines.push(`  --sidebar-ring: ${colors.sidebarRing.toOKLCH()};`);
  lines.push(`}`);

  return lines.join("\n");
}

/**
 * Generate Shadcn CSS variables string for dark mode
 */
export function generateShadcnDarkCSS(colors: ShadcnColors): string {
  const lines: string[] = [];

  lines.push(`.dark {`);
  lines.push(`  --background: ${colors.background.toOKLCH()};`);
  lines.push(`  --foreground: ${colors.foreground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --card: ${colors.card.toOKLCH()};`);
  lines.push(`  --card-foreground: ${colors.cardForeground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --popover: ${colors.popover.toOKLCH()};`);
  lines.push(`  --popover-foreground: ${colors.popoverForeground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --primary: ${colors.primary.toOKLCH()};`);
  lines.push(`  --primary-foreground: ${colors.primaryForeground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --secondary: ${colors.secondary.toOKLCH()};`);
  lines.push(`  --secondary-foreground: ${colors.secondaryForeground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --muted: ${colors.muted.toOKLCH()};`);
  lines.push(`  --muted-foreground: ${colors.mutedForeground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --accent: ${colors.accent.toOKLCH()};`);
  lines.push(`  --accent-foreground: ${colors.accentForeground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --destructive: ${colors.destructive.toOKLCH()};`);
  lines.push(`  --destructive-foreground: ${colors.destructiveForeground.toOKLCH()};`);
  lines.push(``);
  lines.push(`  --border: ${colors.border.toOKLCH()};`);
  lines.push(`  --input: ${colors.input.toOKLCH()};`);
  lines.push(`  --ring: ${colors.ring.toOKLCH()};`);
  lines.push(``);
  lines.push(`  /* Chart Colors */`);
  lines.push(`  --chart-1: ${colors.chart1.toOKLCH()};`);
  lines.push(`  --chart-2: ${colors.chart2.toOKLCH()};`);
  lines.push(`  --chart-3: ${colors.chart3.toOKLCH()};`);
  lines.push(`  --chart-4: ${colors.chart4.toOKLCH()};`);
  lines.push(`  --chart-5: ${colors.chart5.toOKLCH()};`);
  lines.push(``);
  lines.push(`  /* Sidebar */`);
  lines.push(`  --sidebar: ${colors.sidebar.toOKLCH()};`);
  lines.push(`  --sidebar-foreground: ${colors.sidebarForeground.toOKLCH()};`);
  lines.push(`  --sidebar-primary: ${colors.sidebarPrimary.toOKLCH()};`);
  lines.push(`  --sidebar-primary-foreground: ${colors.sidebarPrimaryForeground.toOKLCH()};`);
  lines.push(`  --sidebar-accent: ${colors.sidebarAccent.toOKLCH()};`);
  lines.push(`  --sidebar-accent-foreground: ${colors.sidebarAccentForeground.toOKLCH()};`);
  lines.push(`  --sidebar-border: ${colors.sidebarBorder.toOKLCH()};`);
  lines.push(`  --sidebar-ring: ${colors.sidebarRing.toOKLCH()};`);
  lines.push(`}`);

  return lines.join("\n");
}

/**
 * Generate complete Shadcn CSS (light + dark)
 */
export function generateShadcnCSS(theme: GeneratedTheme, radius: string = "0.625rem"): string {
  const colors = generateShadcnColors(theme);

  const lines: string[] = [];
  lines.push(generateShadcnLightCSS(colors.light, radius));
  lines.push("");
  lines.push(generateShadcnDarkCSS(colors.dark));

  return lines.join("\n");
}
