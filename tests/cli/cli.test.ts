import { describe, it, expect, vi, afterEach } from "vitest";
import { run } from "../../src/cli/cli";

describe("CLI integration", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("--stdout outputs CSS containing :root and --color-primary-500", async () => {
    let output = "";
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      output += chunk;
      return true;
    });

    await run(["--color", "#6439FF", "--stdout"]);

    expect(output).toContain(":root");
    expect(output).toContain("--color-primary-500");
  });

  it("--stdout outputs CSS with different harmony types", async () => {
    let output = "";
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      output += chunk;
      return true;
    });

    await run(["--color", "#FF0000", "--harmony", "triadic", "--stdout"]);

    expect(output).toContain("--color-primary-500");
    expect(output).toContain("--color-secondary-500");
    expect(output).toContain("--color-tertiary-500");
  });

  it("schema subcommand outputs valid JSON", async () => {
    let output = "";
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      output += chunk;
      return true;
    });

    await run(["schema"]);

    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty("type", "object");
    expect(parsed).toHaveProperty("properties");
    expect(parsed.properties).toHaveProperty("color");
    expect(parsed.properties).toHaveProperty("harmony");
  });

  it("zero-config (random color) generates successfully with --stdout", async () => {
    let output = "";
    vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
      output += chunk;
      return true;
    });
    // Suppress log output
    vi.spyOn(console, "log").mockImplementation(() => {});

    await run(["--stdout"]);

    expect(output).toContain(":root");
    expect(output).toContain("--color-primary-500");
  });
});
