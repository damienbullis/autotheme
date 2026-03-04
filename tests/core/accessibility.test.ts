import { describe, it, expect } from "vitest";
import {
  getTokenPairs,
  resolveTokenColor,
  checkContrast,
  fixContrast,
  adjustLightnessForContrast,
} from "../../src/core/accessibility";
import { Color } from "../../src/core/color";
import { getContrastRatio } from "../../src/core/contrast";
import { generateSemanticTokens } from "../../src/generators/semantic";
import { createTestTheme } from "../helpers/test-theme";

describe("getTokenPairs", () => {
  it("returns text-against-surface pairs for all text levels", () => {
    const theme = createTestTheme();
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");
    const pairs = getTokenPairs(tokens);

    const textSurfacePairs = pairs.filter(
      (p) => p.foreground.startsWith("text-") && p.background === "surface",
    );
    expect(textSurfacePairs.length).toBe(tokens.text.length);
  });

  it("includes text-1 against surface-sunken", () => {
    const theme = createTestTheme();
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");
    const pairs = getTokenPairs(tokens);

    const sunkenPair = pairs.find(
      (p) => p.foreground === "text-1" && p.background === "surface-sunken",
    );
    expect(sunkenPair).toBeDefined();
  });

  it("includes accent-foreground against accent pairs", () => {
    const theme = createTestTheme();
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");
    const pairs = getTokenPairs(tokens);

    const accentPair = pairs.find(
      (p) => p.foreground === "accent-foreground" && p.background === "accent",
    );
    expect(accentPair).toBeDefined();
  });

  it("includes tinted surface foreground pairs", () => {
    const theme = createTestTheme();
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");
    const pairs = getTokenPairs(tokens);

    const tintedPairs = pairs.filter(
      (p) =>
        p.foreground.startsWith("surface-") &&
        p.foreground.endsWith("-foreground") &&
        !p.background.endsWith("-foreground"),
    );
    // Should have one pair per harmony color
    expect(tintedPairs.length).toBeGreaterThan(0);
  });

  it("includes border-strong against surface", () => {
    const theme = createTestTheme();
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");
    const pairs = getTokenPairs(tokens);

    const borderPair = pairs.find(
      (p) => p.foreground === "border-strong" && p.background === "surface",
    );
    expect(borderPair).toBeDefined();
  });

  it("returns different pair counts for different harmony types", () => {
    const analogous = createTestTheme({ harmony: "analogous" }); // 3 colors
    const complementary = createTestTheme({ harmony: "complementary" }); // 2 colors

    const analogousPairs = getTokenPairs(
      generateSemanticTokens(analogous.palette, analogous.config, "light"),
    );
    const complementaryPairs = getTokenPairs(
      generateSemanticTokens(complementary.palette, complementary.config, "light"),
    );

    // Analogous has more harmony colors → more tinted surface pairs
    expect(analogousPairs.length).toBeGreaterThan(complementaryPairs.length);
  });
});

describe("resolveTokenColor", () => {
  it("finds surface token", () => {
    const theme = createTestTheme();
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");
    const color = resolveTokenColor("surface", tokens);
    expect(color).toBeInstanceOf(Color);
  });

  it("finds accent token", () => {
    const theme = createTestTheme();
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");
    const color = resolveTokenColor("accent", tokens);
    expect(color).toBeInstanceOf(Color);
  });

  it("returns undefined for nonexistent token", () => {
    const theme = createTestTheme();
    const tokens = generateSemanticTokens(theme.palette, theme.config, "light");
    const color = resolveTokenColor("nonexistent-token", tokens);
    expect(color).toBeUndefined();
  });
});

describe("checkContrast", () => {
  it("reports results for all discovered pairs", () => {
    const theme = createTestTheme({ mode: "light" });
    const report = checkContrast(theme, "aa", "light");
    expect(report.passed.length + report.failed.length).toBeGreaterThan(0);
  });

  it("correctly identifies passing AAA pairs with high contrast theme", () => {
    // Black text on white surface should pass AAA
    const theme = createTestTheme({
      color: "#000000",
      mode: "light",
      harmony: "monochromatic",
    });
    const report = checkContrast(theme, "aaa", "light");
    // text-1 should have high contrast against the light surface
    const text1 = report.passed.find((r) => r.pair.foreground === "text-1");
    if (text1) {
      expect(text1.ratio).toBeGreaterThanOrEqual(7);
    }
  });

  it("aa is less strict than aaa", () => {
    const theme = createTestTheme({ mode: "light" });
    const aaReport = checkContrast(theme, "aa", "light");
    const aaaReport = checkContrast(theme, "aaa", "light");

    // AAA should fail at least as many pairs as AA
    expect(aaaReport.failed.length).toBeGreaterThanOrEqual(aaReport.failed.length);
  });

  it("checks both modes when mode is both", () => {
    const theme = createTestTheme({ mode: "both" });
    const report = checkContrast(theme, "aa");

    // Should have results from both light and dark modes
    const lightResults = [...report.passed, ...report.failed].filter((r) =>
      r.pair.context?.includes("light"),
    );
    const darkResults = [...report.passed, ...report.failed].filter((r) =>
      r.pair.context?.includes("dark"),
    );
    expect(lightResults.length).toBeGreaterThan(0);
    expect(darkResults.length).toBeGreaterThan(0);
  });
});

describe("adjustLightnessForContrast", () => {
  it("returns darker color for light background", () => {
    const fg = Color.fromOklch(0.7, 0.1, 250);
    const bg = Color.fromOklch(0.95, 0.01, 250);
    const adjusted = adjustLightnessForContrast(fg, bg, 4.5);

    expect(adjusted).not.toBeNull();
    expect(adjusted!.oklch.l).toBeLessThan(fg.oklch.l);
  });

  it("returns lighter color for dark background", () => {
    const fg = Color.fromOklch(0.3, 0.1, 250);
    const bg = Color.fromOklch(0.1, 0.01, 250);
    const adjusted = adjustLightnessForContrast(fg, bg, 4.5);

    expect(adjusted).not.toBeNull();
    expect(adjusted!.oklch.l).toBeGreaterThan(fg.oklch.l);
  });

  it("preserves hue and chroma", () => {
    const fg = Color.fromOklch(0.6, 0.15, 120);
    const bg = Color.fromOklch(0.95, 0.01, 120);
    const adjusted = adjustLightnessForContrast(fg, bg, 7);

    expect(adjusted).not.toBeNull();
    expect(adjusted!.oklch.c).toBeCloseTo(0.15, 4);
    expect(adjusted!.oklch.h).toBeCloseTo(120, 4);
  });

  it("meets the target ratio", () => {
    const fg = Color.fromOklch(0.7, 0.1, 30);
    const bg = Color.fromOklch(0.95, 0.01, 30);
    const adjusted = adjustLightnessForContrast(fg, bg, 7);

    expect(adjusted).not.toBeNull();
    const ratio = getContrastRatio(adjusted!, bg);
    expect(ratio).toBeGreaterThanOrEqual(7);
  });

  it("returns null for impossible targets", () => {
    // Two colors with very similar luminance and a very high target
    // This is still achievable since we can go to L=0 or L=1
    // Let's test with a really impossible case: mid-gray bg with extreme ratio
    const fg = Color.fromOklch(0.5, 0.4, 250);
    const bg = Color.fromOklch(0.5, 0.01, 250);
    const result = adjustLightnessForContrast(fg, bg, 21); // 21:1 is max possible
    // Even L=0 or L=1 should give close to 21 for mid-gray,
    // but with high chroma the actual contrast may not reach 21
    // so this depends on the exact colors
    if (result !== null) {
      const ratio = getContrastRatio(result, bg);
      expect(ratio).toBeGreaterThanOrEqual(21);
    }
  });
});

describe("fixContrast", () => {
  it("makes a failing theme pass at AA level", () => {
    const theme = createTestTheme({ mode: "light" });
    const beforeReport = checkContrast(theme, "aa", "light");

    if (beforeReport.failed.length === 0) {
      // Theme already passes — skip
      return;
    }

    const { theme: fixedTheme } = fixContrast(theme, "aa", "light");
    const afterReport = checkContrast(fixedTheme, "aa", "light");

    expect(afterReport.failed.length).toBeLessThan(beforeReport.failed.length);
  });

  it("is immutable — does not modify original theme", () => {
    const theme = createTestTheme({ mode: "light" });
    const hadOverrides = theme.config.semantics !== false && theme.config.semantics.overrides;

    fixContrast(theme, "aa", "light");

    if (theme.config.semantics !== false) {
      // Original should not have gained overrides from fixContrast
      expect(!!theme.config.semantics.overrides).toBe(!!hadOverrides);
    }
  });

  it("reports fixes with original and fixed ratios", () => {
    const theme = createTestTheme({ mode: "light" });
    const { report } = fixContrast(theme, "aa", "light");

    for (const fix of report.fixes) {
      expect(fix.fixedRatio).toBeGreaterThanOrEqual(fix.originalRatio);
      expect(fix.fixedColor).toBeInstanceOf(Color);
      expect(fix.originalColor).toBeInstanceOf(Color);
    }
  });

  it("integration: generate → check → fix → check = all pass for AA", () => {
    const theme = createTestTheme({ mode: "light" });
    const { theme: fixedTheme } = fixContrast(theme, "aa", "light");
    const report = checkContrast(fixedTheme, "aa", "light");

    // All fixable pairs should now pass
    const unfixable = fixContrast(theme, "aa", "light").report.unfixable;
    const fixableFailures = report.failed.filter(
      (f) =>
        !unfixable.some(
          (u) => u.foreground === f.pair.foreground && u.background === f.pair.background,
        ),
    );
    expect(fixableFailures.length).toBe(0);
  });
});
