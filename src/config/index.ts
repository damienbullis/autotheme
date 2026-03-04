export {
  type AutoThemeConfig,
  type ResolvedConfig,
  type CustomHarmonyDefinition,
  type DeepPartial,
  DEFAULT_PALETTE,
  DEFAULT_SEMANTICS,
  DEFAULT_OUTPUT,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_SPACING,
  DEFAULT_SHADOWS,
  DEFAULT_RADIUS,
  DEFAULT_MOTION,
  DEFAULT_STATES,
  DEFAULT_ELEVATION,
  DEFAULT_SHADCN,
} from "./types";
export { CONFIG_SCHEMA, generateSchemaFile } from "./schema";
export { loadConfig, isUrl } from "./loader";
export { validateConfig } from "./validator";
export { resolveConfig, resolveToConfig, resolveFeature, generateRandomColor } from "./merge";
export { PRESETS, getPreset, getPresetNames, type Preset } from "./presets";
