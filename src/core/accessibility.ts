import { Color } from "./color";
import { getContrastRatio } from "./contrast";
import type { GeneratedTheme } from "../generators/types";
import {
  generateSemanticTokens,
  type SemanticTokenSet,
  type SemanticToken,
} from "../generators/semantic";

// ─── Types ──────────────────────────────────────────────────

export interface TokenPair {
  foreground: string;
  background: string;
  context?: string;
}

export interface ContrastCheckResult {
  pair: TokenPair;
  foregroundColor: Color;
  backgroundColor: Color;
  ratio: number;
  level: "AAA" | "AA" | "A" | "FAIL";
  passes: boolean;
}

export interface ContrastReport {
  level: "aa" | "aaa";
  passed: ContrastCheckResult[];
  failed: ContrastCheckResult[];
  allPass: boolean;
}

export interface ContrastFixResult {
  pair: TokenPair;
  originalRatio: number;
  fixedRatio: number;
  originalColor: Color;
  fixedColor: Color;
}

export interface ContrastFixReport {
  level: "aa" | "aaa";
  fixes: ContrastFixResult[];
  unfixable: TokenPair[];
}

// ─── Token Pair Discovery ───────────────────────────────────

/**
 * Look up a token name across all groups in a SemanticTokenSet.
 */
export function resolveTokenColor(name: string, tokens: SemanticTokenSet): Color | undefined {
  const allGroups: SemanticToken[][] = [
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
      if (token.name === name && !token.rawCSS) {
        return token.value;
      }
    }
  }
  return undefined;
}

/**
 * Dynamically discover foreground/background token pairs from a semantic token set.
 */
export function getTokenPairs(tokens: SemanticTokenSet): TokenPair[] {
  const pairs: TokenPair[] = [];

  // All text-N against surface
  for (const textToken of tokens.text) {
    pairs.push({
      foreground: textToken.name,
      background: "surface",
      context: `${textToken.name} on surface`,
    });
  }

  // text-1 against surface-sunken
  if (tokens.text.length > 0) {
    pairs.push({
      foreground: "text-1",
      background: "surface-sunken",
      context: "text-1 on surface-sunken",
    });
  }

  // Each *-foreground against its partner
  for (const token of tokens.accents) {
    if (token.name.endsWith("-foreground")) {
      const partnerName = token.name.replace("-foreground", "");
      pairs.push({
        foreground: token.name,
        background: partnerName,
        context: `${token.name} on ${partnerName}`,
      });
    }
  }

  // Tinted surface foregrounds against their surfaces
  for (const token of tokens.tintedSurfaces) {
    if (token.name.endsWith("-foreground")) {
      const partnerName = token.name.replace("-foreground", "");
      pairs.push({
        foreground: token.name,
        background: partnerName,
        context: `${token.name} on ${partnerName}`,
      });
    }
  }

  // border-strong against surface
  const hasBorderStrong = tokens.borders.some((t) => t.name === "border-strong");
  if (hasBorderStrong) {
    pairs.push({
      foreground: "border-strong",
      background: "surface",
      context: "border-strong on surface",
    });
  }

  return pairs;
}

// ─── Contrast Checking ──────────────────────────────────────

/**
 * Check contrast compliance for all token pairs in a theme.
 */
export function checkContrast(
  theme: GeneratedTheme,
  level: "aa" | "aaa" = "aa",
  mode?: "light" | "dark",
): ContrastReport {
  const targetRatio = level === "aaa" ? 7 : 4.5;
  const modes = mode ? [mode] : getModes(theme.config.mode);

  const passed: ContrastCheckResult[] = [];
  const failed: ContrastCheckResult[] = [];

  for (const m of modes) {
    const tokens = generateSemanticTokens(theme.palette, theme.config, m);
    const pairs = getTokenPairs(tokens);

    for (const pair of pairs) {
      const fgColor = resolveTokenColor(pair.foreground, tokens);
      const bgColor = resolveTokenColor(pair.background, tokens);

      if (!fgColor || !bgColor) continue;

      const ratio = getContrastRatio(fgColor, bgColor);
      const passes = ratio >= targetRatio;
      const resultLevel = ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "A" : "FAIL";

      const result: ContrastCheckResult = {
        pair: {
          ...pair,
          context: `${pair.context} (${m})`,
        },
        foregroundColor: fgColor,
        backgroundColor: bgColor,
        ratio,
        level: resultLevel,
        passes,
      };

      if (passes) {
        passed.push(result);
      } else {
        failed.push(result);
      }
    }
  }

  return { level, passed, failed, allPass: failed.length === 0 };
}

// ─── Contrast Fixing ────────────────────────────────────────

/**
 * Adjust a foreground color's OKLCH lightness to meet a target contrast ratio
 * against a background. Preserves chroma and hue.
 * Returns null if even L=0 or L=1 can't meet the target.
 */
export function adjustLightnessForContrast(
  foreground: Color,
  background: Color,
  targetRatio: number,
): Color | null {
  const bgL = background.oklch.l;
  const fgOklch = foreground.oklch;

  // Determine search direction: if bg is light, fg should go darker (lower L), and vice versa
  const goLighter = bgL < 0.5;

  // Check if extreme values can meet the target
  const extremeL = goLighter ? 1 : 0;
  const extremeColor = Color.fromOklch(extremeL, fgOklch.c, fgOklch.h, fgOklch.a);
  const extremeRatio = getContrastRatio(extremeColor, background);

  if (extremeRatio < targetRatio) {
    // Even the extreme can't meet target — try the other direction
    const otherExtremeL = goLighter ? 0 : 1;
    const otherColor = Color.fromOklch(otherExtremeL, fgOklch.c, fgOklch.h, fgOklch.a);
    const otherRatio = getContrastRatio(otherColor, background);
    if (otherRatio < targetRatio) {
      return null;
    }
    // Search in the other direction
    return binarySearchL(fgOklch.c, fgOklch.h, fgOklch.a, background, targetRatio, !goLighter);
  }

  return binarySearchL(fgOklch.c, fgOklch.h, fgOklch.a, background, targetRatio, goLighter);
}

function binarySearchL(
  chroma: number,
  hue: number,
  alpha: number,
  background: Color,
  targetRatio: number,
  goLighter: boolean,
): Color {
  const bgL = background.oklch.l;
  // Start from current-ish midpoint toward the extreme
  let low = goLighter ? bgL : 0;
  let high = goLighter ? 1 : bgL;

  // Binary search for the closest L value that meets the target
  for (let i = 0; i < 32; i++) {
    const mid = (low + high) / 2;
    const candidate = Color.fromOklch(mid, chroma, hue, alpha);
    const ratio = getContrastRatio(candidate, background);

    if (ratio >= targetRatio) {
      // Found a valid L — try to move closer to bg (minimize change)
      if (goLighter) {
        high = mid;
      } else {
        low = mid;
      }
    } else {
      // Not enough contrast — move away from bg
      if (goLighter) {
        low = mid;
      } else {
        high = mid;
      }
    }
  }

  // Return the value closest to bg that still meets target
  const resultL = goLighter ? high : low;
  return Color.fromOklch(resultL, chroma, hue, alpha);
}

/**
 * Fix contrast issues in a theme by adjusting foreground lightness values.
 * Returns a new theme (immutable — original unchanged).
 */
export function fixContrast(
  theme: GeneratedTheme,
  level: "aa" | "aaa" = "aa",
  mode?: "light" | "dark",
): { theme: GeneratedTheme; report: ContrastFixReport } {
  const targetRatio = level === "aaa" ? 7 : 4.5;
  const modes = mode ? [mode] : getModes(theme.config.mode);

  const fixes: ContrastFixResult[] = [];
  const unfixable: TokenPair[] = [];

  // Collect all overrides needed
  const overrides: Record<string, string> = {};

  for (const m of modes) {
    const tokens = generateSemanticTokens(theme.palette, theme.config, m);
    const pairs = getTokenPairs(tokens);

    for (const pair of pairs) {
      const fgColor = resolveTokenColor(pair.foreground, tokens);
      const bgColor = resolveTokenColor(pair.background, tokens);

      if (!fgColor || !bgColor) continue;

      const ratio = getContrastRatio(fgColor, bgColor);
      if (ratio >= targetRatio) continue;

      // Try to fix by adjusting foreground L
      const fixed = adjustLightnessForContrast(fgColor, bgColor, targetRatio);
      if (fixed === null) {
        unfixable.push(pair);
        continue;
      }

      const fixedRatio = getContrastRatio(fixed, bgColor);
      fixes.push({
        pair,
        originalRatio: ratio,
        fixedRatio,
        originalColor: fgColor,
        fixedColor: fixed,
      });

      // Apply as semantic override (hex is universally parseable by Color)
      overrides[pair.foreground] = fixed.toHex();
    }
  }

  // Build new config with overrides applied
  const newConfig = { ...theme.config };
  if (newConfig.semantics !== false && Object.keys(overrides).length > 0) {
    newConfig.semantics = {
      ...newConfig.semantics,
      overrides: {
        ...newConfig.semantics.overrides,
        ...overrides,
      },
    };
  }

  const newTheme: GeneratedTheme = {
    palette: theme.palette,
    harmony: theme.harmony,
    config: newConfig,
  };

  return {
    theme: newTheme,
    report: { level, fixes, unfixable },
  };
}

// ─── Helpers ────────────────────────────────────────────────

function getModes(themeMode: string): ("light" | "dark")[] {
  if (themeMode === "both") return ["light", "dark"];
  return [themeMode as "light" | "dark"];
}
