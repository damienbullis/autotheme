import { describe, it, expect } from "vitest";
import { PRESETS, getPreset, getPresetNames } from "../../src/config/presets";
import { Color } from "../../src/core/color";

describe("Presets", () => {
  describe("PRESETS", () => {
    it("has 10 presets", () => {
      expect(Object.keys(PRESETS)).toHaveLength(10);
    });

    it("each preset has name, description, and config", () => {
      for (const [key, preset] of Object.entries(PRESETS)) {
        expect(preset.name).toBeTruthy();
        expect(preset.description).toBeTruthy();
        expect(preset.config).toBeDefined();
        expect(preset.config.color).toBeTruthy();
        expect(preset.config.harmony).toBeTruthy();
        // Verify key matches lowercase convention
        expect(key).toBe(key.toLowerCase());
      }
    });

    it("all preset colors are valid", () => {
      for (const [key, preset] of Object.entries(PRESETS)) {
        expect(
          () => new Color(preset.config.color!),
          `Invalid color in preset "${key}"`,
        ).not.toThrow();
      }
    });

    it("includes expected presets", () => {
      const names = Object.keys(PRESETS);
      expect(names).toContain("ocean");
      expect(names).toContain("sunset");
      expect(names).toContain("forest");
      expect(names).toContain("lavender");
      expect(names).toContain("ember");
      expect(names).toContain("arctic");
      expect(names).toContain("midnight");
      expect(names).toContain("terracotta");
      expect(names).toContain("neon");
      expect(names).toContain("sage");
    });
  });

  describe("getPreset", () => {
    it("returns preset by name", () => {
      const preset = getPreset("ocean");
      expect(preset.name).toBe("Ocean");
      expect(preset.config.color).toBe("#1E6091");
      expect(preset.config.harmony).toBe("analogous");
    });

    it("throws for unknown preset", () => {
      expect(() => getPreset("nonexistent")).toThrow('Unknown preset: "nonexistent"');
    });

    it("error message lists available presets", () => {
      expect(() => getPreset("bad")).toThrow("Available presets:");
    });
  });

  describe("getPresetNames", () => {
    it("returns array of all preset names", () => {
      const names = getPresetNames();
      expect(names).toHaveLength(10);
      expect(names).toContain("ocean");
      expect(names).toContain("sunset");
    });

    it("returns a new array each time", () => {
      const a = getPresetNames();
      const b = getPresetNames();
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });
});
