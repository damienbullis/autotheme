import type { GeneratedTheme, GeneratorOutput } from "./types";
import { generateCSS, generateScaledValues, getHarmonyName } from "./css";

/**
 * Generate Tailwind v4 compatible CSS with @theme directive
 * Colors already use Tailwind namespaces (--color-*) from generateCSS
 */
export function generateTailwindCSS(theme: GeneratedTheme): GeneratorOutput {
  const { config, palette } = theme;
  const prefix = config.prefix;
  const lines: string[] = [];

  // CSS variables first (includes Shadcn variables and Tailwind-namespaced colors)
  lines.push("/* AutoTheme Variables (Tailwind v4 compatible) */");
  lines.push(generateCSS(theme).content);
  lines.push("");

  // Tailwind @theme mapping for additional integrations
  lines.push("/* ========================================");
  lines.push("   Tailwind v4 Theme Integration");
  lines.push("   ======================================== */");
  lines.push("@theme {");

  // Semantic token mappings (always emitted)
  lines.push("    /* Semantic Design Tokens */");
  lines.push("    --color-surface: var(--surface);");
  lines.push("    --color-surface-foreground: var(--surface-foreground);");
  lines.push("    --color-surface-dim: var(--surface-dim);");
  lines.push("    --color-surface-bright: var(--surface-bright);");
  lines.push("    --color-surface-container: var(--surface-container);");
  lines.push("    --color-surface-container-foreground: var(--surface-container-foreground);");
  lines.push("    --color-surface-container-high: var(--surface-container-high);");
  lines.push("    --color-surface-container-low: var(--surface-container-low);");
  lines.push("");
  lines.push("    --color-primary-container: var(--primary-container);");
  lines.push("    --color-primary-container-foreground: var(--primary-container-foreground);");
  lines.push("");
  lines.push("    --color-secondary-container: var(--secondary-container);");
  lines.push("    --color-secondary-container-foreground: var(--secondary-container-foreground);");
  lines.push("");
  lines.push("    --color-tertiary: var(--tertiary);");
  lines.push("    --color-tertiary-foreground: var(--tertiary-foreground);");
  lines.push("    --color-tertiary-container: var(--tertiary-container);");
  lines.push("    --color-tertiary-container-foreground: var(--tertiary-container-foreground);");
  lines.push("");
  lines.push("    --color-accent-container: var(--accent-container);");
  lines.push("    --color-accent-container-foreground: var(--accent-container-foreground);");
  lines.push("");
  lines.push("    --color-error: var(--error);");
  lines.push("    --color-error-foreground: var(--error-foreground);");
  lines.push("    --color-error-container: var(--error-container);");
  lines.push("    --color-error-container-foreground: var(--error-container-foreground);");
  lines.push("");
  lines.push("    --color-outline: var(--outline);");
  lines.push("    --color-outline-variant: var(--outline-variant);");
  lines.push("");
  lines.push("    --color-inverse-surface: var(--inverse-surface);");
  lines.push("    --color-inverse-surface-foreground: var(--inverse-surface-foreground);");
  lines.push("    --color-inverse-primary: var(--inverse-primary);");
  lines.push("");
  lines.push("    --color-muted-container: var(--muted-container);");
  lines.push("");

  // Shadcn UI semantic color mappings (only when shadcn is enabled)
  if (config.shadcn) {
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
    lines.push("    --color-chart-1: var(--chart-1);");
    lines.push("    --color-chart-2: var(--chart-2);");
    lines.push("    --color-chart-3: var(--chart-3);");
    lines.push("    --color-chart-4: var(--chart-4);");
    lines.push("    --color-chart-5: var(--chart-5);");
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

    // Radius
    lines.push("    /* Radius */");
    lines.push("    --radius-sm: calc(var(--radius) - 4px);");
    lines.push("    --radius-md: calc(var(--radius) - 2px);");
    lines.push("    --radius-lg: var(--radius);");
    lines.push("    --radius-xl: calc(var(--radius) + 4px);");
    lines.push("");
  }

  // Typography scale in @theme
  lines.push("    /* Typography Scale */");
  const textSizes = generateScaledValues(config.fontSize, config.scalar, 8);
  const sizeNames = ["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl"];
  textSizes.forEach((size, i) => {
    lines.push(`    --text-${sizeNames[i]}: ${size.toFixed(3)}rem;`);
  });
  lines.push("");

  // Spacing scale in @theme (when enabled)
  if (config.spacing) {
    lines.push("    /* Spacing Scale */");
    const spacings = generateScaledValues(0.155, config.scalar, 10);
    spacings.forEach((space, i) => {
      lines.push(`    --spacing-${i + 1}: ${space.toFixed(3)}rem;`);
    });
    lines.push("");
  }

  // Prefix remapping: when prefix !== "color", map --color-* to var(--{prefix}-*) so Tailwind utilities work
  if (prefix !== "color") {
    lines.push("    /* Color Prefix Remapping */");
    const harmonyNames = palette.palettes.map((_, i) => getHarmonyName(i));
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
    lines.push("");
  }

  // Background images (noise only when enabled)
  if (config.noise) {
    lines.push("    /* Background Images */");
    lines.push("    --background-image-noise: var(--background-image-noise);");
    lines.push(
      `    --background-image-linear: linear-gradient(var(--gradient-direction, to right), var(--gradient-from, var(--${prefix}-primary-500)), var(--gradient-to, transparent));`,
    );
    lines.push(
      `    --background-image-radial: radial-gradient(var(--gradient-scale, 100%) at var(--gradient-position, 50% 50%), var(--gradient-from, var(--${prefix}-primary-500)), var(--gradient-to, transparent));`,
    );
  }

  lines.push("}");

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

  const outputPath = config.output.replace(".css", ".tailwind.css");

  return {
    filename: outputPath,
    content: lines.join("\n"),
  };
}
