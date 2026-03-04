const booleanOrObject = (objectProps: Record<string, unknown>) => ({
  oneOf: [
    { type: "boolean" },
    { type: "object", properties: objectProps, additionalProperties: false },
  ],
});

export const CONFIG_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "AutoTheme Configuration",
  description: "Configuration schema for AutoTheme v2 CSS generator",
  type: "object",
  properties: {
    $schema: {
      type: "string",
      description: "Path to the JSON schema",
    },
    color: {
      type: "string",
      description: "Primary color in hex, rgb, or hsl format",
      examples: ["#6439FF", "rgb(100, 57, 255)", "hsl(255, 100%, 61%)"],
    },
    mode: {
      type: "string",
      enum: ["light", "dark", "both"],
      default: "both",
      description: "Theme mode",
    },
    harmony: {
      type: "string",
      default: "analogous",
      description: "Color harmony type",
    },
    harmonies: {
      type: "object",
      description: "Named custom harmony definitions with explicit hue offsets",
      additionalProperties: {
        type: "object",
        properties: {
          offsets: {
            type: "array",
            items: { type: "number" },
            minItems: 2,
          },
        },
        required: ["offsets"],
        additionalProperties: false,
      },
    },
    angles: {
      type: "array",
      items: { type: "number" },
      minItems: 2,
      description: "Custom harmony angles (used with harmony: 'custom')",
    },
    preset: {
      type: "string",
      description: "Built-in preset name",
    },
    palette: booleanOrObject({
      prefix: { type: "string", default: "color", pattern: "^[a-zA-Z][a-zA-Z0-9-]*$" },
      chromaBalance: { type: "boolean", default: true },
      contrastTarget: { type: "number", default: 7, minimum: 3, maximum: 21 },
      tints: { type: "number", default: 5, minimum: 0 },
      shades: { type: "number", default: 5, minimum: 0 },
      tones: { type: "number", default: 4, minimum: 0 },
      tintIncrement: { type: "number", default: 10, exclusiveMinimum: 0 },
      shadeIncrement: { type: "number", default: 10, exclusiveMinimum: 0 },
      toneIncrement: { type: "number", default: 20, exclusiveMinimum: 0 },
      swing: { type: "number", default: 1, exclusiveMinimum: 0 },
      swingStrategy: {
        type: "string",
        enum: ["linear", "exponential", "alternating"],
        default: "linear",
      },
      alphaVariants: { type: "boolean", default: false },
      alphaSteps: {
        type: "object",
        properties: {
          bg: { type: "number", default: 10 },
          border: { type: "number", default: 20 },
          glow: { type: "number", default: 15 },
          hover: { type: "number", default: 8 },
        },
        additionalProperties: false,
      },
    }),
    semantics: booleanOrObject({
      depth: { type: "number", minimum: 0, maximum: 1 },
      text: {
        type: "object",
        properties: {
          levels: { type: "number", default: 3, minimum: 1 },
          anchor: { type: "number" },
          floor: { type: "number" },
          curve: { type: "number", default: 1, exclusiveMinimum: 0 },
          chroma: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 },
        },
        additionalProperties: false,
      },
      surfaces: {
        type: "object",
        properties: {
          chroma: { type: "number", default: 0.01 },
          sunkenDelta: { type: "number", default: -0.02 },
        },
        additionalProperties: false,
      },
      borders: {
        type: "object",
        properties: {
          offsets: { type: "array", items: { type: "number" }, minItems: 3, maxItems: 3 },
          chroma: { type: "number", default: 0.012 },
        },
        additionalProperties: false,
      },
      mapping: {
        type: "object",
        properties: {
          accent: { type: "string", default: "primary" },
          secondary: { type: "string", default: "secondary" },
          tertiary: { type: "string", default: "tertiary" },
        },
        additionalProperties: false,
      },
      overrides: { type: "object", additionalProperties: { type: "string" } },
    }),
    states: booleanOrObject({
      hover: { type: "number", default: 0.04 },
      active: { type: "number", default: -0.02 },
      focus: {
        type: "object",
        properties: {
          color: { type: "string" },
          width: { type: "string" },
          offset: { type: "string" },
        },
        additionalProperties: false,
      },
      disabled: {
        type: "object",
        properties: {
          opacity: { type: "number" },
        },
        additionalProperties: false,
      },
    }),
    elevation: booleanOrObject({
      levels: { type: "number", default: 4, minimum: 1 },
      delta: { type: "number", default: 0.03, exclusiveMinimum: 0 },
      tintShadows: { type: "boolean", default: true },
    }),
    typography: booleanOrObject({
      base: { type: "number", default: 1, exclusiveMinimum: 0 },
      ratio: { type: "number", default: 1.25, exclusiveMinimum: 0 },
      steps: { type: "number", default: 7, minimum: 1 },
      names: { type: "array", items: { type: "string" } },
      values: { type: "array", items: { type: "number" } },
      fluid: { type: "boolean", default: false },
      fluidRange: {
        type: "array",
        items: { type: "number" },
        minItems: 2,
        maxItems: 2,
        default: [320, 1280],
      },
    }),
    spacing: booleanOrObject({
      base: { type: "number", default: 0.25, exclusiveMinimum: 0 },
      ratio: { type: "number", default: 2, exclusiveMinimum: 0 },
      steps: { type: "number", default: 10, minimum: 1 },
      values: { type: "array", items: { type: "number" } },
      fluid: { type: "boolean", default: false },
      fluidRange: {
        type: "array",
        items: { type: "number" },
        minItems: 2,
        maxItems: 2,
        default: [320, 1280],
      },
    }),
    shadows: booleanOrObject({
      base: { type: "number", default: 1, exclusiveMinimum: 0 },
      ratio: { type: "number", default: 2, exclusiveMinimum: 0 },
      steps: { type: "number", default: 5, minimum: 1 },
      colorTint: { type: "number", default: 10, minimum: 0, maximum: 100 },
      values: { type: "array", items: { type: "string" } },
    }),
    radius: booleanOrObject({
      base: { type: "number", default: 0.125, exclusiveMinimum: 0 },
      ratio: { type: "number", default: 2, exclusiveMinimum: 0 },
      steps: { type: "number", default: 6, minimum: 1 },
      values: { type: "array", items: { type: "number" } },
    }),
    motion: booleanOrObject({
      spring: {
        type: "object",
        properties: {
          stiffness: { type: "number", default: 100, exclusiveMinimum: 0 },
          damping: { type: "number", default: 15, exclusiveMinimum: 0 },
          mass: { type: "number", default: 1, exclusiveMinimum: 0 },
        },
        additionalProperties: false,
      },
      durations: {
        type: "object",
        properties: {
          base: { type: "number", default: 100, exclusiveMinimum: 0 },
          ratio: { type: "number", default: 1.5, exclusiveMinimum: 0 },
          steps: { type: "number", default: 5, minimum: 1 },
        },
        additionalProperties: false,
      },
      reducedMotion: { type: "boolean", default: true },
    }),
    gradients: { type: "boolean", default: false },
    noise: { type: "boolean", default: false },
    utilities: { type: "boolean", default: false },
    effects: booleanOrObject({
      filters: booleanOrObject({
        grain: booleanOrObject({
          frequency: { type: "number", default: 0.65, exclusiveMinimum: 0 },
          octaves: { type: "number", default: 3, minimum: 1 },
          opacity: { type: "number", default: 0.08, minimum: 0, maximum: 1 },
        }),
        glow: booleanOrObject({
          color: { type: "string", default: "primary" },
          blur: { type: "number", default: 20, exclusiveMinimum: 0 },
          intensity: { type: "number", default: 0.6, minimum: 0, maximum: 1 },
        }),
        duotone: booleanOrObject({
          shadow: { type: "string", default: "primary" },
          highlight: { type: "string", default: "secondary" },
        }),
      }),
      blendModes: booleanOrObject({
        modes: {
          type: "array",
          items: { type: "string" },
          default: ["multiply", "screen", "overlay", "soft-light"],
        },
      }),
      glass: booleanOrObject({
        blur: { type: "number", default: 12, exclusiveMinimum: 0 },
        opacity: { type: "number", default: 0.15, minimum: 0, maximum: 1 },
        saturation: { type: "number", default: 1.8, exclusiveMinimum: 0 },
        colors: { type: "array", items: { type: "string" }, default: ["primary", "secondary"] },
      }),
      blobs: booleanOrObject({
        count: { type: "number", default: 3, minimum: 1 },
        points: { type: "number", default: 6, minimum: 3 },
        randomness: { type: "number", default: 0.4, minimum: 0, maximum: 1 },
        seed: { type: "number", default: 0 },
        size: { type: "number", default: 400, exclusiveMinimum: 0 },
      }),
      stack: booleanOrObject({
        layers: { type: "number", default: 5, minimum: 1 },
      }),
    }),
    shadcn: booleanOrObject({
      radius: { type: "string", default: "0.625rem" },
    }),
    output: {
      type: "object",
      properties: {
        path: { type: "string", default: "./src/autotheme.css" },
        format: { type: "string", enum: ["oklch", "hsl", "rgb", "hex"], default: "oklch" },
        tailwind: { type: "boolean", default: false },
        preview: { type: "boolean", default: false },
        comments: { type: "boolean", default: true },
        layers: { type: "boolean", default: true },
        lightDark: { type: "boolean" },
        contrastMedia: { type: "boolean", default: false },
        reducedTransparency: { type: "boolean", default: false },
        forcedColors: { type: "boolean", default: false },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

export function generateSchemaFile(): string {
  return JSON.stringify(CONFIG_SCHEMA, null, 2);
}
