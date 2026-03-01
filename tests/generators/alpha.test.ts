import { describe, it, expect } from "vitest";
import { generateAlphaVariants } from "../../src/generators/alpha";
import { generateCSS } from "../../src/generators/css";
import { Color } from "../../src/core/color";
import { createTestTheme } from "../helpers/test-theme";

describe("generateAlphaVariants", () => {
  it("generates four alpha variants with correct alpha values", () => {
    const base = new Color("#6439FF");
    const steps = { bg: 10, border: 20, glow: 15, hover: 8 };

    const result = generateAlphaVariants(base, steps);

    expect(result.bg.hsl.a).toBeCloseTo(0.1);
    expect(result.border.hsl.a).toBeCloseTo(0.2);
    expect(result.glow.hsl.a).toBeCloseTo(0.15);
    expect(result.hover.hsl.a).toBeCloseTo(0.08);
  });

  it("preserves base color H/S/L, only alpha differs", () => {
    const base = new Color({ h: 200, s: 80, l: 50, a: 1 });
    const steps = { bg: 10, border: 20, glow: 15, hover: 8 };

    const result = generateAlphaVariants(base, steps);

    for (const variant of [result.bg, result.border, result.glow, result.hover]) {
      expect(variant.hsl.h).toBeCloseTo(base.hsl.h);
      expect(variant.hsl.s).toBeCloseTo(base.hsl.s);
      expect(variant.hsl.l).toBeCloseTo(base.hsl.l);
    }
  });

  it("respects custom alpha steps", () => {
    const base = new Color("#FF0000");
    const steps = { bg: 50, border: 75, glow: 30, hover: 5 };

    const result = generateAlphaVariants(base, steps);

    expect(result.bg.hsl.a).toBeCloseTo(0.5);
    expect(result.border.hsl.a).toBeCloseTo(0.75);
    expect(result.glow.hsl.a).toBeCloseTo(0.3);
    expect(result.hover.hsl.a).toBeCloseTo(0.05);
  });

  it("outputs OKLCH with alpha syntax", () => {
    const base = new Color("#6439FF");
    const steps = { bg: 10, border: 20, glow: 15, hover: 8 };

    const result = generateAlphaVariants(base, steps);

    expect(result.bg.toOKLCH()).toMatch(/oklch\(.+ \/ \d+%\)/);
    expect(result.border.toOKLCH()).toMatch(/oklch\(.+ \/ \d+%\)/);
    expect(result.glow.toOKLCH()).toMatch(/oklch\(.+ \/ \d+%\)/);
    expect(result.hover.toOKLCH()).toMatch(/oklch\(.+ \/ \d+%\)/);
  });
});

describe("alpha variants in CSS output", () => {
  it("does not include alpha vars when alphaVariants is false", () => {
    const theme = createTestTheme({ palette: { alphaVariants: false } });
    const result = generateCSS(theme);

    expect(result.content).not.toContain("-bg:");
    expect(result.content).not.toContain("-glow:");
  });

  it("includes alpha vars for each harmony color when enabled", () => {
    const theme = createTestTheme({ palette: { alphaVariants: true } });
    const result = generateCSS(theme);

    // Analogous = 3 colors: primary, secondary, tertiary
    for (const name of ["primary", "secondary", "tertiary"]) {
      expect(result.content).toContain(`--color-${name}-bg:`);
      expect(result.content).toContain(`--color-${name}-border:`);
      expect(result.content).toContain(`--color-${name}-glow:`);
      expect(result.content).toContain(`--color-${name}-hover:`);
    }
  });

  it("alpha variant values contain OKLCH with alpha", () => {
    const theme = createTestTheme({ palette: { alphaVariants: true } });
    const result = generateCSS(theme);

    // All alpha variants should have the / N% alpha syntax
    const bgMatch = result.content.match(/--color-primary-bg:\s*(oklch\([^)]+\))/);
    expect(bgMatch).not.toBeNull();
    expect(bgMatch![1]).toMatch(/\/ \d+%/);
  });
});
