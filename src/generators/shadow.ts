import { Color } from "../core/color";
import type { ColorFormat } from "../config/types";

export interface ShadowScaleResult {
  name: string;
  value: string;
}

/**
 * Generate a shadow scale with primary hue tinting.
 * Each step has increasing blur/offset with alpha that varies by light/dark mode.
 */
export function generateShadowScale(
  steps: number,
  base: number,
  ratio: number,
  primaryHue: number,
  colorTint: number,
  isDark: boolean,
  colorFormat: ColorFormat,
): ShadowScaleResult[] {
  const results: ShadowScaleResult[] = [];

  for (let i = 1; i <= steps; i++) {
    const blur = base * Math.pow(ratio, i - 1);
    const yOffset = Math.max(1, Math.round(blur * 0.5));
    const alpha = isDark
      ? Math.min(80, 20 + i * 12)
      : Math.min(40, 5 + i * 7);

    const shadowL = isDark ? 0 : 20;
    const shadowColor = new Color({ h: primaryHue, s: colorTint, l: shadowL, a: alpha / 100 });

    results.push({
      name: `shadow-${i}`,
      value: `0 ${yOffset}px ${Math.round(blur)}px 0px ${shadowColor.formatAs(colorFormat)}`,
    });
  }

  return results;
}
