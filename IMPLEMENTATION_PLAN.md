# AutoTheme Implementation Plan

> A TypeScript rewrite of AutoTheme using Bun runtime for a zero-dependency CSS theme generator.

## Overview

This document provides a high-level roadmap for porting AutoTheme from Go to TypeScript. The project will function as both a CLI tool (compiled binary) and an importable Node/Bun module, with an interactive web application for documentation and live theme previewing.

## Goals

1. **Zero-Dependency Runtime:** Core logic written from scratch where feasible
2. **Dual Mode:** CLI tool (binary) + importable module
3. **Performance:** Leverage Bun's native speed
4. **Single Binary:** Use `bun build --compile` for distribution
5. **Interactive Web App:** Documentation site with live theme previewer

## Tech Stack

| Category   | Tool                                    | Purpose                   |
| ---------- | --------------------------------------- | ------------------------- |
| Runtime    | [Bun](https://bun.sh)                   | Fast JavaScript runtime   |
| Language   | TypeScript                              | Type-safe development     |
| Testing    | [Vitest](https://vitest.dev)            | Fast unit testing         |
| Linting    | [oxlint](https://oxc-project.github.io) | Rust-based linting        |
| Formatting | oxfmt                                   | Rust-based formatting     |
| Web App    | Bun + Vanilla TS                        | Documentation & previewer |

## Architecture

```
src/
├── core/           # Pure logic (Color conversion, Harmonies, Contrast)
├── generators/     # CSS, HTML, and Tailwind output generators
├── config/         # Configuration loading and validation (JSON only)
├── cli/            # CLI entry point, argument parsing, interactive prompts
├── web/            # Documentation website & interactive previewer
└── index.ts        # Main export for module usage
```

## Implementation Phases

| Phase | Description                    | Document                                    |
| ----- | ------------------------------ | ------------------------------------------- |
| **1** | Project Setup & Infrastructure | [Phase 1](./docs/phases/01-setup.md)        |
| **2** | Color Engine (Core)            | [Phase 2](./docs/phases/02-color-engine.md) |
| **3** | Harmonies & Palettes           | [Phase 3](./docs/phases/03-harmonies.md)    |
| **4** | Configuration & CLI            | [Phase 4](./docs/phases/04-config-cli.md)   |
| **5** | Output Generators              | [Phase 5](./docs/phases/05-generators.md)   |
| **6** | Web App (Docs & Previewer)     | [Phase 6](./docs/phases/06-web-app.md)      |
| **7** | Bundling & Distribution        | [Phase 7](./docs/phases/07-distribution.md) |

## Phase Summary

### Phase 1: Project Setup & Infrastructure

Initialize the Bun project, configure TypeScript strict mode, set up oxlint/oxfmt, and configure Vitest. Establish project structure and development scripts.

### Phase 2: Color Engine (Core)

Implement the foundational color manipulation logic: color space conversions (Hex, RGB, HSL), luminance calculation, contrast ratio computation, and WCAG compliance checking.

### Phase 3: Harmonies & Palettes

Build the harmony generation system (Analogous, Triadic, Tetradic, etc.) and palette variation generators (tints, shades, tones).

### Phase 4: Configuration & CLI

Create the CLI interface with argument parsing, JSON configuration loading with schema validation, and interactive initialization prompts.

### Phase 5: Output Generators

Implement CSS generator (`:root` variables), HTML preview generator, Tailwind v4 integration, and dark mode script generation.

### Phase 6: Web App (Docs & Previewer)

Build an interactive web application serving as both documentation and a live theme previewer with real-time variable manipulation.

### Phase 7: Bundling & Distribution

Configure module exports, binary compilation, npm package setup, and release automation.

## Configuration Support

AutoTheme supports configuration via:

- **CLI Flags:** `--color`, `--harmony`, `--output`, etc.
- **JSON Config:** `autotheme.json` with JSON Schema support

```json
{
  "$schema": "./node_modules/autotheme/schema.json",
  "color": "#6439FF",
  "harmony": "analogous",
  "output": "./src/autotheme.css"
}
```

## Dependency Strategy

| Category       | Approach       | Notes                          |
| -------------- | -------------- | ------------------------------ |
| **Color Math** | From scratch   | Core differentiator, zero deps |
| **CLI Args**   | `cac` or `mri` | Minimal, help text generation  |
| **Prompts**    | `prompts`      | Simple, promise-based          |
| **Config**     | Native JSON    | No parser needed               |

## Output Formats

1. **CSS Variables:** `:root` with full palette
2. **Utility Classes:** Gradient and noise utilities
3. **Tailwind v4 CSS:** `@theme` directive integration
4. **HTML Preview:** Visual palette preview
5. **Dark Mode Script:** System preference detection
