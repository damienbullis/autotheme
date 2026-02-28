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
        "piroku",
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

  describe("output validation", () => {
    it("accepts valid output path", () => {
      const result = validateConfig({ output: "./custom.css" });
      expect(result.output).toBe("./custom.css");
    });

    it("throws for non-string output", () => {
      expect(() => validateConfig({ output: 123 })).toThrow("output must be a string");
    });
  });

  describe("boolean validation", () => {
    it("accepts valid boolean for preview", () => {
      expect(validateConfig({ preview: true }).preview).toBe(true);
      expect(validateConfig({ preview: false }).preview).toBe(false);
    });

    it("accepts valid boolean for tailwind", () => {
      expect(validateConfig({ tailwind: true }).tailwind).toBe(true);
      expect(validateConfig({ tailwind: false }).tailwind).toBe(false);
    });

    it("accepts valid boolean for darkModeScript", () => {
      expect(validateConfig({ darkModeScript: true }).darkModeScript).toBe(true);
      expect(validateConfig({ darkModeScript: false }).darkModeScript).toBe(false);
    });

    it("throws for non-boolean values", () => {
      expect(() => validateConfig({ preview: "true" })).toThrow("preview must be a boolean");
      expect(() => validateConfig({ tailwind: 1 })).toThrow("tailwind must be a boolean");
      expect(() => validateConfig({ darkModeScript: "yes" })).toThrow(
        "darkModeScript must be a boolean",
      );
    });
  });

  describe("scalar validation", () => {
    it("accepts valid positive number", () => {
      const result = validateConfig({ scalar: 1.5 });
      expect(result.scalar).toBe(1.5);
    });

    it("throws for zero or negative scalar", () => {
      expect(() => validateConfig({ scalar: 0 })).toThrow("scalar must be a positive number");
      expect(() => validateConfig({ scalar: -1 })).toThrow("scalar must be a positive number");
    });

    it("throws for non-number scalar", () => {
      expect(() => validateConfig({ scalar: "1.5" })).toThrow("scalar must be a positive number");
    });
  });

  describe("contrastTarget validation", () => {
    it("accepts valid contrast values", () => {
      expect(validateConfig({ contrastTarget: 3 }).contrastTarget).toBe(3);
      expect(validateConfig({ contrastTarget: 7 }).contrastTarget).toBe(7);
      expect(validateConfig({ contrastTarget: 21 }).contrastTarget).toBe(21);
    });

    it("throws for out of range values", () => {
      expect(() => validateConfig({ contrastTarget: 2 })).toThrow(
        "contrastTarget must be between 3 and 21",
      );
      expect(() => validateConfig({ contrastTarget: 22 })).toThrow(
        "contrastTarget must be between 3 and 21",
      );
    });

    it("throws for non-number contrastTarget", () => {
      expect(() => validateConfig({ contrastTarget: "7" })).toThrow(
        "contrastTarget must be between 3 and 21",
      );
    });
  });

  describe("radius validation", () => {
    it("accepts valid radius string", () => {
      expect(validateConfig({ radius: "0.625rem" }).radius).toBe("0.625rem");
      expect(validateConfig({ radius: "1rem" }).radius).toBe("1rem");
      expect(validateConfig({ radius: "8px" }).radius).toBe("8px");
    });

    it("throws for non-string radius", () => {
      expect(() => validateConfig({ radius: 8 })).toThrow("radius must be a string");
    });
  });

  describe("prefix validation", () => {
    it("accepts valid prefix strings", () => {
      expect(validateConfig({ prefix: "color" }).prefix).toBe("color");
      expect(validateConfig({ prefix: "at" }).prefix).toBe("at");
      expect(validateConfig({ prefix: "my-theme" }).prefix).toBe("my-theme");
      expect(validateConfig({ prefix: "Theme2" }).prefix).toBe("Theme2");
    });

    it("throws for invalid prefix format", () => {
      expect(() => validateConfig({ prefix: "2color" })).toThrow("prefix must start with a letter");
      expect(() => validateConfig({ prefix: "-bad" })).toThrow("prefix must start with a letter");
      expect(() => validateConfig({ prefix: "has space" })).toThrow(
        "prefix must start with a letter",
      );
    });

    it("throws for non-string prefix", () => {
      expect(() => validateConfig({ prefix: 123 })).toThrow("prefix must be a string");
    });
  });

  describe("fontSize validation", () => {
    it("accepts valid positive number", () => {
      expect(validateConfig({ fontSize: 1 }).fontSize).toBe(1);
      expect(validateConfig({ fontSize: 0.875 }).fontSize).toBe(0.875);
    });

    it("throws for zero or negative fontSize", () => {
      expect(() => validateConfig({ fontSize: 0 })).toThrow("fontSize must be a positive number");
      expect(() => validateConfig({ fontSize: -1 })).toThrow("fontSize must be a positive number");
    });

    it("throws for non-number fontSize", () => {
      expect(() => validateConfig({ fontSize: "1" })).toThrow("fontSize must be a positive number");
    });
  });

  describe("feature toggle validation", () => {
    it("accepts valid booleans for all toggles", () => {
      const toggles = ["gradients", "spacing", "noise", "shadcn", "utilities"] as const;
      for (const key of toggles) {
        expect(validateConfig({ [key]: true })[key]).toBe(true);
        expect(validateConfig({ [key]: false })[key]).toBe(false);
      }
    });

    it("throws for non-boolean toggle values", () => {
      expect(() => validateConfig({ gradients: "true" })).toThrow("gradients must be a boolean");
      expect(() => validateConfig({ spacing: 1 })).toThrow("spacing must be a boolean");
      expect(() => validateConfig({ noise: "yes" })).toThrow("noise must be a boolean");
      expect(() => validateConfig({ shadcn: 0 })).toThrow("shadcn must be a boolean");
      expect(() => validateConfig({ utilities: "no" })).toThrow("utilities must be a boolean");
    });
  });

  describe("complete config validation", () => {
    it("validates full config object", () => {
      const result = validateConfig({
        color: "#6439FF",
        harmony: "triadic",
        output: "./theme.css",
        preview: true,
        tailwind: false,
        darkModeScript: true,
        scalar: 1.618,
        contrastTarget: 7,
        radius: "0.625rem",
        prefix: "at",
        fontSize: 0.875,
        gradients: false,
        spacing: true,
        noise: true,
        shadcn: false,
        utilities: true,
      });

      expect(result).toEqual({
        color: "#6439FF",
        harmony: "triadic",
        output: "./theme.css",
        preview: true,
        tailwind: false,
        darkModeScript: true,
        scalar: 1.618,
        contrastTarget: 7,
        radius: "0.625rem",
        prefix: "at",
        fontSize: 0.875,
        gradients: false,
        spacing: true,
        noise: true,
        shadcn: false,
        utilities: true,
      });
    });
  });
});
