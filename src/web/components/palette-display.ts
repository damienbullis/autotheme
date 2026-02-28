import type { FullPalette, PaletteVariations } from "../../core";

export class PaletteDisplay {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  update(palette: FullPalette): void {
    const colorGroups = palette.palettes
      .map((p, i) => this.renderColorGroup(p, i, palette))
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

  private renderColorGroup(p: PaletteVariations, index: number, _palette: FullPalette): string {
    return `
      <div class="color-group">
        <h3>Color ${index}</h3>

        <div class="swatch swatch--large"
             style="background: rgb(var(--at-c${index}))"
             data-color="var(--at-c${index})"
             title="Click to copy">
          <span style="color: rgb(var(--at-c${index}-text))">
            ${p.base.toHex()}
          </span>
        </div>

        <div class="swatch-row">
          <span class="swatch-row__label">Tints</span>
          ${[1, 2, 3, 4, 5]
            .map(
              (j) => `
            <div class="swatch"
                 style="background: rgb(var(--at-c${index}-l${j}))"
                 data-color="var(--at-c${index}-l${j})"
                 title="L${j} - Click to copy">
              L${j}
            </div>
          `,
            )
            .join("")}
        </div>

        <div class="swatch-row">
          <span class="swatch-row__label">Shades</span>
          ${[1, 2, 3, 4, 5]
            .map(
              (j) => `
            <div class="swatch"
                 style="background: rgb(var(--at-c${index}-d${j}))"
                 data-color="var(--at-c${index}-d${j})"
                 title="D${j} - Click to copy">
              D${j}
            </div>
          `,
            )
            .join("")}
        </div>

        <div class="swatch-row">
          <span class="swatch-row__label">Tones</span>
          ${[1, 2, 3, 4]
            .map(
              (j) => `
            <div class="swatch"
                 style="background: rgb(var(--at-c${index}-g${j}))"
                 data-color="var(--at-c${index}-g${j})"
                 title="G${j} - Click to copy">
              G${j}
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
