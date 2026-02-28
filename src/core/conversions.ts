import type { HSLColor, RGBColor, OKLCHColor } from "./types";

/**
 * Convert hex color string to RGB
 */
export function hexToRgb(hex: string): RGBColor {
  // Remove # prefix
  const clean = hex.replace(/^#/, "");

  // Handle 3-digit hex
  const normalized =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  // Handle 8-digit hex (with alpha)
  const hasAlpha = normalized.length === 8;

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const a = hasAlpha ? parseInt(normalized.slice(6, 8), 16) / 255 : 1;

  return { r, g, b, a };
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGBColor): HSLColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    // Achromatic
    return { h: 0, s: 0, l: l * 100, a: rgb.a };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
      h = ((r - g) / d + 4) / 6;
      break;
    default:
      h = 0;
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
    a: rgb.a,
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    // Achromatic
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v, a: hsl.a };
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const hueToRgb = (t: number): number => {
    let t1 = t;
    if (t1 < 0) t1 += 1;
    if (t1 > 1) t1 -= 1;
    if (t1 < 1 / 6) return p + (q - p) * 6 * t1;
    if (t1 < 1 / 2) return q;
    if (t1 < 2 / 3) return p + (q - p) * (2 / 3 - t1) * 6;
    return p;
  };

  return {
    r: Math.round(hueToRgb(h + 1 / 3) * 255),
    g: Math.round(hueToRgb(h) * 255),
    b: Math.round(hueToRgb(h - 1 / 3) * 255),
    a: hsl.a,
  };
}

/**
 * Convert RGB to hex string
 */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number): string => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;

  if (rgb.a < 1) {
    return hex + toHex(Math.round(rgb.a * 255));
  }

  return hex;
}

/**
 * Convert hex directly to HSL
 */
export function hexToHsl(hex: string): HSLColor {
  return rgbToHsl(hexToRgb(hex));
}

/**
 * Convert HSL directly to hex
 */
export function hslToHex(hsl: HSLColor): string {
  return rgbToHex(hslToRgb(hsl));
}

/**
 * Convert sRGB to linear RGB (gamma expansion)
 */
function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Convert RGB to OKLab color space
 */
function rgbToOklab(rgb: RGBColor): { L: number; a: number; b: number } {
  const r = srgbToLinear(rgb.r);
  const g = srgbToLinear(rgb.g);
  const b = srgbToLinear(rgb.b);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return {
    L: 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    a: 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    b: 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  };
}

/**
 * Convert RGB to OKLCH color space
 */
export function rgbToOklch(rgb: RGBColor): OKLCHColor {
  const lab = rgbToOklab(rgb);

  const L = lab.L;
  const C = Math.sqrt(lab.a * lab.a + lab.b * lab.b);
  let H = Math.atan2(lab.b, lab.a) * (180 / Math.PI);
  if (H < 0) H += 360;

  return {
    l: L,
    c: C,
    h: C < 0.0001 ? 0 : H, // If chroma is near zero, hue is meaningless
    a: rgb.a,
  };
}

/**
 * Convert HSL to OKLCH
 */
export function hslToOklch(hsl: HSLColor): OKLCHColor {
  return rgbToOklch(hslToRgb(hsl));
}

/**
 * Format OKLCH as CSS string
 */
export function formatOklch(oklch: OKLCHColor): string {
  const l = oklch.l.toFixed(3);
  const c = oklch.c.toFixed(3);
  const h = oklch.h.toFixed(3);

  if (oklch.a < 1) {
    return `oklch(${l} ${c} ${h} / ${(oklch.a * 100).toFixed(0)}%)`;
  }
  return `oklch(${l} ${c} ${h})`;
}
