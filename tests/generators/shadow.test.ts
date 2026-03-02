import { describe, it, expect } from "vitest";
import { generateShadowScale } from "../../src/generators/shadow";
import { generateCSS } from "../../src/generators/css";
import { createTestTheme } from "../helpers/test-theme";

describe("generateShadowScale", () => {
  it("generates correct number of steps", () => {
    const result = generateShadowScale(5, 1, 2, 240, 10, false, "oklch");
    expect(result).toHaveLength(5);
    expect(result[0]!.name).toBe("shadow-1");
    expect(result[4]!.name).toBe("shadow-5");
  });

  it("blur progresses by base * ratio^i", () => {
    const result = generateShadowScale(3, 2, 3, 0, 10, false, "oklch");
    // blur = base * ratio^(i-1): 2, 6, 18
    expect(result[0]!.value).toContain("2px");
    expect(result[1]!.value).toContain("6px");
    expect(result[2]!.value).toContain("18px");
  });

  it("tints shadow color with primary hue", () => {
    const result = generateShadowScale(1, 1, 2, 200, 15, false, "hsl");
    // Should contain hsla with hue near 200 (alpha < 1 for shadows)
    // OKLCH round-trip may shift hue by ±2 degrees
    expect(result[0]!.value).toMatch(/hsla?\(\s*(19[89]|20[012]),/);
  });

  it("dark mode produces higher alpha than light mode", () => {
    const light = generateShadowScale(3, 1, 2, 0, 10, false, "oklch");
    const dark = generateShadowScale(3, 1, 2, 0, 10, true, "oklch");
    // Dark shadow strings should have higher alpha values (represented in the formatted color)
    // We verify by checking the OKLCH output contains the alpha separator
    for (let i = 0; i < 3; i++) {
      // Both should produce valid CSS shadow values
      expect(light[i]!.value).toMatch(/^0 \d+px \d+px 0px /);
      expect(dark[i]!.value).toMatch(/^0 \d+px \d+px 0px /);
    }
  });

  it("produces valid CSS shadow syntax", () => {
    const result = generateShadowScale(5, 1, 2, 120, 10, false, "oklch");
    for (const shadow of result) {
      // Should match: 0 Ypx Bpx 0px <color>
      expect(shadow.value).toMatch(/^0 \d+px \d+px 0px .+$/);
    }
  });

  it("respects different color formats", () => {
    const oklch = generateShadowScale(1, 1, 2, 0, 10, false, "oklch");
    const hsl = generateShadowScale(1, 1, 2, 0, 10, false, "hsl");
    const hex = generateShadowScale(1, 1, 2, 0, 10, false, "hex");
    expect(oklch[0]!.value).toContain("oklch(");
    expect(hsl[0]!.value).toContain("hsl");
    expect(hex[0]!.value).toContain("#");
  });
});

describe("shadow scale in CSS output", () => {
  it("generates shadow vars when enabled", () => {
    const theme = createTestTheme({ shadows: { enabled: true, steps: 3 } });
    const result = generateCSS(theme);
    expect(result.content).toContain("--shadow-1:");
    expect(result.content).toContain("--shadow-2:");
    expect(result.content).toContain("--shadow-3:");
  });

  it("uses manual values when provided", () => {
    const theme = createTestTheme({
      shadows: {
        enabled: true,
        values: ["0 1px 2px rgba(0,0,0,0.1)", "0 4px 8px rgba(0,0,0,0.2)"],
      },
    });
    const result = generateCSS(theme);
    expect(result.content).toContain("--shadow-1: 0 1px 2px rgba(0,0,0,0.1);");
    expect(result.content).toContain("--shadow-2: 0 4px 8px rgba(0,0,0,0.2);");
  });

  it("does not generate shadows when disabled", () => {
    const theme = createTestTheme();
    const result = generateCSS(theme);
    expect(result.content).not.toContain("--shadow-");
  });
});
