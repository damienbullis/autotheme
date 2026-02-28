import { Color } from "./color";
import type { HarmonyType, FullPalette, PaletteVariations } from "./types";
import { generateHarmony } from "./harmonies";
import { generatePaletteVariations } from "./variations";
import { findAccessibleTextColor } from "./contrast";

/**
 * Generate a complete palette with harmony colors and accessible text colors
 * @param primaryColor - The base color for the palette
 * @param harmonyType - The type of harmony to generate
 * @returns Full palette with all variations and accessible text colors
 */
export function generateFullPalette(primaryColor: Color, harmonyType: HarmonyType): FullPalette {
  const harmony = generateHarmony(primaryColor, harmonyType);
  const palettes: PaletteVariations[] = [];
  const textColors = new Map<string, Color>();

  for (let colorIndex = 0; colorIndex < harmony.colors.length; colorIndex++) {
    const color = harmony.colors[colorIndex]!;
    const variations = generatePaletteVariations(color);
    palettes.push(variations);

    // Generate accessible text colors for base and all variations
    const allColors = [
      { key: "base", color: variations.base },
      ...variations.tints.map((c, i) => ({ key: `l${i + 1}`, color: c })),
      ...variations.shades.map((c, i) => ({ key: `d${i + 1}`, color: c })),
      ...variations.tones.map((c, i) => ({ key: `g${i + 1}`, color: c })),
    ];

    for (const { key, color: bgColor } of allColors) {
      const textKey = `c${colorIndex}-${key}`;
      textColors.set(textKey, findAccessibleTextColor(bgColor));
    }
  }

  return {
    harmony,
    palettes,
    textColors,
  };
}

/**
 * Get the text color key for a specific color in the palette
 * @param colorIndex - Index of the harmony color (0-based)
 * @param variation - Variation type ('base', 'l1'-'l5', 'd1'-'d5', 'g1'-'g4')
 * @returns The key used in the textColors map
 */
export function getTextColorKey(colorIndex: number, variation: string): string {
  return `c${colorIndex}-${variation}`;
}
