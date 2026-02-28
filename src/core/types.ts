import type { Color } from "./color";

/** Internal HSL representation */
export interface HSLColor {
  h: number; // Hue: 0-360
  s: number; // Saturation: 0-100
  l: number; // Lightness: 0-100
  a: number; // Alpha: 0-1
}

/** RGB representation */
export interface RGBColor {
  r: number; // Red: 0-255
  g: number; // Green: 0-255
  b: number; // Blue: 0-255
  a: number; // Alpha: 0-1
}

/** OKLCH representation (perceptually uniform) */
export interface OKLCHColor {
  l: number; // Lightness: 0-1
  c: number; // Chroma: 0-0.4+ (typically)
  h: number; // Hue: 0-360
  a: number; // Alpha: 0-1
}

/** Color input types */
export type ColorInput = string | HSLColor | RGBColor;

/** Harmony types available for palette generation */
export type HarmonyType =
  | "complementary"
  | "analogous"
  | "triadic"
  | "split-complementary"
  | "piroku"
  | "square"
  | "rectangle"
  | "aurelian"
  | "bi-polar"
  | "retrograde";

/** Function that computes hue offset for a given index */
export type HarmonyOffsetFn = (index: number) => number;

/** Definition of a harmony using count and offset function */
export interface HarmonyDefinition {
  count: number;
  offset: HarmonyOffsetFn;
}

/** Result of generating a color harmony */
export interface HarmonyResult {
  type: HarmonyType;
  primary: Color;
  colors: Color[];
}

/** Variations of a single color (tints, shades, tones) */
export interface PaletteVariations {
  base: Color;
  tints: Color[]; // L1-L5 (lighter)
  shades: Color[]; // D1-D5 (darker)
  tones: Color[]; // G1-G4 (desaturated)
}

/** Complete palette with harmony colors and accessible text */
export interface FullPalette {
  harmony: HarmonyResult;
  palettes: PaletteVariations[];
  textColors: Map<string, Color>; // Accessible text for each color
}

/** Light/dark background colors derived from primary */
export interface BackgroundColors {
  light: Color;
  dark: Color;
}
