type FrameworkTab = "nextjs" | "vanilla" | "astro" | "nuxt" | "sveltekit";

interface FrameworkSnippet {
  label: string;
  config: string;
  cssImport: string;
  darkMode: string;
}

const FRAMEWORK_SNIPPETS: Record<FrameworkTab, FrameworkSnippet> = {
  nextjs: {
    label: "Next.js",
    config: `// autotheme.json
{
  "color": "#6439FF",
  "harmony": "analogous",
  "mode": "both",
  "shadcn": true,
  "output": { "path": "./src/app/autotheme.css", "tailwind": true }
}`,
    cssImport: `/* src/app/globals.css */
@import "./autotheme.css";`,
    darkMode: `// src/app/layout.tsx — with next-themes
<ThemeProvider attribute="class" defaultTheme="system">
  {children}
</ThemeProvider>

/* globals.css */
:root { color-scheme: light; }
.dark { color-scheme: dark; }`,
  },
  vanilla: {
    label: "Vanilla",
    config: `// autotheme.json
{
  "color": "#6439FF",
  "harmony": "analogous",
  "mode": "both",
  "output": { "path": "./autotheme.css" }
}`,
    cssImport: `<link rel="stylesheet" href="./autotheme.css" />`,
    darkMode: `/* CSS-only — follows system preference */
:root { color-scheme: light dark; }`,
  },
  astro: {
    label: "Astro",
    config: `// autotheme.json
{
  "color": "#6439FF",
  "harmony": "analogous",
  "mode": "both",
  "output": { "path": "./src/styles/autotheme.css", "tailwind": true }
}`,
    cssImport: `<!-- src/layouts/Base.astro -->
<style is:global>
  @import "../styles/autotheme.css";
</style>`,
    darkMode: `/* CSS-only — follows system preference */
:root { color-scheme: light dark; }`,
  },
  nuxt: {
    label: "Nuxt",
    config: `// autotheme.json
{
  "color": "#6439FF",
  "harmony": "analogous",
  "mode": "both",
  "output": { "path": "./assets/css/autotheme.css", "tailwind": true }
}`,
    cssImport: `// nuxt.config.ts
export default defineNuxtConfig({
  css: ["~/assets/css/autotheme.css"],
});`,
    darkMode: `// nuxt.config.ts — with @nuxtjs/color-mode
modules: ["@nuxtjs/color-mode"],
colorMode: { classSuffix: "" }

/* CSS */
:root { color-scheme: light; }
.dark { color-scheme: dark; }`,
  },
  sveltekit: {
    label: "SvelteKit",
    config: `// autotheme.json
{
  "color": "#6439FF",
  "harmony": "analogous",
  "mode": "both",
  "output": { "path": "./src/autotheme.css", "tailwind": true }
}`,
    cssImport: `/* src/app.css */
@import "./autotheme.css";`,
    darkMode: `// Store-based toggle
import { writable } from "svelte/store";
export const theme = writable("light");
theme.subscribe(v =>
  document.documentElement.style.colorScheme = v
);`,
  },
};

const TABS: FrameworkTab[] = ["nextjs", "vanilla", "astro", "nuxt", "sveltekit"];

interface FrameworkPanelOptions {
  shadcnMapping: Record<string, string> | null;
  shadcnEnabled: boolean;
}

export class FrameworkPanel {
  private container: HTMLElement;
  private activeTab: FrameworkTab = "nextjs";
  private options: FrameworkPanelOptions = { shadcnMapping: null, shadcnEnabled: false };

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  update(options: FrameworkPanelOptions): void {
    this.options = options;
    this.render();
  }

  private render(): void {
    const snippet = FRAMEWORK_SNIPPETS[this.activeTab];

    const tabsHtml = TABS.map(
      (tab) =>
        `<button class="fw-tab${tab === this.activeTab ? " fw-tab--active" : ""}" data-tab="${tab}">${FRAMEWORK_SNIPPETS[tab].label}</button>`,
    ).join("");

    const shadcnHtml =
      this.options.shadcnEnabled && this.options.shadcnMapping
        ? `<div class="fw-section">
            <h4>Shadcn UI Mapping</h4>
            <div class="fw-entries">
              ${Object.entries(this.options.shadcnMapping)
                .map(
                  ([key, value]) =>
                    `<div class="fw-entry"><span class="fw-entry__key">--${key}</span><span class="fw-entry__value">${this.escapeHtml(value)}</span></div>`,
                )
                .join("")}
            </div>
          </div>`
        : "";

    this.container.innerHTML = `
      <div class="framework-panel">
        <h3>Framework Setup</h3>
        <div class="fw-tabs">${tabsHtml}</div>
        <div class="fw-content">
          <div class="fw-section">
            <h4>Config</h4>
            <pre class="fw-code"><code>${this.escapeHtml(snippet.config)}</code></pre>
          </div>
          <div class="fw-section">
            <h4>CSS Import</h4>
            <pre class="fw-code"><code>${this.escapeHtml(snippet.cssImport)}</code></pre>
          </div>
          <div class="fw-section">
            <h4>Dark Mode</h4>
            <pre class="fw-code"><code>${this.escapeHtml(snippet.darkMode)}</code></pre>
          </div>
          ${shadcnHtml}
        </div>
      </div>
    `;

    // Bind tab clicks
    this.container.querySelectorAll(".fw-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.activeTab = (btn as HTMLElement).dataset.tab as FrameworkTab;
        this.render();
      });
    });
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
}
