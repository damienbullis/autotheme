import type { AutoThemeConfig, DeepPartial } from "./types";

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
    },
  },
  sunset: {
    name: "Sunset",
    description: "Warm, energetic orange theme",
    config: {
      color: "#E85D26",
      harmony: "split-complementary",
      mode: "both",
    },
  },
  forest: {
    name: "Forest",
    description: "Natural, grounded green theme",
    config: {
      color: "#2D6A4F",
      harmony: "triadic",
      mode: "both",
    },
  },
  lavender: {
    name: "Lavender",
    description: "Gentle, elegant purple theme",
    config: {
      color: "#7B68AE",
      harmony: "analogous",
      mode: "both",
    },
  },
  ember: {
    name: "Ember",
    description: "Bold, dramatic red theme",
    config: {
      color: "#B22234",
      harmony: "complementary",
      mode: "both",
    },
  },
  arctic: {
    name: "Arctic",
    description: "Clean, modern cyan theme",
    config: {
      color: "#48B9C7",
      harmony: "aurelian",
      mode: "both",
    },
  },
  midnight: {
    name: "Midnight",
    description: "Sophisticated, deep indigo theme",
    config: {
      color: "#2C2C6E",
      harmony: "square",
      mode: "both",
      semantics: { depth: 0.1 },
    },
  },
  terracotta: {
    name: "Terracotta",
    description: "Organic, warm earth theme",
    config: {
      color: "#C4704B",
      harmony: "retrograde",
      mode: "both",
    },
  },
  neon: {
    name: "Neon",
    description: "High-energy, playful pink theme",
    config: {
      color: "#FF2E97",
      harmony: "drift",
      mode: "both",
    },
  },
  sage: {
    name: "Sage",
    description: "Tranquil, understated green theme",
    config: {
      color: "#8FA98C",
      harmony: "bi-polar",
      mode: "both",
    },
  },
  "dashboard-dark": {
    name: "Dashboard Dark",
    description: "Dark-mode dashboard with deep surfaces and clear hierarchy",
    config: {
      color: "#6366F1",
      harmony: "analogous",
      mode: "dark",
      shadcn: { radius: "0.5rem" },
      spacing: true,
    },
  },
  "marketing-light": {
    name: "Marketing Light",
    description: "Bright, vibrant light theme for landing pages",
    config: {
      color: "#8B5CF6",
      harmony: "split-complementary",
      mode: "light",
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
      typography: { base: 1, ratio: 1.2, steps: 7 },
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
