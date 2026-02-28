import { existsSync } from "fs";
import { readFile } from "fs/promises";
import type { AutoThemeConfig } from "./types";
import { validateConfig } from "./validator";

const CONFIG_FILENAME = "autotheme.json";

/**
 * Check if a string is a URL (http:// or https://)
 */
export function isUrl(path: string): boolean {
  return path.startsWith("http://") || path.startsWith("https://");
}

export async function loadConfig(configPath?: string): Promise<Partial<AutoThemeConfig>> {
  // If explicit path provided, use it
  if (configPath) {
    if (isUrl(configPath)) {
      return loadConfigFromUrl(configPath);
    }
    return loadConfigFromPath(configPath);
  }

  // Search for config file in current directory
  if (existsSync(CONFIG_FILENAME)) {
    return loadConfigFromPath(CONFIG_FILENAME);
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

async function loadConfigFromUrl(url: string): Promise<Partial<AutoThemeConfig>> {
  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { Accept: "application/json, text/plain" },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error(`Config URL timed out after 10 seconds: ${url}`);
    }
    throw new Error(`Failed to fetch config from URL: ${url}`);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching config from URL: ${url}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (
    !contentType.includes("application/json") &&
    !contentType.includes("text/plain") &&
    !contentType.includes("text/html")
  ) {
    throw new Error(
      `Unexpected content type "${contentType}" from URL: ${url}. Expected application/json or text/plain.`,
    );
  }

  const text = await response.text();

  let config: unknown;
  try {
    config = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON from config URL: ${url}`);
  }

  return validateConfig(config);
}
