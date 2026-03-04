import { Color, generateFullPalette, HARMONY_META } from "../core";
import type { HarmonyType, FullPalette } from "../core";
import { generateCSS, getHarmonyName } from "../generators/css";
import { generateSemanticTokens } from "../generators/semantic";
import {
  DEFAULT_PALETTE,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_SPACING,
  DEFAULT_SHADOWS,
  DEFAULT_RADIUS,
  DEFAULT_SEMANTICS,
  DEFAULT_SHADCN,
  DEFAULT_OUTPUT,
} from "../config/types";
import type { ResolvedConfig } from "../config/types";
import { ColorPicker } from "./components/color-picker";
import { HarmonySelector } from "./components/harmony-selector";
import { PaletteDisplay } from "./components/palette-display";
import { CodePreview } from "./components/code-preview";
import { SemanticsPanel } from "./components/semantics-panel";
import { FrameworkPanel } from "./components/framework-panel";
import { LayerToggles } from "./components/layer-toggles";
import type { LayerToggleState } from "./components/layer-toggles";
import { initDocs } from "./components/docs-section";

/**
 * Mapping from tint/shade index to Tailwind scale values
 */
const TINT_TO_SCALE: Record<number, number> = {
  5: 50,
  4: 100,
  3: 200,
  2: 300,
  1: 400,
};

const SHADE_TO_SCALE: Record<number, number> = {
  1: 600,
  2: 700,
  3: 800,
  4: 900,
  5: 950,
};

interface AppState {
  color: string;
  harmony: HarmonyType;
  scalar: number;
  contrastTarget: number;
  semanticsEnabled: boolean;
  shadcnEnabled: boolean;
  statesEnabled: boolean;
  elevationEnabled: boolean;
  shadowsEnabled: boolean;
  radiusEnabled: boolean;
  spacingEnabled: boolean;
}

class AutoThemeApp {
  private state: AppState;
  private colorPicker!: ColorPicker;
  private harmonySelector!: HarmonySelector;
  private paletteDisplay!: PaletteDisplay;
  private codePreview!: CodePreview;
  private semanticsPanel!: SemanticsPanel;
  private frameworkPanel!: FrameworkPanel;

  constructor() {
    this.state = {
      color: "#6439FF",
      harmony: "analogous",
      scalar: 1.618,
      contrastTarget: 7,
      semanticsEnabled: false,
      shadcnEnabled: false,
      statesEnabled: false,
      elevationEnabled: false,
      shadowsEnabled: false,
      radiusEnabled: false,
      spacingEnabled: true,
    };

    this.initComponents();
    this.bindEvents();
    this.handleHashChange();
    initDocs();
  }

  private initComponents(): void {
    this.colorPicker = new ColorPicker(
      document.getElementById("color-picker-container")!,
      this.state.color,
      (color) => this.handleColorChange(color),
    );

    this.harmonySelector = new HarmonySelector(
      document.getElementById("harmony-selector-container")!,
      this.state.harmony,
      (harmony) => this.handleHarmonyChange(harmony),
    );

    this.paletteDisplay = new PaletteDisplay(document.getElementById("palette-display")!);
    this.codePreview = new CodePreview(document.getElementById("code-preview")!);
    this.semanticsPanel = new SemanticsPanel(document.getElementById("semantics-panel")!);
    this.frameworkPanel = new FrameworkPanel(document.getElementById("framework-panel")!);

    new LayerToggles(
      document.getElementById("layer-toggles-container")!,
      {
        semanticsEnabled: this.state.semanticsEnabled,
        shadcnEnabled: this.state.shadcnEnabled,
        statesEnabled: this.state.statesEnabled,
        elevationEnabled: this.state.elevationEnabled,
        shadowsEnabled: this.state.shadowsEnabled,
        radiusEnabled: this.state.radiusEnabled,
        spacingEnabled: this.state.spacingEnabled,
      },
      (toggleState) => this.handleToggleChange(toggleState),
    );
  }

  private bindEvents(): void {
    // Dark mode toggle
    const darkToggle = document.getElementById("dark-mode-toggle");
    darkToggle?.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
    });

    // URL hash handling for deep linking
    window.addEventListener("hashchange", () => this.handleHashChange());
  }

  private handleColorChange(color: string): void {
    this.state.color = color;
    this.updateTheme();
    this.updateURL();
  }

  private handleHarmonyChange(harmony: HarmonyType): void {
    this.state.harmony = harmony;
    this.updateTheme();
    this.updateURL();
  }

  private handleToggleChange(toggleState: LayerToggleState): void {
    Object.assign(this.state, toggleState);
    this.updateTheme();
    this.updateURL();
  }

  private buildConfig(): ResolvedConfig {
    return {
      color: this.state.color,
      harmony: this.state.harmony,
      mode: "both",
      palette: {
        ...DEFAULT_PALETTE,
        contrastTarget: this.state.contrastTarget,
      },
      typography: { ...DEFAULT_TYPOGRAPHY, ratio: this.state.scalar },
      spacing: this.state.spacingEnabled ? { ...DEFAULT_SPACING, ratio: this.state.scalar } : false,
      shadows: this.state.shadowsEnabled ? { ...DEFAULT_SHADOWS } : false,
      radius: this.state.radiusEnabled ? { ...DEFAULT_RADIUS } : false,
      gradients: true,
      noise: true,
      utilities: true,
      patterns: false,
      semantics: this.state.semanticsEnabled ? { ...DEFAULT_SEMANTICS } : false,
      states: this.state.statesEnabled
        ? {
            hover: 0.04,
            active: -0.02,
            focus: { width: "2px", offset: "2px" },
            disabled: { opacity: 0.4 },
          }
        : false,
      elevation: this.state.elevationEnabled
        ? { levels: 4, delta: 0.03, tintShadows: true }
        : false,
      motion: false,
      effects: false,
      shadcn: this.state.shadcnEnabled ? { ...DEFAULT_SHADCN } : false,
      output: {
        ...DEFAULT_OUTPUT,
        comments: true,
      },
    };
  }

  private updateTheme(): void {
    const primaryColor = new Color(this.state.color);
    const palette = generateFullPalette(primaryColor, this.state.harmony);
    const config = this.buildConfig();

    // Update CSS variables directly on :root
    this.applyThemeToDOM(palette);

    // Update UI components
    this.paletteDisplay.update(palette);

    // Generate CSS code for preview
    const harmony = palette.harmony;
    const theme = { palette, harmony, config };
    const cssOutput = generateCSS(theme);
    this.codePreview.update(cssOutput.content);

    // Update semantics panel
    if (this.state.semanticsEnabled) {
      const tokens = generateSemanticTokens(palette, config, "light");
      this.semanticsPanel.update(tokens);
    } else {
      this.semanticsPanel.update(null);
    }

    // Update framework panel (always visible)
    const shadcnMapping = this.state.shadcnEnabled
      ? {
          background: "var(--surface)",
          foreground: "var(--text-1)",
          primary: "var(--accent)",
          secondary: "var(--accent-secondary)",
          muted: "var(--surface-sunken)",
          accent: "var(--accent-subtle)",
          border: "var(--border)",
        }
      : null;
    this.frameworkPanel.update({
      shadcnMapping,
      shadcnEnabled: this.state.shadcnEnabled,
    });
  }

  private applyThemeToDOM(palette: FullPalette): void {
    const root = document.documentElement;

    // Apply all palette colors with Tailwind naming
    palette.palettes.forEach((p, i) => {
      const name = getHarmonyName(i);

      // Base color (500)
      root.style.setProperty(`--color-${name}-500`, p.base.toOKLCH());

      // Foreground (accessible text color)
      const textColor = palette.textColors.get(`c${i}-base`);
      if (textColor) {
        root.style.setProperty(`--color-${name}-foreground`, textColor.toOKLCH());
      }

      // Contrast color
      const contrastColor =
        p.base.luminance > 0.5
          ? new Color({ h: p.base.hsl.h, s: 100, l: 5, a: 1 })
          : new Color({ h: p.base.hsl.h, s: 20, l: 95, a: 1 });
      root.style.setProperty(`--color-${name}-contrast`, contrastColor.toOKLCH());

      // Tints (L1-L5 → 400, 300, 200, 100, 50)
      p.tints.forEach((tint, j) => {
        const scale = TINT_TO_SCALE[j + 1];
        if (scale) {
          root.style.setProperty(`--color-${name}-${scale}`, tint.toOKLCH());
        }
      });

      // Shades (D1-D5 → 600, 700, 800, 900, 950)
      p.shades.forEach((shade, j) => {
        const scale = SHADE_TO_SCALE[j + 1];
        if (scale) {
          root.style.setProperty(`--color-${name}-${scale}`, shade.toOKLCH());
        }
      });

      // Tones
      p.tones.forEach((tone, j) => {
        root.style.setProperty(`--color-${name}-tone-${j + 1}`, tone.toOKLCH());
      });
    });
  }

  private updateURL(): void {
    const params = new URLSearchParams();
    params.set("color", this.state.color.replace("#", ""));
    params.set("harmony", this.state.harmony);
    if (this.state.semanticsEnabled) params.set("semantics", "1");
    if (this.state.shadcnEnabled) params.set("shadcn", "1");
    if (this.state.statesEnabled) params.set("states", "1");
    if (this.state.elevationEnabled) params.set("elevation", "1");
    if (this.state.shadowsEnabled) params.set("shadows", "1");
    if (this.state.radiusEnabled) params.set("radius", "1");
    if (!this.state.spacingEnabled) params.set("spacing", "0");
    window.history.replaceState(null, "", `?${params.toString()}`);
  }

  private handleHashChange(): void {
    const params = new URLSearchParams(window.location.search);
    const color = params.get("color");
    const harmony = params.get("harmony");

    if (color) {
      this.state.color = `#${color}`;
      this.colorPicker.setValue(this.state.color);
    }

    if (harmony && HARMONY_META.some((h) => h.type === harmony)) {
      this.state.harmony = harmony as HarmonyType;
      this.harmonySelector.setValue(this.state.harmony);
    }

    // Toggle states from URL
    if (params.has("semantics")) this.state.semanticsEnabled = params.get("semantics") === "1";
    if (params.has("shadcn")) this.state.shadcnEnabled = params.get("shadcn") === "1";
    if (params.has("states")) this.state.statesEnabled = params.get("states") === "1";
    if (params.has("elevation")) this.state.elevationEnabled = params.get("elevation") === "1";
    if (params.has("shadows")) this.state.shadowsEnabled = params.get("shadows") === "1";
    if (params.has("radius")) this.state.radiusEnabled = params.get("radius") === "1";
    if (params.has("spacing")) this.state.spacingEnabled = params.get("spacing") !== "0";

    this.updateTheme();
  }
}

// Initialize app
new AutoThemeApp();
