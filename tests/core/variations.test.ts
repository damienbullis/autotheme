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

    it("each tint is lighter than or equal to the previous (higher OKLCH L)", () => {
      const tints = generateTints(primary);
      for (let i = 1; i < tints.length; i++) {
        expect(tints[i]!.oklch.l).toBeGreaterThanOrEqual(tints[i - 1]!.oklch.l);
      }
    });

    it("tints are strictly lighter until capped", () => {
      // Use a dark color where all 5 tints can increase
      const dark = new Color({ h: 250, s: 100, l: 30, a: 1 });
      const tints = generateTints(dark);
      for (let i = 1; i < tints.length; i++) {
        expect(tints[i]!.oklch.l).toBeGreaterThan(tints[i - 1]!.oklch.l);
      }
    });

    it("all tints are lighter than the base color", () => {
      const tints = generateTints(primary);
      const baseL = primary.oklch.l;
      for (const tint of tints) {
        expect(tint.oklch.l).toBeGreaterThan(baseL);
      }
    });

    it("preserves alpha", () => {
      const semiTransparent = new Color("rgba(100, 57, 255, 0.5)");
      const tints = generateTints(semiTransparent);
      for (const tint of tints) {
        expect(tint.oklch.a).toBeCloseTo(0.5, 2);
      }
    });

    it("lightness does not exceed maximum", () => {
      const light = new Color({ h: 250, s: 100, l: 95, a: 1 });
      const tints = generateTints(light);
      for (const tint of tints) {
        expect(tint.oklch.l).toBeLessThanOrEqual(1.0);
      }
    });

    it("generates custom number of steps", () => {
      const tints = generateTints(primary, 3);
      expect(tints).toHaveLength(3);
    });

    it("each tint is progressively lighter than the base", () => {
      const tints = generateTints(primary);
      const baseL = primary.oklch.l;
      // Each successive tint should be further from base lightness
      for (let i = 1; i < tints.length; i++) {
        expect(tints[i]!.oklch.l - baseL).toBeGreaterThanOrEqual(tints[i - 1]!.oklch.l - baseL);
      }
    });

    it("custom increment produces lighter tints than smaller increment", () => {
      const dark = new Color({ h: 250, s: 100, l: 30, a: 1 });
      const smallInc = generateTints(dark, 3, 5);
      const largeInc = generateTints(dark, 3, 25);
      // Larger increment should produce lighter (or equal) tints
      for (let i = 0; i < 3; i++) {
        expect(largeInc[i]!.oklch.l).toBeGreaterThanOrEqual(smallInc[i]!.oklch.l);
      }
    });
  });

  describe("generateShades", () => {
    it("generates 5 shades by default", () => {
      const shades = generateShades(primary);
      expect(shades).toHaveLength(5);
    });

    it("each shade is darker than the previous (lower OKLCH L)", () => {
      const shades = generateShades(primary);
      for (let i = 1; i < shades.length; i++) {
        expect(shades[i]!.oklch.l).toBeLessThan(shades[i - 1]!.oklch.l);
      }
    });

    it("all shades are darker than the base color", () => {
      const shades = generateShades(primary);
      const baseL = primary.oklch.l;
      for (const shade of shades) {
        expect(shade.oklch.l).toBeLessThan(baseL);
      }
    });

    it("preserves alpha", () => {
      const semiTransparent = new Color("rgba(100, 57, 255, 0.5)");
      const shades = generateShades(semiTransparent);
      for (const shade of shades) {
        expect(shade.oklch.a).toBeCloseTo(0.5, 2);
      }
    });

    it("lightness does not go below zero", () => {
      const dark = new Color({ h: 250, s: 100, l: 15, a: 1 });
      const shades = generateShades(dark);
      for (const shade of shades) {
        expect(shade.oklch.l).toBeGreaterThanOrEqual(0);
      }
    });

    it("generates custom number of steps", () => {
      const shades = generateShades(primary, 3);
      expect(shades).toHaveLength(3);
    });

    it("shades get monotonically darker", () => {
      const shades = generateShades(primary);
      const baseL = primary.oklch.l;
      for (let i = 1; i < shades.length; i++) {
        expect(baseL - shades[i]!.oklch.l).toBeGreaterThanOrEqual(baseL - shades[i - 1]!.oklch.l);
      }
    });

    it("custom increment produces darker shades than smaller increment", () => {
      const shades5 = generateShades(primary, 3, 5);
      const shades25 = generateShades(primary, 3, 25);
      for (let i = 0; i < 3; i++) {
        expect(shades25[i]!.oklch.l).toBeLessThanOrEqual(shades5[i]!.oklch.l);
      }
    });
  });

  describe("generateTones", () => {
    it("generates 4 tones by default", () => {
      const tones = generateTones(primary);
      expect(tones).toHaveLength(4);
    });

    it("each tone has less chroma than the previous (lower OKLCH C)", () => {
      const tones = generateTones(primary);
      for (let i = 1; i < tones.length; i++) {
        expect(tones[i]!.oklch.c).toBeLessThan(tones[i - 1]!.oklch.c);
      }
    });

    it("all tones have less chroma than the base", () => {
      const tones = generateTones(primary);
      const baseC = primary.oklch.c;
      for (const tone of tones) {
        expect(tone.oklch.c).toBeLessThan(baseC);
      }
    });

    it("preserves lightness in OKLCH space", () => {
      const tones = generateTones(primary);
      const baseL = primary.oklch.l;
      for (const tone of tones) {
        expect(tone.oklch.l).toBeCloseTo(baseL, 2);
      }
    });

    it("preserves alpha", () => {
      const semiTransparent = new Color("rgba(100, 57, 255, 0.5)");
      const tones = generateTones(semiTransparent);
      for (const tone of tones) {
        expect(tone.oklch.a).toBeCloseTo(0.5, 2);
      }
    });

    it("chroma does not go below zero", () => {
      const lowSat = new Color({ h: 250, s: 30, l: 50, a: 1 });
      const tones = generateTones(lowSat);
      for (const tone of tones) {
        expect(tone.oklch.c).toBeGreaterThanOrEqual(0);
      }
    });

    it("generates custom number of steps", () => {
      const tones = generateTones(primary, 2);
      expect(tones).toHaveLength(2);
    });

    it("chroma decreases monotonically", () => {
      const tones = generateTones(primary);
      const baseC = primary.oklch.c;
      for (let i = 1; i < tones.length; i++) {
        expect(baseC - tones[i]!.oklch.c).toBeGreaterThanOrEqual(baseC - tones[i - 1]!.oklch.c);
      }
    });

    it("custom increment produces less chromatic tones than smaller increment", () => {
      const tones10 = generateTones(primary, 3, 10);
      const tones30 = generateTones(primary, 3, 30);
      for (let i = 0; i < 3; i++) {
        expect(tones30[i]!.oklch.c).toBeLessThanOrEqual(tones10[i]!.oklch.c);
      }
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
      const baseL = variations.base.oklch.l;
      for (const tint of variations.tints) {
        expect(tint.oklch.l).toBeGreaterThan(baseL);
      }
    });

    it("all shades are darker than base", () => {
      const variations = generatePaletteVariations(primary);
      const baseL = variations.base.oklch.l;
      for (const shade of variations.shades) {
        expect(shade.oklch.l).toBeLessThan(baseL);
      }
    });

    it("all tones are less chromatic than base", () => {
      const variations = generatePaletteVariations(primary);
      const baseC = variations.base.oklch.c;
      for (const tone of variations.tones) {
        expect(tone.oklch.c).toBeLessThan(baseC);
      }
    });

    it("respects custom step counts via options", () => {
      const variations = generatePaletteVariations(primary, {
        tints: 3,
        shades: 7,
        tones: 2,
      });
      expect(variations.tints).toHaveLength(3);
      expect(variations.shades).toHaveLength(7);
      expect(variations.tones).toHaveLength(2);
    });

    it("larger tint increment produces lighter results", () => {
      const dark = new Color({ h: 250, s: 100, l: 30, a: 1 });
      const small = generatePaletteVariations(dark, {
        tints: 2,
        tintIncrement: 5,
      });
      const large = generatePaletteVariations(dark, {
        tints: 2,
        tintIncrement: 15,
      });
      // Each tint with larger increment should be at least as light
      for (let i = 0; i < 2; i++) {
        expect(large.tints[i]!.oklch.l).toBeGreaterThanOrEqual(small.tints[i]!.oklch.l);
      }
    });
  });
});
