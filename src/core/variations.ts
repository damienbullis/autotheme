import { Color } from "./color";
import type { PaletteVariations } from "./types";

const DEFAULT_TINT_STEPS = 5;
const DEFAULT_TINT_INCREMENT = 10;

const DEFAULT_SHADE_STEPS = 5;
const DEFAULT_SHADE_INCREMENT = 10;

const DEFAULT_TONE_STEPS = 4;
const DEFAULT_TONE_INCREMENT = 20;

/**
 * Generate tints (lighter versions) of a color
 */
export function generateTints(
  color: Color,
  steps: number = DEFAULT_TINT_STEPS,
  increment: number = DEFAULT_TINT_INCREMENT,
): Color[] {
  const hsl = color.hsl;
  const tints: Color[] = [];

  for (let i = 1; i <= steps; i++) {
    const newLightness = Math.min(100, hsl.l + increment * i);
    tints.push(
      new Color({
        h: hsl.h,
        s: hsl.s,
        l: newLightness,
        a: hsl.a,
      }),
    );
  }

  return tints;
}

/**
 * Generate shades (darker versions) of a color
 */
export function generateShades(
  color: Color,
  steps: number = DEFAULT_SHADE_STEPS,
  increment: number = DEFAULT_SHADE_INCREMENT,
): Color[] {
  const hsl = color.hsl;
  const shades: Color[] = [];

  for (let i = 1; i <= steps; i++) {
    const newLightness = Math.max(0, hsl.l - increment * i);
    shades.push(
      new Color({
        h: hsl.h,
        s: hsl.s,
        l: newLightness,
        a: hsl.a,
      }),
    );
  }

  return shades;
}

/**
 * Generate tones (desaturated versions) of a color
 */
export function generateTones(
  color: Color,
  steps: number = DEFAULT_TONE_STEPS,
  increment: number = DEFAULT_TONE_INCREMENT,
): Color[] {
  const hsl = color.hsl;
  const tones: Color[] = [];

  for (let i = 1; i <= steps; i++) {
    const newSaturation = Math.max(0, hsl.s - increment * i);
    tones.push(
      new Color({
        h: hsl.h,
        s: newSaturation,
        l: hsl.l,
        a: hsl.a,
      }),
    );
  }

  return tones;
}

/** Options for palette variation generation */
export interface PaletteVariationOptions {
  tints?: number;
  shades?: number;
  tones?: number;
  tintIncrement?: number;
  shadeIncrement?: number;
  toneIncrement?: number;
}

/**
 * Generate all variations (tints, shades, tones) for a color
 */
export function generatePaletteVariations(
  color: Color,
  options?: PaletteVariationOptions,
): PaletteVariations {
  return {
    base: color,
    tints: generateTints(color, options?.tints, options?.tintIncrement),
    shades: generateShades(color, options?.shades, options?.shadeIncrement),
    tones: generateTones(color, options?.tones, options?.toneIncrement),
  };
}
