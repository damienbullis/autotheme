import { describe, it, expect } from "vitest";
import { simulateCVD, simulatePaletteCVD, type CVDType } from "../../src/core/cvd";
import { Color } from "../../src/core/color";
import { generateFullPalette } from "../../src/core/palette";

const ALL_TYPES: CVDType[] = ["protanopia", "deuteranopia", "tritanopia", "achromatopsia"];

describe("simulateCVD", () => {
  it("pure red shifts under protanopia", () => {
    const red = new Color("#ff0000");
    const simulated = simulateCVD(red, "protanopia");

    // Protanopia reduces red perception — the R channel should decrease
    expect(simulated.rgb.r).toBeLessThan(red.rgb.r);
  });

  it("blue is largely preserved under protanopia and deuteranopia", () => {
    const blue = new Color("#0000ff");
    const protan = simulateCVD(blue, "protanopia");
    const deutan = simulateCVD(blue, "deuteranopia");

    // Blue channel should be largely preserved (within ~30 of original)
    expect(Math.abs(protan.rgb.b - blue.rgb.b)).toBeLessThan(30);
    expect(Math.abs(deutan.rgb.b - blue.rgb.b)).toBeLessThan(30);
  });

  it.each(ALL_TYPES)("grays are unchanged under %s", (type) => {
    const gray = new Color("#808080");
    const simulated = simulateCVD(gray, type);

    // Gray should stay approximately gray (all channels close to each other)
    const { r, g, b } = simulated.rgb;
    const spread = Math.max(r, g, b) - Math.min(r, g, b);
    expect(spread).toBeLessThan(10);
  });

  it("achromatopsia produces grayscale output (R≈G≈B)", () => {
    const orange = new Color("#ff8800");
    const simulated = simulateCVD(orange, "achromatopsia");
    const { r, g, b } = simulated.rgb;
    expect(r).toBe(g);
    expect(g).toBe(b);
  });

  it.each(ALL_TYPES)("black is unchanged under %s", (type) => {
    const black = new Color("#000000");
    const simulated = simulateCVD(black, type);
    expect(simulated.rgb.r).toBe(0);
    expect(simulated.rgb.g).toBe(0);
    expect(simulated.rgb.b).toBe(0);
  });

  it.each(ALL_TYPES)("white is unchanged under %s", (type) => {
    const white = new Color("#ffffff");
    const simulated = simulateCVD(white, type);
    // Allow small rounding tolerance
    expect(simulated.rgb.r).toBeGreaterThan(250);
    expect(simulated.rgb.g).toBeGreaterThan(250);
    expect(simulated.rgb.b).toBeGreaterThan(250);
  });

  it("tritanopia shifts blue/yellow perception", () => {
    const blue = new Color("#0000ff");
    const simulated = simulateCVD(blue, "tritanopia");

    // Tritanopia affects S-cones — blue should shift
    // The B channel should change significantly
    expect(Math.abs(simulated.rgb.b - blue.rgb.b)).toBeGreaterThan(5);
  });

  it("preserves alpha", () => {
    const semiTransparent = new Color({ r: 200, g: 100, b: 50, a: 0.5 });
    const simulated = simulateCVD(semiTransparent, "protanopia");
    expect(simulated.rgb.a).toBe(0.5);
  });
});

describe("simulatePaletteCVD", () => {
  it("preserves palette structure", () => {
    const primary = new Color("#6439FF");
    const palette = generateFullPalette(primary, "analogous");

    const simulated = simulatePaletteCVD(palette, "protanopia");

    expect(simulated.palettes.length).toBe(palette.palettes.length);
    for (let i = 0; i < palette.palettes.length; i++) {
      expect(simulated.palettes[i]!.tints.length).toBe(palette.palettes[i]!.tints.length);
      expect(simulated.palettes[i]!.shades.length).toBe(palette.palettes[i]!.shades.length);
      expect(simulated.palettes[i]!.tones.length).toBe(palette.palettes[i]!.tones.length);
    }
  });

  it("transforms text colors", () => {
    const primary = new Color("#6439FF");
    const palette = generateFullPalette(primary, "analogous");

    const simulated = simulatePaletteCVD(palette, "deuteranopia");
    expect(simulated.textColors.size).toBe(palette.textColors.size);
  });

  it("transforms harmony colors", () => {
    const primary = new Color("#ff0000");
    const palette = generateFullPalette(primary, "complementary");

    const simulated = simulatePaletteCVD(palette, "protanopia");

    // Primary should be transformed (red shifts under protanopia)
    expect(simulated.harmony.primary.rgb.r).not.toBe(palette.harmony.primary.rgb.r);
    expect(simulated.harmony.colors.length).toBe(palette.harmony.colors.length);
  });
});
