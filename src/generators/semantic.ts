import { Color } from "../core/color";
import { getContrastRatio } from "../core/contrast";
import type { FullPalette } from "../core/types";
import type { AutoThemeConfig } from "../config/types";
import type { GeneratedTheme } from "./types";
import { getHarmonyName } from "./css";

export interface SemanticToken {
  name: string;
  ref?: string;
  value: Color;
}

export interface SemanticTokenSet {
  surfaces: SemanticToken[];
  borders: SemanticToken[];
  text: SemanticToken[];
  accents: SemanticToken[];
}

/**
 * Main orchestrator: generate all semantic tokens for a given mode.
 */
export function generateSemanticTokens(
  palette: FullPalette,
  config: AutoThemeConfig,
  mode: "light" | "dark",
): SemanticTokenSet {
  const isDark = mode === "dark";
  const primaryPalette = palette.palettes[0]!;
  const primaryHsl = primaryPalette.base.hsl;
  const depth = config.semantics.surfaceDepth;

  // Surface anchor lightness
  const surfaceAnchorL = isDark ? depth * 1.5 : 100 - depth;

  const surfaces = generateSurfaces(primaryHsl.h, primaryHsl.s, surfaceAnchorL, depth, isDark);
  const borders = generateBorders(primaryHsl.h, primaryHsl.s, surfaceAnchorL, isDark);
  const surfaceColor = surfaces[0]!.value;
  const text = generateTextHierarchy(
    primaryHsl.h,
    surfaceColor,
    config.semantics.textLevels,
    config.palette.contrastTarget,
    isDark,
  );
  const accents = generateAccents(palette, config.semantics.mapping, config.palette.prefix, isDark);

  const tokens: SemanticTokenSet = { surfaces, borders, text, accents };

  if (config.semantics.overrides) {
    applyOverrides(tokens, config.semantics.overrides);
  }

  return tokens;
}

/**
 * Generate surface tokens: surface, surface-elevated, surface-sunken, surface-overlay.
 */
export function generateSurfaces(
  hue: number,
  primarySat: number,
  anchorL: number,
  _depth: number,
  isDark: boolean,
): SemanticToken[] {
  const sat = Math.min(15, primarySat * 0.2);

  const elevatedL = isDark ? anchorL + 4 : anchorL + 2;
  const sunkenL = isDark ? anchorL - 2 : anchorL - 4;

  const surface = new Color({ h: hue, s: sat, l: clampL(anchorL), a: 1 });
  const elevated = new Color({ h: hue, s: sat, l: clampL(elevatedL), a: 1 });
  const sunken = new Color({ h: hue, s: sat, l: clampL(sunkenL), a: 1 });

  const overlayL = isDark ? 0 : 10;
  const overlayA = isDark ? 0.6 : 0.5;
  const overlay = new Color({ h: hue, s: sat, l: overlayL, a: overlayA });

  return [
    { name: "surface", value: surface },
    { name: "surface-elevated", value: elevated },
    { name: "surface-sunken", value: sunken },
    { name: "surface-overlay", value: overlay },
  ];
}

/**
 * Generate border tokens: border, border-subtle, border-strong.
 */
export function generateBorders(
  hue: number,
  primarySat: number,
  surfaceAnchorL: number,
  isDark: boolean,
): SemanticToken[] {
  const sat = Math.min(10, primarySat * 0.15);

  // Offsets from surface anchor — borders sit between surface and text
  const subtleOffset = isDark ? 8 : -8;
  const normalOffset = isDark ? 15 : -15;
  const strongOffset = isDark ? 25 : -25;

  return [
    {
      name: "border-subtle",
      value: new Color({ h: hue, s: sat, l: clampL(surfaceAnchorL + subtleOffset), a: 1 }),
    },
    {
      name: "border",
      value: new Color({ h: hue, s: sat, l: clampL(surfaceAnchorL + normalOffset), a: 1 }),
    },
    {
      name: "border-strong",
      value: new Color({ h: hue, s: sat, l: clampL(surfaceAnchorL + strongOffset), a: 1 }),
    },
  ];
}

/**
 * Generate text hierarchy tokens: text-1 (strongest) through text-N.
 * text-1 meets contrastTarget (AAA default), all subsequent meet AA (4.5:1).
 */
export function generateTextHierarchy(
  hue: number,
  surface: Color,
  textLevels: number,
  contrastTarget: number,
  isDark: boolean,
): SemanticToken[] {
  const tokens: SemanticToken[] = [];

  // text-1: strongest contrast
  const startL = isDark ? 98 : 2;
  const text1 = findTextWithContrast(hue, surface, startL, contrastTarget, isDark, 1.0);
  tokens.push({ name: "text-1", value: text1 });

  if (textLevels <= 1) return tokens;

  // Interpolate lightness between text-1 and surface for remaining levels
  const text1L = text1.hsl.l;
  const surfaceL = surface.hsl.l;
  const midL = (text1L + surfaceL) / 2;

  for (let i = 2; i <= textLevels; i++) {
    // Each level moves closer to surface (less contrast)
    const t = (i - 1) / textLevels;
    const targetL = text1L + (midL - text1L) * t;
    // Reduce hue tinting for lower levels
    const hueTint = Math.max(0, 1.0 - (i - 1) * 0.3);
    const sat = Math.min(8, 8 * hueTint);

    const candidate = new Color({ h: hue, s: sat, l: clampL(targetL), a: 1 });
    const ratio = getContrastRatio(candidate, surface);

    // Ensure minimum AA contrast (4.5:1)
    if (ratio >= 4.5) {
      tokens.push({ name: `text-${i}`, value: candidate });
    } else {
      // Fall back: find a color that meets AA
      const fallback = findTextWithContrast(hue, surface, targetL, 4.5, isDark, hueTint);
      tokens.push({ name: `text-${i}`, value: fallback });
    }
  }

  return tokens;
}

/**
 * Generate accent tokens referencing palette vars.
 */
export function generateAccents(
  palette: FullPalette,
  mapping: { accent: string; accentSecondary: string },
  prefix: string,
  isDark: boolean,
): SemanticToken[] {
  const accentIndex = findHarmonyIndex(palette, mapping.accent);
  const secondaryIndex = findHarmonyIndex(palette, mapping.accentSecondary);

  const accentName = getHarmonyName(accentIndex);
  const secondaryName = getHarmonyName(secondaryIndex);

  const accentColor = palette.palettes[accentIndex]!.base;
  const subtleColor = isDark
    ? (palette.palettes[accentIndex]!.shades[0] ?? accentColor)
    : (palette.palettes[accentIndex]!.tints[0] ?? accentColor);
  const secondaryColor = palette.palettes[secondaryIndex]!.base;

  // Subtle uses a lighter tint (light) or darker shade (dark)
  const subtleScale = isDark ? 600 : 400;

  return [
    {
      name: "accent",
      ref: `--${prefix}-${accentName}-500`,
      value: accentColor,
    },
    {
      name: "accent-subtle",
      ref: `--${prefix}-${accentName}-${subtleScale}`,
      value: subtleColor,
    },
    {
      name: "accent-secondary",
      ref: `--${prefix}-${secondaryName}-500`,
      value: secondaryColor,
    },
  ];
}

/**
 * Format semantic tokens into CSS blocks respecting mode.
 */
export function generateSemanticCSS(theme: GeneratedTheme): string {
  const { palette, config } = theme;
  const mode = config.mode;
  const lines: string[] = [];

  if (mode === "light" || mode === "both") {
    const lightTokens = generateSemanticTokens(palette, config, "light");
    lines.push(":root {");
    writeTokenBlock(lines, lightTokens);
    lines.push("}");
  }

  if (mode === "dark") {
    const darkTokens = generateSemanticTokens(palette, config, "dark");
    lines.push(":root {");
    writeTokenBlock(lines, darkTokens);
    lines.push("}");
  } else if (mode === "both") {
    lines.push("");
    const darkTokens = generateSemanticTokens(palette, config, "dark");
    lines.push(".dark {");
    writeTokenBlock(lines, darkTokens);
    lines.push("}");
  }

  return lines.join("\n");
}

/**
 * Replace token values with user-provided overrides, clearing ref.
 */
export function applyOverrides(tokens: SemanticTokenSet, overrides: Record<string, string>): void {
  const allGroups = [tokens.surfaces, tokens.borders, tokens.text, tokens.accents];
  for (const group of allGroups) {
    for (const token of group) {
      if (overrides[token.name] !== undefined) {
        token.value = new Color(overrides[token.name]!);
        delete token.ref;
      }
    }
  }
}

// ─── Internal helpers ────────────────────────────────────────

function writeTokenBlock(lines: string[], tokens: SemanticTokenSet): void {
  lines.push("    /* Surfaces */");
  for (const t of tokens.surfaces) {
    lines.push(`    --${t.name}: ${formatTokenValue(t)};`);
  }

  lines.push("");
  lines.push("    /* Borders */");
  for (const t of tokens.borders) {
    lines.push(`    --${t.name}: ${formatTokenValue(t)};`);
  }

  lines.push("");
  lines.push("    /* Text Hierarchy */");
  for (const t of tokens.text) {
    lines.push(`    --${t.name}: ${formatTokenValue(t)};`);
  }

  lines.push("");
  lines.push("    /* Accents */");
  for (const t of tokens.accents) {
    lines.push(`    --${t.name}: ${formatTokenValue(t)};`);
  }
}

function formatTokenValue(token: SemanticToken): string {
  if (token.ref) {
    return `var(${token.ref})`;
  }
  return token.value.toOKLCH();
}

function clampL(l: number): number {
  return Math.max(0, Math.min(100, l));
}

/**
 * Find a text color at approximately targetL that meets the given contrast ratio.
 * Adjusts away from surface if the initial attempt doesn't meet the target.
 */
function findTextWithContrast(
  hue: number,
  surface: Color,
  startL: number,
  targetRatio: number,
  isDark: boolean,
  hueTint: number,
): Color {
  const sat = Math.min(8, 8 * hueTint);
  const step = isDark ? -1 : 1;

  let bestColor = new Color({ h: hue, s: sat, l: clampL(startL), a: 1 });
  let bestRatio = getContrastRatio(bestColor, surface);

  if (bestRatio >= targetRatio) return bestColor;

  // Walk lightness toward the extreme (0 for light mode, 100 for dark mode)
  let currentL = startL;
  for (let i = 0; i < 100; i++) {
    currentL -= step;
    if (currentL < 0 || currentL > 100) break;

    const candidate = new Color({ h: hue, s: sat, l: clampL(currentL), a: 1 });
    const ratio = getContrastRatio(candidate, surface);

    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestColor = candidate;
    }

    if (ratio >= targetRatio) return candidate;
  }

  return bestColor;
}

/**
 * Map a harmony name ("primary", "secondary", ...) to a palette index.
 */
function findHarmonyIndex(palette: FullPalette, name: string): number {
  const names = palette.palettes.map((_, i) => getHarmonyName(i));
  const idx = names.indexOf(name);
  return idx >= 0 ? idx : 0;
}
