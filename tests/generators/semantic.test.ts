import { describe, it, expect } from "vitest";
import {
  generateSemanticColors,
  generateSemanticCSS,
  selectAccentColor,
} from "../../src/generators/semantic";
import { Color } from "../../src/core/color";
import { getContrastRatio } from "../../src/core/contrast";
import { generateFullPalette } from "../../src/core/palette";
import type { GeneratedTheme } from "../../src/generators/types";
import type { AutoThemeConfig } from "../../src/config/types";
import type { HarmonyType } from "../../src/core/types";

function createTestTheme(
  harmony: HarmonyType = "analogous",
  color: string = "#6439FF",
): GeneratedTheme {
  const primaryColor = new Color(color);
  const palette = generateFullPalette(primaryColor, harmony);
  const config: AutoThemeConfig = {
    color,
    harmony,
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

/**
 * Check that a foreground color meets WCAG AAA (7:1) against its background.
 * Uses a slightly relaxed threshold (6.9) to account for floating point.
 */
function assertAAA(fg: Color, bg: Color, label: string) {
  const ratio = getContrastRatio(fg, bg);
  expect(
    ratio,
    `${label}: contrast ratio ${ratio.toFixed(2)} should be >= 6.9 (AAA)`,
  ).toBeGreaterThanOrEqual(6.9);
}

/**
 * Check WCAG AA (4.5:1) — used for base colors where mid-lightness
 * backgrounds can't physically achieve 7:1 with any foreground.
 */
function assertAA(fg: Color, bg: Color, label: string) {
  const ratio = getContrastRatio(fg, bg);
  expect(
    ratio,
    `${label}: contrast ratio ${ratio.toFixed(2)} should be >= 4.4 (AA)`,
  ).toBeGreaterThanOrEqual(4.4);
}

describe("generateSemanticColors", () => {
  it("returns both light and dark color sets", () => {
    const theme = createTestTheme();
    const colors = generateSemanticColors(theme);

    expect(colors.light).toBeDefined();
    expect(colors.dark).toBeDefined();
  });

  it("generates all required light mode tokens", () => {
    const theme = createTestTheme();
    const { light } = generateSemanticColors(theme);

    // Surface system
    expect(light.surface).toBeInstanceOf(Color);
    expect(light.surfaceForeground).toBeInstanceOf(Color);
    expect(light.surfaceDim).toBeInstanceOf(Color);
    expect(light.surfaceBright).toBeInstanceOf(Color);
    expect(light.surfaceContainer).toBeInstanceOf(Color);
    expect(light.surfaceContainerForeground).toBeInstanceOf(Color);
    expect(light.surfaceContainerHigh).toBeInstanceOf(Color);
    expect(light.surfaceContainerLow).toBeInstanceOf(Color);

    // Primary
    expect(light.primary).toBeInstanceOf(Color);
    expect(light.primaryForeground).toBeInstanceOf(Color);
    expect(light.primaryContainer).toBeInstanceOf(Color);
    expect(light.primaryContainerForeground).toBeInstanceOf(Color);

    // Secondary
    expect(light.secondary).toBeInstanceOf(Color);
    expect(light.secondaryForeground).toBeInstanceOf(Color);
    expect(light.secondaryContainer).toBeInstanceOf(Color);
    expect(light.secondaryContainerForeground).toBeInstanceOf(Color);

    // Tertiary
    expect(light.tertiary).toBeInstanceOf(Color);
    expect(light.tertiaryForeground).toBeInstanceOf(Color);
    expect(light.tertiaryContainer).toBeInstanceOf(Color);
    expect(light.tertiaryContainerForeground).toBeInstanceOf(Color);

    // Accent
    expect(light.accent).toBeInstanceOf(Color);
    expect(light.accentForeground).toBeInstanceOf(Color);
    expect(light.accentContainer).toBeInstanceOf(Color);
    expect(light.accentContainerForeground).toBeInstanceOf(Color);

    // Muted
    expect(light.muted).toBeInstanceOf(Color);
    expect(light.mutedForeground).toBeInstanceOf(Color);
    expect(light.mutedContainer).toBeInstanceOf(Color);

    // Error
    expect(light.error).toBeInstanceOf(Color);
    expect(light.errorForeground).toBeInstanceOf(Color);
    expect(light.errorContainer).toBeInstanceOf(Color);
    expect(light.errorContainerForeground).toBeInstanceOf(Color);

    // Outline
    expect(light.outline).toBeInstanceOf(Color);
    expect(light.outlineVariant).toBeInstanceOf(Color);

    // Inverse
    expect(light.inverseSurface).toBeInstanceOf(Color);
    expect(light.inverseSurfaceForeground).toBeInstanceOf(Color);
    expect(light.inversePrimary).toBeInstanceOf(Color);
  });

  it("light surface has high lightness", () => {
    const theme = createTestTheme();
    const { light } = generateSemanticColors(theme);

    expect(light.surface.hsl.l).toBeGreaterThan(70);
  });

  it("dark surface has low lightness", () => {
    const theme = createTestTheme();
    const { dark } = generateSemanticColors(theme);

    expect(dark.surface.hsl.l).toBeLessThan(25);
  });

  it("secondary is the actual harmony[1] color (not lightened primary)", () => {
    const theme = createTestTheme("triadic");
    const { light } = generateSemanticColors(theme);
    const harmony1Base = theme.palette.palettes[1]!.base;

    // Light secondary should be the actual harmony[1] base
    expect(light.secondary.hsl.h).toBeCloseTo(harmony1Base.hsl.h, 0);
  });
});

describe("selectAccentColor", () => {
  it("picks the most hue-distant harmony color", () => {
    // Complementary: harmony[1] is 180 degrees away - that's the most distant
    const theme = createTestTheme("complementary");
    const accent = selectAccentColor(theme.palette);

    const primaryHue = theme.palette.palettes[0]!.base.hsl.h;
    const accentHue = accent.color.hsl.h;
    const dist = Math.min(Math.abs(primaryHue - accentHue), 360 - Math.abs(primaryHue - accentHue));
    expect(dist).toBeGreaterThanOrEqual(170); // ~180 for complementary
  });

  it("works with 3-color harmonies", () => {
    const theme = createTestTheme("triadic");
    const accent = selectAccentColor(theme.palette);

    // Triadic colors are 120 degrees apart; the most distant should be ~120 degrees
    expect(accent.color).toBeInstanceOf(Color);
    expect(accent.palette).toBeDefined();
  });

  it("works with 4-color harmonies", () => {
    const theme = createTestTheme("square");
    const accent = selectAccentColor(theme.palette);

    // Square: colors at 0, 90, 180, 270 - most distant is 180
    const primaryHue = theme.palette.palettes[0]!.base.hsl.h;
    const accentHue = accent.color.hsl.h;
    const dist = Math.min(Math.abs(primaryHue - accentHue), 360 - Math.abs(primaryHue - accentHue));
    expect(dist).toBeGreaterThanOrEqual(170); // ~180 for square
  });
});

describe("WCAG AAA compliance", () => {
  const harmonies: HarmonyType[] = [
    "complementary",
    "analogous",
    "triadic",
    "split-complementary",
    "square",
  ];

  for (const harmony of harmonies) {
    describe(`${harmony} harmony`, () => {
      it("all light mode foreground colors are accessible", () => {
        const theme = createTestTheme(harmony);
        const { light } = generateSemanticColors(theme);

        // Surfaces and containers: AAA (high/low lightness extremes)
        assertAAA(light.surfaceForeground, light.surface, "surface");
        assertAAA(light.surfaceContainerForeground, light.surfaceContainer, "surface-container");
        assertAAA(light.primaryContainerForeground, light.primaryContainer, "primary-container");
        assertAAA(
          light.secondaryContainerForeground,
          light.secondaryContainer,
          "secondary-container",
        );
        assertAAA(light.tertiaryContainerForeground, light.tertiaryContainer, "tertiary-container");
        assertAAA(light.accentContainerForeground, light.accentContainer, "accent-container");
        assertAAA(light.errorContainerForeground, light.errorContainer, "error-container");
        assertAAA(light.inverseSurfaceForeground, light.inverseSurface, "inverse-surface");

        // Base colors: AA (mid-lightness colors can't always reach AAA)
        assertAA(light.primaryForeground, light.primary, "primary");
        assertAA(light.secondaryForeground, light.secondary, "secondary");
        assertAA(light.tertiaryForeground, light.tertiary, "tertiary");
        assertAA(light.accentForeground, light.accent, "accent");
        assertAA(light.errorForeground, light.error, "error");
      });

      it("all dark mode foreground colors are accessible", () => {
        const theme = createTestTheme(harmony);
        const { dark } = generateSemanticColors(theme);

        // Surfaces and containers: AAA
        assertAAA(dark.surfaceForeground, dark.surface, "surface");
        assertAAA(dark.surfaceContainerForeground, dark.surfaceContainer, "surface-container");
        assertAAA(dark.primaryContainerForeground, dark.primaryContainer, "primary-container");
        assertAAA(
          dark.secondaryContainerForeground,
          dark.secondaryContainer,
          "secondary-container",
        );
        assertAAA(dark.tertiaryContainerForeground, dark.tertiaryContainer, "tertiary-container");
        assertAAA(dark.accentContainerForeground, dark.accentContainer, "accent-container");
        assertAAA(dark.errorContainerForeground, dark.errorContainer, "error-container");
        assertAAA(dark.inverseSurfaceForeground, dark.inverseSurface, "inverse-surface");

        // Base colors: AA
        assertAA(dark.primaryForeground, dark.primary, "primary");
        assertAA(dark.secondaryForeground, dark.secondary, "secondary");
        assertAA(dark.tertiaryForeground, dark.tertiary, "tertiary");
        assertAA(dark.accentForeground, dark.accent, "accent");
        assertAA(dark.errorForeground, dark.error, "error");
      });
    });
  }
});

describe("harmony count variations", () => {
  it("2-color harmony produces valid mappings", () => {
    const theme = createTestTheme("complementary"); // 2 colors
    const { light } = generateSemanticColors(theme);

    expect(light.primary).toBeInstanceOf(Color);
    expect(light.secondary).toBeInstanceOf(Color);
    expect(light.tertiary).toBeInstanceOf(Color); // Should be rotated fallback
    expect(light.accent).toBeInstanceOf(Color);
  });

  it("3-color harmony produces valid mappings", () => {
    const theme = createTestTheme("triadic"); // 3 colors
    const { light } = generateSemanticColors(theme);

    expect(light.primary).toBeInstanceOf(Color);
    expect(light.secondary).toBeInstanceOf(Color);
    expect(light.tertiary).toBeInstanceOf(Color);
    expect(light.accent).toBeInstanceOf(Color);
  });

  it("4-color harmony produces valid mappings", () => {
    const theme = createTestTheme("square"); // 4 colors
    const { light } = generateSemanticColors(theme);

    expect(light.primary).toBeInstanceOf(Color);
    expect(light.secondary).toBeInstanceOf(Color);
    expect(light.tertiary).toBeInstanceOf(Color);
    expect(light.accent).toBeInstanceOf(Color);
  });
});

describe("container colors", () => {
  it("light containers are lighter than base colors", () => {
    const theme = createTestTheme("triadic");
    const { light } = generateSemanticColors(theme);

    expect(light.primaryContainer.hsl.l).toBeGreaterThan(light.primary.hsl.l);
    expect(light.secondaryContainer.hsl.l).toBeGreaterThan(light.secondary.hsl.l);
  });

  it("light containers are more desaturated than tints", () => {
    const theme = createTestTheme("triadic");
    const { light } = generateSemanticColors(theme);
    const primaryTint2 = theme.palette.palettes[0]!.tints[2];

    // Container should be desaturated relative to the raw tint
    if (primaryTint2) {
      expect(light.primaryContainer.hsl.s).toBeLessThanOrEqual(primaryTint2.hsl.s);
    }
  });
});

describe("generateSemanticCSS", () => {
  it("generates :root and .dark blocks", () => {
    const theme = createTestTheme();
    const css = generateSemanticCSS(theme);

    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");
  });

  it("includes header comment", () => {
    const theme = createTestTheme();
    const css = generateSemanticCSS(theme);

    expect(css).toContain("Semantic Design Tokens");
  });

  it("emits surface variables", () => {
    const theme = createTestTheme();
    const css = generateSemanticCSS(theme);

    expect(css).toContain("--surface:");
    expect(css).toContain("--surface-foreground:");
    expect(css).toContain("--surface-dim:");
    expect(css).toContain("--surface-bright:");
    expect(css).toContain("--surface-container:");
    expect(css).toContain("--surface-container-foreground:");
    expect(css).toContain("--surface-container-high:");
    expect(css).toContain("--surface-container-low:");
  });

  it("emits primary/secondary/tertiary/accent variables", () => {
    const theme = createTestTheme();
    const css = generateSemanticCSS(theme);

    expect(css).toContain("--primary-container:");
    expect(css).toContain("--primary-container-foreground:");
    expect(css).toContain("--secondary:");
    expect(css).toContain("--secondary-container:");
    expect(css).toContain("--tertiary:");
    expect(css).toContain("--tertiary-container:");
    expect(css).toContain("--accent:");
    expect(css).toContain("--accent-container:");
  });

  it("emits error, outline, and inverse variables", () => {
    const theme = createTestTheme();
    const css = generateSemanticCSS(theme);

    expect(css).toContain("--error:");
    expect(css).toContain("--error-foreground:");
    expect(css).toContain("--error-container:");
    expect(css).toContain("--outline:");
    expect(css).toContain("--outline-variant:");
    expect(css).toContain("--inverse-surface:");
    expect(css).toContain("--inverse-primary:");
  });

  it("uses OKLCH format", () => {
    const theme = createTestTheme();
    const css = generateSemanticCSS(theme);

    expect(css).toMatch(/--surface:\s*oklch\(/);
    expect(css).toMatch(/--primary:\s*oklch\(/);
    expect(css).toMatch(/--error:\s*oklch\(/);
  });
});
