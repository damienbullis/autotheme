import { describe, it, expect } from "vitest";
import {
  generateSemanticTokens,
  generateSurfaces,
  generateBorders,
  generateTextHierarchy,
  generateAccents,
  generateSemanticCSS,
  applyOverrides,
} from "../../src/generators/semantic";
import { Color } from "../../src/core/color";
import { getContrastRatio } from "../../src/core/contrast";
import { generateCSS } from "../../src/generators/css";
import { createTestTheme } from "../helpers/test-theme";

describe("generateSurfaces", () => {
  it("surface-elevated is lighter than surface in light mode", () => {
    const surfaces = generateSurfaces(220, 80, 96, 4, false);
    const surface = surfaces.find((t) => t.name === "surface")!;
    const elevated = surfaces.find((t) => t.name === "surface-elevated")!;

    expect(elevated.value.hsl.l).toBeGreaterThan(surface.value.hsl.l);
  });

  it("surface-sunken is darker than surface in light mode", () => {
    const surfaces = generateSurfaces(220, 80, 96, 4, false);
    const surface = surfaces.find((t) => t.name === "surface")!;
    const sunken = surfaces.find((t) => t.name === "surface-sunken")!;

    expect(sunken.value.hsl.l).toBeLessThan(surface.value.hsl.l);
  });

  it("surface-elevated is lighter than surface in dark mode", () => {
    const surfaces = generateSurfaces(220, 80, 6, 4, true);
    const surface = surfaces.find((t) => t.name === "surface")!;
    const elevated = surfaces.find((t) => t.name === "surface-elevated")!;

    expect(elevated.value.hsl.l).toBeGreaterThan(surface.value.hsl.l);
  });

  it("surface-sunken is darker than surface in dark mode", () => {
    const surfaces = generateSurfaces(220, 80, 6, 4, true);
    const surface = surfaces.find((t) => t.name === "surface")!;
    const sunken = surfaces.find((t) => t.name === "surface-sunken")!;

    expect(sunken.value.hsl.l).toBeLessThan(surface.value.hsl.l);
  });

  it("surfaceDepth 0 produces surface near L=100 in light mode", () => {
    const surfaces = generateSurfaces(0, 50, 100, 0, false);
    const surface = surfaces.find((t) => t.name === "surface")!;
    expect(surface.value.hsl.l).toBeGreaterThanOrEqual(99);
  });

  it("surfaceDepth 0 produces surface near L=0 in dark mode", () => {
    const surfaces = generateSurfaces(0, 50, 0, 0, true);
    const surface = surfaces.find((t) => t.name === "surface")!;
    expect(surface.value.hsl.l).toBeLessThanOrEqual(1);
  });

  it("produces 4 surface tokens", () => {
    const surfaces = generateSurfaces(120, 60, 96, 4, false);
    expect(surfaces).toHaveLength(4);
    expect(surfaces.map((t) => t.name)).toEqual([
      "surface",
      "surface-elevated",
      "surface-sunken",
      "surface-overlay",
    ]);
  });

  it("surface-overlay has alpha < 1", () => {
    const surfaces = generateSurfaces(120, 60, 96, 4, false);
    const overlay = surfaces.find((t) => t.name === "surface-overlay")!;
    expect(overlay.value.hsl.a).toBeLessThan(1);
  });

  it("surfaces are tinted with primary hue at low saturation", () => {
    const surfaces = generateSurfaces(220, 80, 96, 4, false);
    const surface = surfaces.find((t) => t.name === "surface")!;
    // OKLCH round-trip may shift hue by a few degrees from the input
    expect(surface.value.hsl.h).toBeCloseTo(220, -1);
    expect(surface.value.hsl.s).toBeLessThanOrEqual(15);
  });
});

describe("generateBorders", () => {
  it("produces 3 border tokens in order: subtle < border < strong contrast", () => {
    const borders = generateBorders(220, 80, 96, false);
    expect(borders).toHaveLength(3);
    expect(borders.map((t) => t.name)).toEqual(["border-subtle", "border", "border-strong"]);

    // For light mode, borders are darker than surface (lower L)
    // subtle should be closest to surface (highest L), strong furthest (lowest L)
    const surface = new Color({ h: 220, s: 3, l: 96, a: 1 });

    const subtleContrast = getContrastRatio(borders[0]!.value, surface);
    const normalContrast = getContrastRatio(borders[1]!.value, surface);
    const strongContrast = getContrastRatio(borders[2]!.value, surface);

    expect(normalContrast).toBeGreaterThan(subtleContrast);
    expect(strongContrast).toBeGreaterThan(normalContrast);
  });

  it("borders have low saturation", () => {
    const borders = generateBorders(180, 100, 96, false);
    for (const b of borders) {
      expect(b.value.hsl.s).toBeLessThanOrEqual(15);
    }
  });
});

describe("generateTextHierarchy", () => {
  it("text-1 has highest contrast, monotonically decreasing", () => {
    const surface = new Color({ h: 220, s: 3, l: 96, a: 1 });
    const textTokens = generateTextHierarchy(220, surface, 4, 7, false);

    expect(textTokens).toHaveLength(4);

    const ratios = textTokens.map((t) => getContrastRatio(t.value, surface));
    for (let i = 1; i < ratios.length; i++) {
      expect(ratios[i - 1]!).toBeGreaterThanOrEqual(ratios[i]!);
    }
  });

  it("text-1 meets configured contrast target", () => {
    const surface = new Color({ h: 220, s: 3, l: 96, a: 1 });
    const textTokens = generateTextHierarchy(220, surface, 3, 7, false);
    const ratio = getContrastRatio(textTokens[0]!.value, surface);
    expect(ratio).toBeGreaterThanOrEqual(7);
  });

  it("all text levels meet minimum AA (4.5:1)", () => {
    const surface = new Color({ h: 220, s: 3, l: 96, a: 1 });
    const textTokens = generateTextHierarchy(220, surface, 5, 7, false);

    for (const t of textTokens) {
      const ratio = getContrastRatio(t.value, surface);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("respects textLevels count", () => {
    const surface = new Color({ h: 0, s: 0, l: 95, a: 1 });
    expect(generateTextHierarchy(0, surface, 2, 7, false)).toHaveLength(2);
    expect(generateTextHierarchy(0, surface, 5, 7, false)).toHaveLength(5);
    expect(generateTextHierarchy(0, surface, 6, 7, false)).toHaveLength(6);
  });

  it("works in dark mode (light text on dark surface)", () => {
    const darkSurface = new Color({ h: 220, s: 3, l: 6, a: 1 });
    const textTokens = generateTextHierarchy(220, darkSurface, 3, 7, true);

    // Text should be lighter than surface
    for (const t of textTokens) {
      expect(t.value.hsl.l).toBeGreaterThan(darkSurface.hsl.l);
    }

    // All meet AA
    for (const t of textTokens) {
      expect(getContrastRatio(t.value, darkSurface)).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("generateAccents", () => {
  it("accent ref points to correct palette var", () => {
    const theme = createTestTheme({ semantics: { enabled: true } });
    const accents = generateAccents(
      theme.palette,
      { accent: "primary", accentSecondary: "secondary" },
      "color",
      false,
    );

    const accent = accents.find((t) => t.name === "accent")!;
    expect(accent.ref).toBe("--color-primary-500");

    const secondary = accents.find((t) => t.name === "accent-secondary")!;
    expect(secondary.ref).toBe("--color-secondary-500");
  });

  it("produces 3 accent tokens", () => {
    const theme = createTestTheme();
    const accents = generateAccents(
      theme.palette,
      { accent: "primary", accentSecondary: "secondary" },
      "color",
      false,
    );
    expect(accents).toHaveLength(3);
    expect(accents.map((t) => t.name)).toEqual(["accent", "accent-subtle", "accent-secondary"]);
  });

  it("uses custom prefix", () => {
    const theme = createTestTheme({ palette: { prefix: "at" } });
    const accents = generateAccents(
      theme.palette,
      { accent: "primary", accentSecondary: "secondary" },
      "at",
      false,
    );
    expect(accents[0]!.ref).toBe("--at-primary-500");
  });
});

describe("applyOverrides", () => {
  it("replaces token value and clears ref", () => {
    const theme = createTestTheme({ semantics: { enabled: true } });
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");

    const accentBefore = tokens.accents.find((t) => t.name === "accent")!;
    expect(accentBefore.ref).toBeDefined();

    applyOverrides(tokens, { accent: "#FF0000" });

    const accentAfter = tokens.accents.find((t) => t.name === "accent")!;
    expect(accentAfter.ref).toBeUndefined();
    // Should be the overridden red color
    expect(accentAfter.value.hsl.h).toBeCloseTo(0, 0);
  });

  it("overrides surface token", () => {
    const theme = createTestTheme({ semantics: { enabled: true } });
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");

    applyOverrides(tokens, { surface: "#FF0000" });

    const surface = tokens.surfaces.find((t) => t.name === "surface")!;
    expect(surface.value.hsl.h).toBeCloseTo(0, 0);
    expect(surface.value.hsl.s).toBeCloseTo(100, 0);
  });
});

describe("generateSemanticCSS", () => {
  it("mode 'light' produces one :root block with semantic tokens", () => {
    const theme = createTestTheme({ mode: "light", semantics: { enabled: true } });
    const css = generateSemanticCSS(theme);

    expect(css).toContain(":root {");
    expect(css).not.toContain(".dark {");
    expect(css).toContain("--surface:");
    expect(css).toContain("--text-1:");
    expect(css).toContain("--accent:");
  });

  it("mode 'dark' produces :root with dark values", () => {
    const theme = createTestTheme({ mode: "dark", semantics: { enabled: true } });
    const css = generateSemanticCSS(theme);

    expect(css).toContain(":root {");
    expect(css).not.toContain(".dark {");
    expect(css).toContain("--surface:");
  });

  it("mode 'both' produces :root + .dark blocks", () => {
    const theme = createTestTheme({ mode: "both", semantics: { enabled: true } });
    const css = generateSemanticCSS(theme);

    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");
  });

  it("all emitted oklch values are syntactically valid", () => {
    const theme = createTestTheme({ semantics: { enabled: true } });
    const css = generateSemanticCSS(theme);

    // Match all oklch(...) values
    const oklchPattern = /oklch\([\d.]+ [\d.]+ [\d.]+(?:\s*\/\s*[\d.]+)?\)/g;
    const matches = css.match(oklchPattern);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThan(0);

    for (const match of matches!) {
      // Each should parse as valid oklch
      expect(match).toMatch(/^oklch\([\d.]+ [\d.]+ [\d.]+/);
    }
  });

  it("accent tokens use var() references", () => {
    const theme = createTestTheme({ semantics: { enabled: true } });
    const css = generateSemanticCSS(theme);

    expect(css).toMatch(/--accent:\s*var\(--color-primary-500\)/);
    expect(css).toMatch(/--accent-secondary:\s*var\(--color-secondary-500\)/);
  });
});

describe("generateCSS integration", () => {
  it("default config produces no semantic tokens", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);

    expect(result.content).not.toContain("Semantic Tokens");
    expect(result.content).not.toContain("--surface:");
    expect(result.content).not.toContain("--text-1:");
  });

  it("semantics.enabled: true adds semantic section to CSS", () => {
    const theme = createTestTheme({ semantics: { enabled: true } });
    const result = generateCSS(theme);

    expect(result.content).toContain("AutoTheme Semantic Tokens");
    expect(result.content).toContain("--surface:");
    expect(result.content).toContain("--text-1:");
    expect(result.content).toContain("--accent:");
    expect(result.content).toContain("--border:");
  });

  it("semantics with mode 'light' has no .dark semantic block", () => {
    const theme = createTestTheme({ mode: "light", semantics: { enabled: true } });
    const result = generateCSS(theme);

    expect(result.content).toContain("AutoTheme Semantic Tokens");
    // The semantic section should only have :root, not .dark
    const semanticSection = result.content.split("AutoTheme Semantic Tokens")[1]!;
    expect(semanticSection).toContain(":root {");
    expect(semanticSection).not.toContain(".dark {");
  });

  it("overrides replace token values in CSS output", () => {
    const theme = createTestTheme({
      semantics: {
        enabled: true,
        overrides: { surface: "#FF0000" },
      },
    });
    const result = generateCSS(theme);

    // Surface should NOT be using var(), should be an oklch value from red
    expect(result.content).toContain("--surface:");
    // The overridden surface should not reference a var
    expect(result.content).not.toMatch(/--surface:\s*var\(/);
  });

  it("custom textLevels produces correct number of text tokens", () => {
    const theme = createTestTheme({
      semantics: { enabled: true, textLevels: 5 },
    });
    const result = generateCSS(theme);

    expect(result.content).toContain("--text-1:");
    expect(result.content).toContain("--text-2:");
    expect(result.content).toContain("--text-3:");
    expect(result.content).toContain("--text-4:");
    expect(result.content).toContain("--text-5:");
  });
});
