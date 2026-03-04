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

  describe("palette validation (boolean | object pattern)", () => {
    it("accepts true to enable with defaults", () => {
      const result = validateConfig({ palette: true });
      expect(result.palette).toBe(true);
    });

    it("accepts false to disable", () => {
      const result = validateConfig({ palette: false });
      expect(result.palette).toBe(false);
    });

    it("accepts valid palette object", () => {
      const result = validateConfig({ palette: { prefix: "at", contrastTarget: 7 } });
      expect((result.palette as Record<string, unknown>).prefix).toBe("at");
      expect((result.palette as Record<string, unknown>).contrastTarget).toBe(7);
    });

    it("validates prefix format", () => {
      expect(() => validateConfig({ palette: { prefix: "2color" } })).toThrow(
        "palette.prefix must start with a letter",
      );
    });

    it("validates contrastTarget is a positive number", () => {
      expect(() => validateConfig({ palette: { contrastTarget: 0 } })).toThrow(
        "palette.contrastTarget must be a positive number",
      );
      expect(() => validateConfig({ palette: { contrastTarget: -1 } })).toThrow(
        "palette.contrastTarget must be a positive number",
      );
    });

    it("accepts palette.swing and palette.swingStrategy", () => {
      const result = validateConfig({
        palette: { swing: 1.5, swingStrategy: "exponential" },
      });
      const p = result.palette as Record<string, unknown>;
      expect(p.swing).toBe(1.5);
      expect(p.swingStrategy).toBe("exponential");
    });

    it("throws for invalid types (string, number, array)", () => {
      expect(() => validateConfig({ palette: "bad" })).toThrow(
        "palette must be a boolean or an object",
      );
      expect(() => validateConfig({ palette: 123 })).toThrow(
        "palette must be a boolean or an object",
      );
      expect(() => validateConfig({ palette: [1, 2] })).toThrow(
        "palette must be a boolean or an object",
      );
    });
  });

  describe("semantics validation (boolean | object pattern)", () => {
    it("accepts true to enable with defaults", () => {
      const result = validateConfig({ semantics: true });
      expect(result.semantics).toBe(true);
    });

    it("accepts false to disable", () => {
      const result = validateConfig({ semantics: false });
      expect(result.semantics).toBe(false);
    });

    it("accepts semantics object with depth", () => {
      const result = validateConfig({ semantics: { depth: 0.5 } });
      expect((result.semantics as Record<string, unknown>).depth).toBe(0.5);
    });

    it("validates depth range 0-1", () => {
      expect(() => validateConfig({ semantics: { depth: -0.1 } })).toThrow(
        "semantics.depth must be between 0 and 1",
      );
      expect(() => validateConfig({ semantics: { depth: 1.5 } })).toThrow(
        "semantics.depth must be between 0 and 1",
      );
    });

    it("validates text sub-object", () => {
      const result = validateConfig({
        semantics: { text: { levels: 3, anchor: 0.95, floor: 0.55 } },
      });
      const sem = result.semantics as Record<string, unknown>;
      const text = sem.text as Record<string, unknown>;
      expect(text.levels).toBe(3);
      expect(text.anchor).toBe(0.95);
    });

    it("validates surfaces sub-object", () => {
      const result = validateConfig({
        semantics: { surfaces: { chroma: 0.01, sunkenDelta: -0.02 } },
      });
      const sem = result.semantics as Record<string, unknown>;
      const surfaces = sem.surfaces as Record<string, unknown>;
      expect(surfaces.chroma).toBe(0.01);
    });

    it("validates borders sub-object", () => {
      const result = validateConfig({
        semantics: { borders: { offsets: [0.08, 0.15, 0.25], chroma: 0.012 } },
      });
      const sem = result.semantics as Record<string, unknown>;
      const borders = sem.borders as Record<string, unknown>;
      expect(borders.offsets).toEqual([0.08, 0.15, 0.25]);
    });

    it("validates mapping sub-object", () => {
      const result = validateConfig({
        semantics: { mapping: { accent: "primary", secondary: "secondary" } },
      });
      const sem = result.semantics as Record<string, unknown>;
      const mapping = sem.mapping as Record<string, unknown>;
      expect(mapping.accent).toBe("primary");
    });

    it("throws for invalid types", () => {
      expect(() => validateConfig({ semantics: "bad" })).toThrow(
        "semantics must be a boolean or an object",
      );
    });
  });

  describe("typography validation (boolean | object pattern)", () => {
    it("accepts true to enable with defaults", () => {
      const result = validateConfig({ typography: true });
      expect(result.typography).toBe(true);
    });

    it("accepts valid typography object", () => {
      const result = validateConfig({ typography: { base: 0.875, ratio: 1.5, steps: 6 } });
      const t = result.typography as Record<string, unknown>;
      expect(t.base).toBe(0.875);
      expect(t.ratio).toBe(1.5);
      expect(t.steps).toBe(6);
    });

    it("throws for non-positive base", () => {
      expect(() => validateConfig({ typography: { base: 0 } })).toThrow(
        "typography.base must be a positive number",
      );
    });

    it("throws for invalid types", () => {
      expect(() => validateConfig({ typography: "bad" })).toThrow(
        "typography must be a boolean or an object",
      );
      expect(() => validateConfig({ typography: 42 })).toThrow(
        "typography must be a boolean or an object",
      );
    });
  });

  describe("spacing validation (boolean | object pattern)", () => {
    it("accepts true to enable with defaults", () => {
      const result = validateConfig({ spacing: true });
      expect(result.spacing).toBe(true);
    });

    it("accepts false to disable", () => {
      const result = validateConfig({ spacing: false });
      expect(result.spacing).toBe(false);
    });

    it("accepts valid spacing object", () => {
      const result = validateConfig({ spacing: { base: 0.25, ratio: 2, steps: 8 } });
      const s = result.spacing as Record<string, unknown>;
      expect(s.base).toBe(0.25);
      expect(s.ratio).toBe(2);
      expect(s.steps).toBe(8);
    });

    it("throws for invalid types", () => {
      expect(() => validateConfig({ spacing: "bad" })).toThrow(
        "spacing must be a boolean or an object",
      );
      expect(() => validateConfig({ spacing: 99 })).toThrow(
        "spacing must be a boolean or an object",
      );
    });
  });

  describe("shadows validation (boolean | object pattern)", () => {
    it("accepts true to enable with defaults", () => {
      const result = validateConfig({ shadows: true });
      expect(result.shadows).toBe(true);
    });

    it("accepts valid shadows object", () => {
      const result = validateConfig({ shadows: { base: 1, ratio: 2, steps: 5 } });
      const s = result.shadows as Record<string, unknown>;
      expect(s.base).toBe(1);
      expect(s.steps).toBe(5);
    });

    it("throws for invalid types", () => {
      expect(() => validateConfig({ shadows: "bad" })).toThrow(
        "shadows must be a boolean or an object",
      );
    });
  });

  describe("radius validation (boolean | object pattern)", () => {
    it("accepts true to enable with defaults", () => {
      const result = validateConfig({ radius: true });
      expect(result.radius).toBe(true);
    });

    it("accepts valid radius object", () => {
      const result = validateConfig({ radius: { base: 0.125, ratio: 2, steps: 6 } });
      const r = result.radius as Record<string, unknown>;
      expect(r.base).toBe(0.125);
      expect(r.steps).toBe(6);
    });

    it("throws for invalid types", () => {
      expect(() => validateConfig({ radius: "bad" })).toThrow(
        "radius must be a boolean or an object",
      );
    });
  });

  describe("shadcn validation (boolean | object pattern)", () => {
    it("accepts true to enable with defaults", () => {
      const result = validateConfig({ shadcn: true });
      expect(result.shadcn).toBe(true);
    });

    it("accepts false to disable", () => {
      const result = validateConfig({ shadcn: false });
      expect(result.shadcn).toBe(false);
    });

    it("accepts valid shadcn object", () => {
      const result = validateConfig({ shadcn: { radius: "1rem" } });
      expect((result.shadcn as Record<string, unknown>).radius).toBe("1rem");
    });

    it("throws for non-string radius", () => {
      expect(() => validateConfig({ shadcn: { radius: 8 } })).toThrow(
        "shadcn.radius must be a string",
      );
    });

    it("throws for invalid types", () => {
      expect(() => validateConfig({ shadcn: "bad" })).toThrow(
        "shadcn must be a boolean or an object",
      );
      expect(() => validateConfig({ shadcn: 42 })).toThrow("shadcn must be a boolean or an object");
    });
  });

  describe("elevation validation (boolean | object pattern)", () => {
    it("accepts true to enable with defaults", () => {
      const result = validateConfig({ elevation: true });
      expect(result.elevation).toBe(true);
    });

    it("accepts valid elevation object", () => {
      const result = validateConfig({ elevation: { levels: 4, delta: 0.03 } });
      const e = result.elevation as Record<string, unknown>;
      expect(e.levels).toBe(4);
      expect(e.delta).toBe(0.03);
    });

    it("throws for invalid types", () => {
      expect(() => validateConfig({ elevation: "bad" })).toThrow(
        "elevation must be a boolean or an object",
      );
    });
  });

  describe("states validation (boolean | object pattern)", () => {
    it("accepts true to enable with defaults", () => {
      const result = validateConfig({ states: true });
      expect(result.states).toBe(true);
    });

    it("accepts valid states object", () => {
      const result = validateConfig({ states: { hover: 0.04, active: -0.02 } });
      const s = result.states as Record<string, unknown>;
      expect(s.hover).toBe(0.04);
      expect(s.active).toBe(-0.02);
    });

    it("throws for invalid types", () => {
      expect(() => validateConfig({ states: "bad" })).toThrow(
        "states must be a boolean or an object",
      );
    });
  });

  describe("motion validation (boolean | object pattern)", () => {
    it("accepts true to enable with defaults", () => {
      const result = validateConfig({ motion: true });
      expect(result.motion).toBe(true);
    });

    it("accepts false to disable", () => {
      const result = validateConfig({ motion: false });
      expect(result.motion).toBe(false);
    });

    it("throws for invalid types", () => {
      expect(() => validateConfig({ motion: "bad" })).toThrow(
        "motion must be a boolean or an object",
      );
    });
  });

  describe("output validation", () => {
    it("accepts valid output object", () => {
      const result = validateConfig({
        output: { path: "./custom.css", tailwind: true, preview: true, format: "oklch" },
      });
      expect(result.output?.path).toBe("./custom.css");
      expect(result.output?.tailwind).toBe(true);
      expect(result.output?.preview).toBe(true);
      expect(result.output?.format).toBe("oklch");
    });

    it("validates output.format values", () => {
      for (const format of ["oklch", "hsl", "rgb", "hex"]) {
        const result = validateConfig({ output: { format } });
        expect(result.output?.format).toBe(format);
      }
    });

    it("throws for invalid output.format", () => {
      expect(() => validateConfig({ output: { format: "xyz" } })).toThrow(
        'output.format must be one of: "oklch", "hsl", "rgb", "hex"',
      );
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

  describe("mode validation", () => {
    it("accepts valid modes", () => {
      for (const mode of ["light", "dark", "both"]) {
        const result = validateConfig({ mode });
        expect(result.mode).toBe(mode);
      }
    });

    it("throws for invalid mode", () => {
      expect(() => validateConfig({ mode: "invalid" })).toThrow(
        'mode must be one of: "light", "dark", "both"',
      );
    });
  });

  describe("complete config validation", () => {
    it("validates full nested config object", () => {
      const result = validateConfig({
        color: "#6439FF",
        harmony: "triadic",
        mode: "both",
        palette: { prefix: "at", contrastTarget: 7, swing: 1.5, swingStrategy: "exponential" },
        semantics: { depth: 0.13 },
        typography: { base: 0.875, ratio: 1.618, steps: 8 },
        spacing: { base: 0.155, ratio: 1.618, steps: 10 },
        shadows: true,
        radius: true,
        gradients: false,
        noise: true,
        utilities: true,
        shadcn: { radius: "0.625rem" },
        elevation: { levels: 4, delta: 0.03 },
        states: true,
        motion: false,
        output: { path: "./theme.css", format: "oklch", tailwind: false, preview: true },
      });

      expect(result.color).toBe("#6439FF");
      expect(result.harmony).toBe("triadic");
      expect(result.mode).toBe("both");
      expect((result.palette as Record<string, unknown>).prefix).toBe("at");
      expect((result.palette as Record<string, unknown>).swing).toBe(1.5);
      expect((result.typography as Record<string, unknown>).base).toBe(0.875);
      expect(result.spacing).toEqual({ base: 0.155, ratio: 1.618, steps: 10 });
      expect(result.shadows).toBe(true);
      expect(result.radius).toBe(true);
      expect(result.gradients).toBe(false);
      expect((result.shadcn as Record<string, unknown>).radius).toBe("0.625rem");
      expect((result.elevation as Record<string, unknown>).levels).toBe(4);
      expect(result.states).toBe(true);
      expect(result.motion).toBe(false);
      expect(result.output?.path).toBe("./theme.css");
      expect(result.output?.format).toBe("oklch");
      expect(result.output?.preview).toBe(true);
    });
  });
});
