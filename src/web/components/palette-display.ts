import type { FullPalette, PaletteVariations } from "../../core";
import { getHarmonyName } from "../../generators/css";

const TINT_SCALES = [400, 300, 200, 100, 50];
const SHADE_SCALES = [600, 700, 800, 900, 950];

export class PaletteDisplay {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  update(palette: FullPalette): void {
    const colorGroups = palette.palettes
      .map((p, i) => this.renderColorGroup(p, i))
      .join("");

    this.container.innerHTML = `
      <div class="palette-display">
        <h2>Color Palette</h2>
        <div class="palette-display__groups">
          ${colorGroups}
        </div>
      </div>
    `;

    // Add click-to-copy functionality
    this.container.querySelectorAll(".swatch").forEach((swatch) => {
      swatch.addEventListener("click", () => {
        const color = swatch.getAttribute("data-color");
        if (color) {
          navigator.clipboard.writeText(color);
          this.showCopyFeedback(swatch as HTMLElement);
        }
      });
    });
  }

  private renderColorGroup(p: PaletteVariations, index: number): string {
    const name = getHarmonyName(index);
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    return `
      <div class="color-group">
        <h3>${displayName}</h3>

        <div class="swatch swatch--large"
             style="background: var(--color-${name}-500)"
             data-color="var(--color-${name}-500)"
             title="Click to copy">
          <span style="color: var(--color-${name}-foreground)">
            ${p.base.toHex()}
          </span>
        </div>

        <div class="swatch-row">
          <span class="swatch-row__label">Tints</span>
          ${TINT_SCALES.map(
            (scale) => `
            <div class="swatch"
                 style="background: var(--color-${name}-${scale})"
                 data-color="var(--color-${name}-${scale})"
                 title="${scale} - Click to copy">
              ${scale}
            </div>
          `,
          ).join("")}
        </div>

        <div class="swatch-row">
          <span class="swatch-row__label">Shades</span>
          ${SHADE_SCALES.map(
            (scale) => `
            <div class="swatch"
                 style="background: var(--color-${name}-${scale})"
                 data-color="var(--color-${name}-${scale})"
                 title="${scale} - Click to copy">
              ${scale}
            </div>
          `,
          ).join("")}
        </div>

        <div class="swatch-row">
          <span class="swatch-row__label">Tones</span>
          ${[1, 2, 3, 4]
            .map(
              (j) => `
            <div class="swatch"
                 style="background: var(--color-${name}-tone-${j})"
                 data-color="var(--color-${name}-tone-${j})"
                 title="Tone ${j} - Click to copy">
              T${j}
            </div>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  }

  private showCopyFeedback(element: HTMLElement): void {
    const original = element.innerHTML;
    element.innerHTML = "<span>Copied!</span>";
    element.classList.add("swatch--copied");

    setTimeout(() => {
      element.innerHTML = original;
      element.classList.remove("swatch--copied");
    }, 1000);
  }
}
