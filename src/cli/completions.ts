import { log } from "./logger";

const SUBCOMMANDS = ["init", "schema", "presets", "completions"];

const HARMONIES = [
  "complementary",
  "analogous",
  "triadic",
  "split-complementary",
  "drift",
  "square",
  "rectangle",
  "aurelian",
  "bi-polar",
  "retrograde",
  "monochromatic",
  "double-split-complementary",
];

const PRESETS = [
  "ocean",
  "sunset",
  "forest",
  "lavender",
  "ember",
  "arctic",
  "midnight",
  "terracotta",
  "neon",
  "sage",
  "dashboard-dark",
  "marketing-light",
  "docs-minimal",
];

const MODES = ["light", "dark", "both"];
const FORMATS = ["oklch", "hsl", "rgb", "hex"];

const BOOLEAN_FLAGS = [
  "--palette",
  "--no-palette",
  "--preview",
  "--tailwind",
  "--gradients",
  "--no-gradients",
  "--spacing",
  "--no-spacing",
  "--typography",
  "--no-typography",
  "--noise",
  "--no-noise",
  "--semantics",
  "--no-semantics",
  "--shadcn",
  "--no-shadcn",
  "--utilities",
  "--no-utilities",
  "--states",
  "--no-states",
  "--elevation",
  "--no-elevation",
  "--shadows",
  "--no-shadows",
  "--radius",
  "--no-radius",
  "--comments",
  "--no-comments",
  "--layers",
  "--no-layers",
  "--patterns",
  "--no-patterns",
  "--effects",
  "--no-effects",
  "--stdout",
  "--silent",
];

const VALUE_FLAGS: Record<string, string[]> = {
  "--color": [],
  "-c": [],
  "--harmony": HARMONIES,
  "-a": HARMONIES,
  "--mode": MODES,
  "-m": MODES,
  "--format": FORMATS,
  "--output": [],
  "-o": [],
  "--config": [],
  "--preset": PRESETS,
  "-p": PRESETS,
  "--prefix": [],
  "--check-contrast": ["aa", "aaa"],
  "--angles": [],
};

function generateBash(): string {
  const allFlags = [...BOOLEAN_FLAGS, ...Object.keys(VALUE_FLAGS)];

  return `# autotheme bash completion
# Install: autotheme completions bash >> ~/.bashrc
# Or:      autotheme completions bash > /usr/local/etc/bash_completion.d/autotheme

_autotheme() {
  local cur prev words cword
  _init_completion || return

  local subcommands="${SUBCOMMANDS.join(" ")}"
  local harmonies="${HARMONIES.join(" ")}"
  local presets="${PRESETS.join(" ")}"
  local modes="${MODES.join(" ")}"
  local formats="${FORMATS.join(" ")}"

  # Complete subcommands or flags at position 1
  if [[ $cword -eq 1 ]]; then
    COMPREPLY=($(compgen -W "$subcommands ${allFlags.join(" ")}" -- "$cur"))
    return
  fi

  # Complete flag values
  case "$prev" in
    -a|--harmony)
      COMPREPLY=($(compgen -W "$harmonies" -- "$cur"))
      return ;;
    -p|--preset)
      COMPREPLY=($(compgen -W "$presets" -- "$cur"))
      return ;;
    -m|--mode)
      COMPREPLY=($(compgen -W "$modes" -- "$cur"))
      return ;;
    --format)
      COMPREPLY=($(compgen -W "$formats" -- "$cur"))
      return ;;
    --check-contrast)
      COMPREPLY=($(compgen -W "aa aaa" -- "$cur"))
      return ;;
    -o|--output|--config)
      _filedir
      return ;;
    completions)
      COMPREPLY=($(compgen -W "bash zsh fish" -- "$cur"))
      return ;;
  esac

  # Default: complete flags
  COMPREPLY=($(compgen -W "${allFlags.join(" ")}" -- "$cur"))
}

complete -F _autotheme autotheme
`;
}

function generateZsh(): string {
  return `#compdef autotheme
# autotheme zsh completion
# Install: autotheme completions zsh > ~/.zsh/completions/_autotheme
# Then add to .zshrc: fpath=(~/.zsh/completions $fpath)

_autotheme() {
  local -a subcommands harmonies presets modes formats

  subcommands=(${SUBCOMMANDS.map((s) => `'${s}'`).join(" ")})
  harmonies=(${HARMONIES.map((h) => `'${h}'`).join(" ")})
  presets=(${PRESETS.map((p) => `'${p}'`).join(" ")})
  modes=('light' 'dark' 'both')
  formats=('oklch' 'hsl' 'rgb' 'hex')

  # Handle subcommands
  if (( CURRENT == 2 )); then
    _alternative \\
      'subcommands:subcommand:compadd -a subcommands' \\
      'options:option:_autotheme_options'
    return
  fi

  # Handle completions subcommand
  if [[ "\${words[2]}" == "completions" ]] && (( CURRENT == 3 )); then
    compadd bash zsh fish
    return
  fi

  _autotheme_options
}

_autotheme_options() {
  _arguments -s \\
    '(-c --color)'{-c,--color}'[Primary color]:color: ' \\
    '(-a --harmony)'{-a,--harmony}'[Color harmony type]:harmony:(${HARMONIES.join(" ")})' \\
    '(-m --mode)'{-m,--mode}'[Theme mode]:mode:(${MODES.join(" ")})' \\
    '--format[Color output format]:format:(${FORMATS.join(" ")})' \\
    '(-o --output)'{-o,--output}'[Output file path]:file:_files' \\
    '--config[Config file path]:file:_files' \\
    '(-p --preset)'{-p,--preset}'[Built-in preset]:preset:(${PRESETS.join(" ")})' \\
    '--prefix[CSS variable prefix]:prefix: ' \\
    '--palette[Generate full palette scale]' \\
    '--no-palette[Disable palette scale]' \\
    '--preview[Generate HTML preview]' \\
    '--tailwind[Generate Tailwind v4 CSS]' \\
    '--gradients[Generate gradient variables]' \\
    '--no-gradients[Disable gradient variables]' \\
    '--spacing[Generate spacing scale]' \\
    '--no-spacing[Disable spacing scale]' \\
    '--typography[Generate typography scale]' \\
    '--no-typography[Disable typography scale]' \\
    '--noise[Generate noise texture]' \\
    '--no-noise[Disable noise texture]' \\
    '--semantics[Enable semantic tokens]' \\
    '--no-semantics[Disable semantic tokens]' \\
    '--shadcn[Generate Shadcn UI variables]' \\
    '--no-shadcn[Disable Shadcn UI variables]' \\
    '--utilities[Generate utility classes]' \\
    '--no-utilities[Disable utility classes]' \\
    '--states[Generate state tokens]' \\
    '--no-states[Disable state tokens]' \\
    '--elevation[Generate elevation tokens]' \\
    '--no-elevation[Disable elevation tokens]' \\
    '--shadows[Generate shadow scale]' \\
    '--no-shadows[Disable shadow scale]' \\
    '--radius[Generate radius scale]' \\
    '--no-radius[Disable radius scale]' \\
    '--comments[Include comments]' \\
    '--no-comments[Disable comments]' \\
    '--layers[Wrap in @layer declarations]' \\
    '--no-layers[Disable @layer declarations]' \\
    '--patterns[Generate SVG patterns]' \\
    '--no-patterns[Disable SVG patterns]' \\
    '--effects[Generate visual effects]' \\
    '--no-effects[Disable visual effects]' \\
    '--check-contrast[Check contrast compliance]:level:(aa aaa)' \\
    '--angles[Custom harmony angles]:angles: ' \\
    '--stdout[Output to stdout]' \\
    '(-s --silent)'{-s,--silent}'[Suppress output]' \\
    '(-h --help)'{-h,--help}'[Show help]' \\
    '--version[Show version]'
}

_autotheme "$@"
`;
}

function generateFish(): string {
  const lines = [
    "# autotheme fish completion",
    "# Install: autotheme completions fish > ~/.config/fish/completions/autotheme.fish",
    "",
  ];

  // Subcommands
  for (const sub of SUBCOMMANDS) {
    lines.push(
      `complete -c autotheme -n '__fish_use_subcommand' -a '${sub}' -d '${sub} command'`,
    );
  }

  // completions subcommand shells
  lines.push(
    `complete -c autotheme -n '__fish_seen_subcommand_from completions' -a 'bash zsh fish'`,
  );

  lines.push("");

  // Value flags
  lines.push(
    `complete -c autotheme -l color -s c -d 'Primary color' -r`,
    `complete -c autotheme -l harmony -s a -d 'Harmony type' -r -a '${HARMONIES.join(" ")}'`,
    `complete -c autotheme -l mode -s m -d 'Theme mode' -r -a '${MODES.join(" ")}'`,
    `complete -c autotheme -l format -d 'Color format' -r -a '${FORMATS.join(" ")}'`,
    `complete -c autotheme -l output -s o -d 'Output file' -r -F`,
    `complete -c autotheme -l config -d 'Config file' -r -F`,
    `complete -c autotheme -l preset -s p -d 'Built-in preset' -r -a '${PRESETS.join(" ")}'`,
    `complete -c autotheme -l prefix -d 'CSS variable prefix' -r`,
    `complete -c autotheme -l check-contrast -d 'Check contrast' -r -a 'aa aaa'`,
    `complete -c autotheme -l angles -d 'Custom harmony angles' -r`,
  );

  lines.push("");

  // Boolean flags
  const booleanDescriptions: Record<string, string> = {
    "--palette": "Generate full palette scale",
    "--no-palette": "Disable palette scale",
    "--preview": "Generate HTML preview",
    "--tailwind": "Generate Tailwind v4 CSS",
    "--gradients": "Generate gradient variables",
    "--no-gradients": "Disable gradient variables",
    "--spacing": "Generate spacing scale",
    "--no-spacing": "Disable spacing scale",
    "--typography": "Generate typography scale",
    "--no-typography": "Disable typography scale",
    "--noise": "Generate noise texture",
    "--no-noise": "Disable noise texture",
    "--semantics": "Enable semantic tokens",
    "--no-semantics": "Disable semantic tokens",
    "--shadcn": "Generate Shadcn UI variables",
    "--no-shadcn": "Disable Shadcn UI variables",
    "--utilities": "Generate utility classes",
    "--no-utilities": "Disable utility classes",
    "--states": "Generate state tokens",
    "--no-states": "Disable state tokens",
    "--elevation": "Generate elevation tokens",
    "--no-elevation": "Disable elevation tokens",
    "--shadows": "Generate shadow scale",
    "--no-shadows": "Disable shadow scale",
    "--radius": "Generate radius scale",
    "--no-radius": "Disable radius scale",
    "--comments": "Include comments",
    "--no-comments": "Disable comments",
    "--layers": "Wrap in @layer declarations",
    "--no-layers": "Disable @layer declarations",
    "--patterns": "Generate SVG patterns",
    "--no-patterns": "Disable SVG patterns",
    "--effects": "Generate visual effects",
    "--no-effects": "Disable visual effects",
    "--stdout": "Output to stdout",
    "--silent": "Suppress output",
  };

  for (const flag of BOOLEAN_FLAGS) {
    const name = flag.replace(/^--/, "");
    const desc = booleanDescriptions[flag] ?? name;
    lines.push(`complete -c autotheme -l ${name} -d '${desc}'`);
  }

  lines.push("");

  return lines.join("\n") + "\n";
}

export function runCompletions(args: string[]): void {
  const shell = args[0];

  if (!shell) {
    log.info("Usage: autotheme completions <shell>");
    log.dim("  Shells: bash, zsh, fish");
    log.dim("");
    log.dim("  Examples:");
    log.dim("    autotheme completions bash >> ~/.bashrc");
    log.dim("    autotheme completions zsh > ~/.zsh/completions/_autotheme");
    log.dim("    autotheme completions fish > ~/.config/fish/completions/autotheme.fish");
    return;
  }

  switch (shell) {
    case "bash":
      process.stdout.write(generateBash());
      break;
    case "zsh":
      process.stdout.write(generateZsh());
      break;
    case "fish":
      process.stdout.write(generateFish());
      break;
    default:
      log.error(`Unknown shell: ${shell}. Supported: bash, zsh, fish`);
      process.exit(1);
  }
}
