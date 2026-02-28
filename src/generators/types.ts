import type { FullPalette } from "../core/types";
import type { AutoThemeConfig } from "../config/types";

export interface GeneratedTheme {
  palette: FullPalette;
  config: AutoThemeConfig;
}

export interface GeneratorOutput {
  filename: string;
  content: string;
}
