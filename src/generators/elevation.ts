import { Color } from "../core/color";
import type { SemanticToken } from "./semantic";

/**
 * Generate elevation tokens: surface, shadow, and border for each level.
 *
 * Higher levels = lighter surfaces, deeper shadows, and varying border opacity.
 */
export function generateElevationTokens(
  baseSurface: Color,
  primaryHue: number,
  levels: number,
  isDark: boolean,
): SemanticToken[] {
  const tokens: SemanticToken[] = [];

  for (let i = 1; i <= levels; i++) {
    // Surface: progressively lighter
    const lightenAmount = isDark ? i * 2.5 : i * 1.5;
    const surfaceColor = baseSurface.lighten(lightenAmount);
    tokens.push({ name: `elevation-${i}-surface`, value: surfaceColor });

    // Shadow: deeper at higher levels
    const yOffset = i * 2;
    const blur = i * 4;
    const shadowAlpha = isDark ? 30 + i * 10 : 5 + i * 5;
    const shadowL = isDark ? 0 : 20;
    const shadowColor = new Color({ h: primaryHue, s: 5, l: shadowL, a: 1 });
    const shadowOklch = shadowColor.oklch;
    const shadowValue = `0 ${yOffset}px ${blur}px oklch(${shadowOklch.l.toFixed(3)} ${shadowOklch.c.toFixed(3)} ${shadowOklch.h.toFixed(3)} / ${shadowAlpha}%)`;
    tokens.push({
      name: `elevation-${i}-shadow`,
      value: shadowColor,
      rawCSS: shadowValue,
    });

    // Border: alpha varies by level and mode
    const borderAlpha = isDark
      ? Math.min(100, 5 + i * 5) // increasing in dark mode
      : Math.max(2, 20 - i * 4); // decreasing in light mode
    const borderColor = new Color({
      h: primaryHue,
      s: 5,
      l: isDark ? 50 : 70,
      a: borderAlpha / 100,
    });
    tokens.push({ name: `elevation-${i}-border`, value: borderColor });
  }

  return tokens;
}
