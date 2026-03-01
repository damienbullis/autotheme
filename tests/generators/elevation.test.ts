import { describe, it, expect } from "vitest";
import { generateElevationTokens } from "../../src/generators/elevation";
import { generateSemanticCSS } from "../../src/generators/semantic";
import { Color } from "../../src/core/color";
import { createTestTheme } from "../helpers/test-theme";

describe("generateElevationTokens", () => {
  const baseSurface = new Color({ h: 250, s: 5, l: 96, a: 1 });
  const primaryHue = 255;

  it("generates 3 tokens per level (surface, shadow, border)", () => {
    const tokens = generateElevationTokens(baseSurface, primaryHue, 4, false);
    expect(tokens).toHaveLength(12); // 4 levels * 3 tokens
  });

  it("higher levels have lighter surfaces", () => {
    const tokens = generateElevationTokens(baseSurface, primaryHue, 4, false);
    const surfaces = tokens.filter((t) => t.name.endsWith("-surface"));

    for (let i = 1; i < surfaces.length; i++) {
      expect(surfaces[i]!.value.hsl.l).toBeGreaterThanOrEqual(surfaces[i - 1]!.value.hsl.l);
    }
  });

  it("higher levels have deeper shadows (larger blur values)", () => {
    const tokens = generateElevationTokens(baseSurface, primaryHue, 4, false);
    const shadows = tokens.filter((t) => t.name.endsWith("-shadow"));

    for (let i = 0; i < shadows.length; i++) {
      expect(shadows[i]!.rawCSS).toBeDefined();
      // Extract blur value: pattern is "0 Ypx BLURpx ..."
      const match = shadows[i]!.rawCSS!.match(/0 (\d+)px (\d+)px/);
      expect(match).not.toBeNull();
      const blur = Number(match![2]);
      expect(blur).toBe((i + 1) * 4);
    }
  });

  it("shadow tokens contain valid CSS box-shadow syntax", () => {
    const tokens = generateElevationTokens(baseSurface, primaryHue, 4, false);
    const shadows = tokens.filter((t) => t.name.endsWith("-shadow"));

    for (const shadow of shadows) {
      expect(shadow.rawCSS).toMatch(/^0 \d+px \d+px oklch\(/);
      expect(shadow.rawCSS).toMatch(/\/ \d+%\)$/);
    }
  });

  it("light vs dark mode produce different surface values", () => {
    const lightTokens = generateElevationTokens(baseSurface, primaryHue, 4, false);
    const darkSurface = new Color({ h: 250, s: 5, l: 10, a: 1 });
    const darkTokens = generateElevationTokens(darkSurface, primaryHue, 4, true);

    const lightSurf1 = lightTokens.find((t) => t.name === "elevation-1-surface")!;
    const darkSurf1 = darkTokens.find((t) => t.name === "elevation-1-surface")!;

    expect(lightSurf1.value.hsl.l).not.toBeCloseTo(darkSurf1.value.hsl.l, 0);
  });

  it("configurable levels count works", () => {
    for (const levels of [3, 4, 5]) {
      const tokens = generateElevationTokens(baseSurface, primaryHue, levels, false);
      expect(tokens).toHaveLength(levels * 3);

      // Verify names match expected pattern
      for (let i = 1; i <= levels; i++) {
        expect(tokens.find((t) => t.name === `elevation-${i}-surface`)).toBeDefined();
        expect(tokens.find((t) => t.name === `elevation-${i}-shadow`)).toBeDefined();
        expect(tokens.find((t) => t.name === `elevation-${i}-border`)).toBeDefined();
      }
    }
  });

  it("dark mode shadows have higher alpha than light mode", () => {
    const lightTokens = generateElevationTokens(baseSurface, primaryHue, 4, false);
    const darkSurface = new Color({ h: 250, s: 5, l: 10, a: 1 });
    const darkTokens = generateElevationTokens(darkSurface, primaryHue, 4, true);

    const lightShadow = lightTokens.find((t) => t.name === "elevation-2-shadow")!;
    const darkShadow = darkTokens.find((t) => t.name === "elevation-2-shadow")!;

    // Extract alpha percentages
    const lightAlpha = Number(lightShadow.rawCSS!.match(/\/ (\d+)%/)![1]);
    const darkAlpha = Number(darkShadow.rawCSS!.match(/\/ (\d+)%/)![1]);

    expect(darkAlpha).toBeGreaterThan(lightAlpha);
  });
});

describe("elevation in semantic CSS output", () => {
  it("elevation.enabled: false produces no elevation tokens", () => {
    const theme = createTestTheme({
      semantics: { enabled: true, elevation: { enabled: false } },
    });
    const result = generateSemanticCSS(theme);

    expect(result).not.toContain("elevation-");
    expect(result).not.toContain("/* Elevation */");
  });

  it("elevation.enabled: true produces elevation tokens in output", () => {
    const theme = createTestTheme({
      semantics: { enabled: true, elevation: { enabled: true, levels: 4 } },
    });
    const result = generateSemanticCSS(theme);

    expect(result).toContain("/* Elevation */");
    expect(result).toContain("--elevation-1-surface:");
    expect(result).toContain("--elevation-1-shadow:");
    expect(result).toContain("--elevation-1-border:");
    expect(result).toContain("--elevation-4-surface:");
  });
});
