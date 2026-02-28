import { describe, it, expect, afterEach } from "vitest";
import { loadConfig } from "../../src/config/loader";
import { existsSync, unlinkSync, writeFileSync } from "fs";

describe("loadConfig", () => {
  const testConfigPath = "./test-autotheme.json";

  afterEach(() => {
    // Clean up test files
    if (existsSync(testConfigPath)) {
      unlinkSync(testConfigPath);
    }
    if (existsSync("autotheme.json")) {
      unlinkSync("autotheme.json");
    }
    if (existsSync(".autothemerc.json")) {
      unlinkSync(".autothemerc.json");
    }
    if (existsSync(".autothemerc")) {
      unlinkSync(".autothemerc");
    }
  });

  describe("explicit path", () => {
    it("loads config from explicit path", async () => {
      writeFileSync(testConfigPath, JSON.stringify({ color: "#ff0000" }));

      const config = await loadConfig(testConfigPath);
      expect(config.color).toBe("#ff0000");
    });

    it("throws if explicit path does not exist", async () => {
      await expect(loadConfig("./nonexistent.json")).rejects.toThrow("Config file not found");
    });

    it("throws for invalid JSON", async () => {
      writeFileSync(testConfigPath, "{ invalid json }");

      await expect(loadConfig(testConfigPath)).rejects.toThrow("Invalid JSON");
    });
  });

  describe("auto-discovery", () => {
    it("returns empty config if no files found", async () => {
      const config = await loadConfig();
      expect(config).toEqual({});
    });

    it("discovers autotheme.json", async () => {
      writeFileSync("autotheme.json", JSON.stringify({ harmony: "triadic" }));

      const config = await loadConfig();
      expect(config.harmony).toBe("triadic");
    });

    it("discovers .autothemerc.json", async () => {
      writeFileSync(".autothemerc.json", JSON.stringify({ preview: true }));

      const config = await loadConfig();
      expect(config.preview).toBe(true);
    });

    it("discovers .autothemerc", async () => {
      writeFileSync(".autothemerc", JSON.stringify({ tailwind: true }));

      const config = await loadConfig();
      expect(config.tailwind).toBe(true);
    });

    it("prefers autotheme.json over other files", async () => {
      writeFileSync("autotheme.json", JSON.stringify({ color: "#111111" }));
      writeFileSync(".autothemerc.json", JSON.stringify({ color: "#222222" }));

      const config = await loadConfig();
      expect(config.color).toBe("#111111");
    });
  });

  describe("validation", () => {
    it("validates config after loading", async () => {
      writeFileSync(testConfigPath, JSON.stringify({ harmony: "invalid" }));

      await expect(loadConfig(testConfigPath)).rejects.toThrow("Invalid harmony");
    });

    it("validates color format", async () => {
      writeFileSync(testConfigPath, JSON.stringify({ color: "not-a-color" }));

      await expect(loadConfig(testConfigPath)).rejects.toThrow("Invalid color format");
    });
  });
});
