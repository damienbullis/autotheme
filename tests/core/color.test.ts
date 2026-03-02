import { describe, it, expect } from "vitest";
import { Color } from "../../src/core/color";

describe("Color class", () => {
  describe("constructor", () => {
    it("creates from hex string", () => {
      const color = new Color("#ff0000");
      expect(color.hex).toBe("#ff0000");
    });

    it("creates from RGB string", () => {
      const color = new Color("rgb(255, 0, 0)");
      expect(color.hex).toBe("#ff0000");
    });

    it("creates from HSL string", () => {
      const color = new Color("hsl(0, 100%, 50%)");
      expect(color.hex).toBe("#ff0000");
    });

    it("creates from RGB object", () => {
      const color = new Color({ r: 255, g: 0, b: 0, a: 1 });
      expect(color.hex).toBe("#ff0000");
    });

    it("creates from HSL object", () => {
      const color = new Color({ h: 0, s: 100, l: 50, a: 1 });
      expect(color.hex).toBe("#ff0000");
    });
  });

  describe("getters", () => {
    it("returns HSL values", () => {
      const color = new Color("#ff0000");
      const hsl = color.hsl;
      expect(hsl.h).toBeCloseTo(0);
      expect(hsl.s).toBeCloseTo(100);
      expect(hsl.l).toBeCloseTo(50);
      expect(hsl.a).toBe(1);
    });

    it("returns RGB values", () => {
      const color = new Color("#ff0000");
      const rgb = color.rgb;
      expect(rgb.r).toBe(255);
      expect(rgb.g).toBe(0);
      expect(rgb.b).toBe(0);
      expect(rgb.a).toBe(1);
    });

    it("returns hex string", () => {
      const color = new Color("rgb(255, 0, 0)");
      expect(color.hex).toBe("#ff0000");
    });

    it("returns luminance", () => {
      const white = new Color("#ffffff");
      const black = new Color("#000000");
      expect(white.luminance).toBeCloseTo(1, 1);
      expect(black.luminance).toBeCloseTo(0, 1);
    });
  });

  describe("immutability", () => {
    it("returns new color from lighten", () => {
      const original = new Color("#ff0000");
      const originalL = original.oklch.l;
      const lighter = original.lighten(20);
      expect(original.oklch.l).toBe(originalL);
      expect(lighter.oklch.l).toBeGreaterThan(originalL);
    });

    it("returns new color from darken", () => {
      const original = new Color("#ff0000");
      const originalL = original.oklch.l;
      const darker = original.darken(20);
      expect(original.oklch.l).toBe(originalL);
      expect(darker.oklch.l).toBeLessThan(originalL);
    });
  });

  describe("lighten", () => {
    it("increases lightness", () => {
      const color = Color.fromOklch(0.5, 0.15, 30);
      const lighter = color.lighten(20);
      expect(lighter.oklch.l).toBeCloseTo(0.7);
    });

    it("caps at 1", () => {
      const color = Color.fromOklch(0.9, 0.15, 30);
      const lighter = color.lighten(20);
      expect(lighter.oklch.l).toBe(1);
    });

    it("preserves other values", () => {
      const color = Color.fromOklch(0.5, 0.12, 200, 0.5);
      const lighter = color.lighten(10);
      expect(lighter.oklch.c).toBe(0.12);
      expect(lighter.oklch.h).toBe(200);
      expect(lighter.oklch.a).toBe(0.5);
    });
  });

  describe("darken", () => {
    it("decreases lightness", () => {
      const color = Color.fromOklch(0.5, 0.15, 30);
      const darker = color.darken(20);
      expect(darker.oklch.l).toBeCloseTo(0.3);
    });

    it("caps at 0", () => {
      const color = Color.fromOklch(0.1, 0.15, 30);
      const darker = color.darken(20);
      expect(darker.oklch.l).toBe(0);
    });
  });

  describe("saturate", () => {
    it("increases chroma", () => {
      const color = Color.fromOklch(0.5, 0.1, 30);
      const saturated = color.saturate(20);
      expect(saturated.oklch.c).toBeGreaterThan(0.1);
    });

    it("increases chroma by expected amount", () => {
      const color = Color.fromOklch(0.5, 0.1, 30);
      const saturated = color.saturate(20);
      // saturate adds (amount/100) * 0.4 to chroma
      expect(saturated.oklch.c).toBeCloseTo(0.1 + 0.08);
    });
  });

  describe("desaturate", () => {
    it("decreases chroma", () => {
      const color = Color.fromOklch(0.5, 0.2, 30);
      const desaturated = color.desaturate(20);
      expect(desaturated.oklch.c).toBeLessThan(0.2);
    });

    it("decreases chroma proportionally", () => {
      const color = Color.fromOklch(0.5, 0.2, 30);
      const desaturated = color.desaturate(50);
      // desaturate multiplies chroma by (1 - amount/100)
      expect(desaturated.oklch.c).toBeCloseTo(0.1);
    });

    it("fully desaturates to zero chroma", () => {
      const color = Color.fromOklch(0.5, 0.2, 30);
      const desaturated = color.desaturate(100);
      expect(desaturated.oklch.c).toBe(0);
    });
  });

  describe("rotate", () => {
    it("rotates hue by degrees", () => {
      const color = Color.fromOklch(0.5, 0.15, 0);
      const rotated = color.rotate(120);
      expect(rotated.oklch.h).toBeCloseTo(120);
    });

    it("wraps around 360", () => {
      const color = Color.fromOklch(0.5, 0.15, 300);
      const rotated = color.rotate(120);
      expect(rotated.oklch.h).toBeCloseTo(60);
    });

    it("handles negative rotation", () => {
      const color = Color.fromOklch(0.5, 0.15, 60);
      const rotated = color.rotate(-120);
      expect(rotated.oklch.h).toBeCloseTo(300);
    });
  });

  describe("alpha", () => {
    it("sets alpha value", () => {
      const color = new Color("#ff0000");
      const withAlpha = color.alpha(0.5);
      expect(withAlpha.hsl.a).toBe(0.5);
    });

    it("caps at 0", () => {
      const color = new Color("#ff0000");
      const withAlpha = color.alpha(-0.5);
      expect(withAlpha.hsl.a).toBe(0);
    });

    it("caps at 1", () => {
      const color = new Color("#ff0000");
      const withAlpha = color.alpha(1.5);
      expect(withAlpha.hsl.a).toBe(1);
    });
  });

  describe("output methods", () => {
    it("toHex returns hex string", () => {
      const color = new Color({ h: 0, s: 100, l: 50, a: 1 });
      expect(color.toHex()).toBe("#ff0000");
    });

    it("toRGB returns rgb() string", () => {
      const color = new Color({ h: 0, s: 100, l: 50, a: 1 });
      expect(color.toRGB()).toBe("rgb(255, 0, 0)");
    });

    it("toRGB returns rgba() when alpha < 1", () => {
      const color = new Color({ h: 0, s: 100, l: 50, a: 0.5 });
      expect(color.toRGB()).toBe("rgba(255, 0, 0, 0.5)");
    });

    it("toHSL returns hsl() string", () => {
      const color = new Color({ h: 180, s: 50, l: 50, a: 1 });
      expect(color.toHSL()).toBe("hsl(180, 50%, 50%)");
    });

    it("toHSL returns hsla() when alpha < 1", () => {
      const color = new Color({ h: 180, s: 50, l: 50, a: 0.5 });
      expect(color.toHSL()).toBe("hsla(180, 50%, 50%, 0.5)");
    });

    it("toRGBValues returns space-separated values", () => {
      const color = new Color({ h: 0, s: 100, l: 50, a: 1 });
      expect(color.toRGBValues()).toBe("255 0 0");
    });

    it("toString returns hex", () => {
      const color = new Color("#ff0000");
      expect(color.toString()).toBe("#ff0000");
    });
  });

  describe("equals", () => {
    it("returns true for equal colors", () => {
      const color1 = new Color("#ff0000");
      const color2 = new Color("#ff0000");
      expect(color1.equals(color2)).toBe(true);
    });

    it("returns false for different colors", () => {
      const color1 = new Color("#ff0000");
      const color2 = new Color("#00ff00");
      expect(color1.equals(color2)).toBe(false);
    });

    it("uses tolerance for comparison", () => {
      const color1 = Color.fromOklch(0.5, 0.15, 30);
      const color2 = Color.fromOklch(0.5, 0.15, 32);
      // tolerance=5 means H difference of 5 allowed, so 2 degrees apart should pass
      expect(color1.equals(color2, 5)).toBe(true);
      // tolerance=1 means H difference of 1 allowed, so 2 degrees apart should fail
      expect(color1.equals(color2, 1)).toBe(false);
    });
  });
});
