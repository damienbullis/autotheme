import { Color } from "../../src/core/color";
import { generateFullPalette } from "../../src/core/palette";
import type { GeneratedTheme } from "../../src/generators/types";
import type { AutoThemeConfig } from "../../src/config/types";
import type { HarmonyType } from "../../src/core/types";

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Create a test theme with sensible defaults and optional overrides.
 * Uses nested config shape matching AutoThemeConfig.
 */
export function createTestTheme(
  overrides: DeepPartial<AutoThemeConfig> & { harmony?: HarmonyType | string; color?: string } = {},
): GeneratedTheme {
  const color = overrides.color || "#6439FF";
  const harmony = (overrides.harmony || "analogous") as HarmonyType;
  const primaryColor = new Color(color);
  const palette = generateFullPalette(primaryColor, harmony);

  const config: AutoThemeConfig = {
    color,
    harmony,
    mode: overrides.mode ?? "both",
    swing: overrides.swing ?? 1,
    swingStrategy: overrides.swingStrategy ?? "linear",
    palette: {
      prefix: overrides.palette?.prefix ?? "color",
      contrastTarget: overrides.palette?.contrastTarget ?? 7,
      tints: overrides.palette?.tints ?? 5,
      shades: overrides.palette?.shades ?? 5,
      tones: overrides.palette?.tones ?? 4,
      tintIncrement: overrides.palette?.tintIncrement ?? 10,
      shadeIncrement: overrides.palette?.shadeIncrement ?? 10,
      toneIncrement: overrides.palette?.toneIncrement ?? 20,
    },
    typography: {
      enabled: overrides.typography?.enabled ?? true,
      base: overrides.typography?.base ?? 1,
      ratio: overrides.typography?.ratio ?? 1.25,
      steps: overrides.typography?.steps ?? 7,
      ...(overrides.typography?.names && { names: overrides.typography.names }),
      ...(overrides.typography?.values && { values: overrides.typography.values }),
    },
    spacing: {
      enabled: overrides.spacing?.enabled ?? false,
      base: overrides.spacing?.base ?? 0.25,
      ratio: overrides.spacing?.ratio ?? 2,
      steps: overrides.spacing?.steps ?? 10,
      ...(overrides.spacing?.values && { values: overrides.spacing.values }),
    },
    gradients: overrides.gradients ?? false,
    noise: overrides.noise ?? false,
    utilities: overrides.utilities ?? false,
    semantics: {
      enabled: overrides.semantics?.enabled ?? false,
      surfaceDepth: overrides.semantics?.surfaceDepth ?? 4,
      textLevels: overrides.semantics?.textLevels ?? 3,
      mapping: {
        accent: overrides.semantics?.mapping?.accent ?? "primary",
        accentSecondary: overrides.semantics?.mapping?.accentSecondary ?? "secondary",
      },
      ...(overrides.semantics?.overrides && { overrides: overrides.semantics.overrides }),
    },
    shadcn: {
      enabled: overrides.shadcn?.enabled ?? false,
      radius: overrides.shadcn?.radius ?? "0.625rem",
    },
    output: {
      path: overrides.output?.path ?? "./autotheme.css",
      tailwind: overrides.output?.tailwind ?? false,
      preview: overrides.output?.preview ?? false,
      darkModeScript: overrides.output?.darkModeScript ?? false,
    },
  };

  return { palette, config };
}
