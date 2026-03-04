import type { StackConfig, EffectsConfig } from "../config/types";
import type { FullPalette } from "../core/types";
import { getHarmonyName } from "./css";

/**
 * Generate stack layer CSS variables (empty by default, set via utility classes)
 */
export function generateStackVars(config: StackConfig, comments: boolean): string {
  const lines: string[] = [];

  if (comments) lines.push("    /* Stack Layers */");

  for (let i = 1; i <= config.layers; i++) {
    lines.push(`    --stack-layer-${i}: ;`);
  }

  return lines.join("\n");
}

/**
 * Generate stack utility classes for compositing layers
 */
export function generateStackUtilities(
  effects: EffectsConfig,
  palette: FullPalette,
  _prefix: string,
  comments: boolean,
): string {
  const lines: string[] = [];
  const stack = effects.stack;
  if (stack === false) return "";

  if (comments) lines.push("/* Stack Compositing */");

  // Base .stack class — composes all layers into background-image
  // Layers are listed highest-first so layer N renders on top
  const layerRefs: string[] = [];
  for (let i = stack.layers; i >= 1; i--) {
    // Trailing comma trick: `var(--stack-layer-N,)` collapses to empty when unset
    layerRefs.push(`var(--stack-layer-${i},)`);
  }

  lines.push(`.stack {`);
  lines.push(`    background-image: ${layerRefs.join(" ")};`);
  lines.push(`    background-repeat: repeat;`);
  lines.push(`    background-size: cover;`);
  lines.push(`}`);

  // Setter classes — assign specific effects to stack layers
  // Layer 1: noise
  lines.push(`.stack-noise { --stack-layer-1: var(--background-image-noise); }`);

  // Layer 2: grain filter
  if (effects.filters !== false && effects.filters.grain !== false) {
    lines.push(`.stack-grain { --stack-layer-2: var(--filter-grain); }`);
  }

  // Layer 3+: blobs
  if (effects.blobs !== false) {
    for (let i = 1; i <= effects.blobs.count; i++) {
      lines.push(`.stack-blob-${i} { --stack-layer-3: var(--blob-${i}); }`);
    }
  }

  // Layer 4: gradients (if configured)
  const harmonyCount = palette.palettes.length;
  for (let i = 1; i < harmonyCount; i++) {
    const name = getHarmonyName(i);
    lines.push(`.stack-gradient-${name} { --stack-layer-4: var(--gradient-linear-${name}); }`);
  }

  // Blend control
  if (effects.blendModes !== false) {
    for (const mode of effects.blendModes.modes) {
      lines.push(`.stack-blend-${mode} { background-blend-mode: ${mode}; }`);
    }
  }

  return lines.join("\n");
}
