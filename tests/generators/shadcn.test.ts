import { describe, it, expect } from "vitest";
import {
  generateShadcnColors,
  generateShadcnCSS,
  generateShadcnLightCSS,
  generateShadcnDarkCSS,
} from "../../src/generators/shadcn";
import { Color } from "../../src/core/color";
import { generateFullPalette } from "../../src/core/palette";
import type { GeneratedTheme } from "../../src/generators/types";
import type { AutoThemeConfig } from "../../src/config/types";

function createTestTheme(): GeneratedTheme {
  const primaryColor = new Color("#6439FF");
  const palette = generateFullPalette(primaryColor, "analogous");
  const config: AutoThemeConfig = {
    color: "#6439FF",
    harmony: "analogous",
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
  };

  return { palette, config };
}

describe("generateShadcnColors", () => {
  it("returns both light and dark color sets", () => {
    const theme = createTestTheme();
    const colors = generateShadcnColors(theme);

    expect(colors.light).toBeDefined();
    expect(colors.dark).toBeDefined();
  });

  it("generates all required light mode colors", () => {
    const theme = createTestTheme();
    const { light } = generateShadcnColors(theme);

    expect(light.background).toBeInstanceOf(Color);
    expect(light.foreground).toBeInstanceOf(Color);
    expect(light.primary).toBeInstanceOf(Color);
    expect(light.primaryForeground).toBeInstanceOf(Color);
    expect(light.secondary).toBeInstanceOf(Color);
    expect(light.secondaryForeground).toBeInstanceOf(Color);
    expect(light.accent).toBeInstanceOf(Color);
    expect(light.accentForeground).toBeInstanceOf(Color);
    expect(light.muted).toBeInstanceOf(Color);
    expect(light.mutedForeground).toBeInstanceOf(Color);
    expect(light.destructive).toBeInstanceOf(Color);
    expect(light.destructiveForeground).toBeInstanceOf(Color);
    expect(light.card).toBeInstanceOf(Color);
    expect(light.cardForeground).toBeInstanceOf(Color);
    expect(light.popover).toBeInstanceOf(Color);
    expect(light.popoverForeground).toBeInstanceOf(Color);
    expect(light.border).toBeInstanceOf(Color);
    expect(light.input).toBeInstanceOf(Color);
    expect(light.ring).toBeInstanceOf(Color);
  });

  it("generates all required dark mode colors", () => {
    const theme = createTestTheme();
    const { dark } = generateShadcnColors(theme);

    expect(dark.background).toBeInstanceOf(Color);
    expect(dark.foreground).toBeInstanceOf(Color);
    expect(dark.primary).toBeInstanceOf(Color);
    expect(dark.primaryForeground).toBeInstanceOf(Color);
    expect(dark.secondary).toBeInstanceOf(Color);
    expect(dark.secondaryForeground).toBeInstanceOf(Color);
    expect(dark.accent).toBeInstanceOf(Color);
    expect(dark.accentForeground).toBeInstanceOf(Color);
    expect(dark.muted).toBeInstanceOf(Color);
    expect(dark.mutedForeground).toBeInstanceOf(Color);
    expect(dark.destructive).toBeInstanceOf(Color);
    expect(dark.destructiveForeground).toBeInstanceOf(Color);
  });

  it("generates chart colors", () => {
    const theme = createTestTheme();
    const { light } = generateShadcnColors(theme);

    expect(light.chart1).toBeInstanceOf(Color);
    expect(light.chart2).toBeInstanceOf(Color);
    expect(light.chart3).toBeInstanceOf(Color);
    expect(light.chart4).toBeInstanceOf(Color);
    expect(light.chart5).toBeInstanceOf(Color);
  });

  it("generates sidebar colors", () => {
    const theme = createTestTheme();
    const { light } = generateShadcnColors(theme);

    expect(light.sidebar).toBeInstanceOf(Color);
    expect(light.sidebarForeground).toBeInstanceOf(Color);
    expect(light.sidebarPrimary).toBeInstanceOf(Color);
    expect(light.sidebarPrimaryForeground).toBeInstanceOf(Color);
    expect(light.sidebarAccent).toBeInstanceOf(Color);
    expect(light.sidebarAccentForeground).toBeInstanceOf(Color);
    expect(light.sidebarBorder).toBeInstanceOf(Color);
    expect(light.sidebarRing).toBeInstanceOf(Color);
  });

  it("light background is light", () => {
    const theme = createTestTheme();
    const { light } = generateShadcnColors(theme);

    // Light background should have high lightness
    expect(light.background.hsl.l).toBeGreaterThan(70);
  });

  it("dark background is dark", () => {
    const theme = createTestTheme();
    const { dark } = generateShadcnColors(theme);

    // Dark background should have low lightness
    expect(dark.background.hsl.l).toBeLessThan(20);
  });

  it("destructive color is in red hue range", () => {
    const theme = createTestTheme();
    const { light } = generateShadcnColors(theme);

    // Destructive should be reddish (hue 0-30 or 340-360)
    const hue = light.destructive.hsl.h;
    expect(hue < 40 || hue > 340).toBe(true);
  });

  it("primary color matches theme primary", () => {
    const theme = createTestTheme();
    const { light } = generateShadcnColors(theme);
    const primaryBase = theme.palette.palettes[0]?.base;

    expect(light.primary.hex).toBe(primaryBase?.hex);
  });
});

describe("generateShadcnLightCSS", () => {
  it("generates :root selector", () => {
    const theme = createTestTheme();
    const colors = generateShadcnColors(theme);
    const css = generateShadcnLightCSS(colors.light);

    expect(css).toContain(":root {");
  });

  it("includes radius variable", () => {
    const theme = createTestTheme();
    const colors = generateShadcnColors(theme);
    const css = generateShadcnLightCSS(colors.light, "1rem");

    expect(css).toContain("--radius: 1rem");
  });

  it("uses OKLCH format for colors", () => {
    const theme = createTestTheme();
    const colors = generateShadcnColors(theme);
    const css = generateShadcnLightCSS(colors.light);

    expect(css).toMatch(/--background:\s*oklch\(/);
    expect(css).toMatch(/--foreground:\s*oklch\(/);
    expect(css).toMatch(/--primary:\s*oklch\(/);
  });

  it("includes all Shadcn variables", () => {
    const theme = createTestTheme();
    const colors = generateShadcnColors(theme);
    const css = generateShadcnLightCSS(colors.light);

    const requiredVars = [
      "--background:",
      "--foreground:",
      "--card:",
      "--card-foreground:",
      "--popover:",
      "--popover-foreground:",
      "--primary:",
      "--primary-foreground:",
      "--secondary:",
      "--secondary-foreground:",
      "--muted:",
      "--muted-foreground:",
      "--accent:",
      "--accent-foreground:",
      "--destructive:",
      "--destructive-foreground:",
      "--border:",
      "--input:",
      "--ring:",
    ];

    for (const varName of requiredVars) {
      expect(css).toContain(varName);
    }
  });

  it("includes chart variables", () => {
    const theme = createTestTheme();
    const colors = generateShadcnColors(theme);
    const css = generateShadcnLightCSS(colors.light);

    expect(css).toContain("--chart-1:");
    expect(css).toContain("--chart-2:");
    expect(css).toContain("--chart-3:");
    expect(css).toContain("--chart-4:");
    expect(css).toContain("--chart-5:");
  });

  it("includes sidebar variables", () => {
    const theme = createTestTheme();
    const colors = generateShadcnColors(theme);
    const css = generateShadcnLightCSS(colors.light);

    expect(css).toContain("--sidebar:");
    expect(css).toContain("--sidebar-foreground:");
    expect(css).toContain("--sidebar-primary:");
    expect(css).toContain("--sidebar-accent:");
  });
});

describe("generateShadcnDarkCSS", () => {
  it("generates .dark selector", () => {
    const theme = createTestTheme();
    const colors = generateShadcnColors(theme);
    const css = generateShadcnDarkCSS(colors.dark);

    expect(css).toContain(".dark {");
  });

  it("uses OKLCH format for colors", () => {
    const theme = createTestTheme();
    const colors = generateShadcnColors(theme);
    const css = generateShadcnDarkCSS(colors.dark);

    expect(css).toMatch(/--background:\s*oklch\(/);
    expect(css).toMatch(/--foreground:\s*oklch\(/);
  });

  it("includes all Shadcn variables", () => {
    const theme = createTestTheme();
    const colors = generateShadcnColors(theme);
    const css = generateShadcnDarkCSS(colors.dark);

    const requiredVars = [
      "--background:",
      "--foreground:",
      "--primary:",
      "--secondary:",
      "--accent:",
      "--muted:",
      "--destructive:",
    ];

    for (const varName of requiredVars) {
      expect(css).toContain(varName);
    }
  });
});

describe("generateShadcnCSS", () => {
  it("generates both light and dark mode CSS", () => {
    const theme = createTestTheme();
    const css = generateShadcnCSS(theme);

    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");
  });

  it("uses provided radius", () => {
    const theme = createTestTheme();
    const css = generateShadcnCSS(theme, "1.5rem");

    expect(css).toContain("--radius: 1.5rem");
  });

  it("uses default radius when not provided", () => {
    const theme = createTestTheme();
    const css = generateShadcnCSS(theme);

    expect(css).toContain("--radius: 0.625rem");
  });
});
