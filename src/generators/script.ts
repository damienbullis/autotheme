import type { GeneratorOutput } from "./types";

/**
 * Generate dark mode initialization script
 * Include this in HTML head to prevent FOUC (Flash of Unstyled Content)
 * @param lightDark - If true, use color-scheme toggle instead of .dark class
 */
export function generateDarkModeScript(lightDark: boolean = false): GeneratorOutput {
  const script = lightDark
    ? `/**
 * AutoTheme Dark Mode Initialization (light-dark() mode)
 * Toggles color-scheme on :root instead of .dark class
 */
(function() {
  const darkMode = window.matchMedia("(prefers-color-scheme: dark)");

  function check() {
    if (localStorage.getItem("darkMode") === "true" ||
        (localStorage.getItem("darkMode") === null && darkMode.matches)) {
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.style.colorScheme = "light";
    }
  }

  check();
  darkMode.addEventListener("change", check);

  window.toggleDarkMode = function() {
    const isDark = document.documentElement.style.colorScheme !== "dark";
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    localStorage.setItem("darkMode", isDark.toString());
    return isDark;
  };
})();
`
    : `/**
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
