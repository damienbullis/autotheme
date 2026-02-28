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
    // Generate multiple colors and check saturation
    for (let i = 0; i < 10; i++) {
      const color = generateRandomColor();
      expect(color.hsl.s).toBeGreaterThanOrEqual(70);
      expect(color.hsl.s).toBeLessThanOrEqual(100);
    }
  });

  it("generates colors with moderate lightness", () => {
    // Generate multiple colors and check lightness
    for (let i = 0; i < 10; i++) {
      const color = generateRandomColor();
      expect(color.hsl.l).toBeGreaterThanOrEqual(45);
      expect(color.hsl.l).toBeLessThanOrEqual(65);
    }
  });
});

describe("resolveConfig", () => {
  afterEach(() => {
    // Clean up test files
    if (existsSync("autotheme.json")) {
      unlinkSync("autotheme.json");
    }
  });

  describe("defaults", () => {
    it("uses default values when no args provided", async () => {
      const config = await resolveConfig({});

      expect(config.harmony).toBe(DEFAULT_CONFIG.harmony);
      expect(config.output).toBe(DEFAULT_CONFIG.output);
      expect(config.preview).toBe(DEFAULT_CONFIG.preview);
      expect(config.tailwind).toBe(DEFAULT_CONFIG.tailwind);
      expect(config.darkModeScript).toBe(DEFAULT_CONFIG.darkModeScript);
      expect(config.scalar).toBe(DEFAULT_CONFIG.scalar);
      expect(config.contrastTarget).toBe(DEFAULT_CONFIG.contrastTarget);
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
      expect(config.output).toBe("./custom.css");
      expect(config.preview).toBe(true);
      expect(config.tailwind).toBe(true);
      expect(config.darkModeScript).toBe(true);
      expect(config.silent).toBe(true);
    });

    it("CLI args override config file", async () => {
      writeFileSync(
        "autotheme.json",
        JSON.stringify({
          color: "#00ff00",
          harmony: "analogous",
          output: "./file.css",
        }),
      );

      const config = await resolveConfig({
        color: "#ff0000",
        harmony: "triadic",
      });

      expect(config.color).toBe("#ff0000");
      expect(config.harmony).toBe("triadic");
      // Output should come from file since not in CLI args
      expect(config.output).toBe("./file.css");
    });
  });

  describe("config file loading", () => {
    it("loads config from file", async () => {
      writeFileSync(
        "autotheme.json",
        JSON.stringify({
          color: "#0000ff",
          harmony: "complementary",
          preview: true,
        }),
      );

      const config = await resolveConfig({});

      expect(config.color).toBe("#0000ff");
      expect(config.harmony).toBe("complementary");
      expect(config.preview).toBe(true);
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
        // This should fail because "invalid-color" is not a valid color format
        await expect(resolveConfig({ config: customPath })).rejects.toThrow("Invalid color format");
      } finally {
        if (existsSync(customPath)) {
          unlinkSync(customPath);
        }
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
          output: "./from-file.css",
          preview: true,
        }),
      );

      const config = await resolveConfig({
        harmony: "triadic",
        config: mergeTestConfig,
      });

      // harmony from CLI (overrides file)
      expect(config.harmony).toBe("triadic");
      // output from file (overrides default)
      expect(config.output).toBe("./from-file.css");
      // preview from file (overrides default false)
      expect(config.preview).toBe(true);
      // tailwind from default (not in file or CLI)
      expect(config.tailwind).toBe(false);
    });
  });
});
