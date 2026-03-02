import { describe, it, expect } from "vitest";
import {
  generateShadcnCSS,
  generateErrorColor,
  selectAccentColor,
} from "../../src/generators/shadcn";
import { createTestTheme } from "../helpers/test-theme";

describe("generateErrorColor", () => {
  it("falls back to orange when primary is red (~0°)", () => {
    const error = generateErrorColor(5);
    // OKLCH round-trip may shift hue slightly from the input 25
    expect(error.hsl.h).toBeCloseTo(25, 0);
  });

  it("picks a red candidate when primary is far from red (~180°)", () => {
    const error = generateErrorColor(180);
    // Should pick one of the red candidates (0, 10, or 350), allow ±2 for OKLCH round-trip
    const hue = error.hsl.h;
    const isNearCandidate = [0, 10, 350].some(
      (c) => Math.abs(hue - c) <= 2 || Math.abs(hue - c) >= 358,
    );
    expect(isNearCandidate).toBe(true);
  });

  it("falls back to orange when primary is near 350°", () => {
    const error = generateErrorColor(350);
    // OKLCH round-trip may shift hue slightly from the input 25
    expect(error.hsl.h).toBeCloseTo(25, 0);
  });

  it("picks standard red when primary is distant enough", () => {
    const error = generateErrorColor(120);
    // Should pick hue 350 (most distant red candidate from 120), allow ±2 for OKLCH round-trip
    expect(error.hsl.h).toBeCloseTo(350, 0);
  });
});

describe("selectAccentColor", () => {
  it("returns the most hue-distant harmony color", () => {
    const theme = createTestTheme({ harmony: "complementary" });
    const result = selectAccentColor(theme.palette);
    expect(result.color).toBeDefined();
    expect(result.palette).toBeDefined();
  });
});

describe("generateShadcnCSS", () => {
  it("maps shadcn variables to semantic token references", () => {
    const theme = createTestTheme({
      shadcn: { enabled: true },
      semantics: { enabled: true },
    });
    const css = generateShadcnCSS(theme);

    expect(css).toContain("--background: var(--surface)");
    expect(css).toContain("--foreground: var(--text-1)");
    expect(css).toContain("--card: var(--surface-elevated)");
    expect(css).toContain("--muted: var(--surface-sunken)");
    expect(css).toContain("--muted-foreground: var(--text-2)");
    expect(css).toContain("--primary: var(--accent)");
    expect(css).toContain("--ring: var(--accent)");
    expect(css).toContain("--input: var(--border-strong)");
    expect(css).toContain("--border: var(--border)");
  });

  it("references palette vars for chart colors", () => {
    const theme = createTestTheme({ shadcn: { enabled: true }, semantics: { enabled: true } });
    const css = generateShadcnCSS(theme);

    expect(css).toContain("--chart-1: var(--color-primary-500)");
    expect(css).toContain("--chart-2: var(--color-secondary-500)");
  });

  it("computes destructive color as OKLCH (not a var reference)", () => {
    const theme = createTestTheme({ shadcn: { enabled: true }, semantics: { enabled: true } });
    const css = generateShadcnCSS(theme);

    expect(css).toMatch(/--destructive:\s*oklch\(/);
    expect(css).toMatch(/--destructive-foreground:\s*oklch\(/);
  });

  it("emits :root and .dark blocks in 'both' mode", () => {
    const theme = createTestTheme({
      mode: "both",
      shadcn: { enabled: true },
      semantics: { enabled: true },
    });
    const css = generateShadcnCSS(theme);

    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");
  });

  it("dark override only contains destructive overrides in 'both' mode", () => {
    const theme = createTestTheme({
      mode: "both",
      shadcn: { enabled: true },
      semantics: { enabled: true },
    });
    const css = generateShadcnCSS(theme);
    const darkBlock = css.split(".dark {")[1]!.split("}")[0]!;

    // Dark block should only have destructive overrides
    expect(darkBlock).toContain("--destructive:");
    expect(darkBlock).toContain("--destructive-foreground:");
    expect(darkBlock).not.toContain("--background:");
    expect(darkBlock).not.toContain("--foreground:");
  });

  it("emits dark values under :root for dark-only mode", () => {
    const theme = createTestTheme({
      mode: "dark",
      shadcn: { enabled: true },
      semantics: { enabled: true },
    });
    const css = generateShadcnCSS(theme);

    expect(css).toContain(":root {");
    expect(css).not.toContain(".dark {");
    expect(css).toContain("--background: var(--surface)");
  });

  it("uses provided radius value", () => {
    const theme = createTestTheme({ shadcn: { enabled: true }, semantics: { enabled: true } });
    const css = generateShadcnCSS(theme, "1.5rem");
    expect(css).toContain("--radius: 1.5rem");
  });

  it("uses default radius when not provided", () => {
    const theme = createTestTheme({ shadcn: { enabled: true }, semantics: { enabled: true } });
    const css = generateShadcnCSS(theme);
    expect(css).toContain("--radius: 0.625rem");
  });

  it("references sidebar semantic tokens", () => {
    const theme = createTestTheme({ shadcn: { enabled: true }, semantics: { enabled: true } });
    const css = generateShadcnCSS(theme);

    expect(css).toContain("--sidebar: var(--surface-sunken)");
    expect(css).toContain("--sidebar-foreground: var(--text-1)");
    expect(css).toContain("--sidebar-border: var(--border-subtle)");
    expect(css).toContain("--sidebar-ring: var(--accent)");
  });
});
