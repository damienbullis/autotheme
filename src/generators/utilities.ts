/**
 * Generate CSS utility classes for gradients and noise
 * Uses Tailwind-compatible variable names
 */
export function generateUtilityClasses(prefix: string = "color"): string {
  return `
/* Utility Classes */

.gradient-linear {
    --gradient-stops: var(--gradient-from, var(--${prefix}-primary-500)) var(--gradient-from-position, -20%), var(--gradient-to, transparent) var(--gradient-to-position, 120%);
    background-image: linear-gradient(var(--gradient-direction, to right), var(--gradient-stops));
}

.gradient-radial {
    --gradient-stops: var(--gradient-from, var(--${prefix}-primary-500)) var(--gradient-from-position, 0%), var(--gradient-to, transparent) var(--gradient-to-position, 100%);
    background-image: radial-gradient(var(--gradient-scale, 100% 100%) at var(--gradient-position, 50% 50%), var(--gradient-stops));
}

.bg-noise {
    background-image: var(--background-image-noise);
}

.bg-noise-overlay {
    position: relative;
}

.bg-noise-overlay::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: var(--background-image-noise);
    opacity: 0.1;
    pointer-events: none;
}`.trim();
}
