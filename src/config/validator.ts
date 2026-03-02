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

    for (const key of ["tints", "shades", "tones"] as const) {
      if (paletteObj[key] !== undefined) {
        if (typeof paletteObj[key] !== "number" || (paletteObj[key] as number) < 1) {
          throw new Error(`palette.${key} must be a positive integer`);
        }
        result.palette[key] = paletteObj[key] as number;
      }
    }

    for (const key of ["tintIncrement", "shadeIncrement", "toneIncrement"] as const) {
      if (paletteObj[key] !== undefined) {
        if (typeof paletteObj[key] !== "number" || (paletteObj[key] as number) <= 0) {
          throw new Error(`palette.${key} must be a positive number`);
        }
        result.palette[key] = paletteObj[key] as number;
      }
    }

    if (paletteObj.alphaVariants !== undefined) {
      if (typeof paletteObj.alphaVariants !== "boolean") {
        throw new Error("palette.alphaVariants must be a boolean");
      }
      result.palette.alphaVariants = paletteObj.alphaVariants;
    }

    if (paletteObj.alphaSteps !== undefined) {
      if (
        typeof paletteObj.alphaSteps !== "object" ||
        paletteObj.alphaSteps === null ||
        Array.isArray(paletteObj.alphaSteps)
      ) {
        throw new Error("palette.alphaSteps must be an object");
      }
      const alphaObj = paletteObj.alphaSteps as Record<string, unknown>;
      result.palette.alphaSteps = {} as Record<string, number>;
      for (const key of ["bg", "border", "glow", "hover"] as const) {
        if (alphaObj[key] !== undefined) {
          if (typeof alphaObj[key] !== "number") {
            throw new Error(`palette.alphaSteps.${key} must be a number`);
          }
          (result.palette.alphaSteps as Record<string, number>)[key] = alphaObj[key] as number;
        }
      }
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

    if (typoObj.fluid !== undefined) {
      if (typeof typoObj.fluid !== "boolean") {
        throw new Error("typography.fluid must be a boolean");
      }
      result.typography.fluid = typoObj.fluid;
    }

    if (typoObj.fluidRange !== undefined) {
      if (
        !Array.isArray(typoObj.fluidRange) ||
        typoObj.fluidRange.length !== 2 ||
        typeof typoObj.fluidRange[0] !== "number" ||
        typeof typoObj.fluidRange[1] !== "number"
      ) {
        throw new Error("typography.fluidRange must be an array of two numbers [min, max]");
      }
      result.typography.fluidRange = typoObj.fluidRange as [number, number];
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

    if (spacingObj.fluid !== undefined) {
      if (typeof spacingObj.fluid !== "boolean") {
        throw new Error("spacing.fluid must be a boolean");
      }
      result.spacing.fluid = spacingObj.fluid;
    }

    if (spacingObj.fluidRange !== undefined) {
      if (
        !Array.isArray(spacingObj.fluidRange) ||
        spacingObj.fluidRange.length !== 2 ||
        typeof spacingObj.fluidRange[0] !== "number" ||
        typeof spacingObj.fluidRange[1] !== "number"
      ) {
        throw new Error("spacing.fluidRange must be an array of two numbers [min, max]");
      }
      result.spacing.fluidRange = spacingObj.fluidRange as [number, number];
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

  // Validate mode
  if (obj.mode !== undefined) {
    if (typeof obj.mode !== "string" || !["light", "dark", "both"].includes(obj.mode)) {
      throw new Error('mode must be one of: "light", "dark", "both"');
    }
    result.mode = obj.mode as AutoThemeConfig["mode"];
  }

  // Validate semantics (nested object)
  if (obj.semantics !== undefined) {
    if (
      typeof obj.semantics !== "object" ||
      obj.semantics === null ||
      Array.isArray(obj.semantics)
    ) {
      throw new Error("semantics must be an object");
    }
    const semObj = obj.semantics as Record<string, unknown>;
    result.semantics = {};

    if (semObj.enabled !== undefined) {
      if (typeof semObj.enabled !== "boolean") {
        throw new Error("semantics.enabled must be a boolean");
      }
      result.semantics.enabled = semObj.enabled;
    }

    if (semObj.surfaceDepth !== undefined) {
      if (typeof semObj.surfaceDepth !== "number" || semObj.surfaceDepth < 1) {
        throw new Error("semantics.surfaceDepth must be a positive number");
      }
      result.semantics.surfaceDepth = semObj.surfaceDepth;
    }

    if (semObj.textLevels !== undefined) {
      if (typeof semObj.textLevels !== "number" || semObj.textLevels < 1) {
        throw new Error("semantics.textLevels must be a positive number");
      }
      result.semantics.textLevels = semObj.textLevels;
    }

    if (semObj.states !== undefined) {
      if (
        typeof semObj.states !== "object" ||
        semObj.states === null ||
        Array.isArray(semObj.states)
      ) {
        throw new Error("semantics.states must be an object");
      }
      const statesObj = semObj.states as Record<string, unknown>;
      result.semantics.states = {} as Record<string, unknown>;
      if (statesObj.enabled !== undefined) {
        if (typeof statesObj.enabled !== "boolean") {
          throw new Error("semantics.states.enabled must be a boolean");
        }
        (result.semantics.states as Record<string, unknown>).enabled = statesObj.enabled;
      }
      for (const key of [
        "hoverShift",
        "activeShift",
        "focusRingAlpha",
        "disabledAlpha",
        "disabledDesat",
      ] as const) {
        if (statesObj[key] !== undefined) {
          if (typeof statesObj[key] !== "number") {
            throw new Error(`semantics.states.${key} must be a number`);
          }
          (result.semantics.states as Record<string, unknown>)[key] = statesObj[key] as number;
        }
      }
    }

    if (semObj.accessibility !== undefined) {
      if (
        typeof semObj.accessibility !== "object" ||
        semObj.accessibility === null ||
        Array.isArray(semObj.accessibility)
      ) {
        throw new Error("semantics.accessibility must be an object");
      }
      const a11yObj = semObj.accessibility as Record<string, unknown>;
      result.semantics.accessibility = {} as Record<string, unknown>;
      for (const key of ["contrastAdaptive", "reducedTransparency", "forcedColors"] as const) {
        if (a11yObj[key] !== undefined) {
          if (typeof a11yObj[key] !== "boolean") {
            throw new Error(`semantics.accessibility.${key} must be a boolean`);
          }
          (result.semantics.accessibility as Record<string, unknown>)[key] = a11yObj[
            key
          ] as boolean;
        }
      }
      if (a11yObj.contrastAlgorithm !== undefined) {
        if (
          typeof a11yObj.contrastAlgorithm !== "string" ||
          !["wcag2", "apca"].includes(a11yObj.contrastAlgorithm)
        ) {
          throw new Error('semantics.accessibility.contrastAlgorithm must be "wcag2" or "apca"');
        }
        (result.semantics.accessibility as Record<string, unknown>).contrastAlgorithm =
          a11yObj.contrastAlgorithm;
      }
    }

    if (semObj.temperature !== undefined) {
      if (
        typeof semObj.temperature !== "number" ||
        semObj.temperature < -1 ||
        semObj.temperature > 1
      ) {
        throw new Error("semantics.temperature must be a number between -1 and 1");
      }
      result.semantics.temperature = semObj.temperature;
    }

    if (semObj.elevation !== undefined) {
      if (
        typeof semObj.elevation !== "object" ||
        semObj.elevation === null ||
        Array.isArray(semObj.elevation)
      ) {
        throw new Error("semantics.elevation must be an object");
      }
      const elevObj = semObj.elevation as Record<string, unknown>;
      result.semantics.elevation = {} as Record<string, unknown>;
      if (elevObj.enabled !== undefined) {
        if (typeof elevObj.enabled !== "boolean") {
          throw new Error("semantics.elevation.enabled must be a boolean");
        }
        (result.semantics.elevation as Record<string, unknown>).enabled = elevObj.enabled;
      }
      if (elevObj.levels !== undefined) {
        if (typeof elevObj.levels !== "number" || elevObj.levels < 1) {
          throw new Error("semantics.elevation.levels must be a positive number");
        }
        (result.semantics.elevation as Record<string, unknown>).levels = elevObj.levels;
      }
    }
  }

  // Validate motion (nested object)
  if (obj.motion !== undefined) {
    if (typeof obj.motion !== "object" || obj.motion === null || Array.isArray(obj.motion)) {
      throw new Error("motion must be an object");
    }
    const motionObj = obj.motion as Record<string, unknown>;
    result.motion = {};

    if (motionObj.enabled !== undefined) {
      if (typeof motionObj.enabled !== "boolean") {
        throw new Error("motion.enabled must be a boolean");
      }
      result.motion.enabled = motionObj.enabled;
    }

    if (motionObj.reducedMotion !== undefined) {
      if (typeof motionObj.reducedMotion !== "boolean") {
        throw new Error("motion.reducedMotion must be a boolean");
      }
      result.motion.reducedMotion = motionObj.reducedMotion;
    }

    if (motionObj.spring !== undefined) {
      if (
        typeof motionObj.spring !== "object" ||
        motionObj.spring === null ||
        Array.isArray(motionObj.spring)
      ) {
        throw new Error("motion.spring must be an object");
      }
      const springObj = motionObj.spring as Record<string, unknown>;
      result.motion.spring = {} as Record<string, number>;
      for (const key of ["stiffness", "damping", "mass"] as const) {
        if (springObj[key] !== undefined) {
          if (typeof springObj[key] !== "number" || (springObj[key] as number) <= 0) {
            throw new Error(`motion.spring.${key} must be a positive number`);
          }
          (result.motion.spring as Record<string, number>)[key] = springObj[key] as number;
        }
      }
    }

    if (motionObj.durations !== undefined) {
      if (
        typeof motionObj.durations !== "object" ||
        motionObj.durations === null ||
        Array.isArray(motionObj.durations)
      ) {
        throw new Error("motion.durations must be an object");
      }
      const durObj = motionObj.durations as Record<string, unknown>;
      result.motion.durations = {} as Record<string, number>;
      for (const key of ["base", "ratio"] as const) {
        if (durObj[key] !== undefined) {
          if (typeof durObj[key] !== "number" || (durObj[key] as number) <= 0) {
            throw new Error(`motion.durations.${key} must be a positive number`);
          }
          (result.motion.durations as Record<string, number>)[key] = durObj[key] as number;
        }
      }
      if (durObj.steps !== undefined) {
        if (typeof durObj.steps !== "number" || durObj.steps < 1) {
          throw new Error("motion.durations.steps must be at least 1");
        }
        (result.motion.durations as Record<string, number>).steps = durObj.steps;
      }
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

    for (const key of [
      "tailwind",
      "preview",
      "darkModeScript",
      "layers",
      "reactive",
      "lightDark",
      "registered",
      "p3",
    ] as const) {
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
