import { describe, it, expect } from "vitest";
import { Color } from "../../src/core/color";
import { generateFullPalette } from "../../src/core/palette";
import type { GeneratedTheme } from "../../src/generators/types";
import type { AutoThemeConfig } from "../../src/config/types";

// Import the individual generators to test their integration
import { generateCSS } from "../../src/generators/css";
import { generateTailwindCSS } from "../../src/generators/tailwind";
import { generatePreview } from "../../src/generators/preview";
import { generateDarkModeScript } from "../../src/generators/script";

function createTestTheme(config: Partial<AutoThemeConfig> = {}): GeneratedTheme {
  const primaryColor = new Color("#6439FF");
  const palette = generateFullPalette(primaryColor, "analogous");
  const fullConfig: AutoThemeConfig = {
    color: "#6439FF",
    harmony: "analogous",
    output: "./test-output/autotheme.css",
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
    ...config,
  };

  return { palette, config: fullConfig };
}

describe("generators integration", () => {
  it("generates main CSS output", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);

    expect(result.filename).toBe("./test-output/autotheme.css");
    expect(result.content).toContain(":root {");
  });

  it("generates Tailwind CSS output", () => {
    const theme = createTestTheme({ tailwind: true });
    const result = generateTailwindCSS(theme);

    expect(result.filename).toBe("./test-output/autotheme.tailwind.css");
    expect(result.content).toContain("@theme {");
  });

  it("generates preview HTML output", () => {
    const theme = createTestTheme({ preview: true });
    const result = generatePreview(theme);

    expect(result.filename).toBe("./test-output/autotheme.preview.html");
    expect(result.content).toContain("<!DOCTYPE html>");
  });

  it("generates dark mode script output", () => {
    const result = generateDarkModeScript();

    expect(result.filename).toBe("darkmode.js");
    expect(result.content).toContain("toggleDarkMode");
  });

  it("all generators return consistent GeneratorOutput shape", () => {
    const theme = createTestTheme();

    const outputs = [
      generateCSS(theme),
      generateTailwindCSS(theme),
      generatePreview(theme),
      generateDarkModeScript(),
    ];

    for (const output of outputs) {
      expect(output).toHaveProperty("filename");
      expect(output).toHaveProperty("content");
      expect(typeof output.filename).toBe("string");
      expect(typeof output.content).toBe("string");
      expect(output.filename.length).toBeGreaterThan(0);
      expect(output.content.length).toBeGreaterThan(0);
    }
  });

  it("Tailwind output includes base CSS variables", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    // Should include the base CSS from generateCSS with Tailwind naming
    expect(result.content).toContain("--color-primary-500:");
    expect(result.content).toContain("--color-primary-50:");
    expect(result.content).toContain("--color-secondary-500:");
  });
});

describe("exports", () => {
  it("exports all generators from index", async () => {
    const generators = await import("../../src/generators");

    expect(generators.generateCSS).toBeDefined();
    expect(generators.generateTailwindCSS).toBeDefined();
    expect(generators.generatePreview).toBeDefined();
    expect(generators.generateDarkModeScript).toBeDefined();
    expect(generators.generateNoiseSVG).toBeDefined();
    expect(generators.generateDarkModeCSS).toBeDefined();
    expect(generators.generateUtilityClasses).toBeDefined();
    expect(generators.writeOutputs).toBeDefined();
  });
});
