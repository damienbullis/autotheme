import { describe, it, expect } from "vitest";
import { generateDarkModeScript } from "../../src/generators/script";

describe("generateDarkModeScript", () => {
  it("generates output with correct filename", () => {
    const result = generateDarkModeScript();

    expect(result.filename).toBe("darkmode.js");
  });

  it("generates JavaScript IIFE", () => {
    const result = generateDarkModeScript();

    expect(result.content).toContain("(function() {");
    expect(result.content).toContain("})();");
  });

  it("includes dark mode media query check", () => {
    const result = generateDarkModeScript();

    expect(result.content).toContain('window.matchMedia("(prefers-color-scheme: dark)")');
  });

  it("includes localStorage check", () => {
    const result = generateDarkModeScript();

    expect(result.content).toContain('localStorage.getItem("darkMode")');
  });

  it("adds and removes dark class", () => {
    const result = generateDarkModeScript();

    expect(result.content).toContain('document.documentElement.classList.add("dark")');
    expect(result.content).toContain('document.documentElement.classList.remove("dark")');
  });

  it("includes initial check call", () => {
    const result = generateDarkModeScript();

    expect(result.content).toContain("// Initial check");
    expect(result.content).toContain("check();");
  });

  it("listens for system preference changes", () => {
    const result = generateDarkModeScript();

    expect(result.content).toContain('darkMode.addEventListener("change", check)');
  });

  it("exposes toggleDarkMode function globally", () => {
    const result = generateDarkModeScript();

    expect(result.content).toContain("window.toggleDarkMode = function()");
  });

  it("toggleDarkMode returns boolean", () => {
    const result = generateDarkModeScript();

    expect(result.content).toContain("return isDark;");
  });

  it("stores preference in localStorage on toggle", () => {
    const result = generateDarkModeScript();

    expect(result.content).toContain('localStorage.setItem("darkMode"');
    expect(result.content).toContain("isDark.toString()");
  });

  it("includes header comment", () => {
    const result = generateDarkModeScript();

    expect(result.content).toContain("AutoTheme Dark Mode Initialization");
    expect(result.content).toContain("prevent FOUC");
  });
});
