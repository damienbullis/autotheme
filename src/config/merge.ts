import type { AutoThemeConfig } from "./types";
import { DEFAULT_CONFIG } from "./types";
import type { CLIArgs } from "../cli/parser";
import { loadConfig } from "./loader";
import { getPreset } from "./presets";
import { Color } from "../core/color";

/**
 * Generate a random vibrant color
 */
export function generateRandomColor(): Color {
  const h = Math.floor(Math.random() * 360);
  const s = 70 + Math.floor(Math.random() * 30);
  const l = 45 + Math.floor(Math.random() * 20);

  return new Color({ h, s, l, a: 1 });
}

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep merge two objects recursively.
 * When both sides have a nested object (non-array), recurse. Arrays are replaced, not merged.
 */
function deepMerge(target: AutoThemeConfig, source: DeepPartial<AutoThemeConfig>): AutoThemeConfig {
  return deepMergeObjects(
    target as unknown as Record<string, unknown>,
    source as unknown as Record<string, unknown>,
  ) as unknown as AutoThemeConfig;
}

function deepMergeObjects(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const val = source[key];
    if (val === undefined) continue;
    const current = result[key];
    if (
      typeof val === "object" &&
      val !== null &&
      !Array.isArray(val) &&
      typeof current === "object" &&
      current !== null &&
      !Array.isArray(current)
    ) {
      result[key] = deepMergeObjects(
        current as Record<string, unknown>,
        val as Record<string, unknown>,
      );
    } else {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Map flat CLI args to nested config structure
 */
function cliArgsToConfig(args: CLIArgs): DeepPartial<AutoThemeConfig> {
  const config: DeepPartial<AutoThemeConfig> = {};

  if (args.color) config.color = args.color;
  if (args.harmony) config.harmony = args.harmony as AutoThemeConfig["harmony"];
  if (args.colorFormat) config.colorFormat = args.colorFormat as AutoThemeConfig["colorFormat"];
  if (args.mode) config.mode = args.mode as AutoThemeConfig["mode"];
  if (args.swing !== undefined) config.swing = args.swing;
  if (args.swingStrategy)
    config.swingStrategy = args.swingStrategy as AutoThemeConfig["swingStrategy"];

  // Palette
  if (args.prefix) {
    config.palette = { ...config.palette, prefix: args.prefix };
  }

  // Typography
  if (args.fontSize !== undefined) {
    config.typography = { ...config.typography, base: args.fontSize };
  }

  // Spacing
  if (args.spacing !== undefined) {
    config.spacing = { ...config.spacing, enabled: args.spacing };
  }

  // Feature toggles
  if (args.gradients !== undefined) config.gradients = args.gradients;
  if (args.noise !== undefined) config.noise = args.noise;
  if (args.utilities !== undefined) config.utilities = args.utilities;

  // Alpha variants
  if (args.alphaVariants !== undefined) {
    config.palette = { ...config.palette, alphaVariants: args.alphaVariants };
  }

  // Semantics
  if (args.semantics !== undefined) {
    config.semantics = { ...config.semantics, enabled: args.semantics };
  }

  // States
  if (args.states !== undefined) {
    config.semantics = { ...config.semantics, states: { enabled: args.states } };
  }

  // Elevation
  if (args.elevation !== undefined) {
    config.semantics = { ...config.semantics, elevation: { enabled: args.elevation } };
  }

  // Shadows
  if (args.shadows !== undefined) {
    config.shadows = { ...config.shadows, enabled: args.shadows };
  }

  // Radius
  if (args.radius !== undefined) {
    config.radius = { ...config.radius, enabled: args.radius };
  }

  // Shadcn
  if (args.shadcn !== undefined) {
    config.shadcn = { ...config.shadcn, enabled: args.shadcn };
  }

  // Output
  if (
    args.output ||
    args.tailwind !== undefined ||
    args.preview !== undefined ||
    args.darkModeScript !== undefined ||
    args.comments !== undefined ||
    args.layers !== undefined
  ) {
    config.output = { ...config.output };
    if (args.output) config.output.path = args.output;
    if (args.tailwind !== undefined) config.output.tailwind = args.tailwind;
    if (args.preview !== undefined) config.output.preview = args.preview;
    if (args.darkModeScript !== undefined) config.output.darkModeScript = args.darkModeScript;
    if (args.comments !== undefined) config.output.comments = args.comments;
    if (args.layers !== undefined) config.output.layers = args.layers;
  }

  // CLI-only
  if (args.preset) config.preset = args.preset;
  if (args.silent !== undefined) config.silent = args.silent;
  if (args.config) config.config = args.config;

  return config;
}

export async function resolveConfig(cliArgs: CLIArgs): Promise<AutoThemeConfig> {
  // Load config file
  const fileConfig = await loadConfig(cliArgs.config);

  // Resolve preset: CLI --preset takes priority, then config file preset
  const presetName =
    cliArgs.preset ?? ((fileConfig as Record<string, unknown>).preset as string | undefined);
  let presetConfig: DeepPartial<AutoThemeConfig> = {};
  if (presetName) {
    const preset = getPreset(presetName);
    presetConfig = preset.config;
  }

  // Map CLI args to nested config
  const cliConfig = cliArgsToConfig(cliArgs);

  // Merge: defaults < preset < file config < CLI args
  let merged = deepMerge(DEFAULT_CONFIG, presetConfig);
  merged = deepMerge(merged, fileConfig as DeepPartial<AutoThemeConfig>);
  merged = deepMerge(merged, cliConfig);

  // Strip preset from final config (it's been resolved)
  delete merged.preset;

  // Auto-enable semantics when shadcn is enabled (shadcn maps from semantic tokens)
  if (merged.shadcn.enabled && !merged.semantics.enabled) {
    merged.semantics.enabled = true;
  }

  // Generate random color if not provided
  if (!merged.color) {
    merged.color = generateRandomColor().toHex();
  }

  return merged;
}
