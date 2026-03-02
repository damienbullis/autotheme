import type { HarmonyType, SwingStrategy } from "../core/types";

/** Supported CSS color output formats */
export type ColorFormat = "oklch" | "hsl" | "rgb" | "hex";

/** Definition of a custom harmony with explicit hue offsets */
export interface CustomHarmonyDefinition {
  offsets: number[];
}

export interface SemanticMapping {
  accent: string;
  accentSecondary: string;
}

export interface AlphaSteps {
  bg: number;
  border: number;
  glow: number;
  hover: number;
}

export interface StatesConfig {
  enabled: boolean;
  hoverShift: number;
  activeShift: number;
  focusRingAlpha: number;
  disabledAlpha: number;
  disabledDesat: number;
}

export interface ShadowConfig {
  enabled: boolean;
  base: number;
  ratio: number;
  steps: number;
  colorTint: number;
  values?: string[];
}

export interface RadiusConfig {
  enabled: boolean;
  base: number;
  ratio: number;
  steps: number;
  values?: number[];
}

export interface ElevationConfig {
  enabled: boolean;
  levels: number;
}

export interface SemanticsConfig {
  enabled: boolean;
  surfaceDepth: number;
  textLevels: number;
  mapping: SemanticMapping;
  overrides?: Record<string, string>;
  states: StatesConfig;
  elevation: ElevationConfig;
}

export type ThemeMode = "light" | "dark" | "both";

export interface AutoThemeConfig {
  // Version
  version?: 2;

  // Required
  color: string;
  harmony: HarmonyType | string;

  // Color format
  colorFormat: ColorFormat;

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
    alphaVariants: boolean;
    alphaSteps: AlphaSteps;
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

  // Shadow scale
  shadows: ShadowConfig;

  // Border radius scale
  radius: RadiusConfig;

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
    comments: boolean;
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
  colorFormat: "oklch",
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
    alphaVariants: false,
    alphaSteps: { bg: 10, border: 20, glow: 15, hover: 8 },
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

  shadows: {
    enabled: false,
    base: 1,
    ratio: 2,
    steps: 5,
    colorTint: 10,
  },

  radius: {
    enabled: false,
    base: 0.125,
    ratio: 2,
    steps: 6,
  },

  semantics: {
    enabled: false,
    surfaceDepth: 4,
    textLevels: 3,
    mapping: { accent: "primary", accentSecondary: "secondary" },
    states: {
      enabled: false,
      hoverShift: 5,
      activeShift: 10,
      focusRingAlpha: 50,
      disabledAlpha: 40,
      disabledDesat: 60,
    },
    elevation: { enabled: false, levels: 4 },
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
    comments: true,
  },
};
