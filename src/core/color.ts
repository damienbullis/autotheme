import type { ColorInput, HSLColor, RGBColor, OKLCHColor } from "./types";
import type { ColorFormat } from "../config/types";
import { parseToOklch } from "./parse";
import { formatOklch, rgbToHex } from "./conversions";
import { oklchToRgb, oklchToHsl, clampToGamut } from "./gamut";
import { getLuminance } from "./luminance";

/**
 * Immutable Color class with OKLCH internal representation
 * for perceptually uniform color manipulation
 */
export class Color {
  private readonly _oklch: OKLCHColor;

  constructor(input: ColorInput) {
    this._oklch = parseToOklch(input);
  }

  /**
   * Create a Color directly from OKLCH values (no parsing overhead)
   */
  static fromOklch(l: number, c: number, h: number, a: number = 1): Color {
    const color = Object.create(Color.prototype) as Color;
    (color as unknown as { _oklch: OKLCHColor })._oklch = { l, c, h, a };
    return color;
  }

  /**
   * Get the OKLCH representation
   */
  get oklch(): OKLCHColor {
    return { ...this._oklch };
  }

  /**
   * Get the HSL representation (reverse-converted from OKLCH)
   */
  get hsl(): HSLColor {
    return oklchToHsl(this._oklch);
  }

  /**
   * Get the RGB representation
   */
  get rgb(): RGBColor {
    return oklchToRgb(clampToGamut(this._oklch));
  }

  /**
   * Get the hex string (e.g., "#ff0000")
   */
  get hex(): string {
    return rgbToHex(this.rgb);
  }

  /**
   * Get the relative luminance (WCAG standard)
   */
  get luminance(): number {
    return getLuminance(this.rgb);
  }

  /**
   * Create a lighter color by increasing OKLCH lightness
   * @param amount - Percentage to increase lightness (0-100, maps to 0-1 OKLCH)
   */
  lighten(amount: number): Color {
    const newL = Math.min(1, this._oklch.l + amount / 100);
    return Color.fromOklch(newL, this._oklch.c, this._oklch.h, this._oklch.a);
  }

  /**
   * Create a darker color by decreasing OKLCH lightness
   * @param amount - Percentage to decrease lightness (0-100, maps to 0-1 OKLCH)
   */
  darken(amount: number): Color {
    const newL = Math.max(0, this._oklch.l - amount / 100);
    return Color.fromOklch(newL, this._oklch.c, this._oklch.h, this._oklch.a);
  }

  /**
   * Create a more saturated color by increasing OKLCH chroma
   * @param amount - Percentage to increase chroma (0-100, proportional)
   */
  saturate(amount: number): Color {
    const newC = this._oklch.c + (amount / 100) * 0.4;
    return Color.fromOklch(this._oklch.l, Math.max(0, newC), this._oklch.h, this._oklch.a);
  }

  /**
   * Create a less saturated color by decreasing OKLCH chroma
   * @param amount - Percentage to decrease chroma (0-100, proportional)
   */
  desaturate(amount: number): Color {
    const newC = this._oklch.c * (1 - amount / 100);
    return Color.fromOklch(this._oklch.l, Math.max(0, newC), this._oklch.h, this._oklch.a);
  }

  /**
   * Rotate the hue by a given number of degrees
   * @param degrees - Degrees to rotate hue (can be negative)
   */
  rotate(degrees: number): Color {
    let newH = (this._oklch.h + degrees) % 360;
    if (newH < 0) newH += 360;
    return Color.fromOklch(this._oklch.l, this._oklch.c, newH, this._oklch.a);
  }

  /**
   * Set the alpha channel
   * @param alpha - New alpha value (0-1)
   */
  alpha(alpha: number): Color {
    return Color.fromOklch(
      this._oklch.l,
      this._oklch.c,
      this._oklch.h,
      Math.max(0, Math.min(1, alpha)),
    );
  }

  /**
   * Output as hex string
   */
  toHex(): string {
    return this.hex;
  }

  /**
   * Output as RGB CSS string
   */
  toRGB(): string {
    const { r, g, b, a } = this.rgb;
    if (a < 1) {
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Output as HSL CSS string
   */
  toHSL(): string {
    const { h, s, l, a } = this.hsl;
    if (a < 1) {
      return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;
    }
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  }

  /**
   * Output as OKLCH CSS string
   */
  toOKLCH(): string {
    return formatOklch(this._oklch);
  }

  /**
   * Output as space-separated RGB values for CSS variables
   * e.g., "255 128 64"
   */
  toRGBValues(): string {
    const { r, g, b } = this.rgb;
    return `${r} ${g} ${b}`;
  }

  /**
   * Format the color in the specified CSS format
   */
  formatAs(format: ColorFormat): string {
    switch (format) {
      case "oklch":
        return this.toOKLCH();
      case "hsl":
        return this.toHSL();
      case "rgb":
        return this.toRGB();
      case "hex":
        return this.toHex();
    }
  }

  /**
   * Check if this color equals another color (within a small tolerance)
   */
  equals(other: Color, tolerance: number = 1): boolean {
    const a = this._oklch;
    const b = other.oklch;

    // Compare in OKLCH space: L tolerance ~0.01 per HSL unit, C ~0.004, H ~1 degree
    return (
      Math.abs(a.l - b.l) <= tolerance * 0.01 &&
      Math.abs(a.c - b.c) <= tolerance * 0.004 &&
      Math.abs(a.h - b.h) <= tolerance &&
      Math.abs(a.a - b.a) <= 0.01
    );
  }

  /**
   * Create a string representation for debugging
   */
  toString(): string {
    return this.toHex();
  }
}
