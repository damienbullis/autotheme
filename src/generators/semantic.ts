import { Color } from "../core/color";
import { getContrastRatio, findAccessibleTextColor } from "../core/contrast";
import type { FullPalette } from "../core/types";
import type { ResolvedConfig, SemanticsConfig, ColorFormat } from "../config/types";
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
  tintedSurfaces: SemanticToken[];
  states?: SemanticToken[];
  elevation?: SemanticToken[];
}

/**
 * Main orchestrator: generate all semantic tokens for a given mode.
 * All generation is OKLCH-native — no HSL round-trips.
 */
export function generateSemanticTokens(
  palette: FullPalette,
  config: ResolvedConfig,
  mode: "light" | "dark",
): SemanticTokenSet {
  if (config.semantics === false) {
    return { surfaces: [], borders: [], text: [], accents: [], tintedSurfaces: [] };
  }

  const sem = config.semantics;
  const isDark = mode === "dark";
  const primaryOklch = palette.palettes[0]!.base.oklch;

  // Depth: for "both" mode, derive per-mode depth
  const depth = isDark ? sem.depth : 1 - sem.depth;

  const surfaces = generateSurfaces(
    primaryOklch.h,
    sem.surfaces.chroma,
    depth,
    sem.surfaces.sunkenDelta,
  );
  const borders = generateBorders(
    primaryOklch.h,
    sem.borders.chroma,
    depth,
    sem.borders.offsets,
    isDark,
  );
  const surfaceColor = surfaces[0]!.value;
  const text = generateTextHierarchy(primaryOklch.h, surfaceColor, sem.text, isDark);
  const accents = generateAccents(palette, sem.mapping, isDark);
  const tintedSurfaces = generateTintedSurfaces(palette, depth, primaryOklch.c, isDark);

  const tokens: SemanticTokenSet = { surfaces, borders, text, accents, tintedSurfaces };

  // Opt-in features
  if (config.states !== false) {
    tokens.states = generateStateTokens(config.states, mode);
  }
  if (config.elevation !== false) {
    tokens.elevation = generateElevationTokens(
      config.elevation,
      depth,
      primaryOklch.h,
      sem.surfaces.chroma,
      isDark,
      config.output.format,
    );
  }

  if (sem.overrides) {
    applyOverrides(tokens, sem.overrides);
  }

  return tokens;
}

/**
 * Generate surface tokens: surface, surface-sunken.
 * OKLCH-native generation.
 */
export function generateSurfaces(
  hue: number,
  chroma: number,
  depth: number,
  sunkenDelta: number,
): SemanticToken[] {
  const surface = Color.fromOklch(clamp01(depth), chroma, hue);
  const sunken = Color.fromOklch(clamp01(depth + sunkenDelta), chroma, hue);

  return [
    { name: "surface", value: surface },
    { name: "surface-sunken", value: sunken },
  ];
}

/**
 * Generate border tokens with L offsets from depth.
 * Sign flips: borders are darker in light mode, lighter in dark mode.
 */
export function generateBorders(
  hue: number,
  chroma: number,
  depth: number,
  offsets: [number, number, number],
  isDark: boolean,
): SemanticToken[] {
  // In dark mode, borders are lighter (positive offset). In light mode, darker (negative offset).
  const sign = isDark ? 1 : -1;

  return [
    {
      name: "border-subtle",
      value: Color.fromOklch(clamp01(depth + sign * offsets[0]), chroma, hue),
    },
    {
      name: "border",
      value: Color.fromOklch(clamp01(depth + sign * offsets[1]), chroma, hue),
    },
    {
      name: "border-strong",
      value: Color.fromOklch(clamp01(depth + sign * offsets[2]), chroma, hue),
    },
  ];
}

/**
 * Generate text hierarchy using formulaic OKLCH L interpolation.
 * text-1 = strongest contrast (anchor), text-N = weakest (floor).
 * Post-generation contrast check nudges L if needed.
 */
export function generateTextHierarchy(
  hue: number,
  surface: Color,
  textConfig: SemanticsConfig["text"],
  isDark: boolean,
): SemanticToken[] {
  const { levels, anchor, floor, curve, chroma } = textConfig;
  const [chromaAnchor, chromaFloor] = chroma;
  const tokens: SemanticToken[] = [];

  for (let i = 1; i <= levels; i++) {
    const t = levels === 1 ? 0 : (i - 1) / (levels - 1);
    const tCurved = Math.pow(t, curve);

    let L = anchor - (anchor - floor) * tCurved;
    const C = chromaAnchor - (chromaAnchor - chromaFloor) * tCurved;

    const candidate = Color.fromOklch(clamp01(L), C, hue);
    const ratio = getContrastRatio(candidate, surface);

    // Nudge L if text-1 doesn't meet AA (4.5:1) against surface
    if (i === 1 && ratio < 4.5) {
      L = isDark ? Math.min(1, L + 0.1) : Math.max(0, L - 0.1);
    }

    tokens.push({ name: `text-${i}`, value: Color.fromOklch(clamp01(L), C, hue) });
  }

  return tokens;
}

/**
 * Generate accent tokens — one pair per harmony color.
 * Values are direct OKLCH, not var() references.
 */
export function generateAccents(
  palette: FullPalette,
  mapping: SemanticsConfig["mapping"],
  _isDark: boolean,
): SemanticToken[] {
  const tokens: SemanticToken[] = [];
  const names = ["accent", "secondary", "tertiary"] as const;
  const mappingKeys = [mapping.accent, mapping.secondary, mapping.tertiary];

  for (let i = 0; i < mappingKeys.length; i++) {
    const harmonyName = mappingKeys[i]!;
    const harmonyIndex = findHarmonyIndex(palette, harmonyName);
    if (harmonyIndex >= palette.palettes.length) continue;

    const baseColor = palette.palettes[harmonyIndex]!.base;
    const fgColor = findAccessibleTextColor(baseColor);

    const tokenName = i === 0 ? "accent" : `accent-${names[i]}`;
    const fgTokenName = i === 0 ? "accent-foreground" : `accent-${names[i]}-foreground`;

    tokens.push({ name: tokenName, value: baseColor });
    tokens.push({ name: fgTokenName, value: fgColor });
  }

  return tokens;
}

/**
 * Generate tinted surfaces — one pair per harmony color.
 * Low-chroma surface variants for cards, sections, callouts.
 */
export function generateTintedSurfaces(
  palette: FullPalette,
  depth: number,
  primaryChroma: number,
  isDark: boolean,
): SemanticToken[] {
  const tokens: SemanticToken[] = [];
  const tintChroma = primaryChroma * 0.15; // ~15% of primary chroma
  const elevatedDelta = isDark ? 0.03 : -0.03;
  const surfaceL = clamp01(depth + elevatedDelta);

  for (let i = 0; i < palette.palettes.length; i++) {
    const name = getHarmonyName(i);
    const harmonyHue = palette.palettes[i]!.base.oklch.h;

    const surfaceColor = Color.fromOklch(surfaceL, tintChroma, harmonyHue);
    // Foreground carries slightly more chroma than the surface
    const fgL = isDark ? 0.85 : 0.25;
    const fgColor = Color.fromOklch(fgL, tintChroma * 2, harmonyHue);

    tokens.push({ name: `surface-${name}`, value: surfaceColor });
    tokens.push({ name: `surface-${name}-foreground`, value: fgColor });
  }

  return tokens;
}

/**
 * Generate semantic CSS using CSS light-dark() function.
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

  // Accessibility queries
  if (config.output.contrastMedia) {
    lines.push("");
    lines.push(generateContrastAdaptiveCSS(palette, config));
  }
  if (config.output.reducedTransparency) {
    lines.push("");
    lines.push(generateReducedTransparencyCSS(config, comments));
  }
  if (config.output.forcedColors) {
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
    { section: "Tinted Surfaces", light: light.tintedSurfaces, dark: dark.tintedSurfaces },
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
      const colorFormat = "oklch" as const;
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
  const colorFormat = config.output.format;
  const comments = config.output.comments;
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
  if (config.output.contrastMedia) {
    lines.push("");
    lines.push(generateContrastAdaptiveCSS(palette, config));
  }

  if (config.output.reducedTransparency) {
    lines.push("");
    lines.push(generateReducedTransparencyCSS(config, comments));
  }

  if (config.output.forcedColors) {
    lines.push("");
    lines.push(generateForcedColorsCSS(comments));
  }

  return lines.join("\n");
}

/**
 * Generate @media (prefers-contrast: more) and (prefers-contrast: less) blocks
 */
function generateContrastAdaptiveCSS(palette: FullPalette, config: ResolvedConfig): string {
  const colorFormat = config.output.format;
  const comments = config.output.comments;
  const lines: string[] = [];

  const primaryHsl = palette.palettes[0]!.base.hsl;

  if (comments) lines.push("/* High Contrast Mode */");
  lines.push("@media (prefers-contrast: more) {");
  lines.push("  :root {");
  const strongBorder = new Color({ h: primaryHsl.h, s: 10, l: 20, a: 1 });
  lines.push(`    --border: ${strongBorder.formatAs(colorFormat)};`);
  lines.push(`    --border-subtle: ${strongBorder.formatAs(colorFormat)};`);
  const strongerBorder = new Color({ h: primaryHsl.h, s: 15, l: 10, a: 1 });
  lines.push(`    --border-strong: ${strongerBorder.formatAs(colorFormat)};`);
  const strongText = new Color({ h: 0, s: 0, l: 2, a: 1 });
  lines.push(`    --text-1: ${strongText.formatAs(colorFormat)};`);
  const text2 = new Color({ h: 0, s: 0, l: 15, a: 1 });
  lines.push(`    --text-2: ${text2.formatAs(colorFormat)};`);
  lines.push("  }");
  lines.push("");
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

function generateReducedTransparencyCSS(config: ResolvedConfig, comments: boolean): string {
  const colorFormat = config.output.format;
  const lines: string[] = [];

  if (comments) lines.push("/* Reduced Transparency Mode */");
  lines.push("@media (prefers-reduced-transparency) {");
  lines.push("  :root {");
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

function generateForcedColorsCSS(comments: boolean): string {
  const lines: string[] = [];

  if (comments) lines.push("/* Forced Colors Mode (Windows High Contrast) */");
  lines.push("@media (forced-colors: active) {");
  lines.push("  :root {");
  lines.push("    --surface: Canvas;");
  lines.push("    --surface-sunken: Canvas;");
  lines.push("    --text-1: CanvasText;");
  lines.push("    --text-2: CanvasText;");
  lines.push("    --text-3: GrayText;");
  lines.push("    --border: ButtonBorder;");
  lines.push("    --border-subtle: ButtonBorder;");
  lines.push("    --border-strong: CanvasText;");
  lines.push("    --accent: LinkText;");
  lines.push("    --accent-secondary: Highlight;");
  lines.push("  }");
  lines.push("}");

  return lines.join("\n");
}

/**
 * Replace token values with user-provided overrides.
 */
export function applyOverrides(tokens: SemanticTokenSet, overrides: Record<string, string>): void {
  const allGroups = [
    tokens.surfaces,
    tokens.borders,
    tokens.text,
    tokens.accents,
    tokens.tintedSurfaces,
  ];
  if (tokens.states) allGroups.push(tokens.states);
  if (tokens.elevation) allGroups.push(tokens.elevation);
  for (const group of allGroups) {
    for (const token of group) {
      if (overrides[token.name] !== undefined) {
        const override = overrides[token.name]!;
        if (token.rawCSS !== undefined) {
          // rawCSS tokens: replace the raw string directly
          token.rawCSS = override;
        } else {
          // Color tokens: parse as color
          token.value = new Color(override);
          delete token.ref;
          delete token.rawCSS;
        }
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

  if (tokens.tintedSurfaces.length > 0) {
    lines.push("");
    if (comments) lines.push("    /* Tinted Surfaces */");
    for (const t of tokens.tintedSurfaces) {
      lines.push(`    --${t.name}: ${formatTokenValue(t, colorFormat)};`);
    }
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
  if (token.rawCSS) return token.rawCSS;
  if (token.ref) return `var(${token.ref})`;
  return token.value.formatAs(colorFormat);
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/**
 * Map a harmony name to a palette index.
 */
function findHarmonyIndex(palette: FullPalette, name: string): number {
  const names = palette.palettes.map((_, i) => getHarmonyName(i));
  const idx = names.indexOf(name);
  return idx >= 0 ? idx : 0;
}
