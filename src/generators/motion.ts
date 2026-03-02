import type { AutoThemeConfig } from "../config/types";

export interface MotionConfig {
  enabled: boolean;
  spring: {
    stiffness: number;
    damping: number;
    mass: number;
  };
  durations: {
    base: number;
    ratio: number;
    steps: number;
  };
  reducedMotion: boolean;
}

/**
 * Simulate a spring and sample it into a CSS linear() easing function.
 * Uses a critically-damped spring model for natural motion.
 */
function springToLinearEasing(stiffness: number, damping: number, mass: number): string {
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  // Sample the spring at 20 points
  const samples = 20;
  const values: number[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    // Scale time so spring settles in ~1 second
    const time = t * 4;
    let value: number;

    if (zeta < 1) {
      // Underdamped
      const omegaD = omega * Math.sqrt(1 - zeta * zeta);
      value =
        1 -
        Math.exp(-zeta * omega * time) *
          (Math.cos(omegaD * time) + ((zeta * omega) / omegaD) * Math.sin(omegaD * time));
    } else if (zeta === 1) {
      // Critically damped
      value = 1 - Math.exp(-omega * time) * (1 + omega * time);
    } else {
      // Overdamped
      const s1 = omega * (-zeta + Math.sqrt(zeta * zeta - 1));
      const s2 = omega * (-zeta - Math.sqrt(zeta * zeta - 1));
      value = 1 - (s2 * Math.exp(s1 * time) - s1 * Math.exp(s2 * time)) / (s2 - s1);
    }

    values.push(Math.round(Math.max(0, Math.min(1, value)) * 1000) / 1000);
  }

  return `linear(${values.join(", ")})`;
}

/**
 * Generate motion tokens: durations, easings, and transitions.
 */
export function generateMotionCSS(config: AutoThemeConfig): string {
  const motion = config.motion;
  if (!motion?.enabled) return "";

  const comments = config.output.comments;
  const lines: string[] = [];

  if (comments) {
    lines.push("/* ========================================");
    lines.push("   AutoTheme Motion Tokens");
    lines.push("   ======================================== */");
    lines.push("");
  }

  lines.push(":root {");

  // Duration scale
  if (comments) lines.push("    /* Duration Scale */");
  const { base, ratio, steps } = motion.durations;
  for (let i = 1; i <= steps; i++) {
    const duration = Math.round(base * Math.pow(ratio, i - 1));
    lines.push(`    --duration-${i}: ${duration}ms;`);
  }

  // Spring easing
  lines.push("");
  if (comments) lines.push("    /* Spring Easing */");
  const { stiffness, damping, mass } = motion.spring;
  lines.push(`    --ease-spring: ${springToLinearEasing(stiffness, damping, mass)};`);

  // Standard easings
  lines.push("    --ease-in: cubic-bezier(0.4, 0, 1, 1);");
  lines.push("    --ease-out: cubic-bezier(0, 0, 0.2, 1);");
  lines.push("    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);");

  // Composite transitions
  lines.push("");
  if (comments) lines.push("    /* Composite Transitions */");
  lines.push(
    "    --transition-colors: color var(--duration-2) var(--ease-out), background-color var(--duration-2) var(--ease-out), border-color var(--duration-2) var(--ease-out);",
  );
  lines.push("    --transition-transform: transform var(--duration-2) var(--ease-spring);");
  lines.push("    --transition-opacity: opacity var(--duration-2) var(--ease-out);");
  lines.push("    --transition-all: all var(--duration-3) var(--ease-out);");

  lines.push("}");

  // Reduced motion overrides
  if (motion.reducedMotion) {
    lines.push("");
    if (comments) lines.push("/* Reduced Motion */");
    lines.push("@media (prefers-reduced-motion: reduce) {");
    lines.push("  :root {");
    for (let i = 1; i <= steps; i++) {
      lines.push(`    --duration-${i}: 0ms;`);
    }
    lines.push("    --ease-spring: linear;");
    lines.push("    --transition-colors: none;");
    lines.push("    --transition-transform: none;");
    lines.push("    --transition-opacity: none;");
    lines.push("    --transition-all: none;");
    lines.push("  }");
    lines.push("}");
  }

  return lines.join("\n");
}
