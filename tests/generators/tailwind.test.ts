import { describe, it, expect } from "vitest";
import { generateTailwindCSS } from "../../src/generators/tailwind";
import { Color } from "../../src/core/color";
import { generateFullPalette } from "../../src/core/palette";
import type { GeneratedTheme } from "../../src/generators/types";
import type { AutoThemeConfig } from "../../src/config/types";

function createTestTheme(overrides: Partial<AutoThemeConfig> = {}): GeneratedTheme {
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
    ...overrides,
  };

  return { palette, config };
}

describe("generateTailwindCSS", () => {
  it("generates output with correct filename", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.filename).toBe("./autotheme.tailwind.css");
  });

  it("includes AutoTheme CSS variables", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("/* AutoTheme Variables (Tailwind v4 compatible) */");
    expect(result.content).toContain(":root {");
  });

  it("includes @theme directive", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("Tailwind v4 Theme Integration");
    expect(result.content).toContain("@theme {");
  });

  it("maps Shadcn semantic colors", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("--color-background: var(--background);");
    expect(result.content).toContain("--color-foreground: var(--foreground);");
  });

  it("maps all Shadcn colors", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("--color-card: var(--card);");
    expect(result.content).toContain("--color-popover: var(--popover);");
    expect(result.content).toContain("--color-muted: var(--muted);");
    expect(result.content).toContain("--color-accent: var(--accent);");
    expect(result.content).toContain("--color-destructive: var(--destructive);");
  });

  it("includes color scale variables in :root", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    // Check that the :root section contains Tailwind-namespaced color variables
    expect(result.content).toContain("--color-primary-500:");
    expect(result.content).toContain("--color-primary-50:");
    expect(result.content).toContain("--color-primary-950:");
    expect(result.content).toContain("--color-secondary-500:");
  });

  it("includes background image variables", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("/* Background Images */");
    expect(result.content).toContain("--background-image-noise:");
    expect(result.content).toContain("--background-image-linear:");
    expect(result.content).toContain("--background-image-radial:");
  });

  it("includes custom utility definitions", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("/* Custom Utilities */");
    expect(result.content).toContain("@utility radial-position-* {");
    expect(result.content).toContain("@utility radial-scale-* {");
    expect(result.content).toContain("@utility gradient-from-* {");
    expect(result.content).toContain("@utility gradient-to-* {");
  });

  it("includes radius variables", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("/* Radius */");
    expect(result.content).toContain("--radius-sm:");
    expect(result.content).toContain("--radius-md:");
    expect(result.content).toContain("--radius-lg:");
    expect(result.content).toContain("--radius-xl:");
  });

  it("includes typography scale in @theme block", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);
    const themeBlock = result.content.split("@theme {")[1];

    expect(themeBlock).toContain("--text-xs:");
    expect(themeBlock).toContain("--text-sm:");
    expect(themeBlock).toContain("--text-4xl:");
  });

  it("includes spacing scale in @theme block when enabled", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);
    const themeBlock = result.content.split("@theme {")[1];

    expect(themeBlock).toContain("--spacing-1:");
    expect(themeBlock).toContain("--spacing-10:");
  });

  it("omits spacing in @theme when spacing is false", () => {
    const theme = createTestTheme({ spacing: false });
    const result = generateTailwindCSS(theme);
    const themeBlock = result.content.split("@theme {")[1];

    expect(themeBlock).not.toContain("--spacing-1:");
  });

  it("omits shadcn mappings when shadcn is false", () => {
    const theme = createTestTheme({ shadcn: false });
    const result = generateTailwindCSS(theme);

    expect(result.content).not.toContain("--color-background: var(--background);");
    expect(result.content).not.toContain("/* Radius */");
  });

  it("adds prefix remapping when prefix is not 'color'", () => {
    const theme = createTestTheme({ prefix: "at" });
    const result = generateTailwindCSS(theme);
    const themeBlock = result.content.split("@theme {")[1];

    expect(themeBlock).toContain("--color-primary-500: var(--at-primary-500);");
    expect(themeBlock).toContain("--color-primary-foreground: var(--at-primary-foreground);");
  });
});
