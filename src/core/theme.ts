import type { AutoThemeConfig } from "../config/types";
import type { GeneratedTheme } from "../generators/types";
import type { HarmonyDefinition } from "./types";
import { Color } from "./color";
import { generateFullPalette } from "./palette";
import { createHarmonyFromOffsets } from "./harmonies";

/**
 * Generate a complete theme from a resolved configuration
 */
export function generateTheme(config: AutoThemeConfig): GeneratedTheme {
  const color = new Color(config.color);

  // Convert config custom harmonies to HarmonyDefinition objects
  let customDefinitions: Record<string, HarmonyDefinition> | undefined;
  if (config.harmonies) {
    customDefinitions = {};
    for (const [name, def] of Object.entries(config.harmonies)) {
      customDefinitions[name] = createHarmonyFromOffsets(def.offsets);
    }
  }

  const palette = generateFullPalette(color, config.harmony, {
    swing: config.swing,
    swingStrategy: config.swingStrategy,
    ...(customDefinitions && { customDefinitions }),
    variations: {
      tints: config.palette.tints,
      shades: config.palette.shades,
      tones: config.palette.tones,
      tintIncrement: config.palette.tintIncrement,
      shadeIncrement: config.palette.shadeIncrement,
      toneIncrement: config.palette.toneIncrement,
    },
  });
  return { palette, config };
}
