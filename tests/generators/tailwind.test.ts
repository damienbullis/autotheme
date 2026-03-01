import { describe, it, expect } from "vitest";
import { generateTailwindCSS } from "../../src/generators/tailwind";
import { createTestTheme } from "../helpers/test-theme";

describe("generateTailwindCSS", () => {
  it("generates valid Tailwind v4 output with :root vars and @theme block", () => {
    const theme = createTestTheme();
    const result = generateTailwindCSS(theme);

    expect(result.filename).toBe("./autotheme.tailwind.css");
    expect(result.content).toContain(":root {");
    expect(result.content).toContain("@theme {");

    // @theme block has typography
    const themeBlock = result.content.split("@theme {")[1];
    expect(themeBlock).toContain("--text-xs:");
    expect(themeBlock).toContain("--text-4xl:");

    // Has custom utility definitions
    expect(result.content).toContain("@utility radial-position-*");
    expect(result.content).toContain("@utility gradient-from-*");
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

  it("includes spacing in @theme only when enabled", () => {
    const without = generateTailwindCSS(createTestTheme({ spacing: { enabled: false } }));
    const withSpacing = generateTailwindCSS(createTestTheme({ spacing: { enabled: true } }));

    const withoutTheme = without.content.split("@theme {")[1];
    const withTheme = withSpacing.content.split("@theme {")[1];

    expect(withoutTheme).not.toContain("--spacing-1:");
    expect(withTheme).toContain("--spacing-1:");
  });

  it("remaps prefix when not 'color'", () => {
    const result = generateTailwindCSS(createTestTheme({ palette: { prefix: "at" } }));
    const themeBlock = result.content.split("@theme {")[1];

    // @theme should remap --color-* to var(--at-*)
    expect(themeBlock).toContain("--color-primary-500: var(--at-primary-500)");
    expect(themeBlock).toContain("--color-primary-foreground: var(--at-primary-foreground)");
  });

  it("includes noise background variables when enabled", () => {
    const result = generateTailwindCSS(createTestTheme({ noise: true }));

    expect(result.content).toContain("--background-image-noise:");
    expect(result.content).toContain("--background-image-linear:");
    expect(result.content).toContain("--background-image-radial:");
  });
});
