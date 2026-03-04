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
  it("returns semantic names for indices 0-4, then color-N", () => {
    expect(getHarmonyName(0)).toBe("primary");
    expect(getHarmonyName(1)).toBe("secondary");
    expect(getHarmonyName(2)).toBe("tertiary");
    expect(getHarmonyName(3)).toBe("quaternary");
    expect(getHarmonyName(4)).toBe("quinary");
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

    // OKLCH round-trip may shift lightness slightly
    expect(contrastOnLight.hsl.l).toBeCloseTo(5, 0);
    expect(contrastOnDark.hsl.l).toBeCloseTo(95, 0);
  });

  it("preserves hue from background", () => {
    const bg = new Color({ h: 120, s: 50, l: 50, a: 1 });
    // OKLCH round-trip may shift hue by a few degrees
    expect(findContrastColor(bg).hsl.h).toBeCloseTo(120, -1);
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
  it("generates CSS with base colors and semantic tokens for default config", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);

    // Correct filename (default output.path)
    expect(result.filename).toBe("./src/autotheme.css");

    // Has root block
    expect(result.content).toContain(":root {");

    // Default: palette OFF = base colors only (no 50-950 scale)
    const oklchPattern = /oklch\([^)]+\)/;
    expect(result.content).toMatch(new RegExp(`--color-primary:\\s*${oklchPattern.source}`));
    expect(result.content).toMatch(new RegExp(`--color-secondary:\\s*${oklchPattern.source}`));
    expect(result.content).toMatch(new RegExp(`--color-tertiary:\\s*${oklchPattern.source}`));

    // No full scale when palette is off
    expect(result.content).not.toContain("--color-primary-500:");
    expect(result.content).not.toContain("--color-primary-50:");

    // Default: semantics ON - has semantic tokens
    expect(result.content).toContain("--surface:");
    expect(result.content).toContain("--text-1:");
    expect(result.content).toContain("--accent:");

    // Does NOT have optional features by default
    expect(result.content).not.toContain("Spacing Scale");
    expect(result.content).not.toContain("Background Images");
    expect(result.content).not.toContain("Gradients");
    expect(result.content).not.toContain("Shadcn UI");
    expect(result.content).not.toContain("Utility Classes");
  });

  it("generates full palette scale when palette is enabled", () => {
    const theme = createTestTheme({ palette: {} });
    const result = generateCSS(theme);

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
    expect(result.content).toMatch(new RegExp(`--color-secondary-500:\\s*${oklchPattern.source}`));
    expect(result.content).toMatch(new RegExp(`--color-tertiary-500:\\s*${oklchPattern.source}`));
  });

  it("includes all optional sections when features are enabled", () => {
    const theme = createTestTheme({
      shadcn: {},
      spacing: {},
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

  it("mode 'dark' produces :root block with dark semantic values and no .dark block", () => {
    const theme = createTestTheme({ mode: "dark" });
    const result = generateCSS(theme);

    // Should have :root
    expect(result.content).toContain(":root {");
    // No .dark block in dark-only mode
    expect(result.content).not.toContain(".dark {");
    // Semantic tokens are emitted under :root
    expect(result.content).toContain("--surface:");
    expect(result.content).toContain("--text-1:");
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
      spacing: { base: 0.25, ratio: 2, steps: 4 },
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
      spacing: { values: [0.5, 1, 2, 4] },
    });
    const result = generateCSS(theme);

    expect(result.content).toContain("--spacing-1: 0.500rem;");
    expect(result.content).toContain("--spacing-2: 1.000rem;");
    expect(result.content).toContain("--spacing-3: 2.000rem;");
    expect(result.content).toContain("--spacing-4: 4.000rem;");
  });

  it("omits typography when disabled", () => {
    const theme = createTestTheme({ typography: false, semantics: false });
    const result = generateCSS(theme);

    expect(result.content).not.toContain("Typography Scale");
    expect(result.content).not.toContain("--text-");
  });

  it("uses OKLCH color format for palette and var() refs for shadcn", () => {
    const theme = createTestTheme({ palette: {}, shadcn: {} });
    const result = generateCSS(theme);

    // Palette colors use OKLCH
    expect(result.content).toMatch(/--color-primary-500:\s*oklch\(/);
    expect(result.content).toMatch(/--color-primary-50:\s*oklch\(/);

    // Shadcn variables reference semantic tokens via var()
    expect(result.content).toMatch(/--background:\s*var\(--surface\)/);
    expect(result.content).toMatch(/--primary:\s*var\(--accent\)/);
  });

  it("includes metadata header when comments: true", () => {
    const theme = createTestTheme({ output: { comments: true } });
    const result = generateCSS(theme);
    expect(result.content).toContain("AutoTheme v2");
    expect(result.content).toContain(theme.config.color);
    expect(result.content).toContain(theme.config.harmony as string);
  });

  it("omits all CSS comments when comments: false", () => {
    const theme = createTestTheme({
      output: { comments: false },
      shadcn: {},
      spacing: {},
      noise: true,
      gradients: true,
      utilities: true,
    });
    const result = generateCSS(theme);
    expect(result.content).not.toContain("/*");
    expect(result.content).not.toContain("*/");
  });

  it("output.format 'oklch' outputs oklch() values", () => {
    const theme = createTestTheme({ palette: {}, output: { format: "oklch" } });
    const result = generateCSS(theme);
    expect(result.content).toMatch(/--color-primary-500:\s*oklch\(/);
  });

  it("output.format 'hsl' outputs hsl() values", () => {
    const theme = createTestTheme({ palette: {}, output: { format: "hsl" } });
    const result = generateCSS(theme);
    expect(result.content).toMatch(/--color-primary-500:\s*hsl\(/);
    expect(result.content).not.toMatch(/--color-primary-500:\s*oklch\(/);
  });

  it("output.format 'rgb' outputs rgb() values", () => {
    const theme = createTestTheme({ palette: {}, output: { format: "rgb" } });
    const result = generateCSS(theme);
    expect(result.content).toMatch(/--color-primary-500:\s*rgb\(/);
  });

  it("output.format 'hex' outputs # values", () => {
    const theme = createTestTheme({ palette: {}, output: { format: "hex" } });
    const result = generateCSS(theme);
    expect(result.content).toMatch(/--color-primary-500:\s*#[0-9a-f]+;/i);
  });

  it("output.format is used consistently across all generators", () => {
    const theme = createTestTheme({
      palette: {},
      output: { format: "hsl" },
      shadcn: {},
    });
    const result = generateCSS(theme);
    // Palette colors use hsl
    expect(result.content).toMatch(/--color-primary-500:\s*hsl\(/);
    // No oklch in output (except possibly CSS comments)
    const contentWithoutComments = result.content.replace(/\/\*[\s\S]*?\*\//g, "");
    expect(contentWithoutComments).not.toContain("oklch(");
  });

  it("generates radius scale when enabled", () => {
    const theme = createTestTheme({ radius: { base: 0.125, ratio: 2, steps: 4 } });
    const result = generateCSS(theme);
    expect(result.content).toContain("--radius-1: 0.125rem;");
    expect(result.content).toContain("--radius-2: 0.250rem;");
    expect(result.content).toContain("--radius-3: 0.500rem;");
    expect(result.content).toContain("--radius-4: 1.000rem;");
  });

  it("uses manual radius values when provided", () => {
    const theme = createTestTheme({
      radius: { values: [0.25, 0.5, 1, 2] },
    });
    const result = generateCSS(theme);
    expect(result.content).toContain("--radius-1: 0.250rem;");
    expect(result.content).toContain("--radius-4: 2.000rem;");
  });

  it("radius does not conflict with Shadcn radius", () => {
    const theme = createTestTheme({
      radius: { steps: 3 },
      shadcn: {},
    });
    const result = generateCSS(theme);
    // Our numeric radius
    expect(result.content).toContain("--radius-1:");
    // Shadcn's named radius (--radius: in shadcn block)
    expect(result.content).toContain("--radius:");
  });

  it("radius disabled by default", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);
    expect(result.content).not.toContain("--radius-1:");
  });

  it("Phase 3 features disabled by default produce no extra output", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);

    // No alpha variants
    expect(result.content).not.toContain("-bg:");
    expect(result.content).not.toContain("-glow:");

    // No state tokens
    expect(result.content).not.toContain("accent-hover");
    expect(result.content).not.toContain("accent-disabled");

    // No elevation tokens
    expect(result.content).not.toContain("elevation-");
  });

  it("alpha variants enabled produce alpha CSS variables in palette block", () => {
    const theme = createTestTheme({
      palette: { alphaVariants: true },
    });
    const result = generateCSS(theme);

    // Alpha variants in palette block
    expect(result.content).toContain("--color-primary-bg:");
    expect(result.content).toContain("--color-primary-glow:");
    expect(result.content).toContain("--color-secondary-border:");
  });
});
