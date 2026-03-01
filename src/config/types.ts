import type { HarmonyType, SwingStrategy } from "../core/types";

/** Definition of a custom harmony with explicit hue offsets */
export interface CustomHarmonyDefinition {
  offsets: number[];
}

export interface AutoThemeConfig {
  // Version
  version?: 2;

  // Required
  color: string;
  harmony: HarmonyType | string;

  // Swing
  swing: number;
  swingStrategy: SwingStrategy;

  // Palette config
  palette: {
    prefix: string;
    contrastTarget: number;
  };

  // Typography (always generated)
  typography: {
    base: number;
    ratio: number;
    steps: number;
  };

  // Spacing (defaults to off)
  spacing: {
    enabled: boolean;
    base: number;
    ratio: number;
    steps: number;
  };

  // Feature toggles (all default: false)
  gradients: boolean;
  noise: boolean;
  utilities: boolean;

  // Framework bindings
  shadcn: {
    enabled: boolean;
    radius: string;
  };

  // Output
  output: {
    path: string;
    tailwind: boolean;
    preview: boolean;
    darkModeScript: boolean;
  };

  // Custom harmonies
  harmonies?: Record<string, CustomHarmonyDefinition>;

  // CLI-only
  preset?: string;
  silent?: boolean;
  config?: string;
}

export const DEFAULT_CONFIG: AutoThemeConfig = {
  color: "",
  harmony: "analogous",
  swing: 1,
  swingStrategy: "linear",

  palette: {
    prefix: "color",
    contrastTarget: 7,
  },

  typography: {
    base: 1,
    ratio: 1.618,
    steps: 8,
  },

  spacing: {
    enabled: false,
    base: 0.155,
    ratio: 1.618,
    steps: 10,
  },

  gradients: false,
  noise: false,
  utilities: false,

  shadcn: {
    enabled: false,
    radius: "0.625rem",
  },

  output: {
    path: "./src/autotheme.css",
    tailwind: false,
    preview: false,
    darkModeScript: false,
  },
};
