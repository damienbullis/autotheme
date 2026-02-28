import type { HarmonyType, SwingStrategy } from "../core/types";

/** Definition of a custom harmony with explicit hue offsets */
export interface CustomHarmonyDefinition {
  offsets: number[];
}

export interface AutoThemeConfig {
  // Required
  color: string;
  harmony: HarmonyType | string; // Built-in harmony name or custom harmony name

  // Output options
  output: string;
  preview: boolean;
  tailwind: boolean;
  darkModeScript: boolean;

  // Swing options
  swing: number; // Swing multiplier for harmony angular distance (default: 1)
  swingStrategy: SwingStrategy; // Swing strategy (default: "linear")

  // Advanced options
  scalar: number; // Golden ratio multiplier for spacing/sizing
  contrastTarget: number; // Target contrast ratio (default: 7)
  radius: string; // Border radius for Shadcn components (default: "0.625rem")
  prefix: string; // CSS variable prefix (default: "color")
  fontSize: number; // Base font size in rem (default: 1)

  // Feature toggles (default: true)
  gradients: boolean; // Toggle gradient variable generation
  spacing: boolean; // Toggle spacing scale generation
  noise: boolean; // Toggle noise texture generation
  shadcn: boolean; // Toggle Shadcn UI variable generation
  utilities: boolean; // Toggle utility class generation

  // Custom harmonies (named map of hue offsets)
  harmonies?: Record<string, CustomHarmonyDefinition>;

  // Preset (references a built-in preset by name)
  preset?: string;

  // CLI-only options (not in config file)
  silent?: boolean;
  config?: string;
}

export const DEFAULT_CONFIG: AutoThemeConfig = {
  color: "", // Will be randomized if not provided
  harmony: "analogous",
  output: "./src/autotheme.css",
  preview: false,
  tailwind: false,
  darkModeScript: false,
  swing: 1,
  swingStrategy: "linear",
  scalar: 1.618,
  contrastTarget: 7,
  radius: "0.625rem",
  prefix: "color",
  fontSize: 1,
  gradients: true,
  spacing: true,
  noise: true,
  shadcn: true,
  utilities: true,
};
