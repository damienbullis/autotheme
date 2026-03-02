import type { GeneratedTheme } from "./types";
import { getHarmonyName } from "./css";

/**
 * Generate @property declarations for theme base values.
 * Enables CSS transitions and animations on custom properties.
 */
export function generatePropertyDeclarations(theme: GeneratedTheme): string {
  const { palette, config } = theme;
  const prefix = config.palette.prefix;
  const comments = config.output.comments;
  const lines: string[] = [];

  if (comments) {
    lines.push("/* Registered Custom Properties (@property) */");
    lines.push("");
  }

  // Register base color properties for each harmony
  palette.palettes.forEach((_, i) => {
    const name = getHarmonyName(i);
    lines.push(`@property --${prefix}-${name}-500 {`);
    lines.push('  syntax: "<color>";');
    lines.push("  inherits: true;");
    lines.push(`  initial-value: ${palette.palettes[i]!.base.formatAs("oklch")};`);
    lines.push("}");
    lines.push("");
  });

  // Register semantic properties if enabled
  if (config.semantics.enabled) {
    const semanticProps = [
      "surface",
      "surface-elevated",
      "surface-sunken",
      "border",
      "border-subtle",
      "border-strong",
      "text-1",
      "text-2",
      "accent",
      "accent-subtle",
      "accent-secondary",
    ];

    for (const prop of semanticProps) {
      lines.push(`@property --${prop} {`);
      lines.push('  syntax: "<color>";');
      lines.push("  inherits: true;");
      lines.push("  initial-value: transparent;");
      lines.push("}");
      lines.push("");
    }
  }

  return lines.join("\n");
}
