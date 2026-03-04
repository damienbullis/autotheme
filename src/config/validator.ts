import type { AutoThemeConfig, DeepPartial } from "./types";
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
  "monochromatic",
  "double-split-complementary",
  "custom",
] as const;

const VALID_SWING_STRATEGIES = ["linear", "exponential", "alternating"] as const;

/**
 * Validate a `boolean | object` field.
 * Returns the validated value or throws.
 */
function validateBooleanOrObject(
  value: unknown,
  name: string,
  objectValidator?: (obj: Record<string, unknown>) => Record<string, unknown>,
): boolean | Record<string, unknown> | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "boolean") return value;
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return objectValidator
      ? objectValidator(value as Record<string, unknown>)
      : (value as Record<string, unknown>);
  }
  throw new Error(`${name} must be a boolean or an object`);
}

function validatePositiveNumber(value: unknown, name: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || value <= 0) {
    throw new Error(`${name} must be a positive number`);
  }
  return value;
}

function validatePositiveInt(value: unknown, name: string): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || value < 1) {
    throw new Error(`${name} must be at least 1`);
  }
  return value;
}

function validateBoolean(value: unknown, name: string): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") {
    throw new Error(`${name} must be a boolean`);
  }
  return value;
}

function validateString(value: unknown, name: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") {
    throw new Error(`${name} must be a string`);
  }
  return value;
}

function validatePaletteObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (obj.prefix !== undefined) {
    if (typeof obj.prefix !== "string") throw new Error("palette.prefix must be a string");
    if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(obj.prefix)) {
      throw new Error(
        "palette.prefix must start with a letter and contain only letters, numbers, and hyphens",
      );
    }
    result.prefix = obj.prefix;
  }
  const numFields = [
    "contrastTarget",
    "tints",
    "shades",
    "tones",
    "tintIncrement",
    "shadeIncrement",
    "toneIncrement",
    "swing",
  ] as const;
  for (const key of numFields) {
    if (obj[key] !== undefined) {
      if (typeof obj[key] !== "number" || (obj[key] as number) <= 0) {
        throw new Error(`palette.${key} must be a positive number`);
      }
      result[key] = obj[key];
    }
  }
  if (obj.chromaBalance !== undefined)
    result.chromaBalance = validateBoolean(obj.chromaBalance, "palette.chromaBalance");
  if (obj.alphaVariants !== undefined)
    result.alphaVariants = validateBoolean(obj.alphaVariants, "palette.alphaVariants");
  if (obj.swingStrategy !== undefined) {
    if (
      typeof obj.swingStrategy !== "string" ||
      !VALID_SWING_STRATEGIES.includes(obj.swingStrategy as (typeof VALID_SWING_STRATEGIES)[number])
    ) {
      throw new Error(`palette.swingStrategy must be one of: ${VALID_SWING_STRATEGIES.join(", ")}`);
    }
    result.swingStrategy = obj.swingStrategy;
  }
  if (obj.alphaSteps !== undefined) {
    if (
      typeof obj.alphaSteps !== "object" ||
      obj.alphaSteps === null ||
      Array.isArray(obj.alphaSteps)
    ) {
      throw new Error("palette.alphaSteps must be an object");
    }
    const a = obj.alphaSteps as Record<string, unknown>;
    const alphaResult: Record<string, number> = {};
    for (const key of ["bg", "border", "glow", "hover"] as const) {
      if (a[key] !== undefined) {
        if (typeof a[key] !== "number")
          throw new Error(`palette.alphaSteps.${key} must be a number`);
        alphaResult[key] = a[key] as number;
      }
    }
    result.alphaSteps = alphaResult;
  }
  return result;
}

function validateSemanticsObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (obj.depth !== undefined) {
    if (typeof obj.depth !== "number" || obj.depth < 0 || obj.depth > 1) {
      throw new Error("semantics.depth must be between 0 and 1");
    }
    result.depth = obj.depth;
  }
  if (obj.text !== undefined) {
    if (typeof obj.text !== "object" || obj.text === null || Array.isArray(obj.text)) {
      throw new Error("semantics.text must be an object");
    }
    const t = obj.text as Record<string, unknown>;
    const textResult: Record<string, unknown> = {};
    if (t.levels !== undefined)
      textResult.levels = validatePositiveInt(t.levels, "semantics.text.levels");
    if (t.anchor !== undefined) {
      if (typeof t.anchor !== "number") throw new Error("semantics.text.anchor must be a number");
      textResult.anchor = t.anchor;
    }
    if (t.floor !== undefined) {
      if (typeof t.floor !== "number") throw new Error("semantics.text.floor must be a number");
      textResult.floor = t.floor;
    }
    if (t.curve !== undefined)
      textResult.curve = validatePositiveNumber(t.curve, "semantics.text.curve");
    if (t.chroma !== undefined) {
      if (
        !Array.isArray(t.chroma) ||
        t.chroma.length !== 2 ||
        typeof t.chroma[0] !== "number" ||
        typeof t.chroma[1] !== "number"
      ) {
        throw new Error("semantics.text.chroma must be [number, number]");
      }
      textResult.chroma = t.chroma;
    }
    result.text = textResult;
  }
  if (obj.surfaces !== undefined) {
    if (typeof obj.surfaces !== "object" || obj.surfaces === null || Array.isArray(obj.surfaces)) {
      throw new Error("semantics.surfaces must be an object");
    }
    const s = obj.surfaces as Record<string, unknown>;
    const surfResult: Record<string, unknown> = {};
    if (s.chroma !== undefined) {
      if (typeof s.chroma !== "number")
        throw new Error("semantics.surfaces.chroma must be a number");
      surfResult.chroma = s.chroma;
    }
    if (s.sunkenDelta !== undefined) {
      if (typeof s.sunkenDelta !== "number")
        throw new Error("semantics.surfaces.sunkenDelta must be a number");
      surfResult.sunkenDelta = s.sunkenDelta;
    }
    result.surfaces = surfResult;
  }
  if (obj.borders !== undefined) {
    if (typeof obj.borders !== "object" || obj.borders === null || Array.isArray(obj.borders)) {
      throw new Error("semantics.borders must be an object");
    }
    const b = obj.borders as Record<string, unknown>;
    const borderResult: Record<string, unknown> = {};
    if (b.offsets !== undefined) {
      if (
        !Array.isArray(b.offsets) ||
        b.offsets.length !== 3 ||
        !b.offsets.every((v: unknown) => typeof v === "number")
      ) {
        throw new Error("semantics.borders.offsets must be [number, number, number]");
      }
      borderResult.offsets = b.offsets;
    }
    if (b.chroma !== undefined) {
      if (typeof b.chroma !== "number")
        throw new Error("semantics.borders.chroma must be a number");
      borderResult.chroma = b.chroma;
    }
    result.borders = borderResult;
  }
  if (obj.mapping !== undefined) {
    if (typeof obj.mapping !== "object" || obj.mapping === null || Array.isArray(obj.mapping)) {
      throw new Error("semantics.mapping must be an object");
    }
    const m = obj.mapping as Record<string, unknown>;
    const mapResult: Record<string, unknown> = {};
    for (const key of ["accent", "secondary", "tertiary"] as const) {
      if (m[key] !== undefined) {
        if (typeof m[key] !== "string")
          throw new Error(`semantics.mapping.${key} must be a string`);
        mapResult[key] = m[key];
      }
    }
    result.mapping = mapResult;
  }
  if (obj.overrides !== undefined) {
    if (
      typeof obj.overrides !== "object" ||
      obj.overrides === null ||
      Array.isArray(obj.overrides)
    ) {
      throw new Error("semantics.overrides must be an object");
    }
    result.overrides = obj.overrides;
  }
  return result;
}

function validateScaleObject(
  obj: Record<string, unknown>,
  prefix: string,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (obj.base !== undefined) result.base = validatePositiveNumber(obj.base, `${prefix}.base`);
  if (obj.ratio !== undefined) result.ratio = validatePositiveNumber(obj.ratio, `${prefix}.ratio`);
  if (obj.steps !== undefined) result.steps = validatePositiveInt(obj.steps, `${prefix}.steps`);
  if (obj.fluid !== undefined) result.fluid = validateBoolean(obj.fluid, `${prefix}.fluid`);
  if (obj.fluidRange !== undefined) {
    if (
      !Array.isArray(obj.fluidRange) ||
      obj.fluidRange.length !== 2 ||
      typeof obj.fluidRange[0] !== "number" ||
      typeof obj.fluidRange[1] !== "number"
    ) {
      throw new Error(`${prefix}.fluidRange must be [number, number]`);
    }
    result.fluidRange = obj.fluidRange;
  }
  if (obj.names !== undefined) result.names = obj.names;
  if (obj.values !== undefined) result.values = obj.values;
  if (obj.colorTint !== undefined) {
    if (typeof obj.colorTint !== "number") throw new Error(`${prefix}.colorTint must be a number`);
    result.colorTint = obj.colorTint;
  }
  return result;
}

function validateNumberRange(
  value: unknown,
  name: string,
  min?: number,
  max?: number,
): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number") throw new Error(`${name} must be a number`);
  if (min !== undefined && value < min) throw new Error(`${name} must be >= ${min}`);
  if (max !== undefined && value > max) throw new Error(`${name} must be <= ${max}`);
  return value;
}

function validateEffectsObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  if (obj.filters !== undefined) {
    const v = validateBooleanOrObject(obj.filters, "effects.filters", (o) => {
      const r: Record<string, unknown> = {};
      if (o.grain !== undefined) {
        const gv = validateBooleanOrObject(o.grain, "effects.filters.grain", (g) => {
          const gr: Record<string, unknown> = {};
          gr.frequency = validateNumberRange(g.frequency, "effects.filters.grain.frequency", 0);
          gr.octaves = validateNumberRange(g.octaves, "effects.filters.grain.octaves", 1);
          gr.opacity = validateNumberRange(g.opacity, "effects.filters.grain.opacity", 0, 1);
          return Object.fromEntries(Object.entries(gr).filter(([, v]) => v !== undefined));
        });
        r.grain = gv;
      }
      if (o.glow !== undefined) {
        const gv = validateBooleanOrObject(o.glow, "effects.filters.glow", (g) => {
          const gr: Record<string, unknown> = {};
          if (g.color !== undefined)
            gr.color = validateString(g.color, "effects.filters.glow.color");
          gr.blur = validateNumberRange(g.blur, "effects.filters.glow.blur", 0);
          gr.intensity = validateNumberRange(g.intensity, "effects.filters.glow.intensity", 0, 1);
          return Object.fromEntries(Object.entries(gr).filter(([, v]) => v !== undefined));
        });
        r.glow = gv;
      }
      if (o.duotone !== undefined) {
        const dv = validateBooleanOrObject(o.duotone, "effects.filters.duotone", (d) => {
          const dr: Record<string, unknown> = {};
          if (d.shadow !== undefined)
            dr.shadow = validateString(d.shadow, "effects.filters.duotone.shadow");
          if (d.highlight !== undefined)
            dr.highlight = validateString(d.highlight, "effects.filters.duotone.highlight");
          return dr;
        });
        r.duotone = dv;
      }
      return r;
    });
    result.filters = v;
  }

  if (obj.blendModes !== undefined) {
    const v = validateBooleanOrObject(obj.blendModes, "effects.blendModes", (o) => {
      const r: Record<string, unknown> = {};
      if (o.modes !== undefined) {
        if (!Array.isArray(o.modes)) throw new Error("effects.blendModes.modes must be an array");
        r.modes = o.modes;
      }
      return r;
    });
    result.blendModes = v;
  }

  if (obj.glass !== undefined) {
    const v = validateBooleanOrObject(obj.glass, "effects.glass", (o) => {
      const r: Record<string, unknown> = {};
      r.blur = validateNumberRange(o.blur, "effects.glass.blur", 0);
      r.opacity = validateNumberRange(o.opacity, "effects.glass.opacity", 0, 1);
      r.saturation = validateNumberRange(o.saturation, "effects.glass.saturation", 0);
      if (o.colors !== undefined) {
        if (!Array.isArray(o.colors)) throw new Error("effects.glass.colors must be an array");
        r.colors = o.colors;
      }
      return Object.fromEntries(Object.entries(r).filter(([, v]) => v !== undefined));
    });
    result.glass = v;
  }

  if (obj.blobs !== undefined) {
    const v = validateBooleanOrObject(obj.blobs, "effects.blobs", (o) => {
      const r: Record<string, unknown> = {};
      r.count = validateNumberRange(o.count, "effects.blobs.count", 1);
      r.points = validateNumberRange(o.points, "effects.blobs.points", 3);
      r.randomness = validateNumberRange(o.randomness, "effects.blobs.randomness", 0, 1);
      if (o.seed !== undefined) {
        if (typeof o.seed !== "number") throw new Error("effects.blobs.seed must be a number");
        r.seed = o.seed;
      }
      r.size = validateNumberRange(o.size, "effects.blobs.size", 0);
      return Object.fromEntries(Object.entries(r).filter(([, v]) => v !== undefined));
    });
    result.blobs = v;
  }

  if (obj.stack !== undefined) {
    const v = validateBooleanOrObject(obj.stack, "effects.stack", (o) => {
      const r: Record<string, unknown> = {};
      r.layers = validateNumberRange(o.layers, "effects.stack.layers", 1);
      return Object.fromEntries(Object.entries(r).filter(([, v]) => v !== undefined));
    });
    result.stack = v;
  }

  return result;
}

export function validateConfig(config: unknown): DeepPartial<AutoThemeConfig> {
  if (typeof config !== "object" || config === null) {
    throw new Error("Config must be an object");
  }

  const result: DeepPartial<AutoThemeConfig> = {};
  const obj = config as Record<string, unknown>;

  // Validate color
  if (obj.color !== undefined) {
    if (typeof obj.color !== "string") throw new Error("color must be a string");
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
    if (typeof obj.harmony !== "string")
      throw new Error(`Invalid harmony: ${obj.harmony}. Must be a string.`);
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

  // Validate angles
  if (obj.angles !== undefined) {
    if (!Array.isArray(obj.angles)) {
      throw new Error("angles must be an array of numbers");
    }
    if (obj.angles.length < 2) {
      throw new Error("angles must have at least 2 values");
    }
    for (let i = 0; i < obj.angles.length; i++) {
      if (typeof obj.angles[i] !== "number") {
        throw new Error(`angles[${i}] must be a number`);
      }
    }
    result.angles = obj.angles as number[];
  }

  // Validate preset
  if (obj.preset !== undefined) {
    const preset = validateString(obj.preset, "preset");
    if (preset !== undefined) result.preset = preset;
  }

  // Validate mode
  if (obj.mode !== undefined) {
    if (typeof obj.mode !== "string" || !["light", "dark", "both"].includes(obj.mode)) {
      throw new Error('mode must be one of: "light", "dark", "both"');
    }
    result.mode = obj.mode as AutoThemeConfig["mode"];
  }

  // Validate features with boolean | Config pattern
  const featureValidators: Record<
    string,
    (obj: Record<string, unknown>) => Record<string, unknown>
  > = {
    palette: validatePaletteObject,
    semantics: validateSemanticsObject,
    typography: (o) => validateScaleObject(o, "typography"),
    spacing: (o) => validateScaleObject(o, "spacing"),
    shadows: (o) => validateScaleObject(o, "shadows"),
    radius: (o) => validateScaleObject(o, "radius"),
  };

  for (const [key, validator] of Object.entries(featureValidators)) {
    if (obj[key] !== undefined) {
      const validated = validateBooleanOrObject(obj[key], key, validator);
      if (validated !== undefined) {
        (result as Record<string, unknown>)[key] = validated;
      }
    }
  }

  // States
  if (obj.states !== undefined) {
    const v = validateBooleanOrObject(obj.states, "states", (o) => {
      const r: Record<string, unknown> = {};
      if (o.hover !== undefined) {
        if (typeof o.hover !== "number") throw new Error("states.hover must be a number");
        r.hover = o.hover;
      }
      if (o.active !== undefined) {
        if (typeof o.active !== "number") throw new Error("states.active must be a number");
        r.active = o.active;
      }
      if (o.focus !== undefined) r.focus = o.focus;
      if (o.disabled !== undefined) r.disabled = o.disabled;
      return r;
    });
    if (v !== undefined) result.states = v as AutoThemeConfig["states"];
  }

  // Elevation
  if (obj.elevation !== undefined) {
    const v = validateBooleanOrObject(obj.elevation, "elevation", (o) => {
      const r: Record<string, unknown> = {};
      if (o.levels !== undefined) r.levels = validatePositiveInt(o.levels, "elevation.levels");
      if (o.delta !== undefined) r.delta = validatePositiveNumber(o.delta, "elevation.delta");
      if (o.tintShadows !== undefined)
        r.tintShadows = validateBoolean(o.tintShadows, "elevation.tintShadows");
      return r;
    });
    if (v !== undefined) result.elevation = v as AutoThemeConfig["elevation"];
  }

  // Motion
  if (obj.motion !== undefined) {
    const v = validateBooleanOrObject(obj.motion, "motion");
    if (v !== undefined) result.motion = v as AutoThemeConfig["motion"];
  }

  // Shadcn
  if (obj.shadcn !== undefined) {
    const v = validateBooleanOrObject(obj.shadcn, "shadcn", (o) => {
      const r: Record<string, unknown> = {};
      if (o.radius !== undefined) r.radius = validateString(o.radius, "shadcn.radius");
      return r;
    });
    if (v !== undefined) result.shadcn = v as AutoThemeConfig["shadcn"];
  }

  // Patterns
  if (obj.patterns !== undefined) {
    const v = validateBooleanOrObject(obj.patterns, "patterns", (o) => {
      const r: Record<string, unknown> = {};
      if (o.types !== undefined) {
        if (!Array.isArray(o.types)) throw new Error("patterns.types must be an array");
        const validTypes = [
          "stripes-diagonal",
          "stripes-horizontal",
          "stripes-vertical",
          "dots",
          "crosshatch",
        ];
        for (const t of o.types) {
          if (!validTypes.includes(t as string)) {
            throw new Error(`patterns.types must contain only: ${validTypes.join(", ")}`);
          }
        }
        r.types = o.types;
      }
      if (o.density !== undefined) {
        if (!["sm", "md", "lg"].includes(o.density as string)) {
          throw new Error('patterns.density must be "sm", "md", or "lg"');
        }
        r.density = o.density;
      }
      return r;
    });
    if (v !== undefined) result.patterns = v as AutoThemeConfig["patterns"];
  }

  // Effects
  if (obj.effects !== undefined) {
    const v = validateBooleanOrObject(obj.effects, "effects", validateEffectsObject);
    if (v !== undefined) (result as Record<string, unknown>).effects = v;
  }

  // Simple boolean toggles
  for (const key of ["gradients", "noise", "utilities"] as const) {
    if (obj[key] !== undefined) {
      result[key] = validateBoolean(obj[key], key) as boolean;
    }
  }

  // Output
  if (obj.output !== undefined) {
    if (typeof obj.output !== "object" || obj.output === null || Array.isArray(obj.output)) {
      throw new Error("output must be an object");
    }
    const outputObj = obj.output as Record<string, unknown>;
    const outputResult: Record<string, unknown> = {};
    if (outputObj.path !== undefined)
      outputResult.path = validateString(outputObj.path, "output.path");
    if (outputObj.format !== undefined) {
      if (
        typeof outputObj.format !== "string" ||
        !["oklch", "hsl", "rgb", "hex"].includes(outputObj.format)
      ) {
        throw new Error('output.format must be one of: "oklch", "hsl", "rgb", "hex"');
      }
      outputResult.format = outputObj.format;
    }
    for (const key of [
      "tailwind",
      "preview",
      "comments",
      "layers",
      "lightDark",
      "contrastMedia",
      "reducedTransparency",
      "forcedColors",
    ] as const) {
      if (outputObj[key] !== undefined) {
        outputResult[key] = validateBoolean(outputObj[key], `output.${key}`);
      }
    }
    result.output = outputResult as DeepPartial<AutoThemeConfig["output"]>;
  }

  return result;
}
