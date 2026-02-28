import { Color } from "../core/color";
import { findAccessibleTextColor } from "../core/contrast";
import type { GeneratedTheme } from "./types";

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
 * Generate Shadcn-compatible colors from AutoTheme palette
 */
export function generateShadcnColors(theme: GeneratedTheme): {
  light: ShadcnColors;
  dark: ShadcnColors;
} {
  const { palette } = theme;
  const primaryPalette = palette.palettes[0];

  if (!primaryPalette) {
    throw new Error("No primary palette found");
  }

  const primary = primaryPalette.base;
  const primaryHsl = primary.hsl;

  // Get harmony colors for accents and charts
  const harmonyColors = palette.palettes.map((p) => p.base);

  // Generate destructive color (red-ish, opposite of green hues)
  const destructive = generateDestructiveColor(primaryHsl.h);

  // === LIGHT MODE ===
  const lightBackground = primaryPalette.tints[4] || primary.lighten(45);
  const lightForeground = new Color({ h: primaryHsl.h, s: 10, l: 10, a: 1 });

  const lightCard = lightBackground;
  const lightCardForeground = lightForeground;

  const lightPopover = lightBackground;
  const lightPopoverForeground = lightForeground;

  const lightPrimary = primary;
  const lightPrimaryForeground = findAccessibleTextColor(lightPrimary);

  const lightSecondary = primaryPalette.tints[2] || primary.lighten(30);
  const lightSecondaryForeground = findAccessibleTextColor(lightSecondary);

  const lightMuted = primaryPalette.tones[1] || primary.desaturate(60).lighten(20);
  const lightMutedForeground = new Color({ h: primaryHsl.h, s: 10, l: 45, a: 1 });

  // Accent from first harmony color or lighter tint
  const accentBase = harmonyColors[1] || primaryPalette.tints[1] || primary;
  const lightAccent = accentBase.lighten(35).desaturate(30);
  const lightAccentForeground = findAccessibleTextColor(lightAccent);

  const lightDestructive = destructive;
  const lightDestructiveForeground = findAccessibleTextColor(lightDestructive);

  const lightBorder = new Color({ h: primaryHsl.h, s: 8, l: 90, a: 1 });
  const lightInput = lightBorder;
  const lightRing = new Color({ h: primaryHsl.h, s: 15, l: 65, a: 1 });

  // Sidebar (slightly off from main background)
  const lightSidebar = new Color({ h: primaryHsl.h, s: 5, l: 97, a: 1 });
  const lightSidebarForeground = lightForeground;
  const lightSidebarPrimary = lightPrimary;
  const lightSidebarPrimaryForeground = lightPrimaryForeground;
  const lightSidebarAccent = lightAccent;
  const lightSidebarAccentForeground = lightAccentForeground;
  const lightSidebarBorder = lightBorder;
  const lightSidebarRing = lightRing;

  // Chart colors from harmony
  const lightChart1 = harmonyColors[0] || primary;
  const lightChart2 = harmonyColors[1] || primary.rotate(60);
  const lightChart3 = harmonyColors[2] || primary.rotate(120);
  const lightChart4 = harmonyColors[3] || primary.rotate(180);
  const lightChart5 = harmonyColors[4] || primary.rotate(240);

  // === DARK MODE ===
  const darkBackground = new Color({
    h: primaryHsl.h,
    s: Math.min(20, primaryHsl.s * 0.3),
    l: 10,
    a: 1,
  });
  const darkForeground = new Color({ h: primaryHsl.h, s: 5, l: 98, a: 1 });

  const darkCard = new Color({
    h: primaryHsl.h,
    s: Math.min(15, primaryHsl.s * 0.25),
    l: 14,
    a: 1,
  });
  const darkCardForeground = darkForeground;

  const darkPopover = new Color({
    h: primaryHsl.h,
    s: Math.min(15, primaryHsl.s * 0.25),
    l: 18,
    a: 1,
  });
  const darkPopoverForeground = darkForeground;

  const darkPrimary = primary.lighten(10);
  const darkPrimaryForeground = findAccessibleTextColor(darkPrimary);

  const darkSecondary = new Color({
    h: primaryHsl.h,
    s: Math.min(15, primaryHsl.s * 0.3),
    l: 22,
    a: 1,
  });
  const darkSecondaryForeground = darkForeground;

  const darkMuted = new Color({
    h: primaryHsl.h,
    s: Math.min(15, primaryHsl.s * 0.3),
    l: 22,
    a: 1,
  });
  const darkMutedForeground = new Color({ h: primaryHsl.h, s: 10, l: 65, a: 1 });

  const darkAccent = new Color({
    h: accentBase.hsl.h,
    s: Math.min(30, accentBase.hsl.s * 0.5),
    l: 28,
    a: 1,
  });
  const darkAccentForeground = darkForeground;

  const darkDestructive = destructive.lighten(10).saturate(10);
  const darkDestructiveForeground = new Color({ h: destructive.hsl.h, s: 80, l: 20, a: 1 });

  const darkBorder = new Color({ h: primaryHsl.h, s: 10, l: 100, a: 0.1 });
  const darkInput = new Color({ h: primaryHsl.h, s: 10, l: 100, a: 0.15 });
  const darkRing = new Color({ h: primaryHsl.h, s: 10, l: 50, a: 1 });

  // Dark sidebar
  const darkSidebar = darkBackground;
  const darkSidebarForeground = darkForeground;
  const darkSidebarPrimary = darkPrimary;
  const darkSidebarPrimaryForeground = darkPrimaryForeground;
  const darkSidebarAccent = darkAccent;
  const darkSidebarAccentForeground = darkAccentForeground;
  const darkSidebarBorder = darkBorder;
  const darkSidebarRing = darkRing;

  // Dark chart colors (slightly adjusted for dark backgrounds)
  const darkChart1 = lightChart1.lighten(5);
  const darkChart2 = lightChart2.lighten(5);
  const darkChart3 = lightChart3.lighten(5);
  const darkChart4 = lightChart4.lighten(5);
  const darkChart5 = lightChart5.lighten(5);

  return {
    light: {
      background: lightBackground,
      foreground: lightForeground,
      card: lightCard,
      cardForeground: lightCardForeground,
      popover: lightPopover,
      popoverForeground: lightPopoverForeground,
      primary: lightPrimary,
      primaryForeground: lightPrimaryForeground,
      secondary: lightSecondary,
      secondaryForeground: lightSecondaryForeground,
      muted: lightMuted,
      mutedForeground: lightMutedForeground,
      accent: lightAccent,
      accentForeground: lightAccentForeground,
      destructive: lightDestructive,
      destructiveForeground: lightDestructiveForeground,
      border: lightBorder,
      input: lightInput,
      ring: lightRing,
      chart1: lightChart1,
      chart2: lightChart2,
      chart3: lightChart3,
      chart4: lightChart4,
      chart5: lightChart5,
      sidebar: lightSidebar,
      sidebarForeground: lightSidebarForeground,
      sidebarPrimary: lightSidebarPrimary,
      sidebarPrimaryForeground: lightSidebarPrimaryForeground,
      sidebarAccent: lightSidebarAccent,
      sidebarAccentForeground: lightSidebarAccentForeground,
      sidebarBorder: lightSidebarBorder,
      sidebarRing: lightSidebarRing,
    },
    dark: {
      background: darkBackground,
      foreground: darkForeground,
      card: darkCard,
      cardForeground: darkCardForeground,
      popover: darkPopover,
      popoverForeground: darkPopoverForeground,
      primary: darkPrimary,
      primaryForeground: darkPrimaryForeground,
      secondary: darkSecondary,
      secondaryForeground: darkSecondaryForeground,
      muted: darkMuted,
      mutedForeground: darkMutedForeground,
      accent: darkAccent,
      accentForeground: darkAccentForeground,
      destructive: darkDestructive,
      destructiveForeground: darkDestructiveForeground,
      border: darkBorder,
      input: darkInput,
      ring: darkRing,
      chart1: darkChart1,
      chart2: darkChart2,
      chart3: darkChart3,
      chart4: darkChart4,
      chart5: darkChart5,
      sidebar: darkSidebar,
      sidebarForeground: darkSidebarForeground,
      sidebarPrimary: darkSidebarPrimary,
      sidebarPrimaryForeground: darkSidebarPrimaryForeground,
      sidebarAccent: darkSidebarAccent,
      sidebarAccentForeground: darkSidebarAccentForeground,
      sidebarBorder: darkSidebarBorder,
      sidebarRing: darkSidebarRing,
    },
  };
}

/**
 * Generate a destructive (red/danger) color that contrasts with the primary
 */
function generateDestructiveColor(primaryHue: number): Color {
  // Default destructive is red (~0-30 hue range)
  // If primary is already in the red range, shift destructive slightly
  const redHue = 15; // Orange-red

  // If primary hue is close to red, use a more orange-red
  const isNearRed = primaryHue < 40 || primaryHue > 340;
  const destructiveHue = isNearRed ? 0 : redHue;

  return new Color({
    h: destructiveHue,
    s: 85,
    l: 45,
    a: 1,
  });
}

/**
 * Generate Shadcn CSS variables string for light mode
 */
export function generateShadcnLightCSS(colors: ShadcnColors, radius: string = "0.625rem"): string {
  const lines: string[] = [];

  lines.push(`:root {`);
  lines.push(`  --radius: ${radius};`);
  lines.push(``);
  lines.push(`  /* Shadcn UI Compatible Variables */`);
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
