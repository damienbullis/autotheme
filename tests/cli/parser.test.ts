import { describe, it, expect } from "vitest";
import { parseArgs } from "../../src/cli/parser";

describe("parseArgs", () => {
  it("parses all option types together", () => {
    const args = parseArgs([
      "-c",
      "#123456",
      "-a",
      "triadic",
      "-o",
      "./out.css",
      "-p",
      "ocean",
      "--config",
      "./custom.json",
      "--prefix",
      "at",
      "--font-size",
      "0.875",
      "--swing",
      "1.5",
      "--swing-strategy",
      "exponential",
      "--preview",
      "--tailwind",
      "--dark-mode-script",
      "--gradients",
      "--spacing",
      "--noise",
      "--shadcn",
      "--utilities",
      "--stdout",
      "-s",
    ]);

    // String options
    expect(args.color).toBe("#123456");
    expect(args.harmony).toBe("triadic");
    expect(args.output).toBe("./out.css");
    expect(args.preset).toBe("ocean");
    expect(args.config).toBe("./custom.json");
    expect(args.prefix).toBe("at");

    // Number options
    expect(args.fontSize).toBe(0.875);
    expect(args.swing).toBe(1.5);
    expect(args.swingStrategy).toBe("exponential");

    // Boolean flags
    expect(args.preview).toBe(true);
    expect(args.tailwind).toBe(true);
    expect(args.darkModeScript).toBe(true);
    expect(args.gradients).toBe(true);
    expect(args.spacing).toBe(true);
    expect(args.noise).toBe(true);
    expect(args.shadcn).toBe(true);
    expect(args.utilities).toBe(true);
    expect(args.stdout).toBe(true);
    expect(args.silent).toBe(true);
  });

  it("negation flags disable features", () => {
    const args = parseArgs([
      "--no-gradients",
      "--no-spacing",
      "--no-noise",
      "--no-shadcn",
      "--no-utilities",
    ]);

    expect(args.gradients).toBe(false);
    expect(args.spacing).toBe(false);
    expect(args.noise).toBe(false);
    expect(args.shadcn).toBe(false);
    expect(args.utilities).toBe(false);
  });

  it("unprovided options are undefined", () => {
    const args = parseArgs([]);

    expect(args.color).toBeUndefined();
    expect(args.harmony).toBeUndefined();
    expect(args.output).toBeUndefined();
    expect(args.preview).toBeUndefined();
    expect(args.tailwind).toBeUndefined();
    expect(args.gradients).toBeUndefined();
    expect(args.swing).toBeUndefined();
    expect(args.fontSize).toBeUndefined();
  });
});
