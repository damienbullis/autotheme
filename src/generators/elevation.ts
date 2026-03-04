import { Color } from "../core/color";
import type { SemanticToken } from "./semantic";
import type { ElevationConfig, ColorFormat } from "../config/types";

/** Sentinel color for rawCSS-only tokens. */
const SENTINEL = Color.fromOklch(0, 0, 0);

/**
 * Generate elevation tokens: surface + shadow per level.
 *
 * v2 changes from v1:
 * - 2 tokens per level (no border tokens)
 * - Token naming: `elevation-N` (surface) + `elevation-N-shadow`
 * - OKLCH-native surface generation
 * - Light mode uses card model (near-white surfaces, shadows create depth)
 * - Multi-layer shadows (1→3 layers scaling with level)
 * - Shadow color uses primary hue at low chroma when tintShadows is true
 */
export function generateElevationTokens(
  config: ElevationConfig,
  depth: number,
  primaryHue: number,
  surfaceChroma: number,
  isDark: boolean,
  colorFormat: ColorFormat = "oklch",
): SemanticToken[] {
  const tokens: SemanticToken[] = [];

  for (let i = 1; i <= config.levels; i++) {
    // Surface
    let surfaceL: number;
    if (isDark) {
      // Dark mode: surfaces progressively lighter from depth
      surfaceL = clamp01(depth + config.delta * i);
    } else {
      // Light mode (card model): all elevation surfaces are near-white
      // Slight differentiation: higher levels very slightly brighter
      surfaceL = clamp01(0.99 - 0.002 * (config.levels - i));
    }
    const surface = Color.fromOklch(surfaceL, surfaceChroma, primaryHue);
    tokens.push({ name: `elevation-${i}`, value: surface });

    // Shadow
    const shadowCSS = buildMultiLayerShadow(i, primaryHue, config.tintShadows, isDark, colorFormat);
    tokens.push({ name: `elevation-${i}-shadow`, value: SENTINEL, rawCSS: shadowCSS });
  }

  return tokens;
}

/**
 * Build a multi-layer box-shadow string.
 *
 * Layer count scales with level: level 1 = 1 layer, level 2 = 2 layers, level 3+ = 3 layers.
 * Each layer has increasing blur and y-offset for realistic depth.
 */
export function buildMultiLayerShadow(
  level: number,
  primaryHue: number,
  tintShadows: boolean,
  isDark: boolean,
  colorFormat: ColorFormat,
): string {
  const layerCount = Math.min(level, 3);
  const layers: string[] = [];

  for (let layer = 0; layer < layerCount; layer++) {
    // Progressive offset and blur per layer
    const yOffset = (layer + 1) * level * 2;
    const blur = (layer + 1) * level * 4;

    // Alpha: dark mode has higher base alpha, each layer adds alpha
    const baseAlpha = isDark ? 0.25 : 0.07;
    const layerAlpha = baseAlpha + level * 0.05 + layer * 0.03;
    const alpha = Math.min(isDark ? 0.8 : 0.35, layerAlpha);

    // Shadow color: tinted uses primary hue at very low chroma, otherwise achromatic
    const chroma = tintShadows ? 0.01 : 0;
    const L = isDark ? 0 : 0.15;

    const shadowColor = Color.fromOklch(L, chroma, primaryHue, alpha);
    const colorStr = shadowColor.formatAs(colorFormat);

    layers.push(`0 ${yOffset}px ${blur}px ${colorStr}`);
  }

  return layers.join(", ");
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}
