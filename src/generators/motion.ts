import type { ResolvedConfig } from "../config/types";

/**
 * Simulate a spring and sample it into a CSS linear() easing function.
 */
function springToLinearEasing(stiffness: number, damping: number, mass: number): string {
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));

  const samples = 20;
  const values: number[] = [];

  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const time = t * 4;
    let value: number;

    if (zeta < 1) {
      const omegaD = omega * Math.sqrt(1 - zeta * zeta);
      value =
        1 -
        Math.exp(-zeta * omega * time) *
          (Math.cos(omegaD * time) + ((zeta * omega) / omegaD) * Math.sin(omegaD * time));
    } else if (zeta === 1) {
      value = 1 - Math.exp(-omega * time) * (1 + omega * time);
    } else {
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
export function generateMotionCSS(config: ResolvedConfig): string {
  if (config.motion === false) return "";
  const motion = config.motion;

  const comments = config.output.comments;
  const lines: string[] = [];

  if (comments) {
    lines.push("/* ========================================");
    lines.push("   AutoTheme Motion Tokens");
    lines.push("   ======================================== */");
    lines.push("");
  }

  lines.push(":root {");

  if (comments) lines.push("    /* Duration Scale */");
  const { base, ratio, steps } = motion.durations;
  for (let i = 1; i <= steps; i++) {
    const duration = Math.round(base * Math.pow(ratio, i - 1));
    lines.push(`    --duration-${i}: ${duration}ms;`);
  }

  lines.push("");
  if (comments) lines.push("    /* Spring Easing */");
  const { stiffness, damping, mass } = motion.spring;
  lines.push(`    --ease-spring: ${springToLinearEasing(stiffness, damping, mass)};`);

  lines.push("    --ease-in: cubic-bezier(0.4, 0, 1, 1);");
  lines.push("    --ease-out: cubic-bezier(0, 0, 0.2, 1);");
  lines.push("    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);");

  lines.push("");
  if (comments) lines.push("    /* Composite Transitions */");
  lines.push(
    "    --transition-colors: color var(--duration-2) var(--ease-out), background-color var(--duration-2) var(--ease-out), border-color var(--duration-2) var(--ease-out);",
  );
  lines.push("    --transition-transform: transform var(--duration-2) var(--ease-spring);");
  lines.push("    --transition-opacity: opacity var(--duration-2) var(--ease-out);");
  lines.push("    --transition-all: all var(--duration-3) var(--ease-out);");

  lines.push("}");

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
