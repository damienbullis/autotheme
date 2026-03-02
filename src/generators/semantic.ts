import { Color } from "../core/color";
import { getContrastRatio } from "../core/contrast";
import type { FullPalette } from "../core/types";
import type { AutoThemeConfig, ColorFormat } from "../config/types";
import type { GeneratedTheme } from "./types";
import { getHarmonyName } from "./css";
import { generateStateTokens } from "./states";
import { generateElevationTokens } from "./elevation";

export interface SemanticToken {
  name: string;
  ref?: string;
  value: Color;
  rawCSS?: string;
}

export interface SemanticTokenSet {
  surfaces: SemanticToken[];
  borders: SemanticToken[];
  text: SemanticToken[];
  accents: SemanticToken[];
  states?: SemanticToken[];
  elevation?: SemanticToken[];
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
  const temperature = config.semantics.temperature ?? 0;

  // Apply temperature bias to surface hue
  // temperature: -1 = cool (250°), 0 = neutral (use primary), +1 = warm (60°)
  let surfaceHue = primaryHsl.h;
  if (temperature !== 0) {
    const targetHue = temperature > 0 ? 60 : 250;
    surfaceHue = primaryHsl.h + (targetHue - primaryHsl.h) * Math.abs(temperature) * 0.5;
    // Normalize hue to 0-360
    surfaceHue = ((surfaceHue % 360) + 360) % 360;
  }

  // Surface anchor lightness
  const surfaceAnchorL = isDark ? depth * 1.5 : 100 - depth;

  const surfaces = generateSurfaces(surfaceHue, primaryHsl.s, surfaceAnchorL, depth, isDark);
  const borders = generateBorders(surfaceHue, primaryHsl.s, surfaceAnchorL, isDark);
  const surfaceColor = surfaces[0]!.value;
  const text = generateTextHierarchy(
    surfaceHue,
    surfaceColor,
    config.semantics.textLevels,
    config.palette.contrastTarget,
    isDark,
  );
  const accents = generateAccents(palette, config.semantics.mapping, config.palette.prefix, isDark);

  const tokens: SemanticTokenSet = { surfaces, borders, text, accents };

  if (config.semantics.states.enabled) {
    tokens.states = generateStateTokens(tokens, config.semantics.states, mode);
  }

  if (config.semantics.elevation.enabled) {
    const surfaceColor = surfaces[0]!.value;
    const primaryHue = primaryHsl.h;
    tokens.elevation = generateElevationTokens(
      surfaceColor,
      primaryHue,
      config.semantics.elevation.levels,
      isDark,
      config.colorFormat,
    );
  }

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
 * Generate semantic CSS using CSS light-dark() function.
 * Produces a single :root block with light-dark(lightVal, darkVal) for each token.
 */
export function generateLightDarkSemanticCSS(theme: GeneratedTheme): string {
  const { palette, config } = theme;
  const comments = config.output.comments;
  const lines: string[] = [];

  const lightTokens = generateSemanticTokens(palette, config, "light");
  const darkTokens = generateSemanticTokens(palette, config, "dark");

  lines.push(":root {");

  const pairs = pairTokenSets(lightTokens, darkTokens);
  for (const { section, tokens } of pairs) {
    lines.push("");
    if (comments) lines.push(`    /* ${section} */`);
    for (const { name, lightVal, darkVal } of tokens) {
      lines.push(`    --${name}: light-dark(${lightVal}, ${darkVal});`);
    }
  }

  lines.push("}");

  // Accessibility queries still apply
  const a11y = config.semantics.accessibility ?? {
    contrastAdaptive: false,
    reducedTransparency: false,
    forcedColors: false,
    contrastAlgorithm: "wcag2" as const,
  };

  if (a11y.contrastAdaptive) {
    lines.push("");
    lines.push(generateContrastAdaptiveCSS(palette, config));
  }
  if (a11y.reducedTransparency) {
    lines.push("");
    lines.push(generateReducedTransparencyCSS(config, comments));
  }
  if (a11y.forcedColors) {
    lines.push("");
    lines.push(generateForcedColorsCSS(comments));
  }

  return lines.join("\n");
}

/**
 * Pair light and dark token sets for light-dark() output
 */
function pairTokenSets(
  light: SemanticTokenSet,
  dark: SemanticTokenSet,
): { section: string; tokens: { name: string; lightVal: string; darkVal: string }[] }[] {
  const sections = [
    { section: "Surfaces", light: light.surfaces, dark: dark.surfaces },
    { section: "Borders", light: light.borders, dark: dark.borders },
    { section: "Text Hierarchy", light: light.text, dark: dark.text },
    { section: "Accents", light: light.accents, dark: dark.accents },
  ];

  if (light.states && dark.states) {
    sections.push({ section: "States", light: light.states, dark: dark.states });
  }
  if (light.elevation && dark.elevation) {
    sections.push({ section: "Elevation", light: light.elevation, dark: dark.elevation });
  }

  return sections.map(({ section, light: l, dark: d }) => ({
    section,
    tokens: l.map((lightToken, i) => {
      const darkToken = d[i];
      const colorFormat = "oklch" as const; // light-dark always uses oklch for consistency
      return {
        name: lightToken.name,
        lightVal: formatTokenValueDirect(lightToken, colorFormat),
        darkVal: darkToken
          ? formatTokenValueDirect(darkToken, colorFormat)
          : formatTokenValueDirect(lightToken, colorFormat),
      };
    }),
  }));
}

function formatTokenValueDirect(token: SemanticToken, colorFormat: ColorFormat): string {
  if (token.rawCSS) return token.rawCSS;
  if (token.ref) return `var(${token.ref})`;
  return token.value.formatAs(colorFormat);
}

/**
 * Format semantic tokens into CSS blocks respecting mode.
 */
export function generateSemanticCSS(theme: GeneratedTheme): string {
  const { palette, config } = theme;
  const mode = config.mode;
  const colorFormat = config.colorFormat;
  const comments = config.output.comments;
  const a11y = config.semantics.accessibility ?? {
    contrastAdaptive: false,
    reducedTransparency: false,
    forcedColors: false,
    contrastAlgorithm: "wcag2" as const,
  };
  const lines: string[] = [];

  if (mode === "light" || mode === "both") {
    const lightTokens = generateSemanticTokens(palette, config, "light");
    lines.push(":root {");
    writeTokenBlock(lines, lightTokens, colorFormat, comments);
    lines.push("}");
  }

  if (mode === "dark") {
    const darkTokens = generateSemanticTokens(palette, config, "dark");
    lines.push(":root {");
    writeTokenBlock(lines, darkTokens, colorFormat, comments);
    lines.push("}");
  } else if (mode === "both") {
    lines.push("");
    const darkTokens = generateSemanticTokens(palette, config, "dark");
    lines.push(".dark {");
    writeTokenBlock(lines, darkTokens, colorFormat, comments);
    lines.push("}");
  }

  // Accessibility adaptive media queries
  if (a11y.contrastAdaptive) {
    lines.push("");
    lines.push(generateContrastAdaptiveCSS(palette, config));
  }

  if (a11y.reducedTransparency) {
    lines.push("");
    lines.push(generateReducedTransparencyCSS(config, comments));
  }

  if (a11y.forcedColors) {
    lines.push("");
    lines.push(generateForcedColorsCSS(comments));
  }

  return lines.join("\n");
}

/**
 * Generate @media (prefers-contrast: more) and (prefers-contrast: less) blocks
 */
function generateContrastAdaptiveCSS(palette: FullPalette, config: AutoThemeConfig): string {
  const colorFormat = config.colorFormat;
  const comments = config.output.comments;
  const lines: string[] = [];

  // High contrast mode: increase border contrast, strengthen text
  if (comments) lines.push("/* High Contrast Mode */");
  lines.push("@media (prefers-contrast: more) {");
  lines.push("  :root {");

  // Stronger borders
  const primaryHsl = palette.palettes[0]!.base.hsl;
  const strongBorder = new Color({ h: primaryHsl.h, s: 10, l: 20, a: 1 });
  lines.push(`    --border: ${strongBorder.formatAs(colorFormat)};`);
  lines.push(`    --border-subtle: ${strongBorder.formatAs(colorFormat)};`);
  const strongerBorder = new Color({ h: primaryHsl.h, s: 15, l: 10, a: 1 });
  lines.push(`    --border-strong: ${strongerBorder.formatAs(colorFormat)};`);

  // Stronger text
  const strongText = new Color({ h: 0, s: 0, l: 2, a: 1 });
  lines.push(`    --text-1: ${strongText.formatAs(colorFormat)};`);
  const text2 = new Color({ h: 0, s: 0, l: 15, a: 1 });
  lines.push(`    --text-2: ${text2.formatAs(colorFormat)};`);

  lines.push("  }");
  lines.push("");

  // Dark mode high contrast
  lines.push("  .dark {");
  const darkStrongBorder = new Color({ h: primaryHsl.h, s: 10, l: 80, a: 1 });
  lines.push(`    --border: ${darkStrongBorder.formatAs(colorFormat)};`);
  lines.push(`    --border-subtle: ${darkStrongBorder.formatAs(colorFormat)};`);
  const darkStrongerBorder = new Color({ h: primaryHsl.h, s: 15, l: 90, a: 1 });
  lines.push(`    --border-strong: ${darkStrongerBorder.formatAs(colorFormat)};`);
  const darkStrongText = new Color({ h: 0, s: 0, l: 98, a: 1 });
  lines.push(`    --text-1: ${darkStrongText.formatAs(colorFormat)};`);
  const darkText2 = new Color({ h: 0, s: 0, l: 85, a: 1 });
  lines.push(`    --text-2: ${darkText2.formatAs(colorFormat)};`);
  lines.push("  }");
  lines.push("}");

  lines.push("");

  // Low contrast mode: soften borders and text
  if (comments) lines.push("/* Low Contrast Mode */");
  lines.push("@media (prefers-contrast: less) {");
  lines.push("  :root {");
  const softBorder = new Color({ h: primaryHsl.h, s: 5, l: 85, a: 1 });
  lines.push(`    --border: ${softBorder.formatAs(colorFormat)};`);
  lines.push(`    --border-strong: ${softBorder.formatAs(colorFormat)};`);
  const softText = new Color({ h: 0, s: 0, l: 30, a: 1 });
  lines.push(`    --text-1: ${softText.formatAs(colorFormat)};`);
  lines.push("  }");
  lines.push("");
  lines.push("  .dark {");
  const darkSoftBorder = new Color({ h: primaryHsl.h, s: 5, l: 25, a: 1 });
  lines.push(`    --border: ${darkSoftBorder.formatAs(colorFormat)};`);
  lines.push(`    --border-strong: ${darkSoftBorder.formatAs(colorFormat)};`);
  const darkSoftText = new Color({ h: 0, s: 0, l: 70, a: 1 });
  lines.push(`    --text-1: ${darkSoftText.formatAs(colorFormat)};`);
  lines.push("  }");
  lines.push("}");

  return lines.join("\n");
}

/**
 * Generate @media (prefers-reduced-transparency) with opaque alpha fallbacks
 */
function generateReducedTransparencyCSS(config: AutoThemeConfig, comments: boolean): string {
  const colorFormat = config.colorFormat;
  const lines: string[] = [];

  if (comments) lines.push("/* Reduced Transparency Mode */");
  lines.push("@media (prefers-reduced-transparency) {");
  lines.push("  :root {");
  // Replace semi-transparent overlay with opaque equivalent
  const opaqueOverlay = new Color({ h: 0, s: 0, l: 10, a: 1 });
  lines.push(`    --surface-overlay: ${opaqueOverlay.formatAs(colorFormat)};`);
  lines.push("  }");
  lines.push("");
  lines.push("  .dark {");
  const darkOpaqueOverlay = new Color({ h: 0, s: 0, l: 5, a: 1 });
  lines.push(`    --surface-overlay: ${darkOpaqueOverlay.formatAs(colorFormat)};`);
  lines.push("  }");
  lines.push("}");

  return lines.join("\n");
}

/**
 * Generate @media (forced-colors: active) mapping to system colors
 */
function generateForcedColorsCSS(comments: boolean): string {
  const lines: string[] = [];

  if (comments) lines.push("/* Forced Colors Mode (Windows High Contrast) */");
  lines.push("@media (forced-colors: active) {");
  lines.push("  :root {");
  lines.push("    --surface: Canvas;");
  lines.push("    --surface-elevated: Canvas;");
  lines.push("    --surface-sunken: Canvas;");
  lines.push("    --text-1: CanvasText;");
  lines.push("    --text-2: CanvasText;");
  lines.push("    --text-3: GrayText;");
  lines.push("    --border: ButtonBorder;");
  lines.push("    --border-subtle: ButtonBorder;");
  lines.push("    --border-strong: CanvasText;");
  lines.push("    --accent: LinkText;");
  lines.push("    --accent-subtle: LinkText;");
  lines.push("    --accent-secondary: Highlight;");
  lines.push("  }");
  lines.push("}");

  return lines.join("\n");
}

/**
 * Replace token values with user-provided overrides, clearing ref.
 */
export function applyOverrides(tokens: SemanticTokenSet, overrides: Record<string, string>): void {
  const allGroups = [tokens.surfaces, tokens.borders, tokens.text, tokens.accents];
  if (tokens.states) allGroups.push(tokens.states);
  if (tokens.elevation) allGroups.push(tokens.elevation);
  for (const group of allGroups) {
    for (const token of group) {
      if (overrides[token.name] !== undefined) {
        token.value = new Color(overrides[token.name]!);
        delete token.ref;
        delete token.rawCSS;
      }
    }
  }
}

// ─── Internal helpers ────────────────────────────────────────

function writeTokenBlock(
  lines: string[],
  tokens: SemanticTokenSet,
  colorFormat: ColorFormat,
  comments: boolean = true,
): void {
  if (comments) lines.push("    /* Surfaces */");
  for (const t of tokens.surfaces) {
    lines.push(`    --${t.name}: ${formatTokenValue(t, colorFormat)};`);
  }

  lines.push("");
  if (comments) lines.push("    /* Borders */");
  for (const t of tokens.borders) {
    lines.push(`    --${t.name}: ${formatTokenValue(t, colorFormat)};`);
  }

  lines.push("");
  if (comments) lines.push("    /* Text Hierarchy */");
  for (const t of tokens.text) {
    lines.push(`    --${t.name}: ${formatTokenValue(t, colorFormat)};`);
  }

  lines.push("");
  if (comments) lines.push("    /* Accents */");
  for (const t of tokens.accents) {
    lines.push(`    --${t.name}: ${formatTokenValue(t, colorFormat)};`);
  }

  if (tokens.states && tokens.states.length > 0) {
    lines.push("");
    if (comments) lines.push("    /* States */");
    for (const t of tokens.states) {
      lines.push(`    --${t.name}: ${formatTokenValue(t, colorFormat)};`);
    }
  }

  if (tokens.elevation && tokens.elevation.length > 0) {
    lines.push("");
    if (comments) lines.push("    /* Elevation */");
    for (const t of tokens.elevation) {
      lines.push(`    --${t.name}: ${formatTokenValue(t, colorFormat)};`);
    }
  }
}

function formatTokenValue(token: SemanticToken, colorFormat: ColorFormat): string {
  if (token.rawCSS) {
    return token.rawCSS;
  }
  if (token.ref) {
    return `var(${token.ref})`;
  }
  return token.value.formatAs(colorFormat);
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
