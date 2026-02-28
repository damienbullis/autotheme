import { Color } from "./color";
import type { BackgroundColors } from "./types";

/**
 * Generate light/dark mode background colors derived from a primary color
 * @param primary - The primary color to derive backgrounds from
 * @returns Light and dark background colors
 */
export function generateBackgroundColors(primary: Color): BackgroundColors {
  const hsl = primary.hsl;

  // Light mode: very light, slightly tinted toward primary hue
  const light = new Color({
    h: hsl.h,
    s: Math.min(20, hsl.s * 0.3),
    l: 96,
    a: 1,
  });

  // Dark mode: very dark, slightly tinted toward primary hue
  const dark = new Color({
    h: hsl.h,
    s: Math.min(30, hsl.s * 0.4),
    l: 5,
    a: 1,
  });

  return { light, dark };
}
