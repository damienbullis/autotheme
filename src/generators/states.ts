import type { StatesConfig } from "../config/types";
import type { SemanticToken, SemanticTokenSet } from "./semantic";

/**
 * Generate interactive state tokens for accent and surface colors.
 * In light mode, hover/active darken; in dark mode, they lighten.
 */
export function generateStateTokens(
  tokens: SemanticTokenSet,
  config: StatesConfig,
  mode: "light" | "dark",
): SemanticToken[] {
  const isDark = mode === "dark";
  const stateTokens: SemanticToken[] = [];

  // Find accent, accent-secondary, and surface tokens
  const accent = tokens.accents.find((t) => t.name === "accent");
  const accentSecondary = tokens.accents.find((t) => t.name === "accent-secondary");
  const surface = tokens.surfaces.find((t) => t.name === "surface");

  if (accent) {
    const base = accent.value;
    const hover = isDark ? base.lighten(config.hoverShift) : base.darken(config.hoverShift);
    const active = isDark ? base.lighten(config.activeShift) : base.darken(config.activeShift);
    const focusRing = base.alpha(config.focusRingAlpha / 100);
    const disabled = base.desaturate(config.disabledDesat).alpha(config.disabledAlpha / 100);

    stateTokens.push({ name: "accent-hover", value: hover });
    stateTokens.push({ name: "accent-active", value: active });
    stateTokens.push({ name: "accent-focus-ring", value: focusRing });
    stateTokens.push({ name: "accent-disabled", value: disabled });
  }

  if (accentSecondary) {
    const base = accentSecondary.value;
    const hover = isDark ? base.lighten(config.hoverShift) : base.darken(config.hoverShift);
    const active = isDark ? base.lighten(config.activeShift) : base.darken(config.activeShift);
    const disabled = base.desaturate(config.disabledDesat).alpha(config.disabledAlpha / 100);

    stateTokens.push({ name: "accent-secondary-hover", value: hover });
    stateTokens.push({ name: "accent-secondary-active", value: active });
    stateTokens.push({ name: "accent-secondary-disabled", value: disabled });
  }

  if (surface) {
    const base = surface.value;
    const hover = isDark ? base.lighten(config.hoverShift) : base.darken(config.hoverShift);
    const active = isDark ? base.lighten(config.activeShift) : base.darken(config.activeShift);

    stateTokens.push({ name: "surface-hover", value: hover });
    stateTokens.push({ name: "surface-active", value: active });
  }

  return stateTokens;
}
