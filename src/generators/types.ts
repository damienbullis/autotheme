import type { FullPalette, HarmonyResult } from "../core/types";
import type { ResolvedConfig } from "../config/types";

export interface GeneratedTheme {
  palette: FullPalette;
  harmony: HarmonyResult;
  config: ResolvedConfig;
}

export interface GeneratorOutput {
  filename: string;
  content: string;
}
