// Types
export type {
  HSLColor,
  RGBColor,
  OKLCHColor,
  ColorInput,
  HarmonyType,
  HarmonyResult,
  PaletteVariations,
  FullPalette,
  BackgroundColors,
} from "./core/types";
export type { WCAGLevel, WCAGResult } from "./core/contrast";
export type { HarmonyMeta } from "./core/harmony-meta";

// Core exports
export * from "./core/color";
export * from "./core/contrast";
export * from "./core/parse";
export * from "./core/conversions";
export * from "./core/harmonies";
export * from "./core/harmony-meta";
export * from "./core/variations";
export * from "./core/palette";
export * from "./core/background";

// Generator exports
export * from "./generators/css";
export * from "./generators/tailwind";
export * from "./generators/preview";

// Config exports
export * from "./config/schema";
export * from "./config/loader";
export * from "./config/types";
export * from "./config/validator";
export * from "./config/merge";

// Main API
export { generateTheme } from "./core/theme";
