# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 2026-02-28

Complete rewrite from Go to TypeScript/Bun.

### Added

- OKLCH color format for perceptual uniformity
- Tailwind v4 CSS variable namespaces (`--color-{name}-{scale}`)
- Shadcn UI compatible semantic variables
- Chart color variables (`--chart-1` through `--chart-5`)
- Destructive color semantic variable
- `radius` config option for Shadcn border radius
- `contrastTarget` config option (default: 7 for WCAG AAA)
- Module API — import and use as a Node/Bun library
- `piroku` harmony (replaces `tetradic`)
- HTML preview generator (`--preview` flag)
- Dark mode script generator (`--dark-mode-script` flag)
- `init` command for interactive config setup
- JSON Schema for config file validation
- Standalone binary builds for linux-x64, linux-arm64, darwin-x64, darwin-arm64, windows-x64

### Changed

- Rewritten from Go to TypeScript/Bun
- Config format changed from YAML to JSON (`autotheme.json`, `.autothemerc.json`, `.autothemerc`)
- CSS variable naming now follows Tailwind v4 conventions
- Dark mode class changed from `.at-dark` to `.dark`
- Color scale uses 50-950 naming (was L1-L5/D1-D5)
- Tones use `tone-1` through `tone-4` naming (was G1-G4)

### Removed

- `lunar-eclipse` harmony
- `tetradic` harmony (replaced by `piroku`)
- YAML config support
