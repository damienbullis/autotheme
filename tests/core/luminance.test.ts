import { describe, it, expect } from "vitest";
import { getLuminance } from "../../src/core/luminance";

describe("getLuminance (WCAG)", () => {
  it("returns 0 for pure black", () => {
    expect(getLuminance({ r: 0, g: 0, b: 0, a: 1 })).toBe(0);
  });

  it("returns 1 for pure white", () => {
    expect(getLuminance({ r: 255, g: 255, b: 255, a: 1 })).toBeCloseTo(1, 5);
  });

  it("uses correct coefficients for RGB channels", () => {
    // Red coefficient is ~0.2126
    const redLum = getLuminance({ r: 255, g: 0, b: 0, a: 1 });
    expect(redLum).toBeCloseTo(0.2126, 3);

    // Green coefficient is ~0.7152
    const greenLum = getLuminance({ r: 0, g: 255, b: 0, a: 1 });
    expect(greenLum).toBeCloseTo(0.7152, 3);

    // Blue coefficient is ~0.0722
    const blueLum = getLuminance({ r: 0, g: 0, b: 255, a: 1 });
    expect(blueLum).toBeCloseTo(0.0722, 3);
  });

  it("applies sRGB linearization correctly", () => {
    // Values below threshold (0.03928 * 255 ≈ 10) use linear formula
    const lowValue = getLuminance({ r: 5, g: 5, b: 5, a: 1 });
    expect(lowValue).toBeGreaterThan(0);
    expect(lowValue).toBeLessThan(0.01);

    // Values above threshold use power formula
    const midValue = getLuminance({ r: 128, g: 128, b: 128, a: 1 });
    expect(midValue).toBeGreaterThan(0.1);
    expect(midValue).toBeLessThan(0.3);
  });

  it("handles edge case values", () => {
    // Very low values
    expect(getLuminance({ r: 1, g: 1, b: 1, a: 1 })).toBeGreaterThan(0);

    // Mid-point
    expect(getLuminance({ r: 127, g: 127, b: 127, a: 1 })).toBeGreaterThan(0.1);
    expect(getLuminance({ r: 127, g: 127, b: 127, a: 1 })).toBeLessThan(0.3);
  });

  it("is monotonically increasing for grayscale", () => {
    let prevLum = 0;
    for (let i = 0; i <= 255; i += 10) {
      const lum = getLuminance({ r: i, g: i, b: i, a: 1 });
      expect(lum).toBeGreaterThanOrEqual(prevLum);
      prevLum = lum;
    }
  });
});
