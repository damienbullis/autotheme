import { describe, it, expect } from "vitest";
import {
  generateGrainFilter,
  generateGlowFilter,
  generateDuotoneFilter,
} from "../../src/generators/filters";
import { generateFullPalette } from "../../src/core/palette";
import { Color } from "../../src/core/color";

function testPalette() {
  return generateFullPalette(new Color("#6439FF"), "analogous", {
    variations: { tints: 0, shades: 0, tones: 0 },
  });
}

describe("generateGrainFilter", () => {
  it("produces a valid SVG data URL", () => {
    const result = generateGrainFilter({ frequency: 0.65, octaves: 3, opacity: 0.08 });

    expect(result.url).toContain("data:image/svg+xml,");
    expect(result.opacity).toBe(0.08);

    const decoded = decodeURIComponent(
      result.url.replace('url("data:image/svg+xml,', "").replace('")', ""),
    );
    expect(decoded).toContain("feTurbulence");
    expect(decoded).toContain("baseFrequency='0.65'");
    expect(decoded).toContain("numOctaves='3'");
    expect(decoded).toContain("feColorMatrix");
  });

  it("reflects custom parameters in the SVG", () => {
    const result = generateGrainFilter({ frequency: 1.2, octaves: 5, opacity: 0.2 });
    const decoded = decodeURIComponent(
      result.url.replace('url("data:image/svg+xml,', "").replace('")', ""),
    );

    expect(decoded).toContain("baseFrequency='1.2'");
    expect(decoded).toContain("numOctaves='5'");
    expect(result.opacity).toBe(0.2);
  });
});

describe("generateGlowFilter", () => {
  it("produces SVG with feGaussianBlur and palette color", () => {
    const palette = testPalette();
    const url = generateGlowFilter({ color: "primary", blur: 20, intensity: 0.6 }, palette);

    expect(url).toContain("data:image/svg+xml,");
    const decoded = decodeURIComponent(
      url.replace('url("data:image/svg+xml,', "").replace('")', ""),
    );
    expect(decoded).toContain("feGaussianBlur");
    expect(decoded).toContain("stdDeviation='20'");
    expect(decoded).toContain("flood-opacity='0.6'");
    // Should contain RGB values from the primary palette color
    expect(decoded).toContain("flood-color='rgb(");
  });
});

describe("generateDuotoneFilter", () => {
  it("produces SVG with feColorMatrix", () => {
    const palette = testPalette();
    const url = generateDuotoneFilter({ shadow: "primary", highlight: "secondary" }, palette);

    expect(url).toContain("data:image/svg+xml,");
    const decoded = decodeURIComponent(
      url.replace('url("data:image/svg+xml,', "").replace('")', ""),
    );
    expect(decoded).toContain("feColorMatrix");
    expect(decoded).toContain("type='matrix'");
  });

  it("produces deterministic output for same inputs", () => {
    const palette = testPalette();
    const url1 = generateDuotoneFilter({ shadow: "primary", highlight: "secondary" }, palette);
    const url2 = generateDuotoneFilter({ shadow: "primary", highlight: "secondary" }, palette);

    expect(url1).toBe(url2);
  });
});
