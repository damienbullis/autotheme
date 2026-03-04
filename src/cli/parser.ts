import cac from "cac";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version } = require("../../package.json");

export interface CLIArgs {
  color?: string | undefined;
  harmony?: string | undefined;
  mode?: string | undefined;
  format?: string | undefined;
  colorFormat?: string | undefined;
  output?: string | undefined;
  config?: string | undefined;
  preset?: string | undefined;
  prefix?: string | undefined;
  palette?: boolean | undefined;
  preview?: boolean | undefined;
  tailwind?: boolean | undefined;
  gradients?: boolean | undefined;
  spacing?: boolean | undefined;
  typography?: boolean | undefined;
  noise?: boolean | undefined;
  semantics?: boolean | undefined;
  shadcn?: boolean | undefined;
  utilities?: boolean | undefined;
  states?: boolean | undefined;
  elevation?: boolean | undefined;
  shadows?: boolean | undefined;
  radius?: boolean | undefined;
  comments?: boolean | undefined;
  layers?: boolean | undefined;
  patterns?: boolean | undefined;
  effects?: boolean | undefined;
  checkContrast?: string | undefined;
  angles?: string | undefined;
  stdout?: boolean | undefined;
  silent?: boolean | undefined;
  help?: boolean | undefined;
  version?: boolean | undefined;
}

export function parseArgs(args: string[]): CLIArgs {
  const cli = cac("autotheme");

  cli
    .option("-c, --color <color>", "Primary color (hex, rgb, hsl)")
    .option("-a, --harmony <type>", "Color harmony type")
    .option("-m, --mode <mode>", "Theme mode: light, dark, or both (default: both)")
    .option("--format <format>", "Color output format: oklch, hsl, rgb, hex (default: oklch)")
    .option("-o, --output <path>", "Output file path")
    .option("--config <path>", "Path to config file or URL")
    .option("-p, --preset <name>", "Use a built-in preset (e.g., ocean, sunset, forest)")
    .option("--prefix <prefix>", "CSS variable prefix (default: color)")
    .option("--palette", "Generate full 50-950 palette scale (use --no-palette to disable)")
    .option("--preview", "Generate HTML preview")
    .option("--tailwind", "Generate Tailwind v4 CSS (auto-enables palette)")
    .option("--gradients", "Generate gradient variables (use --no-gradients to disable)")
    .option("--spacing", "Generate spacing scale (use --no-spacing to disable)")
    .option("--typography", "Generate typography scale (use --no-typography to disable)")
    .option("--noise", "Generate noise texture (use --no-noise to disable)")
    .option("--no-semantics", "Disable semantic tokens (on by default)")
    .option("--shadcn", "Generate Shadcn UI variables (use --no-shadcn to disable)")
    .option("--utilities", "Generate utility classes (use --no-utilities to disable)")
    .option("--states", "Generate interactive state tokens (use --no-states to disable)")
    .option("--elevation", "Generate elevation system tokens (use --no-elevation to disable)")
    .option("--shadows", "Generate shadow scale (use --no-shadows to disable)")
    .option("--radius", "Generate border radius scale (use --no-radius to disable)")
    .option(
      "--comments",
      "Include metadata header and inline comments (use --no-comments to disable)",
    )
    .option("--layers", "Wrap CSS in @layer declarations (use --no-layers to disable)")
    .option("--patterns", "Generate SVG pattern utilities (use --no-patterns to disable)")
    .option(
      "--effects",
      "Generate visual effects (filters, glass, blobs) (use --no-effects to disable)",
    )
    .option("--check-contrast [level]", "Check contrast compliance (aa or aaa, default: aa)")
    .option("--angles <angles>", "Custom harmony angles (comma-separated, e.g., '0,45,210')")
    .option("--stdout", "Output CSS to stdout instead of writing files")
    .option("-s, --silent", "Suppress output")
    .help()
    .version(version as string);

  const parsed = cli.parse(["", "", ...args], { run: false });

  return {
    color: parsed.options.color as string | undefined,
    harmony: parsed.options.harmony as string | undefined,
    mode: parsed.options.mode as string | undefined,
    format: parsed.options.format as string | undefined,
    output: parsed.options.output as string | undefined,
    config: parsed.options.config as string | undefined,
    preset: parsed.options.preset as string | undefined,
    prefix: parsed.options.prefix as string | undefined,
    palette: parsed.options.palette as boolean | undefined,
    preview: parsed.options.preview as boolean | undefined,
    tailwind: parsed.options.tailwind as boolean | undefined,
    gradients: parsed.options.gradients as boolean | undefined,
    spacing: parsed.options.spacing as boolean | undefined,
    typography: parsed.options.typography as boolean | undefined,
    noise: parsed.options.noise as boolean | undefined,
    semantics: parsed.options.semantics as boolean | undefined,
    shadcn: parsed.options.shadcn as boolean | undefined,
    utilities: parsed.options.utilities as boolean | undefined,
    states: parsed.options.states as boolean | undefined,
    elevation: parsed.options.elevation as boolean | undefined,
    shadows: parsed.options.shadows as boolean | undefined,
    radius: parsed.options.radius as boolean | undefined,
    comments: parsed.options.comments as boolean | undefined,
    layers: parsed.options.layers as boolean | undefined,
    patterns: parsed.options.patterns as boolean | undefined,
    effects: parsed.options.effects as boolean | undefined,
    checkContrast: parsed.options.checkContrast as string | undefined,
    angles: parsed.options.angles as string | undefined,
    stdout: parsed.options.stdout as boolean | undefined,
    silent: parsed.options.silent as boolean | undefined,
    help: parsed.options.help as boolean | undefined,
    version: parsed.options.version as boolean | undefined,
  };
}
