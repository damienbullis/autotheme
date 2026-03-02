import type { OKLCHColor, RGBColor, HSLColor } from "./types";
import { rgbToHsl } from "./conversions";

/**
 * Convert OKLab to linear RGB
 */
export function oklabToLinearRgb(
  L: number,
  a: number,
  b: number,
): { r: number; g: number; b: number } {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

/**
 * Convert OKLCH to OKLab
 */
export function oklchToOklab(oklch: OKLCHColor): { L: number; a: number; b: number } {
  const hRad = (oklch.h * Math.PI) / 180;
  return {
    L: oklch.l,
    a: oklch.c * Math.cos(hRad),
    b: oklch.c * Math.sin(hRad),
  };
}

/**
 * Convert linear RGB to sRGB (gamma compression)
 */
function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

/**
 * Convert OKLCH to sRGB (0-255)
 */
export function oklchToRgb(oklch: OKLCHColor): RGBColor {
  const lab = oklchToOklab(oklch);
  const linear = oklabToLinearRgb(lab.L, lab.a, lab.b);

  return {
    r: Math.round(Math.max(0, Math.min(255, linearToSrgb(linear.r) * 255))),
    g: Math.round(Math.max(0, Math.min(255, linearToSrgb(linear.g) * 255))),
    b: Math.round(Math.max(0, Math.min(255, linearToSrgb(linear.b) * 255))),
    a: oklch.a,
  };
}

/**
 * Convert OKLCH to HSL
 */
export function oklchToHsl(oklch: OKLCHColor): HSLColor {
  return rgbToHsl(oklchToRgb(oklch));
}

/**
 * Check if an OKLCH color is within sRGB gamut
 */
export function isInGamut(oklch: OKLCHColor): boolean {
  const lab = oklchToOklab(oklch);
  const linear = oklabToLinearRgb(lab.L, lab.a, lab.b);

  const r = linearToSrgb(linear.r);
  const g = linearToSrgb(linear.g);
  const b = linearToSrgb(linear.b);

  const epsilon = 0.001;
  return (
    r >= -epsilon &&
    r <= 1 + epsilon &&
    g >= -epsilon &&
    g <= 1 + epsilon &&
    b >= -epsilon &&
    b <= 1 + epsilon
  );
}

/**
 * Find the maximum chroma at a given hue and lightness that stays within sRGB gamut
 */
export function maxChromaAtHueAndLightness(hue: number, lightness: number): number {
  let low = 0;
  let high = 0.4;

  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    if (isInGamut({ l: lightness, c: mid, h: hue, a: 1 })) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return low;
}

/**
 * Clamp an OKLCH color to sRGB gamut by reducing chroma
 */
export function clampToGamut(oklch: OKLCHColor): OKLCHColor {
  if (isInGamut(oklch)) return oklch;

  // Clamp lightness to valid range
  const l = Math.max(0, Math.min(1, oklch.l));

  // Binary search for maximum in-gamut chroma
  const maxC = maxChromaAtHueAndLightness(oklch.h, l);

  return {
    l,
    c: Math.min(oklch.c, maxC),
    h: oklch.h,
    a: oklch.a,
  };
}
