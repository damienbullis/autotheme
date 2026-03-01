import { describe, it, expect } from "vitest";
import { generateTailwindCSS } from "../../src/generators/tailwind";
import { createTestTheme } from "../helpers/test-theme";

describe("generateTailwindCSS", () => {
  it("generates output with correct filename", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.filename).toBe("./autotheme.tailwind.css");
  });

  it("includes AutoTheme CSS variables", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("/* AutoTheme Variables (Tailwind v4 compatible) */");
    expect(result.content).toContain(":root {");
  });

  it("includes @theme directive", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("Tailwind v4 Theme Integration");
    expect(result.content).toContain("@theme {");
  });

  it("maps Shadcn semantic colors when enabled", () => {
    const theme = createTestTheme({ shadcn: { enabled: true } });
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("--color-background: var(--background);");
    expect(result.content).toContain("--color-foreground: var(--foreground);");
  });

  it("maps all Shadcn colors when enabled", () => {
    const theme = createTestTheme({ shadcn: { enabled: true } });
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("--color-card: var(--card);");
    expect(result.content).toContain("--color-popover: var(--popover);");
    expect(result.content).toContain("--color-muted: var(--muted);");
    expect(result.content).toContain("--color-accent: var(--accent);");
    expect(result.content).toContain("--color-destructive: var(--destructive);");
  });

  it("includes color scale variables in :root", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("--color-primary-500:");
    expect(result.content).toContain("--color-primary-50:");
    expect(result.content).toContain("--color-primary-950:");
    expect(result.content).toContain("--color-secondary-500:");
  });

  it("includes background image variables when noise enabled", () => {
    const theme = createTestTheme({ noise: true });
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("/* Background Images */");
    expect(result.content).toContain("--background-image-noise:");
    expect(result.content).toContain("--background-image-linear:");
    expect(result.content).toContain("--background-image-radial:");
  });

  it("includes custom utility definitions", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("/* Custom Utilities */");
    expect(result.content).toContain("@utility radial-position-* {");
    expect(result.content).toContain("@utility radial-scale-* {");
    expect(result.content).toContain("@utility gradient-from-* {");
    expect(result.content).toContain("@utility gradient-to-* {");
  });

  it("includes radius variables when shadcn enabled", () => {
    const theme = createTestTheme({ shadcn: { enabled: true } });
    const result = generateTailwindCSS(theme);

    expect(result.content).toContain("/* Radius */");
    expect(result.content).toContain("--radius-sm:");
    expect(result.content).toContain("--radius-md:");
    expect(result.content).toContain("--radius-lg:");
    expect(result.content).toContain("--radius-xl:");
  });

  it("includes typography scale in @theme block", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);
    const themeBlock = result.content.split("@theme {")[1];

    expect(themeBlock).toContain("--text-xs:");
    expect(themeBlock).toContain("--text-sm:");
    expect(themeBlock).toContain("--text-4xl:");
  });

  it("includes spacing scale in @theme block when enabled", () => {
    const theme = createTestTheme({ spacing: { enabled: true } });
    const result = generateTailwindCSS(theme);
    const themeBlock = result.content.split("@theme {")[1];

    expect(themeBlock).toContain("--spacing-1:");
    expect(themeBlock).toContain("--spacing-10:");
  });

  it("omits spacing in @theme when spacing is disabled", () => {
    const theme = createTestTheme({ spacing: { enabled: false } });
    const result = generateTailwindCSS(theme);
    const themeBlock = result.content.split("@theme {")[1];

    expect(themeBlock).not.toContain("--spacing-1:");
  });

  it("omits shadcn mappings when shadcn is disabled", () => {
    const theme = createTestTheme({ shadcn: { enabled: false } });
    const result = generateTailwindCSS(theme);

    expect(result.content).not.toContain("--color-background: var(--background);");
    expect(result.content).not.toContain("/* Radius */");
  });

  it("adds prefix remapping when prefix is not 'color'", () => {
    const theme = createTestTheme({ palette: { prefix: "at" } });
    const result = generateTailwindCSS(theme);
    const themeBlock = result.content.split("@theme {")[1];

    expect(themeBlock).toContain("--color-primary-500: var(--at-primary-500);");
    expect(themeBlock).toContain("--color-primary-foreground: var(--at-primary-foreground);");
  });
});
