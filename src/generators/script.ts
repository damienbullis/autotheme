import type { GeneratorOutput } from "./types";

/**
 * Generate dark mode initialization script
 * Include this in HTML head to prevent FOUC (Flash of Unstyled Content)
 */
export function generateDarkModeScript(): GeneratorOutput {
  const script = `/**
 * AutoTheme Dark Mode Initialization
 * Include this script in your HTML head to prevent FOUC
 */
(function() {
  const darkMode = window.matchMedia("(prefers-color-scheme: dark)");

  function check() {
    if (localStorage.getItem("darkMode") === "true" ||
        (localStorage.getItem("darkMode") === null && darkMode.matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  // Initial check
  check();

  // Listen for system preference changes
  darkMode.addEventListener("change", check);

  // Expose toggle function globally
  window.toggleDarkMode = function() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", isDark.toString());
    return isDark;
  };
})();
`;

  return {
    filename: "darkmode.js",
    content: script,
  };
}
