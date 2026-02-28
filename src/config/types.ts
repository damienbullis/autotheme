import type { HarmonyType } from "../core/types";

export interface AutoThemeConfig {
  // Required
  color: string;
  harmony: HarmonyType;

  // Output options
  output: string;
  preview: boolean;
  tailwind: boolean;
  darkModeScript: boolean;

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
