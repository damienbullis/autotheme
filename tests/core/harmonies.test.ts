import { describe, it, expect } from "vitest";
import { Color } from "../../src/core/color";
import {
  generateHarmony,
  generateCustomHarmony,
  createHarmonyFromOffsets,
  normalizeHue,
  getHarmonyTypes,
  HARMONY_DEFINITIONS,
  applySwing,
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

      // First color should be primary (offset 0), neighbors at -30 and +30
      const hues = result.colors.map((c) => c.hsl.h);
      expect(hues[0]).toBeCloseTo(primary.hsl.h, 0);
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

    it("generates drift harmony with golden-angle-based tighter spread", () => {
      const result = generateHarmony(primary, "drift");
      expect(result.type).toBe("drift");
      expect(result.colors).toHaveLength(4);

      // Drift uses golden angle / count: offsets are [0, 34.377, 68.754, 103.131]
      const hues = result.colors.map((c) => c.hsl.h);
      const baseHue = primary.hsl.h;
      expect(hues[0]).toBeCloseTo(baseHue, 0);
      expect(normalizeHue(hues[1]! - baseHue)).toBeCloseTo(34.4, 0);
      expect(normalizeHue(hues[2]! - baseHue)).toBeCloseTo(68.8, 0);
      expect(normalizeHue(hues[3]! - baseHue)).toBeCloseTo(103.1, 0);
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
        "drift",
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

    it("square and drift have 4 colors each", () => {
      const square = HARMONY_DEFINITIONS.square;
      const drift = HARMONY_DEFINITIONS.drift;
      expect(square.count).toBe(4);
      expect(drift.count).toBe(4);
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

  describe("applySwing", () => {
    it("returns offset unchanged when swing is 1.0", () => {
      expect(applySwing(90, 1, 1.0, "linear")).toBe(90);
      expect(applySwing(120, 2, 1.0, "exponential")).toBe(120);
      expect(applySwing(45, 3, 1.0, "alternating")).toBe(45);
    });

    it("never modifies offset for index 0 regardless of swing or strategy", () => {
      expect(applySwing(90, 0, 2.0, "linear")).toBe(90);
      expect(applySwing(90, 0, 0.5, "linear")).toBe(90);
      expect(applySwing(90, 0, 3.0, "exponential")).toBe(90);
      expect(applySwing(90, 0, 2.0, "alternating")).toBe(90);
    });

    it("linear strategy multiplies offset by swing", () => {
      expect(applySwing(90, 1, 1.5, "linear")).toBe(135);
      expect(applySwing(90, 1, 0.5, "linear")).toBe(45);
    });

    it("exponential strategy applies swing^index", () => {
      expect(applySwing(90, 0, 2, "exponential")).toBe(90); // 90 * 2^0 = 90
      expect(applySwing(90, 1, 2, "exponential")).toBe(180); // 90 * 2^1 = 180
      expect(applySwing(90, 2, 2, "exponential")).toBe(360); // 90 * 2^2 = 360
    });

    it("alternating strategy divides even indices and multiplies odd", () => {
      expect(applySwing(90, 0, 2, "alternating")).toBe(90); // index 0: never modified
      expect(applySwing(90, 1, 2, "alternating")).toBe(180); // odd: 90 * 2
      expect(applySwing(90, 2, 2, "alternating")).toBe(45); // even: 90 / 2
      expect(applySwing(90, 3, 2, "alternating")).toBe(180); // odd: 90 * 2
    });
  });

  describe("swing with generateHarmony", () => {
    it("swing 1.0 produces identical results to no swing", () => {
      const noSwing = generateHarmony(primary, "triadic");
      const withSwing = generateHarmony(primary, "triadic", { swing: 1.0 });

      for (let i = 0; i < noSwing.colors.length; i++) {
        expect(withSwing.colors[i]!.hsl.h).toBeCloseTo(noSwing.colors[i]!.hsl.h, 5);
      }
    });

    it("swing < 1 clusters colors closer together", () => {
      const normal = generateHarmony(primary, "triadic");
      const clustered = generateHarmony(primary, "triadic", { swing: 0.5 });

      // Second color offset is halved
      const normalDiff = Math.abs(normal.colors[1]!.hsl.h - normal.colors[0]!.hsl.h);
      const clusteredDiff = Math.abs(clustered.colors[1]!.hsl.h - clustered.colors[0]!.hsl.h);
      expect(clusteredDiff).toBeLessThan(normalDiff);
    });

    it("swing > 1 spreads colors further apart", () => {
      const normal = generateHarmony(primary, "complementary");
      const spread = generateHarmony(primary, "complementary", { swing: 1.5 });

      // For complementary: offset(1) = 180, with swing 1.5 = 270
      const normalHue1 = normal.colors[1]!.hsl.h;
      const spreadHue1 = spread.colors[1]!.hsl.h;
      // They should differ
      expect(spreadHue1).not.toBeCloseTo(normalHue1, 0);
    });

    it("primary color stays the same regardless of swing", () => {
      const result = generateHarmony(primary, "triadic", { swing: 2.0 });
      // Index 0 offset is 0, so swing doesn't change it
      expect(result.colors[0]!.hsl.h).toBeCloseTo(primary.hsl.h, 0);
    });

    it("exponential strategy progressively adjusts later colors", () => {
      const result = generateHarmony(primary, "triadic", {
        swing: 0.5,
        swingStrategy: "exponential",
      });
      // Index 0: offset * 0.5^0 = offset (unchanged)
      // Index 1: offset * 0.5^1 = offset * 0.5
      // Index 2: offset * 0.5^2 = offset * 0.25
      expect(result.colors[0]!.hsl.h).toBeCloseTo(primary.hsl.h, 0);
      expect(result.colors).toHaveLength(3);
    });

    it("alternating strategy applies different swing to even/odd", () => {
      const result = generateHarmony(primary, "square", {
        swing: 2.0,
        swingStrategy: "alternating",
      });
      expect(result.colors).toHaveLength(4);
    });
  });

  describe("swing with generateCustomHarmony", () => {
    it("applies swing to custom harmony", () => {
      const noSwing = generateCustomHarmony(primary, 3, (i) => i * 60);
      const withSwing = generateCustomHarmony(primary, 3, (i) => i * 60, { swing: 2.0 });

      // Index 1: offset 60 * 2 = 120
      const noSwingDiff = normalizeHue(noSwing.colors[1]!.hsl.h - noSwing.colors[0]!.hsl.h);
      const swingDiff = normalizeHue(withSwing.colors[1]!.hsl.h - withSwing.colors[0]!.hsl.h);
      expect(swingDiff).toBeCloseTo(noSwingDiff * 2, 0);
    });
  });

  describe("createHarmonyFromOffsets", () => {
    it("creates a HarmonyDefinition from offset array", () => {
      const def = createHarmonyFromOffsets([0, 90, 180, 270]);
      expect(def.count).toBe(4);
      expect(def.offset(0)).toBe(0);
      expect(def.offset(1)).toBe(90);
      expect(def.offset(2)).toBe(180);
      expect(def.offset(3)).toBe(270);
    });

    it("handles 2-element offset array", () => {
      const def = createHarmonyFromOffsets([0, 180]);
      expect(def.count).toBe(2);
      expect(def.offset(0)).toBe(0);
      expect(def.offset(1)).toBe(180);
    });

    it("handles out-of-bounds index gracefully", () => {
      const def = createHarmonyFromOffsets([0, 60]);
      expect(def.offset(5)).toBe(0); // defaults to 0
    });
  });

  describe("generateHarmony with custom definitions", () => {
    it("uses custom definition when type matches", () => {
      const customDefs = {
        "warm-quad": createHarmonyFromOffsets([0, 30, 60, 180]),
      };
      const result = generateHarmony(primary, "warm-quad", { customDefinitions: customDefs });
      expect(result.type).toBe("warm-quad");
      expect(result.colors).toHaveLength(4);
    });

    it("built-in takes precedence over custom with same name", () => {
      const customDefs = {
        triadic: createHarmonyFromOffsets([0, 45, 90]),
      };
      const result = generateHarmony(primary, "triadic", { customDefinitions: customDefs });
      // Built-in triadic has 120° offsets, not 45°
      const hues = result.colors.map((c) => c.hsl.h);
      expect(normalizeHue(hues[1]! - hues[0]!)).toBeCloseTo(120, 0);
    });

    it("throws for unknown harmony when no custom match", () => {
      expect(() => generateHarmony(primary, "nonexistent")).toThrow(
        'Unknown harmony type: "nonexistent"',
      );
    });

    it("throws for unknown harmony even with custom definitions", () => {
      const customDefs = {
        "my-harmony": createHarmonyFromOffsets([0, 72, 144]),
      };
      expect(() =>
        generateHarmony(primary, "nonexistent", { customDefinitions: customDefs }),
      ).toThrow('Unknown harmony type: "nonexistent"');
    });

    it("applies swing to custom harmony definition", () => {
      const customDefs = {
        "wide-tri": createHarmonyFromOffsets([0, 60, 120]),
      };
      const noSwing = generateHarmony(primary, "wide-tri", { customDefinitions: customDefs });
      const withSwing = generateHarmony(primary, "wide-tri", {
        customDefinitions: customDefs,
        swing: 2.0,
      });
      const noSwingDiff = normalizeHue(noSwing.colors[1]!.hsl.h - noSwing.colors[0]!.hsl.h);
      const swingDiff = normalizeHue(withSwing.colors[1]!.hsl.h - withSwing.colors[0]!.hsl.h);
      expect(swingDiff).toBeCloseTo(noSwingDiff * 2, 0);
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
