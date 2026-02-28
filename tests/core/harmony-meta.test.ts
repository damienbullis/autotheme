import { describe, it, expect } from "vitest";
import { HARMONY_META, getHarmonyMeta, getAllHarmonyMeta } from "../../src/core/harmony-meta";
import type { HarmonyType } from "../../src/core/types";

describe("Harmony Metadata", () => {
  describe("HARMONY_META", () => {
    it("has 10 harmony types", () => {
      expect(HARMONY_META).toHaveLength(10);
    });

    it("each entry has required properties", () => {
      for (const meta of HARMONY_META) {
        expect(meta.type).toBeDefined();
        expect(meta.name).toBeDefined();
        expect(meta.description).toBeDefined();
        expect(meta.colorCount).toBeGreaterThan(0);
      }
    });

    it("colorCounts match expected values", () => {
      const counts: Record<HarmonyType, number> = {
        complementary: 2,
        analogous: 3,
        triadic: 3,
        "split-complementary": 3,
        piroku: 4,
        square: 4,
        rectangle: 4,
        aurelian: 3,
        "bi-polar": 2,
        retrograde: 3,
      };

      for (const meta of HARMONY_META) {
        expect(meta.colorCount).toBe(counts[meta.type]);
      }
    });
  });

  describe("getHarmonyMeta", () => {
    it("returns metadata for valid harmony type", () => {
      const meta = getHarmonyMeta("triadic");
      expect(meta).toBeDefined();
      expect(meta?.type).toBe("triadic");
      expect(meta?.name).toBe("Triadic");
      expect(meta?.colorCount).toBe(3);
    });

    it("returns undefined for invalid harmony type", () => {
      // Cast to any to test invalid input
      const meta = getHarmonyMeta("invalid" as HarmonyType);
      expect(meta).toBeUndefined();
    });

    it("returns correct metadata for all harmony types", () => {
      const types: HarmonyType[] = [
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

      for (const type of types) {
        const meta = getHarmonyMeta(type);
        expect(meta).toBeDefined();
        expect(meta?.type).toBe(type);
      }
    });
  });

  describe("getAllHarmonyMeta", () => {
    it("returns a copy of the metadata array", () => {
      const meta1 = getAllHarmonyMeta();
      const meta2 = getAllHarmonyMeta();
      expect(meta1).not.toBe(meta2);
      expect(meta1).toEqual(meta2);
    });

    it("returns all 10 harmony types", () => {
      const meta = getAllHarmonyMeta();
      expect(meta).toHaveLength(10);
    });
  });

  describe("metadata content", () => {
    it("complementary has correct description", () => {
      const meta = getHarmonyMeta("complementary");
      expect(meta?.description).toContain("opposite");
      expect(meta?.description).toContain("contrast");
    });

    it("analogous has correct description", () => {
      const meta = getHarmonyMeta("analogous");
      expect(meta?.description).toContain("adjacent");
    });

    it("aurelian references golden angle", () => {
      const meta = getHarmonyMeta("aurelian");
      expect(meta?.description).toContain("golden");
    });
  });
});
