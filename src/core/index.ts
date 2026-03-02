// Types
export type {
  HSLColor,
  RGBColor,
  ColorInput,
  HarmonyType,
  HarmonyResult,
  HarmonyDefinition,
  HarmonyOffsetFn,
  PaletteVariations,
  FullPalette,
  BackgroundColors,
} from "./types";

// Color class
export { Color } from "./color";

// Parsing
export { parseColor, parseToOklch, isRGBColor, isHSLColor, isOKLCHColor } from "./parse";

// Conversions
export { hexToRgb, rgbToHsl, hslToRgb, rgbToHex, hexToHsl, hslToHex } from "./conversions";

// Contrast and accessibility
export {
  getLuminance,
  getContrastRatio,
  checkWCAG,
  findAccessibleTextColor,
  getBestContrastColor,
  apcaContrast,
  apcaLuminance,
} from "./contrast";
export type { WCAGLevel, WCAGResult } from "./contrast";

// Harmonies
export {
  generateHarmony,
  generateCustomHarmony,
  normalizeHue,
  getHarmonyTypes,
  HARMONY_DEFINITIONS,
} from "./harmonies";

// Harmony metadata
export { HARMONY_META, getHarmonyMeta, getAllHarmonyMeta } from "./harmony-meta";
export type { HarmonyMeta } from "./harmony-meta";

// Variations (tints, shades, tones)
export {
  generateTints,
  generateShades,
  generateTones,
  generatePaletteVariations,
} from "./variations";

// Palette generation
export { generateFullPalette, getTextColorKey } from "./palette";

// Background colors
export { generateBackgroundColors } from "./background";

// Gamut utilities
export {
  clampToGamut,
  maxChromaAtHueAndLightness,
  isInGamut,
  oklchToRgb,
  oklchToHsl,
} from "./gamut";
