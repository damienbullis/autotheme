import { Color } from "./color";
import { getLuminance } from "./luminance";

// Re-export getLuminance for backwards compatibility
export { getLuminance };

export type WCAGLevel = "AAA" | "AA" | "A" | "FAIL";

export interface WCAGResult {
  ratio: number;
  level: WCAGLevel;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
  passesAAALarge: boolean;
}

/**
 * Calculate the contrast ratio between two colors
 * @see https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export function getContrastRatio(color1: Color, color2: Color): number {
  const l1 = color1.luminance;
  const l2 = color2.luminance;

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check WCAG compliance for a foreground/background color pair
 */
export function checkWCAG(foreground: Color, background: Color): WCAGResult {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio,
    level: ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "A" : "FAIL",
    passesAA: ratio >= 4.5, // Normal text
    passesAAA: ratio >= 7, // Enhanced
    passesAALarge: ratio >= 3, // Large text AA
    passesAAALarge: ratio >= 4.5, // Large text AAA
  };
}

/**
 * Find an accessible text color that meets the target contrast ratio against a background
 * @param background - The background color
 * @param targetRatio - Target contrast ratio (default 7 for AAA)
 * @param maxIterations - Maximum iterations to try (default 50)
 * @returns The text color with best achievable contrast
 */
export function findAccessibleTextColor(
  background: Color,
  targetRatio: number = 7,
  maxIterations: number = 50,
): Color {
  const black = new Color("#000000");
  const white = new Color("#ffffff");

  const blackRatio = getContrastRatio(black, background);
  const whiteRatio = getContrastRatio(white, background);

  // If either pure black or white meets the target, use whichever is better
  if (blackRatio >= targetRatio || whiteRatio >= targetRatio) {
    return blackRatio >= whiteRatio ? black : white;
  }

  // Neither meets target - try to find an intermediate that does
  // Start from whichever extreme gives better contrast
  const startFromWhite = whiteRatio > blackRatio;
  let bestColor = startFromWhite ? white : black;
  let bestRatio = startFromWhite ? whiteRatio : blackRatio;

  // Try adjusting from the starting point toward the opposite
  let currentL = startFromWhite ? 100 : 0;
  const step = 2;

  for (let i = 0; i < maxIterations; i++) {
    currentL = startFromWhite ? currentL - step : currentL + step;

    if (currentL < 0 || currentL > 100) {
      break;
    }

    const testColor = new Color({ h: 0, s: 0, l: currentL, a: 1 });
    const ratio = getContrastRatio(testColor, background);

    if (ratio > bestRatio) {
      bestRatio = ratio;
      bestColor = testColor;
    }

    if (ratio >= targetRatio) {
      return testColor;
    }
  }

  // Return the best we could find (even if it doesn't meet target)
  return bestColor;
}

/**
 * Determine if black or white provides better contrast against a background
 */
export function getBestContrastColor(background: Color): Color {
  const black = new Color("#000000");
  const white = new Color("#ffffff");

  const blackContrast = getContrastRatio(black, background);
  const whiteContrast = getContrastRatio(white, background);

  return blackContrast > whiteContrast ? black : white;
}
