import { Color } from "./color";
import type { PaletteVariations } from "./types";

const TINT_STEPS = 5;
const TINT_INCREMENT = 10; // Lightness increase per step

const SHADE_STEPS = 5;
const SHADE_INCREMENT = 10; // Lightness decrease per step

const TONE_STEPS = 4;
const TONE_INCREMENT = 20; // Saturation decrease per step

/**
 * Generate tints (lighter versions) of a color
 * @param color - The base color
 * @param steps - Number of tints to generate (default 5)
 * @returns Array of progressively lighter colors (L1-L5)
 */
export function generateTints(color: Color, steps: number = TINT_STEPS): Color[] {
  const hsl = color.hsl;
  const tints: Color[] = [];

  for (let i = 1; i <= steps; i++) {
    const newLightness = Math.min(100, hsl.l + TINT_INCREMENT * i);
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
 * @param color - The base color
 * @param steps - Number of shades to generate (default 5)
 * @returns Array of progressively darker colors (D1-D5)
 */
export function generateShades(color: Color, steps: number = SHADE_STEPS): Color[] {
  const hsl = color.hsl;
  const shades: Color[] = [];

  for (let i = 1; i <= steps; i++) {
    const newLightness = Math.max(0, hsl.l - SHADE_INCREMENT * i);
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
 * @param color - The base color
 * @param steps - Number of tones to generate (default 4)
 * @returns Array of progressively desaturated colors (G1-G4)
 */
export function generateTones(color: Color, steps: number = TONE_STEPS): Color[] {
  const hsl = color.hsl;
  const tones: Color[] = [];

  for (let i = 1; i <= steps; i++) {
    const newSaturation = Math.max(0, hsl.s - TONE_INCREMENT * i);
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

/**
 * Generate all variations (tints, shades, tones) for a color
 * @param color - The base color
 * @returns Object containing base color and all variations
 */
export function generatePaletteVariations(color: Color): PaletteVariations {
  return {
    base: color,
    tints: generateTints(color),
    shades: generateShades(color),
    tones: generateTones(color),
  };
}
