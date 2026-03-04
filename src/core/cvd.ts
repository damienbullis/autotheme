import { Color } from "./color";
import { srgbToLinear } from "./conversions";
import { linearToSrgb } from "./gamut";
import type { FullPalette, PaletteVariations } from "./types";

export type CVDType = "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

// ─── Brettel et al. (1997) Matrices ─────────────────────────
// Each dichromacy type uses two half-plane projection matrices.
// The dividing plane is defined by anchor colors and the neutral axis.

// Protanopia (no L-cones)
const PROTAN_A: number[][] = [
  [0.152286, 1.052583, -0.204868],
  [0.114503, 0.786281, 0.099216],
  [-0.003882, -0.048116, 1.051998],
];
const PROTAN_B: number[][] = [
  [0.152286, 1.052583, -0.204868],
  [0.114503, 0.786281, 0.099216],
  [-0.003882, -0.048116, 1.051998],
];

// Deuteranopia (no M-cones)
const DEUTAN_A: number[][] = [
  [0.367322, 0.860646, -0.227968],
  [0.280085, 0.672501, 0.047413],
  [-0.01182, 0.04294, 0.968881],
];
const DEUTAN_B: number[][] = [
  [0.367322, 0.860646, -0.227968],
  [0.280085, 0.672501, 0.047413],
  [-0.01182, 0.04294, 0.968881],
];

// Tritanopia (no S-cones)
const TRITAN_A: number[][] = [
  [1.255528, -0.076749, -0.178779],
  [-0.078411, 0.930809, 0.147602],
  [0.004733, 0.691367, 0.3039],
];
const TRITAN_B: number[][] = [
  [1.255528, -0.076749, -0.178779],
  [-0.078411, 0.930809, 0.147602],
  [0.004733, 0.691367, 0.3039],
];

// Separator vectors for half-plane selection
const PROTAN_SEP = [0.00048, 0.00393, -0.00441];
const DEUTAN_SEP = [-0.00281, 0.00611, -0.0033];
const TRITAN_SEP = [0.03901, -0.02788, -0.01113];

function applyMatrix(
  matrix: number[][],
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  return [
    matrix[0]![0]! * r + matrix[0]![1]! * g + matrix[0]![2]! * b,
    matrix[1]![0]! * r + matrix[1]![1]! * g + matrix[1]![2]! * b,
    matrix[2]![0]! * r + matrix[2]![1]! * g + matrix[2]![2]! * b,
  ];
}

function brettelTransform(
  r: number,
  g: number,
  b: number,
  matrixA: number[][],
  matrixB: number[][],
  sep: number[],
): [number, number, number] {
  // Determine which half-plane using the separator
  const dot = r * sep[0]! + g * sep[1]! + b * sep[2]!;
  return dot >= 0 ? applyMatrix(matrixA, r, g, b) : applyMatrix(matrixB, r, g, b);
}

/**
 * Simulate how a color appears under a specific type of color vision deficiency.
 * Pipeline: Color → sRGB → linear RGB → Brettel matrix → linear RGB → sRGB → Color
 */
export function simulateCVD(color: Color, type: CVDType): Color {
  const rgb = color.rgb;

  if (type === "achromatopsia") {
    // Luminance-only grayscale
    const linR = srgbToLinear(rgb.r);
    const linG = srgbToLinear(rgb.g);
    const linB = srgbToLinear(rgb.b);
    const y = 0.2126 * linR + 0.7152 * linG + 0.0722 * linB;
    const gray = Math.round(Math.max(0, Math.min(255, linearToSrgb(y) * 255)));
    return new Color({ r: gray, g: gray, b: gray, a: rgb.a });
  }

  // Convert to linear RGB
  const linR = srgbToLinear(rgb.r);
  const linG = srgbToLinear(rgb.g);
  const linB = srgbToLinear(rgb.b);

  let result: [number, number, number];

  switch (type) {
    case "protanopia":
      result = brettelTransform(linR, linG, linB, PROTAN_A, PROTAN_B, PROTAN_SEP);
      break;
    case "deuteranopia":
      result = brettelTransform(linR, linG, linB, DEUTAN_A, DEUTAN_B, DEUTAN_SEP);
      break;
    case "tritanopia":
      result = brettelTransform(linR, linG, linB, TRITAN_A, TRITAN_B, TRITAN_SEP);
      break;
  }

  // Convert back to sRGB
  const outR = Math.round(Math.max(0, Math.min(255, linearToSrgb(result[0]) * 255)));
  const outG = Math.round(Math.max(0, Math.min(255, linearToSrgb(result[1]) * 255)));
  const outB = Math.round(Math.max(0, Math.min(255, linearToSrgb(result[2]) * 255)));

  return new Color({ r: outR, g: outG, b: outB, a: rgb.a });
}

/**
 * Apply CVD simulation to an entire palette.
 * Returns a new palette with all colors transformed.
 */
export function simulatePaletteCVD(palette: FullPalette, type: CVDType): FullPalette {
  const transformedPalettes: PaletteVariations[] = palette.palettes.map((p) => ({
    base: simulateCVD(p.base, type),
    tints: p.tints.map((c) => simulateCVD(c, type)),
    shades: p.shades.map((c) => simulateCVD(c, type)),
    tones: p.tones.map((c) => simulateCVD(c, type)),
  }));

  const transformedTextColors = new Map<string, Color>();
  for (const [key, color] of palette.textColors) {
    transformedTextColors.set(key, simulateCVD(color, type));
  }

  return {
    harmony: {
      ...palette.harmony,
      primary: simulateCVD(palette.harmony.primary, type),
      colors: palette.harmony.colors.map((c) => simulateCVD(c, type)),
    },
    palettes: transformedPalettes,
    textColors: transformedTextColors,
  };
}
