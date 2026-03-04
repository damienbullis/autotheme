import { describe, it, expect } from "vitest";
import { generateStateTokens } from "../../src/generators/states";
import { Color } from "../../src/core/color";
import type { SemanticTokenSet } from "../../src/generators/semantic";
import type { StatesConfig } from "../../src/config/types";

function makeMinimalTokenSet(): SemanticTokenSet {
  return {
    surfaces: [{ name: "surface", value: new Color({ h: 250, s: 5, l: 96, a: 1 }) }],
    borders: [{ name: "border", value: new Color({ h: 250, s: 5, l: 80, a: 1 }) }],
    text: [{ name: "text-1", value: new Color({ h: 250, s: 5, l: 10, a: 1 }) }],
    accents: [
      { name: "accent", value: new Color({ h: 255, s: 100, l: 61, a: 1 }) },
      { name: "accent-secondary", value: new Color({ h: 195, s: 80, l: 55, a: 1 }) },
    ],
    tintedSurfaces: [],
  };
}

const defaultStatesConfig: StatesConfig = {
  hover: 0.04,
  active: -0.02,
  focus: { width: "2px", offset: "2px" },
  disabled: { opacity: 0.4 },
};

describe("generateStateTokens", () => {
  it("generates expected state tokens for accent, secondary, and surface", () => {
    const tokens = makeMinimalTokenSet();
    const states = generateStateTokens(tokens, defaultStatesConfig, "light");

    const names = states.map((t) => t.name);
    expect(names).toContain("accent-hover");
    expect(names).toContain("accent-active");
    expect(names).toContain("accent-disabled");
    expect(names).toContain("accent-secondary-hover");
    expect(names).toContain("accent-secondary-active");
    expect(names).toContain("accent-secondary-disabled");
    expect(names).toContain("surface-hover");
    expect(names).toContain("surface-active");
  });

  it("light mode: hover differs from base", () => {
    const tokens = makeMinimalTokenSet();
    const states = generateStateTokens(tokens, defaultStatesConfig, "light");

    const accentBase = tokens.accents[0]!.value;
    const hover = states.find((t) => t.name === "accent-hover")!;
    // In light mode with hover=0.04, the hover color should differ from base
    expect(hover.value.hsl.l).not.toBeCloseTo(accentBase.hsl.l, 1);
  });

  it("dark mode: hover differs from base", () => {
    const tokens = makeMinimalTokenSet();
    const states = generateStateTokens(tokens, defaultStatesConfig, "dark");

    const accentBase = tokens.accents[0]!.value;
    const hover = states.find((t) => t.name === "accent-hover")!;
    expect(hover.value.hsl.l).not.toBeCloseTo(accentBase.hsl.l, 1);
  });

  it("disabled has reduced alpha", () => {
    const tokens = makeMinimalTokenSet();
    const states = generateStateTokens(tokens, defaultStatesConfig, "light");

    const disabled = states.find((t) => t.name === "accent-disabled")!;
    expect(disabled.value.hsl.a).toBeCloseTo(0.4);
  });

  it("all state tokens produce valid OKLCH", () => {
    const tokens = makeMinimalTokenSet();
    const states = generateStateTokens(tokens, defaultStatesConfig, "light");

    for (const token of states) {
      expect(token.value.toOKLCH()).toMatch(/^oklch\(/);
    }
  });
});
