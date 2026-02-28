import { describe, it, expect } from "vitest";
import { Color } from "../../src/core/color";
import {
  generateHarmony,
  generateCustomHarmony,
  normalizeHue,
  getHarmonyTypes,
  HARMONY_DEFINITIONS,
} from "../../src/core/harmonies";
import type { HarmonyType } from "../../src/core/types";

describe("Harmony Generation", () => {
  const primary = new Color("#6439FF");

  describe("normalizeHue", () => {
    it("returns same value for hue within 0-360", () => {
      expect(normalizeHue(180)).toBe(180);
      expect(normalizeHue(0)).toBe(0);
      expect(normalizeHue(359)).toBe(359);
    });

    it("wraps hue greater than 360", () => {
      expect(normalizeHue(360)).toBe(0);
      expect(normalizeHue(450)).toBe(90);
      expect(normalizeHue(720)).toBe(0);
    });

    it("wraps negative hue", () => {
      expect(normalizeHue(-30)).toBe(330);
      expect(normalizeHue(-120)).toBe(240);
      expect(normalizeHue(-360)).toBe(0);
    });
  });

  describe("generateHarmony", () => {
    it("generates complementary harmony (2 colors, 180° apart)", () => {
      const result = generateHarmony(primary, "complementary");
      expect(result.type).toBe("complementary");
      expect(result.colors).toHaveLength(2);
      expect(result.primary).toBe(primary);

      // First color should match primary hue
      expect(result.colors[0]!.hsl.h).toBeCloseTo(primary.hsl.h, 0);
      // Second color should be 180° from primary
      const hueDiff = Math.abs(result.colors[1]!.hsl.h - result.colors[0]!.hsl.h);
      expect(hueDiff).toBeCloseTo(180, 0);
    });

    it("generates analogous harmony (3 colors, 30° apart)", () => {
      const result = generateHarmony(primary, "analogous");
      expect(result.type).toBe("analogous");
      expect(result.colors).toHaveLength(3);

      // Colors should be at -30, 0, +30 from primary
      const hues = result.colors.map((c) => c.hsl.h);
      // Middle color should be primary
      expect(hues[1]).toBeCloseTo(primary.hsl.h, 0);
    });

    it("generates triadic harmony (3 colors, 120° apart)", () => {
      const result = generateHarmony(primary, "triadic");
      expect(result.type).toBe("triadic");
      expect(result.colors).toHaveLength(3);

      // Colors should be 120° apart
      const hues = result.colors.map((c) => c.hsl.h);
      expect(normalizeHue(hues[1]! - hues[0]!)).toBeCloseTo(120, 0);
      expect(normalizeHue(hues[2]! - hues[1]!)).toBeCloseTo(120, 0);
    });

    it("generates split-complementary harmony (3 colors)", () => {
      const result = generateHarmony(primary, "split-complementary");
      expect(result.type).toBe("split-complementary");
      expect(result.colors).toHaveLength(3);
    });

    it("generates piroku harmony (4 colors)", () => {
      const result = generateHarmony(primary, "piroku");
      expect(result.type).toBe("piroku");
      expect(result.colors).toHaveLength(4);
    });

    it("generates square harmony (4 colors, 90° apart)", () => {
      const result = generateHarmony(primary, "square");
      expect(result.type).toBe("square");
      expect(result.colors).toHaveLength(4);

      // Colors should be 90° apart
      const hues = result.colors.map((c) => c.hsl.h);
      expect(normalizeHue(hues[1]! - hues[0]!)).toBeCloseTo(90, 0);
      expect(normalizeHue(hues[2]! - hues[1]!)).toBeCloseTo(90, 0);
      expect(normalizeHue(hues[3]! - hues[2]!)).toBeCloseTo(90, 0);
    });

    it("generates rectangle harmony (4 colors)", () => {
      const result = generateHarmony(primary, "rectangle");
      expect(result.type).toBe("rectangle");
      expect(result.colors).toHaveLength(4);
    });

    it("generates aurelian harmony (3 colors, golden angle)", () => {
      const result = generateHarmony(primary, "aurelian");
      expect(result.type).toBe("aurelian");
      expect(result.colors).toHaveLength(3);

      // Second color should be 137.5° from primary
      const hues = result.colors.map((c) => c.hsl.h);
      expect(normalizeHue(hues[1]! - hues[0]!)).toBeCloseTo(137.5, 0);
    });

    it("generates bi-polar harmony (2 colors, 90° apart)", () => {
      const result = generateHarmony(primary, "bi-polar");
      expect(result.type).toBe("bi-polar");
      expect(result.colors).toHaveLength(2);

      const hues = result.colors.map((c) => c.hsl.h);
      expect(normalizeHue(hues[1]! - hues[0]!)).toBeCloseTo(90, 0);
    });

    it("generates retrograde harmony (3 colors)", () => {
      const result = generateHarmony(primary, "retrograde");
      expect(result.type).toBe("retrograde");
      expect(result.colors).toHaveLength(3);
    });

    it("preserves saturation and lightness in all harmony colors", () => {
      const result = generateHarmony(primary, "triadic");
      const primaryHsl = primary.hsl;

      for (const color of result.colors) {
        expect(color.hsl.s).toBeCloseTo(primaryHsl.s, 0);
        expect(color.hsl.l).toBeCloseTo(primaryHsl.l, 0);
        expect(color.hsl.a).toBe(primaryHsl.a);
      }
    });

    it("preserves alpha in harmony colors", () => {
      const semiTransparent = new Color("rgba(100, 57, 255, 0.5)");
      const result = generateHarmony(semiTransparent, "triadic");

      for (const color of result.colors) {
        expect(color.hsl.a).toBeCloseTo(0.5, 2);
      }
    });
  });

  describe("getHarmonyTypes", () => {
    it("returns all 10 harmony types", () => {
      const types = getHarmonyTypes();
      expect(types).toHaveLength(10);
    });

    it("includes all expected harmony types", () => {
      const types = getHarmonyTypes();
      const expected: HarmonyType[] = [
        "complementary",
        "analogous",
        "triadic",
        "split-complementary",
        "piroku",
        "square",
        "rectangle",
        "aurelian",
        "bi-polar",
        "retrograde",
      ];

      for (const type of expected) {
        expect(types).toContain(type);
      }
    });
  });

  describe("HARMONY_DEFINITIONS", () => {
    it("has definitions for all 10 harmony types", () => {
      expect(Object.keys(HARMONY_DEFINITIONS)).toHaveLength(10);
    });

    it("complementary generates offsets [0, 180]", () => {
      const def = HARMONY_DEFINITIONS.complementary;
      expect(def.count).toBe(2);
      expect(def.offset(0)).toBe(0);
      expect(def.offset(1)).toBe(180);
    });

    it("triadic generates offsets [0, 120, 240]", () => {
      const def = HARMONY_DEFINITIONS.triadic;
      expect(def.count).toBe(3);
      expect(def.offset(0)).toBe(0);
      expect(def.offset(1)).toBe(120);
      expect(def.offset(2)).toBe(240);
    });

    it("square and piroku have 4 colors each", () => {
      const square = HARMONY_DEFINITIONS.square;
      const piroku = HARMONY_DEFINITIONS.piroku;
      expect(square.count).toBe(4);
      expect(piroku.count).toBe(4);
    });

    it("all definitions have valid count and offset function", () => {
      for (const [_type, def] of Object.entries(HARMONY_DEFINITIONS)) {
        expect(def.count).toBeGreaterThan(0);
        expect(typeof def.offset).toBe("function");
        // Ensure offset function returns numbers
        for (let i = 0; i < def.count; i++) {
          expect(typeof def.offset(i)).toBe("number");
        }
      }
    });
  });

  describe("generateCustomHarmony", () => {
    it("generates custom harmony with user-defined offset function", () => {
      const primary = new Color("#6439FF");
      const result = generateCustomHarmony(primary, 4, (i) => i * 45);

      expect(result.type).toBe("custom");
      expect(result.colors).toHaveLength(4);
      expect(result.primary).toBe(primary);

      // Verify offsets: 0, 45, 90, 135
      const baseHue = primary.hsl.h;
      expect(result.colors[0]!.hsl.h).toBeCloseTo(normalizeHue(baseHue + 0), 0);
      expect(result.colors[1]!.hsl.h).toBeCloseTo(normalizeHue(baseHue + 45), 0);
      expect(result.colors[2]!.hsl.h).toBeCloseTo(normalizeHue(baseHue + 90), 0);
      expect(result.colors[3]!.hsl.h).toBeCloseTo(normalizeHue(baseHue + 135), 0);
    });

    it("preserves saturation and lightness", () => {
      const primary = new Color("#6439FF");
      const result = generateCustomHarmony(primary, 3, (i) => i * 60);

      for (const color of result.colors) {
        expect(color.hsl.s).toBeCloseTo(primary.hsl.s, 0);
        expect(color.hsl.l).toBeCloseTo(primary.hsl.l, 0);
      }
    });

    it("handles negative offsets", () => {
      const primary = new Color("#6439FF");
      const result = generateCustomHarmony(primary, 3, (i) => (i - 1) * 30);

      expect(result.colors).toHaveLength(3);
      // Offsets should be -30, 0, 30
      const baseHue = primary.hsl.h;
      expect(result.colors[0]!.hsl.h).toBeCloseTo(normalizeHue(baseHue - 30), 0);
      expect(result.colors[1]!.hsl.h).toBeCloseTo(baseHue, 0);
      expect(result.colors[2]!.hsl.h).toBeCloseTo(normalizeHue(baseHue + 30), 0);
    });

    it("can recreate built-in harmonies", () => {
      const primary = new Color("#6439FF");

      // Recreate triadic using custom function
      const builtIn = generateHarmony(primary, "triadic");
      const custom = generateCustomHarmony(primary, 3, (i) => i * 120);

      expect(custom.colors).toHaveLength(builtIn.colors.length);
      for (let i = 0; i < custom.colors.length; i++) {
        expect(custom.colors[i]!.hsl.h).toBeCloseTo(builtIn.colors[i]!.hsl.h, 0);
      }
    });
  });
});
