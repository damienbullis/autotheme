export { type AutoThemeConfig, DEFAULT_CONFIG } from "./types";
export { CONFIG_SCHEMA, generateSchemaFile } from "./schema";
export { loadConfig } from "./loader";
export { validateConfig } from "./validator";
export { resolveConfig, generateRandomColor } from "./merge";
