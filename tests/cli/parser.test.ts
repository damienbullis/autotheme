import { describe, it, expect } from "vitest";
import { parseArgs } from "../../src/cli/parser";

describe("parseArgs", () => {
  describe("color option", () => {
    it("parses -c flag", () => {
      const args = parseArgs(["-c", "#ff0000"]);
      expect(args.color).toBe("#ff0000");
    });

    it("parses --color flag", () => {
      const args = parseArgs(["--color", "#ff0000"]);
      expect(args.color).toBe("#ff0000");
    });

    it("returns undefined when not provided", () => {
      const args = parseArgs([]);
      expect(args.color).toBeUndefined();
    });
  });

  describe("harmony option", () => {
    it("parses -a flag", () => {
      const args = parseArgs(["-a", "triadic"]);
      expect(args.harmony).toBe("triadic");
    });

    it("parses --harmony flag", () => {
      const args = parseArgs(["--harmony", "complementary"]);
      expect(args.harmony).toBe("complementary");
    });
  });

  describe("output option", () => {
    it("parses -o flag", () => {
      const args = parseArgs(["-o", "./custom.css"]);
      expect(args.output).toBe("./custom.css");
    });

    it("parses --output flag", () => {
      const args = parseArgs(["--output", "./theme.css"]);
      expect(args.output).toBe("./theme.css");
    });
  });

  describe("config option", () => {
    it("parses --config flag", () => {
      const args = parseArgs(["--config", "./custom.json"]);
      expect(args.config).toBe("./custom.json");
    });
  });

  describe("boolean flags", () => {
    it("parses --preview flag", () => {
      const args = parseArgs(["--preview"]);
      expect(args.preview).toBe(true);
    });

    it("parses --tailwind flag", () => {
      const args = parseArgs(["--tailwind"]);
      expect(args.tailwind).toBe(true);
    });

    it("parses --dark-mode-script flag", () => {
      const args = parseArgs(["--dark-mode-script"]);
      expect(args.darkModeScript).toBe(true);
    });

    it("parses -s flag", () => {
      const args = parseArgs(["-s"]);
      expect(args.silent).toBe(true);
    });

    it("parses --silent flag", () => {
      const args = parseArgs(["--silent"]);
      expect(args.silent).toBe(true);
    });

    it("returns undefined for unprovided flags", () => {
      const args = parseArgs([]);
      expect(args.preview).toBeUndefined();
      expect(args.tailwind).toBeUndefined();
      expect(args.darkModeScript).toBeUndefined();
      expect(args.silent).toBeUndefined();
    });
  });

  describe("multiple options", () => {
    it("parses multiple options together", () => {
      const args = parseArgs([
        "-c",
        "#123456",
        "-a",
        "triadic",
        "-o",
        "./out.css",
        "--preview",
        "--tailwind",
        "-s",
      ]);

      expect(args.color).toBe("#123456");
      expect(args.harmony).toBe("triadic");
      expect(args.output).toBe("./out.css");
      expect(args.preview).toBe(true);
      expect(args.tailwind).toBe(true);
      expect(args.silent).toBe(true);
    });
  });

  describe("prefix and fontSize options", () => {
    it("parses --prefix flag", () => {
      const args = parseArgs(["--prefix", "at"]);
      expect(args.prefix).toBe("at");
    });

    it("parses --font-size flag", () => {
      const args = parseArgs(["--font-size", "0.875"]);
      expect(args.fontSize).toBe(0.875);
    });

    it("returns undefined when not provided", () => {
      const args = parseArgs([]);
      expect(args.prefix).toBeUndefined();
      expect(args.fontSize).toBeUndefined();
    });
  });

  describe("negation flags", () => {
    it("parses --no-gradients flag", () => {
      const args = parseArgs(["--no-gradients"]);
      expect(args.gradients).toBe(false);
    });

    it("parses --no-spacing flag", () => {
      const args = parseArgs(["--no-spacing"]);
      expect(args.spacing).toBe(false);
    });

    it("parses --no-noise flag", () => {
      const args = parseArgs(["--no-noise"]);
      expect(args.noise).toBe(false);
    });

    it("parses --no-shadcn flag", () => {
      const args = parseArgs(["--no-shadcn"]);
      expect(args.shadcn).toBe(false);
    });

    it("parses --no-utilities flag", () => {
      const args = parseArgs(["--no-utilities"]);
      expect(args.utilities).toBe(false);
    });

    it("returns undefined for unprovided toggle flags", () => {
      const args = parseArgs([]);
      expect(args.gradients).toBeUndefined();
      expect(args.spacing).toBeUndefined();
      expect(args.noise).toBeUndefined();
      expect(args.shadcn).toBeUndefined();
      expect(args.utilities).toBeUndefined();
    });
  });

  describe("special flags", () => {
    it("parses --help flag", () => {
      const args = parseArgs(["--help"]);
      expect(args.help).toBe(true);
    });

    it("parses --version flag", () => {
      const args = parseArgs(["--version"]);
      expect(args.version).toBe(true);
    });
  });
});
