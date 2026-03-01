import { describe, it, expect } from "vitest";
import { Color } from "../../src/core/color";
import { generateFullPalette } from "../../src/core/palette";
import { getContrastRatio } from "../../src/core/contrast";
import { generateHarmony } from "../../src/core/harmonies";
import type { HarmonyType } from "../../src/core/types";

describe("palette contrast correctness", () => {
  it("every foreground color meets WCAG AA (4.5:1) against its background", () => {
    const colors = ["#FF0000", "#00FF00", "#0000FF", "#6439FF", "#FF6600", "#1E6091"];

    for (const hex of colors) {
      const primary = new Color(hex);
      const palette = generateFullPalette(primary, "analogous");

      for (const [key, textColor] of palette.textColors) {
        // Parse key: c0-base, c0-l1, c0-d1, c0-g1, etc.
        const [colorIdxStr, variation] = key.split("-") as [string, string];
        const colorIndex = parseInt(colorIdxStr!.replace("c", ""), 10);
        const p = palette.palettes[colorIndex]!;

        let bgColor: Color;
        if (variation === "base") {
          bgColor = p.base;
        } else if (variation!.startsWith("l")) {
          const idx = parseInt(variation!.slice(1), 10) - 1;
          bgColor = p.tints[idx]!;
        } else if (variation!.startsWith("d")) {
          const idx = parseInt(variation!.slice(1), 10) - 1;
          bgColor = p.shades[idx]!;
        } else {
          const idx = parseInt(variation!.slice(1), 10) - 1;
          bgColor = p.tones[idx]!;
        }

        const ratio = getContrastRatio(textColor, bgColor);
        expect(
          ratio,
          `${hex} ${key}: contrast ${ratio.toFixed(2)} < 4.5 (fg: ${textColor.toHex()}, bg: ${bgColor.toHex()})`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it("findAccessibleTextColor returns best achievable contrast", () => {
    // Some highly saturated colors (like pure red #FF0000) can't achieve AAA (7:1)
    // with pure black/white. The algorithm should still return the best available.
    const colors = ["#FF0000", "#0000FF", "#6439FF", "#00CC88", "#FFFF00", "#808080"];

    for (const hex of colors) {
      const primary = new Color(hex);
      const palette = generateFullPalette(primary, "analogous");

      const textColor = palette.textColors.get("c0-base");
      expect(textColor, `missing text color for c0-base (${hex})`).toBeDefined();

      const ratio = getContrastRatio(textColor!, palette.palettes[0]!.base);
      // Should always achieve at least AA (4.5:1) or the best possible
      expect(ratio, `${hex} contrast too low: ${ratio.toFixed(2)}`).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("harmony hue correctness", () => {
  function normalizeHue(h: number): number {
    return ((h % 360) + 360) % 360;
  }

  function hueDistance(h1: number, h2: number): number {
    const diff = Math.abs(normalizeHue(h1) - normalizeHue(h2));
    return Math.min(diff, 360 - diff);
  }

  it("complementary colors are ~180 degrees apart", () => {
    const primary = new Color("#FF0000");
    const harmony = generateHarmony(primary, "complementary");

    expect(harmony.colors).toHaveLength(2);
    const dist = hueDistance(harmony.colors[0]!.hsl.h, harmony.colors[1]!.hsl.h);
    expect(dist).toBeCloseTo(180, -1); // within ~10 degrees
  });

  it("triadic colors are ~120 degrees apart", () => {
    const primary = new Color("#FF0000");
    const harmony = generateHarmony(primary, "triadic");

    expect(harmony.colors).toHaveLength(3);
    const dist01 = hueDistance(harmony.colors[0]!.hsl.h, harmony.colors[1]!.hsl.h);
    const dist12 = hueDistance(harmony.colors[1]!.hsl.h, harmony.colors[2]!.hsl.h);
    expect(dist01).toBeCloseTo(120, -1);
    expect(dist12).toBeCloseTo(120, -1);
  });

  it("square colors are ~90 degrees apart", () => {
    const primary = new Color("#3366CC");
    const harmony = generateHarmony(primary, "square");

    expect(harmony.colors).toHaveLength(4);
    for (let i = 0; i < 3; i++) {
      const dist = hueDistance(harmony.colors[i]!.hsl.h, harmony.colors[i + 1]!.hsl.h);
      expect(dist).toBeCloseTo(90, -1);
    }
  });

  it("analogous colors are close together (~30 degrees)", () => {
    const primary = new Color("#FF6600");
    const harmony = generateHarmony(primary, "analogous");

    expect(harmony.colors).toHaveLength(3);
    // Primary at 0, neighbors at -30 and +30
    const dist01 = hueDistance(harmony.colors[0]!.hsl.h, harmony.colors[1]!.hsl.h);
    const dist02 = hueDistance(harmony.colors[0]!.hsl.h, harmony.colors[2]!.hsl.h);
    expect(dist01).toBeCloseTo(30, 0);
    expect(dist02).toBeCloseTo(30, 0);
  });

  it("swing < 1 clusters harmony colors closer together", () => {
    const primary = new Color("#FF0000");
    const normal = generateHarmony(primary, "triadic");
    const clustered = generateHarmony(primary, "triadic", { swing: 0.5 });

    const normalDist = hueDistance(normal.colors[0]!.hsl.h, normal.colors[1]!.hsl.h);
    const clusteredDist = hueDistance(clustered.colors[0]!.hsl.h, clustered.colors[1]!.hsl.h);

    expect(clusteredDist).toBeLessThan(normalDist);
  });

  it("swing > 1 spreads harmony colors further apart", () => {
    const primary = new Color("#FF0000");
    const normal = generateHarmony(primary, "analogous");
    const spread = generateHarmony(primary, "analogous", { swing: 2 });

    const normalDist = hueDistance(normal.colors[0]!.hsl.h, normal.colors[1]!.hsl.h);
    const spreadDist = hueDistance(spread.colors[0]!.hsl.h, spread.colors[1]!.hsl.h);

    expect(spreadDist).toBeGreaterThan(normalDist);
  });

  it("primary color hue is preserved at index 0 across all harmony types", () => {
    const primary = new Color("#6439FF");
    const harmonies: HarmonyType[] = [
      "complementary",
      "analogous",
      "triadic",
      "split-complementary",
      "square",
      "bi-polar",
      "retrograde",
      "aurelian",
    ];

    for (const type of harmonies) {
      const harmony = generateHarmony(primary, type);
      expect(harmony.colors[0]!.hsl.h, `${type}: colors[0] should be the primary hue`).toBeCloseTo(
        primary.hsl.h,
        0,
      );
    }
  });
});

describe("tint/shade monotonicity", () => {
  it("tints get progressively lighter", () => {
    const primary = new Color("#3366CC");
    const palette = generateFullPalette(primary, "analogous");

    for (const p of palette.palettes) {
      for (let i = 1; i < p.tints.length; i++) {
        expect(
          p.tints[i]!.hsl.l,
          `tint ${i} should be lighter than tint ${i - 1}`,
        ).toBeGreaterThanOrEqual(p.tints[i - 1]!.hsl.l);
      }
      // All tints lighter than base
      for (const tint of p.tints) {
        expect(tint.hsl.l).toBeGreaterThanOrEqual(p.base.hsl.l);
      }
    }
  });

  it("shades get progressively darker", () => {
    const primary = new Color("#3366CC");
    const palette = generateFullPalette(primary, "analogous");

    for (const p of palette.palettes) {
      for (let i = 1; i < p.shades.length; i++) {
        expect(
          p.shades[i]!.hsl.l,
          `shade ${i} should be darker than shade ${i - 1}`,
        ).toBeLessThanOrEqual(p.shades[i - 1]!.hsl.l);
      }
      // All shades darker than base
      for (const shade of p.shades) {
        expect(shade.hsl.l).toBeLessThanOrEqual(p.base.hsl.l);
      }
    }
  });

  it("tones get progressively less saturated", () => {
    const primary = new Color("#3366CC");
    const palette = generateFullPalette(primary, "analogous");

    for (const p of palette.palettes) {
      for (let i = 1; i < p.tones.length; i++) {
        expect(
          p.tones[i]!.hsl.s,
          `tone ${i} should be less saturated than tone ${i - 1}`,
        ).toBeLessThanOrEqual(p.tones[i - 1]!.hsl.s);
      }
    }
  });

  it("palette has correct number of variations", () => {
    const primary = new Color("#FF0000");
    const palette = generateFullPalette(primary, "triadic");

    for (const p of palette.palettes) {
      expect(p.tints).toHaveLength(5);
      expect(p.shades).toHaveLength(5);
      expect(p.tones).toHaveLength(4);
    }
  });
});

describe("color round-trip accuracy", () => {
  it("hex → Color → hex preserves value", () => {
    const testColors = [
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#6439FF",
      "#000000",
      "#FFFFFF",
      "#808080",
    ];

    for (const hex of testColors) {
      const color = new Color(hex);
      expect(color.toHex().toLowerCase()).toBe(hex.toLowerCase());
    }
  });

  it("hex → rgb → hsl → rgb → hex round-trip within tolerance", () => {
    const testColors = ["#FF0000", "#3366CC", "#6439FF", "#FF6600", "#00CC88"];

    for (const hex of testColors) {
      const color = new Color(hex);
      const reconstructed = new Color({ h: color.hsl.h, s: color.hsl.s, l: color.hsl.l, a: 1 });
      // Allow ±1 in RGB values due to floating point
      expect(Math.abs(color.rgb.r - reconstructed.rgb.r)).toBeLessThanOrEqual(1);
      expect(Math.abs(color.rgb.g - reconstructed.rgb.g)).toBeLessThanOrEqual(1);
      expect(Math.abs(color.rgb.b - reconstructed.rgb.b)).toBeLessThanOrEqual(1);
    }
  });

  it("OKLCH output is syntactically valid for diverse colors", () => {
    const testColors = [
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFFFF",
      "#000000",
      "#808080",
      "#6439FF",
      "#FF6600",
      "#00CC88",
      "#CC3366",
    ];

    const oklchPattern = /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\)$/;

    for (const hex of testColors) {
      const color = new Color(hex);
      const oklch = color.toOKLCH();
      expect(oklch, `${hex} → ${oklch}`).toMatch(oklchPattern);
    }
  });
});
