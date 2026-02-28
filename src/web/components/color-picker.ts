export class ColorPicker {
  private container: HTMLElement;
  private input!: HTMLInputElement;
  private hexInput!: HTMLInputElement;
  private onChange: (color: string) => void;

  constructor(container: HTMLElement, initialValue: string, onChange: (color: string) => void) {
    this.container = container;
    this.onChange = onChange;
    this.render(initialValue);
  }

  private render(value: string): void {
    this.container.innerHTML = `
      <div class="color-picker">
        <label class="color-picker__label">Primary Color</label>
        <div class="color-picker__inputs">
          <input
            type="color"
            class="color-picker__native"
            value="${value}"
          />
          <input
            type="text"
            class="color-picker__hex"
            value="${value}"
            pattern="^#[0-9A-Fa-f]{6}$"
            placeholder="#6439FF"
          />
        </div>
        <button class="color-picker__random" title="Random color">
          &#127922;
        </button>
      </div>
    `;

    this.input = this.container.querySelector(".color-picker__native")!;
    this.hexInput = this.container.querySelector(".color-picker__hex")!;
    const randomBtn = this.container.querySelector(".color-picker__random")!;

    this.input.addEventListener("input", (e) => {
      const color = (e.target as HTMLInputElement).value;
      this.hexInput.value = color;
      this.onChange(color);
    });

    this.hexInput.addEventListener("change", (e) => {
      const color = (e.target as HTMLInputElement).value;
      if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
        this.input.value = color;
        this.onChange(color);
      }
    });

    randomBtn.addEventListener("click", () => {
      const randomColor = this.generateRandomColor();
      this.setValue(randomColor);
      this.onChange(randomColor);
    });
  }

  setValue(color: string): void {
    this.input.value = color;
    this.hexInput.value = color;
  }

  private generateRandomColor(): string {
    const h = Math.floor(Math.random() * 360);
    const s = 70 + Math.floor(Math.random() * 30); // 70-100%
    const l = 40 + Math.floor(Math.random() * 20); // 40-60%
    return this.hslToHex(h, s, l);
  }

  private hslToHex(h: number, s: number, l: number): string {
    const sNorm = s / 100;
    const lNorm = l / 100;
    const a = sNorm * Math.min(lNorm, 1 - lNorm);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = lNorm - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }
}
