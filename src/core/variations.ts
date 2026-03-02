import { Color } from "./color";
import type { PaletteVariations } from "./types";
import { clampToGamut, maxChromaAtHueAndLightness } from "./gamut";

const DEFAULT_TINT_STEPS = 5;
const DEFAULT_TINT_INCREMENT = 10;

const DEFAULT_SHADE_STEPS = 5;
const DEFAULT_SHADE_INCREMENT = 10;

const DEFAULT_TONE_STEPS = 4;
const DEFAULT_TONE_INCREMENT = 20;

/**
 * Eased interpolation for perceptually even lightness steps.
 * Uses a slight ease-out curve so steps feel more uniform.
 */
function easedStep(step: number, total: number): number {
  const t = step / total;
  // Ease-out quadratic for smoother perceptual spacing
  return t * (2 - t);
}

/**
 * Generate tints (lighter versions) of a color using OKLCH lightness.
 * Chroma falls off as lightness approaches 1.0 (white has zero chroma).
 */
export function generateTints(
  color: Color,
  steps: number = DEFAULT_TINT_STEPS,
  increment: number = DEFAULT_TINT_INCREMENT,
): Color[] {
  const oklch = color.oklch;
  const tints: Color[] = [];

  // Target lightness range: from base L toward 0.97
  const maxL = 0.97;
  const range = maxL - oklch.l;

  for (let i = 1; i <= steps; i++) {
    // Use increment to scale how far we go (default 10 per step out of 100)
    const rawStep = Math.min(1, (increment * i) / 100);
    const eased = easedStep(i, steps + 1);
    const blend = (rawStep + eased) / 2;
    const newL = Math.min(maxL, oklch.l + range * blend);

    // Chroma falloff: reduce chroma as lightness increases
    const chromaFalloff = 1 - Math.pow((newL - oklch.l) / Math.max(0.01, 1 - oklch.l), 0.7);
    const maxC = maxChromaAtHueAndLightness(oklch.h, newL);
    const newC = Math.min(oklch.c * chromaFalloff, maxC);

    const clamped = clampToGamut({ l: newL, c: newC, h: oklch.h, a: oklch.a });
    tints.push(Color.fromOklch(clamped.l, clamped.c, clamped.h, clamped.a));
  }

  return tints;
}

/**
 * Generate shades (darker versions) of a color using OKLCH lightness.
 * Chroma falls off as lightness approaches 0 (black has zero chroma).
 */
export function generateShades(
  color: Color,
  steps: number = DEFAULT_SHADE_STEPS,
  increment: number = DEFAULT_SHADE_INCREMENT,
): Color[] {
  const oklch = color.oklch;
  const shades: Color[] = [];

  // Target lightness range: from base L toward 0.10
  const minL = 0.1;
  const range = oklch.l - minL;

  for (let i = 1; i <= steps; i++) {
    const rawStep = Math.min(1, (increment * i) / 100);
    const eased = easedStep(i, steps + 1);
    const blend = (rawStep + eased) / 2;
    const newL = Math.max(minL, oklch.l - range * blend);

    // Chroma falloff: reduce chroma as lightness decreases
    const chromaFalloff = 1 - Math.pow((oklch.l - newL) / Math.max(0.01, oklch.l), 0.7);
    const maxC = maxChromaAtHueAndLightness(oklch.h, newL);
    const newC = Math.min(oklch.c * chromaFalloff, maxC);

    const clamped = clampToGamut({ l: newL, c: newC, h: oklch.h, a: oklch.a });
    shades.push(Color.fromOklch(clamped.l, clamped.c, clamped.h, clamped.a));
  }

  return shades;
}

/**
 * Generate tones (desaturated versions) of a color by reducing OKLCH chroma.
 */
export function generateTones(
  color: Color,
  steps: number = DEFAULT_TONE_STEPS,
  increment: number = DEFAULT_TONE_INCREMENT,
): Color[] {
  const oklch = color.oklch;
  const tones: Color[] = [];

  for (let i = 1; i <= steps; i++) {
    // Reduce chroma proportionally (increment is percentage-based)
    const factor = Math.max(0, 1 - (increment * i) / 100);
    const newC = oklch.c * factor;
    tones.push(Color.fromOklch(oklch.l, newC, oklch.h, oklch.a));
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
