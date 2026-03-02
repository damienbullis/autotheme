import { Color } from "../core/color";
import { findAccessibleTextColor } from "../core/contrast";
import { normalizeHue } from "../core/harmonies";
import { getHarmonyName } from "./css";
import type { GeneratedTheme } from "./types";
import type { FullPalette, PaletteVariations } from "../core/types";
import type { ColorFormat } from "../config/types";

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
 * Generate a destructive/error color independent of the palette.
 * Uses hue-distance algorithm to pick a red-ish hue maximally distant from primary.
 */
export function generateErrorColor(primaryHue: number): Color {
  const candidates = [0, 10, 350];

  let bestHue = 0;
  let maxDist = -1;
  for (const h of candidates) {
    const diff = Math.abs(primaryHue - h);
    const dist = Math.min(diff, 360 - diff);
    if (dist > maxDist) {
      maxDist = dist;
      bestHue = h;
    }
  }

  // If all candidates are too close (< 30° from primary), shift to orange
  if (maxDist < 30) {
    bestHue = 25;
  }

  return new Color({ h: bestHue, s: 85, l: 45, a: 1 });
}

/**
 * Build the Shadcn variable mapping table.
 * Most variables reference semantic tokens via var(). Only --destructive is computed.
 */
function buildShadcnMapping(
  prefix: string,
  primaryHue: number,
  paletteCount: number,
  mode: "light" | "dark",
  colorFormat: ColorFormat,
): Record<string, string> {
  const error = mode === "dark"
    ? generateErrorColor(primaryHue).lighten(10).saturate(10)
    : generateErrorColor(primaryHue);
  const errorFg = findAccessibleTextColor(error);

  // Chart colors: map to harmony base colors (500)
  const chartEntries: Record<string, string> = {};
  for (let i = 1; i <= 5; i++) {
    const harmonyIdx = (i - 1) % paletteCount;
    const name = getHarmonyName(harmonyIdx);
    chartEntries[`chart-${i}`] = `var(--${prefix}-${name}-500)`;
  }

  return {
    "background": "var(--surface)",
    "foreground": "var(--text-1)",

    "card": "var(--surface-elevated)",
    "card-foreground": "var(--text-1)",

    "popover": "var(--surface-elevated)",
    "popover-foreground": "var(--text-1)",

    "primary": "var(--accent)",
    "primary-foreground": `var(--${prefix}-primary-foreground)`,

    "secondary": "var(--accent-secondary)",
    "secondary-foreground": `var(--${prefix}-secondary-foreground)`,

    "muted": "var(--surface-sunken)",
    "muted-foreground": "var(--text-2)",

    "accent": "var(--accent-subtle)",
    "accent-foreground": "var(--text-1)",

    "destructive": error.formatAs(colorFormat),
    "destructive-foreground": errorFg.formatAs(colorFormat),

    "border": "var(--border)",
    "input": "var(--border-strong)",
    "ring": "var(--accent)",

    ...chartEntries,

    "sidebar": "var(--surface-sunken)",
    "sidebar-foreground": "var(--text-1)",
    "sidebar-primary": "var(--accent)",
    "sidebar-primary-foreground": `var(--${prefix}-primary-foreground)`,
    "sidebar-accent": "var(--accent-subtle)",
    "sidebar-accent-foreground": "var(--text-1)",
    "sidebar-border": "var(--border-subtle)",
    "sidebar-ring": "var(--accent)",
  };
}

/**
 * Generate complete Shadcn CSS respecting the configured mode.
 * Maps Shadcn variables to semantic tokens via var() references.
 */
export function generateShadcnCSS(theme: GeneratedTheme, radius: string = "0.625rem"): string {
  const { config, palette } = theme;
  const prefix = config.palette.prefix;
  const colorFormat = config.colorFormat;
  const primaryHue = palette.palettes[0]!.base.hsl.h;
  const paletteCount = palette.palettes.length;
  const mode = config.mode;
  const lines: string[] = [];

  const comments = config.output.comments;

  if (mode === "light" || mode === "both") {
    const mapping = buildShadcnMapping(prefix, primaryHue, paletteCount, "light", colorFormat);
    lines.push(":root {");
    lines.push(`    --radius: ${radius};`);
    lines.push("");
    if (comments) lines.push("    /* Shadcn UI Component Variables */");
    for (const [key, value] of Object.entries(mapping)) {
      lines.push(`    --${key}: ${value};`);
    }
    lines.push("}");
  }

  if (mode === "dark") {
    // Dark-only: emit dark mapping under :root
    const mapping = buildShadcnMapping(prefix, primaryHue, paletteCount, "dark", colorFormat);
    lines.push(":root {");
    lines.push(`    --radius: ${radius};`);
    lines.push("");
    if (comments) lines.push("    /* Shadcn UI Component Variables */");
    for (const [key, value] of Object.entries(mapping)) {
      lines.push(`    --${key}: ${value};`);
    }
    lines.push("}");
  }

  if (mode === "both") {
    // Dark mode override: only destructive changes (semantic vars handle the rest)
    const darkError = generateErrorColor(primaryHue).lighten(10).saturate(10);
    const darkErrorFg = findAccessibleTextColor(darkError);
    lines.push("");
    lines.push(".dark {");
    lines.push(`    --destructive: ${darkError.formatAs(colorFormat)};`);
    lines.push(`    --destructive-foreground: ${darkErrorFg.formatAs(colorFormat)};`);
    lines.push("}");
  }

  return lines.join("\n");
}
