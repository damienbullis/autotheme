import { describe, it, expect, afterEach } from "vitest";
import { generateTheme } from "../../src/core/theme";
import { generateCSS } from "../../src/generators/css";
import { generateTailwindCSS } from "../../src/generators/tailwind";
import { generateShadcnCSS } from "../../src/generators/shadcn";
import { resolveConfig } from "../../src/config/merge";
import { DEFAULT_CONFIG } from "../../src/config/types";
import { existsSync, unlinkSync, writeFileSync } from "fs";

/** Parse all OKLCH values from a CSS string */
function extractOKLCHValues(css: string): string[] {
  return [...css.matchAll(/oklch\([^)]+\)/g)].map((m) => m[0]);
}

/** Parse all CSS custom property declarations from a CSS string */
function extractCSSVars(css: string): Map<string, string> {
  const vars = new Map<string, string>();
  for (const match of css.matchAll(/--([\w-]+):\s*([^;]+);/g)) {
    vars.set(`--${match[1]}`, match[2]!.trim());
  }
  return vars;
}

/** Verify an OKLCH string is syntactically valid */
function isValidOKLCH(value: string): boolean {
  return (
    /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\)$/.test(value) ||
    /^oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]+\s*\/\s*[\d.]+\s*\)$/.test(value)
  );
}

describe("full pipeline: config → theme → CSS", () => {
  it("generates correct CSS for a known color with triadic harmony", () => {
    const config = {
      ...DEFAULT_CONFIG,
      color: "#FF0000",
      harmony: "triadic" as const,
    };
    const theme = generateTheme(config);
    const result = generateCSS(theme);

    const vars = extractCSSVars(result.content);

    // Triadic = 3 colors: primary, secondary, tertiary
    // Each should have full 50-950 scale
    for (const name of ["primary", "secondary", "tertiary"]) {
      for (const scale of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
        const key = `--color-${name}-${scale}`;
        expect(vars.has(key), `missing ${key}`).toBe(true);
        expect(isValidOKLCH(vars.get(key)!), `invalid OKLCH for ${key}: ${vars.get(key)}`).toBe(
          true,
        );
      }

      // Foreground and contrast
      expect(vars.has(`--color-${name}-foreground`), `missing ${name}-foreground`).toBe(true);
      expect(vars.has(`--color-${name}-contrast`), `missing ${name}-contrast`).toBe(true);

      // 4 tones
      for (let t = 1; t <= 4; t++) {
        expect(vars.has(`--color-${name}-tone-${t}`), `missing ${name}-tone-${t}`).toBe(true);
      }
    }

    // Should NOT have quaternary (triadic = 3 colors)
    expect(vars.has("--color-quaternary-500")).toBe(false);
  });

  it("generates correct count of color sets per harmony type", () => {
    const harmonyCounts: Record<string, number> = {
      complementary: 2,
      analogous: 3,
      triadic: 3,
      "split-complementary": 3,
      drift: 4,
      square: 4,
    };

    for (const [harmony, expectedCount] of Object.entries(harmonyCounts)) {
      const config = { ...DEFAULT_CONFIG, color: "#3366CC", harmony };
      const theme = generateTheme(config);
      const result = generateCSS(theme);
      const vars = extractCSSVars(result.content);

      // Count how many unique color names have a -500 variable
      const colorNames = new Set<string>();
      for (const [key] of vars) {
        const match = key.match(/^--color-([\w-]+)-500$/);
        if (match) colorNames.add(match[1]!);
      }

      expect(colorNames.size, `${harmony} should produce ${expectedCount} color sets`).toBe(
        expectedCount,
      );
    }
  });

  it("all OKLCH values in output are syntactically valid", () => {
    const config = {
      ...DEFAULT_CONFIG,
      color: "#6439FF",
      shadcn: { enabled: true, radius: "0.625rem" },
      gradients: true,
      noise: true,
    };
    const theme = generateTheme(config);
    const result = generateCSS(theme);

    const oklchValues = extractOKLCHValues(result.content);
    expect(oklchValues.length).toBeGreaterThan(0);

    for (const value of oklchValues) {
      expect(isValidOKLCH(value), `invalid OKLCH: ${value}`).toBe(true);
    }
  });

  it("minimal config produces only palette + typography + dark mode", () => {
    const config = { ...DEFAULT_CONFIG, color: "#00CC88" };
    const theme = generateTheme(config);
    const result = generateCSS(theme);

    // Present: palette, typography, dark mode
    expect(result.content).toContain(":root {");
    expect(result.content).toContain("--color-primary-500:");
    expect(result.content).toContain("--text-xs:");
    expect(result.content).toContain(".dark {");

    // Absent: all optional features
    expect(result.content).not.toContain("Shadcn");
    expect(result.content).not.toContain("Spacing Scale");
    expect(result.content).not.toContain("Background Images");
    expect(result.content).not.toContain("Gradient");
    expect(result.content).not.toContain("Utility Classes");
  });

  it("all features on produces complete output", () => {
    const config = {
      ...DEFAULT_CONFIG,
      color: "#FF6600",
      shadcn: { enabled: true, radius: "1rem" },
      spacing: { enabled: true, base: 0.155, ratio: 1.618, steps: 10 },
      gradients: true,
      noise: true,
      utilities: true,
    };
    const theme = generateTheme(config);
    const result = generateCSS(theme);

    expect(result.content).toContain("Shadcn UI");
    expect(result.content).toContain("Spacing Scale");
    expect(result.content).toContain("Background Images");
    expect(result.content).toContain("Gradients");
    expect(result.content).toContain("Utility Classes");
  });

  it("typography scale follows exponential growth", () => {
    const config = {
      ...DEFAULT_CONFIG,
      color: "#000000",
      typography: { base: 1, ratio: 2, steps: 4 },
    };
    const theme = generateTheme(config);
    const result = generateCSS(theme);
    const vars = extractCSSVars(result.content);

    // base=1, ratio=2 → 1, 2, 4, 8
    expect(vars.get("--text-xs")).toBe("1.000rem");
    expect(vars.get("--text-sm")).toBe("2.000rem");
    expect(vars.get("--text-md")).toBe("4.000rem");
    expect(vars.get("--text-lg")).toBe("8.000rem");
  });
});

describe("config → theme pipeline", () => {
  const configPath = "./pipeline-test-config.json";

  afterEach(() => {
    if (existsSync(configPath)) unlinkSync(configPath);
  });

  it("config file values flow through to CSS output", async () => {
    writeFileSync(
      configPath,
      JSON.stringify({
        color: "#FF0000",
        harmony: "complementary",
        palette: { prefix: "at" },
      }),
    );

    const config = await resolveConfig({ config: configPath });
    const theme = generateTheme(config);
    const result = generateCSS(theme);

    // Prefix from config file applied
    expect(result.content).toContain("--at-primary-500:");
    expect(result.content).not.toContain("--color-primary-500:");

    // Complementary = 2 colors
    expect(result.content).toContain("--at-secondary-500:");
    expect(result.content).not.toContain("--at-tertiary-500:");
  });

  it("CLI args override config file in final output", async () => {
    writeFileSync(
      configPath,
      JSON.stringify({
        color: "#00FF00",
        harmony: "analogous",
        palette: { prefix: "theme" },
      }),
    );

    const config = await resolveConfig({
      config: configPath,
      harmony: "triadic",
    });
    const theme = generateTheme(config);
    const result = generateCSS(theme);

    // Harmony from CLI override
    expect(result.content).toContain("--theme-tertiary-500:"); // triadic = 3 colors

    // Prefix from config file (not overridden by CLI)
    expect(result.content).toContain("--theme-primary-500:");
  });
});

describe("Tailwind integration output", () => {
  it("@theme block references correct CSS variables from :root", () => {
    const config = {
      ...DEFAULT_CONFIG,
      color: "#3366CC",
      palette: { prefix: "at", contrastTarget: 7 },
    };
    const theme = generateTheme(config);
    const result = generateTailwindCSS(theme);

    // :root uses custom prefix
    expect(result.content).toContain("--at-primary-500:");

    // @theme remaps to --color-* namespace
    const themeBlock = result.content.split("@theme {")[1]!;
    expect(themeBlock).toContain("--color-primary-500: var(--at-primary-500)");
  });
});

describe("Shadcn CSS output", () => {
  it("generates valid light and dark mode blocks with OKLCH colors", () => {
    const config = { ...DEFAULT_CONFIG, color: "#6439FF" };
    const theme = generateTheme(config);
    const css = generateShadcnCSS(theme);

    // Both blocks present
    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");

    // All OKLCH values valid
    const oklchValues = extractOKLCHValues(css);
    expect(oklchValues.length).toBeGreaterThan(20); // Should have many color vars
    for (const value of oklchValues) {
      expect(isValidOKLCH(value), `invalid OKLCH: ${value}`).toBe(true);
    }

    // Has the required Shadcn variables
    const vars = extractCSSVars(css);
    const required = [
      "--background",
      "--foreground",
      "--primary",
      "--primary-foreground",
      "--secondary",
      "--muted",
      "--accent",
      "--destructive",
      "--border",
      "--ring",
      "--radius",
      "--chart-1",
      "--sidebar",
    ];
    for (const name of required) {
      expect(vars.has(name), `missing ${name}`).toBe(true);
    }
  });
});
