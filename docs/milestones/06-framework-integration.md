# Milestone 06 — Framework Integration

Status: **Not started.** Best written after M01 ships, so guides cover the v2 output format.

## Overview

Step-by-step documentation for integrating AutoTheme v2 into popular frontend frameworks, plus a CLI `init` command for scaffolding. This is a documentation and developer experience milestone — no new library code, but critical for adoption.

## What's Included

Guides for:
- **Next.js** — `app/globals.css` import, `next-themes` dark mode, Shadcn integration
- **Vue / Nuxt** — Scoped vs global theming, `@nuxtjs/color-mode` module
- **Svelte / SvelteKit** — `app.css` import, media query dark mode
- **Astro** — `@astrojs/tailwind` integration, island architecture
- **Vanilla / CDN** — Direct `<link>` import, dark mode script

Plus:
- **CLI `init` command** — Detect framework, scaffold config

## Current State

- Shadcn UI generator (`src/generators/shadcn.ts`) provides a de facto framework integration for React/Shadcn projects
- Dark mode script generator (`src/generators/darkmode-script.ts`) produces a standalone JS snippet
- Tailwind v4 CSS output uses `@import` directive with framework-specific handling
- No documentation guides exist
- No `init` or `setup` CLI commands exist

## Impact

- **Low complexity, high adoption value.** Documentation is the #1 barrier to adoption. A developer who can't wire AutoTheme into their Next.js app in 5 minutes will abandon it.
- Each guide is independent — can be written and shipped incrementally.
- The `init` command dramatically improves onboarding.

## Design Decisions

### Guide format

Markdown source files in `docs/guides/` that the web app can render. Single source of truth, two distribution channels.

### Guide depth: Quick start + deep dive

A 30-second quick start (copy these 3 lines) followed by detailed explanation. Gets people running immediately; deep dive catches edge cases.

### v2 output considerations

Guides need to account for v2's changes:

- **Default output is ~25 semantic tokens** — guides should show these being used directly, not the full 50-950 scale
- **OKLCH format** — all values are `oklch(...)`, which has broad browser support but guides should note the compatibility story
- **`palette: true` for Tailwind** — framework guides that mention Tailwind should show this opt-in
- **`light-dark()` CSS function** — the default for `mode: "both"`, which requires modern browser support. Guides should address fallbacks if needed.
- **Shadcn integration** — `shadcn: true` generates Shadcn-compatible semantic variables alongside AutoTheme's own tokens

### Dark mode: Framework-native, AutoTheme provides CSS

Let the framework own the toggle mechanism. AutoTheme provides the CSS that responds to it:

- **Next.js** → `next-themes` provider with `class` strategy → AutoTheme's `[data-theme="dark"]` selector
- **Nuxt** → `@nuxtjs/color-mode` module
- **SvelteKit** → `prefers-color-scheme` media query or manual toggle
- **Astro** → Varies by rendering mode
- **Vanilla** → AutoTheme's own dark mode script as fallback

### Tailwind v4: `@import` handling

AutoTheme generates CSS with `@import "tailwindcss"`. Different frameworks process this differently:

- **Vite-based** (Nuxt, SvelteKit, Astro) — usually works via PostCSS/Vite plugin
- **Next.js** — may need `postcss-import` depending on version
- **Vanilla** — no build step, `@import` must resolve at browser level

Each guide addresses the framework's `@import` story.

### CLI `init` command

**Phase 1 (this milestone):** Simple `autotheme init` — generates `autotheme.json` with sensible defaults. Prompts for color and harmony.

**Phase 2 (future):** Smart detection — reads `next.config.*`, `nuxt.config.*`, `svelte.config.*` to auto-set output path, Tailwind integration, dark mode strategy.

## Open Questions

1. Should guides include framework-specific Tailwind v4 setup, or assume Tailwind is already configured?
2. Should we provide example repos / starter templates for each framework?
3. How do we keep guides current as frameworks evolve? Version-pin the guide instructions?
4. Should the web preview include a "copy integration snippet" feature?
5. Is there value in a PostCSS plugin or Vite plugin for AutoTheme beyond the CLI?

## Internal Ordering

Guides can be written independently. Priority by audience size and AutoTheme's alignment:

1. **Next.js** — Largest audience, Shadcn integration already exists
2. **Vanilla / CDN** — Simplest integration, good for "just try it"
3. **Astro** — Growing fast, good Tailwind story
4. **Nuxt** — Strong Tailwind ecosystem
5. **SvelteKit** — Smaller audience but clean integration story

## Dependencies

- **Best after M01** — guides should cover v2 output format (semantic tokens, conditional palette, OKLCH)
- Shadcn generator docs should accompany the Next.js guide
- Dark mode script behavior should be well-understood before documenting alternatives
- Can be started before M01 is complete (structure, general content) and finalized after
