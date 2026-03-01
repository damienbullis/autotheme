import { describe, it, expect } from "vitest";
import {
  generateCSS,
  generateScaledValues,
  generateCenteredScale,
  generateTypographyNames,
  findContrastColor,
  getHarmonyName,
  buildScaleMapping,
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

describe("buildScaleMapping", () => {
  it("maps exactly when count matches scale points length", () => {
    const mapping = buildScaleMapping(5, [50, 100, 200, 300, 400]);
    expect(mapping).toEqual({ 1: 50, 2: 100, 3: 200, 4: 300, 5: 400 });
  });

  it("distributes 3 items across 5-point scale", () => {
    const mapping = buildScaleMapping(3, [50, 100, 200, 300, 400]);
    expect(mapping[1]).toBe(50);
    expect(mapping[3]).toBe(400);
  });

  it("returns empty mapping for count 0", () => {
    expect(buildScaleMapping(0, [50, 100, 200])).toEqual({});
  });

  it("returns middle point for count 1", () => {
    const mapping = buildScaleMapping(1, [50, 100, 200, 300, 400]);
    expect(mapping[1]).toBe(200);
  });
});

describe("generateCenteredScale", () => {
  it("generates centered scale with base in the middle", () => {
    const values = generateCenteredScale(1, 1.25, 7);
    expect(values).toHaveLength(7);
    // Base should be at index 3 (floor(7/2) = 3 steps below)
    expect(values[3]).toBeCloseTo(1, 3);
    // Values should be ascending
    for (let i = 1; i < values.length; i++) {
      expect(values[i]!).toBeGreaterThan(values[i - 1]!);
    }
  });

  it("produces correct values for 7 steps with ratio 1.25", () => {
    const values = generateCenteredScale(1, 1.25, 7);
    expect(values[0]).toBeCloseTo(0.512, 3); // 1/1.25^3
    expect(values[1]).toBeCloseTo(0.64, 2); // 1/1.25^2
    expect(values[2]).toBeCloseTo(0.8, 2); // 1/1.25^1
    expect(values[3]).toBeCloseTo(1.0, 3); // base
    expect(values[4]).toBeCloseTo(1.25, 2); // 1*1.25^1
    expect(values[5]).toBeCloseTo(1.5625, 3); // 1*1.25^2
    expect(values[6]).toBeCloseTo(1.953, 2); // 1*1.25^3
  });
});

describe("generateTypographyNames", () => {
  it("generates correct names for 7 steps", () => {
    const names = generateTypographyNames(7);
    expect(names).toEqual(["2xs", "xs", "sm", "base", "md", "lg", "xl"]);
  });

  it("generates correct names for 5 steps", () => {
    const names = generateTypographyNames(5);
    expect(names).toEqual(["xs", "sm", "base", "md", "lg"]);
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

    // Has typography scale (centered, 7 steps default)
    expect(result.content).toMatch(/--text-base:\s*[\d.]+rem/);
    expect(result.content).toMatch(/--text-xl:\s*[\d.]+rem/);

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

    // Base value appears in the centered scale
    expect(result.content).toContain("--text-base: 0.875rem;");
  });

  it("mode 'light' produces no .dark block", () => {
    const theme = createTestTheme({ mode: "light" });
    const result = generateCSS(theme);

    expect(result.content).toContain(":root {");
    expect(result.content).not.toContain(".dark {");
  });

  it("mode 'dark' puts dark values under :root and has no .dark block", () => {
    const theme = createTestTheme({ mode: "dark" });
    const result = generateCSS(theme);

    // Should have dark overrides under :root
    expect(result.content).toContain(":root {");
    expect(result.content).not.toContain(".dark {");
    // Dark mode CSS is emitted under :root
    expect(result.content).toMatch(/:root \{[\s\S]*Dark Mode/);
  });

  it("mode 'both' matches current behavior with :root and .dark", () => {
    const theme = createTestTheme({ mode: "both" });
    const result = generateCSS(theme);

    expect(result.content).toContain(":root {");
    expect(result.content).toContain(".dark {");
  });

  it("uses manual typography values when provided", () => {
    const theme = createTestTheme({
      typography: { values: [0.75, 1, 1.5] },
    });
    const result = generateCSS(theme);

    expect(result.content).toContain("--text-sm: 0.750rem;");
    expect(result.content).toContain("--text-base: 1.000rem;");
    expect(result.content).toContain("--text-md: 1.500rem;");
  });

  it("uses custom typography names when provided", () => {
    const theme = createTestTheme({
      typography: {
        steps: 3,
        names: ["small", "normal", "large"],
      },
    });
    const result = generateCSS(theme);

    expect(result.content).toContain("--text-small:");
    expect(result.content).toContain("--text-normal:");
    expect(result.content).toContain("--text-large:");
  });

  it("spacing is disabled by default", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);
    expect(result.content).not.toContain("Spacing Scale");
  });

  it("generates spacing with independent config when enabled", () => {
    const theme = createTestTheme({
      spacing: { enabled: true, base: 0.25, ratio: 2, steps: 4 },
    });
    const result = generateCSS(theme);

    expect(result.content).toContain("Spacing Scale");
    expect(result.content).toContain("--spacing-1: 0.250rem;");
    expect(result.content).toContain("--spacing-2: 0.500rem;");
    expect(result.content).toContain("--spacing-3: 1.000rem;");
    expect(result.content).toContain("--spacing-4: 2.000rem;");
  });

  it("uses manual spacing values when provided", () => {
    const theme = createTestTheme({
      spacing: { enabled: true, values: [0.5, 1, 2, 4] },
    });
    const result = generateCSS(theme);

    expect(result.content).toContain("--spacing-1: 0.500rem;");
    expect(result.content).toContain("--spacing-2: 1.000rem;");
    expect(result.content).toContain("--spacing-3: 2.000rem;");
    expect(result.content).toContain("--spacing-4: 4.000rem;");
  });

  it("omits typography when disabled", () => {
    const theme = createTestTheme({ typography: { enabled: false } });
    const result = generateCSS(theme);

    expect(result.content).not.toContain("Typography Scale");
    expect(result.content).not.toContain("--text-");
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
