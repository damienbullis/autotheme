import { Color } from "../../src/core/color";
import { generateFullPalette } from "../../src/core/palette";
import { generateHarmony } from "../../src/core/harmonies";
import type { GeneratedTheme } from "../../src/generators/types";
import type {
  ResolvedConfig,
  DeepPartial,
  PaletteConfig,
  SemanticsConfig,
  OutputConfig,
} from "../../src/config/types";
import {
  DEFAULT_SEMANTICS,
  DEFAULT_OUTPUT,
  DEFAULT_SHADOWS,
  DEFAULT_RADIUS,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_SPACING,
  DEFAULT_MOTION,
  DEFAULT_STATES,
  DEFAULT_ELEVATION,
  DEFAULT_SHADCN,
} from "../../src/config/types";
import type { HarmonyType } from "../../src/core/types";

type TestOverrides = DeepPartial<ResolvedConfig> & {
  harmony?: HarmonyType | string;
  color?: string;
};

/**
 * Create a test theme with sensible defaults and optional overrides.
 * Default: semantics ON, palette OFF (matching v2 defaults).
 */
export function createTestTheme(overrides: TestOverrides = {}): GeneratedTheme {
  const color = overrides.color || "#6439FF";
  const harmony = (overrides.harmony || "analogous") as HarmonyType;
  const mode = overrides.mode ?? "both";
  const primaryColor = new Color(color);

  // Generate palette (full or minimal based on config)
  const paletteConfig = overrides.palette;
  let palette;
  if (paletteConfig === false || paletteConfig === undefined) {
    // Default: no variations (base colors only)
    palette = generateFullPalette(primaryColor, harmony, {
      variations: { tints: 0, shades: 0, tones: 0 },
    });
  } else {
    palette = generateFullPalette(primaryColor, harmony);
  }

  const harmonyResult = generateHarmony(primaryColor, harmony);

  // Build resolved semantics with mode-dependent defaults
  let resolvedSemantics: false | SemanticsConfig;
  if (overrides.semantics === false) {
    resolvedSemantics = false;
  } else {
    const semOverrides = typeof overrides.semantics === "object" ? overrides.semantics : {};
    resolvedSemantics = {
      ...DEFAULT_SEMANTICS,
      depth: semOverrides?.depth ?? (mode === "light" ? 0.97 : 0.13),
      text: {
        ...DEFAULT_SEMANTICS.text,
        anchor: semOverrides?.text?.anchor ?? (mode === "dark" || mode === "both" ? 0.95 : 0.15),
        floor: semOverrides?.text?.floor ?? 0.55,
        ...semOverrides?.text,
      },
      surfaces: { ...DEFAULT_SEMANTICS.surfaces, ...semOverrides?.surfaces },
      borders: { ...DEFAULT_SEMANTICS.borders, ...semOverrides?.borders },
      mapping: { ...DEFAULT_SEMANTICS.mapping, ...semOverrides?.mapping },
      ...(semOverrides?.overrides && { overrides: semOverrides.overrides }),
    };
  }

  const config: ResolvedConfig = {
    color,
    harmony,
    mode,
    palette:
      paletteConfig === false || paletteConfig === undefined
        ? false
        : ({
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
            ...(typeof paletteConfig === "object" ? paletteConfig : {}),
          } as PaletteConfig),
    semantics: resolvedSemantics,
    states:
      overrides.states === undefined
        ? false
        : overrides.states === false
          ? false
          : {
              ...DEFAULT_STATES,
              ...(typeof overrides.states === "object" ? overrides.states : {}),
            },
    elevation:
      overrides.elevation === undefined
        ? false
        : overrides.elevation === false
          ? false
          : {
              ...DEFAULT_ELEVATION,
              ...(typeof overrides.elevation === "object" ? overrides.elevation : {}),
            },
    typography:
      overrides.typography === undefined
        ? false
        : overrides.typography === false
          ? false
          : {
              ...DEFAULT_TYPOGRAPHY,
              ...(typeof overrides.typography === "object" ? overrides.typography : {}),
            },
    spacing:
      overrides.spacing === undefined
        ? false
        : overrides.spacing === false
          ? false
          : {
              ...DEFAULT_SPACING,
              ...(typeof overrides.spacing === "object" ? overrides.spacing : {}),
            },
    shadows:
      overrides.shadows === undefined
        ? false
        : overrides.shadows === false
          ? false
          : {
              ...DEFAULT_SHADOWS,
              ...(typeof overrides.shadows === "object" ? overrides.shadows : {}),
            },
    radius:
      overrides.radius === undefined
        ? false
        : overrides.radius === false
          ? false
          : {
              ...DEFAULT_RADIUS,
              ...(typeof overrides.radius === "object" ? overrides.radius : {}),
            },
    motion:
      overrides.motion === undefined
        ? false
        : overrides.motion === false
          ? false
          : {
              ...DEFAULT_MOTION,
              ...(typeof overrides.motion === "object" ? overrides.motion : {}),
            },
    gradients: overrides.gradients ?? false,
    noise: overrides.noise ?? false,
    utilities: overrides.utilities ?? false,
    shadcn:
      overrides.shadcn === undefined
        ? false
        : overrides.shadcn === false
          ? false
          : {
              ...DEFAULT_SHADCN,
              ...(typeof overrides.shadcn === "object" ? overrides.shadcn : {}),
            },
    output: {
      ...DEFAULT_OUTPUT,
      ...(typeof overrides.output === "object" ? overrides.output : {}),
    } as OutputConfig,
    harmonies: overrides.harmonies,
  };

  return { palette, harmony: harmonyResult, config };
}
