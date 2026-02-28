import { describe, it, expect } from "vitest";
import { Color } from "../../src/core/color";
import { rgbToOklch, hslToOklch, formatOklch } from "../../src/core/conversions";

describe("OKLCH Conversions", () => {
  describe("rgbToOklch", () => {
    it("converts pure white correctly", () => {
      const oklch = rgbToOklch({ r: 255, g: 255, b: 255, a: 1 });

      expect(oklch.l).toBeCloseTo(1, 2);
      expect(oklch.c).toBeCloseTo(0, 2);
      expect(oklch.a).toBe(1);
    });

    it("converts pure black correctly", () => {
      const oklch = rgbToOklch({ r: 0, g: 0, b: 0, a: 1 });

      expect(oklch.l).toBeCloseTo(0, 2);
      expect(oklch.c).toBeCloseTo(0, 2);
      expect(oklch.a).toBe(1);
    });

    it("converts pure red correctly", () => {
      const oklch = rgbToOklch({ r: 255, g: 0, b: 0, a: 1 });

      // Red in OKLCH: L ~0.628, C ~0.258, H ~29
      expect(oklch.l).toBeGreaterThan(0.5);
      expect(oklch.c).toBeGreaterThan(0.2);
      expect(oklch.h).toBeGreaterThan(20);
      expect(oklch.h).toBeLessThan(35);
    });

    it("converts pure green correctly", () => {
      const oklch = rgbToOklch({ r: 0, g: 255, b: 0, a: 1 });

      // Green in OKLCH: L ~0.866, C ~0.295, H ~142
      expect(oklch.l).toBeGreaterThan(0.8);
      expect(oklch.c).toBeGreaterThan(0.2);
      expect(oklch.h).toBeGreaterThan(130);
      expect(oklch.h).toBeLessThan(150);
    });

    it("converts pure blue correctly", () => {
      const oklch = rgbToOklch({ r: 0, g: 0, b: 255, a: 1 });

      // Blue in OKLCH: L ~0.452, C ~0.313, H ~264
      expect(oklch.l).toBeGreaterThan(0.4);
      expect(oklch.l).toBeLessThan(0.5);
      expect(oklch.c).toBeGreaterThan(0.25);
      expect(oklch.h).toBeGreaterThan(260);
      expect(oklch.h).toBeLessThan(270);
    });

    it("preserves alpha channel", () => {
      const oklch = rgbToOklch({ r: 128, g: 128, b: 128, a: 0.5 });
      expect(oklch.a).toBe(0.5);
    });

    it("handles gray colors (zero chroma)", () => {
      const oklch = rgbToOklch({ r: 128, g: 128, b: 128, a: 1 });

      expect(oklch.c).toBeCloseTo(0, 2);
      // Hue should be 0 for achromatic colors
      expect(oklch.h).toBe(0);
    });
  });

  describe("hslToOklch", () => {
    it("converts HSL to OKLCH correctly", () => {
      const oklch = hslToOklch({ h: 0, s: 100, l: 50, a: 1 });

      // Red in OKLCH
      expect(oklch.l).toBeGreaterThan(0.5);
      expect(oklch.c).toBeGreaterThan(0.2);
      expect(oklch.h).toBeGreaterThan(20);
      expect(oklch.h).toBeLessThan(35);
    });

    it("preserves alpha channel", () => {
      const oklch = hslToOklch({ h: 180, s: 50, l: 50, a: 0.7 });
      expect(oklch.a).toBe(0.7);
    });
  });

  describe("formatOklch", () => {
    it("formats OKLCH without alpha", () => {
      const formatted = formatOklch({ l: 0.5, c: 0.2, h: 180, a: 1 });

      expect(formatted).toMatch(/^oklch\(0\.500 0\.200 180\.000\)$/);
    });

    it("formats OKLCH with alpha", () => {
      const formatted = formatOklch({ l: 0.5, c: 0.2, h: 180, a: 0.5 });

      expect(formatted).toContain("/ 50%");
    });

    it("handles zero values", () => {
      const formatted = formatOklch({ l: 0, c: 0, h: 0, a: 1 });

      expect(formatted).toBe("oklch(0.000 0.000 0.000)");
    });

    it("handles maximum values", () => {
      const formatted = formatOklch({ l: 1, c: 0.4, h: 360, a: 1 });

      expect(formatted).toBe("oklch(1.000 0.400 360.000)");
    });
  });
});

describe("Color.oklch property", () => {
  it("returns OKLCH representation", () => {
    const color = new Color("#ff0000");
    const oklch = color.oklch;

    expect(oklch).toHaveProperty("l");
    expect(oklch).toHaveProperty("c");
    expect(oklch).toHaveProperty("h");
    expect(oklch).toHaveProperty("a");
  });

  it("returns correct OKLCH for white", () => {
    const color = new Color("#ffffff");
    const oklch = color.oklch;

    expect(oklch.l).toBeCloseTo(1, 2);
    expect(oklch.c).toBeCloseTo(0, 2);
  });

  it("returns correct OKLCH for black", () => {
    const color = new Color("#000000");
    const oklch = color.oklch;

    expect(oklch.l).toBeCloseTo(0, 2);
    expect(oklch.c).toBeCloseTo(0, 2);
  });
});

describe("Color.toOKLCH method", () => {
  it("returns formatted OKLCH string", () => {
    const color = new Color("#ff0000");
    const oklchString = color.toOKLCH();

    expect(oklchString).toMatch(/^oklch\([\d.]+ [\d.]+ [\d.]+\)$/);
  });

  it("includes alpha when less than 1", () => {
    const color = new Color({ h: 0, s: 100, l: 50, a: 0.5 });
    const oklchString = color.toOKLCH();

    expect(oklchString).toContain("/ 50%");
  });

  it("excludes alpha when equal to 1", () => {
    const color = new Color("#ff0000");
    const oklchString = color.toOKLCH();

    expect(oklchString).not.toContain("/");
  });
});
