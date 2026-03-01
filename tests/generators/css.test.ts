import { describe, it, expect } from "vitest";
import {
  generateCSS,
  generateScaledValues,
  findContrastColor,
  getHarmonyName,
} from "../../src/generators/css";
import { Color } from "../../src/core/color";
import { createTestTheme } from "../helpers/test-theme";

describe("getHarmonyName", () => {
  it("returns semantic names for indices 0-3, then color-N", () => {
    expect(getHarmonyName(0)).toBe("primary");
    expect(getHarmonyName(1)).toBe("secondary");
    expect(getHarmonyName(2)).toBe("tertiary");
    expect(getHarmonyName(3)).toBe("quaternary");
    expect(getHarmonyName(4)).toBe("color-5");
    expect(getHarmonyName(5)).toBe("color-6");
  });
});

describe("generateScaledValues", () => {
  it("generates exponentially scaled values", () => {
    const values = generateScaledValues(1, 2, 4);

    expect(values).toHaveLength(4);
    expect(values[0]).toBe(1);
    expect(values[1]).toBe(2);
    expect(values[2]).toBe(4);
    expect(values[3]).toBe(8);
  });

  it("applies fractional scalar correctly", () => {
    const values = generateScaledValues(0.5, 1.5, 3);

    expect(values).toHaveLength(3);
    expect(values[0]).toBeCloseTo(0.5);
    expect(values[1]).toBeCloseTo(0.75);
    expect(values[2]).toBeCloseTo(1.125);
  });

  it("returns empty array for count 0", () => {
    expect(generateScaledValues(1, 2, 0)).toHaveLength(0);
  });
});

describe("findContrastColor", () => {
  it("returns dark text for light backgrounds, light text for dark", () => {
    const light = new Color({ h: 200, s: 50, l: 80, a: 1 });
    const dark = new Color({ h: 200, s: 50, l: 20, a: 1 });

    const contrastOnLight = findContrastColor(light);
    const contrastOnDark = findContrastColor(dark);

    expect(contrastOnLight.hsl.l).toBe(5);
    expect(contrastOnDark.hsl.l).toBe(95);
  });

  it("preserves hue from background", () => {
    const bg = new Color({ h: 120, s: 50, l: 50, a: 1 });
    expect(findContrastColor(bg).hsl.h).toBe(120);
  });
});

describe("generateCSS", () => {
  it("generates complete CSS with palette colors and typography for default config", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);

    // Correct filename
    expect(result.filename).toBe("./autotheme.css");

    // Has root and dark mode blocks
    expect(result.content).toContain(":root {");
    expect(result.content).toContain(".dark {");

    // Has full color scale for primary (50-950 + foreground + contrast + tones)
    const oklchPattern = /oklch\([^)]+\)/;
    expect(result.content).toMatch(new RegExp(`--color-primary-50:\\s*${oklchPattern.source}`));
    expect(result.content).toMatch(new RegExp(`--color-primary-500:\\s*${oklchPattern.source}`));
    expect(result.content).toMatch(new RegExp(`--color-primary-950:\\s*${oklchPattern.source}`));
    expect(result.content).toMatch(
      new RegExp(`--color-primary-foreground:\\s*${oklchPattern.source}`),
    );
    expect(result.content).toMatch(
      new RegExp(`--color-primary-contrast:\\s*${oklchPattern.source}`),
    );
    expect(result.content).toMatch(new RegExp(`--color-primary-tone-1:\\s*${oklchPattern.source}`));

    // Has secondary colors (analogous = 3 colors)
    expect(result.content).toMatch(new RegExp(`--color-secondary-500:\\s*${oklchPattern.source}`));
    expect(result.content).toMatch(new RegExp(`--color-tertiary-500:\\s*${oklchPattern.source}`));

    // Has typography scale
    expect(result.content).toMatch(/--text-xs:\s*[\d.]+rem/);
    expect(result.content).toMatch(/--text-4xl:\s*[\d.]+rem/);

    // Does NOT have optional features by default
    expect(result.content).not.toContain("Spacing Scale");
    expect(result.content).not.toContain("Background Images");
    expect(result.content).not.toContain("Gradients");
    expect(result.content).not.toContain("Shadcn UI");
    expect(result.content).not.toContain("Utility Classes");
  });

  it("includes all optional sections when features are enabled", () => {
    const theme = createTestTheme({
      shadcn: { enabled: true },
      spacing: { enabled: true },
      noise: true,
      gradients: true,
      utilities: true,
    });
    const result = generateCSS(theme);

    expect(result.content).toContain("Shadcn UI Compatible Theme Variables");
    expect(result.content).toContain("Spacing Scale");
    expect(result.content).toContain("Background Images");
    expect(result.content).toContain("Gradients");
    expect(result.content).toContain("Utility Classes");
  });

  it("uses custom prefix for all color variables", () => {
    const theme = createTestTheme({ palette: { prefix: "at" } });
    const result = generateCSS(theme);

    expect(result.content).toContain("--at-primary-500:");
    expect(result.content).toContain("--at-primary-foreground:");
    expect(result.content).toContain("--at-primary-contrast:");
    expect(result.content).toContain("--at-primary-tone-1:");
    expect(result.content).not.toContain("--color-primary-500:");
  });

  it("applies custom typography base", () => {
    const theme = createTestTheme({ typography: { base: 0.875 } });
    const result = generateCSS(theme);

    expect(result.content).toContain("--text-xs: 0.875rem;");
  });

  it("uses OKLCH color format for all color values", () => {
    const theme = createTestTheme({ shadcn: { enabled: true } });
    const result = generateCSS(theme);

    // Verify multiple color types use OKLCH
    expect(result.content).toMatch(/--color-primary-500:\s*oklch\(/);
    expect(result.content).toMatch(/--color-primary-50:\s*oklch\(/);
    expect(result.content).toMatch(/--background:\s*oklch\(/);
    expect(result.content).toMatch(/--primary:\s*oklch\(/);
  });
});
