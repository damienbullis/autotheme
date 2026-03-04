import type {
  FiltersConfig,
  FilterGrainConfig,
  FilterGlowConfig,
  FilterDuotoneConfig,
} from "../config/types";
import type { FullPalette } from "../core/types";
import { Color } from "../core/color";
import { getHarmonyName } from "./css";

/**
 * Encode an SVG string to a CSS url() data URI
 */
function svgToDataUrl(svg: string): string {
  const encoded = encodeURIComponent(svg).replace(/'/g, "%27").replace(/"/g, "%22");
  return `url("data:image/svg+xml,${encoded}")`;
}

/**
 * Resolve a color name (e.g., "primary") to actual RGB from the palette,
 * or parse a literal color string.
 */
function resolveColor(
  colorName: string,
  palette: FullPalette,
): { r: number; g: number; b: number } {
  // Check if it matches a harmony name
  const names = palette.palettes.map((_, i) => getHarmonyName(i));
  const idx = names.indexOf(colorName);
  if (idx !== -1) {
    return palette.palettes[idx]!.base.rgb;
  }
  // Try parsing as a literal color
  try {
    return new Color(colorName).rgb;
  } catch {
    // Fallback to first palette color
    return palette.palettes[0]!.base.rgb;
  }
}

/**
 * Generate SVG grain/noise filter
 * Uses feTurbulence + feColorMatrix for desaturated film grain
 */
export function generateGrainFilter(config: FilterGrainConfig): { url: string; opacity: number } {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'><filter id='grain'><feTurbulence type='fractalNoise' baseFrequency='${config.frequency}' numOctaves='${config.octaves}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23grain)'/></svg>`;
  return { url: svgToDataUrl(svg), opacity: config.opacity };
}

/**
 * Generate SVG glow filter for a specific color
 * Uses feGaussianBlur + feComposite for a soft color glow
 */
export function generateGlowFilter(config: FilterGlowConfig, palette: FullPalette): string {
  const rgb = resolveColor(config.color, palette);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500'><filter id='glow'><feGaussianBlur stdDeviation='${config.blur}' result='blur'/><feFlood flood-color='rgb(${rgb.r},${rgb.g},${rgb.b})' flood-opacity='${config.intensity}' result='color'/><feComposite in='color' in2='blur' operator='in' result='glow'/><feMerge><feMergeNode in='glow'/><feMergeNode in='SourceGraphic'/></feMerge></filter><rect width='100%' height='100%' filter='url(%23glow)'/></svg>`;
  return svgToDataUrl(svg);
}

/**
 * Generate SVG duotone filter
 * Uses feColorMatrix type='matrix' to map luminance to two colors
 */
export function generateDuotoneFilter(config: FilterDuotoneConfig, palette: FullPalette): string {
  const shadow = resolveColor(config.shadow, palette);
  const highlight = resolveColor(config.highlight, palette);

  // Normalize to 0-1 range
  const sr = shadow.r / 255;
  const sg = shadow.g / 255;
  const sb = shadow.b / 255;
  const hr = highlight.r / 255;
  const hg = highlight.g / 255;
  const hb = highlight.b / 255;

  // Duotone matrix: maps grayscale input to two-color output
  // Each output channel = shadow_channel + (highlight_channel - shadow_channel) * luminance
  const dr = hr - sr;
  const dg = hg - sg;
  const db = hb - sb;

  // feColorMatrix values: R_from_R R_from_G R_from_B R_from_A R_offset ...
  // We use luminance coefficients (0.2126 0.7152 0.0722) to convert to grayscale
  // then map to duotone range
  const matrix = [
    `${(0.2126 * dr).toFixed(4)} ${(0.7152 * dr).toFixed(4)} ${(0.0722 * dr).toFixed(4)} 0 ${sr.toFixed(4)}`,
    `${(0.2126 * dg).toFixed(4)} ${(0.7152 * dg).toFixed(4)} ${(0.0722 * dg).toFixed(4)} 0 ${sg.toFixed(4)}`,
    `${(0.2126 * db).toFixed(4)} ${(0.7152 * db).toFixed(4)} ${(0.0722 * db).toFixed(4)} 0 ${sb.toFixed(4)}`,
    "0 0 0 1 0",
  ].join(" ");

  const svg = `<svg xmlns='http://www.w3.org/2000/svg'><filter id='duotone'><feColorMatrix type='matrix' values='${matrix}'/></filter></svg>`;
  return svgToDataUrl(svg);
}

/**
 * Generate all filter CSS variables
 */
export function generateFiltersCSS(
  config: FiltersConfig,
  palette: FullPalette,
  _prefix: string,
  comments: boolean,
): string {
  const lines: string[] = [];

  if (comments) lines.push("    /* SVG Filters */");

  if (config.grain !== false) {
    const grain = generateGrainFilter(config.grain);
    lines.push(`    --filter-grain: ${grain.url};`);
    lines.push(`    --filter-grain-opacity: ${grain.opacity};`);
  }

  if (config.glow !== false) {
    // Resolve which harmony name this glow targets
    const colorName = config.glow.color;
    const names = palette.palettes.map((_, i) => getHarmonyName(i));
    const harmonyName = names.includes(colorName) ? colorName : "primary";
    const url = generateGlowFilter(config.glow, palette);
    lines.push(`    --filter-glow-${harmonyName}: ${url};`);
  }

  if (config.duotone !== false) {
    const url = generateDuotoneFilter(config.duotone, palette);
    lines.push(`    --filter-duotone: ${url};`);
  }

  return lines.join("\n");
}
