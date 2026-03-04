import type { GlassConfig } from "../config/types";
import type { FullPalette } from "../core/types";
import { getHarmonyName } from "./css";

/**
 * Resolve a color name to an OKLCH string with alpha for glass tint
 */
function resolveGlassColor(colorName: string, palette: FullPalette, alpha: number): string {
  const names = palette.palettes.map((_, i) => getHarmonyName(i));
  const idx = names.indexOf(colorName);
  if (idx !== -1) {
    const oklch = palette.palettes[idx]!.base.oklch;
    return `oklch(${oklch.l.toFixed(4)} ${oklch.c.toFixed(4)} ${oklch.h.toFixed(2)} / ${alpha.toFixed(2)})`;
  }
  // Fallback to primary
  const oklch = palette.palettes[0]!.base.oklch;
  return `oklch(${oklch.l.toFixed(4)} ${oklch.c.toFixed(4)} ${oklch.h.toFixed(2)} / ${alpha.toFixed(2)})`;
}

/**
 * Generate glass utility classes for each configured color
 */
export function generateGlassUtilities(
  config: GlassConfig,
  palette: FullPalette,
  comments: boolean,
): string {
  const lines: string[] = [];

  if (comments) lines.push("/* Glass Utilities */");

  const darkAlphaBump = 0.04;

  for (const colorName of config.colors) {
    const names = palette.palettes.map((_, i) => getHarmonyName(i));
    const name = names.includes(colorName) ? colorName : "primary";
    const bgColor = resolveGlassColor(name, palette, config.opacity);
    const darkBgColor = resolveGlassColor(name, palette, config.opacity + darkAlphaBump);

    lines.push(`.glass-${name} {`);
    lines.push(`    backdrop-filter: blur(${config.blur}px) saturate(${config.saturation});`);
    lines.push(
      `    -webkit-backdrop-filter: blur(${config.blur}px) saturate(${config.saturation});`,
    );
    lines.push(`    background-color: ${bgColor};`);
    lines.push("}");

    lines.push(`.dark .glass-${name} {`);
    lines.push(`    background-color: ${darkBgColor};`);
    lines.push("}");
  }

  return lines.join("\n");
}
