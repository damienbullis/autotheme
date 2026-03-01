import type { AutoThemeConfig } from "./types";
import { Color } from "../core/color";

const VALID_HARMONIES = [
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
] as const;

const VALID_SWING_STRATEGIES = ["linear", "exponential", "alternating"] as const;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export function validateConfig(config: unknown): DeepPartial<AutoThemeConfig> {
  if (typeof config !== "object" || config === null) {
    throw new Error("Config must be an object");
  }

  const result: DeepPartial<AutoThemeConfig> = {};
  const obj = config as Record<string, unknown>;

  // Validate version
  if (obj.version !== undefined) {
    if (obj.version !== 2) {
      throw new Error("version must be 2");
    }
    result.version = 2;
  }

  // Validate color
  if (obj.color !== undefined) {
    if (typeof obj.color !== "string") {
      throw new Error("color must be a string");
    }
    try {
      new Color(obj.color);
      result.color = obj.color;
    } catch {
      throw new Error(`Invalid color format: ${obj.color}`);
    }
  }

  // Validate harmonies (custom harmony definitions)
  if (obj.harmonies !== undefined) {
    if (
      typeof obj.harmonies !== "object" ||
      obj.harmonies === null ||
      Array.isArray(obj.harmonies)
    ) {
      throw new Error("harmonies must be an object mapping names to { offsets: number[] }");
    }
    const harmonies: Record<string, { offsets: number[] }> = {};
    for (const [name, def] of Object.entries(obj.harmonies as Record<string, unknown>)) {
      if (typeof def !== "object" || def === null || Array.isArray(def)) {
        throw new Error(`harmonies.${name} must be an object with an "offsets" array`);
      }
      const defObj = def as Record<string, unknown>;
      if (!Array.isArray(defObj.offsets)) {
        throw new Error(`harmonies.${name}.offsets must be an array of numbers`);
      }
      if (defObj.offsets.length < 2) {
        throw new Error(`harmonies.${name}.offsets must have at least 2 values`);
      }
      for (let i = 0; i < defObj.offsets.length; i++) {
        if (typeof defObj.offsets[i] !== "number") {
          throw new Error(`harmonies.${name}.offsets[${i}] must be a number`);
        }
      }
      harmonies[name] = { offsets: defObj.offsets as number[] };
    }
    result.harmonies = harmonies;
  }

  // Validate harmony
  if (obj.harmony !== undefined) {
    if (typeof obj.harmony !== "string") {
      throw new Error(`Invalid harmony: ${obj.harmony}. Must be a string.`);
    }
    const isBuiltIn = VALID_HARMONIES.includes(obj.harmony as (typeof VALID_HARMONIES)[number]);
    const customHarmonies = obj.harmonies as Record<string, unknown> | undefined;
    const isCustom = customHarmonies && obj.harmony in customHarmonies;
    if (!isBuiltIn && !isCustom) {
      throw new Error(
        `Invalid harmony: "${obj.harmony}". Must be one of: ${VALID_HARMONIES.join(", ")}${customHarmonies ? ", or a name defined in harmonies" : ""}`,
      );
    }
    result.harmony = obj.harmony as AutoThemeConfig["harmony"];
  }

  // Validate preset
  if (obj.preset !== undefined) {
    if (typeof obj.preset !== "string") {
      throw new Error("preset must be a string");
    }
    result.preset = obj.preset;
  }

  // Validate swing
  if (obj.swing !== undefined) {
    if (typeof obj.swing !== "number" || obj.swing <= 0) {
      throw new Error("swing must be a positive number");
    }
    result.swing = obj.swing;
  }

  // Validate swingStrategy
  if (obj.swingStrategy !== undefined) {
    if (
      typeof obj.swingStrategy !== "string" ||
      !VALID_SWING_STRATEGIES.includes(obj.swingStrategy as (typeof VALID_SWING_STRATEGIES)[number])
    ) {
      throw new Error(
        `Invalid swingStrategy: ${obj.swingStrategy}. Must be one of: ${VALID_SWING_STRATEGIES.join(", ")}`,
      );
    }
    result.swingStrategy = obj.swingStrategy as AutoThemeConfig["swingStrategy"];
  }

  // Validate palette (nested object)
  if (obj.palette !== undefined) {
    if (typeof obj.palette !== "object" || obj.palette === null || Array.isArray(obj.palette)) {
      throw new Error("palette must be an object");
    }
    const paletteObj = obj.palette as Record<string, unknown>;
    result.palette = {};

    if (paletteObj.prefix !== undefined) {
      if (typeof paletteObj.prefix !== "string") {
        throw new Error("palette.prefix must be a string");
      }
      if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(paletteObj.prefix)) {
        throw new Error(
          "palette.prefix must start with a letter and contain only letters, numbers, and hyphens",
        );
      }
      result.palette.prefix = paletteObj.prefix;
    }

    if (paletteObj.contrastTarget !== undefined) {
      if (
        typeof paletteObj.contrastTarget !== "number" ||
        paletteObj.contrastTarget < 3 ||
        paletteObj.contrastTarget > 21
      ) {
        throw new Error("palette.contrastTarget must be between 3 and 21");
      }
      result.palette.contrastTarget = paletteObj.contrastTarget;
    }
  }

  // Validate typography (nested object)
  if (obj.typography !== undefined) {
    if (
      typeof obj.typography !== "object" ||
      obj.typography === null ||
      Array.isArray(obj.typography)
    ) {
      throw new Error("typography must be an object");
    }
    const typoObj = obj.typography as Record<string, unknown>;
    result.typography = {};

    if (typoObj.base !== undefined) {
      if (typeof typoObj.base !== "number" || typoObj.base <= 0) {
        throw new Error("typography.base must be a positive number");
      }
      result.typography.base = typoObj.base;
    }

    if (typoObj.ratio !== undefined) {
      if (typeof typoObj.ratio !== "number" || typoObj.ratio <= 0) {
        throw new Error("typography.ratio must be a positive number");
      }
      result.typography.ratio = typoObj.ratio;
    }

    if (typoObj.steps !== undefined) {
      if (typeof typoObj.steps !== "number" || typoObj.steps < 1) {
        throw new Error("typography.steps must be at least 1");
      }
      result.typography.steps = typoObj.steps;
    }
  }

  // Validate spacing (nested object)
  if (obj.spacing !== undefined) {
    if (typeof obj.spacing !== "object" || obj.spacing === null || Array.isArray(obj.spacing)) {
      throw new Error("spacing must be an object");
    }
    const spacingObj = obj.spacing as Record<string, unknown>;
    result.spacing = {};

    if (spacingObj.enabled !== undefined) {
      if (typeof spacingObj.enabled !== "boolean") {
        throw new Error("spacing.enabled must be a boolean");
      }
      result.spacing.enabled = spacingObj.enabled;
    }

    if (spacingObj.base !== undefined) {
      if (typeof spacingObj.base !== "number" || spacingObj.base <= 0) {
        throw new Error("spacing.base must be a positive number");
      }
      result.spacing.base = spacingObj.base;
    }

    if (spacingObj.ratio !== undefined) {
      if (typeof spacingObj.ratio !== "number" || spacingObj.ratio <= 0) {
        throw new Error("spacing.ratio must be a positive number");
      }
      result.spacing.ratio = spacingObj.ratio;
    }

    if (spacingObj.steps !== undefined) {
      if (typeof spacingObj.steps !== "number" || spacingObj.steps < 1) {
        throw new Error("spacing.steps must be at least 1");
      }
      result.spacing.steps = spacingObj.steps;
    }
  }

  // Validate simple boolean toggles
  for (const key of ["gradients", "noise", "utilities"] as const) {
    if (obj[key] !== undefined) {
      if (typeof obj[key] !== "boolean") {
        throw new Error(`${key} must be a boolean`);
      }
      result[key] = obj[key] as boolean;
    }
  }

  // Validate shadcn (nested object)
  if (obj.shadcn !== undefined) {
    if (typeof obj.shadcn !== "object" || obj.shadcn === null || Array.isArray(obj.shadcn)) {
      throw new Error("shadcn must be an object");
    }
    const shadcnObj = obj.shadcn as Record<string, unknown>;
    result.shadcn = {};

    if (shadcnObj.enabled !== undefined) {
      if (typeof shadcnObj.enabled !== "boolean") {
        throw new Error("shadcn.enabled must be a boolean");
      }
      result.shadcn.enabled = shadcnObj.enabled;
    }

    if (shadcnObj.radius !== undefined) {
      if (typeof shadcnObj.radius !== "string") {
        throw new Error("shadcn.radius must be a string");
      }
      result.shadcn.radius = shadcnObj.radius;
    }
  }

  // Validate output (nested object)
  if (obj.output !== undefined) {
    if (typeof obj.output !== "object" || obj.output === null || Array.isArray(obj.output)) {
      throw new Error("output must be an object");
    }
    const outputObj = obj.output as Record<string, unknown>;
    result.output = {};

    if (outputObj.path !== undefined) {
      if (typeof outputObj.path !== "string") {
        throw new Error("output.path must be a string");
      }
      result.output.path = outputObj.path;
    }

    for (const key of ["tailwind", "preview", "darkModeScript"] as const) {
      if (outputObj[key] !== undefined) {
        if (typeof outputObj[key] !== "boolean") {
          throw new Error(`output.${key} must be a boolean`);
        }
        result.output[key] = outputObj[key] as boolean;
      }
    }
  }

  return result;
}
