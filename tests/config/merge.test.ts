import { describe, it, expect, afterEach } from "vitest";
import { resolveConfig, generateRandomColor } from "../../src/config/merge";
import { DEFAULT_CONFIG } from "../../src/config/types";
import { existsSync, unlinkSync, writeFileSync } from "fs";

describe("generateRandomColor", () => {
  it("returns a Color instance", () => {
    const color = generateRandomColor();
    expect(color.toHex()).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("generates vibrant colors (high saturation)", () => {
    for (let i = 0; i < 10; i++) {
      const color = generateRandomColor();
      expect(color.hsl.s).toBeGreaterThanOrEqual(70);
      expect(color.hsl.s).toBeLessThanOrEqual(100);
    }
  });

  it("generates colors with moderate lightness", () => {
    for (let i = 0; i < 10; i++) {
      const color = generateRandomColor();
      expect(color.hsl.l).toBeGreaterThanOrEqual(45);
      expect(color.hsl.l).toBeLessThanOrEqual(65);
    }
  });
});

describe("resolveConfig", () => {
  afterEach(() => {
    if (existsSync("autotheme.json")) {
      unlinkSync("autotheme.json");
    }
  });

  describe("defaults", () => {
    it("uses default values when no args provided", async () => {
      const config = await resolveConfig({});

      expect(config.harmony).toBe(DEFAULT_CONFIG.harmony);
      expect(config.output.path).toBe(DEFAULT_CONFIG.output.path);
      expect(config.output.preview).toBe(DEFAULT_CONFIG.output.preview);
      expect(config.output.tailwind).toBe(DEFAULT_CONFIG.output.tailwind);
      expect(config.output.darkModeScript).toBe(DEFAULT_CONFIG.output.darkModeScript);
      expect(config.typography.ratio).toBe(DEFAULT_CONFIG.typography.ratio);
      expect(config.palette.contrastTarget).toBe(DEFAULT_CONFIG.palette.contrastTarget);
    });

    it("generates random color when not provided", async () => {
      const config = await resolveConfig({});

      expect(config.color).toMatch(/^#[0-9a-f]{6}$/);
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
        darkModeScript: true,
        silent: true,
      });

      expect(config.color).toBe("#ff0000");
      expect(config.harmony).toBe("triadic");
      expect(config.output.path).toBe("./custom.css");
      expect(config.output.preview).toBe(true);
      expect(config.output.tailwind).toBe(true);
      expect(config.output.darkModeScript).toBe(true);
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
      expect(config.preset).toBeUndefined();
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
