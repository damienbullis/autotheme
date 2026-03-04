import { describe, it, expect } from "vitest";
import { generateCSS } from "../../src/generators/css";
import { createTestTheme } from "../helpers/test-theme";

describe("effects integration", () => {
  it("generates no effects output when effects is false (default)", () => {
    const theme = createTestTheme();
    const output = generateCSS(theme);

    expect(output.content).not.toContain("autotheme.effects");
    expect(output.content).not.toContain("--filter-grain");
    expect(output.content).not.toContain("--blend-");
    expect(output.content).not.toContain(".glass-");
    expect(output.content).not.toContain("--blob-");
    expect(output.content).not.toContain("--stack-layer-");
  });

  it("adds effects layer to @layer declaration when effects enabled", () => {
    const theme = createTestTheme({ effects: true });
    const output = generateCSS(theme);

    expect(output.content).toContain("autotheme.effects");
    expect(output.content).toMatch(
      /@layer.*autotheme\.scales.*autotheme\.effects.*autotheme\.utilities/,
    );
  });

  it("generates filter variables when effects: true", () => {
    const theme = createTestTheme({ effects: true });
    const output = generateCSS(theme);

    expect(output.content).toContain("--filter-grain:");
    expect(output.content).toContain("--filter-grain-opacity:");
    expect(output.content).toContain("--filter-glow-primary:");
    expect(output.content).toContain("--filter-duotone:");
  });

  it("generates blend mode variables and utilities", () => {
    const theme = createTestTheme({ effects: true });
    const output = generateCSS(theme);

    expect(output.content).toContain("--blend-multiply: multiply;");
    expect(output.content).toContain("--blend-screen: screen;");
    expect(output.content).toContain(".blend-multiply");
    expect(output.content).toContain(".bg-blend-overlay");
  });

  it("generates glass utilities with backdrop-filter", () => {
    const theme = createTestTheme({ effects: true });
    const output = generateCSS(theme);

    expect(output.content).toContain(".glass-primary");
    expect(output.content).toContain("backdrop-filter:");
    expect(output.content).toContain("-webkit-backdrop-filter:");
    expect(output.content).toContain(".dark .glass-primary");
  });

  it("generates blob variables", () => {
    const theme = createTestTheme({ effects: true });
    const output = generateCSS(theme);

    expect(output.content).toContain("--blob-1:");
    expect(output.content).toContain("--blob-2:");
    expect(output.content).toContain("--blob-3:");
    expect(output.content).toContain("--blob-clip-1:");
    expect(output.content).toContain("data:image/svg+xml,");
  });

  it("generates stack layer variables and utility classes", () => {
    const theme = createTestTheme({ effects: true });
    const output = generateCSS(theme);

    expect(output.content).toContain("--stack-layer-1:");
    expect(output.content).toContain("--stack-layer-5:");
    expect(output.content).toContain(".stack {");
    expect(output.content).toContain(".stack-noise");
    expect(output.content).toContain(".stack-grain");
    expect(output.content).toContain(".stack-blob-1");
  });

  it("filter grain SVGs contain valid feTurbulence", () => {
    const theme = createTestTheme({ effects: true });
    const output = generateCSS(theme);

    // Extract grain data URL and decode
    const grainMatch = output.content.match(
      /--filter-grain:\s*url\("data:image\/svg\+xml,([^"]+)"\)/,
    );
    expect(grainMatch).toBeTruthy();
    const decoded = decodeURIComponent(grainMatch![1]!);
    expect(decoded).toContain("feTurbulence");
    expect(decoded).toContain("feColorMatrix");
    expect(decoded).toContain("type='saturate'");
  });

  it("respects custom effects config", () => {
    const theme = createTestTheme({
      effects: {
        filters: {
          grain: { frequency: 0.9, octaves: 5, opacity: 0.12 },
          glow: false,
          duotone: false,
        },
        blendModes: { modes: ["multiply"] },
        glass: false,
        blobs: { count: 1, points: 8, randomness: 0.3, seed: 42, size: 300 },
        stack: { layers: 3 },
      },
    });
    const output = generateCSS(theme);

    // Grain present with custom opacity
    expect(output.content).toContain("--filter-grain-opacity: 0.12;");
    // No glow or duotone
    expect(output.content).not.toContain("--filter-glow");
    expect(output.content).not.toContain("--filter-duotone");
    // Only multiply blend mode
    expect(output.content).toContain("--blend-multiply");
    expect(output.content).not.toContain("--blend-screen");
    // No glass
    expect(output.content).not.toContain(".glass-");
    // Only 1 blob
    expect(output.content).toContain("--blob-1:");
    expect(output.content).not.toContain("--blob-2:");
    // Only 3 stack layer variables declared in :root
    expect(output.content).toContain("--stack-layer-3: ;");
    expect(output.content).not.toContain("--stack-layer-4: ;");
  });
});
