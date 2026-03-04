import type {
  AutoThemeConfig,
  ResolvedConfig,
  PaletteConfig,
  SemanticsConfig,
  StatesConfig,
  ElevationConfig,
  TypographyConfig,
  SpacingConfig,
  ShadowConfig,
  RadiusConfig,
  MotionConfig,
  PatternsConfig,
  EffectsConfig,
  FiltersConfig,
  BlendModesConfig,
  GlassConfig,
  BlobConfig,
  StackConfig,
  ShadcnConfig,
  OutputConfig,
  DeepPartial,
} from "./types";
import {
  DEFAULT_PALETTE,
  DEFAULT_SEMANTICS,
  DEFAULT_STATES,
  DEFAULT_ELEVATION,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_SPACING,
  DEFAULT_SHADOWS,
  DEFAULT_RADIUS,
  DEFAULT_MOTION,
  DEFAULT_PATTERNS,
  DEFAULT_FILTERS,
  DEFAULT_BLEND_MODES,
  DEFAULT_GLASS,
  DEFAULT_BLOBS,
  DEFAULT_STACK,
  DEFAULT_SHADCN,
  DEFAULT_OUTPUT,
} from "./types";
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

/**
 * Deep merge two plain objects recursively.
 * Arrays are replaced, not merged.
 */
function deepMergeObjects<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>,
): T {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const val = source[key];
    if (val === undefined) continue;
    const current = (result as Record<string, unknown>)[key];
    if (
      typeof val === "object" &&
      val !== null &&
      !Array.isArray(val) &&
      typeof current === "object" &&
      current !== null &&
      !Array.isArray(current)
    ) {
      (result as Record<string, unknown>)[key] = deepMergeObjects(
        current as Record<string, unknown>,
        val as Record<string, unknown>,
      );
    } else {
      (result as Record<string, unknown>)[key] = val;
    }
  }
  return result;
}

/**
 * Resolve a `boolean | DeepPartial<T>` feature config to `false | T`.
 * - `undefined` → enabledByDefault ? defaults : false
 * - `true` → defaults
 * - `false` → false
 * - `object` → deepMerge(defaults, object)
 */
export function resolveFeature<T extends object>(
  input: boolean | DeepPartial<T> | undefined,
  defaults: T,
  enabledByDefault: boolean,
): false | T {
  if (input === undefined) {
    return enabledByDefault ? { ...defaults } : false;
  }
  if (input === false) {
    return false;
  }
  if (input === true) {
    return { ...defaults };
  }
  return deepMergeObjects(
    { ...defaults } as Record<string, unknown>,
    input as Record<string, unknown>,
  ) as T;
}

/**
 * Map flat CLI args to user-facing AutoThemeConfig partial
 */
function cliArgsToConfig(args: CLIArgs): DeepPartial<AutoThemeConfig> {
  const config: DeepPartial<AutoThemeConfig> = {};

  if (args.color) config.color = args.color;
  if (args.harmony) config.harmony = args.harmony as AutoThemeConfig["harmony"];
  if (args.mode) config.mode = args.mode as AutoThemeConfig["mode"];

  // --format replaces --color-format
  if (args.format) {
    config.output = { ...config.output, format: args.format as OutputConfig["format"] };
  }
  // Backwards compat: also check --color-format
  if (args.colorFormat) {
    config.output = { ...config.output, format: args.colorFormat as OutputConfig["format"] };
  }

  // --palette enables full scale
  if (args.palette !== undefined) config.palette = args.palette;

  // --no-semantics disables (on by default)
  if (args.semantics !== undefined) config.semantics = args.semantics;

  // Feature toggles
  if (args.gradients !== undefined) config.gradients = args.gradients;
  if (args.noise !== undefined) config.noise = args.noise;
  if (args.utilities !== undefined) config.utilities = args.utilities;
  if (args.states !== undefined) config.states = args.states;
  if (args.elevation !== undefined) config.elevation = args.elevation;
  if (args.shadows !== undefined) config.shadows = args.shadows;
  if (args.radius !== undefined) config.radius = args.radius;
  if (args.shadcn !== undefined) config.shadcn = args.shadcn;
  if (args.patterns !== undefined) config.patterns = args.patterns;
  if (args.effects !== undefined) config.effects = args.effects;
  if (args.spacing !== undefined) config.spacing = args.spacing;
  if (args.typography !== undefined) config.typography = args.typography;

  // Output
  if (
    args.output ||
    args.tailwind !== undefined ||
    args.preview !== undefined ||
    args.comments !== undefined ||
    args.layers !== undefined
  ) {
    config.output = { ...config.output };
    if (args.output) config.output.path = args.output;
    if (args.tailwind !== undefined) config.output.tailwind = args.tailwind;
    if (args.preview !== undefined) config.output.preview = args.preview;
    if (args.comments !== undefined) config.output.comments = args.comments;
    if (args.layers !== undefined) config.output.layers = args.layers;
  }

  // Prefix maps into palette config
  if (args.prefix) {
    if (typeof config.palette === "object" && config.palette !== null) {
      (config.palette as DeepPartial<PaletteConfig>).prefix = args.prefix;
    } else if (config.palette !== false) {
      config.palette = { prefix: args.prefix };
    }
  }

  // Custom angles
  if (args.angles) {
    const parsed = args.angles
      .split(",")
      .map((s) => s.trim())
      .map(Number);
    if (parsed.length < 2 || parsed.some((n) => Number.isNaN(n))) {
      throw new Error("--angles must be at least 2 comma-separated numbers (e.g., '0,72,144')");
    }
    config.angles = parsed;
    // Auto-set harmony to "custom" if not explicitly set
    if (!args.harmony) {
      config.harmony = "custom" as AutoThemeConfig["harmony"];
    }
  }

  // CLI-only
  if (args.preset) config.preset = args.preset;
  if (args.silent !== undefined) config.silent = args.silent;
  if (args.config) config.config = args.config;

  return config;
}

/**
 * Merge user-facing configs: later layers take priority.
 * For boolean | Config fields, a boolean replaces entirely.
 */
function mergeUserConfigs(...layers: DeepPartial<AutoThemeConfig>[]): DeepPartial<AutoThemeConfig> {
  const result: Record<string, unknown> = {};
  for (const layer of layers) {
    const layerObj = layer as Record<string, unknown>;
    for (const key of Object.keys(layerObj)) {
      const val = layerObj[key];
      if (val === undefined) continue;
      const current = result[key];

      if (typeof val === "boolean" || typeof current === "boolean") {
        result[key] = val;
      } else if (
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
  }
  return result as DeepPartial<AutoThemeConfig>;
}

/**
 * Apply mode-dependent defaults to a resolved semantics config
 */
function applyModeDefaults(
  semantics: ResolvedConfig["semantics"],
  mode: ResolvedConfig["mode"],
  userSemantics: boolean | DeepPartial<SemanticsConfig> | undefined,
): void {
  if (semantics === false) return;

  const userObj = typeof userSemantics === "object" && userSemantics !== null ? userSemantics : {};

  // depth: derive from mode if not explicitly set
  if (userObj.depth === undefined) {
    semantics.depth = mode === "light" ? 0.97 : 0.13;
  }

  // text.anchor/floor: derive from mode if not set
  const userText = userObj.text ?? {};
  if (userText.anchor === undefined) {
    semantics.text.anchor = mode === "dark" ? 0.95 : 0.15;
  }
  if (userText.floor === undefined) {
    semantics.text.floor = mode === "dark" ? 0.55 : 0.55;
  }
}

/**
 * Resolve user-facing AutoThemeConfig into fully-resolved ResolvedConfig.
 */
export function resolveToConfig(merged: DeepPartial<AutoThemeConfig>): ResolvedConfig {
  const mode = (merged.mode ?? "both") as ResolvedConfig["mode"];

  // Resolve output first (needed for tailwind auto-activation)
  const outputInput = (merged.output ?? {}) as Record<string, unknown>;
  const resolvedOutput = deepMergeObjects({ ...DEFAULT_OUTPUT }, outputInput);

  // lightDark defaults to true when mode="both"
  if ((outputInput as DeepPartial<OutputConfig>).lightDark === undefined && mode === "both") {
    resolvedOutput.lightDark = true;
  }

  // Resolve features
  const semantics = resolveFeature<SemanticsConfig>(
    merged.semantics as boolean | DeepPartial<SemanticsConfig> | undefined,
    {
      ...DEFAULT_SEMANTICS,
      text: { ...DEFAULT_SEMANTICS.text },
      surfaces: { ...DEFAULT_SEMANTICS.surfaces },
      borders: { ...DEFAULT_SEMANTICS.borders },
      mapping: { ...DEFAULT_SEMANTICS.mapping },
    },
    true,
  );

  // palette: OFF by default, auto-enabled by tailwind
  let paletteInput = merged.palette as boolean | DeepPartial<PaletteConfig> | undefined;
  if (paletteInput === undefined && resolvedOutput.tailwind) {
    paletteInput = true;
  }
  const palette = resolveFeature<PaletteConfig>(
    paletteInput,
    { ...DEFAULT_PALETTE, alphaSteps: { ...DEFAULT_PALETTE.alphaSteps } },
    false,
  );

  const states = resolveFeature<StatesConfig>(
    merged.states as boolean | DeepPartial<StatesConfig> | undefined,
    {
      ...DEFAULT_STATES,
      focus: { ...DEFAULT_STATES.focus },
      disabled: { ...DEFAULT_STATES.disabled },
    },
    false,
  );
  const elevation = resolveFeature<ElevationConfig>(
    merged.elevation as boolean | DeepPartial<ElevationConfig> | undefined,
    { ...DEFAULT_ELEVATION },
    false,
  );
  const typography = resolveFeature<TypographyConfig>(
    merged.typography as boolean | DeepPartial<TypographyConfig> | undefined,
    { ...DEFAULT_TYPOGRAPHY, fluidRange: [...DEFAULT_TYPOGRAPHY.fluidRange] },
    false,
  );
  const spacing = resolveFeature<SpacingConfig>(
    merged.spacing as boolean | DeepPartial<SpacingConfig> | undefined,
    { ...DEFAULT_SPACING, fluidRange: [...DEFAULT_SPACING.fluidRange] },
    false,
  );
  const shadows = resolveFeature<ShadowConfig>(
    merged.shadows as boolean | DeepPartial<ShadowConfig> | undefined,
    { ...DEFAULT_SHADOWS },
    false,
  );
  const radius = resolveFeature<RadiusConfig>(
    merged.radius as boolean | DeepPartial<RadiusConfig> | undefined,
    { ...DEFAULT_RADIUS },
    false,
  );
  const motion = resolveFeature<MotionConfig>(
    merged.motion as boolean | DeepPartial<MotionConfig> | undefined,
    {
      ...DEFAULT_MOTION,
      spring: { ...DEFAULT_MOTION.spring },
      durations: { ...DEFAULT_MOTION.durations },
    },
    false,
  );
  const patterns = resolveFeature<PatternsConfig>(
    merged.patterns as boolean | DeepPartial<PatternsConfig> | undefined,
    { ...DEFAULT_PATTERNS, types: [...DEFAULT_PATTERNS.types] },
    false,
  );
  const shadcn = resolveFeature<ShadcnConfig>(
    merged.shadcn as boolean | DeepPartial<ShadcnConfig> | undefined,
    { ...DEFAULT_SHADCN },
    false,
  );

  // Effects: two-level resolution — outer feature then each sub-feature
  let effects: false | EffectsConfig = false;
  const effectsInput = merged.effects as boolean | DeepPartial<EffectsConfig> | undefined;
  if (effectsInput !== undefined && effectsInput !== false) {
    const effectsObj = effectsInput === true ? {} : effectsInput;

    const filters = resolveFeature<FiltersConfig>(
      effectsObj.filters as boolean | DeepPartial<FiltersConfig> | undefined,
      {
        ...DEFAULT_FILTERS,
        grain: { ...(DEFAULT_FILTERS.grain as object) } as FiltersConfig["grain"],
        glow: { ...(DEFAULT_FILTERS.glow as object) } as FiltersConfig["glow"],
        duotone: { ...(DEFAULT_FILTERS.duotone as object) } as FiltersConfig["duotone"],
      },
      true,
    );
    const blendModes = resolveFeature<BlendModesConfig>(
      effectsObj.blendModes as boolean | DeepPartial<BlendModesConfig> | undefined,
      { ...DEFAULT_BLEND_MODES, modes: [...DEFAULT_BLEND_MODES.modes] },
      true,
    );
    const glass = resolveFeature<GlassConfig>(
      effectsObj.glass as boolean | DeepPartial<GlassConfig> | undefined,
      { ...DEFAULT_GLASS, colors: [...DEFAULT_GLASS.colors] },
      true,
    );
    const blobs = resolveFeature<BlobConfig>(
      effectsObj.blobs as boolean | DeepPartial<BlobConfig> | undefined,
      { ...DEFAULT_BLOBS },
      true,
    );

    // Stack auto-enables when any other effect is on, unless explicitly false
    const hasAnyPrimitive =
      filters !== false || blendModes !== false || glass !== false || blobs !== false;
    const stackDefault = hasAnyPrimitive;
    const stack = resolveFeature<StackConfig>(
      effectsObj.stack as boolean | DeepPartial<StackConfig> | undefined,
      { ...DEFAULT_STACK },
      stackDefault,
    );

    effects = { filters, blendModes, glass, blobs, stack };
  }

  // Auto-enable semantics when shadcn is enabled
  let resolvedSemantics = semantics;
  if (shadcn !== false && resolvedSemantics === false) {
    resolvedSemantics = {
      ...DEFAULT_SEMANTICS,
      text: { ...DEFAULT_SEMANTICS.text },
      surfaces: { ...DEFAULT_SEMANTICS.surfaces },
      borders: { ...DEFAULT_SEMANTICS.borders },
      mapping: { ...DEFAULT_SEMANTICS.mapping },
    };
  }

  // Apply mode-dependent defaults to semantics
  applyModeDefaults(
    resolvedSemantics,
    mode,
    merged.semantics as boolean | DeepPartial<SemanticsConfig> | undefined,
  );

  const resolved: ResolvedConfig = {
    color: merged.color ?? "",
    harmony: (merged.harmony ?? "analogous") as ResolvedConfig["harmony"],
    mode,
    palette,
    semantics: resolvedSemantics,
    states,
    elevation,
    typography,
    spacing,
    shadows,
    radius,
    motion,
    gradients: merged.gradients ?? false,
    noise: merged.noise ?? false,
    utilities: merged.utilities ?? false,
    patterns,
    effects,
    shadcn,
    output: resolvedOutput,
    ...(merged.harmonies !== undefined ? { harmonies: merged.harmonies } : {}),
    ...(merged.angles !== undefined ? { angles: merged.angles } : {}),
    ...(merged.silent !== undefined ? { silent: merged.silent } : {}),
  };

  // Generate random color if not provided
  if (!resolved.color) {
    resolved.color = generateRandomColor().toHex();
  }

  return resolved;
}

/**
 * Full resolution pipeline: CLI args + file config + preset → ResolvedConfig
 */
export async function resolveConfig(cliArgs: CLIArgs): Promise<ResolvedConfig> {
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

  // Merge: preset < file config < CLI args
  const merged = mergeUserConfigs(
    presetConfig,
    fileConfig as DeepPartial<AutoThemeConfig>,
    cliConfig,
  );

  // Strip preset from final config (it's been resolved)
  delete merged.preset;

  return resolveToConfig(merged);
}
