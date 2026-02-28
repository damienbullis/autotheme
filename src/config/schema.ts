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
    color: {
      type: "string",
      description: "Primary color in hex, rgb, or hsl format",
      examples: ["#6439FF", "rgb(100, 57, 255)", "hsl(255, 100%, 61%)"],
    },
    harmony: {
      type: "string",
      enum: [
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
      ],
      default: "analogous",
      description: "Color harmony type",
    },
    output: {
      type: "string",
      default: "./src/autotheme.css",
      description: "Output file path for generated CSS",
    },
    preview: {
      type: "boolean",
      default: false,
      description: "Generate HTML preview file",
    },
    tailwind: {
      type: "boolean",
      default: false,
      description: "Generate Tailwind v4 compatible CSS",
    },
    darkModeScript: {
      type: "boolean",
      default: false,
      description: "Generate dark mode initialization script",
    },
    scalar: {
      type: "number",
      default: 1.618,
      description: "Scale factor for spacing and typography (golden ratio)",
    },
    contrastTarget: {
      type: "number",
      default: 7,
      minimum: 3,
      maximum: 21,
      description: "Target contrast ratio for accessible text (7 = AAA, 4.5 = AA)",
    },
    radius: {
      type: "string",
      default: "0.625rem",
      description: "Border radius for Shadcn components",
    },
    prefix: {
      type: "string",
      default: "color",
      pattern: "^[a-zA-Z][a-zA-Z0-9-]*$",
      description: "CSS variable prefix (e.g., --{prefix}-primary-500)",
    },
    fontSize: {
      type: "number",
      default: 1,
      exclusiveMinimum: 0,
      description: "Base font size in rem for typography scale",
    },
    gradients: {
      type: "boolean",
      default: true,
      description: "Generate gradient CSS variables",
    },
    spacing: {
      type: "boolean",
      default: true,
      description: "Generate spacing scale CSS variables",
    },
    noise: {
      type: "boolean",
      default: true,
      description: "Generate noise texture CSS variable",
    },
    shadcn: {
      type: "boolean",
      default: true,
      description: "Generate Shadcn UI compatible CSS variables",
    },
    utilities: {
      type: "boolean",
      default: true,
      description: "Generate CSS utility classes",
    },
  },
  additionalProperties: false,
};

export function generateSchemaFile(): string {
  return JSON.stringify(CONFIG_SCHEMA, null, 2);
}
