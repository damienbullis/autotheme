import { describe, it, expect } from "vitest";
import { validateConfig } from "../../src/config/validator";

describe("validateConfig", () => {
  describe("basic validation", () => {
    it("returns empty object for empty config", () => {
      const result = validateConfig({});
      expect(result).toEqual({});
    });

    it("throws if config is null", () => {
      expect(() => validateConfig(null)).toThrow("Config must be an object");
    });

    it("throws if config is not an object", () => {
      expect(() => validateConfig("string")).toThrow("Config must be an object");
      expect(() => validateConfig(123)).toThrow("Config must be an object");
    });
  });

  describe("color validation", () => {
    it("accepts valid hex color", () => {
      const result = validateConfig({ color: "#ff0000" });
      expect(result.color).toBe("#ff0000");
    });

    it("accepts valid rgb color", () => {
      const result = validateConfig({ color: "rgb(255, 0, 0)" });
      expect(result.color).toBe("rgb(255, 0, 0)");
    });

    it("accepts valid hsl color", () => {
      const result = validateConfig({ color: "hsl(0, 100%, 50%)" });
      expect(result.color).toBe("hsl(0, 100%, 50%)");
    });

    it("throws for non-string color", () => {
      expect(() => validateConfig({ color: 123 })).toThrow("color must be a string");
    });

    it("throws for invalid color format", () => {
      expect(() => validateConfig({ color: "invalid" })).toThrow("Invalid color format");
    });
  });

  describe("harmony validation", () => {
    it("accepts valid harmony types", () => {
      const harmonies = [
        "complementary",
        "analogous",
        "triadic",
        "split-complementary",
        "drift",
        "square",
        "rectangle",
        "aurelian",
        "bi-polar",
        "retrograde",
      ];

      for (const harmony of harmonies) {
        const result = validateConfig({ harmony });
        expect(result.harmony).toBe(harmony);
      }
    });

    it("throws for invalid harmony", () => {
      expect(() => validateConfig({ harmony: "invalid" })).toThrow("Invalid harmony");
    });

    it("throws for non-string harmony", () => {
      expect(() => validateConfig({ harmony: 123 })).toThrow("Invalid harmony");
    });
  });

  describe("palette validation", () => {
    it("accepts valid palette object", () => {
      const result = validateConfig({ palette: { prefix: "at", contrastTarget: 7 } });
      expect(result.palette?.prefix).toBe("at");
      expect(result.palette?.contrastTarget).toBe(7);
    });

    it("validates prefix format", () => {
      expect(() => validateConfig({ palette: { prefix: "2color" } })).toThrow(
        "palette.prefix must start with a letter",
      );
    });

    it("validates contrastTarget range", () => {
      expect(() => validateConfig({ palette: { contrastTarget: 2 } })).toThrow(
        "palette.contrastTarget must be between 3 and 21",
      );
    });

    it("throws for non-object palette", () => {
      expect(() => validateConfig({ palette: "bad" })).toThrow("palette must be an object");
    });
  });

  describe("typography validation", () => {
    it("accepts valid typography object", () => {
      const result = validateConfig({ typography: { base: 0.875, ratio: 1.5, steps: 6 } });
      expect(result.typography?.base).toBe(0.875);
      expect(result.typography?.ratio).toBe(1.5);
      expect(result.typography?.steps).toBe(6);
    });

    it("throws for non-positive base", () => {
      expect(() => validateConfig({ typography: { base: 0 } })).toThrow(
        "typography.base must be a positive number",
      );
    });

    it("throws for non-object typography", () => {
      expect(() => validateConfig({ typography: "bad" })).toThrow("typography must be an object");
    });
  });

  describe("spacing validation", () => {
    it("accepts valid spacing object", () => {
      const result = validateConfig({ spacing: { enabled: true, base: 0.25, ratio: 2, steps: 8 } });
      expect(result.spacing?.enabled).toBe(true);
      expect(result.spacing?.base).toBe(0.25);
    });

    it("throws for non-boolean enabled", () => {
      expect(() => validateConfig({ spacing: { enabled: "yes" } })).toThrow(
        "spacing.enabled must be a boolean",
      );
    });

    it("throws for non-object spacing", () => {
      expect(() => validateConfig({ spacing: "bad" })).toThrow("spacing must be an object");
    });
  });

  describe("shadcn validation", () => {
    it("accepts valid shadcn object", () => {
      const result = validateConfig({ shadcn: { enabled: true, radius: "1rem" } });
      expect(result.shadcn?.enabled).toBe(true);
      expect(result.shadcn?.radius).toBe("1rem");
    });

    it("throws for non-boolean enabled", () => {
      expect(() => validateConfig({ shadcn: { enabled: "yes" } })).toThrow(
        "shadcn.enabled must be a boolean",
      );
    });

    it("throws for non-string radius", () => {
      expect(() => validateConfig({ shadcn: { radius: 8 } })).toThrow(
        "shadcn.radius must be a string",
      );
    });

    it("throws for non-object shadcn", () => {
      expect(() => validateConfig({ shadcn: "bad" })).toThrow("shadcn must be an object");
    });
  });

  describe("output validation", () => {
    it("accepts valid output object", () => {
      const result = validateConfig({
        output: { path: "./custom.css", tailwind: true, preview: true, darkModeScript: false },
      });
      expect(result.output?.path).toBe("./custom.css");
      expect(result.output?.tailwind).toBe(true);
      expect(result.output?.preview).toBe(true);
      expect(result.output?.darkModeScript).toBe(false);
    });

    it("throws for non-string path", () => {
      expect(() => validateConfig({ output: { path: 123 } })).toThrow(
        "output.path must be a string",
      );
    });

    it("throws for non-boolean tailwind", () => {
      expect(() => validateConfig({ output: { tailwind: "yes" } })).toThrow(
        "output.tailwind must be a boolean",
      );
    });

    it("throws for non-object output", () => {
      expect(() => validateConfig({ output: "bad" })).toThrow("output must be an object");
    });
  });

  describe("feature toggle validation", () => {
    it("accepts valid booleans for simple toggles", () => {
      const toggles = ["gradients", "noise", "utilities"] as const;
      for (const key of toggles) {
        expect(validateConfig({ [key]: true })[key]).toBe(true);
        expect(validateConfig({ [key]: false })[key]).toBe(false);
      }
    });

    it("throws for non-boolean toggle values", () => {
      expect(() => validateConfig({ gradients: "true" })).toThrow("gradients must be a boolean");
      expect(() => validateConfig({ noise: "yes" })).toThrow("noise must be a boolean");
      expect(() => validateConfig({ utilities: "no" })).toThrow("utilities must be a boolean");
    });
  });

  describe("swing validation", () => {
    it("accepts valid positive number", () => {
      expect(validateConfig({ swing: 1.5 }).swing).toBe(1.5);
      expect(validateConfig({ swing: 0.5 }).swing).toBe(0.5);
      expect(validateConfig({ swing: 1 }).swing).toBe(1);
    });

    it("throws for zero swing", () => {
      expect(() => validateConfig({ swing: 0 })).toThrow("swing must be a positive number");
    });

    it("throws for negative swing", () => {
      expect(() => validateConfig({ swing: -1 })).toThrow("swing must be a positive number");
    });

    it("throws for non-number swing", () => {
      expect(() => validateConfig({ swing: "1.5" })).toThrow("swing must be a positive number");
    });
  });

  describe("swingStrategy validation", () => {
    it("accepts valid swing strategies", () => {
      expect(validateConfig({ swingStrategy: "linear" }).swingStrategy).toBe("linear");
      expect(validateConfig({ swingStrategy: "exponential" }).swingStrategy).toBe("exponential");
      expect(validateConfig({ swingStrategy: "alternating" }).swingStrategy).toBe("alternating");
    });

    it("throws for invalid swing strategy", () => {
      expect(() => validateConfig({ swingStrategy: "invalid" })).toThrow("Invalid swingStrategy");
    });

    it("throws for non-string swing strategy", () => {
      expect(() => validateConfig({ swingStrategy: 123 })).toThrow("Invalid swingStrategy");
    });
  });

  describe("harmonies validation", () => {
    it("accepts valid custom harmonies", () => {
      const result = validateConfig({
        harmonies: {
          "warm-quad": { offsets: [0, 30, 60, 180] },
          "golden-five": { offsets: [0, 72, 144, 216, 288] },
        },
      });
      expect(result.harmonies).toBeDefined();
      expect(result.harmonies!["warm-quad"]!.offsets).toEqual([0, 30, 60, 180]);
      expect(result.harmonies!["golden-five"]!.offsets).toEqual([0, 72, 144, 216, 288]);
    });

    it("throws if harmonies is not an object", () => {
      expect(() => validateConfig({ harmonies: "invalid" })).toThrow("harmonies must be an object");
    });

    it("throws if harmonies entry is not an object", () => {
      expect(() => validateConfig({ harmonies: { bad: "string" } })).toThrow(
        'harmonies.bad must be an object with an "offsets" array',
      );
    });

    it("throws if offsets is not an array", () => {
      expect(() => validateConfig({ harmonies: { bad: { offsets: 123 } } })).toThrow(
        "harmonies.bad.offsets must be an array of numbers",
      );
    });

    it("throws if offsets has fewer than 2 values", () => {
      expect(() => validateConfig({ harmonies: { bad: { offsets: [0] } } })).toThrow(
        "harmonies.bad.offsets must have at least 2 values",
      );
    });

    it("throws if offsets contains non-numbers", () => {
      expect(() => validateConfig({ harmonies: { bad: { offsets: [0, "90"] } } })).toThrow(
        "harmonies.bad.offsets[1] must be a number",
      );
    });
  });

  describe("harmony with custom harmonies", () => {
    it("accepts custom harmony name when defined in harmonies", () => {
      const result = validateConfig({
        harmonies: { "my-harmony": { offsets: [0, 90, 180] } },
        harmony: "my-harmony",
      });
      expect(result.harmony).toBe("my-harmony");
    });

    it("rejects unknown harmony when not in harmonies", () => {
      expect(() => validateConfig({ harmony: "unknown-harmony" })).toThrow("Invalid harmony");
    });

    it("still accepts built-in harmonies", () => {
      const result = validateConfig({ harmony: "triadic" });
      expect(result.harmony).toBe("triadic");
    });
  });

  describe("preset validation", () => {
    it("accepts valid preset string", () => {
      const result = validateConfig({ preset: "ocean" });
      expect(result.preset).toBe("ocean");
    });

    it("throws for non-string preset", () => {
      expect(() => validateConfig({ preset: 123 })).toThrow("preset must be a string");
    });
  });

  describe("complete config validation", () => {
    it("validates full nested config object", () => {
      const result = validateConfig({
        color: "#6439FF",
        harmony: "triadic",
        swing: 1.5,
        swingStrategy: "exponential",
        palette: { prefix: "at", contrastTarget: 7 },
        typography: { base: 0.875, ratio: 1.618, steps: 8 },
        spacing: { enabled: true, base: 0.155, ratio: 1.618, steps: 10 },
        gradients: false,
        noise: true,
        utilities: true,
        shadcn: { enabled: false, radius: "0.625rem" },
        output: { path: "./theme.css", tailwind: false, preview: true, darkModeScript: true },
      });

      expect(result.color).toBe("#6439FF");
      expect(result.harmony).toBe("triadic");
      expect(result.palette?.prefix).toBe("at");
      expect(result.typography?.base).toBe(0.875);
      expect(result.spacing?.enabled).toBe(true);
      expect(result.shadcn?.enabled).toBe(false);
      expect(result.output?.path).toBe("./theme.css");
      expect(result.output?.preview).toBe(true);
    });
  });
});
