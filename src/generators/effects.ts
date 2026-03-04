import type { EffectsConfig } from "../config/types";
import type { FullPalette } from "../core/types";
import { generateFiltersCSS } from "./filters";
import { generateBlendModeVars, generateBlendModeUtilities } from "./blendmodes";
import { generateGlassUtilities } from "./glass";
import { generateBlobsCSS } from "./blobs";
import { generateStackVars, generateStackUtilities } from "./stack";

/**
 * Generate all effects CSS variables (inside :root)
 */
export function generateEffectsVars(
  config: EffectsConfig,
  palette: FullPalette,
  prefix: string,
  comments: boolean,
): string {
  const sections: string[] = [];

  if (config.filters !== false) {
    sections.push(generateFiltersCSS(config.filters, palette, prefix, comments));
  }

  if (config.blendModes !== false) {
    sections.push(generateBlendModeVars(config.blendModes, comments));
  }

  if (config.blobs !== false) {
    sections.push(generateBlobsCSS(config.blobs, comments));
  }

  if (config.stack !== false) {
    sections.push(generateStackVars(config.stack, comments));
  }

  return sections.filter(Boolean).join("\n\n");
}

/**
 * Generate all effects utility classes
 */
export function generateEffectsUtilities(
  config: EffectsConfig,
  palette: FullPalette,
  prefix: string,
  comments: boolean,
): string {
  const sections: string[] = [];

  if (config.blendModes !== false) {
    sections.push(generateBlendModeUtilities(config.blendModes, comments));
  }

  if (config.glass !== false) {
    sections.push(generateGlassUtilities(config.glass, palette, comments));
  }

  if (config.stack !== false) {
    sections.push(generateStackUtilities(config, palette, prefix, comments));
  }

  return sections.filter(Boolean).join("\n\n");
}
