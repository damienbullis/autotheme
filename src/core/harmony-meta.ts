import type { HarmonyType } from "./types";

/**
 * Metadata describing a harmony type
 */
export interface HarmonyMeta {
  type: HarmonyType;
  name: string;
  description: string;
  colorCount: number;
}

/**
 * Metadata for all harmony types
 */
export const HARMONY_META: HarmonyMeta[] = [
  {
    type: "complementary",
    name: "Complementary",
    description: "Two colors opposite on the color wheel. High contrast, vibrant.",
    colorCount: 2,
  },
  {
    type: "analogous",
    name: "Analogous",
    description: "Three adjacent colors. Harmonious, serene feel.",
    colorCount: 3,
  },
  {
    type: "triadic",
    name: "Triadic",
    description: "Three colors equally spaced (120°). Balanced, vibrant.",
    colorCount: 3,
  },
  {
    type: "split-complementary",
    name: "Split-Complementary",
    description: "Base color plus two adjacent to its complement. Less tension than complementary.",
    colorCount: 3,
  },
  {
    type: "drift",
    name: "Drift",
    description: "Four colors in a progressively widening spiral. Dynamic and intriguing.",
    colorCount: 4,
  },
  {
    type: "square",
    name: "Square",
    description: "Four colors equally spaced (90°). Bold, dynamic.",
    colorCount: 4,
  },
  {
    type: "rectangle",
    name: "Rectangle",
    description: "Two complementary pairs. Versatile, balanced.",
    colorCount: 4,
  },
  {
    type: "aurelian",
    name: "Aurelian",
    description: "Based on the golden angle (137.5°). Naturally harmonious.",
    colorCount: 3,
  },
  {
    type: "bi-polar",
    name: "Bi-Polar",
    description: "Two dominant colors at 90°. Strong, focused.",
    colorCount: 2,
  },
  {
    type: "retrograde",
    name: "Retrograde",
    description: "Reverse triadic arrangement. Unique perspective.",
    colorCount: 3,
  },
];

/**
 * Get metadata for a specific harmony type
 */
export function getHarmonyMeta(type: HarmonyType): HarmonyMeta | undefined {
  return HARMONY_META.find((meta) => meta.type === type);
}

/**
 * Get all harmony metadata
 */
export function getAllHarmonyMeta(): HarmonyMeta[] {
  return [...HARMONY_META];
}
