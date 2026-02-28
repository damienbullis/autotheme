import type { GeneratedTheme, GeneratorOutput } from "./types";
import type { AutoThemeConfig } from "../config/types";
import { generateCSS } from "./css";
import { generateTailwindCSS } from "./tailwind";
import { generatePreview } from "./preview";
import { generateDarkModeScript } from "./script";

/**
 * Write all generated outputs to files
 */
export async function writeOutputs(theme: GeneratedTheme, config: AutoThemeConfig): Promise<void> {
  const outputs: GeneratorOutput[] = [];

  // Always generate main CSS
  outputs.push(generateCSS(theme));

  // Conditional outputs
  if (config.tailwind) {
    outputs.push(generateTailwindCSS(theme));
  }

  if (config.preview) {
    outputs.push(generatePreview(theme));
  }

  if (config.darkModeScript) {
    outputs.push(generateDarkModeScript());
  }

  // Write all files
  await Promise.all(outputs.map((output) => Bun.write(output.filename, output.content)));
}

export * from "./types";
export * from "./css";
export * from "./noise";
export * from "./dark-mode";
export * from "./utilities";
export * from "./tailwind";
export * from "./preview";
export * from "./script";
export * from "./shadcn";
export * from "./semantic";
