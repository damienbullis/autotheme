import { describe, it, expect } from "vitest";
import { Color } from "../../src/core/color";
import { generateBackgroundColors } from "../../src/core/background";

describe("Background Color Generation", () => {
  describe("generateBackgroundColors", () => {
    it("generates light and dark backgrounds", () => {
      const primary = new Color("#6439FF");
      const backgrounds = generateBackgroundColors(primary);

      expect(backgrounds.light).toBeInstanceOf(Color);
      expect(backgrounds.dark).toBeInstanceOf(Color);
    });

    it("light background is very light (high OKLCH lightness)", () => {
      const primary = new Color("#6439FF");
      const backgrounds = generateBackgroundColors(primary);

      // OKLCH L close to 1 means very light; HSL l=96 maps to roughly 0.97+ in OKLCH
      expect(backgrounds.light.oklch.l).toBeGreaterThan(0.95);
      expect(backgrounds.light.oklch.l).toBeLessThanOrEqual(1);
      // Also verify via HSL with tolerance for round-trip conversion
      expect(backgrounds.light.hsl.l).toBeGreaterThan(91);
      expect(backgrounds.light.hsl.l).toBeLessThanOrEqual(100);
    });

    it("dark background is very dark (low OKLCH lightness)", () => {
      const primary = new Color("#6439FF");
      const backgrounds = generateBackgroundColors(primary);

      // OKLCH L close to 0 means very dark; HSL l=5 maps to roughly 0.05 in OKLCH
      expect(backgrounds.dark.oklch.l).toBeGreaterThanOrEqual(0);
      expect(backgrounds.dark.oklch.l).toBeLessThan(0.15);
      // Also verify via HSL with tolerance
      expect(backgrounds.dark.hsl.l).toBeGreaterThanOrEqual(0);
      expect(backgrounds.dark.hsl.l).toBeLessThan(10);
    });

    it("preserves hue approximately from primary color", () => {
      const primary = new Color("#6439FF");
      const backgrounds = generateBackgroundColors(primary);
      const primaryHsl = primary.hsl.h;

      // When chroma is very low (nearly achromatic colors like light/dark backgrounds),
      // OKLCH hue becomes unreliable. Instead, verify via HSL hue which is what
      // background.ts uses as input. The round-trip HSL->OKLCH->HSL can shift hue,
      // especially for near-achromatic colors, so we allow a generous tolerance.
      const lightHueDiff = Math.abs(backgrounds.light.hsl.h - primaryHsl);
      const darkHueDiff = Math.abs(backgrounds.dark.hsl.h - primaryHsl);
      // Account for hue wrapping around 360
      const lightHueWrapped = Math.min(lightHueDiff, 360 - lightHueDiff);
      const darkHueWrapped = Math.min(darkHueDiff, 360 - darkHueDiff);

      expect(lightHueWrapped).toBeLessThan(20);
      expect(darkHueWrapped).toBeLessThan(20);
    });

    it("light background has low saturation (small OKLCH chroma)", () => {
      const primary = new Color("#6439FF");
      const backgrounds = generateBackgroundColors(primary);

      // Light background should have very low chroma (desaturated)
      expect(backgrounds.light.oklch.c).toBeLessThan(0.05);
    });

    it("dark background has low saturation (small OKLCH chroma)", () => {
      const primary = new Color("#6439FF");
      const backgrounds = generateBackgroundColors(primary);

      // Dark background should have low chroma (desaturated)
      expect(backgrounds.dark.oklch.c).toBeLessThan(0.08);
    });

    it("caps light background saturation for highly saturated colors", () => {
      const saturated = new Color({ h: 250, s: 100, l: 50, a: 1 });
      const backgrounds = generateBackgroundColors(saturated);

      // The light background chroma should be very small even for fully saturated input
      expect(backgrounds.light.oklch.c).toBeLessThan(0.05);
      // HSL saturation should be approximately capped around 20 (with round-trip tolerance)
      expect(backgrounds.light.hsl.s).toBeLessThan(25);
    });

    it("caps dark background saturation for highly saturated colors", () => {
      const saturated = new Color({ h: 250, s: 100, l: 50, a: 1 });
      const backgrounds = generateBackgroundColors(saturated);

      // The dark background chroma should be small even for fully saturated input
      expect(backgrounds.dark.oklch.c).toBeLessThan(0.08);
      // HSL saturation should be approximately capped around 30 (with round-trip tolerance)
      expect(backgrounds.dark.hsl.s).toBeLessThan(35);
    });

    it("handles low saturation colors with near-zero chroma", () => {
      const gray = new Color({ h: 0, s: 5, l: 50, a: 1 });
      const backgrounds = generateBackgroundColors(gray);

      // With very low input saturation, output chroma should be near zero
      expect(backgrounds.light.oklch.c).toBeLessThan(0.02);
      expect(backgrounds.dark.oklch.c).toBeLessThan(0.02);
    });

    it("sets alpha to 1 for both backgrounds", () => {
      const semiTransparent = new Color("rgba(100, 57, 255, 0.5)");
      const backgrounds = generateBackgroundColors(semiTransparent);

      expect(backgrounds.light.hsl.a).toBe(1);
      expect(backgrounds.dark.hsl.a).toBe(1);
    });

    it("produces valid hex colors", () => {
      const primary = new Color("#ff5733");
      const backgrounds = generateBackgroundColors(primary);

      expect(backgrounds.light.hex).toMatch(/^#[0-9a-f]{6}$/);
      expect(backgrounds.dark.hex).toMatch(/^#[0-9a-f]{6}$/);
    });

    it("works with different primary colors", () => {
      const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff"];

      for (const hex of colors) {
        const primary = new Color(hex);
        const backgrounds = generateBackgroundColors(primary);

        // Light background should be very light
        expect(backgrounds.light.oklch.l).toBeGreaterThan(0.95);
        // Dark background should be very dark
        expect(backgrounds.dark.oklch.l).toBeLessThan(0.2);
        // Both should have low chroma (desaturated)
        expect(backgrounds.light.oklch.c).toBeLessThan(0.05);
        expect(backgrounds.dark.oklch.c).toBeLessThan(0.08);
      }
    });
  });
});
