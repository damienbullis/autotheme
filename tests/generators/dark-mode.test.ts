import { describe, it, expect } from "vitest";
import { generateDarkModeCSS } from "../../src/generators/dark-mode";
import { createTestTheme } from "../helpers/test-theme";

describe("generateDarkModeCSS", () => {
  it("generates .dark block with foreground and contrast for all harmony colors", () => {
    const theme = createTestTheme({ harmony: "triadic" });
    const result = generateDarkModeCSS(theme);

    expect(result).toContain(".dark {");
    expect(result).toMatch(/}$/);

    // All 3 triadic colors have foreground + contrast in OKLCH
    for (const name of ["primary", "secondary", "tertiary"]) {
      expect(result).toMatch(new RegExp(`--color-${name}-foreground:\\s*oklch\\(`));
      expect(result).toMatch(new RegExp(`--color-${name}-contrast:\\s*oklch\\(`));
    }
  });

  it("uses custom prefix in variable names", () => {
    const theme = createTestTheme({ harmony: "triadic", palette: { prefix: "at" } });
    const result = generateDarkModeCSS(theme);

    expect(result).toContain("--at-primary-foreground:");
    expect(result).not.toContain("--color-primary-foreground:");
  });

  it("emits under :root when mode is 'dark'", () => {
    const theme = createTestTheme({ mode: "dark" });
    const result = generateDarkModeCSS(theme);

    expect(result).toContain(":root {");
    expect(result).not.toContain(".dark {");
  });

  it("emits under .dark when mode is 'both'", () => {
    const theme = createTestTheme({ mode: "both" });
    const result = generateDarkModeCSS(theme);

    expect(result).toContain(".dark {");
    expect(result).not.toContain(":root {");
  });
});
