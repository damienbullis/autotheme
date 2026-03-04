import { describe, it, expect } from "vitest";
import { createTestTheme } from "../helpers/test-theme";
import { generateCSS } from "../../src/generators/css";
import { generateTailwindCSS } from "../../src/generators/tailwind";
import { generatePreview } from "../../src/generators/preview";
import { generateDarkModeScript } from "../../src/generators/script";

describe("generators integration", () => {
  it("all generators produce non-empty output with filename and content", () => {
    const theme = createTestTheme({ output: { path: "./test-output/autotheme.css" } });

    const outputs = [
      generateCSS(theme),
      generateTailwindCSS(theme),
      generatePreview(theme),
      generateDarkModeScript(),
    ];

    for (const output of outputs) {
      expect(output.filename).toBeTruthy();
      expect(output.content.length).toBeGreaterThan(0);
    }
  });

  it("derives filenames from output path", () => {
    const theme = createTestTheme({ output: { path: "./test-output/autotheme.css" } });

    expect(generateCSS(theme).filename).toBe("./test-output/autotheme.css");
    expect(generateTailwindCSS(theme).filename).toBe("./test-output/autotheme.tailwind.css");
    expect(generatePreview(theme).filename).toBe("./test-output/autotheme.preview.html");
  });

  it("Tailwind output includes same palette variables as base CSS when palette enabled", () => {
    const theme = createTestTheme({ palette: {} });
    const tw = generateTailwindCSS(theme);

    expect(tw.content).toContain("--color-primary-500:");
    expect(tw.content).toContain("--color-primary-50:");
    expect(tw.content).toContain("--color-secondary-500:");
  });

  it("Tailwind output includes base-only color registrations when palette disabled", () => {
    const theme = createTestTheme();
    const tw = generateTailwindCSS(theme);

    expect(tw.content).toContain("--color-primary: var(--color-primary)");
    expect(tw.content).not.toContain("--color-primary-500:");
  });
});
