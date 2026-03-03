# Milestone 4: Framework Integration Guides

## Overview

Step-by-step documentation for integrating AutoTheme into popular frontend frameworks. This is a documentation and developer experience milestone — no new library code, but potentially small CLI additions to smooth the integration paths.

## What's Included

Guides for:
- **Next.js** — `app/globals.css` import, `next-themes` dark mode integration
- **Vue / Nuxt** — Scoped vs global theming, `@nuxtjs/color-mode` module
- **Svelte / SvelteKit** — `app.css` import, media query dark mode
- **Astro** — `@astrojs/tailwind` integration, island architecture considerations
- **Vanilla / CDN** — Direct `<link>` import, dark mode script placement

## Current State

- The Shadcn UI generator (`src/generators/shadcn.ts`) provides a de facto framework integration for React/Shadcn projects, but no documentation guides exist for it or any other framework
- The dark mode script generator (`src/generators/darkmode-script.ts`) produces a standalone JS snippet but there's no guide for where/how to place it in each framework
- Tailwind v4 CSS output uses `@import` directive which has framework-specific handling
- No `init` or `setup` CLI commands exist

## Impact

- **Low complexity, high adoption value.** Documentation is the #1 barrier to adoption for any design tool. A developer who can't figure out how to wire AutoTheme into their Next.js app in 5 minutes will abandon it.
- Guides also surface integration pain points that may lead to small CLI improvements (e.g., an `autotheme init` command that detects the framework and scaffolds config).
- Each guide is independent — they can be written and shipped incrementally.

## Design Decisions

### Guide format: Where do they live?

**Options:**
1. **Markdown in `docs/guides/`** — Simple, version-controlled, readable on GitHub. But not discoverable from the CLI or web.
2. **Web app pages** — Part of the `src/web/` documentation site. Most discoverable. But requires the web app to be deployed.
3. **Both** — Markdown source files that the web app renders. Single source of truth, two distribution channels.
4. **README sections** — Append to README. Simple but bloats the main README.

Option 3 (markdown source + web rendering) is the best long-term approach. For now, starting with markdown files that can be promoted to the web app later.

### Guide depth: Tutorial vs reference

**Options:**
1. **Full tutorial** — Start from `npx create-next-app`, install AutoTheme, configure, show result. Complete but long and version-sensitive.
2. **Integration reference** — Assumes the framework project exists. Shows only the AutoTheme-specific steps. Shorter, less maintenance burden.
3. **Quick start + deep dive** — A 30-second quick start (copy these 3 lines) followed by detailed explanation of each option. Best of both worlds but more writing.

Option 3 scales best. The quick start gets people running immediately; the deep dive catches edge cases.

### Dark mode: Framework-specific vs universal

Each framework has its own dark mode story:
- **Next.js** → `next-themes` provider, `class` strategy
- **Nuxt** → `@nuxtjs/color-mode` module
- **SvelteKit** → Usually `prefers-color-scheme` media query or manual toggle
- **Astro** → Varies by rendering mode (SSG vs SSR)
- **Vanilla** → AutoTheme's own dark mode script

AutoTheme's dark mode script (`src/generators/darkmode-script.ts`) works universally but may conflict with framework-specific solutions.

**Options:**
1. **Recommend AutoTheme's script for all** — Simplest for us. But fights the framework's idioms.
2. **Framework-native dark mode, AutoTheme provides CSS only** — Each guide shows how to use the framework's dark mode system with AutoTheme's `[data-theme="dark"]` selector.
3. **Detect and adapt** — If the framework uses `class="dark"`, generate CSS that matches. If it uses `data-theme`, use that. Configuration or auto-detection.

Option 2 is the right default — let the framework own the toggle mechanism, AutoTheme provides the CSS that responds to it. But document how AutoTheme's script works as a fallback.

### Tailwind v4: `@import` handling

AutoTheme generates CSS with `@import "tailwindcss"`. Different frameworks process `@import` differently:

- **Vite-based** (Nuxt, SvelteKit, Astro) — PostCSS or Vite plugin handles it. Usually works.
- **Next.js** — Uses PostCSS. May need `postcss-import` depending on version.
- **Vanilla** — No build step. `@import` must resolve at the browser level or be pre-processed.

The guide for each framework needs to address this. Should AutoTheme offer a `--no-import` flag that inlines rather than uses `@import`?

### CLI `init` command: Scope for this milestone?

An `autotheme init` command that detects the framework and generates a starter config would dramatically improve onboarding.

**Options:**
1. **Defer to a future milestone** — Keep this milestone documentation-only. Don't mix docs and features.
2. **Simple `init`** — Generates `autotheme.json` with sensible defaults. No framework detection. Low effort.
3. **Smart `init`** — Detects `next.config.*`, `nuxt.config.*`, `svelte.config.*`, etc. Sets output path, Tailwind integration, dark mode strategy automatically. Higher effort but very slick.

The init command is a natural companion to the guides, but scoping it correctly matters. A simple `init` (option 2) could ship with this milestone; smart detection (option 3) could come later.

## Open Questions

1. Should guides include framework-specific Tailwind v4 setup, or assume Tailwind is already configured?
2. Should we provide example repos / starter templates for each framework?
3. How do we keep guides current as frameworks evolve? Version-pin the guide instructions?
4. Should the web preview include a "copy integration snippet" feature that generates framework-specific code?
5. Is there value in a PostCSS plugin or Vite plugin for AutoTheme, beyond the CLI?

## Dependencies

- Guides should cover all features that exist at time of writing — may want to publish after Milestones 1-3 so guides can reference the full feature set.
- Alternatively, publish guides early for the current feature set and update them as new milestones ship.
- The Shadcn generator is already framework-relevant and should be documented as part of the Next.js guide.
- Dark mode script generator behavior needs to be well-understood before documenting alternatives.

## Internal Ordering

Guides can be written independently. Suggested priority by framework popularity and AutoTheme's current feature alignment:

1. **Next.js** — Largest audience, Shadcn integration already exists
2. **Vanilla / CDN** — Simplest integration, good for the "just try it" crowd
3. **Astro** — Growing fast, good Tailwind story, documentation-site friendly
4. **Nuxt** — Strong Tailwind ecosystem
5. **SvelteKit** — Smaller audience but clean integration story
