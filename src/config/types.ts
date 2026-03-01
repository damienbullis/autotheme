import type { HarmonyType, SwingStrategy } from "../core/types";

/** Definition of a custom harmony with explicit hue offsets */
export interface CustomHarmonyDefinition {
  offsets: number[];
}

export interface SemanticMapping {
  accent: string;
  accentSecondary: string;
}

export interface SemanticsConfig {
  enabled: boolean;
  surfaceDepth: number;
  textLevels: number;
  mapping: SemanticMapping;
  overrides?: Record<string, string>;
}

export type ThemeMode = "light" | "dark" | "both";

export interface AutoThemeConfig {
  // Version
  version?: 2;

  // Required
  color: string;
  harmony: HarmonyType | string;

  // Mode
  mode: ThemeMode;

  // Swing
  swing: number;
  swingStrategy: SwingStrategy;

  // Palette config
  palette: {
    prefix: string;
    contrastTarget: number;
    tints: number;
    shades: number;
    tones: number;
    tintIncrement: number;
    shadeIncrement: number;
    toneIncrement: number;
  };

  // Typography (always generated)
  typography: {
    enabled: boolean;
    base: number;
    ratio: number;
    steps: number;
    names?: string[];
    values?: number[];
  };

  // Spacing (defaults to off)
  spacing: {
    enabled: boolean;
    base: number;
    ratio: number;
    steps: number;
    values?: number[];
  };

  // Feature toggles (all default: false)
  gradients: boolean;
  noise: boolean;
  utilities: boolean;

  // Semantic tokens
  semantics: SemanticsConfig;

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
  mode: "both",
  swing: 1,
  swingStrategy: "linear",

  palette: {
    prefix: "color",
    contrastTarget: 7,
    tints: 5,
    shades: 5,
    tones: 4,
    tintIncrement: 10,
    shadeIncrement: 10,
    toneIncrement: 20,
  },

  typography: {
    enabled: true,
    base: 1,
    ratio: 1.25,
    steps: 7,
  },

  spacing: {
    enabled: false,
    base: 0.25,
    ratio: 2,
    steps: 10,
  },

  semantics: {
    enabled: false,
    surfaceDepth: 4,
    textLevels: 3,
    mapping: { accent: "primary", accentSecondary: "secondary" },
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
