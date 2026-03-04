import type { BlendModesConfig } from "../config/types";

/**
 * Generate blend mode CSS variables in :root
 */
export function generateBlendModeVars(config: BlendModesConfig, comments: boolean): string {
  const lines: string[] = [];

  if (comments) lines.push("    /* Blend Modes */");

  for (const mode of config.modes) {
    lines.push(`    --blend-${mode}: ${mode};`);
  }

  return lines.join("\n");
}

/**
 * Generate blend mode utility classes
 */
export function generateBlendModeUtilities(config: BlendModesConfig, comments: boolean): string {
  const lines: string[] = [];

  if (comments) lines.push("/* Blend Mode Utilities */");

  for (const mode of config.modes) {
    lines.push(`.blend-${mode} { mix-blend-mode: ${mode}; }`);
    lines.push(`.bg-blend-${mode} { background-blend-mode: ${mode}; }`);
  }

  return lines.join("\n");
}
