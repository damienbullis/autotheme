import { describe, it, expect } from "vitest";
import { DEFAULT_CONFIG } from "../../src/config/types";

describe("DEFAULT_CONFIG", () => {
  it("has empty string for color (to be randomized)", () => {
    expect(DEFAULT_CONFIG.color).toBe("");
  });

  it("has analogous as default harmony", () => {
    expect(DEFAULT_CONFIG.harmony).toBe("analogous");
  });

  it("has correct default output path", () => {
    expect(DEFAULT_CONFIG.output.path).toBe("./src/autotheme.css");
  });

  it("has all output options default to false", () => {
    expect(DEFAULT_CONFIG.output.preview).toBe(false);
    expect(DEFAULT_CONFIG.output.tailwind).toBe(false);
    expect(DEFAULT_CONFIG.output.darkModeScript).toBe(false);
  });

  it("has golden ratio as default typography ratio", () => {
    expect(DEFAULT_CONFIG.typography.ratio).toBeCloseTo(1.618, 3);
  });

  it("has WCAG AAA contrast as default target", () => {
    expect(DEFAULT_CONFIG.palette.contrastTarget).toBe(7);
  });

  it("has 'color' as default prefix", () => {
    expect(DEFAULT_CONFIG.palette.prefix).toBe("color");
  });

  it("has 1 as default typography base", () => {
    expect(DEFAULT_CONFIG.typography.base).toBe(1);
  });

  it("has 1 as default swing", () => {
    expect(DEFAULT_CONFIG.swing).toBe(1);
  });

  it("has 'linear' as default swingStrategy", () => {
    expect(DEFAULT_CONFIG.swingStrategy).toBe("linear");
  });

  it("has all feature toggles default to false", () => {
    expect(DEFAULT_CONFIG.gradients).toBe(false);
    expect(DEFAULT_CONFIG.spacing.enabled).toBe(false);
    expect(DEFAULT_CONFIG.noise).toBe(false);
    expect(DEFAULT_CONFIG.shadcn.enabled).toBe(false);
    expect(DEFAULT_CONFIG.utilities).toBe(false);
  });
});
