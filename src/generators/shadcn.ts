import { Color } from "../core/color";
import { findAccessibleTextColor } from "../core/contrast";
import type { GeneratedTheme } from "./types";
import { generateSemanticColors, type SemanticColors } from "./semantic";

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
 * Derive Shadcn colors from semantic tokens for a given mode
 */
function deriveShadcnFromSemantic(
  semantic: SemanticColors,
  harmonyColors: Color[],
  mode: "light" | "dark",
): ShadcnColors {
  const primary = harmonyColors[0]!;

  // Card and popover: use surface container for subtle elevation
  const card = mode === "light" ? semantic.surfaceContainer : semantic.surfaceContainerHigh;
  const popover = mode === "light" ? semantic.surfaceContainer : semantic.surfaceContainerHigh;

  // Sidebar: slightly offset from main surface
  const sidebar = mode === "light" ? semantic.surfaceContainerLow : semantic.surface;

  // Chart colors: direct from harmony colors
  const chart1 =
    mode === "dark" ? (harmonyColors[0] || primary).lighten(5) : harmonyColors[0] || primary;
  const chart2 =
    mode === "dark"
      ? (harmonyColors[1] || primary.rotate(60)).lighten(5)
      : harmonyColors[1] || primary.rotate(60);
  const chart3 =
    mode === "dark"
      ? (harmonyColors[2] || primary.rotate(120)).lighten(5)
      : harmonyColors[2] || primary.rotate(120);
  const chart4 =
    mode === "dark"
      ? (harmonyColors[3] || primary.rotate(180)).lighten(5)
      : harmonyColors[3] || primary.rotate(180);
  const chart5 =
    mode === "dark"
      ? (harmonyColors[4] || primary.rotate(240)).lighten(5)
      : harmonyColors[4] || primary.rotate(240);

  return {
    // Background/foreground from semantic surface
    background: semantic.surface,
    foreground: semantic.surfaceForeground,

    card,
    cardForeground: findAccessibleTextColor(card),

    popover,
    popoverForeground: findAccessibleTextColor(popover),

    // Primary: direct from semantic
    primary: semantic.primary,
    primaryForeground: semantic.primaryForeground,

    // Secondary: shadcn "secondary" is a soft background, so use secondaryContainer
    secondary: semantic.secondaryContainer,
    secondaryForeground: semantic.secondaryContainerForeground,

    // Muted: from semantic muted container
    muted: semantic.mutedContainer,
    mutedForeground: semantic.mutedForeground,

    // Accent: shadcn "accent" is a soft background, so use accentContainer
    accent: semantic.accentContainer,
    accentForeground: semantic.accentContainerForeground,

    // Destructive: from semantic error
    destructive: semantic.error,
    destructiveForeground: semantic.errorForeground,

    // Border/input from semantic outline
    border: semantic.outlineVariant,
    input: semantic.outline,
    ring: semantic.primary,

    // Charts
    chart1,
    chart2,
    chart3,
    chart4,
    chart5,

    // Sidebar
    sidebar,
    sidebarForeground: findAccessibleTextColor(sidebar),
    sidebarPrimary: semantic.primary,
    sidebarPrimaryForeground: semantic.primaryForeground,
    sidebarAccent: semantic.accentContainer,
    sidebarAccentForeground: semantic.accentContainerForeground,
    sidebarBorder: semantic.outlineVariant,
    sidebarRing: semantic.primary,
  };
}

/**
 * Generate Shadcn-compatible colors from AutoTheme palette via semantic tokens
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
  const semantic = generateSemanticColors(theme);

  return {
    light: deriveShadcnFromSemantic(semantic.light, harmonyColors, "light"),
    dark: deriveShadcnFromSemantic(semantic.dark, harmonyColors, "dark"),
  };
}

/**
 * Generate Shadcn CSS variables string for light mode
 * Only emits shadcn-specific variables not already covered by semantic layer
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
