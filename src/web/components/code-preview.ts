export class CodePreview {
  private container: HTMLElement;
  private codeElement!: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="code-preview">
        <div class="code-preview__header">
          <h2>Generated CSS</h2>
          <div class="code-preview__actions">
            <button class="btn" id="copy-css">Copy CSS</button>
            <button class="btn btn--secondary" id="download-css">Download</button>
          </div>
        </div>
        <pre class="code-preview__code"><code id="css-output"></code></pre>
      </div>
    `;

    this.codeElement = this.container.querySelector("#css-output")!;

    // Copy button
    this.container.querySelector("#copy-css")?.addEventListener("click", () => {
      navigator.clipboard.writeText(this.codeElement.textContent || "");
      this.showCopyFeedback();
    });

    // Download button
    this.container.querySelector("#download-css")?.addEventListener("click", () => {
      this.downloadCSS();
    });
  }

  update(css: string): void {
    this.codeElement.textContent = css;
  }

  private showCopyFeedback(): void {
    const btn = this.container.querySelector("#copy-css")!;
    const original = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => {
      btn.textContent = original;
    }, 1500);
  }

  private downloadCSS(): void {
    const css = this.codeElement.textContent || "";
    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "autotheme.css";
    a.click();
    URL.revokeObjectURL(url);
  }
}
