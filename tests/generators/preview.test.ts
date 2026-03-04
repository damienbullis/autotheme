import { describe, it, expect } from "vitest";
import { generatePreview } from "../../src/generators/preview";
import { createTestTheme } from "../helpers/test-theme";

describe("generatePreview", () => {
  it("generates valid HTML preview with palette swatches and typography", () => {
    const theme = createTestTheme({ palette: {} });
    const result = generatePreview(theme);

    // Correct filename derived from output path
    expect(result.filename).toBe("./src/autotheme.preview.html");

    // Valid HTML5 document
    expect(result.content).toContain("<!DOCTYPE html>");
    expect(result.content).toContain("</html>");

    // Links to generated CSS
    expect(result.content).toContain('href="./src/autotheme.css"');

    // Shows theme info
    expect(result.content).toContain("analogous");
    expect(result.content).toContain("#6439FF");

    // Has palette swatches with full scale
    expect(result.content).toContain("Primary");
    expect(result.content).toContain("var(--color-primary-500)");
    expect(result.content).toContain(">500</span>");
    expect(result.content).toContain(">50</div>");
    expect(result.content).toContain(">950</div>");

    // Has dark mode toggle
    expect(result.content).toContain("Toggle Dark Mode");

    // Has typography, gradients, and noise sections (always present in template)
    expect(result.content).toContain("Typography Scale");
    expect(result.content).toContain("Gradients");
    expect(result.content).toContain("Noise");
  });

  it("uses custom prefix in CSS variable references", () => {
    const theme = createTestTheme({ palette: { prefix: "at" } });
    const result = generatePreview(theme);

    expect(result.content).toContain("var(--at-primary-500)");
    expect(result.content).not.toContain("var(--color-primary-500)");
  });
});
