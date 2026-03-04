import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { FRAMEWORK_DEFAULTS, type FrameworkType } from "../../src/cli/init";
import { resolveToConfig } from "../../src/config/merge";
import type { AutoThemeConfig, DeepPartial } from "../../src/config/types";

// Mock fs/promises and prompts for runInit tests
vi.mock("fs/promises", () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

describe("FRAMEWORK_DEFAULTS", () => {
  const frameworks: FrameworkType[] = ["nextjs", "astro", "nuxt", "sveltekit", "vanilla"];

  it.each(frameworks)("%s defaults produce a valid resolved config", (framework) => {
    const defaults = FRAMEWORK_DEFAULTS[framework];
    const userConfig: DeepPartial<AutoThemeConfig> = {
      color: "#6439FF",
      harmony: "analogous",
      mode: "both",
      output: defaults.output,
    };

    if (defaults.shadcn) {
      userConfig.shadcn = true;
    }

    const resolved = resolveToConfig(userConfig);

    expect(resolved.color).toBe("#6439FF");
    expect(resolved.harmony).toBe("analogous");
    expect(resolved.mode).toBe("both");
    expect(resolved.output.path).toBe(defaults.output.path);
  });

  it("nextjs defaults include shadcn: true", () => {
    expect(FRAMEWORK_DEFAULTS.nextjs.shadcn).toBe(true);
  });

  it("nextjs defaults produce resolved config with shadcn enabled", () => {
    const defaults = FRAMEWORK_DEFAULTS.nextjs;
    const resolved = resolveToConfig({
      color: "#6439FF",
      harmony: "analogous",
      shadcn: defaults.shadcn,
      output: defaults.output,
    });

    expect(resolved.shadcn).not.toBe(false);
    expect(resolved.output.tailwind).toBe(true);
  });

  it("vanilla defaults do not include tailwind", () => {
    expect(FRAMEWORK_DEFAULTS.vanilla.output.tailwind).toBeUndefined();
  });

  it("vanilla defaults resolve with tailwind disabled", () => {
    const defaults = FRAMEWORK_DEFAULTS.vanilla;
    const resolved = resolveToConfig({
      color: "#6439FF",
      harmony: "analogous",
      output: defaults.output,
    });

    expect(resolved.output.tailwind).toBe(false);
  });

  it("all non-vanilla frameworks default to tailwind: true", () => {
    const withTailwind: FrameworkType[] = ["nextjs", "astro", "nuxt", "sveltekit"];
    for (const fw of withTailwind) {
      expect(FRAMEWORK_DEFAULTS[fw].output.tailwind).toBe(true);
    }
  });

  it("all framework output paths are distinct", () => {
    const paths = frameworks.map((fw) => FRAMEWORK_DEFAULTS[fw].output.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});

describe("runInit", () => {
  let writeFileMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const fs = await import("fs/promises");
    writeFileMock = fs.writeFile as unknown as ReturnType<typeof vi.fn>;
    writeFileMock.mockClear();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("-y flag writes vanilla defaults", async () => {
    const { runInit } = await import("../../src/cli/init");
    await runInit({ skipPrompts: true });

    expect(writeFileMock).toHaveBeenCalledOnce();
    const [path, content] = writeFileMock.mock.calls[0];
    expect(path).toBe("autotheme.json");

    const parsed = JSON.parse(content);
    expect(parsed.$schema).toBe("./node_modules/autotheme/schema.json");
    expect(parsed.color).toBe("#6439FF");
    expect(parsed.harmony).toBe("analogous");
    expect(parsed.mode).toBe("both");
    expect(parsed.output.path).toBe("./autotheme.css");
    expect(parsed.shadcn).toBeUndefined();
  });

  it("-y with --framework nextjs writes nextjs defaults", async () => {
    const { runInit } = await import("../../src/cli/init");
    await runInit({ skipPrompts: true, framework: "nextjs" });

    expect(writeFileMock).toHaveBeenCalledOnce();
    const [, content] = writeFileMock.mock.calls[0];
    const parsed = JSON.parse(content);

    expect(parsed.output.path).toBe("./src/app/autotheme.css");
    expect(parsed.output.tailwind).toBe(true);
    expect(parsed.shadcn).toBe(true);
  });

  it("-y with --framework astro writes astro defaults", async () => {
    const { runInit } = await import("../../src/cli/init");
    await runInit({ skipPrompts: true, framework: "astro" });

    const [, content] = writeFileMock.mock.calls[0];
    const parsed = JSON.parse(content);

    expect(parsed.output.path).toBe("./src/styles/autotheme.css");
    expect(parsed.output.tailwind).toBe(true);
    expect(parsed.shadcn).toBeUndefined();
  });

  it("written JSON is valid against config resolution", async () => {
    const { runInit } = await import("../../src/cli/init");
    await runInit({ skipPrompts: true, framework: "nextjs" });

    const [, content] = writeFileMock.mock.calls[0];
    const parsed = JSON.parse(content);

    // Remove $schema before resolving (not part of AutoThemeConfig)
    const { $schema: _schema, ...config } = parsed;
    const resolved = resolveToConfig(config);

    expect(resolved.color).toBe("#6439FF");
    expect(resolved.harmony).toBe("analogous");
    expect(resolved.shadcn).not.toBe(false);
    expect(resolved.output.tailwind).toBe(true);
  });
});
