import { describe, it, expect } from "vitest";
import { generateTailwindCSS } from "../../src/generators/tailwind";
import { createTestTheme } from "../helpers/test-theme";

describe("generateTailwindCSS", () => {
  it("starts with @import directive instead of embedded CSS", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.content).toMatch(/^@import "\.\/autotheme\.css";/);
    // Should NOT contain embedded :root blocks
    expect(result.content).not.toMatch(/^:root \{/m);
  });

  it("generates @theme block with palette color registrations", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("@theme {");
    const themeBlock = result.content.split("@theme {")[1];
    expect(themeBlock).toContain("--color-primary-500: var(--color-primary-500)");
    expect(themeBlock).toContain("--color-primary-foreground: var(--color-primary-foreground)");
    expect(themeBlock).toContain("--color-secondary-500: var(--color-secondary-500)");
  });

  it("uses correct @import filename from output path", () => {
    const theme = createTestTheme({ output: { path: "./dist/theme.css" } });
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain('@import "./theme.css"');
    expect(result.filename).toBe("./dist/theme.tailwind.css");
  });

  it("includes semantic token registrations when semantics enabled", () => {
    const withSemantics = generateTailwindCSS(createTestTheme({ semantics: { enabled: true } }));
    const withoutSemantics = generateTailwindCSS(
      createTestTheme({ semantics: { enabled: false } }),
    );

    expect(withSemantics.content).toContain("--color-surface: var(--surface)");
    expect(withSemantics.content).toContain("--color-text-1: var(--text-1)");
    expect(withSemantics.content).toContain("--color-accent: var(--accent)");

    expect(withoutSemantics.content).not.toContain("--color-surface:");
  });

  it("includes shadcn mappings and radius only when enabled", () => {
    const without = generateTailwindCSS(createTestTheme({ shadcn: { enabled: false } }));
    const withShadcn = generateTailwindCSS(createTestTheme({ shadcn: { enabled: true } }));

    expect(without.content).not.toContain("--color-background: var(--background)");
    expect(without.content).not.toContain("--radius-sm:");

    expect(withShadcn.content).toContain("--color-background: var(--background)");
    expect(withShadcn.content).toContain("--radius-sm:");
    expect(withShadcn.content).toContain("--radius-lg:");
  });

  it("includes spacing references in @theme only when enabled", () => {
    const without = generateTailwindCSS(createTestTheme({ spacing: { enabled: false } }));
    const withSpacing = generateTailwindCSS(createTestTheme({ spacing: { enabled: true } }));

    expect(without.content).not.toContain("--spacing-1:");
    expect(withSpacing.content).toContain("--spacing-1: var(--spacing-1)");
  });

  it("includes typography references in @theme", () => {
    const result = generateTailwindCSS(createTestTheme({ typography: { enabled: true } }));
    expect(result.content).toContain("--text-base: var(--text-base)");
  });

  it("remaps prefix when not 'color'", () => {
    const result = generateTailwindCSS(createTestTheme({ palette: { prefix: "at" } }));
    const themeBlock = result.content.split("@theme {")[1];

    expect(themeBlock).toContain("--color-primary-500: var(--at-primary-500)");
    expect(themeBlock).toContain("--color-primary-foreground: var(--at-primary-foreground)");
  });

  it("uses @theme inline for noise and gradient vars", () => {
    const result = generateTailwindCSS(createTestTheme({ noise: true }));

    expect(result.content).toContain("@theme inline {");
    expect(result.content).toContain("--background-image-noise: var(--background-image-noise)");
  });

  it("has custom utility definitions", () => {
    const result = generateTailwindCSS(createTestTheme());

    expect(result.content).toContain("@utility radial-position-*");
    expect(result.content).toContain("@utility gradient-from-*");
  });
});
