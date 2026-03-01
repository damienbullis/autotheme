export const CONFIG_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "AutoTheme Configuration",
  description: "Configuration schema for AutoTheme CSS generator",
  type: "object",
  properties: {
    $schema: {
      type: "string",
      description: "Path to the JSON schema",
    },
    version: {
      type: "number",
      const: 2,
      description: "Config version",
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
      description:
        "Theme mode: 'light' generates only light mode, 'dark' generates only dark mode under :root, 'both' generates light :root + dark .dark",
    },
    harmony: {
      type: "string",
      default: "analogous",
      description:
        "Color harmony type. Built-in: complementary, analogous, triadic, split-complementary, drift, square, rectangle, aurelian, bi-polar, retrograde. Or a custom name defined in harmonies.",
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
            description: "Array of hue offset angles (first should typically be 0)",
          },
        },
        required: ["offsets"],
        additionalProperties: false,
      },
    },
    preset: {
      type: "string",
      enum: [
        "ocean",
        "sunset",
        "forest",
        "lavender",
        "ember",
        "arctic",
        "midnight",
        "terracotta",
        "neon",
        "sage",
      ],
      description: "Built-in preset name for quick theme setup",
    },
    swing: {
      type: "number",
      default: 1,
      exclusiveMinimum: 0,
      description: "Swing multiplier for harmony angular distance (1.0 = no change)",
    },
    swingStrategy: {
      type: "string",
      enum: ["linear", "exponential", "alternating"],
      default: "linear",
      description: "Strategy for applying swing to harmony offsets",
    },
    palette: {
      type: "object",
      description: "Palette generation options",
      properties: {
        prefix: {
          type: "string",
          default: "color",
          pattern: "^[a-zA-Z][a-zA-Z0-9-]*$",
          description: "CSS variable prefix (e.g., --{prefix}-primary-500)",
        },
        contrastTarget: {
          type: "number",
          default: 7,
          minimum: 3,
          maximum: 21,
          description: "Target contrast ratio for accessible text (7 = AAA, 4.5 = AA)",
        },
        tints: {
          type: "number",
          default: 5,
          minimum: 0,
          description: "Number of tint (lighter) variations per color",
        },
        shades: {
          type: "number",
          default: 5,
          minimum: 0,
          description: "Number of shade (darker) variations per color",
        },
        tones: {
          type: "number",
          default: 4,
          minimum: 0,
          description: "Number of tone (desaturated) variations per color",
        },
        tintIncrement: {
          type: "number",
          default: 10,
          exclusiveMinimum: 0,
          description: "Lightness increase per tint step",
        },
        shadeIncrement: {
          type: "number",
          default: 10,
          exclusiveMinimum: 0,
          description: "Lightness decrease per shade step",
        },
        toneIncrement: {
          type: "number",
          default: 20,
          exclusiveMinimum: 0,
          description: "Saturation decrease per tone step",
        },
      },
      additionalProperties: false,
    },
    typography: {
      type: "object",
      description: "Typography scale options",
      properties: {
        enabled: {
          type: "boolean",
          default: true,
          description: "Generate typography scale CSS variables",
        },
        base: {
          type: "number",
          default: 1,
          exclusiveMinimum: 0,
          description: "Base font size in rem for typography scale",
        },
        ratio: {
          type: "number",
          default: 1.25,
          exclusiveMinimum: 0,
          description: "Scale factor for typography (major third)",
        },
        steps: {
          type: "number",
          default: 7,
          minimum: 1,
          description: "Total number of typography scale steps",
        },
        names: {
          type: "array",
          items: { type: "string" },
          description: "Custom names for typography scale steps (e.g., ['xs', 'sm', 'base', 'lg'])",
        },
        values: {
          type: "array",
          items: { type: "number" },
          description: "Manual typography values in rem (overrides base/ratio/steps generation)",
        },
      },
      additionalProperties: false,
    },
    spacing: {
      type: "object",
      description: "Spacing scale options",
      properties: {
        enabled: {
          type: "boolean",
          default: false,
          description: "Generate spacing scale CSS variables",
        },
        base: {
          type: "number",
          default: 0.25,
          exclusiveMinimum: 0,
          description: "Base spacing value in rem",
        },
        ratio: {
          type: "number",
          default: 2,
          exclusiveMinimum: 0,
          description: "Scale factor for spacing",
        },
        steps: {
          type: "number",
          default: 10,
          minimum: 1,
          description: "Number of spacing scale steps",
        },
        values: {
          type: "array",
          items: { type: "number" },
          description: "Manual spacing values in rem (overrides base/ratio/steps generation)",
        },
      },
      additionalProperties: false,
    },
    gradients: {
      type: "boolean",
      default: false,
      description: "Generate gradient CSS variables",
    },
    noise: {
      type: "boolean",
      default: false,
      description: "Generate noise texture CSS variable",
    },
    utilities: {
      type: "boolean",
      default: false,
      description: "Generate CSS utility classes",
    },
    shadcn: {
      type: "object",
      description: "Shadcn UI integration options",
      properties: {
        enabled: {
          type: "boolean",
          default: false,
          description: "Generate Shadcn UI compatible CSS variables",
        },
        radius: {
          type: "string",
          default: "0.625rem",
          description: "Border radius for Shadcn components",
        },
      },
      additionalProperties: false,
    },
    output: {
      type: "object",
      description: "Output options",
      properties: {
        path: {
          type: "string",
          default: "./src/autotheme.css",
          description: "Output file path for generated CSS",
        },
        tailwind: {
          type: "boolean",
          default: false,
          description: "Generate Tailwind v4 compatible CSS",
        },
        preview: {
          type: "boolean",
          default: false,
          description: "Generate HTML preview file",
        },
        darkModeScript: {
          type: "boolean",
          default: false,
          description: "Generate dark mode initialization script",
        },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

export function generateSchemaFile(): string {
  return JSON.stringify(CONFIG_SCHEMA, null, 2);
}
