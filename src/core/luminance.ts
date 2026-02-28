import type { RGBColor } from "./types";

/**
 * Calculate the relative luminance of an RGB color (WCAG 2.x formula)
 * @see https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
export function getLuminance(rgb: RGBColor): number {
  const linearize = (channel: number): number => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };

  const r = linearize(rgb.r);
  const g = linearize(rgb.g);
  const b = linearize(rgb.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
