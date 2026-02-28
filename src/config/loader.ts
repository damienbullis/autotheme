import { existsSync } from "fs";
import { readFile } from "fs/promises";
import type { AutoThemeConfig } from "./types";
import { validateConfig } from "./validator";

const CONFIG_FILENAMES = ["autotheme.json", ".autothemerc.json", ".autothemerc"];

export async function loadConfig(configPath?: string): Promise<Partial<AutoThemeConfig>> {
  // If explicit path provided, use it
  if (configPath) {
    return loadConfigFromPath(configPath);
  }

  // Search for config file in current directory
  for (const filename of CONFIG_FILENAMES) {
    if (existsSync(filename)) {
      return loadConfigFromPath(filename);
    }
  }

  // No config file found, return empty
  return {};
}

async function loadConfigFromPath(path: string): Promise<Partial<AutoThemeConfig>> {
  if (!existsSync(path)) {
    throw new Error(`Config file not found: ${path}`);
  }

  const content = await readFile(path, "utf-8");

  try {
    const config: unknown = JSON.parse(content);
    return validateConfig(config);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in config file: ${path}`);
    }
    throw error;
  }
}
