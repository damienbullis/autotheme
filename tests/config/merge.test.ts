import { describe, it, expect, afterEach } from "vitest";
import { resolveConfig, generateRandomColor, resolveFeature } from "../../src/config/merge";
import {
  DEFAULT_OUTPUT,
  DEFAULT_PALETTE,
  DEFAULT_SEMANTICS,
  DEFAULT_SPACING,
} from "../../src/config/types";
import { existsSync, unlinkSync, writeFileSync } from "fs";

describe("generateRandomColor", () => {
  it("returns a Color instance", () => {
    const color = generateRandomColor();
    expect(color.toHex()).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("generates vibrant colors (high OKLCH chroma)", () => {
    for (let i = 0; i < 10; i++) {
      const color = generateRandomColor();
      // Vibrant colors should have meaningful chroma (> 0.05 in OKLCH)
      expect(color.oklch.c).toBeGreaterThan(0.05);
    }
  });

  it("generates colors with moderate lightness (not too dark, not too light)", () => {
    for (let i = 0; i < 10; i++) {
      const color = generateRandomColor();
      // OKLCH L in [0, 1]; should be moderate -- not near-black and not near-white
      expect(color.oklch.l).toBeGreaterThan(0.2);
      expect(color.oklch.l).toBeLessThan(0.95);
    }
  });
});

describe("resolveFeature", () => {
  const DEFAULTS = { a: 1, b: 2 };

  it("returns defaults when enabled by default and input is undefined", () => {
    const result = resolveFeature(undefined, DEFAULTS, true);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("returns false when not enabled by default and input is undefined", () => {
    expect(resolveFeature(undefined, DEFAULTS, false)).toBe(false);
  });

  it("returns defaults when input is true", () => {
    const result = resolveFeature(true, DEFAULTS, false);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("returns false when input is false", () => {
    expect(resolveFeature(false, DEFAULTS, true)).toBe(false);
  });

  it("deep merges partial config with defaults", () => {
    const result = resolveFeature({ a: 99 }, DEFAULTS, false);
    expect(result).toEqual({ a: 99, b: 2 });
  });
});

describe("resolveConfig", () => {
  afterEach(() => {
    if (existsSync("autotheme.json")) {
      unlinkSync("autotheme.json");
    }
  });

  describe("defaults", () => {
    it("uses default output values when no args provided", async () => {
      const config = await resolveConfig({});

      expect(config.harmony).toBe("analogous");
      expect(config.output.path).toBe(DEFAULT_OUTPUT.path);
      expect(config.output.preview).toBe(DEFAULT_OUTPUT.preview);
      expect(config.output.tailwind).toBe(DEFAULT_OUTPUT.tailwind);
      expect(config.output.format).toBe("oklch");
    });

    it("generates random color when not provided", async () => {
      const config = await resolveConfig({});

      expect(config.color).toMatch(/^#[0-9a-f]{6}$/);
    });

    it("semantics is ON by default", async () => {
      const config = await resolveConfig({ color: "#ff0000" });

      expect(config.semantics).not.toBe(false);
    });

    it("palette is OFF by default", async () => {
      const config = await resolveConfig({ color: "#ff0000" });

      expect(config.palette).toBe(false);
    });

    it("most features are OFF by default", async () => {
      const config = await resolveConfig({ color: "#ff0000" });

      expect(config.states).toBe(false);
      expect(config.elevation).toBe(false);
      expect(config.typography).toBe(false);
      expect(config.spacing).toBe(false);
      expect(config.shadows).toBe(false);
      expect(config.radius).toBe(false);
      expect(config.shadcn).toBe(false);
      expect(config.gradients).toBe(false);
      expect(config.noise).toBe(false);
    });

    it("mode defaults to 'both'", async () => {
      const config = await resolveConfig({ color: "#ff0000" });

      expect(config.mode).toBe("both");
    });

    it("lightDark defaults to true when mode is 'both'", async () => {
      const config = await resolveConfig({ color: "#ff0000" });

      expect(config.output.lightDark).toBe(true);
    });

    it("lightDark defaults to false when mode is 'light'", async () => {
      const config = await resolveConfig({ color: "#ff0000", mode: "light" });

      expect(config.output.lightDark).toBe(false);
    });
  });

  describe("CLI args precedence", () => {
    it("CLI args override defaults", async () => {
      const config = await resolveConfig({
        color: "#ff0000",
        harmony: "triadic",
        output: "./custom.css",
        preview: true,
        tailwind: true,
        silent: true,
      });

      expect(config.color).toBe("#ff0000");
      expect(config.harmony).toBe("triadic");
      expect(config.output.path).toBe("./custom.css");
      expect(config.output.preview).toBe(true);
      expect(config.output.tailwind).toBe(true);
      expect(config.silent).toBe(true);
    });

    it("CLI args override config file", async () => {
      writeFileSync(
        "autotheme.json",
        JSON.stringify({
          color: "#00ff00",
          harmony: "analogous",
          output: { path: "./file.css" },
        }),
      );

      const config = await resolveConfig({
        color: "#ff0000",
        harmony: "triadic",
      });

      expect(config.color).toBe("#ff0000");
      expect(config.harmony).toBe("triadic");
      // Output path should come from file since not in CLI args
      expect(config.output.path).toBe("./file.css");
    });
  });

  describe("config file loading", () => {
    it("loads config from file", async () => {
      writeFileSync(
        "autotheme.json",
        JSON.stringify({
          color: "#0000ff",
          harmony: "complementary",
          output: { preview: true },
        }),
      );

      const config = await resolveConfig({});

      expect(config.color).toBe("#0000ff");
      expect(config.harmony).toBe("complementary");
      expect(config.output.preview).toBe(true);
    });

    it("uses explicit config path", async () => {
      const customPath = "./custom-config.json";
      writeFileSync(
        customPath,
        JSON.stringify({
          color: "invalid-color",
          harmony: "square",
        }),
      );

      try {
        await expect(resolveConfig({ config: customPath })).rejects.toThrow("Invalid color format");
      } finally {
        if (existsSync(customPath)) {
          unlinkSync(customPath);
        }
      }
    });
  });

  describe("presets", () => {
    it("applies preset color and harmony", async () => {
      const config = await resolveConfig({ preset: "ocean" });
      expect(config.color).toBe("#1E6091");
      expect(config.harmony).toBe("analogous");
    });

    it("CLI args override preset", async () => {
      const config = await resolveConfig({ preset: "ocean", color: "#FF0000" });
      expect(config.color).toBe("#FF0000");
      expect(config.harmony).toBe("analogous"); // from preset, not overridden
    });

    it("file config overrides preset", async () => {
      const configPath = "./preset-test-config.json";
      writeFileSync(configPath, JSON.stringify({ harmony: "triadic" }));
      try {
        const config = await resolveConfig({ preset: "ocean", config: configPath });
        expect(config.color).toBe("#1E6091"); // from preset
        expect(config.harmony).toBe("triadic"); // from file
      } finally {
        if (existsSync(configPath)) unlinkSync(configPath);
      }
    });

    it("throws for unknown preset", async () => {
      await expect(resolveConfig({ preset: "nonexistent" })).rejects.toThrow("Unknown preset");
    });

    it("strips preset from final config", async () => {
      const config = await resolveConfig({ preset: "ocean" });
      expect((config as Record<string, unknown>).preset).toBeUndefined();
    });
  });

  describe("deep merge", () => {
    it("preserves nested semantics defaults when merging partial semantics config", async () => {
      writeFileSync(
        "autotheme.json",
        JSON.stringify({
          color: "#ff0000",
          semantics: { depth: 0.5 },
        }),
      );

      const config = await resolveConfig({});

      // semantics should be enabled (object, not false)
      expect(config.semantics).not.toBe(false);
      if (config.semantics !== false) {
        // depth should be overridden from file
        expect(config.semantics.depth).toBe(0.5);
        // text defaults should be preserved (not wiped)
        expect(config.semantics.text.levels).toBe(DEFAULT_SEMANTICS.text.levels);
        expect(config.semantics.borders.chroma).toBe(DEFAULT_SEMANTICS.borders.chroma);
        expect(config.semantics.surfaces.chroma).toBe(DEFAULT_SEMANTICS.surfaces.chroma);
      }
    });

    it("preserves 3+ levels of nesting when merging palette config", async () => {
      writeFileSync(
        "autotheme.json",
        JSON.stringify({
          color: "#ff0000",
          palette: { alphaSteps: { bg: 20 } },
        }),
      );

      const config = await resolveConfig({});

      // palette should be enabled (object, not false) because config file provided object
      expect(config.palette).not.toBe(false);
      if (config.palette !== false) {
        // bg should be overridden
        expect(config.palette.alphaSteps.bg).toBe(20);
        // Other alpha steps should be preserved from defaults
        expect(config.palette.alphaSteps.border).toBe(DEFAULT_PALETTE.alphaSteps.border);
        expect(config.palette.alphaSteps.glow).toBe(DEFAULT_PALETTE.alphaSteps.glow);
        expect(config.palette.alphaSteps.hover).toBe(DEFAULT_PALETTE.alphaSteps.hover);
      }
    });
  });

  describe("auto-enable semantics", () => {
    it("enables semantics when shadcn is enabled", async () => {
      const config = await resolveConfig({ color: "#ff0000", shadcn: true });

      // shadcn should be resolved to a config object (not false)
      expect(config.shadcn).not.toBe(false);
      // semantics should also be a config object (auto-enabled by shadcn)
      expect(config.semantics).not.toBe(false);
    });

    it("does not disable explicitly enabled semantics when shadcn is off", async () => {
      const config = await resolveConfig({ color: "#ff0000", semantics: true });

      // shadcn is off by default
      expect(config.shadcn).toBe(false);
      // semantics should be enabled (resolved to config object)
      expect(config.semantics).not.toBe(false);
    });

    it("semantics can be explicitly disabled", async () => {
      const config = await resolveConfig({ color: "#ff0000", semantics: false });

      expect(config.semantics).toBe(false);
    });
  });

  describe("tailwind auto-enables palette", () => {
    it("palette is enabled when tailwind is true", async () => {
      const config = await resolveConfig({ color: "#ff0000", tailwind: true });

      expect(config.output.tailwind).toBe(true);
      expect(config.palette).not.toBe(false);
    });

    it("palette stays off when tailwind is false", async () => {
      const config = await resolveConfig({ color: "#ff0000" });

      expect(config.output.tailwind).toBe(false);
      expect(config.palette).toBe(false);
    });
  });

  describe("presets with deep config", () => {
    it("resolves dashboard-dark preset with full config", async () => {
      const config = await resolveConfig({ preset: "dashboard-dark" });

      expect(config.color).toBe("#6366F1");
      expect(config.mode).toBe("dark");
      // semantics is ON by default, and also auto-enabled via shadcn
      expect(config.semantics).not.toBe(false);
      // shadcn should be resolved with custom radius
      expect(config.shadcn).not.toBe(false);
      if (config.shadcn !== false) {
        expect(config.shadcn.radius).toBe("0.5rem");
      }
      // spacing is explicitly enabled in preset
      expect(config.spacing).not.toBe(false);
      if (config.spacing !== false) {
        expect(config.spacing.base).toBe(DEFAULT_SPACING.base);
      }
    });

    it("applies mode-dependent defaults for dark mode preset", async () => {
      const config = await resolveConfig({ preset: "dashboard-dark" });

      if (config.semantics !== false) {
        // Dark mode: depth should default to 0.13
        expect(config.semantics.depth).toBe(0.13);
        // Dark mode: text.anchor should default to 0.95
        expect(config.semantics.text.anchor).toBe(0.95);
        // text.floor should be 0.55
        expect(config.semantics.text.floor).toBe(0.55);
      }
    });

    it("applies mode-dependent defaults for light mode", async () => {
      const config = await resolveConfig({ color: "#ff0000", mode: "light" });

      if (config.semantics !== false) {
        // Light mode: depth should default to 0.97
        expect(config.semantics.depth).toBe(0.97);
        // Light mode: text.anchor should default to 0.15
        expect(config.semantics.text.anchor).toBe(0.15);
      }
    });
  });

  describe("merge order", () => {
    const mergeTestConfig = "./merge-test-autotheme.json";

    afterEach(() => {
      if (existsSync(mergeTestConfig)) {
        unlinkSync(mergeTestConfig);
      }
    });

    it("merges in correct order: defaults < file < CLI", async () => {
      writeFileSync(
        mergeTestConfig,
        JSON.stringify({
          harmony: "square",
          output: { path: "./from-file.css", preview: true },
        }),
      );

      const config = await resolveConfig({
        harmony: "triadic",
        config: mergeTestConfig,
      });

      // harmony from CLI (overrides file)
      expect(config.harmony).toBe("triadic");
      // output.path from file (overrides default)
      expect(config.output.path).toBe("./from-file.css");
      // output.preview from file (overrides default false)
      expect(config.output.preview).toBe(true);
      // output.tailwind from default (not in file or CLI)
      expect(config.output.tailwind).toBe(false);
    });
  });
});
