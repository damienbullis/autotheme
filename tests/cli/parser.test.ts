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
      "--format",
      "hsl",
      "--palette",
      "--preview",
      "--tailwind",
      "--gradients",
      "--spacing",
      "--typography",
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
    expect(args.format).toBe("hsl");

    // Boolean flags
    expect(args.palette).toBe(true);
    expect(args.preview).toBe(true);
    expect(args.tailwind).toBe(true);
    expect(args.gradients).toBe(true);
    expect(args.spacing).toBe(true);
    expect(args.typography).toBe(true);
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
      "--no-semantics",
    ]);

    expect(args.gradients).toBe(false);
    expect(args.spacing).toBe(false);
    expect(args.noise).toBe(false);
    expect(args.shadcn).toBe(false);
    expect(args.utilities).toBe(false);
    expect(args.semantics).toBe(false);
  });

  it("parses --angles flag", () => {
    const args = parseArgs(["--angles", "0,72,144,216,288"]);
    expect(args.angles).toBe("0,72,144,216,288");
  });

  it("unprovided options are undefined", () => {
    const args = parseArgs([]);

    expect(args.color).toBeUndefined();
    expect(args.harmony).toBeUndefined();
    expect(args.output).toBeUndefined();
    expect(args.preview).toBeUndefined();
    expect(args.tailwind).toBeUndefined();
    expect(args.gradients).toBeUndefined();
    expect(args.format).toBeUndefined();
    expect(args.palette).toBeUndefined();
  });
});
