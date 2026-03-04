import type { StatesConfig } from "../config/types";
import type { SemanticToken, SemanticTokenSet } from "./semantic";

/**
 * Generate interactive state tokens for accent and surface colors.
 * v2: States use OKLCH L deltas instead of HSL shifts.
 */
export function generateStateTokens(
  tokens: SemanticTokenSet,
  config: StatesConfig,
  mode: "light" | "dark",
): SemanticToken[] {
  const isDark = mode === "dark";
  const stateTokens: SemanticToken[] = [];

  const accent = tokens.accents.find((t) => t.name === "accent");
  const accentSecondary = tokens.accents.find((t) => t.name === "accent-secondary");
  const surface = tokens.surfaces.find((t) => t.name === "surface");

  if (accent) {
    const base = accent.value;
    // In dark mode lighten on hover, in light mode darken
    const hoverDelta = isDark ? config.hover : -config.hover;
    const activeDelta = isDark ? -config.active : config.active;
    const hover = base.lighten(Math.abs(hoverDelta) * 100 * (hoverDelta > 0 ? 1 : -1));
    const active = base.darken(Math.abs(activeDelta) * 100 * (activeDelta > 0 ? 1 : -1));
    const disabled = base.desaturate(60).alpha(config.disabled.opacity);

    stateTokens.push({ name: "accent-hover", value: hover });
    stateTokens.push({ name: "accent-active", value: active });
    stateTokens.push({ name: "accent-disabled", value: disabled });
  }

  if (accentSecondary) {
    const base = accentSecondary.value;
    const hoverDelta = isDark ? config.hover : -config.hover;
    const activeDelta = isDark ? -config.active : config.active;
    const hover = base.lighten(Math.abs(hoverDelta) * 100 * (hoverDelta > 0 ? 1 : -1));
    const active = base.darken(Math.abs(activeDelta) * 100 * (activeDelta > 0 ? 1 : -1));
    const disabled = base.desaturate(60).alpha(config.disabled.opacity);

    stateTokens.push({ name: "accent-secondary-hover", value: hover });
    stateTokens.push({ name: "accent-secondary-active", value: active });
    stateTokens.push({ name: "accent-secondary-disabled", value: disabled });
  }

  if (surface) {
    const base = surface.value;
    const hoverDelta = isDark ? config.hover : -config.hover;
    const activeDelta = isDark ? -config.active : config.active;
    const hover = base.lighten(Math.abs(hoverDelta) * 100 * (hoverDelta > 0 ? 1 : -1));
    const active = base.darken(Math.abs(activeDelta) * 100 * (activeDelta > 0 ? 1 : -1));

    stateTokens.push({ name: "surface-hover", value: hover });
    stateTokens.push({ name: "surface-active", value: active });
  }

  return stateTokens;
}
