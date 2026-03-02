export interface LayerToggleState {
  semanticsEnabled: boolean;
  shadcnEnabled: boolean;
  statesEnabled: boolean;
  elevationEnabled: boolean;
  shadowsEnabled: boolean;
  radiusEnabled: boolean;
  spacingEnabled: boolean;
}

interface ToggleDef {
  key: keyof LayerToggleState;
  label: string;
}

const TOGGLES: ToggleDef[] = [
  { key: "semanticsEnabled", label: "Semantics" },
  { key: "shadcnEnabled", label: "Shadcn UI" },
  { key: "statesEnabled", label: "States" },
  { key: "elevationEnabled", label: "Elevation" },
  { key: "shadowsEnabled", label: "Shadows" },
  { key: "radiusEnabled", label: "Radius" },
  { key: "spacingEnabled", label: "Spacing" },
];

export class LayerToggles {
  private container: HTMLElement;
  private state: LayerToggleState;
  private onChange: (state: LayerToggleState) => void;

  constructor(
    container: HTMLElement,
    initialState: LayerToggleState,
    onChange: (state: LayerToggleState) => void,
  ) {
    this.container = container;
    this.state = { ...initialState };
    this.onChange = onChange;
    this.render();
  }

  private render(): void {
    const togglesHTML = TOGGLES.map((t) => {
      const checked = this.state[t.key] ? "checked" : "";
      return `
        <label class="layer-toggle">
          <input type="checkbox" data-key="${t.key}" ${checked} />
          <span class="layer-toggle__label">${t.label}</span>
        </label>
      `;
    }).join("");

    this.container.innerHTML = `
      <div class="layer-toggles">
        <h3 class="layer-toggles__title">Feature Layers</h3>
        <div class="layer-toggles__grid">
          ${togglesHTML}
        </div>
      </div>
    `;

    this.container.querySelectorAll("input[type=checkbox]").forEach((input) => {
      input.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        const key = target.dataset.key as keyof LayerToggleState;
        this.state[key] = target.checked;
        this.onChange({ ...this.state });
      });
    });
  }

  getState(): LayerToggleState {
    return { ...this.state };
  }
}
