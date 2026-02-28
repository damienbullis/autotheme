import { describe, it, expect } from "vitest";
import { Color } from "../../src/core/color";
import { generateFullPalette, getTextColorKey } from "../../src/core/palette";
import { getContrastRatio } from "../../src/core/contrast";

describe("Full Palette Generation", () => {
  const primary = new Color("#6439FF");

  describe("generateFullPalette", () => {
    it("generates palette with correct harmony", () => {
      const palette = generateFullPalette(primary, "triadic");
      expect(palette.harmony.type).toBe("triadic");
      expect(palette.harmony.colors).toHaveLength(3);
    });

    it("generates variations for each harmony color", () => {
      const palette = generateFullPalette(primary, "triadic");
      expect(palette.palettes).toHaveLength(3);

      for (const variations of palette.palettes) {
        expect(variations.base).toBeDefined();
        expect(variations.tints).toHaveLength(5);
        expect(variations.shades).toHaveLength(5);
        expect(variations.tones).toHaveLength(4);
      }
    });

    it("generates text colors for all variations", () => {
      const palette = generateFullPalette(primary, "complementary");

      // complementary has 2 colors
      // Each color has: base + 5 tints + 5 shades + 4 tones = 15 variations
      // Total: 2 * 15 = 30 text colors
      expect(palette.textColors.size).toBe(30);
    });

    it("text colors have correct keys", () => {
      const palette = generateFullPalette(primary, "triadic");

      // Check base text colors
      expect(palette.textColors.has("c0-base")).toBe(true);
      expect(palette.textColors.has("c1-base")).toBe(true);
      expect(palette.textColors.has("c2-base")).toBe(true);

      // Check tint text colors
      expect(palette.textColors.has("c0-l1")).toBe(true);
      expect(palette.textColors.has("c0-l5")).toBe(true);

      // Check shade text colors
      expect(palette.textColors.has("c1-d1")).toBe(true);
      expect(palette.textColors.has("c1-d5")).toBe(true);

      // Check tone text colors
      expect(palette.textColors.has("c2-g1")).toBe(true);
      expect(palette.textColors.has("c2-g4")).toBe(true);
    });

    it("text colors provide adequate contrast", () => {
      const palette = generateFullPalette(primary, "triadic");

      // Check a few text colors for contrast
      const baseText = palette.textColors.get("c0-base");
      const baseColor = palette.palettes[0]!.base;
      expect(baseText).toBeDefined();
      const ratio = getContrastRatio(baseText!, baseColor);
      expect(ratio).toBeGreaterThanOrEqual(4.5); // At least AA
    });

    it("works with all harmony types", () => {
      const types = [
        "complementary",
        "analogous",
        "triadic",
        "split-complementary",
        "tetradic",
        "square",
        "rectangle",
        "aurelian",
        "bi-polar",
        "retrograde",
      ] as const;

      for (const type of types) {
        const palette = generateFullPalette(primary, type);
        expect(palette.harmony.type).toBe(type);
        expect(palette.palettes.length).toBeGreaterThan(0);
        expect(palette.textColors.size).toBeGreaterThan(0);
      }
    });

    it("preserves primary color in harmony", () => {
      const palette = generateFullPalette(primary, "triadic");
      expect(palette.harmony.primary).toBe(primary);
    });
  });

  describe("getTextColorKey", () => {
    it("generates correct key for base", () => {
      expect(getTextColorKey(0, "base")).toBe("c0-base");
      expect(getTextColorKey(1, "base")).toBe("c1-base");
      expect(getTextColorKey(2, "base")).toBe("c2-base");
    });

    it("generates correct key for tints", () => {
      expect(getTextColorKey(0, "l1")).toBe("c0-l1");
      expect(getTextColorKey(1, "l5")).toBe("c1-l5");
    });

    it("generates correct key for shades", () => {
      expect(getTextColorKey(0, "d1")).toBe("c0-d1");
      expect(getTextColorKey(2, "d5")).toBe("c2-d5");
    });

    it("generates correct key for tones", () => {
      expect(getTextColorKey(0, "g1")).toBe("c0-g1");
      expect(getTextColorKey(1, "g4")).toBe("c1-g4");
    });
  });
});
