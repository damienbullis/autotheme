import { describe, it, expect } from "vitest";
import { generateNoiseSVG } from "../../src/generators/noise";

describe("generateNoiseSVG", () => {
  it("returns a CSS url() string", () => {
    const result = generateNoiseSVG();

    expect(result).toMatch(/^url\("/);
    expect(result).toMatch(/"\)$/);
  });

  it("contains encoded SVG data URI", () => {
    const result = generateNoiseSVG();

    expect(result).toContain("data:image/svg+xml,");
  });

  it("includes feTurbulence filter", () => {
    const result = generateNoiseSVG();
    const decoded = decodeURIComponent(result);

    expect(decoded).toContain("feTurbulence");
    expect(decoded).toContain("fractalNoise");
  });

  it("uses default frequency of 0.7", () => {
    const result = generateNoiseSVG();
    const decoded = decodeURIComponent(result);

    expect(decoded).toContain("baseFrequency='0.7'");
  });

  it("accepts custom frequency", () => {
    const result = generateNoiseSVG(0.5);
    const decoded = decodeURIComponent(result);

    expect(decoded).toContain("baseFrequency='0.5'");
  });

  it("includes 3 octaves", () => {
    const result = generateNoiseSVG();
    const decoded = decodeURIComponent(result);

    expect(decoded).toContain("numOctaves='3'");
  });

  it("uses stitchTiles", () => {
    const result = generateNoiseSVG();
    const decoded = decodeURIComponent(result);

    expect(decoded).toContain("stitchTiles='stitch'");
  });
});
