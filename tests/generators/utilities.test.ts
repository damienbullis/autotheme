import { describe, it, expect } from "vitest";
import { generateUtilityClasses } from "../../src/generators/utilities";

describe("generateUtilityClasses", () => {
  it("generates CSS utility classes", () => {
    const result = generateUtilityClasses();

    expect(result).toContain("/* Utility Classes */");
  });

  it("includes linear gradient class", () => {
    const result = generateUtilityClasses();

    expect(result).toContain(".gradient-linear {");
    expect(result).toContain("--gradient-stops:");
    expect(result).toContain("linear-gradient(var(--gradient-direction");
  });

  it("includes radial gradient class", () => {
    const result = generateUtilityClasses();

    expect(result).toContain(".gradient-radial {");
    expect(result).toContain("radial-gradient(var(--gradient-scale");
  });

  it("includes noise class", () => {
    const result = generateUtilityClasses();

    expect(result).toContain(".bg-noise {");
    expect(result).toContain("background-image: var(--background-image-noise);");
  });

  it("includes noise overlay class", () => {
    const result = generateUtilityClasses();

    expect(result).toContain(".bg-noise-overlay {");
    expect(result).toContain("position: relative;");
  });

  it("includes noise overlay pseudo-element", () => {
    const result = generateUtilityClasses();

    expect(result).toContain(".bg-noise-overlay::after {");
    expect(result).toContain("content: '';");
    expect(result).toContain("inset: 0;");
    expect(result).toContain("opacity: 0.1;");
    expect(result).toContain("pointer-events: none;");
  });

  it("uses CSS variables for customization", () => {
    const result = generateUtilityClasses();

    // Linear gradient customization
    expect(result).toContain("var(--gradient-from,");
    expect(result).toContain("var(--gradient-to,");
    expect(result).toContain("var(--gradient-direction,");
    expect(result).toContain("var(--gradient-from-position,");
    expect(result).toContain("var(--gradient-to-position,");

    // Radial gradient customization
    expect(result).toContain("var(--gradient-scale,");
    expect(result).toContain("var(--gradient-position,");
  });

  it("returns trimmed output", () => {
    const result = generateUtilityClasses();

    expect(result.startsWith("\n")).toBe(false);
    expect(result.endsWith("\n")).toBe(false);
  });
});
