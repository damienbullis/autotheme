import { describe, it, expect } from "vitest";
import { generateTheme } from "../../src/core/theme";
import type { ResolvedConfig } from "../../src/config/types";
import { resolveToConfig } from "../../src/config/merge";

function makeConfig(overrides: Record<string, unknown> = {}): ResolvedConfig {
  return resolveToConfig({ color: "#6439FF", ...overrides });
}

describe("generateTheme", () => {
  it("returns a valid GeneratedTheme with palette and config", () => {
    const config = makeConfig({ palette: true });
    const theme = generateTheme(config);

    expect(theme.palette).toBeDefined();
    expect(theme.harmony).toBeDefined();
    expect(theme.palette.palettes.length).toBeGreaterThan(0);
    expect(theme.palette.textColors.size).toBeGreaterThan(0);
    expect(theme.config).toBe(config);
  });

  it("generates correct number of harmony colors for triadic", () => {
    const theme = generateTheme(makeConfig({ harmony: "triadic", palette: true }));
    expect(theme.harmony.type).toBe("triadic");
    expect(theme.harmony.colors).toHaveLength(3);
    expect(theme.palette.palettes).toHaveLength(3);
  });

  it("generates correct number of harmony colors for complementary", () => {
    const theme = generateTheme(makeConfig({ harmony: "complementary", palette: true }));
    expect(theme.harmony.type).toBe("complementary");
    expect(theme.harmony.colors).toHaveLength(2);
    expect(theme.palette.palettes).toHaveLength(2);
  });

  it("generates correct number of harmony colors for drift", () => {
    const theme = generateTheme(makeConfig({ harmony: "drift", palette: true }));
    expect(theme.harmony.type).toBe("drift");
    expect(theme.harmony.colors).toHaveLength(4);
    expect(theme.palette.palettes).toHaveLength(4);
  });

  it("generates correct number of harmony colors for analogous", () => {
    const theme = generateTheme(makeConfig({ harmony: "analogous", palette: true }));
    expect(theme.harmony.type).toBe("analogous");
    expect(theme.harmony.colors).toHaveLength(3);
  });

  it("passes swing options through to palette generation", () => {
    const theme = generateTheme(
      makeConfig({ palette: { swing: 1.5, swingStrategy: "exponential" } }),
    );
    expect(theme.palette).toBeDefined();
    expect(theme.harmony).toBeDefined();
    const pal = theme.config.palette;
    expect(pal !== false && pal.swing).toBe(1.5);
    expect(pal !== false && pal.swingStrategy).toBe("exponential");
  });

  it("swing affects harmony color hues", () => {
    const normal = generateTheme(makeConfig({ harmony: "triadic", palette: true }));
    const swung = generateTheme(makeConfig({ harmony: "triadic", palette: { swing: 0.5 } }));

    // With swing 0.5, offsets are halved, so hues should differ
    const normalHue1 = normal.harmony.colors[1]!.hsl.h;
    const swungHue1 = swung.harmony.colors[1]!.hsl.h;
    expect(swungHue1).not.toBeCloseTo(normalHue1, 0);
  });

  it("generates theme with custom harmony", () => {
    const config = makeConfig({
      harmony: "warm-quad",
      palette: true,
      harmonies: {
        "warm-quad": { offsets: [0, 30, 60, 180] },
      },
    });
    const theme = generateTheme(config);
    expect(theme.harmony.type).toBe("warm-quad");
    expect(theme.harmony.colors).toHaveLength(4);
    expect(theme.palette.palettes).toHaveLength(4);
  });

  it("generates monochromatic harmony (3 colors)", () => {
    const theme = generateTheme(makeConfig({ harmony: "monochromatic", palette: true }));
    expect(theme.harmony.type).toBe("monochromatic");
    expect(theme.harmony.colors).toHaveLength(3);
    expect(theme.palette.palettes).toHaveLength(3);
  });

  it("generates double-split-complementary harmony (5 colors)", () => {
    const theme = generateTheme(
      makeConfig({ harmony: "double-split-complementary", palette: true }),
    );
    expect(theme.harmony.type).toBe("double-split-complementary");
    expect(theme.harmony.colors).toHaveLength(5);
    expect(theme.palette.palettes).toHaveLength(5);
  });

  it("generates theme with custom angles", () => {
    const config = makeConfig({
      harmony: "custom",
      angles: [0, 72, 144, 216, 288],
      palette: true,
    });
    const theme = generateTheme(config);
    expect(theme.harmony.type).toBe("custom");
    expect(theme.harmony.colors).toHaveLength(5);
    expect(theme.palette.palettes).toHaveLength(5);
  });

  it("throws for unknown custom harmony", () => {
    const config = makeConfig({ harmony: "nonexistent" });
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
    const theme = generateTheme(makeConfig({ palette: true }));
    for (const p of theme.palette.palettes) {
      expect(p.base).toBeDefined();
      expect(p.tints.length).toBeGreaterThan(0);
      expect(p.shades.length).toBeGreaterThan(0);
      expect(p.tones.length).toBeGreaterThan(0);
    }
  });

  it("palette off produces minimal palette with no variations", () => {
    const theme = generateTheme(makeConfig());
    // palette defaults to false
    expect(theme.config.palette).toBe(false);
    for (const p of theme.palette.palettes) {
      expect(p.base).toBeDefined();
      expect(p.tints).toHaveLength(0);
      expect(p.shades).toHaveLength(0);
      expect(p.tones).toHaveLength(0);
    }
  });
});
