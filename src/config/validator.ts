import type { AutoThemeConfig } from "./types";
import { Color } from "../core/color";

const VALID_HARMONIES = [
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
] as const;

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

  // Validate harmony
  if (obj.harmony !== undefined) {
    if (
      typeof obj.harmony !== "string" ||
      !VALID_HARMONIES.includes(obj.harmony as (typeof VALID_HARMONIES)[number])
    ) {
      throw new Error(
        `Invalid harmony: ${obj.harmony}. Must be one of: ${VALID_HARMONIES.join(", ")}`,
      );
    }
    result.harmony = obj.harmony as AutoThemeConfig["harmony"];
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
