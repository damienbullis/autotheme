import { describe, it, expect } from "vitest";
import {
  generateCSS,
  generateScaledValues,
  findContrastColor,
  getHarmonyName,
} from "../../src/generators/css";
import { Color } from "../../src/core/color";
import { createTestTheme } from "../helpers/test-theme";

describe("generateCSS", () => {
  it("generates CSS with root variables", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);

    expect(result.content).toContain(":root {");
    expect(result.filename).toBe("./autotheme.css");
  });

  it("generates palette color variables with Tailwind naming", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);

    expect(result.content).toContain("--color-primary-500:");
    expect(result.content).toContain("--color-primary-foreground:");
    expect(result.content).toContain("--color-primary-contrast:");
  });

  it("generates tint variables (50-400 scale)", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);

    expect(result.content).toContain("--color-primary-50:");
    expect(result.content).toContain("--color-primary-100:");
    expect(result.content).toContain("--color-primary-200:");
    expect(result.content).toContain("--color-primary-300:");
    expect(result.content).toContain("--color-primary-400:");
  });

  it("generates shade variables (600-950 scale)", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);

    expect(result.content).toContain("--color-primary-600:");
    expect(result.content).toContain("--color-primary-700:");
    expect(result.content).toContain("--color-primary-800:");
    expect(result.content).toContain("--color-primary-900:");
    expect(result.content).toContain("--color-primary-950:");
  });

  it("generates tone variables (tone-1 to tone-4)", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);

    expect(result.content).toContain("--color-primary-tone-1:");
    expect(result.content).toContain("--color-primary-tone-2:");
    expect(result.content).toContain("--color-primary-tone-3:");
    expect(result.content).toContain("--color-primary-tone-4:");
  });

  it("generates typography scale with Tailwind naming", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);

    expect(result.content).toContain("/* Typography Scale */");
    expect(result.content).toContain("--text-xs:");
    expect(result.content).toContain("--text-sm:");
    expect(result.content).toContain("--text-md:");
    expect(result.content).toContain("--text-lg:");
    expect(result.content).toContain("--text-xl:");
    expect(result.content).toContain("--text-2xl:");
    expect(result.content).toContain("--text-3xl:");
    expect(result.content).toContain("--text-4xl:");
  });

  it("generates spacing scale when enabled", () => {
    const theme = createTestTheme({ spacing: { enabled: true } });
    const result = generateCSS(theme);

    expect(result.content).toContain("/* Spacing Scale */");
    for (let i = 1; i <= 10; i++) {
      expect(result.content).toContain(`--spacing-${i}:`);
    }
  });

  it("includes noise variable when enabled", () => {
    const theme = createTestTheme({ noise: true });
    const result = generateCSS(theme);

    expect(result.content).toContain("/* Background Images */");
    expect(result.content).toContain("--background-image-noise:");
    expect(result.content).toContain("data:image/svg+xml");
  });

  it("generates gradient variables when enabled", () => {
    const theme = createTestTheme({ gradients: true });
    const result = generateCSS(theme);

    expect(result.content).toContain("/* Gradients */");
    expect(result.content).toContain("--gradient-direction: to right;");
    expect(result.content).toContain("--gradient-linear-secondary:");
    expect(result.content).toContain("--gradient-linear-rainbow:");
  });

  it("includes dark mode CSS with .dark selector", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);

    expect(result.content).toContain(".dark {");
  });

  it("includes utility classes when enabled", () => {
    const theme = createTestTheme({ utilities: true });
    const result = generateCSS(theme);

    expect(result.content).toContain(".gradient-linear {");
    expect(result.content).toContain(".gradient-radial {");
    expect(result.content).toContain(".bg-noise {");
    expect(result.content).toContain(".bg-noise-overlay {");
  });

  it("includes Shadcn-compatible variables when enabled", () => {
    const theme = createTestTheme({ shadcn: { enabled: true } });
    const result = generateCSS(theme);

    expect(result.content).toContain("Shadcn UI Compatible Theme Variables");
    expect(result.content).toContain("--background:");
    expect(result.content).toContain("--foreground:");
    expect(result.content).toContain("--primary:");
    expect(result.content).toContain("--primary-foreground:");
    expect(result.content).toContain("--secondary:");
    expect(result.content).toContain("--secondary-foreground:");
    expect(result.content).toContain("--accent:");
    expect(result.content).toContain("--accent-foreground:");
    expect(result.content).toContain("--muted:");
    expect(result.content).toContain("--muted-foreground:");
    expect(result.content).toContain("--destructive:");
    expect(result.content).toContain("--destructive-foreground:");
    expect(result.content).toContain("--card:");
    expect(result.content).toContain("--card-foreground:");
    expect(result.content).toContain("--popover:");
    expect(result.content).toContain("--popover-foreground:");
    expect(result.content).toContain("--border:");
    expect(result.content).toContain("--input:");
    expect(result.content).toContain("--ring:");
    expect(result.content).toContain("--radius: 0.625rem");
    expect(result.content).toContain("--chart-1:");
    expect(result.content).toContain("--chart-5:");
    expect(result.content).toContain("--sidebar:");
    expect(result.content).toContain("--sidebar-foreground:");
  });

  it("uses OKLCH color format for all color variables", () => {
    const theme = createTestTheme({ shadcn: { enabled: true } });
    const result = generateCSS(theme);

    expect(result.content).toMatch(/--background:\s*oklch\(/);
    expect(result.content).toMatch(/--primary:\s*oklch\(/);
    expect(result.content).toMatch(/--color-primary-500:\s*oklch\(/);
    expect(result.content).toMatch(/--color-primary-50:\s*oklch\(/);
  });
});

describe("getHarmonyName", () => {
  it("returns primary for index 0", () => {
    expect(getHarmonyName(0)).toBe("primary");
  });

  it("returns secondary for index 1", () => {
    expect(getHarmonyName(1)).toBe("secondary");
  });

  it("returns tertiary for index 2", () => {
    expect(getHarmonyName(2)).toBe("tertiary");
  });

  it("returns quaternary for index 3", () => {
    expect(getHarmonyName(3)).toBe("quaternary");
  });

  it("returns color-N for index > 3", () => {
    expect(getHarmonyName(4)).toBe("color-5");
    expect(getHarmonyName(5)).toBe("color-6");
  });
});

describe("generateScaledValues", () => {
  it("generates scaled values starting from base", () => {
    const values = generateScaledValues(1, 2, 4);

    expect(values).toHaveLength(4);
    expect(values[0]).toBe(1);
    expect(values[1]).toBe(2);
    expect(values[2]).toBe(4);
    expect(values[3]).toBe(8);
  });

  it("applies scalar correctly", () => {
    const values = generateScaledValues(0.5, 1.5, 3);

    expect(values).toHaveLength(3);
    expect(values[0]).toBeCloseTo(0.5);
    expect(values[1]).toBeCloseTo(0.75);
    expect(values[2]).toBeCloseTo(1.125);
  });

  it("returns empty array for count 0", () => {
    const values = generateScaledValues(1, 2, 0);
    expect(values).toHaveLength(0);
  });
});

describe("findContrastColor", () => {
  it("returns dark color for light backgrounds", () => {
    const lightBg = new Color({ h: 200, s: 50, l: 80, a: 1 });
    const contrast = findContrastColor(lightBg);

    expect(contrast.hsl.l).toBe(5);
    expect(contrast.hsl.s).toBe(100);
  });

  it("returns light color for dark backgrounds", () => {
    const darkBg = new Color({ h: 200, s: 50, l: 20, a: 1 });
    const contrast = findContrastColor(darkBg);

    expect(contrast.hsl.l).toBe(95);
    expect(contrast.hsl.s).toBe(20);
  });

  it("preserves hue from background", () => {
    const bg = new Color({ h: 120, s: 50, l: 50, a: 1 });
    const contrast = findContrastColor(bg);

    expect(contrast.hsl.h).toBe(120);
  });
});

describe("generateCSS with custom prefix", () => {
  it("uses custom prefix in color variable names", () => {
    const theme = createTestTheme({ palette: { prefix: "at" } });
    const result = generateCSS(theme);

    expect(result.content).toContain("--at-primary-500:");
    expect(result.content).toContain("--at-primary-50:");
    expect(result.content).toContain("--at-primary-foreground:");
    expect(result.content).toContain("--at-primary-contrast:");
    expect(result.content).toContain("--at-primary-tone-1:");
    expect(result.content).not.toContain("--color-primary-500:");
  });
});

describe("generateCSS with custom fontSize", () => {
  it("uses custom fontSize as typography base", () => {
    const theme = createTestTheme({ typography: { base: 0.875 } });
    const result = generateCSS(theme);

    expect(result.content).toContain("--text-xs: 0.875rem;");
  });
});

describe("generateCSS toggles", () => {
  it("omits shadcn section when shadcn is disabled", () => {
    const theme = createTestTheme({ shadcn: { enabled: false } });
    const result = generateCSS(theme);

    expect(result.content).not.toContain("Shadcn UI Compatible Theme Variables");
  });

  it("omits spacing section when spacing is disabled", () => {
    const theme = createTestTheme({ spacing: { enabled: false } });
    const result = generateCSS(theme);

    expect(result.content).not.toContain("/* Spacing Scale */");
  });

  it("omits noise section when noise is false", () => {
    const theme = createTestTheme({ noise: false });
    const result = generateCSS(theme);

    expect(result.content).not.toContain("/* Background Images */");
    expect(result.content).not.toContain("--background-image-noise:");
  });

  it("omits gradients section when gradients is false", () => {
    const theme = createTestTheme({ gradients: false });
    const result = generateCSS(theme);

    expect(result.content).not.toContain("/* Gradients */");
    expect(result.content).not.toContain("--gradient-direction:");
    expect(result.content).not.toContain("--gradient-linear-rainbow:");
  });

  it("omits utility classes when utilities is false", () => {
    const theme = createTestTheme({ utilities: false });
    const result = generateCSS(theme);

    expect(result.content).not.toContain("/* Utility Classes */");
    expect(result.content).not.toContain(".gradient-linear {");
  });

  it("produces valid output with all toggles off (defaults)", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);

    // Still has color palette + typography + dark mode
    expect(result.content).toContain(":root {");
    expect(result.content).toContain("--color-primary-500:");
    expect(result.content).toContain("/* Typography Scale */");
    expect(result.content).toContain(".dark {");
  });
});
