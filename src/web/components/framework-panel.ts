export class FrameworkPanel {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  update(mapping: Record<string, string> | null): void {
    if (!mapping) {
      this.container.innerHTML = "";
      return;
    }

    const entries = Object.entries(mapping);
    const html = entries
      .map(
        ([key, value]) => `
        <div class="framework-entry">
          <span class="framework-entry__key">--${key}</span>
          <span class="framework-entry__value">${value}</span>
        </div>
      `,
      )
      .join("");

    this.container.innerHTML = `
      <div class="framework-panel">
        <h3>Shadcn UI Variables</h3>
        <div class="framework-entries">
          ${html}
        </div>
      </div>
    `;
  }
}
