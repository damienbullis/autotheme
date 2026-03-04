import type { HarmonyType, SwingStrategy } from "../core/types";

/** Supported CSS color output formats */
export type ColorFormat = "oklch" | "hsl" | "rgb" | "hex";

/** Definition of a custom harmony with explicit hue offsets */
export interface CustomHarmonyDefinition {
  offsets: number[];
}

export type ThemeMode = "light" | "dark" | "both";

// ─── Feature Config Types ────────────────────────────────────

export interface PaletteConfig {
  prefix: string;
  contrastTarget: number;
  chromaBalance: boolean;
  tints: number;
  shades: number;
  tones: number;
  tintIncrement: number;
  shadeIncrement: number;
  toneIncrement: number;
  swing: number;
  swingStrategy: SwingStrategy;
  alphaVariants: boolean;
  alphaSteps: AlphaSteps;
}

export interface AlphaSteps {
  bg: number;
  border: number;
  glow: number;
  hover: number;
}

export interface TextConfig {
  levels: number;
  anchor: number;
  floor: number;
  curve: number;
  chroma: [number, number]; // [anchor, floor]
}

export interface SurfacesConfig {
  chroma: number;
  sunkenDelta: number;
}

export interface BordersConfig {
  offsets: [number, number, number];
  chroma: number;
}

export interface SemanticMapping {
  accent: string;
  secondary: string;
  tertiary: string;
}

export interface SemanticsConfig {
  depth: number;
  text: TextConfig;
  surfaces: SurfacesConfig;
  borders: BordersConfig;
  mapping: SemanticMapping;
  overrides?: Record<string, string>;
}

export interface StatesConfig {
  hover: number;
  active: number;
  focus: { color?: string; width?: string; offset?: string };
  disabled: { opacity: number };
}

export interface ElevationConfig {
  levels: number;
  delta: number;
  tintShadows: boolean;
}

export interface ShadowConfig {
  base: number;
  ratio: number;
  steps: number;
  colorTint: number;
  values?: string[];
}

export interface RadiusConfig {
  base: number;
  ratio: number;
  steps: number;
  values?: number[];
}

export interface TypographyConfig {
  base: number;
  ratio: number;
  steps: number;
  names?: string[];
  values?: number[];
  fluid: boolean;
  fluidRange: [number, number];
}

export interface SpacingConfig {
  base: number;
  ratio: number;
  steps: number;
  values?: number[];
  fluid: boolean;
  fluidRange: [number, number];
}

export interface MotionConfig {
  spring: { stiffness: number; damping: number; mass: number };
  durations: { base: number; ratio: number; steps: number };
  reducedMotion: boolean;
}

export interface ShadcnConfig {
  radius: string;
}

export interface OutputConfig {
  path: string;
  format: ColorFormat;
  tailwind: boolean;
  preview: boolean;
  comments: boolean;
  layers: boolean;
  lightDark: boolean;
  contrastMedia: boolean;
  reducedTransparency: boolean;
  forcedColors: boolean;
}

// ─── User-Facing Config (boolean | Config pattern) ───────────

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * User-facing config. Features use `boolean | ConfigObject`:
 * - `false` or omitted = disabled
 * - `true` = enabled with defaults
 * - `{ ... }` = enabled with customization
 */
export interface AutoThemeConfig {
  // Required
  color: string;

  // Core
  harmony: HarmonyType | string;
  mode: ThemeMode;

  // Features (boolean | Config pattern)
  palette: boolean | DeepPartial<PaletteConfig>;
  semantics: boolean | DeepPartial<SemanticsConfig>;
  states: boolean | DeepPartial<StatesConfig>;
  elevation: boolean | DeepPartial<ElevationConfig>;
  typography: boolean | DeepPartial<TypographyConfig>;
  spacing: boolean | DeepPartial<SpacingConfig>;
  shadows: boolean | DeepPartial<ShadowConfig>;
  radius: boolean | DeepPartial<RadiusConfig>;
  motion: boolean | DeepPartial<MotionConfig>;
  gradients: boolean;
  noise: boolean;
  utilities: boolean;
  shadcn: boolean | DeepPartial<ShadcnConfig>;

  // Output
  output: DeepPartial<OutputConfig>;

  // Custom harmonies
  harmonies?: Record<string, CustomHarmonyDefinition>;

  // CLI-only
  preset?: string;
  silent?: boolean;
  config?: string;
}

// ─── Resolved Config (no booleans, all defaults filled) ──────

/**
 * Internal resolved config. Every feature is either `false` (disabled)
 * or a fully-resolved config object with no optional fields.
 */
export interface ResolvedConfig {
  color: string;
  harmony: HarmonyType | string;
  mode: ThemeMode;

  palette: false | PaletteConfig;
  semantics: false | SemanticsConfig;
  states: false | StatesConfig;
  elevation: false | ElevationConfig;
  typography: false | TypographyConfig;
  spacing: false | SpacingConfig;
  shadows: false | ShadowConfig;
  radius: false | RadiusConfig;
  motion: false | MotionConfig;
  gradients: boolean;
  noise: boolean;
  utilities: boolean;
  shadcn: false | ShadcnConfig;

  output: OutputConfig;

  harmonies?: Record<string, CustomHarmonyDefinition>;

  // CLI-only (stripped after resolution)
  silent?: boolean;
}

// ─── Default Values ──────────────────────────────────────────

export const DEFAULT_PALETTE: PaletteConfig = {
  prefix: "color",
  contrastTarget: 7,
  chromaBalance: true,
  tints: 5,
  shades: 5,
  tones: 4,
  tintIncrement: 10,
  shadeIncrement: 10,
  toneIncrement: 20,
  swing: 1,
  swingStrategy: "linear",
  alphaVariants: false,
  alphaSteps: { bg: 10, border: 20, glow: 15, hover: 8 },
};

export const DEFAULT_TEXT: TextConfig = {
  levels: 3,
  anchor: 0.95, // overridden per mode
  floor: 0.55, // overridden per mode
  curve: 1,
  chroma: [0.025, 0.01],
};

export const DEFAULT_SURFACES: SurfacesConfig = {
  chroma: 0.01,
  sunkenDelta: -0.02,
};

export const DEFAULT_BORDERS: BordersConfig = {
  offsets: [0.08, 0.15, 0.25],
  chroma: 0.012,
};

export const DEFAULT_SEMANTICS: SemanticsConfig = {
  depth: 0.13, // overridden per mode
  text: { ...DEFAULT_TEXT },
  surfaces: { ...DEFAULT_SURFACES },
  borders: { ...DEFAULT_BORDERS },
  mapping: { accent: "primary", secondary: "secondary", tertiary: "tertiary" },
};

export const DEFAULT_STATES: StatesConfig = {
  hover: 0.04,
  active: -0.02,
  focus: { width: "2px", offset: "2px" },
  disabled: { opacity: 0.4 },
};

export const DEFAULT_ELEVATION: ElevationConfig = {
  levels: 4,
  delta: 0.03,
  tintShadows: true,
};

export const DEFAULT_TYPOGRAPHY: TypographyConfig = {
  base: 1,
  ratio: 1.25,
  steps: 7,
  fluid: false,
  fluidRange: [320, 1280],
};

export const DEFAULT_SPACING: SpacingConfig = {
  base: 0.25,
  ratio: 2,
  steps: 10,
  fluid: false,
  fluidRange: [320, 1280],
};

export const DEFAULT_SHADOWS: ShadowConfig = {
  base: 1,
  ratio: 2,
  steps: 5,
  colorTint: 10,
};

export const DEFAULT_RADIUS: RadiusConfig = {
  base: 0.125,
  ratio: 2,
  steps: 6,
};

export const DEFAULT_MOTION: MotionConfig = {
  spring: { stiffness: 100, damping: 15, mass: 1 },
  durations: { base: 100, ratio: 1.5, steps: 5 },
  reducedMotion: true,
};

export const DEFAULT_SHADCN: ShadcnConfig = {
  radius: "0.625rem",
};

export const DEFAULT_OUTPUT: OutputConfig = {
  path: "./src/autotheme.css",
  format: "oklch",
  tailwind: false,
  preview: false,
  comments: true,
  layers: true,
  lightDark: false,
  contrastMedia: false,
  reducedTransparency: false,
  forcedColors: false,
};
