import type { GeneratedTheme, GeneratorOutput } from "./types";
import { getHarmonyName } from "./css";

/**
 * Tailwind scale values for display
 */
const TINT_SCALES = [50, 100, 200, 300, 400] as const;
const SHADE_SCALES = [600, 700, 800, 900, 950] as const;

/**
 * Generate HTML preview page for the theme
 * Uses new Tailwind-compatible variable names
 */
export function generatePreview(theme: GeneratedTheme): GeneratorOutput {
  const { palette, config } = theme;
  const prefix = config.prefix;

  const colorSwatches = palette.palettes
    .map((_, i) => {
      const name = getHarmonyName(i);
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      return `
    <div class="color-group">
      <h3>${displayName}</h3>
      <div class="swatches">
        <div class="swatch base" style="background: var(--${prefix}-${name}-500);">
          <span style="color: var(--${prefix}-${name}-foreground);">500</span>
        </div>
        <div class="swatch-row">
          ${TINT_SCALES.map(
            (scale) => `
            <div class="swatch" style="background: var(--${prefix}-${name}-${scale});">${scale}</div>
          `,
          ).join("")}
        </div>
        <div class="swatch-row">
          ${SHADE_SCALES.map(
            (scale) => `
            <div class="swatch" style="background: var(--${prefix}-${name}-${scale}); color: white;">${scale}</div>
          `,
          ).join("")}
        </div>
        <div class="swatch-row">
          ${[1, 2, 3, 4]
            .map(
              (j) => `
            <div class="swatch" style="background: var(--${prefix}-${name}-tone-${j});">T${j}</div>
          `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
    })
    .join("");

  const gradientNames = palette.palettes.slice(1).map((_, i) => getHarmonyName(i + 1));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AutoTheme Preview</title>
  <link rel="stylesheet" href="${config.output}">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 2rem;
      min-height: 100vh;
      background: var(--background);
      color: var(--foreground);
    }
    h1 { margin-bottom: 1rem; color: var(--${prefix}-primary-500); }
    h2 { margin: 2rem 0 1rem; color: var(--${prefix}-primary-700); }
    h3 { margin-bottom: 0.5rem; font-size: 0.875rem; opacity: 0.7; }
    .info { margin-bottom: 2rem; padding: 1rem; border-radius: 0.5rem; background: var(--${prefix}-primary-50); }
    .info p { color: var(--${prefix}-primary-foreground); }
    .color-group { margin-bottom: 2rem; }
    .swatches { display: flex; flex-direction: column; gap: 0.5rem; }
    .swatch-row { display: flex; gap: 0.5rem; }
    .swatch {
      padding: 1rem;
      border-radius: 0.5rem;
      font-size: 0.75rem;
      min-width: 60px;
      text-align: center;
    }
    .swatch.base {
      padding: 2rem;
      font-size: 1rem;
    }
    .gradients { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .gradient-box {
      height: 100px;
      border-radius: 0.5rem;
      display: flex;
      align-items: end;
      padding: 0.5rem;
      font-size: 0.75rem;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
    .dark-toggle {
      position: fixed;
      top: 1rem;
      right: 1rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.5rem;
      cursor: pointer;
      background: var(--${prefix}-primary-500);
      color: var(--${prefix}-primary-contrast);
    }
  </style>
</head>
<body>
  <button class="dark-toggle" onclick="document.documentElement.classList.toggle('dark')">
    Toggle Dark Mode
  </button>

  <h1>AutoTheme Preview</h1>

  <div class="info">
    <p><strong>Harmony:</strong> ${config.harmony}</p>
    <p><strong>Primary Color:</strong> ${config.color}</p>
  </div>

  <h2>Color Palette</h2>
  ${colorSwatches}

  <h2>Gradients</h2>
  <div class="gradients">
    ${gradientNames
      .map(
        (name) => `
      <div class="gradient-box" style="background: var(--gradient-linear-${name});">Linear ${name}</div>
    `,
      )
      .join("")}
    <div class="gradient-box" style="background: var(--gradient-linear-rainbow);">Rainbow</div>
    <div class="gradient-box gradient-radial" style="--gradient-from: var(--${prefix}-primary-500); --gradient-to: var(--${prefix}-secondary-500);">Radial</div>
  </div>

  <h2>Noise</h2>
  <div style="height: 100px; background-image: var(--background-image-noise); border-radius: 0.5rem;"></div>

  <h2>Typography Scale</h2>
  <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
    <span style="font-size: var(--text-xs);">XS - The quick brown fox</span>
    <span style="font-size: var(--text-sm);">SM - The quick brown fox</span>
    <span style="font-size: var(--text-md);">MD - The quick brown fox</span>
    <span style="font-size: var(--text-lg);">LG - The quick brown fox</span>
    <span style="font-size: var(--text-xl);">XL - Quick</span>
  </div>

</body>
</html>`;

  const previewPath = config.output.replace(".css", ".preview.html");

  return {
    filename: previewPath,
    content: html,
  };
}
