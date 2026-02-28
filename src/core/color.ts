import type { ColorInput, HSLColor, RGBColor, OKLCHColor } from "./types";
import { parseColor } from "./parse";
import { hslToRgb, rgbToHex, hslToOklch, formatOklch } from "./conversions";
import { getLuminance } from "./luminance";

/**
 * Immutable Color class with HSL internal representation
 */
export class Color {
  private readonly _hsl: HSLColor;

  constructor(input: ColorInput) {
    this._hsl = parseColor(input);
  }

  /**
   * Get the HSL representation
   */
  get hsl(): HSLColor {
    return { ...this._hsl };
  }

  /**
   * Get the RGB representation
   */
  get rgb(): RGBColor {
    return hslToRgb(this._hsl);
  }

  /**
   * Get the hex string (e.g., "#ff0000")
   */
  get hex(): string {
    return rgbToHex(this.rgb);
  }

  /**
   * Get the OKLCH representation
   */
  get oklch(): OKLCHColor {
    return hslToOklch(this._hsl);
  }

  /**
   * Get the relative luminance (WCAG standard)
   */
  get luminance(): number {
    return getLuminance(this.rgb);
  }

  /**
   * Create a lighter color by increasing lightness
   * @param amount - Percentage to increase lightness (0-100)
   */
  lighten(amount: number): Color {
    const newL = Math.min(100, this._hsl.l + amount);
    return new Color({ ...this._hsl, l: newL });
  }

  /**
   * Create a darker color by decreasing lightness
   * @param amount - Percentage to decrease lightness (0-100)
   */
  darken(amount: number): Color {
    const newL = Math.max(0, this._hsl.l - amount);
    return new Color({ ...this._hsl, l: newL });
  }

  /**
   * Create a more saturated color
   * @param amount - Percentage to increase saturation (0-100)
   */
  saturate(amount: number): Color {
    const newS = Math.min(100, this._hsl.s + amount);
    return new Color({ ...this._hsl, s: newS });
  }

  /**
   * Create a less saturated color
   * @param amount - Percentage to decrease saturation (0-100)
   */
  desaturate(amount: number): Color {
    const newS = Math.max(0, this._hsl.s - amount);
    return new Color({ ...this._hsl, s: newS });
  }

  /**
   * Rotate the hue by a given number of degrees
   * @param degrees - Degrees to rotate hue (can be negative)
   */
  rotate(degrees: number): Color {
    let newH = (this._hsl.h + degrees) % 360;
    if (newH < 0) newH += 360;
    return new Color({ ...this._hsl, h: newH });
  }

  /**
   * Set the alpha channel
   * @param alpha - New alpha value (0-1)
   */
  alpha(alpha: number): Color {
    return new Color({ ...this._hsl, a: Math.max(0, Math.min(1, alpha)) });
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
    const { h, s, l, a } = this._hsl;
    if (a < 1) {
      return `hsla(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%, ${a})`;
    }
    return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
  }

  /**
   * Output as OKLCH CSS string
   */
  toOKLCH(): string {
    return formatOklch(this.oklch);
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
   * Check if this color equals another color (within a small tolerance)
   */
  equals(other: Color, tolerance: number = 1): boolean {
    const hslA = this._hsl;
    const hslB = other.hsl;

    return (
      Math.abs(hslA.h - hslB.h) <= tolerance &&
      Math.abs(hslA.s - hslB.s) <= tolerance &&
      Math.abs(hslA.l - hslB.l) <= tolerance &&
      Math.abs(hslA.a - hslB.a) <= 0.01
    );
  }

  /**
   * Create a string representation for debugging
   */
  toString(): string {
    return this.toHex();
  }
}
