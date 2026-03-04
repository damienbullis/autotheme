import prompts from "prompts";
import { writeFile } from "fs/promises";
import { HARMONY_META } from "../core/harmony-meta";
import { DEFAULT_OUTPUT, DEFAULT_PALETTE, DEFAULT_TYPOGRAPHY } from "../config/types";
import { log } from "./logger";

export async function runInit(skipPrompts: boolean = false): Promise<void> {
  if (skipPrompts) {
    await writeDefaultConfig();
    return;
  }

  const response = await prompts([
    {
      type: "text",
      name: "color",
      message: "Primary color (hex):",
      initial: "#6439FF",
      validate: validateColorInput,
    },
    {
      type: "select",
      name: "harmony",
      message: "Color harmony:",
      choices: HARMONY_META.map((h) => ({
        title: h.name,
        description: h.description,
        value: h.type,
      })),
      initial: 1, // analogous
    },
    {
      type: "text",
      name: "outputPath",
      message: "Output path:",
      initial: DEFAULT_OUTPUT.path,
    },
    {
      type: "text",
      name: "prefix",
      message: "CSS variable prefix:",
      initial: DEFAULT_PALETTE.prefix,
    },
    {
      type: "number",
      name: "fontSize",
      message: "Base font size (rem):",
      initial: DEFAULT_TYPOGRAPHY.base,
      float: true,
      min: 0.1,
    },
    {
      type: "confirm",
      name: "preview",
      message: "Generate HTML preview?",
      initial: false,
    },
    {
      type: "confirm",
      name: "tailwind",
      message: "Generate Tailwind v4 CSS?",
      initial: false,
    },
  ]);

  if (!response.color) {
    log.dim("Cancelled");
    return;
  }

  await writeConfig({
    color: response.color,
    harmony: response.harmony,
    palette: {
      prefix: response.prefix,
    },
    typography: {
      base: response.fontSize,
    },
    output: {
      path: response.outputPath,
      preview: response.preview,
      tailwind: response.tailwind,
    },
  });
}

async function writeConfig(config: Record<string, unknown>): Promise<void> {
  const content = {
    $schema: "./node_modules/autotheme/schema.json",
    ...config,
  };

  await writeFile("autotheme.json", JSON.stringify(content, null, 2));
  log.success("Created autotheme.json");
}

async function writeDefaultConfig(): Promise<void> {
  await writeConfig({
    color: "#6439FF",
    harmony: "analogous",
    output: {
      path: DEFAULT_OUTPUT.path,
    },
  });
}

function validateColorInput(value: string): boolean | string {
  if (!value) return "Color is required";
  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return "Must be a valid hex color (e.g., #FF0000)";
  }
  return true;
}
