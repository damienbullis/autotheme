import prompts from "prompts";
import { writeFile } from "fs/promises";
import { HARMONY_META } from "../core/harmony-meta";
import { log } from "./logger";

export type FrameworkType = "nextjs" | "astro" | "nuxt" | "sveltekit" | "vanilla";

export const FRAMEWORK_DEFAULTS: Record<
  FrameworkType,
  { shadcn?: boolean; output: { path: string; tailwind?: boolean } }
> = {
  nextjs: { shadcn: true, output: { path: "./src/app/autotheme.css", tailwind: true } },
  astro: { output: { path: "./src/styles/autotheme.css", tailwind: true } },
  nuxt: { output: { path: "./assets/css/autotheme.css", tailwind: true } },
  sveltekit: { output: { path: "./src/autotheme.css", tailwind: true } },
  vanilla: { output: { path: "./autotheme.css" } },
};

const FRAMEWORK_GUIDE: Record<FrameworkType, string> = {
  nextjs: "docs/guides/nextjs.md",
  astro: "docs/guides/astro.md",
  nuxt: "docs/guides/nuxt.md",
  sveltekit: "docs/guides/sveltekit.md",
  vanilla: "docs/guides/vanilla.md",
};

export interface InitOptions {
  skipPrompts?: boolean;
  framework?: FrameworkType;
}

export async function runInit(options: InitOptions = {}): Promise<void> {
  if (options.skipPrompts) {
    const framework = options.framework ?? "vanilla";
    await writeDefaultConfig(framework);
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
      type: "select",
      name: "framework",
      message: "Framework:",
      choices: [
        { title: "Next.js", value: "nextjs" },
        { title: "Astro", value: "astro" },
        { title: "Nuxt", value: "nuxt" },
        { title: "SvelteKit", value: "sveltekit" },
        { title: "Vanilla / Other", value: "vanilla" },
      ],
    },
    {
      type: "select",
      name: "mode",
      message: "Theme mode:",
      choices: [
        { title: "Both (light + dark)", value: "both" },
        { title: "Light only", value: "light" },
        { title: "Dark only", value: "dark" },
      ],
    },
  ]);

  if (!response.color) {
    log.dim("Cancelled");
    return;
  }

  const framework = (response.framework ?? "vanilla") as FrameworkType;
  const defaults = FRAMEWORK_DEFAULTS[framework];

  // Conditional follow-up: Shadcn for Next.js
  let shadcn = defaults.shadcn;
  if (framework === "nextjs") {
    const shadcnResponse = await prompts({
      type: "confirm",
      name: "shadcn",
      message: "Enable Shadcn UI variables?",
      initial: true,
    });
    shadcn = shadcnResponse.shadcn;
  }

  const config: Record<string, unknown> = {
    color: response.color,
    harmony: response.harmony,
    mode: response.mode,
  };

  if (shadcn) {
    config.shadcn = true;
  }

  config.output = { ...defaults.output };

  await writeConfig(config);
  printNextSteps(framework);
}

function printNextSteps(framework: FrameworkType): void {
  log.dim("");
  log.info("Next steps:");
  log.dim("  npx autotheme");
  log.dim(`  See: ${FRAMEWORK_GUIDE[framework]}`);
}

async function writeConfig(config: Record<string, unknown>): Promise<void> {
  const content = {
    $schema: "./node_modules/autotheme/schema.json",
    ...config,
  };

  await writeFile("autotheme.json", JSON.stringify(content, null, 2));
  log.success("Created autotheme.json");
}

async function writeDefaultConfig(framework: FrameworkType): Promise<void> {
  const defaults = FRAMEWORK_DEFAULTS[framework];
  const config: Record<string, unknown> = {
    color: "#6439FF",
    harmony: "analogous",
    mode: "both",
    output: { ...defaults.output },
  };

  if (defaults.shadcn) {
    config.shadcn = true;
  }

  await writeConfig(config);
  printNextSteps(framework);
}

function validateColorInput(value: string): boolean | string {
  if (!value) return "Color is required";
  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return "Must be a valid hex color (e.g., #FF0000)";
  }
  return true;
}
