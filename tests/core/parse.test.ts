import { describe, it, expect } from "vitest";
import { parseColor, isRGBColor, isHSLColor } from "../../src/core/parse";

describe("Color Parsing", () => {
  describe("parseColor", () => {
    describe("hex strings", () => {
      it("parses 6-digit hex", () => {
        const result = parseColor("#ff0000");
        expect(result.h).toBeCloseTo(0);
        expect(result.s).toBeCloseTo(100);
        expect(result.l).toBeCloseTo(50);
        expect(result.a).toBe(1);
      });

      it("parses 3-digit hex", () => {
        const result = parseColor("#f00");
        expect(result.h).toBeCloseTo(0);
        expect(result.s).toBeCloseTo(100);
        expect(result.l).toBeCloseTo(50);
      });

      it("handles uppercase hex", () => {
        const result = parseColor("#FF0000");
        expect(result.h).toBeCloseTo(0);
        expect(result.s).toBeCloseTo(100);
        expect(result.l).toBeCloseTo(50);
      });
    });

    describe("rgb strings", () => {
      it("parses rgb()", () => {
        const result = parseColor("rgb(255, 0, 0)");
        expect(result.h).toBeCloseTo(0);
        expect(result.s).toBeCloseTo(100);
        expect(result.l).toBeCloseTo(50);
        expect(result.a).toBe(1);
      });

      it("parses rgba()", () => {
        const result = parseColor("rgba(255, 0, 0, 0.5)");
        expect(result.h).toBeCloseTo(0);
        expect(result.s).toBeCloseTo(100);
        expect(result.l).toBeCloseTo(50);
        expect(result.a).toBe(0.5);
      });

      it("handles whitespace variations", () => {
        const result = parseColor("rgb( 255 , 128 , 64 )");
        expect(result.a).toBe(1);
      });
    });

    describe("hsl strings", () => {
      it("parses hsl()", () => {
        const result = parseColor("hsl(180, 50%, 50%)");
        expect(result.h).toBe(180);
        expect(result.s).toBe(50);
        expect(result.l).toBe(50);
        expect(result.a).toBe(1);
      });

      it("parses hsla()", () => {
        const result = parseColor("hsla(180, 50%, 50%, 0.5)");
        expect(result.h).toBe(180);
        expect(result.s).toBe(50);
        expect(result.l).toBe(50);
        expect(result.a).toBe(0.5);
      });

      it("handles without % signs", () => {
        const result = parseColor("hsl(180, 50, 50)");
        expect(result.h).toBe(180);
        expect(result.s).toBe(50);
        expect(result.l).toBe(50);
      });
    });

    describe("object inputs", () => {
      it("parses RGB object", () => {
        const result = parseColor({ r: 255, g: 0, b: 0, a: 1 });
        expect(result.h).toBeCloseTo(0);
        expect(result.s).toBeCloseTo(100);
        expect(result.l).toBeCloseTo(50);
      });

      it("parses HSL object", () => {
        const result = parseColor({ h: 180, s: 50, l: 50, a: 1 });
        expect(result.h).toBe(180);
        expect(result.s).toBe(50);
        expect(result.l).toBe(50);
      });

      it("defaults alpha to 1 for RGB object", () => {
        const result = parseColor({ r: 255, g: 0, b: 0 } as {
          r: number;
          g: number;
          b: number;
          a: number;
        });
        expect(result.a).toBe(1);
      });

      it("defaults alpha to 1 for HSL object", () => {
        const result = parseColor({ h: 180, s: 50, l: 50 } as {
          h: number;
          s: number;
          l: number;
          a: number;
        });
        expect(result.a).toBe(1);
      });
    });

    describe("error handling", () => {
      it("throws for invalid format", () => {
        expect(() => parseColor("invalid")).toThrow("Invalid color format");
      });

      it("throws for invalid rgb format", () => {
        expect(() => parseColor("rgb(invalid)")).toThrow("Invalid RGB format");
      });

      it("throws for invalid hsl format", () => {
        expect(() => parseColor("hsl(invalid)")).toThrow("Invalid HSL format");
      });
    });
  });

  describe("isRGBColor", () => {
    it("returns true for RGB object", () => {
      expect(isRGBColor({ r: 255, g: 0, b: 0, a: 1 })).toBe(true);
    });

    it("returns false for HSL object", () => {
      expect(isRGBColor({ h: 0, s: 100, l: 50, a: 1 })).toBe(false);
    });

    it("returns false for string", () => {
      expect(isRGBColor("#ff0000")).toBe(false);
    });
  });

  describe("isHSLColor", () => {
    it("returns true for HSL object", () => {
      expect(isHSLColor({ h: 0, s: 100, l: 50, a: 1 })).toBe(true);
    });

    it("returns false for RGB object", () => {
      expect(isHSLColor({ r: 255, g: 0, b: 0, a: 1 })).toBe(false);
    });

    it("returns false for string", () => {
      expect(isHSLColor("#ff0000")).toBe(false);
    });
  });
});
