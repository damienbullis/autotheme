import { describe, it, expect } from "vitest";
import { generatePatternSVG, generatePatternCSS } from "../../src/generators/patterns";
import { Color } from "../../src/core/color";
import { generateCSS } from "../../src/generators/css";
import { createTestTheme } from "../helpers/test-theme";
import type { PatternType, PatternsConfig } from "../../src/config/types";

const ALL_TYPES: PatternType[] = [
  "stripes-diagonal",
  "stripes-horizontal",
  "stripes-vertical",
  "dots",
  "crosshatch",
];

describe("generatePatternSVG", () => {
  it.each(ALL_TYPES)("produces valid SVG data URL for %s", (type) => {
    const result = generatePatternSVG(type, "#333333", "md");
    expect(result).toMatch(/^url\("data:image\/svg\+xml,/);
    expect(result).toContain("svg");
  });

  it("density affects stroke width — lg has wider strokes than sm", () => {
    const sm = generatePatternSVG("stripes-diagonal", "#333", "sm");
    const lg = generatePatternSVG("stripes-diagonal", "#333", "lg");

    // sm: strokeWidth=1, lg: strokeWidth=3
    const smDecoded = decodeURIComponent(sm);
    const lgDecoded = decodeURIComponent(lg);

    expect(smDecoded).toContain("stroke-width='1'");
    expect(lgDecoded).toContain("stroke-width='3'");
  });

  it("color appears in SVG output", () => {
    const testColor = "oklch(0.500 0.100 250.000)";
    const result = generatePatternSVG("dots", testColor, "md");
    const decoded = decodeURIComponent(result);
    expect(decoded).toContain(testColor);
  });
});

describe("generatePatternCSS", () => {
  it("produces correct CSS variable names", () => {
    const config: PatternsConfig = {
      types: ["stripes-diagonal", "dots"],
      density: "md",
    };
    const primary = Color.fromOklch(0.6, 0.15, 250);
    const border = Color.fromOklch(0.3, 0.02, 250);
    const css = generatePatternCSS(config, primary, border, "oklch", true);

    expect(css).toContain("--pattern-stripes-diagonal:");
    expect(css).toContain("--pattern-dots:");
    expect(css).not.toContain("--pattern-crosshatch:");
  });

  it("includes comment header when comments enabled", () => {
    const config: PatternsConfig = {
      types: ["dots"],
      density: "sm",
    };
    const primary = Color.fromOklch(0.6, 0.15, 250);
    const border = Color.fromOklch(0.3, 0.02, 250);
    const css = generatePatternCSS(config, primary, border, "oklch", true);
    expect(css).toContain("/* Pattern Utilities */");
  });
});

describe("integration", () => {
  it("patterns: true in config produces pattern vars in CSS output", () => {
    const theme = createTestTheme({ patterns: true });
    const output = generateCSS(theme);

    for (const type of ALL_TYPES) {
      expect(output.content).toContain(`--pattern-${type}:`);
    }
  });

  it("patterns: false (default) does not produce pattern vars", () => {
    const theme = createTestTheme();
    const output = generateCSS(theme);
    expect(output.content).not.toContain("--pattern-");
  });

  it("patterns with custom types only includes specified types", () => {
    const theme = createTestTheme({
      patterns: { types: ["dots", "crosshatch"], density: "lg" },
    });
    const output = generateCSS(theme);

    expect(output.content).toContain("--pattern-dots:");
    expect(output.content).toContain("--pattern-crosshatch:");
    expect(output.content).not.toContain("--pattern-stripes-diagonal:");
  });
});
