import { Color } from "../core/color";
import type { GeneratedTheme } from "./types";
import { getHarmonyName } from "./css";
import { generateShadowScale } from "./shadow";

/**
 * Generate dark mode CSS with inverted text colors.
 * Only applies to palette scale (semantic dark mode handled by semantic generator).
 */
export function generateDarkModeCSS(theme: GeneratedTheme): string {
  const { palette, config } = theme;
  const prefix = config.palette !== false ? config.palette.prefix : "color";
  const colorFormat = config.output.format;
  const mode = config.mode;
  const lines: string[] = [];

  const comments = config.output.comments;
  const selector = mode === "dark" ? ":root" : ".dark";
  lines.push(`${selector} {`);
  if (comments) lines.push("    /* Dark Mode Color Overrides */");

  palette.palettes.forEach((p, i) => {
    const name = getHarmonyName(i);
    lines.push("");
    if (comments) {
      lines.push(`    /* ${name.charAt(0).toUpperCase() + name.slice(1)} Dark Mode */`);
    }

    const darkForeground = findDarkModeTextColor(p.base);
    lines.push(`    --${prefix}-${name}-foreground: ${darkForeground.formatAs(colorFormat)};`);

    const contrastColor = findDarkModeContrastColor(p.base);
    lines.push(`    --${prefix}-${name}-contrast: ${contrastColor.formatAs(colorFormat)};`);
  });

  // Dark mode shadow overrides
  if (mode === "both" && config.shadows !== false && !config.shadows.values) {
    const primaryHue = palette.palettes[0]!.base.hsl.h;
    lines.push("");
    if (comments) lines.push("    /* Dark Mode Shadow Overrides */");
    const darkShadows = generateShadowScale(
      config.shadows.steps,
      config.shadows.base,
      config.shadows.ratio,
      primaryHue,
      config.shadows.colorTint,
      true,
      colorFormat,
    );
    for (const s of darkShadows) {
      lines.push(`    --${s.name}: ${s.value};`);
    }
  }

  lines.push("}");

  return lines.join("\n");
}

function findDarkModeTextColor(bg: Color): Color {
  const hsl = bg.hsl;
  return new Color({
    h: hsl.h,
    s: Math.min(100, hsl.s * 0.8),
    l: Math.max(0, hsl.l - 40),
    a: 1,
  });
}

function findDarkModeContrastColor(bg: Color): Color {
  return bg.luminance > 0.5
    ? new Color({ h: bg.hsl.h, s: 100, l: 5, a: 1 })
    : new Color({ h: bg.hsl.h, s: 20, l: 95, a: 1 });
}
