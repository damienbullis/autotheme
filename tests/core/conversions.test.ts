import { describe, it, expect } from "vitest";
import {
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
} from "../../src/core/conversions";

describe("Color Conversions", () => {
  describe("hexToRgb", () => {
    it("converts 6-digit hex", () => {
      expect(hexToRgb("#FF0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
      expect(hexToRgb("#00FF00")).toEqual({ r: 0, g: 255, b: 0, a: 1 });
      expect(hexToRgb("#0000FF")).toEqual({ r: 0, g: 0, b: 255, a: 1 });
    });

    it("converts 3-digit hex", () => {
      expect(hexToRgb("#F00")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
      expect(hexToRgb("#0F0")).toEqual({ r: 0, g: 255, b: 0, a: 1 });
      expect(hexToRgb("#00F")).toEqual({ r: 0, g: 0, b: 255, a: 1 });
    });

    it("handles lowercase", () => {
      expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
      expect(hexToRgb("#abcdef")).toEqual({ r: 171, g: 205, b: 239, a: 1 });
    });

    it("handles 8-digit hex with alpha", () => {
      const result = hexToRgb("#FF000080");
      expect(result.r).toBe(255);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
      expect(result.a).toBeCloseTo(0.502, 2);
    });

    it("converts without hash prefix", () => {
      expect(hexToRgb("FF0000")).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    });
  });

  describe("rgbToHsl", () => {
    it("converts pure red", () => {
      const result = rgbToHsl({ r: 255, g: 0, b: 0, a: 1 });
      expect(result.h).toBeCloseTo(0);
      expect(result.s).toBeCloseTo(100);
      expect(result.l).toBeCloseTo(50);
      expect(result.a).toBe(1);
    });

    it("converts pure green", () => {
      const result = rgbToHsl({ r: 0, g: 255, b: 0, a: 1 });
      expect(result.h).toBeCloseTo(120);
      expect(result.s).toBeCloseTo(100);
      expect(result.l).toBeCloseTo(50);
    });

    it("converts pure blue", () => {
      const result = rgbToHsl({ r: 0, g: 0, b: 255, a: 1 });
      expect(result.h).toBeCloseTo(240);
      expect(result.s).toBeCloseTo(100);
      expect(result.l).toBeCloseTo(50);
    });

    it("converts white", () => {
      const result = rgbToHsl({ r: 255, g: 255, b: 255, a: 1 });
      expect(result.s).toBe(0);
      expect(result.l).toBe(100);
    });

    it("converts black", () => {
      const result = rgbToHsl({ r: 0, g: 0, b: 0, a: 1 });
      expect(result.s).toBe(0);
      expect(result.l).toBe(0);
    });

    it("converts gray", () => {
      const result = rgbToHsl({ r: 128, g: 128, b: 128, a: 1 });
      expect(result.s).toBe(0);
      expect(result.l).toBeCloseTo(50.2, 0);
    });

    it("preserves alpha", () => {
      const result = rgbToHsl({ r: 255, g: 0, b: 0, a: 0.5 });
      expect(result.a).toBe(0.5);
    });
  });

  describe("hslToRgb", () => {
    it("converts pure red", () => {
      expect(hslToRgb({ h: 0, s: 100, l: 50, a: 1 })).toEqual({
        r: 255,
        g: 0,
        b: 0,
        a: 1,
      });
    });

    it("converts pure green", () => {
      expect(hslToRgb({ h: 120, s: 100, l: 50, a: 1 })).toEqual({
        r: 0,
        g: 255,
        b: 0,
        a: 1,
      });
    });

    it("converts pure blue", () => {
      expect(hslToRgb({ h: 240, s: 100, l: 50, a: 1 })).toEqual({
        r: 0,
        g: 0,
        b: 255,
        a: 1,
      });
    });

    it("converts white", () => {
      expect(hslToRgb({ h: 0, s: 0, l: 100, a: 1 })).toEqual({
        r: 255,
        g: 255,
        b: 255,
        a: 1,
      });
    });

    it("converts black", () => {
      expect(hslToRgb({ h: 0, s: 0, l: 0, a: 1 })).toEqual({
        r: 0,
        g: 0,
        b: 0,
        a: 1,
      });
    });

    it("converts gray", () => {
      const result = hslToRgb({ h: 0, s: 0, l: 50, a: 1 });
      expect(result.r).toBe(128);
      expect(result.g).toBe(128);
      expect(result.b).toBe(128);
    });

    it("preserves alpha", () => {
      const result = hslToRgb({ h: 0, s: 100, l: 50, a: 0.5 });
      expect(result.a).toBe(0.5);
    });
  });

  describe("rgbToHex", () => {
    it("converts basic colors", () => {
      expect(rgbToHex({ r: 255, g: 0, b: 0, a: 1 })).toBe("#ff0000");
      expect(rgbToHex({ r: 0, g: 255, b: 0, a: 1 })).toBe("#00ff00");
      expect(rgbToHex({ r: 0, g: 0, b: 255, a: 1 })).toBe("#0000ff");
    });

    it("pads single digit values", () => {
      expect(rgbToHex({ r: 0, g: 0, b: 0, a: 1 })).toBe("#000000");
      expect(rgbToHex({ r: 15, g: 15, b: 15, a: 1 })).toBe("#0f0f0f");
    });

    it("includes alpha when not 1", () => {
      const result = rgbToHex({ r: 255, g: 0, b: 0, a: 0.5 });
      expect(result).toBe("#ff000080");
    });
  });

  describe("hexToHsl", () => {
    it("converts hex directly to HSL", () => {
      const result = hexToHsl("#ff0000");
      expect(result.h).toBeCloseTo(0);
      expect(result.s).toBeCloseTo(100);
      expect(result.l).toBeCloseTo(50);
    });
  });

  describe("hslToHex", () => {
    it("converts HSL directly to hex", () => {
      const result = hslToHex({ h: 0, s: 100, l: 50, a: 1 });
      expect(result).toBe("#ff0000");
    });
  });

  describe("roundtrip conversions", () => {
    it("rgb -> hsl -> rgb maintains values", () => {
      const original = { r: 173, g: 216, b: 230, a: 1 };
      const hsl = rgbToHsl(original);
      const result = hslToRgb(hsl);

      expect(result.r).toBeCloseTo(original.r, 0);
      expect(result.g).toBeCloseTo(original.g, 0);
      expect(result.b).toBeCloseTo(original.b, 0);
    });

    it("hex -> rgb -> hex maintains values", () => {
      const original = "#abcdef";
      const rgb = hexToRgb(original);
      const result = rgbToHex(rgb);

      expect(result).toBe(original);
    });

    it("hex -> hsl -> hex maintains values", () => {
      const original = "#336699";
      const hsl = hexToHsl(original);
      const result = hslToHex(hsl);

      expect(result).toBe(original);
    });
  });
});
