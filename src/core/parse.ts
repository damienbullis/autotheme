import type { ColorInput, HSLColor, RGBColor, OKLCHColor } from "./types";
import { hexToHsl, rgbToHsl, hslToOklch } from "./conversions";
import { oklchToHsl as gamutOklchToHsl } from "./gamut";

/**
 * Type guard to check if a color input is an RGB color object
 */
export function isRGBColor(input: ColorInput): input is RGBColor {
  if (typeof input === "string") return false;
  return "r" in input && "g" in input && "b" in input;
}

/**
 * Type guard to check if a color input is an HSL color object
 */
export function isHSLColor(input: ColorInput): input is HSLColor {
  if (typeof input === "string") return false;
  return "h" in input && "s" in input && "l" in input && !("c" in input);
}

/**
 * Type guard to check if a color input is an OKLCH color object
 */
export function isOKLCHColor(input: ColorInput): input is OKLCHColor {
  if (typeof input === "string") return false;
  return "l" in input && "c" in input && "h" in input;
}

/**
 * Parse an RGB string like "rgb(255, 128, 64)" or "rgba(255, 128, 64, 0.5)"
 */
function parseRgbString(str: string): HSLColor {
  // Matches: rgb(255, 128, 64) OR rgb(255 128 64) OR rgb(255 128 64 / 0.5)
  const match = str.match(/rgba?\s*\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)/);

  if (!match || !match[1] || !match[2] || !match[3]) {
    throw new Error(`Invalid RGB format: ${str}`);
  }

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);
  let a = 1;
  if (match[4] !== undefined) {
    a = match[4].endsWith("%") ? parseFloat(match[4]) / 100 : parseFloat(match[4]);
  }

  return rgbToHsl({ r, g, b, a });
}

/**
 * Parse an HSL string like "hsl(180, 50%, 50%)" or "hsla(180, 50%, 50%, 0.5)"
 */
function parseHslString(str: string): HSLColor {
  // Matches: hsl(180, 50%, 50%) OR hsl(180 50% 50%) OR hsl(180 50% 50% / 0.5)
  const match = str.match(
    /hsla?\s*\(\s*([\d.]+)[\s,]+([\d.]+)%?[\s,]+([\d.]+)%?(?:\s*[,/]\s*([\d.]+%?))?\s*\)/,
  );

  if (!match || !match[1] || !match[2] || !match[3]) {
    throw new Error(`Invalid HSL format: ${str}`);
  }

  const h = parseFloat(match[1]);
  const s = parseFloat(match[2]);
  const l = parseFloat(match[3]);
  let a = 1;
  if (match[4] !== undefined) {
    a = match[4].endsWith("%") ? parseFloat(match[4]) / 100 : parseFloat(match[4]);
  }

  return { h, s, l, a };
}

/**
 * Parse a color string (hex, rgb, or hsl)
 */
function parseColorString(str: string): HSLColor {
  const trimmed = str.trim().toLowerCase();

  if (trimmed.startsWith("#")) {
    return hexToHsl(trimmed);
  }
  if (trimmed.startsWith("rgb")) {
    return parseRgbString(trimmed);
  }
  if (trimmed.startsWith("hsl")) {
    return parseHslString(trimmed);
  }

  throw new Error(`Invalid color format: ${str}`);
}

/**
 * Parse any color input to HSL
 */
export function parseColor(input: ColorInput): HSLColor {
  if (typeof input === "string") {
    return parseColorString(input);
  }
  if (isOKLCHColor(input)) {
    return gamutOklchToHsl(input);
  }
  if (isRGBColor(input)) {
    // Ensure alpha has a default
    const rgb: RGBColor = {
      r: input.r,
      g: input.g,
      b: input.b,
      a: input.a ?? 1,
    };
    return rgbToHsl(rgb);
  }
  // It's an HSL color
  return {
    h: input.h,
    s: input.s,
    l: input.l,
    a: input.a ?? 1,
  };
}

/**
 * Parse any color input to OKLCH
 */
export function parseToOklch(input: ColorInput): OKLCHColor {
  if (typeof input !== "string" && isOKLCHColor(input)) {
    return {
      l: input.l,
      c: input.c,
      h: input.h,
      a: input.a ?? 1,
    };
  }
  const hsl = parseColor(input);
  return hslToOklch(hsl);
}
