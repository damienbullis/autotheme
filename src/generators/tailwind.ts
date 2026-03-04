import { basename } from "path";
import type { GeneratedTheme, GeneratorOutput } from "./types";
import {
  generateCenteredScale,
  generateScaledValues,
  generateTypographyNames,
  getHarmonyName,
} from "./css";

/**
 * Generate Tailwind v4 compatible CSS with @import + @theme directives.
 */
export function generateTailwindCSS(theme: GeneratedTheme): GeneratorOutput {
  const { config, palette } = theme;
  const prefix = config.palette !== false ? config.palette.prefix : "color";
  const lines: string[] = [];

  // Import the main CSS file
  const cssFilename = basename(config.output.path);
  lines.push(`@import "./${cssFilename}";`);
  lines.push("");

  lines.push("/* ========================================");
  lines.push("   Tailwind v4 Theme Integration");
  lines.push("   ======================================== */");
  lines.push("@theme {");

  // Palette colors
  lines.push("    /* Palette Colors */");
  const harmonyNames = palette.palettes.map((_, i) => getHarmonyName(i));

  if (config.palette !== false) {
    // Full scale registered
    const scales = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
    for (const name of harmonyNames) {
      for (const scale of scales) {
        lines.push(`    --color-${name}-${scale}: var(--${prefix}-${name}-${scale});`);
      }
      lines.push(`    --color-${name}-foreground: var(--${prefix}-${name}-foreground);`);
      lines.push(`    --color-${name}-contrast: var(--${prefix}-${name}-contrast);`);
      for (let t = 1; t <= 4; t++) {
        lines.push(`    --color-${name}-tone-${t}: var(--${prefix}-${name}-tone-${t});`);
      }
    }
  } else {
    // Base colors only
    for (const name of harmonyNames) {
      lines.push(`    --color-${name}: var(--${prefix}-${name});`);
    }
  }
  lines.push("");

  // Semantic tokens (when enabled)
  if (config.semantics !== false) {
    lines.push("    /* Semantic Tokens */");
    lines.push("    --color-surface: var(--surface);");
    lines.push("    --color-surface-sunken: var(--surface-sunken);");
    lines.push("    --color-text-1: var(--text-1);");
    lines.push("    --color-text-2: var(--text-2);");
    if (config.semantics.text.levels >= 3) {
      lines.push("    --color-text-3: var(--text-3);");
    }
    lines.push("    --color-accent: var(--accent);");
    lines.push("    --color-accent-foreground: var(--accent-foreground);");
    lines.push("    --color-accent-secondary: var(--accent-secondary);");
    lines.push("    --color-accent-secondary-foreground: var(--accent-secondary-foreground);");
    lines.push("    --color-border: var(--border);");
    lines.push("    --color-border-subtle: var(--border-subtle);");
    lines.push("    --color-border-strong: var(--border-strong);");

    // Tinted surfaces
    for (const name of harmonyNames) {
      lines.push(`    --color-surface-${name}: var(--surface-${name});`);
      lines.push(`    --color-surface-${name}-foreground: var(--surface-${name}-foreground);`);
    }
    lines.push("");
  }

  // Shadcn colors (when enabled)
  if (config.shadcn !== false) {
    lines.push("    /* Shadcn UI Semantic Colors */");
    lines.push("    --color-background: var(--background);");
    lines.push("    --color-foreground: var(--foreground);");
    lines.push("");
    lines.push("    --color-card: var(--card);");
    lines.push("    --color-card-foreground: var(--card-foreground);");
    lines.push("");
    lines.push("    --color-popover: var(--popover);");
    lines.push("    --color-popover-foreground: var(--popover-foreground);");
    lines.push("");
    lines.push("    --color-primary: var(--primary);");
    lines.push("    --color-primary-foreground: var(--primary-foreground);");
    lines.push("");
    lines.push("    --color-secondary: var(--secondary);");
    lines.push("    --color-secondary-foreground: var(--secondary-foreground);");
    lines.push("");
    lines.push("    --color-muted: var(--muted);");
    lines.push("    --color-muted-foreground: var(--muted-foreground);");
    lines.push("");
    lines.push("    --color-accent: var(--accent);");
    lines.push("    --color-accent-foreground: var(--accent-foreground);");
    lines.push("");
    lines.push("    --color-destructive: var(--destructive);");
    lines.push("    --color-destructive-foreground: var(--destructive-foreground);");
    lines.push("");
    lines.push("    --color-border: var(--border);");
    lines.push("    --color-input: var(--input);");
    lines.push("    --color-ring: var(--ring);");
    lines.push("");
    lines.push("    /* Chart Colors */");
    for (let i = 1; i <= 5; i++) {
      lines.push(`    --color-chart-${i}: var(--chart-${i});`);
    }
    lines.push("");
    lines.push("    /* Sidebar Colors */");
    lines.push("    --color-sidebar: var(--sidebar);");
    lines.push("    --color-sidebar-foreground: var(--sidebar-foreground);");
    lines.push("    --color-sidebar-primary: var(--sidebar-primary);");
    lines.push("    --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);");
    lines.push("    --color-sidebar-accent: var(--sidebar-accent);");
    lines.push("    --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);");
    lines.push("    --color-sidebar-border: var(--sidebar-border);");
    lines.push("    --color-sidebar-ring: var(--sidebar-ring);");
    lines.push("");

    lines.push("    /* Radius */");
    lines.push("    --radius-sm: calc(var(--radius) - 4px);");
    lines.push("    --radius-md: calc(var(--radius) - 2px);");
    lines.push("    --radius-lg: var(--radius);");
    lines.push("    --radius-xl: calc(var(--radius) + 4px);");
    lines.push("");
  }

  // Typography scale
  if (config.typography !== false) {
    lines.push("    /* Typography Scale */");
    const typo = config.typography;
    const textSizes = typo.values
      ? typo.values
      : generateCenteredScale(typo.base, typo.ratio, typo.steps);
    const sizeNames = typo.names ?? generateTypographyNames(textSizes.length);
    textSizes.forEach((_: number, i: number) => {
      const name = sizeNames[i] ?? `size-${i + 1}`;
      lines.push(`    --text-${name}: var(--text-${name});`);
    });
    lines.push("");
  }

  // Spacing scale
  if (config.spacing !== false) {
    lines.push("    /* Spacing Scale */");
    const sp = config.spacing;
    const spacings = sp.values ? sp.values : generateScaledValues(sp.base, sp.ratio, sp.steps);
    spacings.forEach((_: number, i: number) => {
      lines.push(`    --spacing-${i + 1}: var(--spacing-${i + 1});`);
    });
    lines.push("");
  }

  // Shadow scale
  if (config.shadows !== false) {
    lines.push("    /* Shadow Scale */");
    const count = config.shadows.values?.length ?? config.shadows.steps;
    for (let i = 1; i <= count; i++) {
      lines.push(`    --shadow-${i}: var(--shadow-${i});`);
    }
    lines.push("");
  }

  // Radius scale
  if (config.radius !== false) {
    lines.push("    /* Border Radius Scale */");
    const count = config.radius.values?.length ?? config.radius.steps;
    for (let i = 1; i <= count; i++) {
      lines.push(`    --radius-${i}: var(--radius-${i});`);
    }
    lines.push("");
  }

  lines.push("}");

  // @theme inline
  if (config.noise || config.gradients) {
    lines.push("");
    lines.push("@theme inline {");
    if (config.noise) {
      lines.push("    --background-image-noise: var(--background-image-noise);");
    }
    if (config.gradients) {
      const primaryRef =
        config.palette !== false ? `var(--${prefix}-primary-500)` : `var(--${prefix}-primary)`;
      lines.push(
        `    --background-image-linear: linear-gradient(var(--gradient-direction, to right), var(--gradient-from, ${primaryRef}), var(--gradient-to, transparent));`,
      );
      lines.push(
        `    --background-image-radial: radial-gradient(var(--gradient-scale, 100%) at var(--gradient-position, 50% 50%), var(--gradient-from, ${primaryRef}), var(--gradient-to, transparent));`,
      );
    }
    lines.push("}");
  }

  // Custom utilities
  lines.push("");
  lines.push("/* Custom Utilities */");
  lines.push("@utility radial-position-* {");
  lines.push("    --gradient-position: *;");
  lines.push("}");
  lines.push("");
  lines.push("@utility radial-scale-* {");
  lines.push("    --gradient-scale: *;");
  lines.push("}");
  lines.push("");
  lines.push("@utility gradient-from-* {");
  lines.push("    --gradient-from: *;");
  lines.push("}");
  lines.push("");
  lines.push("@utility gradient-to-* {");
  lines.push("    --gradient-to: *;");
  lines.push("}");

  const outputPath = config.output.path.replace(".css", ".tailwind.css");

  return {
    filename: outputPath,
    content: lines.join("\n"),
  };
}
