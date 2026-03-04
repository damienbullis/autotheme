import { Color } from "../core/color";
import type { StatesConfig } from "../config/types";
import type { SemanticToken } from "./semantic";

/** Sentinel color for rawCSS-only tokens (not rendered as a color value). */
const SENTINEL = Color.fromOklch(0, 0, 0);

/**
 * Generate universal state modifier tokens.
 *
 * v2: Emits ~6 universal L-delta / property tokens that compose with any
 * color via CSS `oklch(from var(--accent) calc(l + var(--state-hover)) c h)`.
 * No per-accent resolved colors — constant token count regardless of palette.
 */
export function generateStateTokens(config: StatesConfig, mode: "light" | "dark"): SemanticToken[] {
  const isDark = mode === "dark";

  // Hover: lighten in dark mode (positive delta), darken in light mode (negative delta)
  const hoverDelta = isDark ? config.hover : -config.hover;
  // Active: stays as configured (negative = darken)
  const activeDelta = config.active;

  const focusColor = config.focus.color ?? "var(--accent)";
  const focusWidth = config.focus.width ?? "2px";
  const focusOffset = config.focus.offset ?? "2px";

  return [
    { name: "state-hover", value: SENTINEL, rawCSS: String(hoverDelta) },
    { name: "state-active", value: SENTINEL, rawCSS: String(activeDelta) },
    { name: "state-disabled-opacity", value: SENTINEL, rawCSS: String(config.disabled.opacity) },
    { name: "focus-ring-color", value: SENTINEL, rawCSS: focusColor },
    { name: "focus-ring-width", value: SENTINEL, rawCSS: focusWidth },
    { name: "focus-ring-offset", value: SENTINEL, rawCSS: focusOffset },
  ];
}
