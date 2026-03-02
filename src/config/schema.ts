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
    colorFormat: {
      type: "string",
      enum: ["oklch", "hsl", "rgb", "hex"],
      default: "oklch",
      description: "CSS color output format for generated variables",
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
        alphaVariants: {
          type: "boolean",
          default: false,
          description:
            "Generate alpha-transparent color variants (bg, border, glow, hover) per harmony color",
        },
        alphaSteps: {
          type: "object",
          description: "Alpha transparency percentages for each variant type",
          properties: {
            bg: {
              type: "number",
              default: 10,
              minimum: 1,
              maximum: 100,
              description: "Alpha percentage for background variant",
            },
            border: {
              type: "number",
              default: 20,
              minimum: 1,
              maximum: 100,
              description: "Alpha percentage for border variant",
            },
            glow: {
              type: "number",
              default: 15,
              minimum: 1,
              maximum: 100,
              description: "Alpha percentage for glow variant",
            },
            hover: {
              type: "number",
              default: 8,
              minimum: 1,
              maximum: 100,
              description: "Alpha percentage for hover variant",
            },
          },
          additionalProperties: false,
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
    shadows: {
      type: "object",
      description: "Shadow scale options",
      properties: {
        enabled: {
          type: "boolean",
          default: false,
          description: "Generate shadow scale CSS variables",
        },
        base: {
          type: "number",
          default: 1,
          exclusiveMinimum: 0,
          description: "Base blur value in px for shadow scale",
        },
        ratio: {
          type: "number",
          default: 2,
          exclusiveMinimum: 0,
          description: "Scale factor for shadow blur progression",
        },
        steps: {
          type: "number",
          default: 5,
          minimum: 1,
          description: "Number of shadow scale steps",
        },
        colorTint: {
          type: "number",
          default: 10,
          minimum: 0,
          maximum: 100,
          description: "Saturation percentage for shadow color tinting with primary hue",
        },
        values: {
          type: "array",
          items: { type: "string" },
          description: "Manual shadow values (overrides base/ratio/steps generation)",
        },
      },
      additionalProperties: false,
    },
    radius: {
      type: "object",
      description: "Border radius scale options",
      properties: {
        enabled: {
          type: "boolean",
          default: false,
          description: "Generate border radius scale CSS variables",
        },
        base: {
          type: "number",
          default: 0.125,
          exclusiveMinimum: 0,
          description: "Base border radius value in rem",
        },
        ratio: {
          type: "number",
          default: 2,
          exclusiveMinimum: 0,
          description: "Scale factor for border radius progression",
        },
        steps: {
          type: "number",
          default: 6,
          minimum: 1,
          description: "Number of border radius scale steps",
        },
        values: {
          type: "array",
          items: { type: "number" },
          description: "Manual radius values in rem (overrides base/ratio/steps generation)",
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
    semantics: {
      type: "object",
      description: "Semantic token layer options",
      properties: {
        enabled: {
          type: "boolean",
          default: false,
          description: "Generate semantic token CSS variables (surfaces, borders, text, accents)",
        },
        surfaceDepth: {
          type: "number",
          default: 4,
          minimum: 0,
          maximum: 100,
          description:
            "Controls surface lightness anchor (0 = pure white/black, higher = more tinted)",
        },
        textLevels: {
          type: "number",
          default: 3,
          minimum: 2,
          maximum: 6,
          description: "Number of text hierarchy levels (text-1 through text-N)",
        },
        mapping: {
          type: "object",
          description: "Map semantic accent roles to harmony color names",
          properties: {
            accent: {
              type: "string",
              default: "primary",
              description: "Which harmony color drives --accent (e.g., 'primary', 'secondary')",
            },
            accentSecondary: {
              type: "string",
              default: "secondary",
              description: "Which harmony color drives --accent-secondary",
            },
          },
          additionalProperties: false,
        },
        overrides: {
          type: "object",
          description: "Per-token color overrides (e.g., { surface: '#F5F5F5' })",
          additionalProperties: { type: "string" },
        },
        states: {
          type: "object",
          description: "Interactive state token options (hover, active, focus, disabled)",
          properties: {
            enabled: {
              type: "boolean",
              default: false,
              description: "Generate interactive state tokens for semantic colors",
            },
            hoverShift: {
              type: "number",
              default: 5,
              minimum: 1,
              maximum: 30,
              description: "Lightness shift for hover state",
            },
            activeShift: {
              type: "number",
              default: 10,
              minimum: 1,
              maximum: 30,
              description: "Lightness shift for active/pressed state",
            },
            focusRingAlpha: {
              type: "number",
              default: 50,
              minimum: 10,
              maximum: 100,
              description: "Alpha percentage for focus ring",
            },
            disabledAlpha: {
              type: "number",
              default: 40,
              minimum: 10,
              maximum: 100,
              description: "Alpha percentage for disabled state",
            },
            disabledDesat: {
              type: "number",
              default: 60,
              minimum: 0,
              maximum: 100,
              description: "Saturation reduction for disabled state",
            },
          },
          additionalProperties: false,
        },
        elevation: {
          type: "object",
          description: "Elevation system options (surface levels, shadows, borders)",
          properties: {
            enabled: {
              type: "boolean",
              default: false,
              description: "Generate elevation tokens (surfaces, shadows, borders per level)",
            },
            levels: {
              type: "number",
              default: 4,
              minimum: 3,
              maximum: 5,
              description: "Number of elevation levels to generate",
            },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
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
        comments: {
          type: "boolean",
          default: true,
          description: "Include metadata header and inline section comments in generated CSS",
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
