import { Color, generateFullPalette, HARMONY_META } from "../core";
import type { HarmonyType, FullPalette } from "../core";
import { generateCSS, getHarmonyName } from "../generators/css";
import { ColorPicker } from "./components/color-picker";
import { HarmonySelector } from "./components/harmony-selector";
import { PaletteDisplay } from "./components/palette-display";
import { CodePreview } from "./components/code-preview";
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
}

class AutoThemeApp {
  private state: AppState;
  private colorPicker!: ColorPicker;
  private harmonySelector!: HarmonySelector;
  private paletteDisplay!: PaletteDisplay;
  private codePreview!: CodePreview;

  constructor() {
    this.state = {
      color: "#6439FF",
      harmony: "analogous",
      scalar: 1.618,
      contrastTarget: 7,
    };

    this.initComponents();
    this.bindEvents();
    this.updateTheme();
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
  }

  private bindEvents(): void {
    // Dark mode toggle
    const darkToggle = document.getElementById("dark-mode-toggle");
    darkToggle?.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
    });

    // URL hash handling for deep linking
    window.addEventListener("hashchange", () => this.handleHashChange());
    this.handleHashChange();
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

  private updateTheme(): void {
    const primaryColor = new Color(this.state.color);
    const palette = generateFullPalette(primaryColor, this.state.harmony);

    // Update CSS variables directly on :root
    this.applyThemeToDOM(palette);

    // Update UI components
    this.paletteDisplay.update(palette);

    // Generate CSS code for preview
    const theme = {
      palette,
      config: {
        color: this.state.color,
        harmony: this.state.harmony,
        output: "./autotheme.css",
        preview: false,
        tailwind: false,
        darkModeScript: false,
        scalar: this.state.scalar,
        contrastTarget: this.state.contrastTarget,
        radius: "0.625rem",
        prefix: "color",
        fontSize: 1,
        gradients: true,
        spacing: true,
        noise: true,
        shadcn: true,
        utilities: true,
      },
    };

    const cssOutput = generateCSS(theme);
    this.codePreview.update(cssOutput.content);
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

    this.updateTheme();
  }
}

// Initialize app
new AutoThemeApp();
