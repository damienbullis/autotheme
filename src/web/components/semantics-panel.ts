import type { SemanticTokenSet } from "../../generators/semantic";

export class SemanticsPanel {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  update(tokens: SemanticTokenSet | null): void {
    if (!tokens) {
      this.container.innerHTML = "";
      return;
    }

    const sections = [
      { title: "Surfaces", tokens: tokens.surfaces },
      { title: "Borders", tokens: tokens.borders },
      { title: "Text", tokens: tokens.text },
      { title: "Accents", tokens: tokens.accents },
      ...(tokens.states?.length ? [{ title: "States", tokens: tokens.states }] : []),
      ...(tokens.elevation?.length ? [{ title: "Elevation", tokens: tokens.elevation }] : []),
    ];

    const html = sections
      .map(
        (section) => `
        <div class="semantics-section">
          <h4>${section.title}</h4>
          <div class="semantics-swatches">
            ${section.tokens
              .map(
                (t) => `
              <div class="semantic-swatch"
                   style="background: ${t.rawCSS ? "var(--surface)" : t.value.toOKLCH()}"
                   title="${t.name}: ${t.rawCSS || t.value.toOKLCH()}">
                <span class="semantic-swatch__name">${t.name}</span>
              </div>
            `,
              )
              .join("")}
          </div>
        </div>
      `,
      )
      .join("");

    this.container.innerHTML = `
      <div class="semantics-panel">
        <h3>Semantic Tokens</h3>
        ${html}
      </div>
    `;
  }
}
