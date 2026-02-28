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
    expect(DEFAULT_CONFIG.output).toBe("./src/autotheme.css");
  });

  it("has all boolean options default to false", () => {
    expect(DEFAULT_CONFIG.preview).toBe(false);
    expect(DEFAULT_CONFIG.tailwind).toBe(false);
    expect(DEFAULT_CONFIG.darkModeScript).toBe(false);
  });

  it("has golden ratio as default scalar", () => {
    expect(DEFAULT_CONFIG.scalar).toBeCloseTo(1.618, 3);
  });

  it("has WCAG AAA contrast as default target", () => {
    expect(DEFAULT_CONFIG.contrastTarget).toBe(7);
  });

  it("has 'color' as default prefix", () => {
    expect(DEFAULT_CONFIG.prefix).toBe("color");
  });

  it("has 1 as default fontSize", () => {
    expect(DEFAULT_CONFIG.fontSize).toBe(1);
  });

  it("has all feature toggles default to true", () => {
    expect(DEFAULT_CONFIG.gradients).toBe(true);
    expect(DEFAULT_CONFIG.spacing).toBe(true);
    expect(DEFAULT_CONFIG.noise).toBe(true);
    expect(DEFAULT_CONFIG.shadcn).toBe(true);
    expect(DEFAULT_CONFIG.utilities).toBe(true);
  });
});
