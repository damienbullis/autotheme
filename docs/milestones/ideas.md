# Ideas

Smaller features and CLI improvements not yet assigned to a milestone.

---

## CLI Theme Generation Wiring

The CLI currently stubs out the actual generation step. Wiring `generateTheme()` and `writeOutputs()` is the critical path to making the tool functional.

- Import `Color`, `generateFullPalette`, `generateCSS` into the CLI run loop
- Call `writeOutputs(theme, config)` to write all enabled outputs
- Handle random color generation when no `--color` is provided
- Print summary of generated files on completion

**Status:** All generators exist and are tested. This is pure plumbing.

---

## CSS to stdout

Output generated CSS to stdout instead of writing files, for piping into other tools:

```bash
autotheme "#6439FF" --stdout | pbcopy
autotheme "#6439FF" --stdout > my-theme.css
```

---

## Theme Presets

Named color + harmony combinations for common use cases.

```bash
autotheme --preset ocean       # #0077B6, analogous
autotheme --preset sunset      # #FF6B35, split-complementary
autotheme --preset forest      # #2D6A4F, triadic
autotheme --preset midnight    # #1B1464, complementary
autotheme --preset coral       # #FF6B6B, aurelian
autotheme --preset lavender    # #7C6FE3, analogous
```

A `Record<string, { color: string; harmony: HarmonyType }>` map shipped with the CLI. Presets set `color` and `harmony` — all other config options still apply on top.

```bash
# Preset + overrides
autotheme --preset ocean --palette --elevation
```

---

## Color Format Escape Hatch

OKLCH is the default and the opinion, but a format flag removes a real adoption barrier for teams not ready for OKLCH:

```bash
autotheme "#7aa2f7" --format hsl
autotheme "#7aa2f7" --format rgb
```

The code already supports all four formats. This is pure output plumbing.

---

## P3 Wide Gamut

With OKLCH as the default format, P3 is less of a distinct feature — OKLCH values already represent wide gamut. The remaining question is whether to generate `@media (color-gamut: p3)` blocks with extended-chroma variants.

Lower priority than in the original roadmap. Could be an opt-in `gamut: "p3"` flag that allows higher chroma values in the generation pipeline.

---

## Watch Mode

Re-generate CSS when `autotheme.json` changes:

```bash
autotheme --watch
```

Useful during development. Pairs well with framework dev servers.

---

## Dry Run / Diff

Show what would be generated without writing files:

```bash
autotheme "#7aa2f7" --dry-run           # preview token list
autotheme "#7aa2f7" --diff              # show diff against existing output
```
