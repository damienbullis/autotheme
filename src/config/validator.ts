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

export function validateConfig(config: unknown): Partial<AutoThemeConfig> {
  if (typeof config !== "object" || config === null) {
    throw new Error("Config must be an object");
  }

  const result: Partial<AutoThemeConfig> = {};
  const obj = config as Record<string, unknown>;

  // Validate color
  if (obj.color !== undefined) {
    if (typeof obj.color !== "string") {
      throw new Error("color must be a string");
    }
    // Validate it's a parseable color
    try {
      new Color(obj.color);
      result.color = obj.color;
    } catch {
      throw new Error(`Invalid color format: ${obj.color}`);
    }
  }

  // Validate harmonies (custom harmony definitions)
  if (obj.harmonies !== undefined) {
    if (typeof obj.harmonies !== "object" || obj.harmonies === null || Array.isArray(obj.harmonies)) {
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

  // Validate harmony (accepts built-in names or custom names defined in harmonies)
  if (obj.harmony !== undefined) {
    if (typeof obj.harmony !== "string") {
      throw new Error(
        `Invalid harmony: ${obj.harmony}. Must be a string.`,
      );
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

  // Validate output
  if (obj.output !== undefined) {
    if (typeof obj.output !== "string") {
      throw new Error("output must be a string");
    }
    result.output = obj.output;
  }

  // Validate booleans
  for (const key of [
    "preview",
    "tailwind",
    "darkModeScript",
    "gradients",
    "spacing",
    "noise",
    "shadcn",
    "utilities",
  ] as const) {
    if (obj[key] !== undefined) {
      if (typeof obj[key] !== "boolean") {
        throw new Error(`${key} must be a boolean`);
      }
      result[key] = obj[key] as boolean;
    }
  }

  // Validate numbers
  if (obj.scalar !== undefined) {
    if (typeof obj.scalar !== "number" || obj.scalar <= 0) {
      throw new Error("scalar must be a positive number");
    }
    result.scalar = obj.scalar;
  }

  if (obj.contrastTarget !== undefined) {
    if (
      typeof obj.contrastTarget !== "number" ||
      obj.contrastTarget < 3 ||
      obj.contrastTarget > 21
    ) {
      throw new Error("contrastTarget must be between 3 and 21");
    }
    result.contrastTarget = obj.contrastTarget;
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

  // Validate radius
  if (obj.radius !== undefined) {
    if (typeof obj.radius !== "string") {
      throw new Error("radius must be a string");
    }
    result.radius = obj.radius;
  }

  // Validate prefix
  if (obj.prefix !== undefined) {
    if (typeof obj.prefix !== "string") {
      throw new Error("prefix must be a string");
    }
    if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(obj.prefix)) {
      throw new Error(
        "prefix must start with a letter and contain only letters, numbers, and hyphens",
      );
    }
    result.prefix = obj.prefix;
  }

  // Validate fontSize
  if (obj.fontSize !== undefined) {
    if (typeof obj.fontSize !== "number" || obj.fontSize <= 0) {
      throw new Error("fontSize must be a positive number");
    }
    result.fontSize = obj.fontSize;
  }

  return result;
}
