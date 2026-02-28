import { Color } from "../core/color";
import type { GeneratedTheme } from "./types";
import { getHarmonyName } from "./css";

/**
 * Generate dark mode CSS with inverted text colors
 * Uses OKLCH color format and Tailwind-compatible `.dark` selector
 */
export function generateDarkModeCSS(theme: GeneratedTheme): string {
  const { palette, config } = theme;
  const prefix = config.prefix;
  const lines: string[] = [];

  lines.push(".dark {");
  lines.push("    /* Dark Mode Color Overrides */");

  // Inverted text/contrast colors for dark mode
  palette.palettes.forEach((p, i) => {
    const name = getHarmonyName(i);
    lines.push("");
    lines.push(`    /* ${name.charAt(0).toUpperCase() + name.slice(1)} Dark Mode */`);

    // Dark mode foreground (darker for light text on dark bg)
    const darkForeground = findDarkModeTextColor(p.base);
    lines.push(`    --${prefix}-${name}-foreground: ${darkForeground.toOKLCH()};`);

    // Contrast color (inverted for dark mode)
    const contrastColor = findDarkModeContrastColor(p.base);
    lines.push(`    --${prefix}-${name}-contrast: ${contrastColor.toOKLCH()};`);
  });

  lines.push("}");

  return lines.join("\n");
}

/**
 * Find a darker text color for dark mode backgrounds
 */
function findDarkModeTextColor(bg: Color): Color {
  const hsl = bg.hsl;
  return new Color({
    h: hsl.h,
    s: Math.min(100, hsl.s * 0.8),
    l: Math.max(0, hsl.l - 40),
    a: 1,
  });
}

/**
 * Find contrast color for dark mode (inverted from light mode)
 */
function findDarkModeContrastColor(bg: Color): Color {
  // In dark mode, we want light text on dark backgrounds
  return bg.luminance > 0.5
    ? new Color({ h: bg.hsl.h, s: 100, l: 5, a: 1 })
    : new Color({ h: bg.hsl.h, s: 20, l: 95, a: 1 });
}
