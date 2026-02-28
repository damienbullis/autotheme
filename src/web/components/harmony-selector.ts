import { HARMONY_META } from "../../core";
import type { HarmonyType } from "../../core";

export class HarmonySelector {
  private container: HTMLElement;
  private select!: HTMLSelectElement;
  private onChange: (harmony: HarmonyType) => void;

  constructor(
    container: HTMLElement,
    initialValue: HarmonyType,
    onChange: (harmony: HarmonyType) => void,
  ) {
    this.container = container;
    this.onChange = onChange;
    this.render(initialValue);
  }

  private render(value: HarmonyType): void {
    const options = HARMONY_META.map(
      (h) => `
      <option value="${h.type}" ${h.type === value ? "selected" : ""}>
        ${h.name}
      </option>
    `,
    ).join("");

    this.container.innerHTML = `
      <div class="harmony-selector">
        <label class="harmony-selector__label">Harmony</label>
        <select class="harmony-selector__select">
          ${options}
        </select>
        <p class="harmony-selector__description" id="harmony-description">
          ${HARMONY_META.find((h) => h.type === value)?.description}
        </p>
      </div>
    `;

    this.select = this.container.querySelector(".harmony-selector__select")!;
    const description = this.container.querySelector("#harmony-description")!;

    this.select.addEventListener("change", (e) => {
      const harmony = (e.target as HTMLSelectElement).value as HarmonyType;
      const meta = HARMONY_META.find((h) => h.type === harmony);
      if (meta) {
        description.textContent = meta.description;
      }
      this.onChange(harmony);
    });
  }

  setValue(harmony: HarmonyType): void {
    this.select.value = harmony;
  }
}
