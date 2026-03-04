import type { Color } from "../core/color";
import type { PatternsConfig, PatternType, PatternDensity, ColorFormat } from "../config/types";

interface DensityParams {
  spacing: number;
  strokeWidth: number;
}

const DENSITY_MAP: Record<PatternDensity, DensityParams> = {
  sm: { spacing: 20, strokeWidth: 1 },
  md: { spacing: 12, strokeWidth: 2 },
  lg: { spacing: 8, strokeWidth: 3 },
};

/**
 * Generate an SVG data URL for a pattern type.
 */
export function generatePatternSVG(
  type: PatternType,
  color: string,
  density: PatternDensity,
): string {
  const { spacing, strokeWidth } = DENSITY_MAP[density];
  const size = spacing;

  let svgContent: string;
  switch (type) {
    case "stripes-diagonal":
      svgContent =
        `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
        `<line x1='0' y1='${size}' x2='${size}' y2='0' ` +
        `stroke='${color}' stroke-width='${strokeWidth}'/>` +
        `</svg>`;
      break;

    case "stripes-horizontal":
      svgContent =
        `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
        `<line x1='0' y1='${size / 2}' x2='${size}' y2='${size / 2}' ` +
        `stroke='${color}' stroke-width='${strokeWidth}'/>` +
        `</svg>`;
      break;

    case "stripes-vertical":
      svgContent =
        `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
        `<line x1='${size / 2}' y1='0' x2='${size / 2}' y2='${size}' ` +
        `stroke='${color}' stroke-width='${strokeWidth}'/>` +
        `</svg>`;
      break;

    case "dots":
      svgContent =
        `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
        `<circle cx='${size / 2}' cy='${size / 2}' r='${strokeWidth}' ` +
        `fill='${color}'/>` +
        `</svg>`;
      break;

    case "crosshatch":
      svgContent =
        `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
        `<line x1='0' y1='${size}' x2='${size}' y2='0' ` +
        `stroke='${color}' stroke-width='${strokeWidth}'/>` +
        `<line x1='0' y1='0' x2='${size}' y2='${size}' ` +
        `stroke='${color}' stroke-width='${strokeWidth}'/>` +
        `</svg>`;
      break;
  }

  const encoded = encodeURIComponent(svgContent).replace(/'/g, "%27").replace(/"/g, "%22");
  return `url("data:image/svg+xml,${encoded}")`;
}

/**
 * Generate CSS variable declarations for pattern utilities.
 */
export function generatePatternCSS(
  config: PatternsConfig,
  _primaryColor: Color,
  borderColor: Color,
  format: ColorFormat,
  comments: boolean,
): string {
  const lines: string[] = [];
  // Use the border color for patterns — it's typically a muted, visible tone
  const patternColor = borderColor.formatAs(format);

  if (comments) lines.push("    /* Pattern Utilities */");

  for (const type of config.types) {
    const svgUrl = generatePatternSVG(type, patternColor, config.density);
    lines.push(`    --pattern-${type}: ${svgUrl};`);
  }

  return lines.join("\n");
}
