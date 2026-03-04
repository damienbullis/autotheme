import { Color } from "./color";
import { maxChromaAtHueAndLightness, clampToGamut } from "./gamut";
import type {
  HarmonyType,
  HarmonyResult,
  HarmonyDefinition,
  HarmonyOffsetFn,
  HarmonyOptions,
  SwingStrategy,
} from "./types";

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
    offset: (i) => (i === 0 ? 0 : i === 1 ? -30 : 30),
  },
  triadic: {
    count: 3,
    offset: (i) => i * 120,
  },
  "split-complementary": {
    count: 3,
    offset: (i) => (i === 0 ? 0 : 180 + (i === 1 ? -30 : 30)),
  },
  drift: {
    count: 4,
    offset: (i) => (i * 137.508) / 4,
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
  monochromatic: {
    count: 3,
    offset: () => 0,
    generate: (primary) => {
      const oklch = primary.oklch;
      return [
        primary,
        Color.fromOklch(oklch.l, oklch.c * 0.5, oklch.h, oklch.a),
        Color.fromOklch(oklch.l, oklch.c * 0.15, oklch.h, oklch.a),
      ];
    },
  },
  "double-split-complementary": {
    count: 5,
    offset: (i) => [0, 150, 210, 30, 330][i] ?? 0,
  },
};

/**
 * Normalize a hue value to be within 0-360 degrees
 */
export function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

/**
 * Apply swing to a harmony offset angle
 * @param offset - The raw hue offset
 * @param index - The color index (0-based)
 * @param swing - Swing multiplier (1.0 = no change)
 * @param strategy - Swing strategy
 * @returns Adjusted offset
 */
export function applySwing(
  offset: number,
  index: number,
  swing: number,
  strategy: SwingStrategy,
): number {
  if (index === 0) return offset;
  if (swing === 1.0) return offset;

  switch (strategy) {
    case "linear":
      return offset * swing;
    case "exponential":
      return offset * Math.pow(swing, index);
    case "alternating":
      return index % 2 === 0 ? offset / swing : offset * swing;
  }
}

/**
 * Generate colors from a primary color using count and offset function.
 * Uses OKLCH-native hue rotation with chroma normalization.
 * @param primary - The base color
 * @param count - Number of colors to generate
 * @param offsetFn - Function that returns hue offset for each index
 * @param options - Optional harmony options (swing, chromaBalance)
 * @returns Array of generated colors
 */
function generateColorsFromDefinition(
  primary: Color,
  count: number,
  offsetFn: HarmonyOffsetFn,
  options?: HarmonyOptions,
): Color[] {
  const primaryOklch = primary.oklch;
  const swing = options?.swing ?? 1.0;
  const strategy = options?.swingStrategy ?? "linear";
  const chromaBalance = options?.chromaBalance !== false;

  return Array.from({ length: count }, (_, i) => {
    const rawOffset = offsetFn(i);
    const offset = applySwing(rawOffset, i, swing, strategy);
    const newHue = normalizeHue(primaryOklch.h + offset);

    if (i === 0 && offset === 0) {
      return primary;
    }

    let newChroma = primaryOklch.c;

    if (chromaBalance) {
      // Normalize chroma to the maximum available at the new hue
      // This prevents out-of-gamut colors and maintains visual balance
      const primaryMaxC = maxChromaAtHueAndLightness(primaryOklch.h, primaryOklch.l);
      const targetMaxC = maxChromaAtHueAndLightness(newHue, primaryOklch.l);

      if (primaryMaxC > 0.001) {
        // Scale chroma proportionally to gamut capacity at each hue
        const chromaRatio = primaryOklch.c / primaryMaxC;
        newChroma = targetMaxC * chromaRatio;
      }
    }

    const clamped = clampToGamut({
      l: primaryOklch.l,
      c: newChroma,
      h: newHue,
      a: primaryOklch.a,
    });

    return Color.fromOklch(clamped.l, clamped.c, clamped.h, clamped.a);
  });
}

/**
 * Create a HarmonyDefinition from an array of explicit hue offsets
 * @param offsets - Array of hue offset angles (first should typically be 0)
 * @returns A HarmonyDefinition with count and offset function
 */
export function createHarmonyFromOffsets(offsets: number[]): HarmonyDefinition {
  return {
    count: offsets.length,
    offset: (i) => offsets[i] ?? 0,
  };
}

/**
 * Generate a color harmony from a primary color
 * @param primary - The base color for the harmony
 * @param type - The type of harmony to generate (built-in or custom name)
 * @param options - Optional harmony options (swing, custom definitions)
 * @returns A harmony result containing all colors
 */
export function generateHarmony(
  primary: Color,
  type: HarmonyType | string,
  options?: HarmonyOptions & { customDefinitions?: Record<string, HarmonyDefinition> },
): HarmonyResult {
  const definition = HARMONY_DEFINITIONS[type as HarmonyType] ?? options?.customDefinitions?.[type];

  if (!definition) {
    throw new Error(
      `Unknown harmony type: "${type}". Must be a built-in harmony or defined in customDefinitions.`,
    );
  }

  const colors = definition.generate
    ? definition.generate(primary, options)
    : generateColorsFromDefinition(primary, definition.count, definition.offset, options);

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
  options?: HarmonyOptions,
): Omit<HarmonyResult, "type"> & { type: "custom" } {
  const colors = generateColorsFromDefinition(primary, count, offsetFn, options);

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
