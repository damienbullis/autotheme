import { describe, it, expect } from "vitest";
import { generateStateTokens } from "../../src/generators/states";
import { generateSemanticCSS } from "../../src/generators/semantic";
import { Color } from "../../src/core/color";
import type { SemanticTokenSet } from "../../src/generators/semantic";
import type { StatesConfig } from "../../src/config/types";
import { createTestTheme } from "../helpers/test-theme";

function makeMinimalTokenSet(): SemanticTokenSet {
  return {
    surfaces: [{ name: "surface", value: new Color({ h: 250, s: 5, l: 96, a: 1 }) }],
    borders: [{ name: "border", value: new Color({ h: 250, s: 5, l: 80, a: 1 }) }],
    text: [{ name: "text-1", value: new Color({ h: 250, s: 5, l: 10, a: 1 }) }],
    accents: [
      { name: "accent", value: new Color({ h: 255, s: 100, l: 61, a: 1 }) },
      { name: "accent-secondary", value: new Color({ h: 195, s: 80, l: 55, a: 1 }) },
    ],
  };
}

const defaultStatesConfig: StatesConfig = {
  enabled: true,
  hoverShift: 5,
  activeShift: 10,
  focusRingAlpha: 50,
  disabledAlpha: 40,
  disabledDesat: 60,
};

describe("generateStateTokens", () => {
  it("generates all expected state tokens", () => {
    const tokens = makeMinimalTokenSet();
    const states = generateStateTokens(tokens, defaultStatesConfig, "light");

    const names = states.map((t) => t.name);
    expect(names).toContain("accent-hover");
    expect(names).toContain("accent-active");
    expect(names).toContain("accent-focus-ring");
    expect(names).toContain("accent-disabled");
    expect(names).toContain("accent-secondary-hover");
    expect(names).toContain("accent-secondary-active");
    expect(names).toContain("accent-secondary-disabled");
    expect(names).toContain("surface-hover");
    expect(names).toContain("surface-active");
  });

  it("light mode: hover is darker than base", () => {
    const tokens = makeMinimalTokenSet();
    const states = generateStateTokens(tokens, defaultStatesConfig, "light");

    const accentBase = tokens.accents[0]!.value;
    const hover = states.find((t) => t.name === "accent-hover")!;
    expect(hover.value.hsl.l).toBeLessThan(accentBase.hsl.l);
  });

  it("dark mode: hover is lighter than base", () => {
    const tokens = makeMinimalTokenSet();
    const states = generateStateTokens(tokens, defaultStatesConfig, "dark");

    const accentBase = tokens.accents[0]!.value;
    const hover = states.find((t) => t.name === "accent-hover")!;
    expect(hover.value.hsl.l).toBeGreaterThan(accentBase.hsl.l);
  });

  it("active shift is stronger than hover shift", () => {
    const tokens = makeMinimalTokenSet();
    const states = generateStateTokens(tokens, defaultStatesConfig, "light");

    const base = tokens.accents[0]!.value.hsl.l;
    const hover = states.find((t) => t.name === "accent-hover")!.value.hsl.l;
    const active = states.find((t) => t.name === "accent-active")!.value.hsl.l;

    // Both darker than base in light mode; active is further from base
    expect(Math.abs(base - active)).toBeGreaterThan(Math.abs(base - hover));
  });

  it("disabled has reduced alpha and saturation", () => {
    const tokens = makeMinimalTokenSet();
    const states = generateStateTokens(tokens, defaultStatesConfig, "light");

    const disabled = states.find((t) => t.name === "accent-disabled")!;
    expect(disabled.value.hsl.a).toBeCloseTo(0.4);
    expect(disabled.value.hsl.s).toBeLessThan(tokens.accents[0]!.value.hsl.s);
  });

  it("focus ring has correct alpha", () => {
    const tokens = makeMinimalTokenSet();
    const states = generateStateTokens(tokens, defaultStatesConfig, "light");

    const focusRing = states.find((t) => t.name === "accent-focus-ring")!;
    expect(focusRing.value.hsl.a).toBeCloseTo(0.5);
  });

  it("all state tokens produce valid OKLCH", () => {
    const tokens = makeMinimalTokenSet();
    const states = generateStateTokens(tokens, defaultStatesConfig, "light");

    for (const token of states) {
      expect(token.value.toOKLCH()).toMatch(/^oklch\(/);
    }
  });
});

describe("states in semantic CSS output", () => {
  it("states.enabled: false produces no state tokens", () => {
    const theme = createTestTheme({
      semantics: { enabled: true, states: { enabled: false } },
    });
    const result = generateSemanticCSS(theme);

    expect(result).not.toContain("accent-hover");
    expect(result).not.toContain("States");
  });

  it("states.enabled: true produces state tokens in output", () => {
    const theme = createTestTheme({
      semantics: { enabled: true, states: { enabled: true } },
    });
    const result = generateSemanticCSS(theme);

    expect(result).toContain("/* States */");
    expect(result).toContain("--accent-hover:");
    expect(result).toContain("--accent-active:");
    expect(result).toContain("--accent-focus-ring:");
    expect(result).toContain("--accent-disabled:");
    expect(result).toContain("--surface-hover:");
    expect(result).toContain("--surface-active:");
  });
});
