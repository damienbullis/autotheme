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

  it("generates correct number of harmony colors for drift", () => {
    const theme = generateTheme(makeConfig({ harmony: "drift" }));
    expect(theme.palette.harmony.type).toBe("drift");
    expect(theme.palette.harmony.colors).toHaveLength(4);
    expect(theme.palette.palettes).toHaveLength(4);
  });

  it("generates correct number of harmony colors for analogous", () => {
    const theme = generateTheme(makeConfig({ harmony: "analogous" }));
    expect(theme.palette.harmony.type).toBe("analogous");
    expect(theme.palette.harmony.colors).toHaveLength(3);
  });

  it("passes swing options through to palette generation", () => {
    const theme = generateTheme(makeConfig({ swing: 1.5, swingStrategy: "exponential" }));
    expect(theme.palette).toBeDefined();
    expect(theme.palette.harmony).toBeDefined();
    expect(theme.config.swing).toBe(1.5);
    expect(theme.config.swingStrategy).toBe("exponential");
  });

  it("swing affects harmony color hues", () => {
    const normal = generateTheme(makeConfig({ harmony: "triadic" }));
    const swung = generateTheme(makeConfig({ harmony: "triadic", swing: 0.5 }));

    // With swing 0.5, offsets are halved, so hues should differ
    const normalHue1 = normal.palette.harmony.colors[1]!.hsl.h;
    const swungHue1 = swung.palette.harmony.colors[1]!.hsl.h;
    expect(swungHue1).not.toBeCloseTo(normalHue1, 0);
  });

  it("generates theme with custom harmony", () => {
    const config = makeConfig({
      harmony: "warm-quad",
      harmonies: {
        "warm-quad": { offsets: [0, 30, 60, 180] },
      },
    });
    const theme = generateTheme(config);
    expect(theme.palette.harmony.type).toBe("warm-quad");
    expect(theme.palette.harmony.colors).toHaveLength(4);
    expect(theme.palette.palettes).toHaveLength(4);
  });

  it("throws for unknown custom harmony", () => {
    const config = makeConfig({ harmony: "nonexistent" as any });
    expect(() => generateTheme(config)).toThrow('Unknown harmony type: "nonexistent"');
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
