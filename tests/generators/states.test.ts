import { describe, it, expect } from "vitest";
import { generateStateTokens } from "../../src/generators/states";
import type { StatesConfig } from "../../src/config/types";

const defaultConfig: StatesConfig = {
  hover: 0.04,
  active: -0.02,
  focus: { width: "2px", offset: "2px" },
  disabled: { opacity: 0.4 },
};

describe("generateStateTokens", () => {
  it("generates exactly 6 tokens", () => {
    const tokens = generateStateTokens(defaultConfig, "light");
    expect(tokens).toHaveLength(6);
  });

  it("all tokens use rawCSS", () => {
    const tokens = generateStateTokens(defaultConfig, "light");
    for (const token of tokens) {
      expect(token.rawCSS).toBeDefined();
    }
  });

  it("token count is constant regardless of palette size", () => {
    const light = generateStateTokens(defaultConfig, "light");
    const dark = generateStateTokens(defaultConfig, "dark");
    expect(light).toHaveLength(6);
    expect(dark).toHaveLength(6);
  });

  it("dark mode: hover delta is positive (lighten)", () => {
    const tokens = generateStateTokens(defaultConfig, "dark");
    const hover = tokens.find((t) => t.name === "state-hover")!;
    expect(Number(hover.rawCSS)).toBeGreaterThan(0);
  });

  it("light mode: hover delta is negative (darken)", () => {
    const tokens = generateStateTokens(defaultConfig, "light");
    const hover = tokens.find((t) => t.name === "state-hover")!;
    expect(Number(hover.rawCSS)).toBeLessThan(0);
  });

  it("hover magnitude matches config", () => {
    const tokens = generateStateTokens(defaultConfig, "dark");
    const hover = tokens.find((t) => t.name === "state-hover")!;
    expect(Math.abs(Number(hover.rawCSS))).toBeCloseTo(defaultConfig.hover);
  });

  it("active delta matches config as-is", () => {
    const light = generateStateTokens(defaultConfig, "light");
    const dark = generateStateTokens(defaultConfig, "dark");
    const lightActive = light.find((t) => t.name === "state-active")!;
    const darkActive = dark.find((t) => t.name === "state-active")!;
    // Active doesn't flip sign by mode
    expect(Number(lightActive.rawCSS)).toBe(defaultConfig.active);
    expect(Number(darkActive.rawCSS)).toBe(defaultConfig.active);
  });

  it("disabled opacity from config", () => {
    const tokens = generateStateTokens(defaultConfig, "light");
    const disabled = tokens.find((t) => t.name === "state-disabled-opacity")!;
    expect(Number(disabled.rawCSS)).toBe(0.4);
  });

  it("focus ring defaults to var(--accent)", () => {
    const tokens = generateStateTokens(defaultConfig, "light");
    const focusColor = tokens.find((t) => t.name === "focus-ring-color")!;
    expect(focusColor.rawCSS).toBe("var(--accent)");
  });

  it("focus ring respects custom color", () => {
    const custom: StatesConfig = {
      ...defaultConfig,
      focus: { color: "oklch(0.7 0.15 250)", width: "3px", offset: "4px" },
    };
    const tokens = generateStateTokens(custom, "light");
    const focusColor = tokens.find((t) => t.name === "focus-ring-color")!;
    expect(focusColor.rawCSS).toBe("oklch(0.7 0.15 250)");
  });

  it("custom config values propagate correctly", () => {
    const custom: StatesConfig = {
      hover: 0.08,
      active: -0.04,
      focus: { width: "3px", offset: "4px" },
      disabled: { opacity: 0.3 },
    };
    const tokens = generateStateTokens(custom, "dark");
    expect(Number(tokens.find((t) => t.name === "state-hover")!.rawCSS)).toBeCloseTo(0.08);
    expect(Number(tokens.find((t) => t.name === "state-active")!.rawCSS)).toBeCloseTo(-0.04);
    expect(Number(tokens.find((t) => t.name === "state-disabled-opacity")!.rawCSS)).toBe(0.3);
    expect(tokens.find((t) => t.name === "focus-ring-width")!.rawCSS).toBe("3px");
    expect(tokens.find((t) => t.name === "focus-ring-offset")!.rawCSS).toBe("4px");
  });
});
