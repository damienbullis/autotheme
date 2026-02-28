import { describe, it, expect } from "vitest";
import { generateDarkModeCSS } from "../../src/generators/dark-mode";
import { Color } from "../../src/core/color";
import { generateFullPalette } from "../../src/core/palette";
import type { GeneratedTheme } from "../../src/generators/types";
import type { AutoThemeConfig } from "../../src/config/types";

function createTestTheme(overrides: Partial<AutoThemeConfig> = {}): GeneratedTheme {
  const primaryColor = new Color("#6439FF");
  const palette = generateFullPalette(primaryColor, "triadic");
  const config: AutoThemeConfig = {
    color: "#6439FF",
    harmony: "triadic",
    output: "./autotheme.css",
    preview: false,
    tailwind: false,
    darkModeScript: false,
    scalar: 1.618,
    contrastTarget: 7,
    radius: "0.625rem",
    prefix: "color",
    fontSize: 1,
    gradients: true,
    spacing: true,
    noise: true,
    shadcn: true,
    utilities: true,
    ...overrides,
  };

  return { palette, config };
}

describe("generateDarkModeCSS", () => {
  it("generates CSS with .dark selector", () => {
    const theme = createTestTheme();
    const result = generateDarkModeCSS(theme);

    expect(result).toContain(".dark {");
    expect(result).toMatch(/}$/);
  });

  it("generates dark mode foreground colors for each palette color", () => {
    const theme = createTestTheme();
    const result = generateDarkModeCSS(theme);

    // Should have entries for each color in the palette (primary, secondary, tertiary)
    expect(result).toContain("--color-primary-foreground:");
    expect(result).toContain("--color-secondary-foreground:");
    expect(result).toContain("--color-tertiary-foreground:");
  });

  it("includes contrast colors for each palette color", () => {
    const theme = createTestTheme();
    const result = generateDarkModeCSS(theme);

    expect(result).toContain("--color-primary-contrast:");
    expect(result).toContain("--color-secondary-contrast:");
    expect(result).toContain("--color-tertiary-contrast:");
  });

  it("generates valid OKLCH values format", () => {
    const theme = createTestTheme();
    const result = generateDarkModeCSS(theme);

    // Check that values are in OKLCH format
    const oklchPattern = /--color-\w+-(?:foreground|contrast):\s*oklch\([^)]+\);/;
    expect(result).toMatch(oklchPattern);
  });

  it("includes comment headers for each color", () => {
    const theme = createTestTheme();
    const result = generateDarkModeCSS(theme);

    expect(result).toContain("/* Primary Dark Mode */");
    expect(result).toContain("/* Secondary Dark Mode */");
    expect(result).toContain("/* Tertiary Dark Mode */");
  });

  it("uses custom prefix in variable names", () => {
    const theme = createTestTheme({ prefix: "at" });
    const result = generateDarkModeCSS(theme);

    expect(result).toContain("--at-primary-foreground:");
    expect(result).toContain("--at-primary-contrast:");
    expect(result).not.toContain("--color-primary-foreground:");
  });
});
