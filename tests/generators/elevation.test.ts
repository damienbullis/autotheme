import { describe, it, expect } from "vitest";
import { generateElevationTokens, buildMultiLayerShadow } from "../../src/generators/elevation";
import type { ElevationConfig } from "../../src/config/types";

const defaultConfig: ElevationConfig = {
  levels: 4,
  delta: 0.03,
  tintShadows: true,
};

const primaryHue = 255;
const surfaceChroma = 0.01;

describe("generateElevationTokens", () => {
  it("generates 2 tokens per level (surface + shadow, no borders)", () => {
    const tokens = generateElevationTokens(defaultConfig, 0.13, primaryHue, surfaceChroma, true);
    expect(tokens).toHaveLength(8); // 4 levels * 2
  });

  it("token naming: elevation-N and elevation-N-shadow", () => {
    const tokens = generateElevationTokens(defaultConfig, 0.13, primaryHue, surfaceChroma, true);
    for (let i = 1; i <= defaultConfig.levels; i++) {
      expect(tokens.find((t) => t.name === `elevation-${i}`)).toBeDefined();
      expect(tokens.find((t) => t.name === `elevation-${i}-shadow`)).toBeDefined();
    }
    // No border tokens
    expect(tokens.find((t) => t.name.includes("border"))).toBeUndefined();
  });

  it("dark mode: surfaces are progressively lighter", () => {
    const depth = 0.13;
    const tokens = generateElevationTokens(defaultConfig, depth, primaryHue, surfaceChroma, true);
    const surfaces = tokens.filter((t) => !t.name.endsWith("-shadow"));

    for (let i = 1; i < surfaces.length; i++) {
      expect(surfaces[i]!.value.oklch.l).toBeGreaterThan(surfaces[i - 1]!.value.oklch.l);
    }
  });

  it("light mode: surfaces are near-white (card model)", () => {
    const tokens = generateElevationTokens(defaultConfig, 0.87, primaryHue, surfaceChroma, false);
    const surfaces = tokens.filter((t) => !t.name.endsWith("-shadow"));

    for (const surface of surfaces) {
      // All surfaces should be near-white in card model
      expect(surface.value.oklch.l).toBeGreaterThanOrEqual(0.98);
    }
  });

  it("shadows use rawCSS containing oklch(", () => {
    const tokens = generateElevationTokens(defaultConfig, 0.13, primaryHue, surfaceChroma, true);
    const shadows = tokens.filter((t) => t.name.endsWith("-shadow"));

    for (const shadow of shadows) {
      expect(shadow.rawCSS).toBeDefined();
      expect(shadow.rawCSS).toContain("oklch(");
    }
  });

  it("higher levels have more shadow layers", () => {
    const tokens = generateElevationTokens(defaultConfig, 0.13, primaryHue, surfaceChroma, true);

    const shadow1 = tokens.find((t) => t.name === "elevation-1-shadow")!;
    const shadow2 = tokens.find((t) => t.name === "elevation-2-shadow")!;
    const shadow3 = tokens.find((t) => t.name === "elevation-3-shadow")!;

    // Count commas to determine layers (N commas = N+1 layers)
    const countLayers = (css: string) => css.split(", 0 ").length;
    expect(countLayers(shadow1.rawCSS!)).toBe(1);
    expect(countLayers(shadow2.rawCSS!)).toBe(2);
    expect(countLayers(shadow3.rawCSS!)).toBe(3);
  });

  it("configurable level count works", () => {
    for (const levels of [2, 3, 5]) {
      const config = { ...defaultConfig, levels };
      const tokens = generateElevationTokens(config, 0.13, primaryHue, surfaceChroma, true);
      expect(tokens).toHaveLength(levels * 2);
    }
  });

  it("tintShadows: false produces achromatic shadows", () => {
    const shadow = buildMultiLayerShadow(2, primaryHue, false, true, "oklch");
    // Achromatic: chroma should be 0.000
    expect(shadow).toMatch(/oklch\([\d.]+ 0\.000 /);
  });

  it("dark shadows have higher alpha than light shadows", () => {
    const darkShadow = buildMultiLayerShadow(2, primaryHue, true, true, "oklch");
    const lightShadow = buildMultiLayerShadow(2, primaryHue, true, false, "oklch");

    // Extract first alpha from each (pattern: oklch(L C H / NN%))
    const extractAlpha = (css: string) => {
      const match = css.match(/\/\s*([\d.]+)%/);
      return match ? Number(match[1]) : 0;
    };

    expect(extractAlpha(darkShadow)).toBeGreaterThan(extractAlpha(lightShadow));
  });
});
