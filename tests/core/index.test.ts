import { describe, it, expect } from "vitest";
import * as core from "../../src/core";

describe("Core module exports", () => {
  it("exports Color class", () => {
    expect(core.Color).toBeDefined();
    expect(typeof core.Color).toBe("function");
  });

  it("exports parsing functions", () => {
    expect(core.parseColor).toBeDefined();
    expect(core.isRGBColor).toBeDefined();
    expect(core.isHSLColor).toBeDefined();
  });

  it("exports conversion functions", () => {
    expect(core.hexToRgb).toBeDefined();
    expect(core.rgbToHsl).toBeDefined();
    expect(core.hslToRgb).toBeDefined();
    expect(core.rgbToHex).toBeDefined();
    expect(core.hexToHsl).toBeDefined();
    expect(core.hslToHex).toBeDefined();
  });

  it("exports contrast functions", () => {
    expect(core.getLuminance).toBeDefined();
    expect(core.getContrastRatio).toBeDefined();
    expect(core.checkWCAG).toBeDefined();
    expect(core.findAccessibleTextColor).toBeDefined();
    expect(core.getBestContrastColor).toBeDefined();
  });

  it("Color class works end-to-end", () => {
    const color = new core.Color("#ff6600");
    expect(color.hex).toBe("#ff6600");
    expect(color.toRGBValues()).toBe("255 102 0");

    const lighter = color.lighten(20);
    expect(lighter.hsl.l).toBeGreaterThan(color.hsl.l);

    const text = core.findAccessibleTextColor(color);
    const ratio = core.getContrastRatio(text, color);
    expect(ratio).toBeGreaterThanOrEqual(7);
  });
});
