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

    it("light background is very light (96% lightness)", () => {
      const primary = new Color("#6439FF");
      const backgrounds = generateBackgroundColors(primary);

      expect(backgrounds.light.hsl.l).toBe(96);
    });

    it("dark background is very dark (5% lightness)", () => {
      const primary = new Color("#6439FF");
      const backgrounds = generateBackgroundColors(primary);

      expect(backgrounds.dark.hsl.l).toBe(5);
    });

    it("preserves hue from primary color", () => {
      const primary = new Color("#6439FF");
      const backgrounds = generateBackgroundColors(primary);
      const primaryHue = primary.hsl.h;

      expect(backgrounds.light.hsl.h).toBe(primaryHue);
      expect(backgrounds.dark.hsl.h).toBe(primaryHue);
    });

    it("light background has reduced saturation", () => {
      const primary = new Color("#6439FF");
      const backgrounds = generateBackgroundColors(primary);
      const primarySat = primary.hsl.s;

      // Light background saturation is min(20, primarySat * 0.3)
      const expectedLightSat = Math.min(20, primarySat * 0.3);
      expect(backgrounds.light.hsl.s).toBeCloseTo(expectedLightSat, 0);
    });

    it("dark background has reduced saturation", () => {
      const primary = new Color("#6439FF");
      const backgrounds = generateBackgroundColors(primary);
      const primarySat = primary.hsl.s;

      // Dark background saturation is min(30, primarySat * 0.4)
      const expectedDarkSat = Math.min(30, primarySat * 0.4);
      expect(backgrounds.dark.hsl.s).toBeCloseTo(expectedDarkSat, 0);
    });

    it("caps light background saturation at 20", () => {
      const saturated = new Color({ h: 250, s: 100, l: 50, a: 1 });
      const backgrounds = generateBackgroundColors(saturated);

      expect(backgrounds.light.hsl.s).toBeLessThanOrEqual(20);
    });

    it("caps dark background saturation at 30", () => {
      const saturated = new Color({ h: 250, s: 100, l: 50, a: 1 });
      const backgrounds = generateBackgroundColors(saturated);

      expect(backgrounds.dark.hsl.s).toBeLessThanOrEqual(30);
    });

    it("handles low saturation colors", () => {
      const gray = new Color({ h: 0, s: 5, l: 50, a: 1 });
      const backgrounds = generateBackgroundColors(gray);

      // With low saturation, should use actual calculated value
      expect(backgrounds.light.hsl.s).toBeCloseTo(1.5, 0); // 5 * 0.3
      expect(backgrounds.dark.hsl.s).toBeCloseTo(2, 0); // 5 * 0.4
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

        expect(backgrounds.light.hsl.l).toBe(96);
        expect(backgrounds.dark.hsl.l).toBe(5);
        expect(backgrounds.light.hsl.h).toBe(primary.hsl.h);
        expect(backgrounds.dark.hsl.h).toBe(primary.hsl.h);
      }
    });
  });
});
