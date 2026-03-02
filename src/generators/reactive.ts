import type { GeneratedTheme } from "./types";
import { getHarmonyName, buildScaleMapping } from "./css";

const DEFAULT_TINT_SCALE_POINTS = [50, 100, 200, 300, 400];
const DEFAULT_SHADE_SCALE_POINTS = [600, 700, 800, 900, 950];

/**
 * Generate reactive CSS palette using relative color syntax.
 * Instead of static OKLCH values, emits `oklch(from var(--base) ...)` expressions
 * that derive tints/shades/tones from a single base variable at runtime.
 */
export function generateReactiveCSS(theme: GeneratedTheme): string {
  const { palette, config } = theme;
  const prefix = config.palette.prefix;
  const comments = config.output.comments;
  const lines: string[] = [];

  const tintCount = palette.palettes[0]?.tints.length ?? 5;
  const shadeCount = palette.palettes[0]?.shades.length ?? 5;
  const tintScaleMap = buildScaleMapping(tintCount, DEFAULT_TINT_SCALE_POINTS);
  const shadeScaleMap = buildScaleMapping(shadeCount, DEFAULT_SHADE_SCALE_POINTS);

  palette.palettes.forEach((p, i) => {
    const name = getHarmonyName(i);
    const baseVar = `--${prefix}-${name}-500`;
    const baseOklch = p.base.oklch;

    lines.push("");
    if (comments) {
      lines.push(`    /* ${name.charAt(0).toUpperCase() + name.slice(1)} Reactive Scale */`);
    }

    // Emit the base color as a literal value
    lines.push(`    ${baseVar}: ${p.base.formatAs("oklch")};`);

    // Tints: lighten using relative color syntax
    for (let j = p.tints.length; j >= 1; j--) {
      const tint = p.tints[j - 1];
      if (!tint) continue;
      const scale = tintScaleMap[p.tints.length - j + 1];
      const tintOklch = tint.oklch;
      const lDelta = tintOklch.l - baseOklch.l;
      const cRatio = baseOklch.c > 0.001 ? tintOklch.c / baseOklch.c : 0;

      lines.push(
        `    --${prefix}-${name}-${scale}: oklch(from var(${baseVar}) calc(l + ${lDelta.toFixed(4)}) calc(c * ${cRatio.toFixed(4)}) h);`,
      );
    }

    // Shades: darken using relative color syntax
    for (let j = 1; j <= p.shades.length; j++) {
      const shade = p.shades[j - 1];
      if (!shade) continue;
      const scale = shadeScaleMap[j];
      const shadeOklch = shade.oklch;
      const lDelta = shadeOklch.l - baseOklch.l;
      const cRatio = baseOklch.c > 0.001 ? shadeOklch.c / baseOklch.c : 0;

      lines.push(
        `    --${prefix}-${name}-${scale}: oklch(from var(${baseVar}) calc(l + ${lDelta.toFixed(4)}) calc(c * ${cRatio.toFixed(4)}) h);`,
      );
    }

    // Tones: desaturate using relative color syntax
    p.tones.forEach((tone, j) => {
      const toneOklch = tone.oklch;
      const cRatio = baseOklch.c > 0.001 ? toneOklch.c / baseOklch.c : 0;

      lines.push(
        `    --${prefix}-${name}-tone-${j + 1}: oklch(from var(${baseVar}) l calc(c * ${cRatio.toFixed(4)}) h);`,
      );
    });
  });

  return lines.join("\n");
}
