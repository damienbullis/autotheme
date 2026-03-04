// Types
export type {
  HSLColor,
  RGBColor,
  OKLCHColor,
  ColorInput,
  HarmonyType,
  HarmonyDefinition,
  HarmonyResult,
  PaletteVariations,
  FullPalette,
  BackgroundColors,
  SwingStrategy,
  HarmonyOptions,
} from "./core/types";
export type {
  CustomHarmonyDefinition,
  AutoThemeConfig,
  ResolvedConfig,
  PaletteConfig,
  SemanticsConfig,
  TextConfig,
  SurfacesConfig,
  BordersConfig,
  SemanticMapping,
  StatesConfig,
  ElevationConfig,
  ShadowConfig,
  RadiusConfig,
  TypographyConfig,
  SpacingConfig,
  MotionConfig,
  ShadcnConfig,
  PatternsConfig,
  PatternType,
  PatternDensity,
  EffectsConfig,
  FiltersConfig,
  FilterGrainConfig,
  FilterGlowConfig,
  FilterDuotoneConfig,
  BlendModesConfig,
  BlendMode,
  GlassConfig,
  BlobConfig,
  StackConfig,
  OutputConfig,
  ColorFormat,
  ThemeMode,
  DeepPartial,
} from "./config/types";
export type { Preset } from "./config/presets";
export type { WCAGLevel, WCAGResult } from "./core/contrast";
export type { HarmonyMeta } from "./core/harmony-meta";
export type {
  TokenPair,
  ContrastCheckResult,
  ContrastReport,
  ContrastFixResult,
  ContrastFixReport,
} from "./core/accessibility";
export type { CVDType } from "./core/cvd";

// Core exports
export * from "./core/color";
export * from "./core/contrast";
export * from "./core/parse";
export * from "./core/gamut";
export * from "./core/conversions";
export * from "./core/harmonies";
export * from "./core/harmony-meta";
export * from "./core/variations";
export * from "./core/palette";
export * from "./core/background";
export * from "./core/accessibility";
export * from "./core/cvd";

// Generator exports
export * from "./generators/css";
export * from "./generators/tailwind";
export * from "./generators/preview";
export * from "./generators/effects";
export * from "./generators/filters";
export * from "./generators/blendmodes";
export * from "./generators/glass";
export * from "./generators/blobs";
export * from "./generators/stack";

// Config exports
export * from "./config/schema";
export * from "./config/loader";
export * from "./config/types";
export * from "./config/validator";
export * from "./config/merge";
export * from "./config/presets";

// Main API
export { generateTheme } from "./core/theme";
