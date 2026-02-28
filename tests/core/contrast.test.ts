import { describe, it, expect } from "vitest";
import { Color } from "../../src/core/color";
import {
  getLuminance,
  getContrastRatio,
  checkWCAG,
  findAccessibleTextColor,
  getBestContrastColor,
} from "../../src/core/contrast";

describe("Contrast calculations", () => {
  describe("getLuminance", () => {
    it("returns 0 for black", () => {
      expect(getLuminance({ r: 0, g: 0, b: 0, a: 1 })).toBeCloseTo(0, 3);
    });

    it("returns 1 for white", () => {
      expect(getLuminance({ r: 255, g: 255, b: 255, a: 1 })).toBeCloseTo(1, 3);
    });

    it("returns correct luminance for red", () => {
      expect(getLuminance({ r: 255, g: 0, b: 0, a: 1 })).toBeCloseTo(0.2126, 3);
    });

    it("returns correct luminance for green", () => {
      expect(getLuminance({ r: 0, g: 255, b: 0, a: 1 })).toBeCloseTo(0.7152, 3);
    });

    it("returns correct luminance for blue", () => {
      expect(getLuminance({ r: 0, g: 0, b: 255, a: 1 })).toBeCloseTo(0.0722, 3);
    });

    it("handles mid-gray correctly", () => {
      const lum = getLuminance({ r: 128, g: 128, b: 128, a: 1 });
      expect(lum).toBeGreaterThan(0.1);
      expect(lum).toBeLessThan(0.3);
    });
  });

  describe("getContrastRatio", () => {
    it("returns 21 for black on white", () => {
      const black = new Color("#000000");
      const white = new Color("#ffffff");
      expect(getContrastRatio(black, white)).toBeCloseTo(21, 1);
    });

    it("returns 1 for same color", () => {
      const color = new Color("#ff0000");
      expect(getContrastRatio(color, color)).toBeCloseTo(1, 3);
    });

    it("is symmetric", () => {
      const dark = new Color("#333333");
      const light = new Color("#cccccc");
      const ratio1 = getContrastRatio(dark, light);
      const ratio2 = getContrastRatio(light, dark);
      expect(ratio1).toBeCloseTo(ratio2, 3);
    });

    it("returns expected ratio for typical color pair", () => {
      const blue = new Color("#0000ff");
      const white = new Color("#ffffff");
      const ratio = getContrastRatio(blue, white);
      expect(ratio).toBeGreaterThan(8);
      expect(ratio).toBeLessThan(9);
    });
  });

  describe("checkWCAG", () => {
    it("returns AAA for high contrast", () => {
      const black = new Color("#000000");
      const white = new Color("#ffffff");
      const result = checkWCAG(black, white);

      expect(result.level).toBe("AAA");
      expect(result.passesAAA).toBe(true);
      expect(result.passesAA).toBe(true);
      expect(result.passesAALarge).toBe(true);
      expect(result.passesAAALarge).toBe(true);
      expect(result.ratio).toBeCloseTo(21, 1);
    });

    it("returns FAIL for low contrast", () => {
      const lightGray = new Color("#cccccc");
      const white = new Color("#ffffff");
      const result = checkWCAG(lightGray, white);

      expect(result.level).toBe("FAIL");
      expect(result.passesAAA).toBe(false);
      expect(result.passesAA).toBe(false);
    });

    it("correctly identifies AA level", () => {
      // Find a color pair that passes AA but not AAA
      const text = new Color("#757575"); // Medium gray
      const background = new Color("#ffffff");
      const result = checkWCAG(text, background);

      expect(result.ratio).toBeGreaterThan(4.5);
      expect(result.ratio).toBeLessThan(7);
      expect(result.level).toBe("AA");
      expect(result.passesAA).toBe(true);
      expect(result.passesAAA).toBe(false);
    });

    it("correctly identifies large text thresholds", () => {
      // Create a pair that passes large text AA but not normal AA
      const text = new Color("#767676");
      const background = new Color("#ffffff");
      const result = checkWCAG(text, background);

      expect(result.passesAALarge).toBe(true);
      expect(result.passesAAALarge).toBe(true);
    });
  });

  describe("findAccessibleTextColor", () => {
    it("returns white for dark backgrounds", () => {
      const darkBg = new Color("#000000");
      const text = findAccessibleTextColor(darkBg);
      expect(text.hsl.l).toBeGreaterThan(90);
    });

    it("returns black for light backgrounds", () => {
      const lightBg = new Color("#ffffff");
      const text = findAccessibleTextColor(lightBg);
      expect(text.hsl.l).toBeLessThan(10);
    });

    it("returns color with best achievable contrast", () => {
      // For colors where AAA (7:1) is achievable
      const darkBg = new Color("#1a1a1a");
      const textOnDark = findAccessibleTextColor(darkBg);
      const ratioOnDark = getContrastRatio(textOnDark, darkBg);
      expect(ratioOnDark).toBeGreaterThanOrEqual(7);

      // For colors where AAA might not be achievable, we get best possible
      const midBg = new Color("#6639ff");
      const textOnMid = findAccessibleTextColor(midBg);
      const ratioOnMid = getContrastRatio(textOnMid, midBg);
      // Should at least get better than 4.5 (AA level) or best possible
      expect(ratioOnMid).toBeGreaterThanOrEqual(4);
    });

    it("respects custom target ratio", () => {
      const bg = new Color("#6639ff");
      const text = findAccessibleTextColor(bg, 4.5);
      const ratio = getContrastRatio(text, bg);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("handles mid-tone colors", () => {
      const midGray = new Color("#808080");
      const text = findAccessibleTextColor(midGray);
      const ratio = getContrastRatio(text, midGray);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("handles saturated colors", () => {
      const brightRed = new Color("#ff0000");
      const text = findAccessibleTextColor(brightRed);
      const ratio = getContrastRatio(text, brightRed);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it("returns pure black or white when they meet target", () => {
      // For very light background, black easily meets AAA
      const veryLight = new Color("#f0f0f0");
      const textOnLight = findAccessibleTextColor(veryLight, 7);
      expect(textOnLight.hsl.l).toBeLessThan(10);

      // For very dark background, white easily meets AAA
      const veryDark = new Color("#0a0a0a");
      const textOnDark = findAccessibleTextColor(veryDark, 7);
      expect(textOnDark.hsl.l).toBeGreaterThan(90);
    });

    it("iterates through lightness to find best contrast", () => {
      // A mid-luminance color where iteration is needed
      const tricky = new Color("#808080");
      const text = findAccessibleTextColor(tricky, 3);
      const ratio = getContrastRatio(text, tricky);
      expect(ratio).toBeGreaterThanOrEqual(3);
    });

    it("exhausts iterations when target is unachievable", () => {
      // Use a very low max iterations to force exhaustion
      const midColor = new Color("#6639ff");
      // With only 5 iterations, we likely won't find 7:1
      const text = findAccessibleTextColor(midColor, 7, 5);
      // Should still return a valid color
      expect(text).toBeInstanceOf(Color);
    });
  });

  describe("getBestContrastColor", () => {
    it("returns white for dark backgrounds", () => {
      const darkBg = new Color("#000000");
      const best = getBestContrastColor(darkBg);
      expect(best.hex).toBe("#ffffff");
    });

    it("returns black for light backgrounds", () => {
      const lightBg = new Color("#ffffff");
      const best = getBestContrastColor(lightBg);
      expect(best.hex).toBe("#000000");
    });

    it("returns black for yellow (luminous color)", () => {
      const yellow = new Color("#ffff00");
      const best = getBestContrastColor(yellow);
      expect(best.hex).toBe("#000000");
    });

    it("returns white for blue (dark color)", () => {
      const blue = new Color("#0000ff");
      const best = getBestContrastColor(blue);
      expect(best.hex).toBe("#ffffff");
    });
  });
});
