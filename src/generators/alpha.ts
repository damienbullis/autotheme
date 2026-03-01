import { Color } from "../core/color";
import type { AlphaSteps } from "../config/types";

export interface AlphaVariantSet {
  bg: Color;
  border: Color;
  glow: Color;
  hover: Color;
}

/**
 * Generate alpha-transparent variants of a base color.
 * Each variant uses the same hue/saturation/lightness but a different alpha.
 */
export function generateAlphaVariants(baseColor: Color, steps: AlphaSteps): AlphaVariantSet {
  return {
    bg: baseColor.alpha(steps.bg / 100),
    border: baseColor.alpha(steps.border / 100),
    glow: baseColor.alpha(steps.glow / 100),
    hover: baseColor.alpha(steps.hover / 100),
  };
}
