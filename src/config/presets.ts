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
    description: "Calm, professional blue theme",
    config: {
      color: "#1E6091",
      harmony: "analogous",
      mode: "both",
      semantics: { enabled: true, surfaceDepth: 4, textLevels: 3 },
    },
  },
  sunset: {
    name: "Sunset",
    description: "Warm, energetic orange theme",
    config: {
      color: "#E85D26",
      harmony: "split-complementary",
      mode: "both",
      semantics: { enabled: true, surfaceDepth: 4, textLevels: 3 },
    },
  },
  forest: {
    name: "Forest",
    description: "Natural, grounded green theme",
    config: {
      color: "#2D6A4F",
      harmony: "triadic",
      mode: "both",
      semantics: { enabled: true, surfaceDepth: 4, textLevels: 3 },
    },
  },
  lavender: {
    name: "Lavender",
    description: "Gentle, elegant purple theme",
    config: {
      color: "#7B68AE",
      harmony: "analogous",
      mode: "both",
      semantics: { enabled: true, surfaceDepth: 3, textLevels: 3 },
    },
  },
  ember: {
    name: "Ember",
    description: "Bold, dramatic red theme",
    config: {
      color: "#B22234",
      harmony: "complementary",
      mode: "both",
      semantics: { enabled: true, surfaceDepth: 4, textLevels: 3 },
    },
  },
  arctic: {
    name: "Arctic",
    description: "Clean, modern cyan theme",
    config: {
      color: "#48B9C7",
      harmony: "aurelian",
      mode: "both",
      semantics: { enabled: true, surfaceDepth: 3, textLevels: 3 },
    },
  },
  midnight: {
    name: "Midnight",
    description: "Sophisticated, deep indigo theme",
    config: {
      color: "#2C2C6E",
      harmony: "square",
      mode: "both",
      semantics: { enabled: true, surfaceDepth: 5, textLevels: 3 },
    },
  },
  terracotta: {
    name: "Terracotta",
    description: "Organic, warm earth theme",
    config: {
      color: "#C4704B",
      harmony: "retrograde",
      mode: "both",
      semantics: { enabled: true, surfaceDepth: 4, textLevels: 3 },
    },
  },
  neon: {
    name: "Neon",
    description: "High-energy, playful pink theme",
    config: {
      color: "#FF2E97",
      harmony: "drift",
      mode: "both",
      semantics: { enabled: true, surfaceDepth: 4, textLevels: 3 },
    },
  },
  sage: {
    name: "Sage",
    description: "Tranquil, understated green theme",
    config: {
      color: "#8FA98C",
      harmony: "bi-polar",
      mode: "both",
      semantics: { enabled: true, surfaceDepth: 3, textLevels: 3 },
    },
  },

  // New presets

  "dashboard-dark": {
    name: "Dashboard Dark",
    description: "Dark-mode dashboard with deep surfaces and clear hierarchy",
    config: {
      color: "#6366F1",
      harmony: "analogous",
      mode: "dark",
      semantics: { enabled: true, surfaceDepth: 6, textLevels: 4 },
      shadcn: { enabled: true, radius: "0.5rem" },
      spacing: { enabled: true },
    },
  },
  "marketing-light": {
    name: "Marketing Light",
    description: "Bright, vibrant light theme for landing pages",
    config: {
      color: "#8B5CF6",
      harmony: "split-complementary",
      mode: "light",
      semantics: { enabled: true, surfaceDepth: 3, textLevels: 3 },
      gradients: true,
      noise: true,
      typography: { base: 1.125, ratio: 1.333, steps: 7 },
    },
  },
  "docs-minimal": {
    name: "Docs Minimal",
    description: "Clean, neutral theme for documentation",
    config: {
      color: "#475569",
      harmony: "analogous",
      mode: "both",
      semantics: { enabled: true, surfaceDepth: 2, textLevels: 3 },
      typography: { base: 1, ratio: 1.2, steps: 7 },
      palette: { contrastTarget: 7 },
    },
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
