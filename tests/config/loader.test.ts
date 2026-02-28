import { describe, it, expect, afterEach, vi } from "vitest";
import { loadConfig, isUrl } from "../../src/config/loader";
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

    it("does not discover .autothemerc.json or .autothemerc", async () => {
      // Only autotheme.json is supported
      const config = await loadConfig();
      expect(config).toEqual({});
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

describe("isUrl", () => {
  it("returns true for http URLs", () => {
    expect(isUrl("http://example.com/config.json")).toBe(true);
  });

  it("returns true for https URLs", () => {
    expect(isUrl("https://example.com/config.json")).toBe(true);
  });

  it("returns false for file paths", () => {
    expect(isUrl("./config.json")).toBe(false);
    expect(isUrl("/absolute/path.json")).toBe(false);
    expect(isUrl("autotheme.json")).toBe(false);
  });
});

describe("loadConfig with URL", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches and validates config from URL", async () => {
    const mockConfig = { color: "#FF0000", harmony: "triadic" };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockConfig), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const config = await loadConfig("https://example.com/config.json");
    expect(config.color).toBe("#FF0000");
    expect(config.harmony).toBe("triadic");
  });

  it("throws on HTTP error", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("Not Found", { status: 404 }),
    );

    await expect(loadConfig("https://example.com/config.json")).rejects.toThrow("HTTP 404");
  });

  it("throws on invalid JSON from URL", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("not json", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    );

    await expect(loadConfig("https://example.com/config.json")).rejects.toThrow("Invalid JSON");
  });

  it("throws on network error", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("fetch failed"));

    await expect(loadConfig("https://example.com/config.json")).rejects.toThrow(
      "Failed to fetch config from URL",
    );
  });

  it("throws on timeout", async () => {
    const timeoutError = new DOMException("The operation was aborted", "TimeoutError");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(timeoutError);

    await expect(loadConfig("https://example.com/config.json")).rejects.toThrow(
      "timed out after 10 seconds",
    );
  });

  it("accepts text/plain content type (GitHub raw)", async () => {
    const mockConfig = { color: "#00FF00" };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockConfig), {
        status: 200,
        headers: { "content-type": "text/plain; charset=utf-8" },
      }),
    );

    const config = await loadConfig("https://raw.githubusercontent.com/user/repo/config.json");
    expect(config.color).toBe("#00FF00");
  });
});
