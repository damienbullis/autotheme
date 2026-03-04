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
  // v2 signature: generateSurfaces(hue, chroma, depth, sunkenDelta)
  // Returns: [surface, surface-sunken]

  it("surface-sunken has different lightness than surface", () => {
    // In light mode depth=0.87 (1 - 0.13), sunkenDelta=-0.02
    const surfaces = generateSurfaces(220, 0.01, 0.87, -0.02);
    const surface = surfaces.find((t) => t.name === "surface")!;
    const sunken = surfaces.find((t) => t.name === "surface-sunken")!;

    // sunken = depth + sunkenDelta = 0.85, surface = depth = 0.87
    // sunkenDelta < 0, so sunken is darker
    expect(sunken.value.oklch.l).toBeLessThan(surface.value.oklch.l);
  });

  it("depth near 1 produces very light surface", () => {
    const surfaces = generateSurfaces(0, 0.01, 0.97, -0.02);
    const surface = surfaces.find((t) => t.name === "surface")!;
    // OKLCH L=0.97 is near white
    expect(surface.value.oklch.l).toBeCloseTo(0.97, 2);
  });

  it("depth near 0 produces very dark surface", () => {
    const surfaces = generateSurfaces(0, 0.01, 0.03, -0.02);
    const surface = surfaces.find((t) => t.name === "surface")!;
    expect(surface.value.oklch.l).toBeLessThanOrEqual(0.05);
  });

  it("produces 2 surface tokens", () => {
    const surfaces = generateSurfaces(120, 0.01, 0.87, -0.02);
    expect(surfaces).toHaveLength(2);
    expect(surfaces.map((t) => t.name)).toEqual(["surface", "surface-sunken"]);
  });
});

describe("generateBorders", () => {
  // v2 signature: generateBorders(hue, chroma, depth, offsets, isDark)

  it("produces 3 border tokens in order: subtle < border < strong contrast", () => {
    const offsets: [number, number, number] = [0.08, 0.15, 0.25];
    const borders = generateBorders(220, 0.012, 0.87, offsets, false);
    expect(borders).toHaveLength(3);
    expect(borders.map((t) => t.name)).toEqual(["border-subtle", "border", "border-strong"]);

    // For light mode, borders are darker (lower L) since sign = -1
    // subtle offset is smallest, strong is largest
    // subtle L = 0.87 - 0.08 = 0.79, border L = 0.87 - 0.15 = 0.72, strong L = 0.87 - 0.25 = 0.62
    expect(borders[0]!.value.oklch.l).toBeGreaterThan(borders[1]!.value.oklch.l);
    expect(borders[1]!.value.oklch.l).toBeGreaterThan(borders[2]!.value.oklch.l);
  });

  it("dark mode borders are lighter than depth", () => {
    const offsets: [number, number, number] = [0.08, 0.15, 0.25];
    const depth = 0.13;
    const borders = generateBorders(180, 0.012, depth, offsets, true);
    for (const b of borders) {
      // In dark mode, sign = +1, so borders have higher L than depth
      expect(b.value.oklch.l).toBeGreaterThan(depth);
    }
  });
});

describe("generateTextHierarchy", () => {
  // v2 signature: generateTextHierarchy(hue, surface, textConfig, isDark)

  it("text-1 has highest contrast, monotonically decreasing", () => {
    const surface = Color.fromOklch(0.87, 0.01, 220);
    const textConfig = {
      levels: 4,
      anchor: 0.15,
      floor: 0.55,
      curve: 1,
      chroma: [0.025, 0.01] as [number, number],
    };
    const textTokens = generateTextHierarchy(220, surface, textConfig, false);

    expect(textTokens).toHaveLength(4);

    const ratios = textTokens.map((t) => getContrastRatio(t.value, surface));
    for (let i = 1; i < ratios.length; i++) {
      expect(ratios[i - 1]!).toBeGreaterThanOrEqual(ratios[i]!);
    }
  });

  it("text-1 meets AA contrast (4.5:1) against surface", () => {
    const surface = Color.fromOklch(0.87, 0.01, 220);
    const textConfig = {
      levels: 3,
      anchor: 0.15,
      floor: 0.55,
      curve: 1,
      chroma: [0.025, 0.01] as [number, number],
    };
    const textTokens = generateTextHierarchy(220, surface, textConfig, false);
    const ratio = getContrastRatio(textTokens[0]!.value, surface);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it("respects textLevels count", () => {
    const surface = Color.fromOklch(0.87, 0.01, 0);
    const makeConfig = (levels: number) => ({
      levels,
      anchor: 0.15,
      floor: 0.55,
      curve: 1,
      chroma: [0.025, 0.01] as [number, number],
    });
    expect(generateTextHierarchy(0, surface, makeConfig(2), false)).toHaveLength(2);
    expect(generateTextHierarchy(0, surface, makeConfig(5), false)).toHaveLength(5);
    expect(generateTextHierarchy(0, surface, makeConfig(6), false)).toHaveLength(6);
  });

  it("works in dark mode (light text on dark surface)", () => {
    const darkSurface = Color.fromOklch(0.13, 0.01, 220);
    const textConfig = {
      levels: 3,
      anchor: 0.95,
      floor: 0.55,
      curve: 1,
      chroma: [0.025, 0.01] as [number, number],
    };
    const textTokens = generateTextHierarchy(220, darkSurface, textConfig, true);

    // Text should have higher L (lighter) than surface
    for (const t of textTokens) {
      expect(t.value.oklch.l).toBeGreaterThan(darkSurface.oklch.l);
    }
  });
});

describe("generateAccents", () => {
  // v2 signature: generateAccents(palette, mapping, isDark)
  // Returns direct Color values (no var() refs)

  it("accent tokens use direct color values", () => {
    const theme = createTestTheme();
    const mapping = { accent: "primary", secondary: "secondary", tertiary: "tertiary" };
    const accents = generateAccents(theme.palette, mapping, false);

    const accent = accents.find((t) => t.name === "accent")!;
    // Direct OKLCH value, no ref
    expect(accent.value).toBeDefined();
    expect(accent.ref).toBeUndefined();
  });

  it("produces 6 accent tokens (3 pairs of base + foreground)", () => {
    const theme = createTestTheme();
    const mapping = { accent: "primary", secondary: "secondary", tertiary: "tertiary" };
    const accents = generateAccents(theme.palette, mapping, false);
    expect(accents).toHaveLength(6);
    expect(accents.map((t) => t.name)).toEqual([
      "accent",
      "accent-foreground",
      "accent-secondary",
      "accent-secondary-foreground",
      "accent-tertiary",
      "accent-tertiary-foreground",
    ]);
  });
});

describe("applyOverrides", () => {
  it("replaces token value", () => {
    const theme = createTestTheme();
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");

    applyOverrides(tokens, { accent: "#FF0000" });

    const accentAfter = tokens.accents.find((t) => t.name === "accent")!;
    // Should be the overridden red color
    expect(accentAfter.value.hsl.h).toBeCloseTo(0, 0);
  });

  it("overrides surface token", () => {
    const theme = createTestTheme();
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");

    applyOverrides(tokens, { surface: "#FF0000" });

    const surface = tokens.surfaces.find((t) => t.name === "surface")!;
    expect(surface.value.hsl.h).toBeCloseTo(0, 0);
    expect(surface.value.hsl.s).toBeCloseTo(100, 0);
  });
});

describe("generateSemanticCSS", () => {
  it("mode 'light' produces one :root block with semantic tokens", () => {
    const theme = createTestTheme({ mode: "light" });
    const css = generateSemanticCSS(theme);

    expect(css).toContain(":root {");
    expect(css).not.toContain(".dark {");
    expect(css).toContain("--surface:");
    expect(css).toContain("--text-1:");
    expect(css).toContain("--accent:");
  });

  it("mode 'dark' produces :root with dark values", () => {
    const theme = createTestTheme({ mode: "dark" });
    const css = generateSemanticCSS(theme);

    expect(css).toContain(":root {");
    expect(css).not.toContain(".dark {");
    expect(css).toContain("--surface:");
  });

  it("mode 'both' produces :root + .dark blocks", () => {
    const theme = createTestTheme({ mode: "both" });
    const css = generateSemanticCSS(theme);

    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");
  });

  it("all emitted oklch values are syntactically valid", () => {
    const theme = createTestTheme();
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

  it("accent tokens use direct oklch values (not var() references)", () => {
    const theme = createTestTheme();
    const css = generateSemanticCSS(theme);

    // v2: accents use direct OKLCH values, not var() refs
    expect(css).toMatch(/--accent:\s*oklch\(/);
  });
});

describe("states integration", () => {
  it("states populated when enabled", () => {
    const theme = createTestTheme({ states: {} });
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");
    expect(tokens.states).toBeDefined();
    expect(tokens.states!.length).toBe(6);
  });

  it("states undefined when disabled", () => {
    const theme = createTestTheme();
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");
    expect(tokens.states).toBeUndefined();
  });

  it("CSS output contains state tokens when states enabled", () => {
    const theme = createTestTheme({ states: {} });
    const css = generateSemanticCSS(theme);
    expect(css).toContain("--state-hover:");
    expect(css).toContain("--focus-ring-color:");
  });
});

describe("elevation integration", () => {
  it("elevation populated when enabled", () => {
    const theme = createTestTheme({ elevation: {} });
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");
    expect(tokens.elevation).toBeDefined();
    expect(tokens.elevation!.length).toBe(8); // 4 levels * 2
  });

  it("elevation undefined when disabled", () => {
    const theme = createTestTheme();
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");
    expect(tokens.elevation).toBeUndefined();
  });

  it("CSS output contains elevation tokens when elevation enabled", () => {
    const theme = createTestTheme({ elevation: {} });
    const css = generateSemanticCSS(theme);
    expect(css).toContain("--elevation-1:");
    expect(css).toContain("--elevation-1-shadow:");
  });

  it("elevation token naming uses elevation-N (not elevation-N-surface)", () => {
    const theme = createTestTheme({ elevation: {} });
    const css = generateSemanticCSS(theme);
    // v2 naming: elevation-N for surface, not elevation-N-surface
    expect(css).toContain("--elevation-1:");
    expect(css).not.toContain("--elevation-1-surface:");
  });
});

describe("applyOverrides with rawCSS tokens", () => {
  it("overrides rawCSS tokens by replacing rawCSS string", () => {
    const theme = createTestTheme({ states: {} });
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");
    applyOverrides(tokens, { "state-hover": "0.1" });
    const hover = tokens.states!.find((t) => t.name === "state-hover")!;
    expect(hover.rawCSS).toBe("0.1");
  });
});

describe("generateCSS integration", () => {
  it("default config produces semantic tokens (semantics ON by default)", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);

    // v2 defaults: semantics ON
    expect(result.content).toContain("AutoTheme Semantic Tokens");
    expect(result.content).toContain("--surface:");
    expect(result.content).toContain("--text-1:");
  });

  it("semantics: false disables semantic section", () => {
    const theme = createTestTheme({ semantics: false });
    const result = generateCSS(theme);

    expect(result.content).not.toContain("Semantic Tokens");
    expect(result.content).not.toContain("--surface:");
    expect(result.content).not.toContain("--text-1:");
  });

  it("semantics with mode 'light' has no .dark semantic block", () => {
    const theme = createTestTheme({ mode: "light" });
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
        overrides: { surface: "#FF0000" },
      },
    });
    const result = generateCSS(theme);

    // Surface should NOT be using var(), should be an oklch value from red
    expect(result.content).toContain("--surface:");
    // The overridden surface should not reference a var
    expect(result.content).not.toMatch(/--surface:\s*var\(/);
  });

  it("custom text levels produces correct number of text tokens", () => {
    const theme = createTestTheme({
      semantics: { text: { levels: 5 } },
    });
    const result = generateCSS(theme);

    expect(result.content).toContain("--text-1:");
    expect(result.content).toContain("--text-2:");
    expect(result.content).toContain("--text-3:");
    expect(result.content).toContain("--text-4:");
    expect(result.content).toContain("--text-5:");
  });
});
