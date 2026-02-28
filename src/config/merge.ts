import type { AutoThemeConfig } from "./types";
import { DEFAULT_CONFIG } from "./types";
import type { CLIArgs } from "../cli/parser";
import { loadConfig } from "./loader";
import { Color } from "../core/color";

/**
 * Generate a random vibrant color
 */
export function generateRandomColor(): Color {
  // Generate a random hue (0-360)
  const h = Math.floor(Math.random() * 360);
  // Use high saturation for vibrant colors (70-100)
  const s = 70 + Math.floor(Math.random() * 30);
  // Use moderate lightness for visibility (45-65)
  const l = 45 + Math.floor(Math.random() * 20);

  return new Color({ h, s, l, a: 1 });
}

export async function resolveConfig(cliArgs: CLIArgs): Promise<AutoThemeConfig> {
  // Load config file
  const fileConfig = await loadConfig(cliArgs.config);

  // Merge: defaults < file config < CLI args
  const merged: AutoThemeConfig = {
    ...DEFAULT_CONFIG,
    ...fileConfig,
    ...(cliArgs.color && { color: cliArgs.color }),
    ...(cliArgs.harmony && { harmony: cliArgs.harmony as AutoThemeConfig["harmony"] }),
    ...(cliArgs.output && { output: cliArgs.output }),
    ...(cliArgs.prefix && { prefix: cliArgs.prefix }),
    ...(cliArgs.fontSize !== undefined && { fontSize: cliArgs.fontSize }),
    ...(cliArgs.preview !== undefined && { preview: cliArgs.preview }),
    ...(cliArgs.tailwind !== undefined && { tailwind: cliArgs.tailwind }),
    ...(cliArgs.darkModeScript !== undefined && { darkModeScript: cliArgs.darkModeScript }),
    ...(cliArgs.gradients !== undefined && { gradients: cliArgs.gradients }),
    ...(cliArgs.spacing !== undefined && { spacing: cliArgs.spacing }),
    ...(cliArgs.noise !== undefined && { noise: cliArgs.noise }),
    ...(cliArgs.shadcn !== undefined && { shadcn: cliArgs.shadcn }),
    ...(cliArgs.utilities !== undefined && { utilities: cliArgs.utilities }),
    ...(cliArgs.silent !== undefined && { silent: cliArgs.silent }),
    ...(cliArgs.config && { config: cliArgs.config }),
  };

  // Generate random color if not provided
  if (!merged.color) {
    merged.color = generateRandomColor().toHex();
  }

  return merged;
}
