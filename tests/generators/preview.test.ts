import { describe, it, expect } from "vitest";
import { generatePreview } from "../../src/generators/preview";
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
    preview: true,
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

describe("generatePreview", () => {
  it("generates output with correct filename", () => {
    const theme = createTestTheme();
    const result = generatePreview(theme);

    expect(result.filename).toBe("./autotheme.preview.html");
  });

  it("generates valid HTML5 document", () => {
    const theme = createTestTheme();
    const result = generatePreview(theme);

    expect(result.content).toContain("<!DOCTYPE html>");
    expect(result.content).toContain('<html lang="en">');
    expect(result.content).toContain("</html>");
  });

  it("includes head with meta tags", () => {
    const theme = createTestTheme();
    const result = generatePreview(theme);

    expect(result.content).toContain('<meta charset="UTF-8">');
    expect(result.content).toContain("viewport");
    expect(result.content).toContain("<title>AutoTheme Preview</title>");
  });

  it("links to generated CSS file", () => {
    const theme = createTestTheme();
    const result = generatePreview(theme);

    expect(result.content).toContain('<link rel="stylesheet" href="./autotheme.css">');
  });

  it("includes dark mode toggle button with .dark class", () => {
    const theme = createTestTheme();
    const result = generatePreview(theme);

    expect(result.content).toContain('class="dark-toggle"');
    expect(result.content).toContain("Toggle Dark Mode");
    expect(result.content).toContain("'dark'");
  });

  it("displays harmony type", () => {
    const theme = createTestTheme();
    const result = generatePreview(theme);

    expect(result.content).toContain("<strong>Harmony:</strong> triadic");
  });

  it("displays primary color", () => {
    const theme = createTestTheme();
    const result = generatePreview(theme);

    expect(result.content).toContain("<strong>Primary Color:</strong> #6439FF");
  });

  it("generates color swatches with semantic names", () => {
    const theme = createTestTheme();
    const result = generatePreview(theme);

    // Check for semantic color names (triadic = 3 colors: primary, secondary, tertiary)
    expect(result.content).toContain("Primary");
    expect(result.content).toContain("Secondary");
    expect(result.content).toContain("Tertiary");
  });

  it("includes base swatch with 500 scale value", () => {
    const theme = createTestTheme();
    const result = generatePreview(theme);

    expect(result.content).toContain('class="swatch base"');
    expect(result.content).toContain("var(--color-primary-500)");
    expect(result.content).toContain("var(--color-primary-foreground)");
    expect(result.content).toContain(">500</span>");
  });

  it("includes tint swatches (50-400 scale)", () => {
    const theme = createTestTheme();
    const result = generatePreview(theme);

    expect(result.content).toContain(">50</div>");
    expect(result.content).toContain(">100</div>");
    expect(result.content).toContain(">200</div>");
    expect(result.content).toContain(">300</div>");
    expect(result.content).toContain(">400</div>");
  });

  it("includes shade swatches (600-950 scale)", () => {
    const theme = createTestTheme();
    const result = generatePreview(theme);

    expect(result.content).toContain(">600</div>");
    expect(result.content).toContain(">700</div>");
    expect(result.content).toContain(">800</div>");
    expect(result.content).toContain(">900</div>");
    expect(result.content).toContain(">950</div>");
  });

  it("includes tone swatches (T1-T4)", () => {
    const theme = createTestTheme();
    const result = generatePreview(theme);

    expect(result.content).toContain(">T1</div>");
    expect(result.content).toContain(">T2</div>");
    expect(result.content).toContain(">T3</div>");
    expect(result.content).toContain(">T4</div>");
  });

  it("includes gradient section with semantic names", () => {
    const theme = createTestTheme();
    const result = generatePreview(theme);

    expect(result.content).toContain("<h2>Gradients</h2>");
    expect(result.content).toContain("--gradient-linear-secondary");
    expect(result.content).toContain("--gradient-linear-rainbow");
    expect(result.content).toContain("gradient-radial");
  });

  it("includes noise section", () => {
    const theme = createTestTheme();
    const result = generatePreview(theme);

    expect(result.content).toContain("<h2>Noise</h2>");
    expect(result.content).toContain("--background-image-noise");
  });

  it("includes typography scale section with Tailwind naming", () => {
    const theme = createTestTheme();
    const result = generatePreview(theme);

    expect(result.content).toContain("<h2>Typography Scale</h2>");
    expect(result.content).toContain("--text-xs");
    expect(result.content).toContain("--text-sm");
    expect(result.content).toContain("--text-md");
    expect(result.content).toContain("--text-lg");
    expect(result.content).toContain("--text-xl");
  });
});
