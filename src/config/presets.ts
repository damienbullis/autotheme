import type { AutoThemeConfig } from "./types";

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export interface Preset {
  name: string;
  description: string;
  config: DeepPartial<AutoThemeConfig>;
}

export const PRESETS: Record<string, Preset> = {
  ocean: {
    name: "Ocean",
    description: "Calm, professional",
    config: { color: "#1E6091", harmony: "analogous" },
  },
  sunset: {
    name: "Sunset",
    description: "Warm, energetic",
    config: { color: "#E85D26", harmony: "split-complementary" },
  },
  forest: {
    name: "Forest",
    description: "Natural, grounded",
    config: { color: "#2D6A4F", harmony: "triadic" },
  },
  lavender: {
    name: "Lavender",
    description: "Gentle, elegant",
    config: { color: "#7B68AE", harmony: "analogous" },
  },
  ember: {
    name: "Ember",
    description: "Bold, dramatic",
    config: { color: "#B22234", harmony: "complementary" },
  },
  arctic: {
    name: "Arctic",
    description: "Clean, modern",
    config: { color: "#48B9C7", harmony: "aurelian" },
  },
  midnight: {
    name: "Midnight",
    description: "Sophisticated, deep",
    config: { color: "#2C2C6E", harmony: "square" },
  },
  terracotta: {
    name: "Terracotta",
    description: "Organic, warm",
    config: { color: "#C4704B", harmony: "retrograde" },
  },
  neon: {
    name: "Neon",
    description: "High-energy, playful",
    config: { color: "#FF2E97", harmony: "drift" },
  },
  sage: {
    name: "Sage",
    description: "Tranquil, understated",
    config: { color: "#8FA98C", harmony: "bi-polar" },
  },
};

/**
 * Get a preset by name
 * @throws Error if preset name is unknown
 */
export function getPreset(name: string): Preset {
  const preset = PRESETS[name];
  if (!preset) {
    const available = getPresetNames().join(", ");
    throw new Error(`Unknown preset: "${name}". Available presets: ${available}`);
  }
  return preset;
}

/**
 * Get all available preset names
 */
export function getPresetNames(): string[] {
  return Object.keys(PRESETS);
}
