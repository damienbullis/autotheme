import { describe, it, expect } from "vitest";
import { generateTheme } from "../../src/core/theme";
import type { AutoThemeConfig } from "../../src/config/types";
import { DEFAULT_CONFIG } from "../../src/config/types";

function makeConfig(overrides: Partial<AutoThemeConfig> = {}): AutoThemeConfig {
  return { ...DEFAULT_CONFIG, color: "#6439FF", ...overrides };
}

describe("generateTheme", () => {
  it("returns a valid GeneratedTheme with palette and config", () => {
    const config = makeConfig();
    const theme = generateTheme(config);

    expect(theme.palette).toBeDefined();
    expect(theme.palette.harmony).toBeDefined();
    expect(theme.palette.palettes.length).toBeGreaterThan(0);
    expect(theme.palette.textColors.size).toBeGreaterThan(0);
    expect(theme.config).toBe(config);
  });

  it("generates correct number of harmony colors for triadic", () => {
    const theme = generateTheme(makeConfig({ harmony: "triadic" }));
    expect(theme.palette.harmony.type).toBe("triadic");
    expect(theme.palette.harmony.colors).toHaveLength(3);
    expect(theme.palette.palettes).toHaveLength(3);
  });

  it("generates correct number of harmony colors for complementary", () => {
    const theme = generateTheme(makeConfig({ harmony: "complementary" }));
    expect(theme.palette.harmony.type).toBe("complementary");
    expect(theme.palette.harmony.colors).toHaveLength(2);
    expect(theme.palette.palettes).toHaveLength(2);
  });

  it("generates correct number of harmony colors for tetradic", () => {
    const theme = generateTheme(makeConfig({ harmony: "tetradic" }));
    expect(theme.palette.harmony.type).toBe("tetradic");
    expect(theme.palette.harmony.colors).toHaveLength(4);
    expect(theme.palette.palettes).toHaveLength(4);
  });

  it("generates correct number of harmony colors for analogous", () => {
    const theme = generateTheme(makeConfig({ harmony: "analogous" }));
    expect(theme.palette.harmony.type).toBe("analogous");
    expect(theme.palette.harmony.colors).toHaveLength(3);
  });

  it("throws on invalid color string", () => {
    expect(() => generateTheme(makeConfig({ color: "not-a-color" }))).toThrow();
  });

  it("works with rgb color input", () => {
    const theme = generateTheme(makeConfig({ color: "rgb(100, 57, 255)" }));
    expect(theme.palette.palettes.length).toBeGreaterThan(0);
  });

  it("works with hsl color input", () => {
    const theme = generateTheme(makeConfig({ color: "hsl(255, 100%, 61%)" }));
    expect(theme.palette.palettes.length).toBeGreaterThan(0);
  });

  it("each palette has tints, shades, and tones", () => {
    const theme = generateTheme(makeConfig());
    for (const p of theme.palette.palettes) {
      expect(p.base).toBeDefined();
      expect(p.tints.length).toBeGreaterThan(0);
      expect(p.shades.length).toBeGreaterThan(0);
      expect(p.tones.length).toBeGreaterThan(0);
    }
  });
});
