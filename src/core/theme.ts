import type { ResolvedConfig } from "../config/types";
import type { GeneratedTheme } from "../generators/types";
import type { HarmonyDefinition } from "./types";
import { Color } from "./color";
import { generateFullPalette } from "./palette";
import { generateHarmony, createHarmonyFromOffsets } from "./harmonies";

/**
 * Generate a complete theme from a resolved configuration.
 * When palette is disabled, generates harmony base colors only (no variations).
 * When palette is enabled, generates full 50-950 scale with tints/shades/tones.
 */
export function generateTheme(config: ResolvedConfig): GeneratedTheme {
  const color = new Color(config.color);

  // Convert config custom harmonies to HarmonyDefinition objects
  let customDefinitions: Record<string, HarmonyDefinition> | undefined;
  if (config.harmonies) {
    customDefinitions = {};
    for (const [name, def] of Object.entries(config.harmonies)) {
      customDefinitions[name] = createHarmonyFromOffsets(def.offsets);
    }
  }

  // Support --harmony custom --angles
  if (config.harmony === "custom" && config.angles) {
    customDefinitions = customDefinitions ?? {};
    customDefinitions["custom"] = createHarmonyFromOffsets(config.angles);
  }

  if (config.palette !== false) {
    // Full palette with variations
    const palette = generateFullPalette(color, config.harmony, {
      swing: config.palette.swing,
      swingStrategy: config.palette.swingStrategy,
      chromaBalance: config.palette.chromaBalance,
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
    return { palette, harmony: palette.harmony, config };
  } else {
    // Base harmony colors only — no variations
    const harmonyOptions = customDefinitions ? { customDefinitions } : {};
    const harmony = generateHarmony(color, config.harmony, harmonyOptions);

    // Create a minimal FullPalette with just base colors
    const palette = generateFullPalette(color, config.harmony, {
      ...(customDefinitions && { customDefinitions }),
      variations: {
        tints: 0,
        shades: 0,
        tones: 0,
      },
    });
    return { palette, harmony, config };
  }
}
