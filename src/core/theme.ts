import type { AutoThemeConfig } from "../config/types";
import type { GeneratedTheme } from "../generators/types";
import { Color } from "./color";
import { generateFullPalette } from "./palette";

/**
 * Generate a complete theme from a resolved configuration
 */
export function generateTheme(config: AutoThemeConfig): GeneratedTheme {
  const color = new Color(config.color);
  const palette = generateFullPalette(color, config.harmony);
  return { palette, config };
}
