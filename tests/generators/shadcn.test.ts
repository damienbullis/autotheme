import { describe, it, expect } from "vitest";
import {
  generateShadcnColors,
  generateShadcnCSS,
  generateErrorColor,
} from "../../src/generators/shadcn";
import { Color } from "../../src/core/color";
import { createTestTheme } from "../helpers/test-theme";

describe("generateShadcnColors", () => {
  it("generates all required semantic colors for light and dark modes", () => {
    const theme = createTestTheme();
    const { light, dark } = generateShadcnColors(theme);

    // Both modes exist
    expect(light).toBeDefined();
    expect(dark).toBeDefined();

    // All core semantic colors are Color instances
    const requiredKeys = [
      "background",
      "foreground",
      "primary",
      "primaryForeground",
      "secondary",
      "secondaryForeground",
      "accent",
      "accentForeground",
      "muted",
      "mutedForeground",
      "destructive",
      "destructiveForeground",
      "card",
      "cardForeground",
      "popover",
      "popoverForeground",
      "border",
      "input",
      "ring",
    ] as const;

    for (const key of requiredKeys) {
      expect(light[key], `light.${key}`).toBeInstanceOf(Color);
      expect(dark[key], `dark.${key}`).toBeInstanceOf(Color);
    }
  });

  it("generates chart and sidebar colors", () => {
    const { light } = generateShadcnColors(createTestTheme());

    for (let i = 1; i <= 5; i++) {
      expect(light[`chart${i}` as keyof typeof light]).toBeInstanceOf(Color);
    }

    expect(light.sidebar).toBeInstanceOf(Color);
    expect(light.sidebarForeground).toBeInstanceOf(Color);
    expect(light.sidebarPrimary).toBeInstanceOf(Color);
    expect(light.sidebarAccent).toBeInstanceOf(Color);
  });

  it("light backgrounds are light, dark backgrounds are dark", () => {
    const { light, dark } = generateShadcnColors(createTestTheme());

    expect(light.background.hsl.l).toBeGreaterThan(70);
    expect(dark.background.hsl.l).toBeLessThan(20);
  });

  it("destructive color is in red/orange hue range", () => {
    const { light } = generateShadcnColors(createTestTheme());
    const hue = light.destructive.hsl.h;
    // Red hue range: 0-40 or 340-360
    expect(hue < 40 || hue > 340).toBe(true);
  });

  it("primary color matches theme primary", () => {
    const theme = createTestTheme();
    const { light } = generateShadcnColors(theme);
    const primaryBase = theme.palette.palettes[0]?.base;
    expect(light.primary.hex).toBe(primaryBase?.hex);
  });
});

describe("generateErrorColor", () => {
  it("falls back to orange when primary is red (~0°)", () => {
    // Primary at 5°: all red candidates are within 30°, so falls back to 25° (orange)
    const error = generateErrorColor(5);
    expect(error.hsl.h).toBe(25);
  });

  it("picks a red candidate when primary is far from red (~180°)", () => {
    const error = generateErrorColor(180);
    // All candidates are far from 180°; the algorithm picks the most distant
    expect([0, 10, 350]).toContain(error.hsl.h);
  });

  it("falls back to orange when primary is near 350°", () => {
    // Primary at 350°: candidate 10 is 20° away (max), which is < 30 → fallback
    const error = generateErrorColor(350);
    expect(error.hsl.h).toBe(25);
  });

  it("picks standard red when primary is distant enough", () => {
    // Primary at 120° (green): all red candidates are far enough (>30°)
    const error = generateErrorColor(120);
    expect([0, 10, 350]).toContain(error.hsl.h);
    // Should pick the most distant: 350 is 130° away from 120
    // 0 is 120° away, 10 is 110° away → picks 350
    expect(error.hsl.h).toBe(350);
  });
});

describe("generateShadcnCSS", () => {
  it("generates both :root and .dark blocks with OKLCH values", () => {
    const theme = createTestTheme();
    const css = generateShadcnCSS(theme);

    expect(css).toContain(":root {");
    expect(css).toContain(".dark {");
    expect(css).toMatch(/--background:\s*oklch\(/);
    expect(css).toMatch(/--primary:\s*oklch\(/);
  });

  it("uses provided radius value", () => {
    const css = generateShadcnCSS(createTestTheme(), "1.5rem");
    expect(css).toContain("--radius: 1.5rem");
  });

  it("uses default radius when not provided", () => {
    const css = generateShadcnCSS(createTestTheme());
    expect(css).toContain("--radius: 0.625rem");
  });
});
