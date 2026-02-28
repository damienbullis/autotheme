import { Color } from "./color";
import type { HarmonyType, HarmonyResult, HarmonyDefinition, HarmonyOffsetFn } from "./types";

/**
 * Harmony definitions using count and offset functions
 * Each harmony is defined by the number of colors and a function
 * that computes the hue offset for each index
 */
export const HARMONY_DEFINITIONS: Record<HarmonyType, HarmonyDefinition> = {
  complementary: {
    count: 2,
    offset: (i) => i * 180,
  },
  analogous: {
    count: 3,
    offset: (i) => (i - 1) * 30,
  },
  triadic: {
    count: 3,
    offset: (i) => i * 120,
  },
  "split-complementary": {
    count: 3,
    offset: (i) => (i === 0 ? 0 : 180 + (i === 1 ? -30 : 30)),
  },
  tetradic: {
    count: 4,
    offset: (i) => ((i * Math.PI) / 6) * 90,
    // offset: (i) => ((i < 2) ? i : -1*i) * 87.5,
  },
  square: {
    count: 4,
    offset: (i) => i * 90,
  },
  rectangle: {
    count: 4,
    offset: (i) => (i % 2) * 60 + Math.floor(i / 2) * 180,
  },
  aurelian: {
    count: 3,
    offset: (i) => i * 137.5, // Golden angle
  },
  "bi-polar": {
    count: 2,
    offset: (i) => i * 90,
  },
  retrograde: {
    count: 3,
    offset: (i) => (i === 0 ? 0 : i === 1 ? -120 : 120),
  },
};

/**
 * Normalize a hue value to be within 0-360 degrees
 */
export function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

/**
 * Generate colors from a primary color using count and offset function
 * @param primary - The base color
 * @param count - Number of colors to generate
 * @param offsetFn - Function that returns hue offset for each index
 * @returns Array of generated colors
 */
function generateColorsFromDefinition(
  primary: Color,
  count: number,
  offsetFn: HarmonyOffsetFn,
): Color[] {
  const primaryHsl = primary.hsl;

  return Array.from({ length: count }, (_, i) => {
    const offset = offsetFn(i);
    const newHue = normalizeHue(primaryHsl.h + offset);
    return new Color({
      h: newHue,
      s: primaryHsl.s,
      l: primaryHsl.l,
      a: primaryHsl.a,
    });
  });
}

/**
 * Generate a color harmony from a primary color
 * @param primary - The base color for the harmony
 * @param type - The type of harmony to generate
 * @returns A harmony result containing all colors
 */
export function generateHarmony(primary: Color, type: HarmonyType): HarmonyResult {
  const definition = HARMONY_DEFINITIONS[type];
  const colors = generateColorsFromDefinition(primary, definition.count, definition.offset);

  return {
    type,
    primary,
    colors,
  };
}

/**
 * Generate a custom color harmony using a user-defined offset function
 * @param primary - The base color for the harmony
 * @param count - Number of colors to generate
 * @param offsetFn - Function that computes hue offset for each index (0 to count-1)
 * @returns A harmony result containing all colors (type will be "custom")
 */
export function generateCustomHarmony(
  primary: Color,
  count: number,
  offsetFn: HarmonyOffsetFn,
): Omit<HarmonyResult, "type"> & { type: "custom" } {
  const colors = generateColorsFromDefinition(primary, count, offsetFn);

  return {
    type: "custom",
    primary,
    colors,
  };
}

/**
 * Get all available harmony types
 */
export function getHarmonyTypes(): HarmonyType[] {
  return Object.keys(HARMONY_DEFINITIONS) as HarmonyType[];
}
