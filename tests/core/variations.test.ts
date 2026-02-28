import { describe, it, expect } from "vitest";
import { Color } from "../../src/core/color";
import {
  generateTints,
  generateShades,
  generateTones,
  generatePaletteVariations,
} from "../../src/core/variations";

describe("Palette Variations", () => {
  const primary = new Color("#6439FF");

  describe("generateTints", () => {
    it("generates 5 tints by default", () => {
      const tints = generateTints(primary);
      expect(tints).toHaveLength(5);
    });

    it("each tint is lighter than or equal to the previous (capped at 100)", () => {
      const tints = generateTints(primary);
      for (let i = 1; i < tints.length; i++) {
        expect(tints[i]!.hsl.l).toBeGreaterThanOrEqual(tints[i - 1]!.hsl.l);
      }
    });

    it("tints are strictly lighter until capped at 100", () => {
      // Use a dark color where all 5 tints can increase
      const dark = new Color({ h: 250, s: 100, l: 30, a: 1 });
      const tints = generateTints(dark);
      // With L=30, tints will be 40, 50, 60, 70, 80 - all strictly increasing
      for (let i = 1; i < tints.length; i++) {
        expect(tints[i]!.hsl.l).toBeGreaterThan(tints[i - 1]!.hsl.l);
      }
    });

    it("preserves hue and saturation", () => {
      const tints = generateTints(primary);
      const baseHsl = primary.hsl;
      for (const tint of tints) {
        expect(tint.hsl.h).toBeCloseTo(baseHsl.h, 0);
        expect(tint.hsl.s).toBeCloseTo(baseHsl.s, 0);
      }
    });

    it("preserves alpha", () => {
      const semiTransparent = new Color("rgba(100, 57, 255, 0.5)");
      const tints = generateTints(semiTransparent);
      for (const tint of tints) {
        expect(tint.hsl.a).toBeCloseTo(0.5, 2);
      }
    });

    it("caps lightness at 100", () => {
      const light = new Color({ h: 250, s: 100, l: 95, a: 1 });
      const tints = generateTints(light);
      for (const tint of tints) {
        expect(tint.hsl.l).toBeLessThanOrEqual(100);
      }
    });

    it("generates custom number of steps", () => {
      const tints = generateTints(primary, 3);
      expect(tints).toHaveLength(3);
    });

    it("increases lightness by 10 per step", () => {
      const tints = generateTints(primary);
      const baseL = primary.hsl.l;
      expect(tints[0]!.hsl.l).toBeCloseTo(baseL + 10, 0);
      expect(tints[1]!.hsl.l).toBeCloseTo(baseL + 20, 0);
    });
  });

  describe("generateShades", () => {
    it("generates 5 shades by default", () => {
      const shades = generateShades(primary);
      expect(shades).toHaveLength(5);
    });

    it("each shade is darker than the previous", () => {
      const shades = generateShades(primary);
      for (let i = 1; i < shades.length; i++) {
        expect(shades[i]!.hsl.l).toBeLessThan(shades[i - 1]!.hsl.l);
      }
    });

    it("preserves hue and saturation", () => {
      const shades = generateShades(primary);
      const baseHsl = primary.hsl;
      for (const shade of shades) {
        expect(shade.hsl.h).toBeCloseTo(baseHsl.h, 0);
        expect(shade.hsl.s).toBeCloseTo(baseHsl.s, 0);
      }
    });

    it("preserves alpha", () => {
      const semiTransparent = new Color("rgba(100, 57, 255, 0.5)");
      const shades = generateShades(semiTransparent);
      for (const shade of shades) {
        expect(shade.hsl.a).toBeCloseTo(0.5, 2);
      }
    });

    it("floors lightness at 0", () => {
      const dark = new Color({ h: 250, s: 100, l: 15, a: 1 });
      const shades = generateShades(dark);
      for (const shade of shades) {
        expect(shade.hsl.l).toBeGreaterThanOrEqual(0);
      }
    });

    it("generates custom number of steps", () => {
      const shades = generateShades(primary, 3);
      expect(shades).toHaveLength(3);
    });

    it("decreases lightness by 10 per step", () => {
      const shades = generateShades(primary);
      const baseL = primary.hsl.l;
      expect(shades[0]!.hsl.l).toBeCloseTo(baseL - 10, 0);
      expect(shades[1]!.hsl.l).toBeCloseTo(baseL - 20, 0);
    });
  });

  describe("generateTones", () => {
    it("generates 4 tones by default", () => {
      const tones = generateTones(primary);
      expect(tones).toHaveLength(4);
    });

    it("each tone is less saturated than the previous", () => {
      const tones = generateTones(primary);
      for (let i = 1; i < tones.length; i++) {
        expect(tones[i]!.hsl.s).toBeLessThan(tones[i - 1]!.hsl.s);
      }
    });

    it("preserves hue and lightness", () => {
      const tones = generateTones(primary);
      const baseHsl = primary.hsl;
      for (const tone of tones) {
        expect(tone.hsl.h).toBeCloseTo(baseHsl.h, 0);
        expect(tone.hsl.l).toBeCloseTo(baseHsl.l, 0);
      }
    });

    it("preserves alpha", () => {
      const semiTransparent = new Color("rgba(100, 57, 255, 0.5)");
      const tones = generateTones(semiTransparent);
      for (const tone of tones) {
        expect(tone.hsl.a).toBeCloseTo(0.5, 2);
      }
    });

    it("floors saturation at 0", () => {
      const lowSat = new Color({ h: 250, s: 30, l: 50, a: 1 });
      const tones = generateTones(lowSat);
      for (const tone of tones) {
        expect(tone.hsl.s).toBeGreaterThanOrEqual(0);
      }
    });

    it("generates custom number of steps", () => {
      const tones = generateTones(primary, 2);
      expect(tones).toHaveLength(2);
    });

    it("decreases saturation by 20 per step", () => {
      const tones = generateTones(primary);
      const baseS = primary.hsl.s;
      expect(tones[0]!.hsl.s).toBeCloseTo(baseS - 20, 0);
      expect(tones[1]!.hsl.s).toBeCloseTo(baseS - 40, 0);
    });
  });

  describe("generatePaletteVariations", () => {
    it("returns all variation types", () => {
      const variations = generatePaletteVariations(primary);
      expect(variations.base).toBeDefined();
      expect(variations.tints).toBeDefined();
      expect(variations.shades).toBeDefined();
      expect(variations.tones).toBeDefined();
    });

    it("base color equals input color", () => {
      const variations = generatePaletteVariations(primary);
      expect(variations.base.hex).toBe(primary.hex);
    });

    it("generates correct number of each variation", () => {
      const variations = generatePaletteVariations(primary);
      expect(variations.tints).toHaveLength(5);
      expect(variations.shades).toHaveLength(5);
      expect(variations.tones).toHaveLength(4);
    });

    it("all tints are lighter than base", () => {
      const variations = generatePaletteVariations(primary);
      const baseL = variations.base.hsl.l;
      for (const tint of variations.tints) {
        expect(tint.hsl.l).toBeGreaterThan(baseL);
      }
    });

    it("all shades are darker than base", () => {
      const variations = generatePaletteVariations(primary);
      const baseL = variations.base.hsl.l;
      for (const shade of variations.shades) {
        expect(shade.hsl.l).toBeLessThan(baseL);
      }
    });

    it("all tones are less saturated than base", () => {
      const variations = generatePaletteVariations(primary);
      const baseS = variations.base.hsl.s;
      for (const tone of variations.tones) {
        expect(tone.hsl.s).toBeLessThan(baseS);
      }
    });
  });
});
