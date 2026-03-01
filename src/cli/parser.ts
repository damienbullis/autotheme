import cac from "cac";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version } = require("../../package.json");

export interface CLIArgs {
  color?: string | undefined;
  harmony?: string | undefined;
  mode?: string | undefined;
  output?: string | undefined;
  config?: string | undefined;
  preset?: string | undefined;
  prefix?: string | undefined;
  fontSize?: number | undefined;
  preview?: boolean | undefined;
  tailwind?: boolean | undefined;
  darkModeScript?: boolean | undefined;
  gradients?: boolean | undefined;
  spacing?: boolean | undefined;
  noise?: boolean | undefined;
  shadcn?: boolean | undefined;
  utilities?: boolean | undefined;
  swing?: number | undefined;
  swingStrategy?: string | undefined;
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
    .option("-o, --output <path>", "Output file path")
    .option("--config <path>", "Path to config file or URL")
    .option("-p, --preset <name>", "Use a built-in preset (e.g., ocean, sunset, forest)")
    .option("--prefix <prefix>", "CSS variable prefix (default: color)")
    .option("--font-size <size>", "Base font size in rem (default: 1)")
    .option("--preview", "Generate HTML preview")
    .option("--tailwind", "Generate Tailwind v4 CSS")
    .option("--dark-mode-script", "Generate dark mode script")
    .option("--gradients", "Generate gradient variables (use --no-gradients to disable)")
    .option("--spacing", "Generate spacing scale (use --no-spacing to disable)")
    .option("--noise", "Generate noise texture (use --no-noise to disable)")
    .option("--shadcn", "Generate Shadcn UI variables (use --no-shadcn to disable)")
    .option("--utilities", "Generate utility classes (use --no-utilities to disable)")
    .option("--swing <value>", "Swing multiplier for harmony angular distance (default: 1)")
    .option("--swing-strategy <strategy>", "Swing strategy: linear, exponential, alternating")
    .option("--stdout", "Output CSS to stdout instead of writing files")
    .option("-s, --silent", "Suppress output")
    .help()
    .version(version as string);

  const parsed = cli.parse(["", "", ...args], { run: false });

  return {
    color: parsed.options.color as string | undefined,
    harmony: parsed.options.harmony as string | undefined,
    mode: parsed.options.mode as string | undefined,
    output: parsed.options.output as string | undefined,
    config: parsed.options.config as string | undefined,
    preset: parsed.options.preset as string | undefined,
    prefix: parsed.options.prefix as string | undefined,
    fontSize: parsed.options.fontSize !== undefined ? Number(parsed.options.fontSize) : undefined,
    preview: parsed.options.preview as boolean | undefined,
    tailwind: parsed.options.tailwind as boolean | undefined,
    darkModeScript: parsed.options.darkModeScript as boolean | undefined,
    gradients: parsed.options.gradients as boolean | undefined,
    spacing: parsed.options.spacing as boolean | undefined,
    noise: parsed.options.noise as boolean | undefined,
    shadcn: parsed.options.shadcn as boolean | undefined,
    utilities: parsed.options.utilities as boolean | undefined,
    swing: parsed.options.swing !== undefined ? Number(parsed.options.swing) : undefined,
    swingStrategy: parsed.options.swingStrategy as string | undefined,
    stdout: parsed.options.stdout as boolean | undefined,
    silent: parsed.options.silent as boolean | undefined,
    help: parsed.options.help as boolean | undefined,
    version: parsed.options.version as boolean | undefined,
  };
}
